const { getSql } = require('./_lib/db');
const { siteUrl } = require('./_lib/site');
const { SLUG_PATTERN } = require('./_lib/validate');
const { injectSeo, injectListSeo, injectRobots, ROBOTS_NOINDEX } = require('./_lib/seo');
const { isLive, tokenMatches } = require('./_lib/access');

const SHELL_TIMEOUT_MS = 5000;

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
 * GET /blogs/:slug (rewritten here). Serves the normal app shell with the post's title, description,
 * canonical, robots, share image and structured data injected, so search engines and WhatsApp/LinkedIn
 * previews see the right tags. A draft or scheduled post is only served with its private ?preview=<token>,
 * marked noindex and uncached. Any problem falls back to the plain shell and the React app handles the page.
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

  // /blogs (the list page) is rewritten here with ?list=1 so it gets its own canonical and meta.
  if (req.query.list === '1') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    return res.status(200).send(injectListSeo(shell, { base: siteUrl() }));
  }

  try {
    const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
    if (SLUG_PATTERN.test(slug) && slug.length <= 100) {
      const sql = getSql();
      const rows = await sql`
        SELECT slug, title, excerpt, feature_image, social_image, canonical_url, noindex, tags, category,
               seo_title, seo_description, published, published_at, updated_at, author_name, preview_token
        FROM posts
        WHERE slug = ${slug} AND external_url IS NULL
        LIMIT 1`;
      const row = rows[0];
      if (!row) {
        status = 404; // unknown slug: a real 404 so search engines drop it
      } else if (isLive(row)) {
        html = injectSeo(shell, row, { base: siteUrl() });
      } else if (tokenMatches(req.query.preview, row.preview_token)) {
        html = injectRobots(shell, ROBOTS_NOINDEX); // private preview: never indexed, never cached
        res.setHeader('Cache-Control', 'no-store');
      } else {
        status = 404; // draft or scheduled, and no valid preview token
      }
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
