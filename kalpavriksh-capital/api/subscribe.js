const { getSql } = require('./_lib/db');
const { send, methodNotAllowed, serverError, clientIp } = require('./_lib/http');
const { validateEmail, SLUG_PATTERN } = require('./_lib/validate');
const { createRateLimiter } = require('./_lib/rateLimit');

const SIGNUPS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SOURCE_LENGTH = 100;

const limiter = createRateLimiter({ max: SIGNUPS_PER_WINDOW, windowMs: WINDOW_MS });

/**
 * POST /api/subscribe  { email, source?, website? } - newsletter signup.
 * `website` is a honeypot field hidden from people; bots that fill it get a fake success and nothing is stored.
 * The response is the same whether or not the address was already subscribed, so it never reveals who is on the list.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!limiter.allow(clientIp(req))) return send(res, 429, null, 'Too many attempts. Please try again later.');

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (typeof body.website === 'string' && body.website.trim() !== '') return send(res, 200, { subscribed: true });

  const email = validateEmail(body.email);
  if (!email) return send(res, 400, null, 'Please enter a valid email address.');

  // `source` is only the slug of the post the form was on; anything else is dropped.
  const source =
    typeof body.source === 'string' && body.source.length <= MAX_SOURCE_LENGTH && SLUG_PATTERN.test(body.source)
      ? body.source
      : null;

  try {
    const sql = getSql();
    await sql`INSERT INTO subscribers (email, source) VALUES (${email}, ${source}) ON CONFLICT DO NOTHING`;
    return send(res, 200, { subscribed: true });
  } catch (error) {
    return serverError(res, error);
  }
};
