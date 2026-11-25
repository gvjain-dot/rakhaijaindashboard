import { analyzeSeo } from './seoAnalysis';

const words = (count, filler = 'word') => Array.from({ length: count }, () => filler).join(' ');

const GOOD_TITLE = 'Asset Allocation Basics: A Simple Guide for Investors'; // 52 chars
const GOOD_DESCRIPTION =
  'Learn why asset allocation drives your investment returns, how to split money across asset classes, and a simple rule of thumb to start.'; // ~137 chars

const wellOptimised = () => ({
  title: GOOD_TITLE,
  slug: 'asset-allocation-basics',
  excerpt: GOOD_DESCRIPTION,
  seo_title: '',
  seo_description: '',
  focus_keyword: 'asset allocation',
  feature_image: 'https://img.test/tree.png',
  feature_image_alt: 'A tree with coins for leaves',
  content: [
    `Asset allocation is the most important decision you make. ${words(80)}`,
    '## Why it matters',
    words(250),
    '## How to start',
    `${words(250)} Read more in [our guide](/blogs/risk-profiling).`,
  ].join('\n\n'),
});

const byId = (result, id) => result.checks.find((check) => check.id === id);

test('a well-optimised article scores 100 with every check passing', () => {
  const result = analyzeSeo(wellOptimised());
  expect(result.checks.filter((check) => check.status !== 'good')).toEqual([]);
  expect(result.score).toBe(100);
  expect(result.level).toBe('good');
});

test('an empty article fails the basics and scores low', () => {
  const result = analyzeSeo({ title: '', slug: '', excerpt: '', content: '' });
  expect(byId(result, 'title-length').status).toBe('bad');
  expect(byId(result, 'description-length').status).toBe('bad');
  expect(byId(result, 'word-count').status).toBe('bad');
  expect(result.level).toBe('poor');
  expect(result.score).toBeLessThan(40);
});

test('seo_title and seo_description take priority over title and excerpt', () => {
  const form = { ...wellOptimised(), seo_title: 'Short', seo_description: 'Too short' };
  expect(byId(analyzeSeo(form), 'title-length').status).toBe('warn');
  expect(byId(analyzeSeo(form), 'description-length').status).toBe('warn');
});

test('title and description lengths are judged against search result limits', () => {
  expect(byId(analyzeSeo({ ...wellOptimised(), title: 'x'.repeat(75) }), 'title-length').status).toBe('warn');
  expect(byId(analyzeSeo({ ...wellOptimised(), excerpt: 'x'.repeat(200) }), 'description-length').status).toBe('warn');
});

test('without a focus keyword it asks for one and skips the keyword checks', () => {
  const result = analyzeSeo({ ...wellOptimised(), focus_keyword: '' });
  expect(byId(result, 'keyword-set').status).toBe('warn');
  expect(byId(result, 'keyword-in-title')).toBeUndefined();
  expect(byId(result, 'keyword-in-intro')).toBeUndefined();
});

test('keyword checks are case-insensitive and detect where the keyword is missing', () => {
  const form = { ...wellOptimised(), focus_keyword: 'ASSET ALLOCATION' };
  expect(byId(analyzeSeo(form), 'keyword-in-title').status).toBe('good');

  const missing = { ...wellOptimised(), focus_keyword: 'mutual funds' };
  const result = analyzeSeo(missing);
  expect(byId(result, 'keyword-in-title').status).toBe('bad');
  expect(byId(result, 'keyword-in-description').status).toBe('bad');
  expect(byId(result, 'keyword-in-intro').status).toBe('bad');
  expect(byId(result, 'keyword-in-slug').status).toBe('bad');
});

test('the keyword must appear in the first 100 words, not just anywhere', () => {
  const form = { ...wellOptimised(), content: `${words(150)} asset allocation here\n\n## Heading\n\n${words(200)}` };
  expect(byId(analyzeSeo(form), 'keyword-in-intro').status).toBe('bad');
});

test('word count: good from 600 words, warn from 300, bad below', () => {
  expect(byId(analyzeSeo({ ...wellOptimised(), content: words(650) }), 'word-count').status).toBe('good');
  expect(byId(analyzeSeo({ ...wellOptimised(), content: words(350) }), 'word-count').status).toBe('warn');
  expect(byId(analyzeSeo({ ...wellOptimised(), content: words(100) }), 'word-count').status).toBe('bad');
});

test('subheadings: two or more is good, one is a warning, none is bad (## and ### count)', () => {
  const body = (headings) => `${words(400)}\n\n${headings}`;
  expect(byId(analyzeSeo({ ...wellOptimised(), content: body('## A\n\n## B') }), 'subheadings').status).toBe('good');
  expect(byId(analyzeSeo({ ...wellOptimised(), content: body('## A\n\n### B') }), 'subheadings').status).toBe('good');
  expect(byId(analyzeSeo({ ...wellOptimised(), content: body('## A') }), 'subheadings').status).toBe('warn');
  expect(byId(analyzeSeo({ ...wellOptimised(), content: body('no headings') }), 'subheadings').status).toBe('bad');
});

test('a feature image needs alt text, and no image means the alt check is skipped', () => {
  expect(byId(analyzeSeo({ ...wellOptimised(), feature_image_alt: '' }), 'image-alt').status).toBe('bad');
  const noImage = analyzeSeo({ ...wellOptimised(), feature_image: '', feature_image_alt: '' });
  expect(byId(noImage, 'image-alt')).toBeUndefined();
  expect(byId(noImage, 'has-image').status).toBe('warn');
});

test('internal links are site paths; external and protocol-relative links do not count', () => {
  const withLink = (link) => ({ ...wellOptimised(), content: `${words(400)}\n\n## A\n\n## B\n\nSee ${link}.` });
  expect(byId(analyzeSeo(withLink('[guide](/blogs/risk)')), 'internal-links').status).toBe('good');
  expect(byId(analyzeSeo(withLink('[guide](//evil.example)')), 'internal-links').status).toBe('warn');
  expect(byId(analyzeSeo(withLink('[guide](https://other.example)')), 'internal-links').status).toBe('warn');
});

test('long slugs get a warning', () => {
  expect(byId(analyzeSeo({ ...wellOptimised(), slug: `asset-allocation-${'very-long-'.repeat(8)}end` }), 'slug-length').status).toBe('warn');
});

test('every check carries a label and an actionable tip', () => {
  analyzeSeo({ title: '', slug: '', excerpt: '', content: '' }).checks.forEach((check) => {
    expect(check.label).toBeTruthy();
    expect(check.tip).toBeTruthy();
  });
});
