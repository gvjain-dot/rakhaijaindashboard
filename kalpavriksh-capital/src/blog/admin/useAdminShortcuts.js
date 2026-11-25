import { useEffect } from 'react';

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

function isTyping(target) {
  return Boolean(target) && (TYPING_TAGS.includes(target.tagName) || target.isContentEditable);
}

/**
 * Single-key shortcuts for the admin lists: N = new article, / = search. They never fire while typing, with a
 * modifier key held (so Ctrl/⌘+N and friends keep working), while a dialog is open, or when `enabled` is false.
 */
export default function useAdminShortcuts({ enabled, onNew, onSearch }) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
      if (isTyping(event.target) || document.querySelector('[role="alertdialog"], [role="dialog"]')) return;
      if (event.key === 'n') {
        event.preventDefault();
        onNew();
      } else if (event.key === '/') {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [enabled, onNew, onSearch]);
}
