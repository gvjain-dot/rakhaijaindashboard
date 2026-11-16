const { getSql } = require('./_lib/db');
const { siteUrl, escapeXml } = require('./_lib/site');
const { SLUG_PATTERN } = require('./_lib/validate');

const SHELL_TIMEOUT_MS = 5000;

function metaTag(attribute, key, content) {
  return `<meta ${attribute}="${key}" content="${escapeXml(content)}" />`;
}

/** Replaces every existing tag matching `pattern` with `tag`, or inserts it before </head>. */
function upsert(html, pattern, tag) {
  // Replacer functions are used so `$&` / `$'` sequences in post text are never interpreted as patterns.
  return pattern.test(html)
    ? html.replace(new RegExp(pattern.source, 'gi'), () => tag)
    : html.replace('</head>', () => `${tag}\n</head>`);
}

function injectMeta(html, post, url) {
  const title = `${post.seo_title || post.title} | Kalpvriksh Global`;
  const description = post.seo_description || post.excerpt;
  const image = post.feature_image || `${siteUrl()}/icon-512.png`;

  const output = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeXml(title)}</title>`);
  const tags = [
    [/<meta\s+name="description"[^>]*>/i, metaTag('name', 'description', description)],
    [/<meta\s+property="og:title"[^>]*>/i, metaTag('property', 'og:title', title)],
    [/<meta\s+property="og:description"[^>]*>/i, metaTag('property', 'og:description', description)],
    [/<meta\s+property="og:image"[^>]*>/i, metaTag('property', 'og:image', image)],
    [/<meta\s+property="og:url"[^>]*>/i, metaTag('property', 'og:url', url)],
    [/<meta\s+property="og:type"[^>]*>/i, metaTag('property', 'og:type', 'article')],
    [/<meta\s+name="twitter:title"[^>]*>/i, metaTag('name', 'twitter:title', title)],
    [/<meta\s+name="twitter:description"[^>]*>/i, metaTag('name', 'twitter:description', description)],
    [/<meta\s+name="twitter:image"[^>]*>/i, metaTag('name', 'twitter:image', image)],
    [/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeXml(url)}" />`],
  ];
  return tags.reduce((current, [pattern, tag]) => upsert(current, pattern, tag), output);
}

async function loadShell() {
  // Never build this URL from request headers: a spoofed Host would let an attacker's HTML be served (and cached) on our origin.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHELL_TIMEOUT_MS);
  try {
    const response = await fetch(`${siteUrl()}/index.html`, { signal: controller.signal, redirect: 'error' });
    if (!response.ok) throw new Error(`Shell request failed: ${response.status}`);
    if (!String(response.headers.get('content-type') || '').includes('text/html')) {
      throw new Error('Shell response was not HTML');
    }
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET /blogs/:slug (rewritten here). Serves the normal app shell with the post's title, description and
 * share image injected, so search engines and WhatsApp/LinkedIn previews see the right tags.
 * Any problem falls back to the plain shell and the React app handles the page itself.
 */
module.exports = async function handler(req, res) {
  let shell;
  try {
    shell = await loadShell();
  } catch (error) {
    // Do not redirect: that would send every blog URL to the home page during an outage.
    console.error('[post-page] could not load app shell:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).send('Temporarily unavailable. Please try again shortly.');
  }

  let html = shell;
  let status = 200;
  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
    if (SLUG_PATTERN.test(slug) && slug.length <= 100) {
      const sql = getSql();
      const rows = await sql`
        SELECT slug, title, excerpt, feature_image, seo_title, seo_description
        FROM posts
        WHERE slug = ${slug} AND published = true AND external_url IS NULL
        LIMIT 1`;
      if (rows.length > 0) html = injectMeta(shell, rows[0], `${siteUrl()}/blogs/${rows[0].slug}`);
      else if (!rows[0]) status = 404; // unknown/unpublished: real 404 so search engines drop it
    }
  } catch (error) {
    console.error('[post-page] meta injection failed, serving plain shell:', error);
    status = 200;
    res.setHeader('Cache-Control', 'no-store');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(status).send(html);
};
