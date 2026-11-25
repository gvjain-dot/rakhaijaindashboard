import React, { useRef } from 'react';

const TABS = [
  { id: 'article', label: 'Article' },
  { id: 'seo', label: 'SEO' },
];

/** "Article" and "SEO" tabs above the editor. The SEO tab shows how many checklist items still need work. */
export default function EditorTabs({ section, onChange, seoIssues }) {
  const refs = useRef({});

  // Arrow keys, Home and End move between tabs, as the ARIA tabs pattern expects.
  const onKeyDown = (event) => {
    const index = TABS.findIndex((tab) => tab.id === section);
    const jumps = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 };
    if (!(event.key in jumps)) return;
    event.preventDefault();
    const next = TABS[(jumps[event.key] + TABS.length) % TABS.length].id;
    onChange(next);
    if (refs.current[next]) refs.current[next].focus();
  };

  return (
    <div role="tablist" aria-label="Editor sections" onKeyDown={onKeyDown} className="flex gap-1 border-b border-[#E2DDD4]">
      {TABS.map(({ id, label }) => {
        const selected = section === id;
        return (
          <button
            key={id}
            ref={(node) => { refs.current[id] = node; }}
            type="button"
            role="tab"
            tabIndex={selected ? 0 : -1}
            id={`editor-tab-${id}`}
            aria-selected={selected}
            aria-label={id === 'seo' && seoIssues > 0 ? `SEO, ${seoIssues} ${seoIssues === 1 ? 'item' : 'items'} to improve` : undefined}
            aria-controls={`editor-panel-${id}`}
            onClick={() => onChange(id)}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
              selected ? 'border-[#C4A747] text-[#1E5631]' : 'border-transparent text-[#6B7280] hover:text-[#1E5631]'
            }`}
          >
            {label}
            {id === 'seo' && seoIssues > 0 && (
              <span className="rounded-full bg-[#F5EDD6] px-2 py-0.5 text-[11px] text-[#7A5F0E]" aria-hidden="true">{seoIssues}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
