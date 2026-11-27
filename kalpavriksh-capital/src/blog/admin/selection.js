// Pure helpers for the post list's bulk-select checkboxes. Selections are plain arrays of post ids and are
// never mutated: every function returns a new array.

/** Adds `id` when it is not selected, removes it when it is. */
export const toggleId = (selected, id) => (selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);

/** True when every id in `visibleIds` is selected (and there is at least one), i.e. "select all" is on. */
export const allSelected = (selected, visibleIds) => visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

/** Keeps only the selected ids that still exist in `visibleIds` (after a delete, filter or search). */
export const pruneSelection = (selected, visibleIds) => selected.filter((id) => visibleIds.includes(id));
