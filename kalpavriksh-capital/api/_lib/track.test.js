const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ADMIN_TOKEN_SECRET = 'test-secret-with-more-than-16-chars';

// --- stub the database ----------------------------------------------------------------------------
const calls = [];
let failNext = false;
const dbPath = require.resolve('./db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    getSql: () => async (strings, ...values) => {
      calls.push({ text: strings.join('?'), values });
      if (failNext) {
        failNext = false;
        throw new Error('db down');
      }
      return [];
    },
  },
};

const handler = require('../track-view');

const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36';
let ipCounter = 0;
const freshIp = () => `10.1.0.${++ipCounter}`; // each test gets its own client so rate limits don't bleed

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

const track = async ({ method = 'POST', slug = 'asset-allocation-101', ip = freshIp(), headers = {}, body } = {}) => {
  calls.length = 0;
  const res = fakeResponse();
  await handler(
    { method, headers: { 'user-agent': BROWSER, 'x-real-ip': ip, ...headers }, body: body === undefined ? { slug } : body },
    res,
  );
  return res;
};

test('only POST is allowed', async () => {
  const res = await track({ method: 'GET' });
  assert.equal(res.statusCode, 405);
  assert.equal(calls.length, 0);
});

test('a malformed or missing slug is rejected without touching the database', async () => {
  assert.equal((await track({ slug: "Bad Slug'; --" })).statusCode, 400);
  assert.equal((await track({ body: {} })).statusCode, 400);
  assert.equal((await track({ body: null })).statusCode, 400);
  assert.equal(calls.length, 0);
});

test('records one view with a single atomic statement and never caches', async () => {
  const res = await track();
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Cache-Control'], 'no-store');
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /ON CONFLICT/);
  assert.match(calls[0].text, /view_count = view_count \+ 1/);
});

test('only live posts are counted', async () => {
  await track();
  assert.match(calls[0].text, /published = true/);
  assert.match(calls[0].text, /published_at <= now\(\)/);
});

test('stores a salted hash, never the raw IP or user agent', async () => {
  const ip = '203.0.113.77';
  await track({ ip });
  const values = calls[0].values;
  assert.ok(values.includes('asset-allocation-101'));
  const hash = values.find((value) => typeof value === 'string' && /^[0-9a-f]{64}$/.test(value));
  assert.ok(hash, 'expects a sha256 hex digest');
  assert.equal(values.some((value) => typeof value === 'string' && (value.includes(ip) || value.includes('Mozilla'))), false);
});

test('the same visitor hashes the same, a different IP differently, and the user agent is not part of it', async () => {
  const hashOf = async (opts) => {
    await track(opts);
    return calls[0].values.find((value) => /^[0-9a-f]{64}$/.test(String(value)));
  };
  const ip = freshIp();
  const first = await hashOf({ ip });
  const again = await hashOf({ ip });
  const otherIp = await hashOf({ ip: freshIp() });
  // A random User-Agent per request must not produce a new "visitor", or one client could inflate the count.
  const otherUa = await hashOf({ ip, headers: { 'user-agent': `${BROWSER} Edg/120` } });
  assert.equal(first, again);
  assert.notEqual(first, otherIp);
  assert.equal(first, otherUa);
});

test('the hash is keyed with a dedicated salt when one is set', async () => {
  const ip = freshIp();
  await track({ ip });
  const withFallback = calls[0].values.find((value) => /^[0-9a-f]{64}$/.test(String(value)));
  process.env.VIEW_HASH_SALT = 'a-dedicated-view-salt-of-sufficient-length';
  try {
    await track({ ip });
    const withSalt = calls[0].values.find((value) => /^[0-9a-f]{64}$/.test(String(value)));
    assert.notEqual(withSalt, withFallback);
  } finally {
    delete process.env.VIEW_HASH_SALT;
  }
});

test('without a usable secret nothing is recorded, rather than storing a guessable hash', async () => {
  const saved = process.env.ADMIN_TOKEN_SECRET;
  try {
    for (const value of [undefined, 'short']) {
      if (value === undefined) delete process.env.ADMIN_TOKEN_SECRET;
      else process.env.ADMIN_TOKEN_SECRET = value;
      const res = await track();
      assert.equal(res.statusCode, 200);
      assert.equal(calls.length, 0);
    }
  } finally {
    process.env.ADMIN_TOKEN_SECRET = saved;
  }
});

test('bots, crawlers and a missing user agent are ignored but get the same answer', async () => {
  for (const ua of ['Googlebot/2.1', 'Mozilla/5.0 (compatible; AhrefsBot/7.0)', 'HeadlessChrome/120', 'curl/8.4', 'facebookexternalhit/1.1', 'Slackbot-LinkExpanding', '']) {
    const res = await track({ headers: { 'user-agent': ua } });
    assert.equal(res.statusCode, 200, ua);
    assert.equal(calls.length, 0, `should not count: "${ua}"`);
  }
});

test('prefetch requests and Do Not Track are respected', async () => {
  for (const headers of [{ purpose: 'prefetch' }, { 'sec-purpose': 'prefetch' }, { dnt: '1' }]) {
    const res = await track({ headers });
    assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 0, JSON.stringify(headers));
  }
});

test('a client that floods the endpoint is rate limited', async () => {
  const ip = freshIp();
  let last;
  for (let i = 0; i < 31; i += 1) last = await track({ ip });
  assert.equal(last.statusCode, 429);
});

test('a database failure returns a generic error and leaks nothing', async () => {
  failNext = true;
  const res = await track();
  assert.equal(res.statusCode, 500);
  assert.doesNotMatch(JSON.stringify(res.body), /db down/);
});
