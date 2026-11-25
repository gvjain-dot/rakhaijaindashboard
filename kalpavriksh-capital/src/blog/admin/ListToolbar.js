import React from 'react';
import { SORTS } from './postFilters';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'draft', label: 'Drafts' },
];
const CONTROL = 'rounded-md border border-[#D9D3C7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#C4A747]/40';

/** Status tabs, search, category and sort controls for the article list. */
export default function ListToolbar({ view, onChange, counts, categories, searchRef }) {
  return (
    <div className="mb-4 space-y-3">
      <div role="group" aria-label="Filter articles" className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={view.status === id}
            onClick={() => onChange({ status: id })}
            className={`rounded-md border px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
              view.status === id ? 'border-[#1E5631] bg-[#1E5631] text-white' : 'border-[#E2DDD4] bg-white text-[#1E5631] hover:border-[#C4A747] hover:bg-[#F5EDD6]'
            }`}
          >
            {label} <span className="opacity-70">{counts[id]}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_14rem_12rem]">
        <input
          ref={searchRef}
          type="search"
          value={view.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Search by title, category or excerpt…  ( / )"
          aria-label="Search articles"
          className={`${CONTROL} sm:col-span-2 lg:col-span-1`}
        />
        <select aria-label="Filter by category" value={view.category} onChange={(event) => onChange({ category: event.target.value })} className={CONTROL}>
          <option value="">All categories</option>
          {categories.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select aria-label="Sort articles" value={view.sort} onChange={(event) => onChange({ sort: event.target.value })} className={CONTROL}>
          {SORTS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
    </div>
  );
}
