const crypto = require('crypto');

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Best-effort limiter: serverless instances do not share memory, so this slows
// casual guessing but is not a hard guarantee.
const attempts = new Map();

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_TOKEN_SECRET must be set (32+ characters)');
  }
  return secret;
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

function passwordMatches(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return crypto.timingSafeEqual(sha256(candidate), sha256(expected));
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const expected = sign(payload);
  const a = Buffer.from(signature || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Date.now();
    // Reject tokens that expire in the past or claim a lifetime longer than we ever issue.
    return typeof exp === 'number' && exp > now && exp - now <= TOKEN_TTL_MS;
  } catch (error) {
    return false;
  }
}

function isAuthorized(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return verifyToken(token);
}

/** Returns true when this client has exceeded the login attempt budget. */
function isRateLimited(clientKey) {
  const now = Date.now();
  const entry = attempts.get(clientKey);
  if (!entry || now - entry.start > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(clientKey) {
  const now = Date.now();
  const entry = attempts.get(clientKey);
  if (!entry || now - entry.start > WINDOW_MS) {
    attempts.set(clientKey, { start: now, count: 1 });
    return;
  }
  attempts.set(clientKey, { start: entry.start, count: entry.count + 1 });
}

function clearAttempts(clientKey) {
  attempts.delete(clientKey);
}

module.exports = {
  passwordMatches,
  createToken,
  isAuthorized,
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
};
