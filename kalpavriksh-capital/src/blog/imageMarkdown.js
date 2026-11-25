// Pure helpers for images inside articles. An image is stored as ordinary Markdown so it stays portable:
//   ![alt text](https://…/photo.webp#wide "Caption shown under the image")
// The layout rides in the URL fragment (#wide, #full, #left, #right); no fragment means normal width.

export const IMAGE_LAYOUTS = [
  { value: 'normal', label: 'Normal (text width)' },
  { value: 'wide', label: 'Wide (wider than the text)' },
  { value: 'full', label: 'Full width' },
  { value: 'left', label: 'Small, text wraps on the right' },
  { value: 'right', label: 'Small, text wraps on the left' },
];

const DEFAULT_LAYOUT = 'normal';
const LAYOUT_VALUES = IMAGE_LAYOUTS.map((layout) => layout.value);

const collapse = (text) => String(text || '').replace(/\s+/g, ' ').trim();
const escapeAlt = (text) => collapse(text).replace(/[\\[\]]/g, '\\$&');
const escapeCaption = (text) => collapse(text).replace(/[\\"]/g, '\\$&');
// Spaces and parentheses would end the Markdown link early, so they are percent-encoded.
const safeUrl = (url) => String(url || '').trim().replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');

/** Splits an image src into its address and the layout stored in its fragment. */
export function parseImageSrc(src) {
  const value = String(src || '');
  const hashAt = value.lastIndexOf('#');
  if (hashAt === -1) return { src: value, layout: DEFAULT_LAYOUT };
  const layout = value.slice(hashAt + 1);
  if (!LAYOUT_VALUES.includes(layout)) return { src: value, layout: DEFAULT_LAYOUT };
  return { src: value.slice(0, hashAt), layout };
}

/** Builds the Markdown for one image. Returns '' when there is no address. */
export function buildImageMarkdown({ url, alt = '', caption = '', layout = DEFAULT_LAYOUT }) {
  const { src } = parseImageSrc(safeUrl(url));
  if (!src) return '';
  const fragment = LAYOUT_VALUES.includes(layout) && layout !== DEFAULT_LAYOUT ? `#${layout}` : '';
  const title = collapse(caption) ? ` "${escapeCaption(caption)}"` : '';
  return `![${escapeAlt(alt)}](${src}${fragment}${title})`;
}

/**
 * Puts `snippet` in place of the selection as its own paragraph (blank line before and after).
 * Returns the new text and where the cursor should land (just after the snippet).
 */
export function insertBlock(value, start, end, snippet) {
  const before = value.slice(0, start).replace(/[ \t]+$/, '');
  const after = value.slice(end).replace(/^[ \t]+/, '');
  const lead = before === '' ? '' : before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const trail = after === '' ? '\n' : after.startsWith('\n\n') ? '' : after.startsWith('\n') ? '\n' : '\n\n';
  const head = `${before}${lead}${snippet}`;
  return { value: `${head}${trail}${after}`, cursor: head.length };
}
