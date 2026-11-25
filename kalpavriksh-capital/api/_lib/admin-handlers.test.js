const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');

process.env.ADMIN_PASSWORD = 'correct horse battery staple';
process.env.ADMIN_TOKEN_SECRET = 'test-secret-with-more-than-16-chars';

// --- stubs: no network, no database ---------------------------------------
const putCalls = [];
let putError = null; // set by a test to make the stubbed blob store fail
const blobPath = require.resolve('@vercel/blob');
require.cache[blobPath] = {
  id: blobPath,
  filename: blobPath,
  loaded: true,
  exports: {
    put: async (pathname, body, options) => {
      if (putError) throw putError;
      putCalls.push({ pathname, size: body.length, options });
      return { url: `https://blob.test/${pathname}` };
    },
  },
};

const FAKE_ROWS = [
  { id: 2, slug: 'second', title: 'Second post', published: false },
  { id: 1, slug: 'first', title: 'First post', published: true },
];
const sqlCalls = []; // every query the handlers run: { text, values }
const dbPath = require.resolve('./db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    getSql: () => async (strings, ...values) => {
      sqlCalls.push({ text: strings.join('?'), values });
      return FAKE_ROWS;
    },
  },
};

const { createToken } = require('./auth');
const uploadHandler = require('../admin/upload');
const postsHandler = require('../admin/posts');

// --- helpers ---------------------------------------------------------------
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d, 0x49, 0x48, 0x44, 0x52]);
const authHeader = () => ({ authorization: `Bearer ${createToken()}` });

/**
 * Mimics `vercel dev`: the raw body is replayed only through 'data'/'end' listeners
 * (no async iterator), so a handler must read it with listeners to work locally.
 */
function fakeUploadRequest(chunks, headers = {}) {
  const req = new EventEmitter();
  req.method = 'POST';
  req.headers = { 'content-type': 'image/png', ...authHeader(), ...headers };
  const originalOn = req.on.bind(req);
  req.on = req.addListener = (name, listener) => {
    originalOn(name, listener);
    if (name === 'end') {
      setImmediate(() => {
        chunks.forEach((chunk) => req.emit('data', chunk));
        req.emit('end');
      });
    }
    return req;
  };
  return req;
}

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

// --- tests -----------------------------------------------------------------
test('GET /api/admin/posts returns every post for an authorised admin', async () => {
  const res = fakeResponse();
  await postsHandler({ method: 'GET', headers: authHeader(), query: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.data.posts.map((post) => post.slug), ['second', 'first']);
});

test('GET /api/admin/posts rejects a request without a token', async () => {
  const res = fakeResponse();
  await postsHandler({ method: 'GET', headers: {}, query: {} }, res);
  assert.equal(res.statusCode, 401);
});

test('upload reads a body delivered through data/end events and returns the blob url', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  putCalls.length = 0;
  const res = fakeResponse();
  await uploadHandler(fakeUploadRequest([PNG_HEADER.subarray(0, 8), PNG_HEADER.subarray(8)]), res);
  assert.equal(res.statusCode, 201);
  assert.match(res.body.data.url, /^https:\/\/blob\.test\/blog\/[0-9a-f-]+\.png$/);
  assert.equal(putCalls.length, 1);
  assert.equal(putCalls[0].size, PNG_HEADER.length);
  assert.equal(putCalls[0].options.contentType, 'image/png');
});

test('upload explains that storage is not configured when the blob token is missing', async () => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
  putCalls.length = 0;
  const res = fakeResponse();
  await uploadHandler(fakeUploadRequest([PNG_HEADER]), res);
  assert.equal(res.statusCode, 503);
  assert.match(res.body.error, /storage is not configured/i);
  assert.equal(putCalls.length, 0);
});

test('upload surfaces a blob storage error with its real message', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  const failure = new Error('Vercel Blob: Cannot use public access on a private store.');
  failure.name = 'BlobError';
  putError = failure;
  const res = fakeResponse();
  try {
    await uploadHandler(fakeUploadRequest([PNG_HEADER]), res);
  } finally {
    putError = null;
  }
  assert.equal(res.statusCode, 502);
  assert.match(res.body.error, /private store/i);
});

test('upload rejects bytes that are not really the claimed image type', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  const res = fakeResponse();
  await uploadHandler(fakeUploadRequest([Buffer.from('definitely not a png file at all')]), res);
  assert.equal(res.statusCode, 400);
});

test('upload rejects an image over 4 MB', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  const big = Buffer.concat([PNG_HEADER, Buffer.alloc(4 * 1024 * 1024)]);
  const res = fakeResponse();
  await uploadHandler(fakeUploadRequest([big]), res);
  assert.equal(res.statusCode, 413);
});

// ---- saving the SEO fields, tags and publish date ---------------------------------------------

const validBody = (extra = {}) => ({ title: 'T', excerpt: 'E', content: 'Body', ...extra });
const jsonRequest = (method, body, query = {}) => ({ method, headers: authHeader(), query, body });
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

test('creating a post stores the SEO fields, tags and publish date', async () => {
  sqlCalls.length = 0;
  const res = fakeResponse();
  await postsHandler(
    jsonRequest(
      'POST',
      validBody({
        feature_image_alt: 'A tree',
        social_image: 'https://img.test/s.png',
        canonical_url: 'https://orig.test/x',
        noindex: true,
        focus_keyword: 'asset',
        tags: ['Risk', 'risk', 'Tax'],
        published: true,
        published_at: '2030-01-01T00:00:00.000Z',
      })
    ),
    res
  );
  assert.equal(res.statusCode, 201);
  const { values } = sqlCalls[0];
  assert.ok(values.includes('A tree'));
  assert.ok(values.includes('https://img.test/s.png'));
  assert.ok(values.includes('https://orig.test/x'));
  assert.ok(values.includes('asset'));
  assert.ok(values.some((value) => Array.isArray(value) && value.join() === 'risk,tax'));
  assert.ok(values.includes('2030-01-01T00:00:00.000Z'));
});

test('publishing without a date stamps the current time', async () => {
  sqlCalls.length = 0;
  const before = Date.now();
  await postsHandler(jsonRequest('POST', validBody({ published: true })), fakeResponse());
  const stamp = sqlCalls[0].values.find((value) => typeof value === 'string' && ISO_DATE.test(value));
  assert.ok(stamp, 'expected a publish timestamp');
  assert.ok(Date.parse(stamp) >= before - 1000 && Date.parse(stamp) <= Date.now() + 1000);
});

test('a draft without a date stores no publish date', async () => {
  sqlCalls.length = 0;
  await postsHandler(jsonRequest('POST', validBody({ published: false })), fakeResponse());
  assert.equal(sqlCalls[0].values.some((value) => typeof value === 'string' && ISO_DATE.test(value)), false);
});

test('updating a post also saves the new fields and keeps its publish date logic', async () => {
  sqlCalls.length = 0;
  const res = fakeResponse();
  await postsHandler(jsonRequest('PUT', validBody({ tags: ['one'], noindex: true, published: true }), { id: '3' }), res);
  assert.equal(res.statusCode, 200);
  const { text, values } = sqlCalls[0];
  assert.match(text, /tags\s*=/);
  assert.match(text, /noindex\s*=/);
  assert.match(text, /published_at\s*=/);
  assert.ok(values.some((value) => Array.isArray(value) && value.join() === 'one'));
});

test('the admin list includes each post preview token', async () => {
  sqlCalls.length = 0;
  await postsHandler({ method: 'GET', headers: authHeader(), query: {} }, fakeResponse());
  assert.match(sqlCalls[0].text, /preview_token/);
  assert.match(sqlCalls[0].text, /tags/);
});

test('invalid tags are rejected before touching the database', async () => {
  sqlCalls.length = 0;
  const res = fakeResponse();
  await postsHandler(jsonRequest('POST', validBody({ tags: 'a,b' })), res);
  assert.equal(res.statusCode, 400);
  assert.equal(sqlCalls.length, 0);
});
