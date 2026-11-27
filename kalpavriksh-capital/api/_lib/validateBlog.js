const { parsePositiveInt } = require('./validate');

const SORTS = ['newest', 'oldest'];
const BULK_ACTIONS = ['publish', 'unpublish', 'delete', 'feature'];
const MAX_BULK_IDS = 100;
const MAX_OFFSET = 10000;
const MAX_POST_ID = 2147483647; // posts.id is a Postgres SERIAL (int4); larger values would fail the ::int[] cast
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

/** Normalises the public list query (sort, month, offset, featured) to safe values. */
function validateListQuery(query) {
  const input = query || {};
  const sort = SORTS.includes(asText(input.sort)) ? asText(input.sort) : 'newest';
  const month = MONTH_PATTERN.test(asText(input.month)) ? asText(input.month) : null;

  const rawOffset = asText(input.offset);
  const parsedOffset = /^\d+$/.test(rawOffset) ? Number.parseInt(rawOffset, 10) : null;
  const offset = parsedOffset === null ? null : Math.min(parsedOffset, MAX_OFFSET);

  return { sort, month, offset, featuredOnly: asText(input.featured) === '1' };
}

/** Validates a bulk admin action. Returns { value } or { error }. */
function validateBulk(input) {
  if (!input || typeof input !== 'object') return { error: 'Request body must be a JSON object' };
  if (!BULK_ACTIONS.includes(input.action)) return { error: `action must be one of: ${BULK_ACTIONS.join(', ')}` };
  if (!Array.isArray(input.ids) || input.ids.length === 0) return { error: 'ids must be a non-empty list' };
  if (input.ids.length > MAX_BULK_IDS) return { error: `at most ${MAX_BULK_IDS} posts per request` };
  if (input.ids.some((id) => Number(id) > MAX_POST_ID)) return { error: 'ids must be valid post numbers' };

  const ids = [...new Set(input.ids.map((id) => parsePositiveInt(String(id), 0, Number.MAX_SAFE_INTEGER)))];
  if (ids.some((id) => id === 0) || input.ids.some((id) => !/^\d+$/.test(String(id)))) {
    return { error: 'ids must be positive whole numbers' };
  }
  if (input.action === 'feature' && ids.length !== 1) return { error: 'only one post can be featured' };

  return { value: { action: input.action, ids } };
}

module.exports = { validateListQuery, validateBulk, MAX_BULK_IDS, MAX_OFFSET };
