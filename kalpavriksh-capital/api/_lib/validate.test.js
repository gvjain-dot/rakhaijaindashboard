const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePost, escapeLike, parsePositiveInt, readingMinutes, SLUG_PATTERN } = require('./validate');

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
