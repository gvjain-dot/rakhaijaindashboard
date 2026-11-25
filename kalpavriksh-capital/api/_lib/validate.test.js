const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePost, validateEmail, escapeLike, parsePositiveInt, readingMinutes, SLUG_PATTERN } = require('./validate');

const validInput = () => ({
  title: 'Asset Allocation 101',
  excerpt: 'Why allocation matters more than stock picking.',
  content: 'Some body text',
});

test('derives a slug from the title when none is given', () => {
  const result = validatePost(validInput());
  assert.equal(result.value.slug, 'asset-allocation-101');
});

test('rejects a missing title and excerpt', () => {
  const result = validatePost({ content: 'x' });
  assert.ok(result.errors.some((message) => message.startsWith('title')));
  assert.ok(result.errors.some((message) => message.startsWith('excerpt')));
});

test('rejects an invalid slug', () => {
  const result = validatePost({ ...validInput(), slug: "Bad Slug'; DROP TABLE posts;--" });
  assert.ok(result.errors.some((message) => message.startsWith('slug')));
});

test('requires content unless an external URL is given', () => {
  assert.ok(validatePost({ ...validInput(), content: '' }).errors);
  assert.ok(validatePost({ ...validInput(), content: '', external_url: 'https://example.com/a' }).value);
});

test('accepts site-relative external URLs but not javascript: URLs', () => {
  assert.ok(validatePost({ ...validInput(), external_url: '/asset-allocation' }).value);
  assert.ok(validatePost({ ...validInput(), external_url: 'javascript:alert(1)' }).errors);
  assert.ok(validatePost({ ...validInput(), external_url: '//evil.example.com' }).errors);
});

test('rejects a non-http feature image URL', () => {
  assert.ok(validatePost({ ...validInput(), feature_image: 'data:text/html;base64,AAAA' }).errors);
});

test('only treats published === true as published', () => {
  assert.equal(validatePost({ ...validInput(), published: 'true' }).value.published, false);
  assert.equal(validatePost({ ...validInput(), published: true }).value.published, true);
});

test('escapeLike neutralises LIKE wildcards', () => {
  assert.equal(escapeLike('50%_off\\'), '50\\%\\_off\\\\');
});

test('parsePositiveInt falls back and caps', () => {
  assert.equal(parsePositiveInt('abc', 9, 24), 9);
  assert.equal(parsePositiveInt('-3', 9, 24), 9);
  assert.equal(parsePositiveInt('500', 9, 24), 24);
});

test('readingMinutes is at least one minute', () => {
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('word '.repeat(1000)), 5);
});

test('SLUG_PATTERN accepts normal slugs only', () => {
  assert.ok(SLUG_PATTERN.test('what-will-replace-your-salary'));
  assert.ok(!SLUG_PATTERN.test('Has Spaces'));
  assert.ok(!SLUG_PATTERN.test('trailing-'));
});

test('rejects plain http, credentials and encoded or backslash paths', () => {
  assert.ok(validatePost({ ...validInput(), feature_image: 'http://example.com/a.png' }).errors);
  assert.ok(validatePost({ ...validInput(), feature_image: 'https://user:pw@example.com/a.png' }).errors);
  assert.ok(validatePost({ ...validInput(), external_url: '/%2f%2fevil.com' }).errors);
  assert.ok(validatePost({ ...validInput(), external_url: '/\\evil.com' }).errors);
  assert.ok(validatePost({ ...validInput(), feature_image: 'https://abc.public.blob.vercel-storage.com/blog/x.png' }).value);
});

// ---- SEO and blog-feature fields ------------------------------------------------------------

test('accepts and normalises the SEO fields', () => {
  const result = validatePost({
    ...validInput(),
    feature_image_alt: '  A growing tree  ',
    social_image: 'https://example.com/share.png',
    canonical_url: 'https://www.example.com/original',
    noindex: true,
    focus_keyword: ' asset allocation ',
  });
  assert.equal(result.value.feature_image_alt, 'A growing tree');
  assert.equal(result.value.social_image, 'https://example.com/share.png');
  assert.equal(result.value.canonical_url, 'https://www.example.com/original');
  assert.equal(result.value.noindex, true);
  assert.equal(result.value.focus_keyword, 'asset allocation');
});

test('SEO fields are optional and default to empty', () => {
  const { value } = validatePost(validInput());
  assert.equal(value.feature_image_alt, null);
  assert.equal(value.social_image, null);
  assert.equal(value.canonical_url, null);
  assert.equal(value.noindex, false);
  assert.equal(value.focus_keyword, null);
  assert.deepEqual(value.tags, []);
  assert.equal(value.published_at, null);
});

test('noindex is only true for a real boolean true', () => {
  assert.equal(validatePost({ ...validInput(), noindex: 'true' }).value.noindex, false);
  assert.equal(validatePost({ ...validInput(), noindex: 1 }).value.noindex, false);
});

test('rejects insecure social image and canonical urls', () => {
  assert.ok(validatePost({ ...validInput(), social_image: 'http://example.com/a.png' }).errors);
  assert.ok(validatePost({ ...validInput(), canonical_url: 'javascript:alert(1)' }).errors);
  assert.ok(validatePost({ ...validInput(), canonical_url: '/relative/path' }).errors);
});

test('normalises tags: trims, lowercases, de-duplicates and drops blanks', () => {
  const { value } = validatePost({ ...validInput(), tags: [' Retirement ', 'retirement', 'Tax   Planning', '', '  '] });
  assert.deepEqual(value.tags, ['retirement', 'tax planning']);
});

test('rejects too many tags, over-long tags and non-array tags', () => {
  const tooMany = Array.from({ length: 11 }, (_, index) => `tag${index}`);
  assert.ok(validatePost({ ...validInput(), tags: tooMany }).errors);
  assert.ok(validatePost({ ...validInput(), tags: ['x'.repeat(31)] }).errors);
  assert.ok(validatePost({ ...validInput(), tags: 'a,b' }).errors);
  assert.ok(validatePost({ ...validInput(), tags: [42] }).errors);
});

test('published_at accepts an ISO date and rejects nonsense', () => {
  const iso = '2026-12-01T09:30:00.000Z';
  assert.equal(validatePost({ ...validInput(), published_at: iso }).value.published_at, iso);
  assert.equal(validatePost({ ...validInput(), published_at: '' }).value.published_at, null);
  assert.ok(validatePost({ ...validInput(), published_at: 'not-a-date' }).errors);
  assert.ok(validatePost({ ...validInput(), published_at: '1850-01-01T00:00:00Z' }).errors);
  assert.ok(validatePost({ ...validInput(), published_at: 12345 }).errors);
});

test('validateEmail trims, lowercases and rejects malformed addresses', () => {
  assert.equal(validateEmail('  Rakhi@Example.COM '), 'rakhi@example.com');
  assert.equal(validateEmail('nope'), null);
  assert.equal(validateEmail('a@b'), null);
  assert.equal(validateEmail('has space@example.com'), null);
  assert.equal(validateEmail(`${'a'.repeat(250)}@example.com`), null);
  assert.equal(validateEmail(undefined), null);
  assert.equal(validateEmail(42), null);
});
