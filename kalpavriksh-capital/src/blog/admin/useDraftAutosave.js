import { useCallback, useEffect, useRef, useState } from 'react';
import { ConflictError, UnauthorizedError, updatePost } from '../api';
import { clearDraft, draftKey, isRestorable, loadDraft, saveDraft } from './draftStorage';

export const LOCAL_SAVE_DELAY_MS = 2000;
export const SERVER_SAVE_DELAY_MS = 30000;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null; // blocked (private mode, site data disabled): autosave simply does not run
  }
}

/** Enough of the form to pass the server's checks; otherwise an autosave would only produce an error. */
function isSavable(form) {
  const hasBody = String(form.content || '').trim() !== '' || String(form.external_url || '').trim() !== '';
  return String(form.title || '').trim() !== '' && String(form.excerpt || '').trim() !== '' && SLUG_PATTERN.test(form.slug || '') && hasBody;
}

/**
 * Protects unsaved editor work in two layers:
 *  1. a local copy in this browser, 2 seconds after the last edit, with an offer to restore it next time;
 *  2. for an existing, unpublished article only, a save to the server 30 seconds after the last edit.
 * Published articles are never autosaved to the server, because that would change what readers see.
 * The server save sends `base_updated_at`, so it cannot silently overwrite a newer version saved elsewhere.
 */
export default function useDraftAutosave({ post, form, dirty, token, baseUpdatedAt, onRestore, onServerSaved, onConflict, onUnauthorized }) {
  const key = draftKey(post);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle', at: null });
  // After an edit conflict, stop asking until the article has a new server version (a save or an overwrite).
  const [conflicted, setConflicted] = useState(false);
  const latest = useRef({ form, baseUpdatedAt });
  latest.current = { form, baseUpdatedAt };

  // On opening the editor, offer a stored copy if there is one worth restoring.
  useEffect(() => {
    const storage = getStorage();
    if (!storage) return;
    const draft = loadDraft(storage, key);
    if (isRestorable(draft, latest.current.form, latest.current.baseUpdatedAt)) setPendingDraft(draft);
    else if (draft) clearDraft(storage, key); // identical, or made against a version that has since changed
  }, [key]);

  // Layer 1: local copy. Held back while the restore offer is open so it cannot overwrite the copy on offer.
  useEffect(() => {
    if (!dirty || pendingDraft) return undefined;
    const timer = setTimeout(() => {
      const storage = getStorage();
      if (storage && saveDraft(storage, key, { form, baseUpdatedAt })) setStatus({ kind: 'local', at: Date.now() });
    }, LOCAL_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [form, dirty, baseUpdatedAt, key, pendingDraft]);

  useEffect(() => setConflicted(false), [baseUpdatedAt]);

  // Layer 2: server copy. Only for an article that is NOT live on the site, judged by the saved article and not
  // by the editor's Published switch: flipping that switch off must never unpublish a live article by itself.
  const canSaveToServer = Boolean(post) && !post.published && !form.published;
  useEffect(() => {
    if (!canSaveToServer || !dirty || pendingDraft || conflicted) return undefined;
    const timer = setTimeout(async () => {
      const current = latest.current;
      if (!isSavable(current.form)) return;
      try {
        const data = await updatePost(token, post.id, { ...current.form, base_updated_at: current.baseUpdatedAt });
        const storage = getStorage();
        if (storage) clearDraft(storage, key); // the server copy is now current
        onServerSaved(current.form, data.post.updated_at);
        setStatus({ kind: 'server', at: Date.now() });
      } catch (error) {
        if (error instanceof UnauthorizedError) onUnauthorized();
        else if (error instanceof ConflictError) {
          setConflicted(true);
          onConflict();
        }
        else setStatus({ kind: 'failed', at: Date.now() });
      }
    }, SERVER_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, dirty, canSaveToServer, pendingDraft, conflicted, token, key]);

  const restore = useCallback(() => {
    if (!pendingDraft) return;
    onRestore(pendingDraft.form);
    setPendingDraft(null);
  }, [pendingDraft, onRestore]);

  const discard = useCallback(() => {
    const storage = getStorage();
    if (storage) clearDraft(storage, key);
    setPendingDraft(null);
  }, [key]);

  /** Call after a successful manual save: the stored copy is obsolete. */
  const clearStored = useCallback(() => {
    const storage = getStorage();
    if (storage) clearDraft(storage, key);
  }, [key]);

  return { pendingDraft, status, restore, discard, clearStored };
}
