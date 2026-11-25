import React, { useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { formatDayName, formatShortMonthDay } from '../lib/dateUtils';
import { DayColumnPalette } from '../lib/themes';
import { Todo } from '../types/todo';
import { TaskRow } from './TaskRow';

interface DayColumnCardProps {
  date: Date | null; // null represents Unscheduled / Anytime column
  dateKey: string | null;
  isToday: boolean;
  palette: DayColumnPalette;
  todos: Todo[];
  onQuickAdd: (title: string, dueDate: string | null, dueTime: string | null) => Promise<void>;
  onToggleComplete: (todo: Todo) => void;
  onCyclePriority: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export const DayColumnCard: React.FC<DayColumnCardProps> = ({
  date,
  dateKey,
  isToday,
  palette,
  todos,
  onQuickAdd,
  onToggleComplete,
  onCyclePriority,
  onEdit,
  onDelete,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const dayLabel = date ? formatDayName(date) : 'Anytime';
  const shortDate = date ? formatShortMonthDay(date) : 'Unscheduled';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickTitle.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onQuickAdd(trimmed, dateKey, quickTime.trim() || null);
      setQuickTitle('');
      setQuickTime('');
      setShowTimeInput(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-label={`${dayLabel} ${shortDate}`}
      className={`flex h-full min-h-[290px] flex-col overflow-hidden rounded-2xl border bg-white transition-shadow duration-150 ${
        isToday
          ? 'border-[#CFC6BA] shadow-[0_6px_24px_rgba(30,27,24,0.07)]'
          : 'border-[#EAE4DC] shadow-[0_2px_10px_rgba(30,27,24,0.025)]'
      }`}
    >
      {/* Pastel Colored Header Strip */}
      <header
        className="flex items-center justify-between gap-2 px-4 py-3 transition-colors duration-200"
        style={{ backgroundColor: palette.bg, color: palette.text }}
      >
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="truncate text-[15px] font-semibold tracking-tight">{dayLabel}</h2>
          <span className="shrink-0 text-[12.5px] font-medium opacity-80 tabular-nums">
            {shortDate}
          </span>
        </div>

        {isToday && (
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: palette.badgeBg, color: palette.badgeText }}
          >
            TODAY
          </span>
        )}
      </header>

      {/* Task List Body */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {todos.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-6 text-center">
            <p className="text-[12.5px] text-[#A29A8F]">No tasks planned</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2">
            {todos.map((todo) => (
              <TaskRow
                key={todo.id}
                todo={todo}
                onToggleComplete={onToggleComplete}
                onCyclePriority={onCyclePriority}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {/* Inline Quick-Add Row */}
        <form
          onSubmit={handleSubmit}
          className="mt-1 rounded-xl border border-[#EDE7DF] bg-[#FAF8F5] px-2.5 py-1.5 transition-colors focus-within:border-[#C7BEB2] focus-within:bg-white"
        >
          <div className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 shrink-0 text-[#8C8478]" />
            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Add a task..."
              aria-label={`Add a task for ${dayLabel}`}
              disabled={submitting}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#1E1B18] placeholder:text-[#9A9287] focus:outline-none"
            />
            {dateKey !== null && (
              <button
                type="button"
                onClick={() => setShowTimeInput((prev) => !prev)}
                title={showTimeInput ? 'Hide time input' : 'Set reminder time'}
                aria-label="Toggle optional time input"
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
                  showTimeInput || quickTime
                    ? 'bg-[#EAE4DC] text-[#1E1B18]'
                    : 'text-[#8C8478] hover:bg-[#EFEAE2] hover:text-[#1E1B18]'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
              </button>
            )}
            {quickTitle.trim().length > 0 && (
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 rounded-lg bg-[#2B2623] px-2 py-0.5 text-[11px] font-medium text-[#FCFBF9] transition-colors hover:bg-[#1E1B18] disabled:opacity-50"
              >
                Add
              </button>
            )}
          </div>

          {showTimeInput && dateKey !== null && (
            <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-[#ECE6DD] pt-1.5">
              <label className="text-[11px] font-medium text-[#6E685F]">Time</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  aria-label={`Optional time for ${dayLabel}`}
                  className="rounded-md border border-[#E2DBD1] bg-white px-1.5 py-0.5 text-[11.5px] text-[#1E1B18] tabular-nums focus:border-[#9E9487] focus:outline-none"
                />
                {quickTime && (
                  <button
                    type="button"
                    onClick={() => setQuickTime('')}
                    className="text-[11px] text-[#6E685F] hover:text-[#1E1B18]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Card Footer Progress Bar */}
      <footer className="flex items-center gap-3 border-t border-[#F2EDE6] px-4 py-2.5">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1ECE5]"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${dayLabel} completion progress`}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${progressPct}%`,
              backgroundColor: palette.accent,
            }}
          />
        </div>
        <span className="shrink-0 text-[11.5px] font-medium text-[#6E685F] tabular-nums">
          {completedCount}/{totalCount}
        </span>
      </footer>
    </section>
  );
};
