const test = require('node:test');
const assert = require('node:assert/strict');

// --- stub the database: each query pops the next prepared result --------------------------------
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
      return queue.length > 0 ? queue.shift() : [];
    },
  },
};

const postHandler = require('../posts/[slug]');
const listHandler = require('../posts');

const PAST = '2020-01-01T00:00:00.000Z';
const FUTURE = '2999-01-01T00:00:00.000Z';
const TOKEN = 'preview-token-123';

const row = (extra = {}) => ({
  id: 1,
  slug: 'asset-allocation-101',
  title: 'Asset Allocation 101',
  excerpt: 'Why allocation matters.',
  content: 'Body',
  category: 'Investing',
  tags: ['risk'],
  published: true,
  published_at: PAST,
  preview_token: TOKEN,
  ...extra,
});

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

const getPost = async (query, rows) => {
  calls.length = 0;
  queue = [rows, []];
  const res = fakeResponse();
  await postHandler({ method: 'GET', headers: {}, query: { slug: 'asset-allocation-101', ...query } }, res);
  return res;
};

// --- single post --------------------------------------------------------------------------------
test('serves a live post without leaking private fields', async () => {
  const res = await getPost({}, [row()]);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.post.title, 'Asset Allocation 101');
  assert.equal('preview_token' in res.body.data.post, false);
  assert.equal('published' in res.body.data.post, false);
  assert.equal(res.body.data.preview, false);
  assert.match(res.headers['Cache-Control'], /s-maxage/);
});

test('hides a draft from the public', async () => {
  const res = await getPost({}, [row({ published: false })]);
  assert.equal(res.statusCode, 404);
});

test('hides a scheduled post until its publish date', async () => {
  const res = await getPost({}, [row({ published_at: FUTURE })]);
  assert.equal(res.statusCode, 404);
});

test('a wrong or missing preview token does not reveal a draft', async () => {
  assert.equal((await getPost({ preview: 'wrong' }, [row({ published: false })])).statusCode, 404);
  assert.equal((await getPost({ preview: '' }, [row({ published: false })])).statusCode, 404);
  assert.equal((await getPost({ preview: ['a', 'b'] }, [row({ published: false })])).statusCode, 404);
});

test('the right preview token reveals a draft, uncached and flagged as a preview', async () => {
  const res = await getPost({ preview: TOKEN }, [row({ published: false })]);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.preview, true);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal('preview_token' in res.body.data.post, false);
});

test('the preview token also reveals a scheduled post', async () => {
  const res = await getPost({ preview: TOKEN }, [row({ published_at: FUTURE })]);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.preview, true);
});

test('a live post ignores the preview parameter and stays cacheable', async () => {
  const res = await getPost({ preview: TOKEN }, [row()]);
  assert.equal(res.body.data.preview, false);
  assert.match(res.headers['Cache-Control'], /s-maxage/);
});

test('looks up related posts by shared tags as well as category', async () => {
  await getPost({}, [row({ tags: ['risk', 'tax'] })]);
  const related = calls[1];
  assert.match(related.text, /tags/);
  assert.ok(related.values.some((value) => Array.isArray(value) && value.join() === 'risk,tax'));
});

test('related posts are scored (category +5, shared tag +2) and carry a reason', async () => {
  calls.length = 0;
  queue = [
    [row({ tags: ['risk', 'tax'] })],
    [
      { id: 2, slug: 'a', title: 'A', category: 'Other', tags: ['risk'], published_at: PAST },
      { id: 3, slug: 'b', title: 'B', category: 'Investing', tags: ['risk', 'tax'], published_at: PAST },
      { id: 4, slug: 'c', title: 'C', category: 'Unrelated', tags: ['zzz'], published_at: PAST },
    ],
  ];
  const res = fakeResponse();
  await postHandler({ method: 'GET', headers: {}, query: { slug: 'asset-allocation-101' } }, res);
  const related = res.body.data.related;
  assert.deepEqual(related.map((post) => post.id), [3, 2]);
  assert.equal(related[0].reason, 'Same category · shares “risk”, “tax”');
  assert.equal(related[1].reason, 'Shares “risk”');
});

test('a post with fewer than three matches is topped up with the newest articles', async () => {
  calls.length = 0;
  queue = [
    [row()],
    [],
    [
      { id: 7, slug: 'x', title: 'X', category: 'Other', tags: [], published_at: PAST },
      { id: 8, slug: 'y', title: 'Y', category: 'Other', tags: [], published_at: PAST },
      { id: 9, slug: 'z', title: 'Z', category: 'Other', tags: [], published_at: PAST },
    ],
  ];
  const res = fakeResponse();
  await postHandler({ method: 'GET', headers: {}, query: { slug: 'asset-allocation-101' } }, res);
  const related = res.body.data.related;
  assert.deepEqual(related.map((post) => post.id), [7, 8, 9]);
  assert.ok(related.every((post) => post.reason === 'Editor’s selection'));
  assert.match(calls[2].text, /published_at <= now\(\)/, 'the top-up only considers live posts');
});

test('the post query selects author fields and the related query only considers live posts', async () => {
  await getPost({}, [row({ author_name: 'Jane Doe', author_bio: 'Writes.' })]);
  assert.match(calls[0].text, /author_name/);
  assert.match(calls[0].text, /author_bio/);
  assert.match(calls[1].text, /published_at <= now\(\)/);
});

test('unknown or malformed slugs are a 404 without querying', async () => {
  calls.length = 0;
  const res = fakeResponse();
  await postHandler({ method: 'GET', headers: {}, query: { slug: "Bad Slug'; --" } }, res);
  assert.equal(res.statusCode, 404);
  assert.equal(calls.length, 0);
});

// --- post list ----------------------------------------------------------------------------------
test('the list filters by tag (normalised) and returns the popular tags', async () => {
  calls.length = 0;
  queue = [[row()], [{ total: 1 }], [{ categories: ['Investing'], tags: ['risk', 'tax'], archive: [] }]];
  const res = fakeResponse();
  await listHandler({ method: 'GET', headers: {}, query: { tag: '  Risk ' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data.tags, ['risk', 'tax']);
  assert.deepEqual(res.body.data.categories, ['Investing']);
  assert.equal(res.body.data.pagination.total, 1);
  assert.ok(calls[0].values.includes('risk'), 'tag should be lowercased and trimmed');
});

test('every public list query hides drafts and scheduled posts', async () => {
  calls.length = 0;
  queue = [[], [{ total: 0 }], [{}], []];
  await listHandler({ method: 'GET', headers: {}, query: {} }, fakeResponse());
  // posts, count, facets (categories + tags + archive), featured
  assert.equal(calls.length, 4);
  calls.forEach((call) => assert.match(call.text, /published_at <= now\(\)/));
});

// --- list: featured, archive, sort, month, offset -------------------------------------------------
const runList = async (query, queued) => {
  calls.length = 0;
  queue = queued;
  const res = fakeResponse();
  await listHandler({ method: 'GET', headers: {}, query }, res);
  return res;
};
const booleans = (call) => call.values.filter((value) => typeof value === 'boolean');

test('the default view returns the featured post and archive, and keeps the featured post out of the grid', async () => {
  const featured = row({ id: 9, slug: 'the-featured-one', featured: true });
  const res = await runList({}, [[row()], [{ total: 1 }], [{ archive: [{ year: 2026, month: 3, count: 4 }] }], [featured]]);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.featured.slug, 'the-featured-one');
  assert.deepEqual(res.body.data.archive, [{ year: 2026, month: 3, count: 4 }]);
  assert.deepEqual(booleans(calls[0]), [true, false], 'grid hides the featured post; newest-first');
  assert.deepEqual(booleans(calls[1]), [true], 'the total agrees with the grid');
});

test('filtering by category keeps the featured post in the results and returns no featured block', async () => {
  const res = await runList({ category: 'Investing' }, [[row()], [{ total: 1 }], [{}], [row({ id: 9 })]]);
  assert.equal(res.body.data.featured, null);
  assert.equal(calls.length, 3, 'the featured query is skipped');
  assert.deepEqual(booleans(calls[0]), [false, false]);
});

test('searching, tag and month filters also disable the featured block', async () => {
  for (const query of [{ q: 'tax' }, { tag: 'risk' }, { month: '2026-03' }]) {
    const res = await runList(query, [[], [{ total: 0 }], [{}], []]);
    assert.equal(res.body.data.featured, null, JSON.stringify(query));
    assert.deepEqual(booleans(calls[0]), [false, false], JSON.stringify(query));
  }
});

test('sort=oldest flips the order, and the featured post stays hidden only when newest-first', async () => {
  const res = await runList({ sort: 'oldest' }, [[], [{ total: 0 }], [{}], []]);
  assert.equal(res.body.data.featured, null);
  assert.deepEqual(booleans(calls[0]), [false, true]);
});

test('an unknown sort falls back to newest-first', async () => {
  await runList({ sort: 'random; DROP TABLE posts' }, [[], [{ total: 0 }], [{}], []]);
  assert.deepEqual(booleans(calls[0]), [true, false]);
});

test('the month filter is passed as a validated YYYY-MM value, and garbage is ignored', async () => {
  await runList({ month: '2026-03' }, [[], [{ total: 0 }], [{}], []]);
  assert.ok(calls[0].values.includes('2026-03'));
  await runList({ month: "2026-03'; --" }, [[], [{ total: 0 }], [{}], []]);
  assert.equal(calls[0].values.some((value) => typeof value === 'string' && value.includes('--')), false);
  assert.deepEqual(booleans(calls[0]), [true, false], 'garbage month means no month filter');
});

test('an explicit offset drives load-more windows and is echoed back', async () => {
  const res = await runList({ offset: '11', limit: '6' }, [[], [{ total: 40 }], [{}], []]);
  assert.ok(calls[0].values.includes(11));
  assert.ok(calls[0].values.includes(6));
  assert.deepEqual(res.body.data.pagination, { total: 40, page: 2, limit: 6, offset: 11 });
});

test('without an offset the page number still works', async () => {
  const res = await runList({ page: '3', limit: '9' }, [[], [{ total: 40 }], [{}], []]);
  assert.equal(res.body.data.pagination.offset, 18);
  assert.equal(res.body.data.pagination.page, 3);
});
