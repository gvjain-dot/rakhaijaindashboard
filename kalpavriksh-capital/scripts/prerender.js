/**
 * Runs after `react-scripts build`. Writes build/<page>/index.html for every page in routes.json, with the
 * page's own head tags, structured data and rendered content, plus build/404.html.
 * build/index.html is read but never changed: api/post-page.js builds the blog pages from it.
 */
const fs = require('node:fs');
const path = require('node:path');
const { renderPath, loadSource } = require('./renderPage');
const { buildStructuredData } = require('./structuredData');
const { jsonLdScript } = require('../api/_lib/seo');
const { escapeXml } = require('../api/_lib/site');
const routes = require('../src/site/routes.json');

const NOT_FOUND = { path: '/404', title: 'Page not found | Kalpvriksh Global' };
const ROOT = '<div id="root"></div>';

/** Replaces the one tag matching `pattern`; a shell without it is a build error, not something to skip. */
function swap(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`Tag not found in the app shell: ${pattern}`);
  // A replacer function keeps `$` sequences in page text from being read as patterns.
  return html.replace(pattern, () => replacement);
}

const metaPattern = (attribute, key) => new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i');
const metaTag = (attribute, key, content) => `<meta ${attribute}="${key}" content="${escapeXml(content)}" />`;

/** Returns the app shell with one page's head tags, structured data and content in place. */
function fillShell(shell, { page, body, jsonLd, noindex = false }) {
  if (!shell.includes(ROOT)) throw new Error('The app shell has no empty root element');
  const url = `${routes.siteUrl}${page.path}`;
  const description = page.description || routes.pages[0].description;
  const tags = [
    ['name', 'description', description],
    ['property', 'og:title', page.title],
    ['property', 'og:description', description],
    ['property', 'og:url', url],
    ['name', 'twitter:title', page.title],
    ['name', 'twitter:description', description],
    ['name', 'twitter:url', url],
    ...(noindex ? [['name', 'robots', 'noindex, follow']] : []),
  ];

  const withTitle = swap(shell, /<title>[\s\S]*?<\/title>/i, `<title>${escapeXml(page.title)}</title>`);
  const withTags = tags.reduce(
    (html, [attribute, key, content]) => swap(html, metaPattern(attribute, key), metaTag(attribute, key, content)),
    withTitle
  );
  // A missing page has no address of its own, so it gets no canonical.
  const canonical = noindex ? '' : `<link rel="canonical" href="${escapeXml(url)}" />`;
  const withCanonical = swap(withTags, /<link\s+rel="canonical"[^>]*>/i, canonical);
  const cleaned = withCanonical
    .replace(/<meta\s+name="keywords"[^>]*>/i, '')
    .replace(/<noscript>[\s\S]*?<\/noscript>/i, '');
  const extra = jsonLd.length > 0 ? jsonLdScript(jsonLd) : '';
  return cleaned
    .replace('</head>', () => `${extra}</head>`)
    .replace(ROOT, () => `<div id="root">${body}</div>`);
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function prerender(buildDir) {
  const shell = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
  const { SERVICE_DETAILS } = loadSource('site/content/serviceDetails');
  const { faqs } = loadSource('site/content/faqs');

  routes.pages.filter((page) => page.path !== '/').forEach((page) => {
    const detail = SERVICE_DETAILS[page.key];
    const jsonLd = buildStructuredData(page, { detail, faqs: page.key === 'faqs' ? faqs : detail?.faqs });
    const html = fillShell(shell, { page, body: renderPath(page.path), jsonLd });
    write(path.join(buildDir, page.path.slice(1), 'index.html'), html);
  });

  const notFound = fillShell(shell, { page: NOT_FOUND, body: renderPath(NOT_FOUND.path), jsonLd: [], noindex: true });
  write(path.join(buildDir, '404.html'), notFound);
}

if (require.main === module) {
  // Any failure exits non-zero, so a broken page stops the deployment.
  prerender(path.join(__dirname, '..', 'build'));
  process.stdout.write(`Prerendered ${routes.pages.length - 1} pages and 404.html\n`);
}

module.exports = { prerender, fillShell };
