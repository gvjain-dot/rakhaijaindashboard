const { getSql } = require('./_lib/db');
const { send, methodNotAllowed, serverError } = require('./_lib/http');
const { parsePositiveInt, escapeLike } = require('./_lib/validate');

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 24;
const MAX_SEARCH_LENGTH = 100;

function firstString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** GET /api/posts?q=&category=&page=&limit= - published posts without their body content. */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const sql = getSql();
    const search = firstString(req.query.q).slice(0, MAX_SEARCH_LENGTH);
    const category = firstString(req.query.category).slice(0, 50) || null;
    const limit = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const page = parsePositiveInt(req.query.page, 1, 1000);
    const offset = (page - 1) * limit;
    const pattern = search ? `%${escapeLike(search)}%` : null;

    const [posts, counts, categories] = await Promise.all([
      sql`
        SELECT id, slug, title, excerpt, feature_image, category, external_url,
               reading_minutes, published_at
        FROM posts
        WHERE published = true
          AND (${category}::text IS NULL OR category = ${category})
          AND (${pattern}::text IS NULL OR title ILIKE ${pattern} OR excerpt ILIKE ${pattern})
        ORDER BY published_at DESC NULLS LAST, id DESC
        LIMIT ${limit} OFFSET ${offset}`,
      sql`
        SELECT COUNT(*)::int AS total
        FROM posts
        WHERE published = true
          AND (${category}::text IS NULL OR category = ${category})
          AND (${pattern}::text IS NULL OR title ILIKE ${pattern} OR excerpt ILIKE ${pattern})`,
      sql`
        SELECT DISTINCT category
        FROM posts
        WHERE published = true AND category IS NOT NULL
        ORDER BY category`,
    ]);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return send(res, 200, {
      posts,
      categories: categories.map((row) => row.category),
      pagination: { total: counts[0].total, page, limit },
    });
  } catch (error) {
    return serverError(res, error);
  }
};
