import { DRAFT_MAX_AGE_MS, clearAllDrafts, clearDraft, draftKey, isRestorable, loadDraft, saveDraft } from './draftStorage';

const memoryStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
};

const FORM = { title: 'Draft', content: 'Body' };
const NOW = 1_800_000_000_000;

test('keys are per article, with a separate key for a new one', () => {
  expect(draftKey({ id: 7 })).toBe('kj-draft:7');
  expect(draftKey(null)).toBe('kj-draft:new');
});

test('saves and loads a draft with its base version and save time', () => {
  const storage = memoryStorage();
  expect(saveDraft(storage, 'k', { form: FORM, baseUpdatedAt: 'v1' }, NOW)).toBe(true);
  expect(loadDraft(storage, 'k', NOW + 1000)).toEqual({ form: FORM, baseUpdatedAt: 'v1', savedAt: NOW });
});

test('a draft older than 14 days is discarded', () => {
  const storage = memoryStorage();
  saveDraft(storage, 'k', { form: FORM, baseUpdatedAt: null }, NOW);
  expect(loadDraft(storage, 'k', NOW + DRAFT_MAX_AGE_MS + 1)).toBeNull();
  expect(storage.getItem('k')).toBeNull();
});

test('corrupt data is ignored and cleaned up', () => {
  const storage = memoryStorage();
  storage.setItem('k', '{not json');
  expect(loadDraft(storage, 'k', NOW)).toBeNull();
  expect(storage.getItem('k')).toBeNull();
  storage.setItem('k', JSON.stringify({ nope: true }));
  expect(loadDraft(storage, 'k', NOW)).toBeNull();
});

test('clearDraft removes it', () => {
  const storage = memoryStorage();
  saveDraft(storage, 'k', { form: FORM, baseUpdatedAt: null }, NOW);
  clearDraft(storage, 'k');
  expect(loadDraft(storage, 'k', NOW)).toBeNull();
});

test('blocked or full storage never throws', () => {
  const broken = {
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('blocked'); },
  };
  expect(saveDraft(broken, 'k', { form: FORM }, NOW)).toBe(false);
  expect(loadDraft(broken, 'k', NOW)).toBeNull();
  expect(() => clearDraft(broken, 'k')).not.toThrow();
  expect(saveDraft(null, 'k', { form: FORM }, NOW)).toBe(false);
});

test('a draft is restorable only when it differs and was made against the version now on the server', () => {
  const draft = { form: { ...FORM, title: 'Edited' }, baseUpdatedAt: 'v1', savedAt: NOW };
  expect(isRestorable(draft, FORM, 'v1')).toBe(true);
  expect(isRestorable(draft, { ...FORM, title: 'Edited' }, 'v1')).toBe(false); // nothing to restore
  expect(isRestorable(draft, FORM, 'v2')).toBe(false); // someone saved since: do not clobber it
  expect(isRestorable(null, FORM, 'v1')).toBe(false);
});

test('a draft of a new article (no server version) is restorable', () => {
  const draft = { form: { ...FORM, title: 'Edited' }, baseUpdatedAt: null, savedAt: NOW };
  expect(isRestorable(draft, FORM, undefined)).toBe(true);
});

test('clearAllDrafts removes every article draft but nothing else, e.g. on sign-out', () => {
  const data = { 'kj-draft:1': 'a', 'kj-draft:new': 'b', other: 'keep me' };
  const storage = {
    get length() { return Object.keys(data).length; },
    key: (index) => Object.keys(data)[index] ?? null,
    removeItem: (key) => { delete data[key]; },
  };
  clearAllDrafts(storage);
  expect(data).toEqual({ other: 'keep me' });
  expect(() => clearAllDrafts(null)).not.toThrow();
  expect(() => clearAllDrafts({ get length() { throw new Error('blocked'); } })).not.toThrow();
});
