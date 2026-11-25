import React from 'react';
import { applyMarkdownFormat } from './markdownFormat';

const ACTIONS = [
  { action: 'bold', label: 'B', title: 'Bold', className: 'font-extrabold' },
  { action: 'italic', label: 'I', title: 'Italic', className: 'italic' },
  { action: 'h2', label: 'H2', title: 'Section heading' },
  { action: 'h3', label: 'H3', title: 'Sub-heading' },
  { action: 'ul', label: '• List', title: 'Bulleted list' },
  { action: 'ol', label: '1. List', title: 'Numbered list' },
  { action: 'quote', label: '“ Quote', title: 'Pull quote' },
  { action: 'link', label: 'Link', title: 'Insert link' },
];

/** Formatting buttons for a Markdown textarea. They edit through `onChange` and restore the selection. */
export default function MarkdownToolbar({ textareaRef, value, onChange, onInsertImage }) {
  const apply = (action) => {
    const field = textareaRef.current;
    if (!field) return;
    const result = applyMarkdownFormat(value, field.selectionStart, field.selectionEnd, action);
    onChange(result.value);
    window.requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-1">
      {ACTIONS.map(({ action, label, title, className = '' }) => (
        <button
          key={action}
          type="button"
          title={title}
          aria-label={title}
          // Keep the textarea selection when a button is pressed.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => apply(action)}
          className={`rounded border border-[#E2DDD4] bg-white px-2.5 py-1 text-xs text-[#1E5631] transition-colors hover:border-[#C4A747] hover:bg-[#F5EDD6] ${className}`}
        >
          {label}
        </button>
      ))}
      {onInsertImage ? (
        <button
          type="button"
          title="Insert image"
          aria-label="Insert image"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onInsertImage}
          className="rounded border border-[#E2DDD4] bg-white px-2.5 py-1 text-xs text-[#1E5631] transition-colors hover:border-[#C4A747] hover:bg-[#F5EDD6]"
        >
          Image
        </button>
      ) : null}
    </div>
  );
}
