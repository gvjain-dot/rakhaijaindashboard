const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ADMIN_PASSWORD = 'correct horse battery staple';
process.env.ADMIN_TOKEN_SECRET = 'test-secret-with-more-than-16-chars';

// --- stub the database: each query pops the next prepared result (an Error is thrown) -------------
const calls = [];
let queue = [];
const dbPath = require.resolve('./db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    getSql: () => async (strings, ...values) => {
      calls.push({ text: strings.join('?'), values });
      const next = queue.length > 0 ? queue.shift() : [];
      if (next instanceof Error) throw next;
      return next;
    },
  },
};

const { createToken } = require('./auth');
const postsHandler = require('../admin/posts');

function fakeResponse() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}

const authHeader = () => ({ authorization: `Bearer ${createToken()}` });
const call = async ({ method = 'POST', query = {}, body, queued = [], auth = true }) => {
  calls.length = 0;
  queue = queued;
  const res = fakeResponse();
  await postsHandler({ method, query, body, headers: auth ? authHeader() : {} }, res);
  return res;
};
const uniqueViolation = () => Object.assign(new Error('duplicate key'), { code: '23505' });
const post = { title: 'T', excerpt: 'E', content: 'Body' };

// --- featured + author on create/update ------------------------------------------------------------
test('creating a post saves the author fields; the insert itself never touches featured', async () => {
  const res = await call({ body: { ...post, author_name: 'Jane Doe', author_bio: 'Writes.' }, queued: [[{ id: 5, slug: 't' }]] });
  assert.equal(res.statusCode, 201);
  assert.equal(calls.length, 1, 'no featured statements for a non-featured post');
  assert.match(calls[0].text, /author_name/);
  assert.doesNotMatch(calls[0].text, /featured/);
  assert.ok(calls[0].values.includes('Jane Doe'));
});

test('creating a featured post un-features the previous one, then features the new one', async () => {
  const res = await call({ body: { ...post, featured: true }, queued: [[{ id: 5, slug: 't' }]] });
  assert.equal(res.statusCode, 201);
  assert.equal(calls.length, 3);
  assert.match(calls[1].text, /SET featured = false WHERE featured AND id <> \?/);
  assert.match(calls[2].text, /SET featured = true WHERE id = \?/);
  assert.ok(calls[1].values.includes(5) && calls[2].values.includes(5));
});

test('updating a post to featured clears the previous featured post first', async () => {
  const res = await call({ method: 'PUT', query: { id: '7' }, body: { ...post, featured: true }, queued: [[{ id: 7, slug: 't' }]] });
  assert.equal(res.statusCode, 200);
  assert.doesNotMatch(calls[0].text, /featured/);
  assert.match(calls[1].text, /SET featured = false WHERE featured AND id <> \?/);
  assert.match(calls[2].text, /SET featured = true WHERE id = \?/);
});

test('updating a post with featured off un-features only that post', async () => {
  await call({ method: 'PUT', query: { id: '7' }, body: { ...post, featured: false }, queued: [[{ id: 7, slug: 't' }]] });
  assert.equal(calls.length, 2);
  assert.match(calls[1].text, /SET featured = false WHERE id = \? AND featured/);
});

test('a failed save (duplicate slug) never changes which post is featured', async () => {
  const res = await call({ body: { ...post, featured: true }, queued: [uniqueViolation()] });
  assert.equal(res.statusCode, 409);
  assert.equal(calls.length, 1, 'featured statements run only after a successful save');
});

test('the admin list exposes featured, author and view count', async () => {
  await call({ method: 'GET', queued: [[]] });
  for (const column of ['featured', 'author_name', 'author_bio', 'view_count']) assert.match(calls[0].text, new RegExp(column));
});

// --- edit conflicts ---------------------------------------------------------------------------------
const BASE = '2026-11-19T10:00:00.123456+00:00';

test('an update that carries base_updated_at only applies if the post was not changed since', async () => {
  const res = await call({ method: 'PUT', query: { id: '7' }, body: { ...post, base_updated_at: BASE }, queued: [[{ id: 7, slug: 't' }]] });
  assert.equal(res.statusCode, 200);
  assert.match(calls[0].text, /updated_at <= \?::timestamptz/);
  assert.ok(calls[0].values.includes(BASE));
});

test('a stale base_updated_at is a 409 conflict, and the post is left untouched', async () => {
  const res = await call({ method: 'PUT', query: { id: '7' }, body: { ...post, base_updated_at: BASE }, queued: [[], [{ id: 7 }]] });
  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /changed/i);
});

test('an update of a missing post is still a 404, with or without base_updated_at', async () => {
  const res = await call({ method: 'PUT', query: { id: '7' }, body: { ...post, base_updated_at: BASE }, queued: [[], []] });
  assert.equal(res.statusCode, 404);
});

test('without base_updated_at the update is unconditional (the Overwrite choice)', async () => {
  const res = await call({ method: 'PUT', query: { id: '7' }, body: post, queued: [[{ id: 7, slug: 't' }]] });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 2, 'the update, then un-feature this post');
  assert.ok(calls[0].values.includes(null), 'a null base disables the conflict check');
});

// --- bulk actions -----------------------------------------------------------------------------------
test('bulk publish stamps published_at once and reports how many posts changed', async () => {
  const res = await call({ query: { action: 'bulk' }, body: { action: 'publish', ids: [1, 2, 3] }, queued: [[{ id: 1 }, { id: 2 }]] });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data, { affected: 2 });
  assert.match(calls[0].text, /published = true/);
  assert.match(calls[0].text, /COALESCE\(published_at, now\(\)\)/);
  assert.ok(calls[0].values.some((value) => Array.isArray(value) && value.join() === '1,2,3'));
});

test('bulk unpublish and delete each run one statement', async () => {
  await call({ query: { action: 'bulk' }, body: { action: 'unpublish', ids: [4] }, queued: [[{ id: 4 }]] });
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /published = false/);
  const res = await call({ query: { action: 'bulk' }, body: { action: 'delete', ids: [4, 5] }, queued: [[{ id: 4 }, { id: 5 }]] });
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /DELETE FROM posts/);
  assert.deepEqual(res.body.data, { affected: 2 });
});

test('bulk feature features exactly one post', async () => {
  const res = await call({ query: { action: 'bulk' }, body: { action: 'feature', ids: [9] }, queued: [[{ id: 9 }]] });
  assert.equal(res.statusCode, 200);
  assert.match(calls[0].text, /SET featured = false WHERE featured AND id <> \?/);
  assert.match(calls[1].text, /SET featured = true WHERE id = \?/);
});

test('invalid bulk requests are rejected before touching the database', async () => {
  for (const body of [{ action: 'nuke', ids: [1] }, { action: 'delete', ids: [] }, { action: 'delete', ids: ['x'] }, { action: 'feature', ids: [1, 2] }, null]) {
    const res = await call({ query: { action: 'bulk' }, body });
    assert.equal(res.statusCode, 400, JSON.stringify(body));
    assert.equal(calls.length, 0);
  }
});

// --- duplicate --------------------------------------------------------------------------------------
test('duplicating copies the post as an unpublished, unfeatured draft with a unique slug', async () => {
  const res = await call({ query: { action: 'duplicate', id: '3' }, queued: [[{ slug: 'my-post' }], [{ id: 9, slug: 'my-post-copy' }]] });
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body.data.post, { id: 9, slug: 'my-post-copy' });
  const insert = calls[1];
  assert.match(insert.text, /INSERT INTO posts/);
  assert.match(insert.text, /'Copy of ' \|\| title/);
  assert.match(insert.text, /false, NULL/, 'unpublished with no publish date');
  assert.doesNotMatch(insert.text, /preview_token|view_count/, 'gets a fresh token and zero views from the column defaults');
  assert.ok(insert.values.includes('my-post-copy'));
});

test('duplicating retries with -copy-2, -copy-3 when the slug is taken', async () => {
  const res = await call({
    query: { action: 'duplicate', id: '3' },
    queued: [[{ slug: 'my-post' }], uniqueViolation(), uniqueViolation(), [{ id: 11, slug: 'my-post-copy-3' }]],
  });
  assert.equal(res.statusCode, 201);
  assert.ok(calls[2].values.includes('my-post-copy-2'));
  assert.ok(calls[3].values.includes('my-post-copy-3'));
});

test('duplicating a missing post is a 404, and a bad id a 400', async () => {
  assert.equal((await call({ query: { action: 'duplicate', id: '3' }, queued: [[]] })).statusCode, 404);
  assert.equal((await call({ query: { action: 'duplicate', id: 'abc' } })).statusCode, 400);
  assert.equal(calls.length, 0);
});

// --- stats ------------------------------------------------------------------------------------------
test('stats summarises posts, subscribers, recent views and the top posts', async () => {
  const res = await call({
    method: 'GET',
    query: { action: 'stats' },
    queued: [
      [{ published: 5, drafts: 2, scheduled: 1, total_views: 120 }],
      [{ subscribers: 14 }],
      [{ views30d: 33 }],
      [{ id: 1, slug: 'a', title: 'A', view_count: 80 }],
      [],
      [{ n: 3 }],
      [{ id: 9, title: 'Draft', published: false, published_at: null, updated_at: 'x' }],
    ],
  });
  assert.equal(res.statusCode, 200);
  const { daily, ...rest } = res.body.data.stats;
  assert.equal(daily.length, 30);
  assert.deepEqual(rest, {
    published: 5,
    drafts: 2,
    scheduled: 1,
    totalViews: 120,
    subscribers: 14,
    views30d: 33,
    topPosts: [{ id: 1, slug: 'a', title: 'A', view_count: 80 }],
    newSubscribers30d: 3,
    attention: [{ id: 9, title: 'Draft', published: false, published_at: null, updated_at: 'x' }],
  });
});

test('stats copes with an empty database', async () => {
  const res = await call({ method: 'GET', query: { action: 'stats' }, queued: [[], [], [], [], [], [], []] });
  assert.equal(res.statusCode, 200);
  const { daily, ...rest } = res.body.data.stats;
  assert.equal(daily.every((point) => point.views === 0), true);
  assert.deepEqual(rest, { published: 0, drafts: 0, scheduled: 0, totalViews: 0, subscribers: 0, views30d: 0, topPosts: [], newSubscribers30d: 0, attention: [] });
});

// --- auth -------------------------------------------------------------------------------------------
test('every new admin action requires a valid token', async () => {
  const requests = [
    { method: 'GET', query: { action: 'stats' } },
    { query: { action: 'bulk' }, body: { action: 'publish', ids: [1] } },
    { query: { action: 'duplicate', id: '1' } },
  ];
  for (const request of requests) {
    const res = await call({ ...request, auth: false });
    assert.equal(res.statusCode, 401);
    assert.equal(calls.length, 0);
  }
});

test('losing a race to feature a post is reported as that, not as a duplicate slug', async () => {
  const race = Object.assign(new Error('duplicate key'), { code: '23505', constraint: 'posts_one_featured_idx' });
  const res = await call({ body: { ...post, featured: true }, queued: [[{ id: 5, slug: 't' }], [], race] });
  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /featured/i);
  assert.doesNotMatch(res.body.error, /slug/i);
});

// --- categories and tags manager -------------------------------------------------------------------
test('taxonomy lists categories and tags with their article counts', async () => {
  const res = await call({
    method: 'GET',
    query: { action: 'taxonomy' },
    queued: [[{ name: 'Tax', count: 2 }], [{ name: 'sip', count: 3 }]],
  });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data, { categories: [{ name: 'Tax', count: 2 }], tags: [{ name: 'sip', count: 3 }] });
});

test('renaming a category updates every article that uses it', async () => {
  const res = await call({ query: { action: 'taxonomy' }, body: { kind: 'category', from: ' Tax ', to: 'Taxes' }, queued: [[{ id: 1 }, { id: 2 }]] });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.affected, 2);
  assert.match(calls[0].text, /UPDATE posts SET category/);
  assert.deepEqual(calls[0].values, ['Taxes', 'Tax']);
});

test('removing a category sets it to null', async () => {
  await call({ query: { action: 'taxonomy' }, body: { kind: 'category', from: 'Tax', to: '' }, queued: [[]] });
  assert.deepEqual(calls[0].values, [null, 'Tax']);
});

test('renaming a tag normalises it and de-duplicates when merging', async () => {
  const res = await call({ query: { action: 'taxonomy' }, body: { kind: 'tag', from: '  SIP  Plans ', to: 'Investing' }, queued: [[{ id: 4 }]] });
  assert.equal(res.body.data.affected, 1);
  assert.match(calls[0].text, /array_replace/);
  assert.match(calls[0].text, /DISTINCT/);
  assert.deepEqual(calls[0].values, ['sip plans', 'investing', 'sip plans']);
});

test('removing a tag uses array_remove', async () => {
  await call({ query: { action: 'taxonomy' }, body: { kind: 'tag', from: 'old', to: '' }, queued: [[]] });
  assert.match(calls[0].text, /array_remove/);
});

test('taxonomy changes reject bad input without touching the database', async () => {
  const bad = [
    null,
    { kind: 'author', from: 'a', to: 'b' },
    { kind: 'constructor', from: 'a', to: 'b' },
    { kind: 'tag', from: '', to: 'b' },
    { kind: 'category', from: 'News' },
    { kind: 'category', from: 'News', to: null },
    { kind: 'tag', from: 'a', to: 5 },
    { kind: 'tag', from: 'a', to: 'a' },
    { kind: 'tag', from: 'a', to: 'x'.repeat(31) },
    { kind: 'category', from: 'a', to: 'x'.repeat(51) },
  ];
  for (const body of bad) {
    const res = await call({ query: { action: 'taxonomy' }, body });
    assert.equal(res.statusCode, 400);
  }
  assert.equal(calls.length, 0);
});

test('taxonomy actions require a token', async () => {
  assert.equal((await call({ method: 'GET', query: { action: 'taxonomy' }, auth: false })).statusCode, 401);
  assert.equal((await call({ query: { action: 'taxonomy' }, body: { kind: 'tag', from: 'a', to: 'b' }, auth: false })).statusCode, 401);
});

// --- saved categories and tags (taxonomy_terms) ------------------------------------------------------
const tableMissing = () => Object.assign(new Error('relation "taxonomy_terms" does not exist'), { code: '42P01' });

test('taxonomy list includes saved names that no article uses yet, with a count of 0', async () => {
  const res = await call({
    method: 'GET',
    query: { action: 'taxonomy' },
    queued: [
      [{ name: 'Tax', count: 2 }],
      [{ name: 'sip', count: 3 }],
      [{ kind: 'category', name: 'Estate Planning' }, { kind: 'category', name: 'tax' }, { kind: 'tag', name: 'nri' }],
    ],
  });
  assert.deepEqual(res.body.data.categories, [{ name: 'Estate Planning', count: 0 }, { name: 'Tax', count: 2 }]);
  assert.deepEqual(res.body.data.tags, [{ name: 'sip', count: 3 }, { name: 'nri', count: 0 }]);
});

test('taxonomy list still works before the saved-names table exists', async () => {
  const res = await call({
    method: 'GET',
    query: { action: 'taxonomy' },
    queued: [[{ name: 'Tax', count: 1 }], [], tableMissing()],
  });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data.categories, [{ name: 'Tax', count: 1 }]);
});

test('adding a new tag saves it lowercase', async () => {
  const res = await call({ query: { action: 'taxonomy-add' }, body: { kind: 'tag', name: '  Estate  Planning ' }, queued: [[], [{ id: 9 }]] });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data, { created: true });
  assert.match(calls[1].text, /INSERT INTO taxonomy_terms/);
  assert.deepEqual(calls[1].values, ['tag', 'estate planning']);
});

test('adding a category keeps its capitalisation', async () => {
  await call({ query: { action: 'taxonomy-add' }, body: { kind: 'category', name: 'Estate Planning' }, queued: [[], [{ id: 1 }]] });
  assert.deepEqual(calls[1].values, ['category', 'Estate Planning']);
});

test('adding a name an article already uses, or that is already saved, reports created: false', async () => {
  const used = await call({ query: { action: 'taxonomy-add' }, body: { kind: 'category', name: 'tax' }, queued: [[{ '?column?': 1 }]] });
  assert.deepEqual(used.body.data, { created: false });
  assert.equal(calls.length, 1, 'no insert when an article already uses the name');

  const saved = await call({ query: { action: 'taxonomy-add' }, body: { kind: 'tag', name: 'nri' }, queued: [[], []] });
  assert.deepEqual(saved.body.data, { created: false });
});

test('adding a name says what to do when the table has not been created', async () => {
  const res = await call({ query: { action: 'taxonomy-add' }, body: { kind: 'tag', name: 'nri' }, queued: [[], tableMissing()] });
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /004_taxonomy_terms/);
});

test('adding rejects bad input without touching the database', async () => {
  const bad = [null, { kind: 'author', name: 'a' }, { kind: 'tag', name: '   ' }, { kind: 'tag', name: 5 }, { kind: 'tag', name: 'x'.repeat(31) }, { kind: 'category', name: 'x'.repeat(51) }];
  for (const body of bad) {
    assert.equal((await call({ query: { action: 'taxonomy-add' }, body })).statusCode, 400);
  }
  assert.equal(calls.length, 0);
});

test('renaming also moves the saved name; removing deletes it', async () => {
  await call({ query: { action: 'taxonomy' }, body: { kind: 'category', from: 'Tax', to: 'Taxes' }, queued: [[{ id: 1 }]] });
  assert.match(calls[1].text, /DELETE FROM taxonomy_terms/);
  assert.match(calls[2].text, /INSERT INTO taxonomy_terms/);
  assert.deepEqual(calls[2].values, ['category', 'Taxes']);

  await call({ query: { action: 'taxonomy' }, body: { kind: 'category', from: 'Tax', to: '' }, queued: [[]] });
  assert.equal(calls.length, 2, 'only the article update and the saved-name delete');
});

test('renaming still succeeds before the saved-names table exists', async () => {
  const res = await call({ query: { action: 'taxonomy' }, body: { kind: 'tag', from: 'a', to: 'b' }, queued: [[{ id: 1 }], tableMissing()] });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.affected, 1);
});
