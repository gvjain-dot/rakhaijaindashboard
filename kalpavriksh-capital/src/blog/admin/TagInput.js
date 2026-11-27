import React, { useMemo, useState } from 'react';
import { MAX_TAGS, addTags, normalizeTag, removeTag } from './tags';

const MAX_OPTIONS = 50;
const LISTBOX_ID = 'tag-options';

/** The rows of the dropdown: a "Create" row for a brand-new name, then saved tags matching what is typed. */
function buildOptions(draft, value, suggestions) {
  const typed = normalizeTag(draft);
  const taken = new Set(value);
  const saved = [...new Set(suggestions.map(normalizeTag))].filter((tag) => tag && !taken.has(tag));
  const matches = saved.filter((tag) => tag.includes(typed)).slice(0, MAX_OPTIONS);
  const options = matches.map((tag) => ({ tag, create: false }));
  if (typed && !taken.has(typed) && !saved.includes(typed)) options.unshift({ tag: typed, create: true });
  return options;
}

/**
 * Chip-style tag editor with a dropdown of saved tags. Click a saved tag to add it; type a new name and press Enter
 * (or comma, or choose "Create") to make a new one. Backspace on an empty box removes the last, × removes one.
 */
export default function TagInput({ value, onChange, suggestions = [] }) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const full = value.length >= MAX_TAGS;
  const options = useMemo(() => buildOptions(draft, value, suggestions), [draft, value, suggestions]);
  const showList = open && !full && options.length > 0;

  const commit = (raw) => {
    if (raw.trim()) onChange(addTags(value, raw));
    setDraft('');
    setActive(-1);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current + step + options.length) % Math.max(options.length, 1));
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    } else if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(showList && active >= 0 && event.key === 'Enter' ? options[active].tag : draft);
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(removeTag(value, value[value.length - 1]));
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#D9D3C7] bg-white p-2 focus-within:border-[#1E5631] focus-within:ring-2 focus-within:ring-[#C4A747]/40">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#F5EDD6] py-0.5 pl-2.5 pr-1 text-xs font-bold capitalize text-[#7A5F0E]">
            {tag}
            <button
              type="button"
              onClick={() => onChange(removeTag(value, tag))}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full px-1.5 text-sm leading-none text-[#7A5F0E] hover:bg-[#E9DDB5]"
            >
              ×
            </button>
          </span>
        ))}
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={LISTBOX_ID}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${LISTBOX_ID}-${active}` : undefined}
          value={draft}
          disabled={full}
          aria-label="Add a tag"
          placeholder={full ? `Limit of ${MAX_TAGS} tags reached` : value.length === 0 ? 'Pick a tag or type a new one' : 'Add another…'}
          onChange={(event) => {
            setOpen(true);
            setActive(-1);
            if (event.target.value.includes(',')) commit(event.target.value);
            else setDraft(event.target.value);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            commit(draft);
            setOpen(false);
          }}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-[#2C3344] outline-none placeholder:text-[#9A9486] disabled:cursor-not-allowed"
        />
      </div>
      {showList && (
        // mousedown must not move focus off the input, or the blur handler would close the list before the click lands.
        <ul id={LISTBOX_ID} role="listbox" aria-label="Saved tags" onMouseDown={(event) => event.preventDefault()} className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-md border border-[#D9D3C7] bg-white py-1 shadow-lg">
          {options.map((option, index) => (
            <li
              key={`${option.create ? 'new' : 'saved'}-${option.tag}`}
              id={`${LISTBOX_ID}-${index}`}
              role="option"
              aria-selected={index === active}
              onClick={() => commit(option.tag)}
              className={`cursor-pointer px-3 py-1.5 text-sm text-[#2C3344] hover:bg-[#F5EDD6] ${index === active ? 'bg-[#F5EDD6]' : ''}`}
            >
              {option.create ? <>Create “<strong>{option.tag}</strong>”</> : <span className="capitalize">{option.tag}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
