import React, { useState } from 'react';
import { CalendarDays, Clock, Plus } from 'lucide-react';
import { formatDayName, formatLocalDate, formatShortMonthDay } from '../lib/dateUtils';
import { DayColumnPalette } from '../lib/themes';
import { Todo } from '../types/todo';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  today: Date;
  palette: DayColumnPalette;
  todos: Todo[];
  onQuickAdd: (title: string, dueDate: string | null, dueTime: string | null) => Promise<void>;
  onToggleComplete: (todo: Todo) => void;
  onCyclePriority: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  today,
  palette,
  todos,
  onQuickAdd,
  onToggleComplete,
  onCyclePriority,
  onEdit,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayKey = formatLocalDate(today);
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onQuickAdd(trimmed, todayKey, time.trim() || null);
      setTitle('');
      setTime('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-[#EAE4DC] bg-white shadow-[0_6px_24px_rgba(30,27,24,0.04)]">
        {/* Pastel Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
          style={{ backgroundColor: palette.bg, color: palette.text }}
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 opacity-80" />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-serif text-[22px] font-semibold tracking-tight">
                  {formatDayName(today)}
                </h2>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                  style={{ backgroundColor: palette.badgeBg, color: palette.badgeText }}
                >
                  TODAY
                </span>
              </div>
              <p className="text-[13px] opacity-80 tabular-nums">
                {formatShortMonthDay(today)}, {today.getFullYear()}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[13px] font-semibold tabular-nums">
              {completedCount} of {totalCount} completed
            </span>
          </div>
        </div>

        {/* Inline Quick-Add */}
        <form
          onSubmit={handleSubmit}
          className="border-b border-[#F0EAE1] bg-[#FAF8F5] px-5 py-3.5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#E5DFD5] bg-white px-3 py-2 focus-within:border-[#B9B0A4]">
              <Plus className="h-4 w-4 shrink-0 text-[#8C8478]" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a focus task for today..."
                aria-label="Add a task for today"
                disabled={submitting}
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#1E1B18] placeholder:text-[#9A9287] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-[#E5DFD5] bg-white px-2.5 py-2">
                <Clock className="h-3.5 w-3.5 text-[#8C8478]" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  aria-label="Optional reminder time for today"
                  className="bg-transparent text-[12.5px] text-[#1E1B18] tabular-nums focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!title.trim() || submitting}
                className="h-[38px] shrink-0 rounded-xl bg-[#2B2623] px-4 text-[13px] font-medium text-[#FCFBF9] transition-colors hover:bg-[#1E1B18] disabled:opacity-45"
              >
                Add Task
              </button>
            </div>
          </div>
        </form>

        {/* Task List */}
        <div className="space-y-2.5 p-5">
          {todos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] font-medium text-[#6E685F]">
                Your schedule for today is clear.
              </p>
              <p className="mt-1 text-[12.5px] text-[#9A9287]">
                Use the bar above to add a task or set a timed reminder.
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onCyclePriority={onCyclePriority}
                onEdit={onEdit}
                onDelete={onDelete}
                showDescription
              />
            ))
          )}
        </div>

        {/* Footer Progress */}
        <div className="flex items-center gap-4 border-t border-[#F2EDE6] px-6 py-3.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F1ECE5]">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPct}%`, backgroundColor: palette.accent }}
            />
          </div>
          <span className="text-[12.5px] font-semibold text-[#6E685F] tabular-nums">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};
