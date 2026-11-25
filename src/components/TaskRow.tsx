import React from 'react';
import { Bell, Check, Clock, Pencil, Trash2 } from 'lucide-react';
import { formatTime12h } from '../lib/dateUtils';
import { PRIORITY_CONFIG } from '../lib/themes';
import { Todo } from '../types/todo';

interface TaskRowProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => void;
  onCyclePriority: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  showDescription?: boolean;
  showDateLabel?: string | null;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  todo,
  onToggleComplete,
  onCyclePriority,
  onEdit,
  onDelete,
  showDescription = false,
  showDateLabel = null,
}) => {
  const priorityStyle = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.Medium;
  const formattedTime = formatTime12h(todo.due_time);

  return (
    <div
      className={`group relative flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-150 ${
        todo.completed
          ? 'border-[#F0ECE5] bg-[#FAF8F5]/70'
          : 'border-[#EDE7DF] bg-white hover:border-[#D9D0C5] hover:shadow-[0_2px_10px_rgba(30,27,24,0.04)]'
      }`}
    >
      {/* Rounded Square Checkbox */}
      <button
        type="button"
        onClick={() => onToggleComplete(todo)}
        aria-label={todo.completed ? `Mark "${todo.title}" incomplete` : `Mark "${todo.title}" complete`}
        className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2623]/40 ${
          todo.completed
            ? 'border-[#2B2623] bg-[#2B2623] text-[#FCFBF9]'
            : 'border-[#CFC7BC] bg-white hover:border-[#6E685F]'
        }`}
      >
        {todo.completed && <Check className="h-3 w-3 stroke-[2.6]" />}
      </button>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {/* Clickable Priority Color Dot */}
          <button
            type="button"
            onClick={() => onCyclePriority(todo)}
            title={`Priority: ${priorityStyle.label} (click to cycle)`}
            aria-label={`Priority ${priorityStyle.label}. Click to cycle priority for ${todo.title}`}
            className="mt-[5px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-transform duration-150 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2623]/30"
          >
            <span
              className="h-2.5 w-2.5 rounded-full transition-colors duration-150"
              style={{
                backgroundColor: priorityStyle.dotColor,
                boxShadow: `0 0 0 2px ${priorityStyle.ringColor}`,
              }}
            />
          </button>

          <p
            className={`flex-1 break-words text-[13.5px] font-semibold leading-snug transition-colors duration-150 ${
              todo.completed ? 'text-[#9B9388] line-through decoration-[#B8B0A5]' : 'text-[#1E1B18]'
            }`}
          >
            {todo.title}
          </p>
        </div>

        {showDescription && todo.description && (
          <p
            className={`mt-1 pl-5 text-[12.5px] leading-relaxed ${
              todo.completed ? 'text-[#A8A095]' : 'text-[#6E685F]'
            }`}
          >
            {todo.description}
          </p>
        )}

        {/* Metadata row: compact time badge + subtle category tag */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 pl-5 text-[11.5px] text-[#6E685F]">
          {showDateLabel && (
            <span className="font-medium text-[#4D473F] tabular-nums">{showDateLabel}</span>
          )}

          {formattedTime && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${
                todo.completed
                  ? 'bg-[#F2EFEA] text-[#9B9388]'
                  : 'bg-[#F6F2EC] text-[#4E4840]'
              }`}
            >
              <Clock className="h-3 w-3 opacity-75" />
              {formattedTime}
            </span>
          )}

          <span className="font-medium text-[#7C756B]">{todo.category}</span>

          {!todo.completed && !todo.reminded && todo.due_date && todo.due_time && (
            <span
              title="Live reminder scheduled"
              className="inline-flex items-center text-[#8C8478]"
              aria-label="Reminder scheduled"
            >
              <Bell className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Hover Edit / Delete Icon Buttons */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(todo)}
          aria-label={`Edit "${todo.title}"`}
          title="Edit task"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6E685F] transition-colors hover:bg-[#F3EFE9] hover:text-[#1E1B18] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2623]/30"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo)}
          aria-label={`Delete "${todo.title}"`}
          title="Delete task"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6E685F] transition-colors hover:bg-[#F9ECEA] hover:text-[#B54B3C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B54B3C]/30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
