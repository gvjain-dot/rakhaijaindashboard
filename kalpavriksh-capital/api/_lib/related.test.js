const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreRelated, fillRelated, EDITORS_PICK } = require('./related');

const post = { id: 1, category: 'Investing', tags: ['risk', 'tax'] };
const cand = (id, extra = {}) => ({ id, slug: `p-${id}`, category: null, tags: [], published_at: '2025-01-01T00:00:00Z', ...extra });

test('scores same category +5 and each shared tag +2, highest first', () => {
  const result = scoreRelated(post, [
    cand(2, { category: 'Investing' }), // 5
    cand(3, { tags: ['risk', 'tax'] }), // 4
    cand(4, { category: 'Investing', tags: ['risk'] }), // 7
  ]);
  assert.deepEqual(result.map((p) => p.id), [4, 2, 3]);
});

test('never returns the post itself or unrelated posts', () => {
  const result = scoreRelated(post, [cand(1, { category: 'Investing' }), cand(2, { category: 'Other', tags: ['x'] })]);
  assert.deepEqual(result, []);
});

test('ties break by newest published_at, then highest id', () => {
  const result = scoreRelated(post, [
    cand(2, { category: 'Investing', published_at: '2024-01-01T00:00:00Z' }),
    cand(3, { category: 'Investing', published_at: '2025-06-01T00:00:00Z' }),
    cand(4, { category: 'Investing', published_at: '2025-06-01T00:00:00Z' }),
  ]);
  assert.deepEqual(result.map((p) => p.id), [4, 3, 2]);
});

test('limits the result (default 3)', () => {
  const many = [2, 3, 4, 5, 6].map((id) => cand(id, { category: 'Investing' }));
  assert.equal(scoreRelated(post, many).length, 3);
  assert.equal(scoreRelated(post, many, 2).length, 2);
});

test('adds a human-readable reason', () => {
  // scores: both = 7, category only = 5, tags only = 4
  const [both, categoryOnly, tagsOnly] = scoreRelated(post, [
    cand(2, { category: 'Investing', tags: ['risk'] }),
    cand(3, { tags: ['risk', 'tax'], published_at: '2020-01-01T00:00:00Z' }),
    cand(4, { category: 'Investing', published_at: '2019-01-01T00:00:00Z' }),
  ]);
  assert.equal(both.reason, 'Same category · shares “risk”');
  assert.equal(tagsOnly.reason, 'Shares “risk”, “tax”');
  assert.equal(categoryOnly.reason, 'Same category: Investing');
});

test('handles missing tags and category without throwing', () => {
  assert.deepEqual(scoreRelated({ id: 1 }, [cand(2, { tags: undefined })]), []);
  assert.deepEqual(scoreRelated({ id: 1, category: null, tags: null }, [cand(2)]), []);
});

test('does not mutate its inputs', () => {
  const candidates = [cand(2, { category: 'Investing' })];
  const copy = JSON.stringify(candidates);
  scoreRelated(post, candidates);
  assert.equal(JSON.stringify(candidates), copy);
});

test('fillRelated tops up to the limit with newest posts, skipping the post itself and duplicates', () => {
  const matched = [{ ...cand(2), reason: 'Shares “risk”' }];
  const result = fillRelated(post, matched, [cand(1), cand(2), cand(3), cand(4), cand(5)], 3);
  assert.deepEqual(result.map((p) => p.id), [2, 3, 4]);
  assert.equal(result[0].reason, 'Shares “risk”');
  assert.equal(result[1].reason, EDITORS_PICK);
});

test('fillRelated adds nothing when there are already enough matches', () => {
  const matched = [cand(2), cand(3), cand(4)];
  assert.deepEqual(fillRelated(post, matched, [cand(5)], 3).map((p) => p.id), [2, 3, 4]);
});

test('fillRelated gives a post with no matches three editor picks', () => {
  const result = fillRelated(post, [], [cand(2), cand(3), cand(4), cand(5)], 3);
  assert.deepEqual(result.map((p) => p.id), [2, 3, 4]);
  assert.ok(result.every((p) => p.reason === EDITORS_PICK));
});
