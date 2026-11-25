import React from 'react';

/** Renders the queue from useToasts in a polite live region, bottom-centre. */
export default function Toasts({ toasts, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg ${
              isError ? 'bg-red-700' : 'bg-[#0F2818]'
            }`}
          >
            <span aria-hidden="true" className={isError ? '' : 'text-[#C4A747]'}>{isError ? '!' : '✓'}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 px-1 text-lg leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
