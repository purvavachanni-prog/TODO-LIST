import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import { normalizeTimeHHMM } from '../lib/dateUtils';
import { CATEGORIES, PRIORITIES, PRIORITY_CONFIG } from '../lib/themes';
import { Category, Priority, Todo, TodoPayload } from '../types/todo';

interface TaskModalProps {
  isOpen: boolean;
  editingTodo: Todo | null;
  defaultDate: string | null;
  onClose: () => void;
  onSave: (payload: TodoPayload, editingId?: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  editingTodo,
  defaultDate,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState<Category>('Work');
  const [saving, setSaving] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setDueDate(editingTodo.due_date || '');
      setDueTime(normalizeTimeHHMM(editingTodo.due_time));
      setPriority(editingTodo.priority || 'Medium');
      setCategory(editingTodo.category || 'Work');
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || '');
      setDueTime('');
      setPriority('Medium');
      setCategory('Work');
    }

    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 30);
    return () => clearTimeout(timer);
  }, [isOpen, editingTodo, defaultDate]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || saving) return;

    setSaving(true);
    try {
      const normalizedDate = dueDate.trim() || null;
      const normalizedTime = dueTime.trim() || null;

      // Reset reminded if date/time changed so scheduled reminder will fire at the new time
      const scheduleChanged =
        editingTodo &&
        (editingTodo.due_date !== normalizedDate ||
          normalizeTimeHHMM(editingTodo.due_time) !== (normalizedTime || ''));

      await onSave(
        {
          title: trimmedTitle,
          description: description.trim() || null,
          priority,
          category,
          due_date: normalizedDate,
          due_time: normalizedTime,
          completed: editingTodo ? editingTodo.completed : false,
          reminded: editingTodo ? (scheduleChanged ? false : editingTodo.reminded) : false,
        },
        editingTodo?.id
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B18]/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E5DFD5] bg-[#FCFBF9] shadow-[0_24px_60px_rgba(30,27,24,0.18)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#ECE6DD] px-6 py-4">
          <h2 id="task-modal-title" className="font-serif text-[21px] font-semibold text-[#1E1B18]">
            {editingTodo ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6E685F] transition-colors hover:bg-[#EFEAE2] hover:text-[#1E1B18]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-[12.5px] font-semibold text-[#4A443C]">
              Task Title
            </label>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Finalize editorial moodboard"
              className="mt-1.5 w-full rounded-xl border border-[#E2DBD1] bg-white px-3.5 py-2.5 text-[14px] text-[#1E1B18] placeholder:text-[#A39B90] focus:border-[#8C8377] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-[12.5px] font-semibold text-[#4A443C]">
              Description <span className="font-normal text-[#8C8478]">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes, context, or links..."
              className="mt-1.5 w-full resize-none rounded-xl border border-[#E2DBD1] bg-white px-3.5 py-2 text-[13.5px] text-[#1E1B18] placeholder:text-[#A39B90] focus:border-[#8C8377] focus:outline-none"
            />
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="task-date"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#4A443C]"
                >
                  <Calendar className="h-3.5 w-3.5 text-[#6E685F]" />
                  Date
                </label>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="text-[11px] text-[#6E685F] hover:text-[#1E1B18]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2DBD1] bg-white px-3 py-2 text-[13px] text-[#1E1B18] tabular-nums focus:border-[#8C8377] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="task-time"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#4A443C]"
                >
                  <Clock className="h-3.5 w-3.5 text-[#6E685F]" />
                  Reminder Time
                </label>
                {dueTime && (
                  <button
                    type="button"
                    onClick={() => setDueTime('')}
                    className="text-[11px] text-[#6E685F] hover:text-[#1E1B18]"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                id="task-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2DBD1] bg-white px-3 py-2 text-[13px] text-[#1E1B18] tabular-nums focus:border-[#8C8377] focus:outline-none"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <span className="block text-[12.5px] font-semibold text-[#4A443C]">Priority</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const selected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[13px] font-medium transition-all ${
                      selected
                        ? 'border-[#2B2623] bg-white text-[#1E1B18] shadow-xs'
                        : 'border-[#E5DFD5] bg-[#FAF8F5] text-[#6E685F] hover:bg-white hover:text-[#1E1B18]'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cfg.dotColor }}
                    />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <span className="block text-[12.5px] font-semibold text-[#4A443C]">Category</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CATEGORIES.map((cat) => {
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-xl border px-3 py-2 text-[13px] font-medium transition-all ${
                      selected
                        ? 'border-[#2B2623] bg-[#2B2623] text-[#FCFBF9]'
                        : 'border-[#E5DFD5] bg-[#FAF8F5] text-[#6E685F] hover:bg-white hover:text-[#1E1B18]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-[#ECE6DD] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#E2DBD1] bg-white px-4 py-2 text-[13px] font-medium text-[#4A443C] transition-colors hover:bg-[#F5F1EB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="rounded-full bg-[#2B2623] px-5 py-2 text-[13px] font-medium text-[#FCFBF9] transition-colors hover:bg-[#1E1B18] disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingTodo ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
