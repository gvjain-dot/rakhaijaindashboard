const { getSql } = require('../_lib/db');
const { isAuthorized } = require('../_lib/auth');
const { send, methodNotAllowed, serverError } = require('../_lib/http');
const { validatePost } = require('../_lib/validate');

const UNIQUE_VIOLATION = '23505';

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listPosts(sql, res) {
  const rows = await sql`
    SELECT id, slug, title, excerpt, feature_image, content, category, external_url,
           seo_title, seo_description, reading_minutes, published, published_at,
           created_at, updated_at
    FROM posts
    ORDER BY created_at DESC`;
  return send(res, 200, { posts: rows });
}

async function createPost(sql, req, res) {
  const result = validatePost(req.body);
  if (result.errors) return send(res, 400, null, result.errors.join('; '));
  const p = result.value;

  const rows = await sql`
    INSERT INTO posts (slug, title, excerpt, feature_image, content, category, external_url,
                       seo_title, seo_description, reading_minutes, published, published_at)
    VALUES (${p.slug}, ${p.title}, ${p.excerpt}, ${p.feature_image}, ${p.content}, ${p.category},
            ${p.external_url}, ${p.seo_title}, ${p.seo_description}, ${p.reading_minutes},
            ${p.published}, ${p.published ? new Date().toISOString() : null})
    RETURNING id, slug`;
  return send(res, 201, { post: rows[0] });
}

async function updatePost(sql, req, res) {
  const id = parseId(req.query.id);
  if (!id) return send(res, 400, null, 'A valid post id is required');

  const result = validatePost(req.body);
  if (result.errors) return send(res, 400, null, result.errors.join('; '));
  const p = result.value;

  const rows = await sql`
    UPDATE posts SET
      slug = ${p.slug}, title = ${p.title}, excerpt = ${p.excerpt},
      feature_image = ${p.feature_image}, content = ${p.content}, category = ${p.category},
      external_url = ${p.external_url}, seo_title = ${p.seo_title},
      seo_description = ${p.seo_description}, reading_minutes = ${p.reading_minutes},
      published = ${p.published},
      published_at = CASE WHEN ${p.published} THEN COALESCE(published_at, now()) ELSE published_at END,
      updated_at = now()
    WHERE id = ${id}
    RETURNING id, slug`;

  if (rows.length === 0) return send(res, 404, null, 'Post not found');
  return send(res, 200, { post: rows[0] });
}

async function deletePost(sql, req, res) {
  const id = parseId(req.query.id);
  if (!id) return send(res, 400, null, 'A valid post id is required');

  const rows = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
  if (rows.length === 0) return send(res, 404, null, 'Post not found');
  return send(res, 200, { deleted: id });
}

/** /api/admin/posts - GET list, POST create, PUT ?id= update, DELETE ?id= remove. Requires a Bearer token. */
module.exports = async function handler(req, res) {
  if (!isAuthorized(req)) return send(res, 401, null, 'Unauthorized');

  const handlers = { GET: listPosts, POST: createPost, PUT: updatePost, DELETE: deletePost };
  const action = handlers[req.method];
  if (!action) return methodNotAllowed(res, Object.keys(handlers));

  try {
    const sql = getSql();
    return await action(sql, req, res);
  } catch (error) {
    if (error && error.code === UNIQUE_VIOLATION) {
      return send(res, 409, null, 'A post with this slug already exists');
    }
    return serverError(res, error);
  }
};
