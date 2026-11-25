import React from 'react';
import { BellRing, Check, Clock, X } from 'lucide-react';
import { formatTime12h } from '../lib/dateUtils';
import { PRIORITY_CONFIG } from '../lib/themes';
import { Todo } from '../types/todo';

interface ReminderToastProps {
  reminders: Todo[];
  onMarkDone: (todo: Todo) => void;
  onSnooze: (todo: Todo) => void;
  onDismiss: (todo: Todo) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  reminders,
  onMarkDone,
  onSnooze,
  onDismiss,
}) => {
  if (reminders.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed top-5 right-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-3"
    >
      {reminders.map((todo) => {
        const formattedTime = formatTime12h(todo.due_time);
        const priorityCfg = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.Medium;

        return (
          <div
            key={todo.id}
            role="alert"
            className="overflow-hidden rounded-2xl border border-[#DFD7CB] bg-[#FCFBF9] p-4 shadow-[0_16px_44px_rgba(30,27,24,0.16)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFE0CE] text-[#4E3924]">
                <BellRing className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-wide text-[#6E685F] uppercase">
                    Scheduled Reminder
                  </span>
                  {formattedTime && (
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-[#4E3924] tabular-nums">
                      <Clock className="h-3 w-3" />
                      {formattedTime}
                    </span>
                  )}
                </div>

                <h3 className="mt-1 text-[14.5px] font-semibold leading-snug text-[#1E1B18]">
                  {todo.title}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-[12px] text-[#6E685F]">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: priorityCfg.dotColor }}
                    />
                    {priorityCfg.label}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{todo.category}</span>
                </div>
              </div>
            </div>

            {/* 3 Action Buttons: Mark Done, Snooze 5m, Dismiss */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMarkDone(todo)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#2B2623] px-3 py-1.5 text-[12px] font-medium text-[#FCFBF9] transition-colors hover:bg-[#1E1B18]"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark Done</span>
              </button>

              <button
                type="button"
                onClick={() => onSnooze(todo)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-[#DFD7CB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#1E1B18] transition-colors hover:bg-[#F5F1EB]"
              >
                Snooze 5m
              </button>

              <button
                type="button"
                onClick={() => onDismiss(todo)}
                aria-label="Dismiss reminder"
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-transparent px-2.5 py-1.5 text-[12px] font-medium text-[#6E685F] transition-colors hover:bg-[#F3EFE9] hover:text-[#1E1B18]"
              >
                <X className="h-3.5 w-3.5" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
