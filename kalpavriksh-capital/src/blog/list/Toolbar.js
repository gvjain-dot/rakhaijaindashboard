import React from 'react';
import { monthName } from '../format';

function SearchBox({ value, onChange }) {
  return (
    <div className="kj-search">
      <label htmlFor="blog-search" className="kj-sr">Search articles</label>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id="blog-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by title or topic"
        maxLength={100}
      />
      {value && (
        <button type="button" className="kj-search__clear" onClick={() => onChange('')} aria-label="Clear search">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** "12 articles in Retirement tagged #risk matching “tax” from March 2026". */
function ResultSummary({ total, filters }) {
  const [year, month] = filters.month ? filters.month.split('-') : [];
  return (
    <p className="kj-count" aria-live="polite">
      {total} {total === 1 ? 'article' : 'articles'}
      {filters.category && <> in <strong>{filters.category}</strong></>}
      {filters.tag && <> tagged <strong>#{filters.tag}</strong></>}
      {filters.q && <> matching <strong>“{filters.q}”</strong></>}
      {filters.month && <> from <strong>{monthName(month)} {year}</strong></>}
    </p>
  );
}

/** Popular tag chips. Clicking the active tag again removes the filter. */
function TagBar({ tags, active, onSelect }) {
  const shown = active && !tags.includes(active) ? [active, ...tags] : tags;
  if (shown.length === 0) return null;
  return (
    <div className="kj-active" role="group" aria-label="Filter by tag">
      <span className="kj-label">Popular tags</span>
      {shown.map((tag) => (
        <button
          key={tag}
          type="button"
          className="kj-chip kj-chip--tag"
          aria-pressed={active === tag}
          onClick={() => onSelect(active === tag ? '' : tag)}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}

/** Search, sort, result count and tag filters. */
export default function Toolbar({ list }) {
  const { filters, filtered, status, total, tags, searchText, setSearchText, setFilter, clearFilters } = list;
  return (
    <>
      <div className="kj-tools">
        <SearchBox value={searchText} onChange={setSearchText} />
        <div className="kj-tools__right">
          {status === 'ready' && <ResultSummary total={total} filters={filters} />}
          <div className="kj-sort">
            <label htmlFor="blog-sort">Sort</label>
            <select id="blog-sort" aria-label="Sort articles" value={filters.sort} onChange={(event) => setFilter({ sort: event.target.value === 'oldest' ? 'oldest' : '' })}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          {filtered && (
            <button type="button" className="kj-clear" onClick={clearFilters}>Clear filters</button>
          )}
        </div>
      </div>
      <TagBar tags={tags} active={filters.tag} onSelect={(value) => setFilter({ tag: value })} />
    </>
  );
}
