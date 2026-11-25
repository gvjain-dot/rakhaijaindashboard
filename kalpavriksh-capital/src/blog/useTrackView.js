import { useEffect } from 'react';
import { trackView } from './api';

export const VIEW_DELAY_MS = 3000;

/**
 * Counts one read of `slug` after the reader has stayed on the page for a few seconds with the tab visible.
 * Skipped while `enabled` is false (still loading, a private preview, a missing article). Leaving early
 * cancels it. The server dedupes per visitor per day and ignores bots, so this only has to be polite.
 */
export default function useTrackView(slug, enabled) {
  useEffect(() => {
    if (!enabled || !slug) return undefined;
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible') trackView(slug);
    }, VIEW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [slug, enabled]);
}
