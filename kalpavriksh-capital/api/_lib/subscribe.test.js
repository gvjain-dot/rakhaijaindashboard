const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ADMIN_PASSWORD = 'correct horse battery staple';
process.env.ADMIN_TOKEN_SECRET = 'test-secret-with-more-than-16-chars';

// --- stub the database ----------------------------------------------------------------------------
const calls = [];
let nextRows = [];
const dbPath = require.resolve('./db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    getSql: () => async (strings, ...values) => {
      calls.push({ text: strings.join('?'), values });
      return nextRows;
    },
  },
};

const { createToken } = require('./auth');
const { createRateLimiter } = require('./rateLimit');
const subscribeHandler = require('../subscribe');
const subscribersHandler = require('../admin/subscribers');

let ipCounter = 0;
const freshIp = () => `10.0.0.${++ipCounter}`; // each test gets its own client so rate limits don't bleed

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

const subscribe = async (body, { ip = freshIp(), method = 'POST' } = {}) => {
  calls.length = 0;
  const res = fakeResponse();
  await subscribeHandler({ method, headers: { 'x-real-ip': ip }, query: {}, body }, res);
  return res;
};

// --- rate limiter -----------------------------------------------------------------------------------
test('rate limiter allows up to max hits per window, then blocks, then resets', () => {
  let time = 1000;
  const limiter = createRateLimiter({ max: 3, windowMs: 1000, now: () => time });
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), false);
  assert.equal(limiter.allow('b'), true, 'other clients are unaffected');
  time += 1000;
  assert.equal(limiter.allow('a'), true, 'allowed again once the window passes');
});

// --- public subscribe ---------------------------------------------------------------------------------
test('stores a normalised email with its source', async () => {
  const res = await subscribe({ email: '  Rakhi@Example.COM ', source: 'asset-allocation-101' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.subscribed, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /INSERT INTO subscribers/);
  assert.match(calls[0].text, /ON CONFLICT DO NOTHING/);
  assert.ok(calls[0].values.includes('rakhi@example.com'));
  assert.ok(calls[0].values.includes('asset-allocation-101'));
});

test('ignores a source that is not a valid slug', async () => {
  await subscribe({ email: 'a@example.com', source: "x'; DROP TABLE subscribers;--" });
  assert.ok(calls[0].values.includes(null), 'source should be stored as null');
  assert.equal(calls[0].values.some((value) => typeof value === 'string' && value.includes('DROP')), false);
});

test('rejects a malformed email without touching the database', async () => {
  const res = await subscribe({ email: 'not-an-email' });
  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

test('a filled honeypot looks like success but stores nothing', async () => {
  const res = await subscribe({ email: 'bot@example.com', website: 'http://spam.example' });
  assert.equal(res.statusCode, 200);
  assert.equal(calls.length, 0);
});

test('a repeat signup also succeeds, so the endpoint never reveals who is subscribed', async () => {
  const first = await subscribe({ email: 'dup@example.com' });
  const second = await subscribe({ email: 'dup@example.com' });
  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
});

test('only POST is accepted', async () => {
  const res = await subscribe({}, { method: 'GET' });
  assert.equal(res.statusCode, 405);
});

test('blocks a client that signs up too many times', async () => {
  const ip = freshIp();
  let last;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    last = await subscribe({ email: `user${attempt}@example.com` }, { ip });
  }
  assert.equal(last.statusCode, 429);
});

// --- admin subscribers ---------------------------------------------------------------------------------
const adminRequest = (method, query = {}, authorised = true) => ({
  method,
  query,
  headers: authorised ? { authorization: `Bearer ${createToken()}` } : {},
});

test('admin can list subscribers, newest first', async () => {
  nextRows = [{ id: 2, email: 'b@example.com', source: null, created_at: '2026-02-02T00:00:00Z' }];
  calls.length = 0;
  const res = fakeResponse();
  await subscribersHandler(adminRequest('GET'), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data.subscribers.map((row) => row.email), ['b@example.com']);
  assert.match(calls[0].text, /ORDER BY created_at DESC/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('listing subscribers requires an admin token', async () => {
  calls.length = 0;
  const res = fakeResponse();
  await subscribersHandler(adminRequest('GET', {}, false), res);
  assert.equal(res.statusCode, 401);
  assert.equal(calls.length, 0);
});

test('admin can delete a subscriber by id, and bad ids are rejected', async () => {
  nextRows = [{ id: 5 }];
  calls.length = 0;
  const ok = fakeResponse();
  await subscribersHandler(adminRequest('DELETE', { id: '5' }), ok);
  assert.equal(ok.statusCode, 200);
  assert.match(calls[0].text, /DELETE FROM subscribers/);
  assert.ok(calls[0].values.includes(5));

  const bad = fakeResponse();
  await subscribersHandler(adminRequest('DELETE', { id: 'abc' }), bad);
  assert.equal(bad.statusCode, 400);
});

test('admin can remove several subscribers at once with ?ids=', async () => {
  nextRows = [{ id: 1 }, { id: 3 }];
  calls.length = 0;
  const res = fakeResponse();
  await subscribersHandler(adminRequest('DELETE', { ids: '1,3' }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.deleted, 2);
  assert.match(calls[0].text, /ANY\(\?::int\[\]\)/);
  assert.deepEqual(calls[0].values, [[1, 3]]);
});

test('bulk removal rejects empty, malformed, oversized or out-of-range id lists', async () => {
  const lists = ['', ',', '1,abc', '0,1', '2147483648', Array.from({ length: 101 }, (_, i) => i + 1).join(',')];
  for (const ids of lists) {
    calls.length = 0;
    const res = fakeResponse();
    await subscribersHandler(adminRequest('DELETE', { ids }), res);
    assert.equal(res.statusCode, 400, `ids=${ids.slice(0, 20)}`);
    assert.equal(calls.length, 0);
  }
});
