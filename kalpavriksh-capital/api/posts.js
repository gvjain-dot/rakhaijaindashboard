const { getSql } = require('./_lib/db');
const { send, methodNotAllowed, serverError } = require('./_lib/http');
const { parsePositiveInt, escapeLike } = require('./_lib/validate');
const { validateListQuery } = require('./_lib/validateBlog');

const DEFAULT_PAGE_SIZE = 9;
const MAX_PAGE_SIZE = 24;
const MAX_SEARCH_LENGTH = 100;

function firstString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

const MAX_TAG_LENGTH = 30;
const POPULAR_TAG_COUNT = 20;

/** Tags are stored lowercase with single spaces, so the filter is normalised the same way. */
function normalizeTag(value) {
  return firstString(value).replace(/\s+/g, ' ').toLowerCase().slice(0, MAX_TAG_LENGTH);
}

/**
 * GET /api/posts?q=&category=&tag=&month=&sort=&page=&limit=&offset=
 * Live posts (published, date reached) without body content.
 *
 * In the default view (no search/category/tag/month, newest first) the lead post (the one marked featured, otherwise
 * the newest) is returned separately as `featured` and left out of the grid, so it is never shown twice. Any filter or the
 * oldest-first sort treats it like an ordinary post. `offset` (load-more windows) wins over `page`.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  try {
    const sql = getSql();
    const search = firstString(req.query.q).slice(0, MAX_SEARCH_LENGTH);
    const category = firstString(req.query.category).slice(0, 50) || null;
    const tag = normalizeTag(req.query.tag) || null;
    const { sort, month, offset: requestedOffset } = validateListQuery(req.query);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = requestedOffset === null ? (parsePositiveInt(req.query.page, 1, 1000) - 1) * limit : requestedOffset;
    const page = Math.floor(offset / limit) + 1;
    const pattern = search ? `%${escapeLike(search)}%` : null;
    const oldest = sort === 'oldest';
    const hideFeatured = !search && !category && !tag && !month && !oldest;

    const [posts, counts, facetRows, featured] = await Promise.all([
      sql`
        SELECT id, slug, title, excerpt, feature_image, category, tags, external_url,
               reading_minutes, published_at
        FROM posts
        WHERE published = true AND (published_at IS NULL OR published_at <= now())
          AND (${category}::text IS NULL OR category = ${category})
          AND (${tag}::text IS NULL OR ${tag} = ANY(tags))
          AND (${pattern}::text IS NULL OR title ILIKE ${pattern} OR excerpt ILIKE ${pattern})
          AND (${month}::text IS NULL OR to_char(published_at AT TIME ZONE 'UTC', 'YYYY-MM') = ${month})
          AND (NOT ${hideFeatured}::boolean OR id IS DISTINCT FROM (SELECT id FROM posts WHERE published = true AND (published_at IS NULL OR published_at <= now())
                                    ORDER BY featured DESC, published_at DESC NULLS LAST, id DESC LIMIT 1))
        ORDER BY CASE WHEN ${oldest}::boolean THEN published_at END ASC NULLS LAST,
                 published_at DESC NULLS LAST, id DESC
        LIMIT ${limit} OFFSET ${offset}`,
      sql`
        SELECT COUNT(*)::int AS total
        FROM posts
        WHERE published = true AND (published_at IS NULL OR published_at <= now())
          AND (${category}::text IS NULL OR category = ${category})
          AND (${tag}::text IS NULL OR ${tag} = ANY(tags))
          AND (${pattern}::text IS NULL OR title ILIKE ${pattern} OR excerpt ILIKE ${pattern})
          AND (${month}::text IS NULL OR to_char(published_at AT TIME ZONE 'UTC', 'YYYY-MM') = ${month})
          AND (NOT ${hideFeatured}::boolean OR id IS DISTINCT FROM (SELECT id FROM posts WHERE published = true AND (published_at IS NULL OR published_at <= now())
                                    ORDER BY featured DESC, published_at DESC NULLS LAST, id DESC LIMIT 1))`,
      // Categories, popular tags and the archive in one round trip. The archive ignores the current filters on
      // purpose, so its counts stay stable while browsing.
      sql`
        SELECT
          (SELECT COALESCE(json_agg(category ORDER BY category), '[]'::json)
             FROM (SELECT DISTINCT category FROM posts
                   WHERE published = true AND (published_at IS NULL OR published_at <= now()) AND category IS NOT NULL) AS c
          ) AS categories,
          (SELECT COALESCE(json_agg(tag ORDER BY uses DESC, tag), '[]'::json)
             FROM (SELECT tag, COUNT(*) AS uses
                   FROM (SELECT unnest(tags) AS tag FROM posts
                         WHERE published = true AND (published_at IS NULL OR published_at <= now())) AS live_tags
                   GROUP BY tag ORDER BY uses DESC, tag LIMIT ${POPULAR_TAG_COUNT}) AS t
          ) AS tags,
          (SELECT COALESCE(json_agg(json_build_object('year', year, 'month', month, 'count', count)
                                    ORDER BY year DESC, month DESC), '[]'::json)
             FROM (SELECT EXTRACT(YEAR FROM published_at AT TIME ZONE 'UTC')::int AS year,
                          EXTRACT(MONTH FROM published_at AT TIME ZONE 'UTC')::int AS month,
                          COUNT(*)::int AS count
                   FROM posts
                   WHERE published = true AND published_at IS NOT NULL AND published_at <= now()
                   GROUP BY 1, 2) AS a
          ) AS archive`,
      hideFeatured
        ? sql`
            SELECT id, slug, title, excerpt, feature_image, category, tags, external_url,
                   reading_minutes, published_at
            FROM posts
            WHERE id = (SELECT id FROM posts WHERE published = true AND (published_at IS NULL OR published_at <= now())
                        ORDER BY featured DESC, published_at DESC NULLS LAST, id DESC LIMIT 1)
            LIMIT 1`
        : Promise.resolve([]),
    ]);

    const facets = facetRows[0] || {};
    // Blog content changes rarely: serve from the CDN for 5 minutes, then refresh in the background for a day.
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
    return send(res, 200, {
      posts,
      featured: featured[0] || null,
      archive: facets.archive || [],
      categories: facets.categories || [],
      tags: facets.tags || [],
      pagination: { total: counts[0].total, page, limit, offset },
    });
  } catch (error) {
    return serverError(res, error);
  }
};
