// Pure helpers for the editor's Markdown toolbar. They never mutate their input: each returns a new
// value plus where the selection should land, so the caller can restore the cursor.

const WRAPPERS = {
  bold: { before: '**', after: '**', placeholder: 'bold text' },
  italic: { before: '*', after: '*', placeholder: 'italic text' },
};
const LINE_PREFIXES = { h2: '## ', h3: '### ', ul: '- ', quote: '> ' };
const HEADING_PREFIX = /^#{1,6}\s+/;
const NUMBER_PREFIX = /^\d+\.\s+/;
const LINK_PLACEHOLDER_URL = 'https://';

const unchanged = (value, start, end) => ({ value, selectionStart: start, selectionEnd: end });

function wrapSelection(value, start, end, { before, after, placeholder }) {
  const text = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + text + after + value.slice(end);
  const selectionStart = start + before.length;
  return { value: next, selectionStart, selectionEnd: selectionStart + text.length };
}

function insertLink(value, start, end) {
  const text = value.slice(start, end) || 'link text';
  const next = `${value.slice(0, start)}[${text}](${LINK_PLACEHOLDER_URL})${value.slice(end)}`;
  const selectionStart = start + text.length + 3;
  return { value: next, selectionStart, selectionEnd: selectionStart + LINK_PLACEHOLDER_URL.length };
}

/** Expands a selection to whole lines and returns the pieces around it. */
function selectedLines(value, start, end) {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const newlineAfter = value.indexOf('\n', end);
  const lineEnd = newlineAfter === -1 ? value.length : newlineAfter;
  return {
    lineStart,
    lineEnd,
    lines: value.slice(lineStart, lineEnd).split('\n'),
  };
}

function replaceLines(value, { lineStart, lineEnd }, lines) {
  const block = lines.join('\n');
  return {
    value: value.slice(0, lineStart) + block + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + block.length,
  };
}

function toggleLinePrefix(value, start, end, action) {
  const region = selectedLines(value, start, end);
  const prefix = LINE_PREFIXES[action];
  const isHeading = action === 'h2' || action === 'h3';
  const allPrefixed = region.lines.every((line) => line.startsWith(prefix));

  const lines = region.lines.map((line) => {
    if (allPrefixed) return line.slice(prefix.length);
    return prefix + (isHeading ? line.replace(HEADING_PREFIX, '') : line);
  });
  return replaceLines(value, region, lines);
}

function numberLines(value, start, end) {
  const region = selectedLines(value, start, end);
  const allNumbered = region.lines.every((line) => NUMBER_PREFIX.test(line));
  const lines = region.lines.map((line, index) =>
    allNumbered ? line.replace(NUMBER_PREFIX, '') : `${index + 1}. ${line}`
  );
  return replaceLines(value, region, lines);
}

/**
 * Applies a toolbar action ('bold' | 'italic' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'link')
 * to the text between `start` and `end`. Unknown actions leave the text untouched.
 */
export function applyMarkdownFormat(value, start, end, action) {
  if (WRAPPERS[action]) return wrapSelection(value, start, end, WRAPPERS[action]);
  if (LINE_PREFIXES[action]) return toggleLinePrefix(value, start, end, action);
  if (action === 'ol') return numberLines(value, start, end);
  if (action === 'link') return insertLink(value, start, end);
  return unchanged(value, start, end);
}

/** Counts words in Markdown source, ignoring formatting characters. */
export function countWords(markdown) {
  const words = String(markdown || '')
    .replace(/[#>*_`~[\]()!-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}
