import { useCallback, useEffect, useState } from 'react';
import { fetchTaxonomy, UnauthorizedError } from '../api';

const EMPTY = { categories: [], tags: [] };

/** Merges name lists into one sorted list without repeats (ignoring case differences). */
export function mergeNames(...lists) {
  const byLowerCase = new Map();
  lists.flat().forEach((name) => {
    if (name && !byLowerCase.has(name.toLowerCase())) byLowerCase.set(name.toLowerCase(), name);
  });
  return [...byLowerCase.values()].sort((a, b) => a.localeCompare(b));
}

/**
 * The saved category and tag names (from the Categories & tags tab) for the article editor's dropdowns.
 * `refresh()` reloads them after the tab changes something. A failed load leaves the list empty, so the editor
 * falls back to names taken from existing articles.
 */
export default function useTaxonomyNames(token, onUnauthorized) {
  const [names, setNames] = useState(EMPTY);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchTaxonomy(token);
      setNames({ categories: data.categories.map((item) => item.name), tags: data.tags.map((item) => item.name) });
    } catch (caught) {
      if (caught instanceof UnauthorizedError) onUnauthorized();
    }
  }, [token, onUnauthorized]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { names, refresh };
}
