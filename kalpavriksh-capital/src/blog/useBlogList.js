import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchPosts } from './api';

export const FIRST_WINDOW = 11; // articles on first load
export const MORE_WINDOW = 6; // articles added by each "Load more"
const MAX_PAGES = 10;
const SEARCH_DEBOUNCE_MS = 350;

/** The slice of the list for window `index`: window 0 is the first 11, every later one the next 6. */
export function windowParams(index) {
  if (index === 0) return { offset: 0, limit: FIRST_WINDOW };
  return { offset: FIRST_WINDOW + (index - 1) * MORE_WINDOW, limit: MORE_WINDOW };
}

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const INITIAL = {
  status: 'loading', posts: [], featured: null, archive: [], categories: [], tags: [],
  total: 0, pages: 1, loadingMore: false, error: '',
};

/**
 * All state for the list page. Filters live in the URL (q, category, tag, sort, month, page), so a view
 * can be shared and survives a refresh. `page` means "show this many windows": opening ?page=3 loads the
 * first window and the next two, so nothing the reader had on screen is lost.
 */
export default function useBlogList() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const tag = params.get('tag') || '';
  const month = params.get('month') || '';
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const urlSearch = params.get('q') || '';
  const urlPage = Math.min(MAX_PAGES, Math.max(1, Number.parseInt(params.get('page'), 10) || 1));

  const [searchText, setSearchText] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);
  const [state, setState] = useState(INITIAL);
  const pageRef = useRef(urlPage);
  pageRef.current = urlPage;
  // Bumped on every reload. A "Load more" that finishes after the filters changed belongs to the old list and is dropped.
  const generation = useRef(0);

  const updateParams = useCallback(
    (changes) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, String(value));
            else next.delete(key);
          });
          return next;
        },
        { replace: true }
      ),
    [setParams]
  );

  // Keep the input in sync when the URL changes from outside (back/forward, header link).
  useEffect(() => {
    if (urlSearch !== debouncedSearch) setSearchText(urlSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);

  // Push the debounced search text into the URL (and back to the first window).
  useEffect(() => {
    if (debouncedSearch !== urlSearch) updateParams({ q: debouncedSearch, page: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const filters = { q: urlSearch, category, tag, sort, month };

  // Reload from the first window whenever a filter changes (the page param is read, not watched).
  useEffect(() => {
    const controller = new AbortController();
    generation.current += 1;
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    Promise.all(
      Array.from({ length: pageRef.current }, (_, index) =>
        fetchPosts({ q: urlSearch, category, tag, sort, month, ...windowParams(index) }, controller.signal)
      )
    )
      .then((results) => {
        const [first] = results;
        setState({
          status: 'ready',
          posts: results.flatMap((result) => result.posts),
          featured: first.featured || null,
          archive: first.archive || [],
          categories: first.categories || [],
          tags: first.tags || [],
          total: first.pagination.total,
          pages: results.length,
          loadingMore: false,
          error: '',
        });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState((current) => ({ ...current, status: 'error', loadingMore: false, error: error.message }));
      });
    return () => controller.abort();
  }, [urlSearch, category, tag, sort, month]);

  const loadMore = useCallback(async () => {
    if (state.loadingMore) return;
    const started = generation.current;
    setState((current) => ({ ...current, loadingMore: true, error: '' }));
    try {
      const data = await fetchPosts({ ...filters, ...windowParams(state.pages) });
      if (generation.current !== started) return;
      setState((current) => {
        const seen = new Set(current.posts.map((post) => post.id));
        const fresh = data.posts.filter((post) => !seen.has(post.id));
        return { ...current, posts: [...current.posts, ...fresh], total: data.pagination.total, pages: current.pages + 1, loadingMore: false };
      });
      updateParams({ page: state.pages + 1 });
    } catch (error) {
      if (generation.current !== started) return;
      setState((current) => ({ ...current, loadingMore: false, error: error.message }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loadingMore, state.pages, urlSearch, category, tag, sort, month, updateParams]);

  /** href for the crawlable "Load more" link: the same view, one window further. */
  const nextPageHref = () => {
    const next = new URLSearchParams(params);
    next.set('page', String(state.pages + 1));
    return `/blogs?${next.toString()}`;
  };

  const filtered = Boolean(urlSearch || category || tag || month);

  return {
    ...state,
    filters,
    filtered,
    hasMore: state.status === 'ready' && state.posts.length < state.total,
    searchText,
    setSearchText,
    setFilter: (changes) => updateParams({ ...changes, page: '' }),
    clearFilters: () => {
      setSearchText('');
      updateParams({ category: '', tag: '', q: '', month: '', page: '' });
    },
    loadMore,
    nextPageHref,
  };
}
