import React, { useState } from 'react';
import { INPUT_CLASS } from './fields';

const NEW_OPTION = '__new__';
const MAX_CATEGORY_LENGTH = 50;
const collapse = (text) => text.trim().replace(/\s+/g, ' ');

/**
 * Category dropdown listing every saved category, with "+ New category…" to type one that does not exist yet.
 * A new name is reused as typed unless it matches an existing one ignoring case, in which case that one is used.
 */
export default function CategorySelect({ id, value, categories, onChange }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  // An article's current category stays selectable even if it is not in the saved list.
  const options = value && !categories.includes(value) ? [value, ...categories] : categories;

  const finish = () => {
    const name = collapse(draft);
    const existing = categories.find((category) => category.toLowerCase() === name.toLowerCase());
    if (name) onChange(existing || name);
    setDraft('');
    setAdding(false);
  };

  const cancel = () => {
    setDraft('');
    setAdding(false);
  };

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          id={id}
          aria-label="New category name"
          className={INPUT_CLASS}
          value={draft}
          maxLength={MAX_CATEGORY_LENGTH}
          placeholder="Name the new category"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault(); // the editor is a form; Enter must not save the article
              finish();
            } else if (event.key === 'Escape') {
              cancel();
            }
          }}
        />
        <button type="button" onClick={finish} disabled={!collapse(draft)} className="rounded-md bg-[#1E5631] px-3 text-xs font-bold text-white disabled:opacity-60">Use</button>
        <button type="button" onClick={cancel} className="rounded-md border border-[#D9D3C7] bg-white px-3 text-xs font-bold text-[#1E5631]">Cancel</button>
      </div>
    );
  }

  return (
    <select
      id={id}
      className={INPUT_CLASS}
      value={value || ''}
      onChange={(event) => (event.target.value === NEW_OPTION ? setAdding(true) : onChange(event.target.value))}
    >
      <option value="">No category</option>
      {options.map((name) => <option key={name} value={name}>{name}</option>)}
      <option value={NEW_OPTION}>+ New category…</option>
    </select>
  );
}
