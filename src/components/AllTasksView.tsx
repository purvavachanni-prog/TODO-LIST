import React, { useMemo, useState } from 'react';
import { formatShortMonthDay, parseLocalDate } from '../lib/dateUtils';
import { CATEGORIES, PRIORITIES } from '../lib/themes';
import { Category, Priority, Todo } from '../types/todo';
import { TaskRow } from './TaskRow';

interface AllTasksViewProps {
  todos: Todo[];
  todayKey: string;
  onToggleComplete: (todo: Todo) => void;
  onCyclePriority: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onOpenNewTask: () => void;
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({
  todos,
  todayKey,
  onToggleComplete,
  onCyclePriority,
  onEdit,
  onDelete,
  onOpenNewTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');

  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => {
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort by due_date ascending (nulls last), then due_time ascending (nulls last), then created_at
        const da = a.due_date || '9999-12-31';
        const db = b.due_date || '9999-12-31';
        if (da !== db) return da.localeCompare(db);
        const ta = a.due_time || '99:99';
        const tb = b.due_time || '99:99';
        if (ta !== tb) return ta.localeCompare(tb);
        return a.created_at.localeCompare(b.created_at);
      });
  }, [todos, statusFilter, categoryFilter, priorityFilter]);

  const formatDateBadge = (dueDate: string | null): string => {
    if (!dueDate) return 'Anytime';
    if (dueDate === todayKey) return 'Today';
    const d = parseLocalDate(dueDate);
    return `${d.toLocaleDateString('en-US', { weekday: 'short' })}, ${formatShortMonthDay(d)}`;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl border border-[#EAE4DC] bg-white shadow-[0_4px_20px_rgba(30,27,24,0.035)]">
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFEAE2] bg-[#FAF8F5] px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Segmented Filter */}
            <div className="inline-flex items-center rounded-xl border border-[#E5DFD5] bg-white p-0.5">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'completed', label: 'Completed' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  className={`rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors ${
                    statusFilter === item.id
                      ? 'bg-[#2B2623] text-[#FCFBF9]'
                      : 'text-[#6E685F] hover:text-[#1E1B18]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | Category)}
              aria-label="Filter by category"
              className="h-8 rounded-xl border border-[#E5DFD5] bg-white px-2.5 text-[12px] font-medium text-[#4A443C] focus:border-[#B9B0A4] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
              aria-label="Filter by priority"
              className="h-8 rounded-xl border border-[#E5DFD5] bg-white px-2.5 text-[12px] font-medium text-[#4A443C] focus:border-[#B9B0A4] focus:outline-none"
            >
              <option value="all">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>
          </div>

          <span className="text-[12.5px] font-medium text-[#6E685F] tabular-nums">
            {filteredTodos.length} {filteredTodos.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-2.5 p-5">
          {filteredTodos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[14px] font-medium text-[#6E685F]">
                No tasks match the current filters.
              </p>
              <button
                type="button"
                onClick={onOpenNewTask}
                className="mt-3 rounded-full bg-[#2B2623] px-4 py-2 text-[12.5px] font-medium text-[#FCFBF9] hover:bg-[#1E1B18]"
              >
                Create a New Task
              </button>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onCyclePriority={onCyclePriority}
                onEdit={onEdit}
                onDelete={onDelete}
                showDescription
                showDateLabel={formatDateBadge(todo.due_date)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
