import { buildImageMarkdown, insertBlock, parseImageSrc } from './imageMarkdown';

describe('buildImageMarkdown', () => {
  test('builds a plain image when only a url is given', () => {
    expect(buildImageMarkdown({ url: 'https://x.test/a.webp' })).toBe('![](https://x.test/a.webp)');
  });

  test('adds alt text, a layout fragment and a caption', () => {
    const markdown = buildImageMarkdown({ url: 'https://x.test/a.webp', alt: 'Venn diagram', caption: 'Figure 1. Overlap', layout: 'wide' });
    expect(markdown).toBe('![Venn diagram](https://x.test/a.webp#wide "Figure 1. Overlap")');
  });

  test('escapes characters that would break the markdown', () => {
    const markdown = buildImageMarkdown({ url: 'https://x.test/my pic (1).png', alt: 'a [b]', caption: 'say "hi"' });
    expect(markdown).toBe('![a \\[b\\]](https://x.test/my%20pic%20%281%29.png "say \\"hi\\"")');
  });

  test('does not duplicate a layout already on the url', () => {
    expect(buildImageMarkdown({ url: 'https://x.test/a.png#full', layout: 'left' })).toBe('![](https://x.test/a.png#left)');
  });

  test('returns an empty string without a url', () => {
    expect(buildImageMarkdown({ url: '  ' })).toBe('');
  });
});

describe('parseImageSrc', () => {
  test('reads the layout from the fragment', () => {
    expect(parseImageSrc('https://x.test/a.png#right')).toEqual({ src: 'https://x.test/a.png', layout: 'right' });
  });

  test('keeps unknown fragments and defaults to normal', () => {
    expect(parseImageSrc('https://x.test/a.png#top')).toEqual({ src: 'https://x.test/a.png#top', layout: 'normal' });
    expect(parseImageSrc('https://x.test/a.png')).toEqual({ src: 'https://x.test/a.png', layout: 'normal' });
  });
});

describe('insertBlock', () => {
  test('surrounds the snippet with blank lines inside a paragraph', () => {
    const result = insertBlock('Hello world', 5, 5, '![](u)');
    expect(result.value).toBe('Hello\n\n![](u)\n\nworld');
    expect(result.cursor).toBe('Hello\n\n![](u)'.length);
  });

  test('adds no extra blank lines when they already exist', () => {
    expect(insertBlock('One\n\nTwo', 5, 5, '![](u)').value).toBe('One\n\n![](u)\n\nTwo');
  });

  test('works in an empty document and replaces a selection', () => {
    expect(insertBlock('', 0, 0, '![](u)').value).toBe('![](u)\n');
    expect(insertBlock('keep REMOVE keep', 5, 11, '![](u)').value).toBe('keep\n\n![](u)\n\nkeep');
  });
});
