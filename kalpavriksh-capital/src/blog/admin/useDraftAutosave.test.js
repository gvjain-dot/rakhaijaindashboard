import React from 'react';
import { render, act } from '@testing-library/react';
import useDraftAutosave, { LOCAL_SAVE_DELAY_MS, SERVER_SAVE_DELAY_MS } from './useDraftAutosave';
import { loadDraft } from './draftStorage';
import { updatePost, ConflictError, UnauthorizedError } from '../api';

jest.mock('../api', () => ({
  updatePost: jest.fn(),
  UnauthorizedError: class UnauthorizedError extends Error {},
  ConflictError: class ConflictError extends Error {},
}));

const FORM = { title: 'Saved title', slug: 'saved-title', excerpt: 'An excerpt', content: 'Body text', external_url: '', published: false };
const EDITED = { ...FORM, title: 'Edited title' };
const POST = { id: 7, slug: 'saved-title', updated_at: 'v1' };

let hook;
function Probe(props) {
  hook = useDraftAutosave(props);
  return null;
}

const setup = (overrides = {}) => {
  const handlers = { onRestore: jest.fn(), onServerSaved: jest.fn(), onConflict: jest.fn(), onUnauthorized: jest.fn() };
  const props = { post: POST, form: FORM, dirty: false, token: 't', baseUpdatedAt: 'v1', ...handlers, ...overrides };
  const view = render(<Probe {...props} />);
  const update = (changes) => view.rerender(<Probe {...props} {...changes} />);
  return { handlers, update, unmount: view.unmount };
};
const advance = async (ms) => act(async () => { jest.advanceTimersByTime(ms); });

beforeEach(() => {
  jest.useFakeTimers();
  window.localStorage.clear();
  updatePost.mockReset();
  updatePost.mockResolvedValue({ post: { id: 7, slug: 'saved-title', updated_at: 'v2' } });
});
afterEach(() => jest.useRealTimers());

// --- local copy ------------------------------------------------------------------------------------
test('saves a local copy 2 seconds after an edit, not before, and never when nothing changed', async () => {
  const { update } = setup();
  await advance(LOCAL_SAVE_DELAY_MS * 3);
  expect(loadDraft(window.localStorage, 'kj-draft:7')).toBeNull();

  update({ form: EDITED, dirty: true });
  await advance(LOCAL_SAVE_DELAY_MS - 1);
  expect(loadDraft(window.localStorage, 'kj-draft:7')).toBeNull();
  await advance(1);
  expect(loadDraft(window.localStorage, 'kj-draft:7')).toEqual(expect.objectContaining({ form: EDITED, baseUpdatedAt: 'v1' }));
  expect(hook.status.kind).toBe('local');
});

test('a new article is kept under its own key', async () => {
  const { update } = setup({ post: null, baseUpdatedAt: null });
  update({ form: EDITED, dirty: true });
  await advance(LOCAL_SAVE_DELAY_MS);
  expect(loadDraft(window.localStorage, 'kj-draft:new')).toEqual(expect.objectContaining({ form: EDITED }));
});

// --- restore ---------------------------------------------------------------------------------------
const storeDraft = (form, baseUpdatedAt) =>
  window.localStorage.setItem('kj-draft:7', JSON.stringify({ form, baseUpdatedAt, savedAt: Date.now() }));

test('offers to restore a stored copy made against the same server version', () => {
  storeDraft(EDITED, 'v1');
  const { handlers } = setup();
  expect(hook.pendingDraft.form).toEqual(EDITED);
  act(() => hook.restore());
  expect(handlers.onRestore).toHaveBeenCalledWith(EDITED);
  expect(hook.pendingDraft).toBeNull();
});

test('discarding the offer deletes the stored copy', () => {
  storeDraft(EDITED, 'v1');
  setup();
  act(() => hook.discard());
  expect(hook.pendingDraft).toBeNull();
  expect(loadDraft(window.localStorage, 'kj-draft:7')).toBeNull();
});

test('does not offer a copy made against an older server version, so a newer save is never clobbered', () => {
  storeDraft(EDITED, 'v0');
  setup();
  expect(hook.pendingDraft).toBeNull();
});

test('does not offer a copy identical to what is on screen', () => {
  storeDraft(FORM, 'v1');
  setup();
  expect(hook.pendingDraft).toBeNull();
});

test('while the restore offer is open, new edits do not overwrite the stored copy', async () => {
  storeDraft(EDITED, 'v1');
  const { update } = setup();
  update({ form: { ...FORM, title: 'Something else' }, dirty: true });
  await advance(LOCAL_SAVE_DELAY_MS * 2);
  expect(loadDraft(window.localStorage, 'kj-draft:7').form).toEqual(EDITED);
});

// --- server autosave -------------------------------------------------------------------------------
test('saves an existing unpublished draft to the server 30 seconds after the last edit', async () => {
  const { update, handlers } = setup();
  update({ form: EDITED, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS - 1);
  expect(updatePost).not.toHaveBeenCalled();
  await advance(1);
  expect(updatePost).toHaveBeenCalledWith('t', 7, { ...EDITED, base_updated_at: 'v1' });
  expect(handlers.onServerSaved).toHaveBeenCalledWith(EDITED, 'v2');
  expect(hook.status.kind).toBe('server');
  expect(loadDraft(window.localStorage, 'kj-draft:7')).toBeNull(); // the server copy is current
});

test('typing again restarts the 30 second wait', async () => {
  const { update } = setup();
  update({ form: EDITED, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS - 1000);
  update({ form: { ...EDITED, content: 'More text' }, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS - 1000);
  expect(updatePost).not.toHaveBeenCalled();
  await advance(1000);
  expect(updatePost).toHaveBeenCalledTimes(1);
});

test('never autosaves to the server for published articles, new articles, unchanged or invalid forms', async () => {
  const cases = [
    { form: { ...EDITED, published: true }, dirty: true },
    { post: null, baseUpdatedAt: null, form: EDITED, dirty: true },
    { form: FORM, dirty: false },
    { form: { ...EDITED, title: '  ' }, dirty: true },
    { form: { ...EDITED, slug: 'Not A Slug' }, dirty: true },
    { form: { ...EDITED, content: '' }, dirty: true },
  ];
  for (const changes of cases) {
    const { update, unmount } = setup();
    update(changes);
    await advance(SERVER_SAVE_DELAY_MS * 2);
    unmount();
  }
  expect(updatePost).not.toHaveBeenCalled();
});

test('an unpublished link-out article may have no body text', async () => {
  const { update } = setup();
  update({ form: { ...EDITED, content: '', external_url: 'https://example.com/x' }, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS);
  expect(updatePost).toHaveBeenCalledTimes(1);
});

test('an edit conflict is reported, and the local copy is kept', async () => {
  updatePost.mockRejectedValue(new ConflictError('changed elsewhere'));
  const { update, handlers } = setup();
  update({ form: EDITED, dirty: true });
  await advance(LOCAL_SAVE_DELAY_MS);
  await advance(SERVER_SAVE_DELAY_MS);
  expect(handlers.onConflict).toHaveBeenCalledTimes(1);
  expect(handlers.onServerSaved).not.toHaveBeenCalled();
  expect(loadDraft(window.localStorage, 'kj-draft:7')).not.toBeNull();
});

test('an expired session is handed to the admin shell', async () => {
  updatePost.mockRejectedValue(new UnauthorizedError('expired'));
  const { update, handlers } = setup();
  update({ form: EDITED, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS);
  expect(handlers.onUnauthorized).toHaveBeenCalledTimes(1);
});

test('any other failure shows a failed status and keeps the local copy', async () => {
  updatePost.mockRejectedValue(new Error('network'));
  const { update } = setup();
  update({ form: EDITED, dirty: true });
  await advance(LOCAL_SAVE_DELAY_MS);
  await advance(SERVER_SAVE_DELAY_MS);
  expect(hook.status.kind).toBe('failed');
  expect(loadDraft(window.localStorage, 'kj-draft:7')).not.toBeNull();
});

test('leaving the editor cancels a pending autosave', async () => {
  const { update, unmount } = setup();
  update({ form: EDITED, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS - 1);
  unmount();
  await advance(SERVER_SAVE_DELAY_MS);
  expect(updatePost).not.toHaveBeenCalled();
});

test('never autosaves an article that is live on the site, even if the Published switch was flipped off in the editor', async () => {
  const { update } = setup({ post: { ...POST, published: true } });
  update({ form: { ...EDITED, published: false }, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS * 2);
  expect(updatePost).not.toHaveBeenCalled();
});

test('after a conflict, autosave stops asking instead of reopening the dialog every 30 seconds', async () => {
  updatePost.mockRejectedValue(new ConflictError('changed elsewhere'));
  const { update, handlers } = setup();
  update({ form: EDITED, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS);
  update({ form: { ...EDITED, content: 'More text' }, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS);
  expect(updatePost).toHaveBeenCalledTimes(1);
  expect(handlers.onConflict).toHaveBeenCalledTimes(1);
});

test('autosave resumes once the article has a new server version (after a save or an overwrite)', async () => {
  updatePost.mockRejectedValueOnce(new ConflictError('changed elsewhere')).mockResolvedValue({ post: { id: 7, slug: 'saved-title', updated_at: 'v3' } });
  const { update } = setup();
  update({ form: EDITED, dirty: true });
  await advance(SERVER_SAVE_DELAY_MS);
  update({ form: { ...EDITED, content: 'More text' }, dirty: true, baseUpdatedAt: 'v9' });
  await advance(SERVER_SAVE_DELAY_MS);
  expect(updatePost).toHaveBeenCalledTimes(2);
});
