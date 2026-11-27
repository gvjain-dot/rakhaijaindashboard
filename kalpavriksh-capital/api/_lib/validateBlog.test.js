const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePost } = require('./validate');
const { validateListQuery, validateBulk, MAX_BULK_IDS } = require('./validateBlog');

const base = { title: 'T', excerpt: 'E', content: 'Body' };

// --- post fields: featured + author ---------------------------------------------------------------
test('featured defaults to false and only true enables it', () => {
  assert.equal(validatePost(base).value.featured, false);
  assert.equal(validatePost({ ...base, featured: 'yes' }).value.featured, false);
  assert.equal(validatePost({ ...base, featured: true }).value.featured, true);
});

test('author name and bio are optional, trimmed, and length limited', () => {
  const ok = validatePost({ ...base, author_name: '  Jane Doe ', author_bio: 'Writes.' });
  assert.equal(ok.value.author_name, 'Jane Doe');
  assert.equal(ok.value.author_bio, 'Writes.');
  assert.equal(validatePost(base).value.author_name, null);
  assert.ok(validatePost({ ...base, author_name: 'x'.repeat(81) }).errors);
  assert.ok(validatePost({ ...base, author_bio: 'x'.repeat(501) }).errors);
});

// --- list query ------------------------------------------------------------------------------------
test('list query falls back to safe defaults', () => {
  assert.deepEqual(validateListQuery({}), { sort: 'newest', month: null, offset: null, featuredOnly: false });
});

test('sort accepts only newest or oldest', () => {
  assert.equal(validateListQuery({ sort: 'oldest' }).sort, 'oldest');
  assert.equal(validateListQuery({ sort: 'DROP TABLE' }).sort, 'newest');
  assert.equal(validateListQuery({ sort: ['oldest'] }).sort, 'newest');
});

test('month must be YYYY-MM with a real month', () => {
  assert.equal(validateListQuery({ month: '2026-03' }).month, '2026-03');
  assert.equal(validateListQuery({ month: '2026-13' }).month, null);
  assert.equal(validateListQuery({ month: '2026-3' }).month, null);
  assert.equal(validateListQuery({ month: "2026-03'; --" }).month, null);
});

test('offset is a bounded non-negative integer or null', () => {
  assert.equal(validateListQuery({ offset: '11' }).offset, 11);
  assert.equal(validateListQuery({ offset: '0' }).offset, 0);
  assert.equal(validateListQuery({ offset: '-4' }).offset, null);
  assert.equal(validateListQuery({ offset: 'abc' }).offset, null);
  assert.equal(validateListQuery({ offset: '99999999' }).offset, 10000);
});

test('featured=1 asks for the featured post only', () => {
  assert.equal(validateListQuery({ featured: '1' }).featuredOnly, true);
  assert.equal(validateListQuery({ featured: '0' }).featuredOnly, false);
});

// --- bulk -----------------------------------------------------------------------------------------
test('bulk accepts known actions and de-duplicated positive ids', () => {
  const result = validateBulk({ action: 'publish', ids: [3, 3, '4', 5] });
  assert.deepEqual(result.value, { action: 'publish', ids: [3, 4, 5] });
});

test('bulk rejects unknown actions, bad ids, empty and oversized lists', () => {
  assert.ok(validateBulk({ action: 'nuke', ids: [1] }).error);
  assert.ok(validateBulk({ action: 'delete', ids: [] }).error);
  assert.ok(validateBulk({ action: 'delete', ids: [0, -1] }).error);
  assert.ok(validateBulk({ action: 'delete', ids: ['x'] }).error);
  assert.ok(validateBulk({ action: 'delete', ids: 'all' }).error);
  assert.ok(validateBulk({ action: 'delete', ids: Array.from({ length: MAX_BULK_IDS + 1 }, (_, i) => i + 1) }).error);
  assert.ok(validateBulk(null).error);
});

test('bulk feature allows exactly one id (only one post can be featured)', () => {
  assert.ok(validateBulk({ action: 'feature', ids: [1, 2] }).error);
  assert.deepEqual(validateBulk({ action: 'feature', ids: [1] }).value, { action: 'feature', ids: [1] });
});

test('bulk ids must fit a Postgres integer', () => {
  assert.ok(validateBulk({ action: 'delete', ids: [2147483648] }).error);
  assert.deepEqual(validateBulk({ action: 'delete', ids: [2147483647] }).value, { action: 'delete', ids: [2147483647] });
});
