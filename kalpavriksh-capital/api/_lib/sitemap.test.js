const test = require('node:test');
const assert = require('node:assert/strict');

// --- stub the database ------------------------------------------------------------------------
const dbPath = require.resolve('./db');
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: { getSql: () => async () => [{ slug: 'asset-allocation-101', updated_at: '2026-02-01T00:00:00.000Z' }] },
};

const handler = require('../sitemap');
const routes = require('../../src/site/routes.json');

async function sitemap() {
  const res = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
  };
  await handler({ method: 'GET', headers: {}, query: {} }, res);
  return res;
}

test('lists every site page, the blog list and published articles', async () => {
  const res = await sitemap();
  assert.equal(res.statusCode, 200);
  [...routes.pages.map((page) => page.path), '/blogs', '/blogs/asset-allocation-101'].forEach((path) => {
    assert.ok(res.body.includes(`<loc>${routes.siteUrl}${path}</loc>`), `missing ${path}`);
  });
});

test('leaves out the old address that only redirects', async () => {
  const res = await sitemap();
  assert.ok(!res.body.includes(`<loc>${routes.siteUrl}/asset-allocation</loc>`));
});
