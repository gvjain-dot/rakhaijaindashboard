const test = require('node:test');
const assert = require('node:assert/strict');
const { injectSeo, injectListSeo, injectRobots, buildJsonLd, jsonLdScript } = require('./seo');

const BASE = 'https://www.example.com';
const SHELL =
  '<html><head><title>Old</title><meta name="description" content="old" />' +
  '<link rel="canonical" href="https://old.example" /></head><body></body></html>';

const post = () => ({
  slug: 'asset-allocation-101',
  title: 'Asset Allocation 101',
  excerpt: 'Why allocation matters.',
  feature_image: 'https://img.test/tree.png',
  feature_image_alt: 'A tree',
  social_image: null,
  category: 'Investing',
  tags: ['asset allocation', 'risk'],
  seo_title: null,
  seo_description: null,
  canonical_url: null,
  noindex: false,
  published_at: '2026-02-01T00:00:00.000Z',
  updated_at: '2026-02-03T00:00:00.000Z',
});

/** Pulls the JSON-LD objects back out of the injected html. */
function readJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'expected a JSON-LD script tag');
  return JSON.parse(match[1]);
}

test('sets the title, description and canonical from the post', () => {
  const html = injectSeo(SHELL, post(), { base: BASE });
  assert.match(html, /<title>Asset Allocation 101 \| Kalpvriksh Global<\/title>/);
  assert.match(html, /<meta name="description" content="Why allocation matters\." \/>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.example\.com\/blogs\/asset-allocation-101" \/>/);
  assert.doesNotMatch(html, /old\.example/);
});

test('seo_title and seo_description override the defaults', () => {
  const html = injectSeo(SHELL, { ...post(), seo_title: 'Custom title', seo_description: 'Custom description' }, { base: BASE });
  assert.match(html, /<title>Custom title \| Kalpvriksh Global<\/title>/);
  assert.match(html, /name="description" content="Custom description"/);
});

test('a custom canonical url replaces the default one', () => {
  const html = injectSeo(SHELL, { ...post(), canonical_url: 'https://original.example/post' }, { base: BASE });
  assert.match(html, /<link rel="canonical" href="https:\/\/original\.example\/post" \/>/);
  assert.match(html, /property="og:url" content="https:\/\/original\.example\/post"/);
});

test('noindex posts tell search engines to stay away; others are indexable', () => {
  assert.match(injectSeo(SHELL, { ...post(), noindex: true }, { base: BASE }), /name="robots" content="noindex, nofollow"/);
  assert.match(injectSeo(SHELL, post(), { base: BASE }), /name="robots" content="index, follow, max-image-preview:large"/);
});

test('prefers the social image, then the feature image, then the site icon', () => {
  const withSocial = injectSeo(SHELL, { ...post(), social_image: 'https://img.test/share.png' }, { base: BASE });
  assert.match(withSocial, /property="og:image" content="https:\/\/img\.test\/share\.png"/);
  assert.match(withSocial, /name="twitter:image" content="https:\/\/img\.test\/share\.png"/);
  assert.match(injectSeo(SHELL, post(), { base: BASE }), /property="og:image" content="https:\/\/img\.test\/tree\.png"/);
  assert.match(injectSeo(SHELL, { ...post(), feature_image: null }, { base: BASE }), /og:image" content="https:\/\/www\.example\.com\/icon-512\.png"/);
});

test('uses the large Twitter card and article meta tags', () => {
  const html = injectSeo(SHELL, post(), { base: BASE });
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /property="article:published_time" content="2026-02-01T00:00:00\.000Z"/);
  assert.match(html, /property="article:modified_time" content="2026-02-03T00:00:00\.000Z"/);
  assert.match(html, /property="article:tag" content="asset allocation"/);
  assert.match(html, /property="article:tag" content="risk"/);
});

test('adds BlogPosting and breadcrumb structured data', () => {
  const [article, breadcrumbs] = readJsonLd(injectSeo(SHELL, post(), { base: BASE }));
  assert.equal(article['@type'], 'BlogPosting');
  assert.equal(article.headline, 'Asset Allocation 101');
  assert.equal(article.datePublished, '2026-02-01T00:00:00.000Z');
  assert.equal(article.dateModified, '2026-02-03T00:00:00.000Z');
  assert.equal(article.author.name, 'Rakhi Jain');
  assert.equal(article.image, 'https://img.test/tree.png');
  assert.equal(article.keywords, 'asset allocation, risk');
  assert.equal(article.articleSection, 'Investing');
  assert.equal(article.mainEntityOfPage['@id'], 'https://www.example.com/blogs/asset-allocation-101');

  assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
  assert.deepEqual(
    breadcrumbs.itemListElement.map((item) => [item.position, item.name]),
    [[1, 'Home'], [2, 'Insights'], [3, 'Asset Allocation 101']]
  );
});

test('uses the post author in structured data, and only the default author gets the job title', () => {
  const [custom] = readJsonLd(injectSeo(SHELL, { ...post(), author_name: ' Jane Doe ' }, { base: BASE }));
  assert.equal(custom.author.name, 'Jane Doe');
  assert.equal('jobTitle' in custom.author, false, "must not attribute Rakhi's credentials to someone else");

  for (const author_name of [null, undefined, '', '   ']) {
    const [fallback] = readJsonLd(injectSeo(SHELL, { ...post(), author_name }, { base: BASE }));
    assert.equal(fallback.author.name, 'Rakhi Jain');
    assert.match(fallback.author.jobTitle, /Chartered Accountant/);
  }
});

test('omits empty optional structured-data fields', () => {
  const [article] = buildJsonLd({ ...post(), tags: [], category: null, updated_at: null }, { base: BASE, url: `${BASE}/x`, imageUrl: `${BASE}/i.png` });
  assert.equal('keywords' in article, false);
  assert.equal('articleSection' in article, false);
  assert.equal(article.dateModified, article.datePublished);
});

test('post text can never break out of the JSON-LD script tag', () => {
  const hostile = { ...post(), title: '</script><script>alert(1)</script>', excerpt: 'x <!-- y' };
  const html = injectSeo(SHELL, hostile, { base: BASE });
  assert.doesNotMatch(html, /<\/script><script>alert/);
  // The data still round-trips through JSON.parse unchanged.
  assert.equal(readJsonLd(html)[0].headline, '</script><script>alert(1)</script>'.slice(0, 110));
});

test('replacement patterns in post text are inserted literally', () => {
  const html = injectSeo(SHELL, { ...post(), title: 'Save $& more $1 today' }, { base: BASE });
  assert.match(html, /<title>Save \$&amp; more \$1 today \| Kalpvriksh Global<\/title>/);
});

test('jsonLdScript escapes angle brackets and line separators', () => {
  const script = jsonLdScript([{ a: '</script> ' }]);
  assert.equal(script.includes('</script> '), false);
  assert.ok(script.startsWith('<script type="application/ld+json">'));
  assert.ok(script.endsWith('</script>'));
});

test('injectRobots marks a page noindex without touching anything else', () => {
  const html = injectRobots(SHELL, 'noindex, nofollow');
  assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/);
  assert.match(html, /<title>Old<\/title>/);
});

// --- /blogs list page ---------------------------------------------------------------------------
test('the list page gets its own title, description and a canonical pointing at /blogs', () => {
  const html = injectListSeo(SHELL, { base: BASE });
  assert.match(html, /<title>Wealth Management &amp; Financial Planning Insights \| Blog<\/title>/);
  assert.ok(html.includes('content="Explore wealth management insights, financial planning strategies, investment knowledge and expert perspectives to make informed financial decisions."'));
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.example\.com\/blogs" \/>/);
  assert.equal((html.match(/name="description"/g) || []).length, 1);
});

test('the list page carries CollectionPage and breadcrumb structured data', () => {
  const graph = readJsonLd(injectListSeo(SHELL, { base: BASE }));
  assert.deepEqual(graph.map((item) => item['@type']), ['CollectionPage', 'BreadcrumbList']);
  assert.equal(graph[0].url, `${BASE}/blogs`);
});

test('a post drops the shell\'s fixed default-image size and alt tags', () => {
  const shell = SHELL.replace('</head>', '<meta property="og:image" content="a" /><meta property="og:image:width" content="1200" /><meta property="og:image:alt" content="logo" /></head>');
  const html = injectSeo(shell, post(), { base: BASE });
  assert.doesNotMatch(html, /og:image:(width|height|alt)/);
  assert.match(html, /property="og:image" content="https:\/\/img\.test\/tree\.png"/);
});
