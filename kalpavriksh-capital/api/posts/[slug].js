const { getSql } = require('../_lib/db');
const { send, methodNotAllowed, serverError } = require('../_lib/http');
const { SLUG_PATTERN } = require('../_lib/validate');

const RELATED_COUNT = 3;

/** GET /api/posts/:slug - one published post plus related posts from the same category. */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  if (!SLUG_PATTERN.test(slug) || slug.length > 100) {
    return send(res, 404, null, 'Post not found');
  }

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, slug, title, excerpt, feature_image, content, category, external_url,
             seo_title, seo_description, reading_minutes, published_at, updated_at
      FROM posts
      WHERE slug = ${slug} AND published = true
      LIMIT 1`;

    if (rows.length === 0) {
      return send(res, 404, null, 'Post not found');
    }

    const post = rows[0];
    const related = post.category
      ? await sql`
          SELECT id, slug, title, excerpt, feature_image, category, external_url,
                 reading_minutes, published_at
          FROM posts
          WHERE published = true AND category = ${post.category} AND id <> ${post.id}
          ORDER BY published_at DESC NULLS LAST
          LIMIT ${RELATED_COUNT}`
      : [];

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return send(res, 200, { post, related });
  } catch (error) {
    return serverError(res, error);
  }
};
