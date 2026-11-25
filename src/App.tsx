import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { AllTasksView } from './components/AllTasksView';
import { DayColumnCard } from './components/DayColumnCard';
import {
  FeedbackMessage,
  FeedbackToasts,
  UndoDeleteState,
} from './components/FeedbackToasts';
import { HeaderBar, SyncStatus } from './components/HeaderBar';
import { ReminderToast } from './components/ReminderToast';
import { TaskModal } from './components/TaskModal';
import { TodayView } from './components/TodayView';
import { playGentleChime, unlockReminderAudio } from './lib/chime';
import {
  addDays,
  addMinutesToSchedule,
  formatLocalDate,
  formatTime12h,
  getMondayOfWeek,
  getSampleWeekTodos,
  getTimeMinutes,
  getWeekDays,
  normalizeTimeHHMM,
} from './lib/dateUtils';
import { supabase } from './lib/supabase';
import { DASHBOARD_THEMES, PRIORITY_CONFIG } from './lib/themes';
import { Category, Priority, ThemeId, Todo, TodoPayload, ViewMode } from './types/todo';

function normalizeTodoRow(raw: Record<string, unknown>): Todo {
  const rawPriority = String(raw.priority || 'Medium');
  const priority: Priority =
    rawPriority === 'Low' || rawPriority === 'Medium' || rawPriority === 'High'
      ? rawPriority
      : 'Medium';

  const rawCategory = String(raw.category || 'Work');
  const category: Category =
    rawCategory === 'Work' ||
    rawCategory === 'Study' ||
    rawCategory === 'Personal' ||
    rawCategory === 'Projects'
      ? rawCategory
      : 'Work';

  return {
    id: String(raw.id),
    title: String(raw.title || ''),
    description: raw.description ? String(raw.description) : null,
    priority,
    category,
    due_date: raw.due_date ? String(raw.due_date) : null,
    due_time: raw.due_time ? String(raw.due_time) : null,
    completed: Boolean(raw.completed),
    reminded: Boolean(raw.reminded),
    created_at: String(raw.created_at || new Date().toISOString()),
  };
}

function sanitizePayload(payload: TodoPayload): TodoPayload {
  return {
    ...payload,
    title: payload.title.trim(),
    description: payload.description && payload.description.trim() ? payload.description.trim() : null,
    due_date: payload.due_date && payload.due_date.trim() ? payload.due_date.trim() : null,
    due_time: payload.due_time && payload.due_time.trim() ? payload.due_time.trim() : null,
  };
}

function sortColumnTodos(items: Todo[]): Todo[] {
  return [...items].sort((a, b) => {
    const ta = normalizeTimeHHMM(a.due_time) || '99:99';
    const tb = normalizeTimeHHMM(b.due_time) || '99:99';
    if (ta !== tb) return ta.localeCompare(tb);
    return a.created_at.localeCompare(b.created_at);
  });
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading');
  const [seedingSample, setSeedingSample] = useState<boolean>(false);

  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('focuslist_theme') : null;
    if (saved && saved in DASHBOARD_THEMES) {
      return saved as ThemeId;
    }
    return 'warm-editorial';
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | null>(null);

  // Notifications & Reminders State
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [activeReminders, setActiveReminders] = useState<Todo[]>([]);
  const notifiedKeysRef = useRef<Set<string>>(new Set());
  const todosRef = useRef<Todo[]>(todos);
  todosRef.current = todos;

  // Undo & Feedback Toasts
  const [undoState, setUndoState] = useState<UndoDeleteState | null>(null);
  const deletedTodoRef = useRef<Todo | null>(null);
  const undoTimerRef = useRef<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);

  const pushFeedback = useCallback((type: 'error' | 'info', message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setFeedbacks((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    }, 6000);
  }, []);

  const dismissFeedback = useCallback((id: number) => {
    setFeedbacks((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Unlock Web Audio on first user interaction
  useEffect(() => {
    const unlock = () => {
      void unlockReminderAudio();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Persist theme swatch selection
  const handleThemeChange = useCallback((themeId: ThemeId) => {
    setActiveTheme(themeId);
    try {
      localStorage.setItem('focuslist_theme', themeId);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Fetch all todos from Supabase ordered by created_at ascending
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setSyncStatus('loading');
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setSyncStatus('error');
      pushFeedback('error', error.message);
      setLoading(false);
      return;
    }

    const normalized = (data || []).map((row) => normalizeTodoRow(row as Record<string, unknown>));
    setTodos(normalized);
    setSyncStatus('synced');
    setLoading(false);
  }, [pushFeedback]);

  useEffect(() => {
    void fetchTodos();
  }, [fetchTodos]);

  // Create Task
  const createTodo = useCallback(
    async (payload: TodoPayload): Promise<Todo | null> => {
      setSyncStatus('loading');
      const clean = sanitizePayload(payload);
      const { data, error } = await supabase.from('todos').insert(clean).select().single();

      if (error) {
        setSyncStatus('error');
        pushFeedback('error', error.message);
        return null;
      }

      const created = normalizeTodoRow(data as Record<string, unknown>);
      setTodos((prev) => [...prev, created]);
      setSyncStatus('synced');
      return created;
    },
    [pushFeedback]
  );

  // Quick-add handler for inline day column input
  const handleQuickAdd = useCallback(
    async (title: string, dueDate: string | null, dueTime: string | null) => {
      await createTodo({
        title,
        description: null,
        priority: 'Medium',
        category: 'Work',
        due_date: dueDate,
        due_time: dueTime,
        completed: false,
        reminded: false,
      });
    },
    [createTodo]
  );

  // Update Task
  const updateTodo = useCallback(
    async (id: string, patch: Partial<TodoPayload>): Promise<Todo | null> => {
      setSyncStatus('loading');
      const cleanPatch: Record<string, unknown> = { ...patch };
      if ('due_date' in cleanPatch) {
        cleanPatch.due_date =
          typeof cleanPatch.due_date === 'string' && cleanPatch.due_date.trim()
            ? cleanPatch.due_date.trim()
            : null;
      }
      if ('due_time' in cleanPatch) {
        cleanPatch.due_time =
          typeof cleanPatch.due_time === 'string' && cleanPatch.due_time.trim()
            ? cleanPatch.due_time.trim()
            : null;
      }
      if ('description' in cleanPatch) {
        cleanPatch.description =
          typeof cleanPatch.description === 'string' && cleanPatch.description.trim()
            ? cleanPatch.description.trim()
            : null;
      }
      if ('title' in cleanPatch && typeof cleanPatch.title === 'string') {
        cleanPatch.title = cleanPatch.title.trim();
      }

      const { data, error } = await supabase
        .from('todos')
        .update(cleanPatch)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        setSyncStatus('error');
        pushFeedback('error', error.message);
        return null;
      }

      const updated = normalizeTodoRow(data as Record<string, unknown>);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setSyncStatus('synced');
      return updated;
    },
    [pushFeedback]
  );

  // Save from Create/Edit Modal
  const handleModalSave = useCallback(
    async (payload: TodoPayload, editingId?: string) => {
      if (editingId) {
        const updated = await updateTodo(editingId, payload);
        if (updated) {
          // If schedule changed, allow reminder to trigger at the new time
          setActiveReminders((prev) => prev.filter((r) => r.id !== editingId));
        }
      } else {
        await createTodo(payload);
      }
    },
    [createTodo, updateTodo]
  );

  // Toggle Completed Checkbox
  const handleToggleComplete = useCallback(
    async (todo: Todo) => {
      const nextCompleted = !todo.completed;
      const updated = await updateTodo(todo.id, {
        completed: nextCompleted,
        ...(nextCompleted ? { reminded: true } : {}),
      });
      if (updated && nextCompleted) {
        setActiveReminders((prev) => prev.filter((r) => r.id !== todo.id));
      }
    },
    [updateTodo]
  );

  // Cycle Priority Color Dot (Low -> Medium -> High -> Low)
  const handleCyclePriority = useCallback(
    async (todo: Todo) => {
      const nextPriority = PRIORITY_CONFIG[todo.priority]?.next || 'Medium';
      await updateTodo(todo.id, { priority: nextPriority });
    },
    [updateTodo]
  );

  // Delete Task with 5-second Undo Toast
  const handleDeleteTodo = useCallback(
    async (todo: Todo) => {
      setSyncStatus('loading');
      const { error } = await supabase.from('todos').delete().eq('id', todo.id);

      if (error) {
        setSyncStatus('error');
        pushFeedback('error', error.message);
        return;
      }

      setTodos((prev) => prev.filter((t) => t.id !== todo.id));
      setActiveReminders((prev) => prev.filter((r) => r.id !== todo.id));
      setSyncStatus('synced');

      // Setup 5-second Undo Toast
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
      }
      deletedTodoRef.current = todo;
      setUndoState({ title: todo.title, key: Date.now() });

      undoTimerRef.current = window.setTimeout(() => {
        setUndoState(null);
        deletedTodoRef.current = null;
        undoTimerRef.current = null;
      }, 5000);
    },
    [pushFeedback]
  );

  const handleUndoDelete = useCallback(async () => {
    const target = deletedTodoRef.current;
    if (!target) return;

    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoState(null);
    deletedTodoRef.current = null;

    await createTodo({
      title: target.title,
      description: target.description,
      priority: target.priority,
      category: target.category,
      due_date: target.due_date,
      due_time: target.due_time,
      completed: target.completed,
      reminded: target.reminded,
    });
  }, [createTodo]);

  const handleDismissUndo = useCallback(() => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoState(null);
    deletedTodoRef.current = null;
  }, []);

  // Load Sample Week
  const handleLoadSampleWeek = useCallback(async () => {
    if (seedingSample) return;
    setSeedingSample(true);
    setSyncStatus('loading');
    const sampleRows = getSampleWeekTodos(weekStart);

    const { data, error } = await supabase.from('todos').insert(sampleRows).select();

    if (error) {
      setSyncStatus('error');
      pushFeedback('error', error.message);
      setSeedingSample(false);
      return;
    }

    const inserted = (data || []).map((row) => normalizeTodoRow(row as Record<string, unknown>));
    setTodos((prev) => [...prev, ...inserted]);
    setSyncStatus('synced');
    setSeedingSample(false);
    pushFeedback('info', 'Sample week tasks loaded and synced to Supabase.');
  }, [pushFeedback, seedingSample, weekStart]);

  // Browser Notifications Permission Request
  const handleRequestNotifications = useCallback(async () => {
    void unlockReminderAudio();
    if (typeof window === 'undefined' || !('Notification' in window)) {
      pushFeedback('info', 'Browser notifications are unavailable here; in-app reminder cards remain active.');
      return;
    }

    if (Notification.permission === 'granted') {
      pushFeedback('info', 'Reminder alerts are active. You will hear a chime and see notifications when tasks are due.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setNotificationPermission(result);
      if (result === 'granted') {
        pushFeedback('info', 'Browser notifications enabled for scheduled reminders.');
      } else {
        pushFeedback('info', 'Browser notifications declined — in-app reminder cards and chimes will still appear.');
      }
    } catch {
      pushFeedback('info', 'In-app reminder cards and chimes are active.');
    }
  }, [pushFeedback]);

  // Live Reminder Checker (every 5 seconds)
  const checkReminders = useCallback(() => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const dueNow: Todo[] = [];

    for (const todo of todosRef.current) {
      if (todo.completed || todo.reminded) continue;
      if (!todo.due_date || !todo.due_time) continue;
      if (todo.due_date !== todayStr) continue;

      const dueMinutes = getTimeMinutes(todo.due_time);
      if (dueMinutes === null) continue;

      if (currentMinutes >= dueMinutes) {
        const scheduleKey = `${todo.id}|${todo.due_date}|${normalizeTimeHHMM(todo.due_time)}`;
        if (!notifiedKeysRef.current.has(scheduleKey)) {
          notifiedKeysRef.current.add(scheduleKey);
          dueNow.push(todo);
        }
      }
    }

    if (dueNow.length > 0) {
      void playGentleChime();
      setActiveReminders((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const additions = dueNow.filter((d) => !existingIds.has(d.id));
        return [...prev, ...additions];
      });

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        for (const item of dueNow) {
          const timeLabel = formatTime12h(item.due_time);
          try {
            new Notification(`FocusList Reminder: ${item.title}`, {
              body: `${timeLabel ? `Scheduled for ${timeLabel} · ` : ''}${item.category} (${item.priority})`,
            });
          } catch {
            // Ignore notification construction errors in restricted frames
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    checkReminders();
    const intervalId = window.setInterval(checkReminders, 5000);
    return () => window.clearInterval(intervalId);
  }, [checkReminders, todos]);

  // Reminder Card Actions
  const handleReminderMarkDone = useCallback(
    async (todo: Todo) => {
      setActiveReminders((prev) => prev.filter((r) => r.id !== todo.id));
      await updateTodo(todo.id, { completed: true, reminded: true });
    },
    [updateTodo]
  );

  const handleReminderSnooze = useCallback(
    async (todo: Todo) => {
      setActiveReminders((prev) => prev.filter((r) => r.id !== todo.id));
      const nextSchedule = addMinutesToSchedule(todo.due_date, todo.due_time, 5);
      await updateTodo(todo.id, {
        due_date: nextSchedule.due_date,
        due_time: nextSchedule.due_time,
        reminded: false,
      });
      const prettyTime = formatTime12h(nextSchedule.due_time);
      pushFeedback('info', `Snoozed "${todo.title}" until ${prettyTime || '5m from now'}.`);
    },
    [pushFeedback, updateTodo]
  );

  const handleReminderDismiss = useCallback(
    async (todo: Todo) => {
      setActiveReminders((prev) => prev.filter((r) => r.id !== todo.id));
      await updateTodo(todo.id, { reminded: true });
    },
    [updateTodo]
  );

  // Derived dates & filtered todos
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatLocalDate(today), [today]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const themePalette = DASHBOARD_THEMES[activeTheme];

  const searchedTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return todos;
    return todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q) ||
        t.priority.toLowerCase().includes(q)
    );
  }, [todos, searchQuery]);

  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    const unscheduled: Todo[] = [];

    for (const todo of searchedTodos) {
      if (!todo.due_date) {
        unscheduled.push(todo);
        continue;
      }
      const list = map.get(todo.due_date) || [];
      list.push(todo);
      map.set(todo.due_date, list);
    }

    for (const [k, list] of map.entries()) {
      map.set(k, sortColumnTodos(list));
    }

    return { map, unscheduled: sortColumnTodos(unscheduled) };
  }, [searchedTodos]);

  const todayPaletteIndex = useMemo(() => {
    const day = today.getDay(); // 0=Sun..6=Sat
    return day === 0 ? 6 : day - 1;
  }, [today]);

  const openCreateModal = (defaultDate: string | null = todayKey) => {
    setEditingTodo(null);
    setModalDefaultDate(defaultDate);
    setModalOpen(true);
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setModalDefaultDate(todo.due_date);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] px-3 py-4 text-[#1E1B18] sm:px-6 sm:py-7 lg:px-8">
      {/* Framed Soft Ivory Dashboard Container */}
      <div className="mx-auto max-w-[1440px] rounded-3xl border border-[#E5DFD5] bg-[#FCFBF9] shadow-[0_12px_40px_rgba(34,30,26,0.06)]">
        <HeaderBar
          weekStart={weekStart}
          onPrevWeek={() => setWeekStart((prev) => addDays(prev, -7))}
          onNextWeek={() => setWeekStart((prev) => addDays(prev, 7))}
          onGoToday={() => setWeekStart(getMondayOfWeek(new Date()))}
          onSelectDate={(dateStr) => {
            const [y, m, d] = dateStr.split('-').map(Number);
            if (y && m && d) {
              setWeekStart(getMondayOfWeek(new Date(y, m - 1, d)));
            }
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeTheme={activeTheme}
          onThemeChange={handleThemeChange}
          onNewTask={() => openCreateModal(todayKey)}
          syncStatus={syncStatus}
          notificationPermission={notificationPermission}
          onRequestNotifications={handleRequestNotifications}
        />

        {/* Main Viewport */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Empty Database Onboarding Banner (when 0 rows exist in Supabase) */}
          {!loading && todos.length === 0 && syncStatus !== 'error' && (
            <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E5DFD5] bg-white px-5 py-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-[18px] font-semibold text-[#1E1B18]">
                  Your FocusList workspace is ready
                </h2>
                <p className="mt-0.5 text-[13px] text-[#6E685F]">
                  Your Supabase table is currently empty. Add a task below or populate this week with realistic sample tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleWeek}
                disabled={seedingSample}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#D8CFC3] bg-[#F7F3EC] px-4 py-2 text-[13px] font-semibold text-[#1E1B18] transition-colors hover:bg-[#EFE9DF] disabled:opacity-50"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#6E685F]" />
                <span>{seedingSample ? 'Loading Sample Week...' : 'Load Sample Week'}</span>
              </button>
            </div>
          )}

          {/* Subtle Skeleton Loading Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex min-h-[290px] flex-col overflow-hidden rounded-2xl border border-[#EAE4DC] bg-white"
                >
                  <div className="h-11 animate-pulse bg-[#EFEAE2]" />
                  <div className="flex-1 space-y-2.5 p-3">
                    <div className="h-14 animate-pulse rounded-xl bg-[#F6F3EE]" />
                    <div className="h-14 animate-pulse rounded-xl bg-[#F6F3EE]" />
                  </div>
                  <div className="h-9 border-t border-[#F2EDE6] px-4 py-3">
                    <div className="h-1.5 animate-pulse rounded-full bg-[#EFEAE2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === 'week' ? (
            /* Multi-Column Weekly Grid: Mon-Sun + Anytime/Unscheduled */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {weekDays.map((dayDate, idx) => {
                const dateKey = formatLocalDate(dayDate);
                const dayTodos = todosByDate.map.get(dateKey) || [];
                const palette = themePalette.days[idx];
                const isToday = dateKey === todayKey;

                return (
                  <DayColumnCard
                    key={dateKey}
                    date={dayDate}
                    dateKey={dateKey}
                    isToday={isToday}
                    palette={palette}
                    todos={dayTodos}
                    onQuickAdd={handleQuickAdd}
                    onToggleComplete={handleToggleComplete}
                    onCyclePriority={handleCyclePriority}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTodo}
                  />
                );
              })}

              {/* 8th Card: Anytime / Unscheduled Tasks */}
              <DayColumnCard
                date={null}
                dateKey={null}
                isToday={false}
                palette={{
                  bg: '#F0ECE5',
                  text: '#3F382E',
                  accent: '#8E8579',
                  badgeBg: '#3F382E',
                  badgeText: '#FCFBF9',
                }}
                todos={todosByDate.unscheduled}
                onQuickAdd={handleQuickAdd}
                onToggleComplete={handleToggleComplete}
                onCyclePriority={handleCyclePriority}
                onEdit={openEditModal}
                onDelete={handleDeleteTodo}
              />
            </div>
          ) : viewMode === 'today' ? (
            <TodayView
              today={today}
              palette={themePalette.days[todayPaletteIndex]}
              todos={todosByDate.map.get(todayKey) || []}
              onQuickAdd={handleQuickAdd}
              onToggleComplete={handleToggleComplete}
              onCyclePriority={handleCyclePriority}
              onEdit={openEditModal}
              onDelete={handleDeleteTodo}
            />
          ) : (
            <AllTasksView
              todos={searchedTodos}
              todayKey={todayKey}
              onToggleComplete={handleToggleComplete}
              onCyclePriority={handleCyclePriority}
              onEdit={openEditModal}
              onDelete={handleDeleteTodo}
              onOpenNewTask={() => openCreateModal(todayKey)}
            />
          )}
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        editingTodo={editingTodo}
        defaultDate={modalDefaultDate}
        onClose={() => {
          setModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleModalSave}
      />

      {/* Floating Top-Right Live Reminder Cards */}
      <ReminderToast
        reminders={activeReminders}
        onMarkDone={handleReminderMarkDone}
        onSnooze={handleReminderSnooze}
        onDismiss={handleReminderDismiss}
      />

      {/* Bottom-Right Undo Toast & Error/Info Toasts */}
      <FeedbackToasts
        undoState={undoState}
        onUndoDelete={handleUndoDelete}
        onDismissUndo={handleDismissUndo}
        feedbacks={feedbacks}
        onDismissFeedback={dismissFeedback}
      />
    </div>
  );
}
