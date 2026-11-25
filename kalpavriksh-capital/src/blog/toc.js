// Table-of-contents helpers. extractHeadings() reads a Markdown article; createHeadingIds() is used by the
// renderer so the ids it puts on the <h2>/<h3> elements are exactly the ones the contents list links to.

const HEADING_LINE = /^(#{2,3})\s+(.+?)\s*#*\s*$/;
const FENCE_LINE = /^\s*(```|~~~)/;
const FALLBACK_ID = 'section';
const RESERVED_IDS = new Set(['main']); // the skip link targets #main, so no heading may take that id

function stripInlineMarkdown(text) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) → text
    .replace(/[*`~]/g, '')
    .trim();
}

function headingSlug(text) {
  const slug = String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || FALLBACK_ID;
}

/** Returns a function that turns heading text into an id, adding -2, -3… to repeats. Call it in document order. */
export function createHeadingIds() {
  const seen = new Map();
  return (text) => {
    const raw = headingSlug(text);
    const base = RESERVED_IDS.has(raw) ? `${raw}-section` : raw;
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

/** Every h2/h3 heading as { level, text, id, offset } (offset = character index of its line), skipping code fences. */
function scanHeadings(markdown) {
  if (typeof markdown !== 'string' || markdown === '') return [];
  const nextId = createHeadingIds();
  const headings = [];
  let inFence = false;
  let offset = 0;

  markdown.split('\n').forEach((line) => {
    const lineOffset = offset;
    offset += line.length + 1;
    if (FENCE_LINE.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const match = line.match(HEADING_LINE);
    if (!match) return;
    const text = stripInlineMarkdown(match[2]);
    if (!text) return;
    headings.push({ level: match[1].length, text, id: nextId(text), offset: lineOffset });
  });
  return headings;
}

/** The h2/h3 headings of a Markdown string as [{ level, text, id }], skipping fenced code blocks. */
export function extractHeadings(markdown) {
  return scanHeadings(markdown).map(({ offset, ...heading }) => heading);
}

const NEWSLETTER_POSITION = 0.55; // how far through the article the inline signup should sit

/**
 * The id of the h2 the inline newsletter goes before: the section whose start is nearest 55% of the article.
 * The first section is never chosen (the signup should not interrupt the opening), and an article with
 * fewer than two sections gets none. Ids match the rendered headings, repeats included.
 */
export function pickNewsletterHeadingId(markdown) {
  const sections = scanHeadings(markdown).filter((heading) => heading.level === 2);
  if (sections.length < 2) return null;

  const distance = (heading) => Math.abs(heading.offset / markdown.length - NEWSLETTER_POSITION);
  return sections.slice(1).reduce((best, heading) => (distance(heading) < distance(best) ? heading : best)).id;
}

function hastText(node) {
  if (node.type === 'text') return node.value;
  return (node.children || []).map(hastText).join('');
}

/**
 * rehype plugin: puts ids on the rendered h2/h3 elements. Run it AFTER rehype-sanitize, which would
 * otherwise prefix or strip them. Uses the same id rules as extractHeadings().
 */
export function rehypeHeadingIds() {
  return (tree) => {
    const nextId = createHeadingIds();
    const visit = (node) => {
      if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
        node.properties = { ...node.properties, id: nextId(hastText(node)) };
      }
      (node.children || []).forEach(visit);
    };
    visit(tree);
  };
}

/** Flattens React children (strings, numbers, nested elements) to plain text. */
export function plainText(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (node.props) return plainText(node.props.children);
  return '';
}
