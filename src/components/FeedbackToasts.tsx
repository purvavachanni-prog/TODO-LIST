import React from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, X } from 'lucide-react';

export interface UndoDeleteState {
  title: string;
  key: number;
}

export interface FeedbackMessage {
  id: number;
  type: 'error' | 'info';
  message: string;
}

interface FeedbackToastsProps {
  undoState: UndoDeleteState | null;
  onUndoDelete: () => void;
  onDismissUndo: () => void;
  feedbacks: FeedbackMessage[];
  onDismissFeedback: (id: number) => void;
}

export const FeedbackToasts: React.FC<FeedbackToastsProps> = ({
  undoState,
  onUndoDelete,
  onDismissUndo,
  feedbacks,
  onDismissFeedback,
}) => {
  if (!undoState && feedbacks.length === 0) return null;

  return (
    <div className="fixed right-5 bottom-5 z-50 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5">
      {/* Error / Info Toasts */}
      {feedbacks.map((item) => (
        <div
          key={item.id}
          role={item.type === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 shadow-[0_12px_32px_rgba(30,27,24,0.14)] ${
            item.type === 'error'
              ? 'border-[#E9C9C4] bg-[#FDF6F5] text-[#6E2A21]'
              : 'border-[#E2DBD1] bg-[#FCFBF9] text-[#1E1B18]'
          }`}
        >
          {item.type === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B54B3C]" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4A6B5D]" />
          )}
          <p className="min-w-0 flex-1 text-[13px] leading-snug font-medium break-words">
            {item.message}
          </p>
          <button
            type="button"
            onClick={() => onDismissFeedback(item.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* 5-second Undo Delete Toast */}
      {undoState && (
        <div
          key={undoState.key}
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#3B352F] bg-[#2B2623] px-4 py-3 text-[#FCFBF9] shadow-[0_14px_36px_rgba(30,27,24,0.22)]"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">
              Deleted <span className="font-semibold">"{undoState.title}"</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={onUndoDelete}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#FCFBF9] px-2.5 py-1 text-[12px] font-semibold text-[#1E1B18] transition-colors hover:bg-[#EFEAE2]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={onDismissUndo}
              aria-label="Dismiss undo toast"
              className="rounded-lg p-1 text-[#C6BEB4] hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
