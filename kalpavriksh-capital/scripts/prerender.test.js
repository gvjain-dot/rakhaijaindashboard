const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { prerender, fillShell } = require('./prerender');
const routes = require('../src/site/routes.json');
const vercel = require('../vercel.json');

const SHELL = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const SUB_PAGES = routes.pages.filter((page) => page.path !== '/');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kg-prerender-'));
fs.writeFileSync(path.join(dir, 'index.html'), SHELL);
prerender(dir);

const read = (...parts) => fs.readFileSync(path.join(dir, ...parts), 'utf8');
const count = (html, pattern) => (html.match(pattern) || []).length;
const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap((match) => JSON.parse(match[1]));

test.after(() => fs.rmSync(dir, { recursive: true, force: true }));

test('leaves index.html untouched, because the blog server page is built from it', () => {
  assert.equal(read('index.html'), SHELL);
});

test('the home tags in index.html match routes.json', () => {
  const [home] = routes.pages;
  const escaped = (text) => text.replace(/&/g, '&amp;');
  assert.ok(SHELL.includes(`<title>${escaped(home.title)}</title>`), 'title');
  [['name', 'description', home.description], ['property', 'og:description', home.description],
    ['name', 'twitter:description', home.description], ['property', 'og:title', home.title],
    ['name', 'twitter:title', home.title]].forEach(([attribute, key, value]) => {
    assert.ok(SHELL.includes(`<meta ${attribute}="${key}" content="${escaped(value)}" />`), key);
  });
  assert.doesNotMatch(SHELL, /advisory/i);
});

test('writes each page with its own head tags and visible content', () => {
  SUB_PAGES.forEach((page) => {
    const html = read(page.path.slice(1), 'index.html');
    const url = `${routes.siteUrl}${page.path}`;
    assert.equal(count(html, /<title>/g), 1, page.path);
    assert.equal(count(html, /rel="canonical"/g), 1, page.path);
    assert.ok(html.includes(`<link rel="canonical" href="${url}" />`), page.path);
    assert.ok(html.includes(`<meta property="og:url" content="${url}" />`), page.path);
    assert.equal(count(html, /name="description"/g), 1, page.path);
    assert.equal(count(html, /<h1[\s>]/g), 1, page.path);
    assert.ok(!html.includes('<div id="root"></div>'), page.path);
    assert.ok(!html.includes('<noscript>'), page.path);
    assert.ok(!html.includes('name="keywords"'), page.path);
  });
});

test('describes a service page with breadcrumb, service and FAQ data', () => {
  const types = jsonLd(read('estate-planning', 'index.html')).map((item) => item['@type']);
  ['Organization', 'BreadcrumbList', 'Service', 'FAQPage'].forEach((type) => assert.ok(types.includes(type), type));
});

test('describes the FAQs page with its questions', () => {
  const faqPage = jsonLd(read('faqs', 'index.html')).find((item) => item['@type'] === 'FAQPage');
  assert.ok(faqPage.mainEntity.length >= 5);
});

test('writes a 404 page that search engines will not index', () => {
  const html = read('404.html');
  assert.match(html, /<meta name="robots" content="noindex, follow" \/>/);
  assert.match(html, /Page not found/);
  assert.equal(count(html, /rel="canonical"/g), 0);
});

test('fails loudly when the shell has no root element', () => {
  const options = { page: routes.pages[1], body: 'x', jsonLd: [] };
  assert.throws(() => fillShell('<html><head></head><body></body></html>', options), /root/);
});

test('hosting serves every page from its own file', () => {
  SUB_PAGES.forEach((page) => {
    assert.ok(
      vercel.rewrites.some((rule) => rule.source === page.path && rule.destination === `${page.path}/index.html`),
      `missing rewrite for ${page.path}`
    );
  });
});

test('hosting keeps the blog and admin working and lets unknown addresses 404', () => {
  const destination = (source) => vercel.rewrites.find((rule) => rule.source === source)?.destination;
  assert.equal(destination('/blogs'), '/api/post-page?list=1');
  assert.equal(destination('/blogs/:slug'), '/api/post-page?slug=:slug');
  assert.equal(destination('/admin'), '/index.html');
  assert.ok(!vercel.rewrites.some((rule) => rule.source.includes('(')), 'no catch-all rewrite');
  assert.equal(vercel.trailingSlash, false);
  assert.ok(vercel.redirects.some((rule) => rule.source === '/blog' && rule.destination === '/blogs'));
});
