// Local (this browser only) copies of unsaved editor changes, so a crash, a closed tab or a lost connection
// does not lose work. Storage can be blocked or full, so every call is wrapped and failure is silent.

export const DRAFT_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

/** One key per article, plus one for an article that has not been saved yet. */
const DRAFT_KEY_PREFIX = 'kj-draft:';
export const draftKey = (post) => `${DRAFT_KEY_PREFIX}${post ? post.id : 'new'}`;

export function saveDraft(storage, key, { form, baseUpdatedAt = null }, now = Date.now()) {
  try {
    storage.setItem(key, JSON.stringify({ form, baseUpdatedAt, savedAt: now }));
    return true;
  } catch (error) {
    return false;
  }
}

export function clearDraft(storage, key) {
  try {
    storage.removeItem(key);
  } catch (error) {
    // nothing to clean up if storage is unavailable
  }
}

/** Removes every stored article draft (used on sign-out so unpublished text does not linger on a shared computer). */
export function clearAllDrafts(storage) {
  try {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key && key.startsWith(DRAFT_KEY_PREFIX)) storage.removeItem(key);
    }
  } catch (error) {
    // storage unavailable: nothing was stored
  }
}

/** The stored draft, or null when there is none, it is corrupt, or it is older than 14 days. */
export function loadDraft(storage, key, now = Date.now()) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    const valid = draft && typeof draft === 'object' && draft.form && typeof draft.savedAt === 'number';
    if (!valid || now - draft.savedAt > DRAFT_MAX_AGE_MS) {
      clearDraft(storage, key);
      return null;
    }
    return { form: draft.form, baseUpdatedAt: draft.baseUpdatedAt ?? null, savedAt: draft.savedAt };
  } catch (error) {
    clearDraft(storage, key);
    return null;
  }
}

/**
 * Offer to restore only when the draft differs from what is on screen AND was made against the version now on
 * the server. If someone saved since, restoring would silently overwrite their work, so it is not offered.
 */
export function isRestorable(draft, currentForm, currentBaseUpdatedAt) {
  if (!draft) return false;
  if (JSON.stringify(draft.form) === JSON.stringify(currentForm)) return false;
  return (draft.baseUpdatedAt ?? null) === (currentBaseUpdatedAt ?? null);
}
