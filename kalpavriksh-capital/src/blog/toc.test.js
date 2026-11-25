import { extractHeadings, createHeadingIds, plainText, rehypeHeadingIds, pickNewsletterHeadingId } from './toc';

// --- where the inline newsletter goes ----------------------------------------------------------------
const section = (title) => `## ${title}\n\n${'word '.repeat(100)}\n`;
const article = (...titles) => titles.map(section).join('\n');

test('no inline newsletter slot when there are fewer than two h2 sections', () => {
  expect(pickNewsletterHeadingId('')).toBeNull();
  expect(pickNewsletterHeadingId(undefined)).toBeNull();
  expect(pickNewsletterHeadingId(article('Only one'))).toBeNull();
});

test('picks the h2 whose position is nearest 55% of the article', () => {
  // four equal sections start at 0%, 25%, 50%, 75%: 50% is the closest to 55%
  expect(pickNewsletterHeadingId(article('One', 'Two', 'Three', 'Four'))).toBe('three');
});

test('never picks the first section, even for a two-section article', () => {
  expect(pickNewsletterHeadingId(article('Intro', 'Second'))).toBe('second');
});

test('ignores h3 headings and headings inside code fences', () => {
  const markdown = `${section('One')}\n### Not a section\n\n\`\`\`\n## Fake\n\`\`\`\n\n${section('Two')}`;
  expect(pickNewsletterHeadingId(markdown)).toBe('two');
});

test('returns the same id the renderer gives a repeated heading', () => {
  const ids = extractHeadings(article('Summary', 'Summary', 'Summary', 'Summary')).map((heading) => heading.id);
  expect(ids).toContain(pickNewsletterHeadingId(article('Summary', 'Summary', 'Summary', 'Summary')));
});

test('extracts h2 and h3 headings in order with ids', () => {
  const markdown = '# Title\n\nIntro\n\n## First point\n\ntext\n\n### A detail\n\n## Second point';
  expect(extractHeadings(markdown)).toEqual([
    { level: 2, text: 'First point', id: 'first-point' },
    { level: 3, text: 'A detail', id: 'a-detail' },
    { level: 2, text: 'Second point', id: 'second-point' },
  ]);
});

test('ignores headings inside fenced code blocks', () => {
  const markdown = '## Real\n\n```\n## Not a heading\n```\n\n## Also real';
  expect(extractHeadings(markdown).map((heading) => heading.text)).toEqual(['Real', 'Also real']);
});

test('strips inline markdown from heading text', () => {
  const markdown = '## The **bold** and *italic* `code` [link](https://x.test) mix';
  expect(extractHeadings(markdown)[0].text).toBe('The bold and italic code link mix');
});

test('gives repeated headings unique ids', () => {
  const ids = extractHeadings('## Summary\n\n## Summary\n\n## Summary').map((heading) => heading.id);
  expect(ids).toEqual(['summary', 'summary-2', 'summary-3']);
});

test('falls back to a safe id when a heading has no letters or digits', () => {
  expect(extractHeadings('## ???')[0].id).toBe('section');
});

test('createHeadingIds produces the same ids as extractHeadings, in order', () => {
  const markdown = '## Summary\n\n## Other\n\n## Summary';
  const nextId = createHeadingIds();
  expect(['Summary', 'Other', 'Summary'].map(nextId)).toEqual(extractHeadings(markdown).map((heading) => heading.id));
});

test('plainText flattens nested react-style children', () => {
  const children = ['Hello ', { props: { children: ['bold', { props: { children: ' text' } }] } }, 42];
  expect(plainText(children)).toBe('Hello bold text42');
  expect(plainText(null)).toBe('');
});

test('returns an empty list for empty or non-string input', () => {
  expect(extractHeadings('')).toEqual([]);
  expect(extractHeadings(undefined)).toEqual([]);
});

test('rehypeHeadingIds gives rendered h2/h3 elements the same ids the contents list links to', () => {
  const text = (value) => ({ type: 'text', value });
  const element = (tagName, ...children) => ({ type: 'element', tagName, properties: {}, children });
  const tree = {
    type: 'root',
    children: [
      element('h1', text('Title')),
      element('h2', text('Summary')),
      element('p', text('body')),
      element('h3', element('strong', text('A detail'))),
      element('h2', text('Summary')),
    ],
  };
  rehypeHeadingIds()(tree);

  const ids = tree.children.filter((node) => node.properties.id).map((node) => node.properties.id);
  const markdown = '# Title\n\n## Summary\n\nbody\n\n### A detail\n\n## Summary';
  expect(ids).toEqual(extractHeadings(markdown).map((heading) => heading.id));
  expect(tree.children[0].properties.id).toBeUndefined(); // h1 is left alone
});

test('a heading called "Main" never takes the skip link id', () => {
  const nextId = createHeadingIds();
  expect(nextId('Main')).toBe('main-section');
  expect(nextId('Main')).toBe('main-section-2');
});
