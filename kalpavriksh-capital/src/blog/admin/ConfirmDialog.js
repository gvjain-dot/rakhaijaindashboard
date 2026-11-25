import React, { useEffect, useRef } from 'react';

/**
 * Accessible confirmation modal (replaces window.confirm). Focus starts on the safe "cancel" action,
 * Escape and a backdrop click cancel, and Tab stays inside the dialog.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (open && cancelRef.current) cancelRef.current.focus();
  }, [open]);

  if (!open) return null;

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (!busy) onCancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const first = cancelRef.current;
    const last = confirmRef.current;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const confirmClass =
    tone === 'danger' ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-[#1E5631] text-white hover:bg-[#164426]';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0F2818]/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onKeyDown={handleKeyDown}
        className="w-full max-w-md rounded-lg border border-[#E2DDD4] bg-white p-6 shadow-xl"
      >
        <h2 id="confirm-title" className="kj-serif text-xl font-bold text-[#1E5631]">{title}</h2>
        <p id="confirm-message" className="mt-2 text-sm leading-relaxed text-[#6B7280]">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-[#D9D3C7] bg-white px-4 py-2 text-sm font-bold text-[#1E5631] hover:border-[#C4A747] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-md px-4 py-2 text-sm font-bold disabled:opacity-60 ${confirmClass}`}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
