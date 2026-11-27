const { getSql } = require('../_lib/db');
const { isAuthorized } = require('../_lib/auth');
const { send, methodNotAllowed, serverError } = require('../_lib/http');
const { validatePost } = require('../_lib/validate');
const { validateBulk } = require('../_lib/validateBlog');
const { fillDailyViews } = require('../_lib/dailyViews');
const { addTaxonomyTerm, changeTaxonomy, listTaxonomy } = require('../_lib/taxonomy');

const UNIQUE_VIOLATION = '23505';
const MAX_SLUG_LENGTH = 100;
const MAX_COPY_ATTEMPTS = 20;
const TOP_POSTS = 5;
const ATTENTION_POSTS = 5;

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listPosts(sql, req, res) {
  const rows = await sql`
    SELECT id, slug, title, excerpt, feature_image, content, category, external_url,
           seo_title, seo_description, reading_minutes, published, published_at,
           created_at, updated_at, feature_image_alt, social_image, canonical_url,
           noindex, focus_keyword, tags, preview_token,
           featured, author_name, author_bio, view_count
    FROM posts
    ORDER BY created_at DESC`;
  return send(res, 200, { posts: rows });
}

/**
 * Makes `id` the single featured post, or un-features it. It runs only AFTER the post itself was saved,
 * so a failed save (for example a duplicate slug) never changes which post is featured.
 * Returns how many posts were changed by the final statement.
 */
async function setFeatured(sql, id, featured) {
  if (featured) {
    // Guarded by EXISTS so featuring an id that doesn't exist can't clear the current featured post.
    await sql`UPDATE posts SET featured = false WHERE featured AND id <> ${id} AND EXISTS (SELECT 1 FROM posts WHERE id = ${id})`;
    const rows = await sql`UPDATE posts SET featured = true WHERE id = ${id} RETURNING id`;
    return rows.length;
  }
  const rows = await sql`UPDATE posts SET featured = false WHERE id = ${id} AND featured RETURNING id`;
  return rows.length;
}

async function createPost(sql, req, res) {
  const result = validatePost(req.body);
  if (result.errors) return send(res, 400, null, result.errors.join('; '));
  const p = result.value;

  // An explicit date (including a future one, which schedules the post) wins; otherwise publishing stamps "now".
  const publishedAt = p.published_at || (p.published ? new Date().toISOString() : null);

  const rows = await sql`
    INSERT INTO posts (slug, title, excerpt, feature_image, content, category, external_url,
                       seo_title, seo_description, reading_minutes, published, published_at,
                       feature_image_alt, social_image, canonical_url, noindex, focus_keyword, tags,
                       author_name, author_bio)
    VALUES (${p.slug}, ${p.title}, ${p.excerpt}, ${p.feature_image}, ${p.content}, ${p.category},
            ${p.external_url}, ${p.seo_title}, ${p.seo_description}, ${p.reading_minutes},
            ${p.published}, ${publishedAt},
            ${p.feature_image_alt}, ${p.social_image}, ${p.canonical_url}, ${p.noindex},
            ${p.focus_keyword}, ${p.tags}::text[], ${p.author_name}, ${p.author_bio})
    RETURNING id, slug`;
  if (p.featured) await setFeatured(sql, rows[0].id, true);
  return send(res, 201, { post: rows[0] });
}

/** The editor sends back the updated_at it loaded; a missing or unparseable value means "overwrite". */
function baseTimestamp(body) {
  const value = body && typeof body.base_updated_at === 'string' ? body.base_updated_at : '';
  return value && !Number.isNaN(Date.parse(value)) ? value : null;
}

async function updatePost(sql, req, res) {
  const id = parseId(req.query.id);
  if (!id) return send(res, 400, null, 'A valid post id is required');

  const result = validatePost(req.body);
  if (result.errors) return send(res, 400, null, result.errors.join('; '));
  const p = result.value;
  const base = baseTimestamp(req.body);

  const rows = await sql`
    UPDATE posts SET
      slug = ${p.slug}, title = ${p.title}, excerpt = ${p.excerpt},
      feature_image = ${p.feature_image}, content = ${p.content}, category = ${p.category},
      external_url = ${p.external_url}, seo_title = ${p.seo_title},
      seo_description = ${p.seo_description}, reading_minutes = ${p.reading_minutes},
      published = ${p.published},
      feature_image_alt = ${p.feature_image_alt}, social_image = ${p.social_image},
      canonical_url = ${p.canonical_url}, noindex = ${p.noindex},
      focus_keyword = ${p.focus_keyword}, tags = ${p.tags}::text[],
      author_name = ${p.author_name}, author_bio = ${p.author_bio},
      published_at = CASE
        WHEN ${p.published_at}::timestamptz IS NOT NULL THEN ${p.published_at}::timestamptz
        WHEN ${p.published} THEN COALESCE(published_at, now())
        ELSE published_at
      END,
      updated_at = now()
    WHERE id = ${id} AND (${base}::timestamptz IS NULL OR updated_at <= ${base}::timestamptz)
    RETURNING id, slug, updated_at`;

  if (rows.length === 0) {
    // Nothing matched: either the post is gone, or someone saved it after this editor loaded it.
    const existing = base ? await sql`SELECT id FROM posts WHERE id = ${id}` : [];
    if (existing.length > 0) return send(res, 409, null, 'This post was changed elsewhere since you opened it');
    return send(res, 404, null, 'Post not found');
  }

  await setFeatured(sql, id, p.featured);
  return send(res, 200, { post: rows[0] });
}

async function deletePost(sql, req, res) {
  const id = parseId(req.query.id);
  if (!id) return send(res, 400, null, 'A valid post id is required');

  const rows = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
  if (rows.length === 0) return send(res, 404, null, 'Post not found');
  return send(res, 200, { deleted: id });
}

/** POST ?action=bulk { action, ids } - one statement per action, so a bulk change is all-or-nothing. */
async function bulkPosts(sql, req, res) {
  const result = validateBulk(req.body);
  if (result.error) return send(res, 400, null, result.error);
  const { action, ids } = result.value;

  if (action === 'feature') return send(res, 200, { affected: await setFeatured(sql, ids[0], true) });

  let rows;
  if (action === 'publish') {
    rows = await sql`UPDATE posts SET published = true, published_at = COALESCE(published_at, now()), updated_at = now()
                     WHERE id = ANY(${ids}::int[]) RETURNING id`;
  } else if (action === 'unpublish') {
    rows = await sql`UPDATE posts SET published = false, updated_at = now()
                     WHERE id = ANY(${ids}::int[]) RETURNING id`;
  } else {
    rows = await sql`DELETE FROM posts WHERE id = ANY(${ids}::int[]) RETURNING id`;
  }
  return send(res, 200, { affected: rows.length });
}

function copySlug(baseSlug, attempt) {
  const suffix = attempt === 1 ? '-copy' : `-copy-${attempt}`;
  return `${baseSlug.slice(0, MAX_SLUG_LENGTH - suffix.length)}${suffix}`;
}

/**
 * POST ?action=duplicate&id= - copies a post as an unpublished, unfeatured draft with a unique slug.
 * The preview token and zero view count come from the column defaults, so the copy is fully independent.
 */
async function duplicatePost(sql, req, res) {
  const id = parseId(req.query.id);
  if (!id) return send(res, 400, null, 'A valid post id is required');

  const source = await sql`SELECT slug FROM posts WHERE id = ${id}`;
  if (source.length === 0) return send(res, 404, null, 'Post not found');

  for (let attempt = 1; attempt <= MAX_COPY_ATTEMPTS; attempt += 1) {
    try {
      const rows = await sql`
        INSERT INTO posts (slug, title, excerpt, feature_image, content, category, external_url,
                           seo_title, seo_description, reading_minutes, published, published_at,
                           feature_image_alt, social_image, canonical_url, noindex, focus_keyword, tags,
                           author_name, author_bio)
        SELECT ${copySlug(source[0].slug, attempt)}, left('Copy of ' || title, 200), excerpt, feature_image,
               content, category, external_url, seo_title, seo_description, reading_minutes, false, NULL,
               feature_image_alt, social_image, canonical_url, noindex, focus_keyword, tags,
               author_name, author_bio
        FROM posts WHERE id = ${id}
        RETURNING id, slug`;
      return send(res, 201, { post: rows[0] });
    } catch (error) {
      if (!error || error.code !== UNIQUE_VIOLATION) throw error;
    }
  }
  return send(res, 409, null, 'Could not find a free slug for the copy');
}

/** GET ?action=stats - the dashboard overview. View counts are approximate (bots and blocked scripts are not counted). */
async function getStats(sql, req, res) {
  const [counts, subscribers, recent, top, daily, newSubscribers, attention] = await Promise.all([
    sql`SELECT COUNT(*) FILTER (WHERE published AND (published_at IS NULL OR published_at <= now()))::int AS published,
               COUNT(*) FILTER (WHERE NOT published)::int AS drafts,
               COUNT(*) FILTER (WHERE published AND published_at > now())::int AS scheduled,
               COALESCE(SUM(view_count), 0)::int AS total_views
        FROM posts`,
    sql`SELECT COUNT(*)::int AS subscribers FROM subscribers`,
    sql`SELECT COUNT(*)::int AS views30d FROM post_views WHERE day >= CURRENT_DATE - 29`,
    sql`SELECT id, slug, title, view_count FROM posts WHERE view_count > 0
        ORDER BY view_count DESC, id DESC LIMIT ${TOP_POSTS}`,
    sql`SELECT day::text AS day, COUNT(*)::int AS views FROM post_views WHERE day >= CURRENT_DATE - 29 GROUP BY day`,
    sql`SELECT COUNT(*)::int AS n FROM subscribers WHERE created_at >= now() - interval '30 days'`,
    sql`SELECT id, title, published, published_at, updated_at FROM posts
        WHERE NOT published OR published_at > now() ORDER BY updated_at DESC LIMIT ${ATTENTION_POSTS}`,
  ]);

  const c = counts[0] || {};
  return send(res, 200, {
    stats: {
      published: c.published || 0,
      drafts: c.drafts || 0,
      scheduled: c.scheduled || 0,
      totalViews: c.total_views || 0,
      subscribers: (subscribers[0] && subscribers[0].subscribers) || 0,
      views30d: (recent[0] && recent[0].views30d) || 0,
      topPosts: top,
      daily: fillDailyViews(daily, new Date().toISOString().slice(0, 10)),
      newSubscribers30d: (newSubscribers[0] && newSubscribers[0].n) || 0,
      attention,
    },
  });
}

const ROUTES = {
  GET: { default: listPosts, stats: getStats, taxonomy: listTaxonomy },
  POST: { default: createPost, bulk: bulkPosts, duplicate: duplicatePost, taxonomy: changeTaxonomy, 'taxonomy-add': addTaxonomyTerm },
  PUT: { default: updatePost },
  DELETE: { default: deletePost },
};

/**
 * /api/admin/posts - GET list (?action=stats for the dashboard), POST create (?action=bulk | duplicate),
 * PUT ?id= update, DELETE ?id= remove. Requires a Bearer token.
 * Bulk, duplicate and stats live here, not in new files, to stay within the host's serverless function limit.
 */
module.exports = async function handler(req, res) {
  if (!isAuthorized(req)) return send(res, 401, null, 'Unauthorized');

  const methodRoutes = ROUTES[req.method];
  if (!methodRoutes) return methodNotAllowed(res, Object.keys(ROUTES));

  const name = typeof req.query.action === 'string' && req.query.action ? req.query.action : 'default';
  const action = methodRoutes[name];
  if (!action) return send(res, 400, null, 'Unknown action');

  try {
    const sql = getSql();
    return await action(sql, req, res);
  } catch (error) {
    if (error && error.code === UNIQUE_VIOLATION) {
      // Two admins featuring different posts at the same moment collide on the one-featured index.
      if (error.constraint === 'posts_one_featured_idx') {
        return send(res, 409, null, 'Another article was featured at the same moment. Please try again.');
      }
      return send(res, 409, null, 'A post with this slug already exists');
    }
    return serverError(res, error);
  }
};
