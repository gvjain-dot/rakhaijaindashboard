const { getSql } = require('../_lib/db');
const { send, methodNotAllowed, serverError } = require('../_lib/http');
const { SLUG_PATTERN } = require('../_lib/validate');
const { isLive, tokenMatches } = require('../_lib/access');
const { scoreRelated, fillRelated } = require('../_lib/related');

const RELATED_COUNT = 3;
const RELATED_CANDIDATES = 30;

/**
 * GET /api/posts/:slug - one post plus up to three related posts, each with a `reason`.
 * Candidates (same category or a shared tag) are ranked by scoreRelated: category +5, shared tag +2;
 * any shortfall is filled with the newest articles (reason "Editor’s selection").
 * Drafts and scheduled posts are only returned with their private ?preview=<token>.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  if (!SLUG_PATTERN.test(slug) || slug.length > 100) {
    return send(res, 404, null, 'Post not found');
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, slug, title, excerpt, feature_image, feature_image_alt, content, category, tags,
             external_url, seo_title, seo_description, reading_minutes, published, published_at,
             updated_at, author_name, author_bio, preview_token
      FROM posts
      WHERE slug = ${slug}
      LIMIT 1`;

    const row = rows[0];
    if (!row) return send(res, 404, null, 'Post not found');

    const live = isLive(row);
    const isPreview = !live && tokenMatches(req.query.preview, row.preview_token);
    if (!live && !isPreview) return send(res, 404, null, 'Post not found');

    // Never send the private token or draft state to the browser.
    const post = { ...row };
    delete post.published;
    delete post.preview_token;

    const tags = post.tags || [];
    const candidates =
      post.category || tags.length > 0
        ? await sql`
            SELECT id, slug, title, excerpt, feature_image, category, tags, external_url,
                   reading_minutes, published_at
            FROM posts
            WHERE published = true AND (published_at IS NULL OR published_at <= now())
              AND id <> ${post.id}
              AND (category = ${post.category} OR tags && ${tags}::text[])
            ORDER BY published_at DESC NULLS LAST
            LIMIT ${RELATED_CANDIDATES}`
        : [];
    const scored = scoreRelated(post, candidates, RELATED_COUNT);
    // Too few matches by category or tag: top up with the newest articles so the section always has three.
    const fallback =
      scored.length < RELATED_COUNT
        ? await sql`
            SELECT id, slug, title, excerpt, feature_image, category, tags, external_url,
                   reading_minutes, published_at
            FROM posts
            WHERE published = true AND (published_at IS NULL OR published_at <= now()) AND id <> ${post.id}
            ORDER BY featured DESC, published_at DESC NULLS LAST, id DESC
            LIMIT ${RELATED_COUNT + scored.length}`
        : [];
    const related = fillRelated(post, scored, fallback, RELATED_COUNT);

    res.setHeader('Cache-Control', isPreview ? 'no-store' : 's-maxage=60, stale-while-revalidate=300');
    return send(res, 200, { post, related, preview: isPreview });
  } catch (error) {
    return serverError(res, error);
  }
};
