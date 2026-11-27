const { createHmac } = require('crypto');
const { getSql } = require('./_lib/db');
const { send, methodNotAllowed, serverError, clientIp } = require('./_lib/http');
const { SLUG_PATTERN } = require('./_lib/validate');
const { createRateLimiter } = require('./_lib/rateLimit');

const HITS_PER_WINDOW = 30;
const WINDOW_MS = 60 * 1000;
const MAX_SLUG_LENGTH = 100;

// Crawlers, link-preview fetchers, headless browsers and scripts: none of them are readers.
const NOT_A_READER =
  /bot|crawl|spider|slurp|headless|preview|facebookexternalhit|curl|wget|python|java\/|httpclient|monitor|lighthouse|pingdom|uptime/i;

const limiter = createRateLimiter({ max: HITS_PER_WINDOW, windowMs: WINDOW_MS });

const header = (req, name) => {
  const value = req.headers[name];
  return typeof value === 'string' ? value : '';
};

/** True for requests that should not count as a human read (bots, prefetches, Do Not Track). */
function shouldIgnore(req) {
  const userAgent = header(req, 'user-agent');
  if (!userAgent || NOT_A_READER.test(userAgent)) return true;
  if (header(req, 'dnt') === '1') return true;
  return header(req, 'purpose') === 'prefetch' || header(req, 'sec-purpose').startsWith('prefetch');
}

const MIN_SALT_LENGTH = 16;

/**
 * The secret that keys the visitor hash: VIEW_HASH_SALT when set, else the admin token secret.
 * Returns null when neither is long enough: an unkeyed hash of an IP is easy to reverse, so then nothing is stored.
 */
function hashSalt() {
  const salt = process.env.VIEW_HASH_SALT || process.env.ADMIN_TOKEN_SECRET || '';
  return salt.length >= MIN_SALT_LENGTH ? salt : null;
}

/**
 * One-way visitor id: HMAC-SHA256, keyed with a server secret, of ip + today's date.
 * It changes every day and can't be reversed without the secret, so it dedupes a visitor within a day
 * without identifying them. The raw IP is never stored. The user agent is deliberately NOT part of it:
 * a client that sent a different one on every request would otherwise count as a new reader each time.
 */
function visitorHash(req, salt) {
  const day = new Date().toISOString().slice(0, 10);
  return createHmac('sha256', salt).update(`${clientIp(req)}|${day}`).digest('hex');
}

/**
 * POST /api/track-view  { slug } - counts one read of a live post per visitor per day.
 * Always answers the same way whether or not the view was counted, so it can't be probed.
 * Counts are approximate by design: blocked scripts and bots are not counted.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!limiter.allow(clientIp(req))) return send(res, 429, null, 'Too many requests.');

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const slug = typeof body.slug === 'string' ? body.slug : '';
  if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    return send(res, 400, null, 'A valid post slug is required');
  }

  res.setHeader('Cache-Control', 'no-store');
  const salt = hashSalt();
  if (shouldIgnore(req) || !salt) return send(res, 200, { ok: true });

  try {
    const sql = getSql();
    // One statement: insert the (post, day, visitor) row, and bump the counter only if that row was new.
    await sql`
      WITH target AS (
        SELECT id FROM posts
        WHERE slug = ${slug} AND published = true AND (published_at IS NULL OR published_at <= now())
      ), counted AS (
        INSERT INTO post_views (post_id, visitor_hash)
        SELECT id, ${visitorHash(req, salt)} FROM target
        ON CONFLICT (post_id, day, visitor_hash) DO NOTHING
        RETURNING post_id
      )
      UPDATE posts SET view_count = view_count + 1
      WHERE id IN (SELECT post_id FROM counted)`;
    return send(res, 200, { ok: true });
  } catch (error) {
    return serverError(res, error);
  }
};
