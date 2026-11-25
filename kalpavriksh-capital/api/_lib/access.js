const { timingSafeEqual } = require('crypto');

/** Constant-time comparison so a preview token can't be guessed by timing responses. */
function tokenMatches(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string' || provided.length === 0) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Live = published and its publish date (if any) has arrived; a future date means "scheduled". */
function isLive(row) {
  return row.published === true && (!row.published_at || new Date(row.published_at) <= new Date());
}

module.exports = { tokenMatches, isLive };
