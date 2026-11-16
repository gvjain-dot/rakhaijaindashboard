import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BlogLayout from './BlogLayout';
import PostCard from './PostCard';
import useDocumentMeta from './useDocumentMeta';
import { fetchPosts } from './api';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 9;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function CategoryChips({ categories, active, onSelect }) {
  if (categories.length === 0) return null;
  const chip = (label, value) => (
    <button
      key={label}
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active === value}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active === value ? 'bg-[#1E5631] text-white' : 'bg-white text-[#1E5631] ring-1 ring-[#1E5631]/20 hover:bg-[#1E5631]/10'
      }`}
    >
      {label}
    </button>
  );
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filter by category">
      {chip('All', '')}
      {categories.map((category) => chip(category, category))}
    </div>
  );
}

function Pagination({ page, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  const buttonClass =
    'rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1E5631] ring-1 ring-[#1E5631]/20 disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Pagination">
      <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>← Previous</button>
      <span className="text-sm text-gray-600">Page {page} of {pages}</span>
      <button type="button" className={buttonClass} disabled={page >= pages} onClick={() => onChange(page + 1)}>Next →</button>
    </nav>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
      ))}
    </div>
  );
}

export default function BlogList() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  const urlSearch = params.get('q') || '';

  const [searchText, setSearchText] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);
  const [state, setState] = useState({ status: 'loading', posts: [], categories: [], total: 0, error: '' });

  useDocumentMeta({
    title: 'Insights & Articles | Kalpvriksh Global',
    description: 'Articles on personal finance, investing and wealth building by Rakhi Jain, Chartered Accountant.',
  });

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, String(value));
      else next.delete(key);
    });
    setParams(next, { replace: true });
  };

  // Keep the input in sync when the URL changes from outside (back/forward, header link).
  useEffect(() => {
    if (urlSearch !== debouncedSearch) setSearchText(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  // Push the debounced search text into the URL (and back to page 1).
  useEffect(() => {
    if (debouncedSearch !== urlSearch) updateParams({ q: debouncedSearch, page: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    fetchPosts({ q: urlSearch, category, page, limit: PAGE_SIZE }, controller.signal)
      .then((data) =>
        setState({ status: 'ready', posts: data.posts, categories: data.categories, total: data.pagination.total, error: '' })
      )
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState((current) => ({ ...current, status: 'error', error: error.message }));
      });
    return () => controller.abort();
  }, [urlSearch, category, page]);

  const { status, posts, categories, total, error } = state;

  return (
    <BlogLayout>
      <section className="bg-gradient-to-br from-[#1E5631] to-[#2d7a47] px-4 py-12 text-center text-white sm:py-16">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Insights &amp; Articles</h1>
        <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-[#C4A747]" />
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
          Timeless lessons on wealth building and financial independence
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block w-full md:max-w-sm">
            <span className="sr-only">Search articles</span>
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search articles…"
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-[#1E5631] focus:ring-2 focus:ring-[#1E5631]/20"
            />
          </label>
          <CategoryChips categories={categories} active={category} onSelect={(value) => updateParams({ category: value, page: '' })} />
        </div>

        {status === 'loading' && <SkeletonGrid />}

        {status === 'error' && (
          <div role="alert" className="rounded-xl bg-white p-8 text-center ring-1 ring-red-200">
            <p className="font-semibold text-red-700">We couldn't load the articles.</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-[#1E5631] px-5 py-2 text-sm font-semibold text-white">
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && posts.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="text-lg font-semibold text-[#1E5631]">No articles found</p>
            <p className="mt-1 text-sm text-gray-600">Try a different search or category.</p>
            {page > 1 && total > 0 && (
              <button type="button" onClick={() => updateParams({ page: '' })} className="mt-4 rounded-lg bg-[#1E5631] px-5 py-2 text-sm font-semibold text-white">
                Go to the first page
              </button>
            )}
          </div>
        )}

        {status === 'ready' && posts.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination page={page} total={total} onChange={(next) => { updateParams({ page: next > 1 ? next : '' }); window.scrollTo({ top: 0 }); }} />
          </>
        )}

        <p className="mt-12 text-center text-sm text-gray-600">
          Looking for book notes?{' '}
          <Link to="/?page=book-summaries" className="font-semibold text-[#1E5631] underline-offset-4 hover:underline">
            Read our Book Summaries
          </Link>
        </p>
      </div>
    </BlogLayout>
  );
}
