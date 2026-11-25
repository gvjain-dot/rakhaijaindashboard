const { getSql } = require('../_lib/db');
const { isAuthorized } = require('../_lib/auth');
const { send, methodNotAllowed, serverError } = require('../_lib/http');

const MAX_ROWS = 5000;
const MAX_BULK_IDS = 100;
const MAX_ID = 2147483647; // subscribers.id is an int4

function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listSubscribers(sql, req, res) {
  const rows = await sql`
    SELECT id, email, source, created_at
    FROM subscribers
    ORDER BY created_at DESC
    LIMIT ${MAX_ROWS}`;
  res.setHeader('Cache-Control', 'no-store');
  return send(res, 200, { subscribers: rows });
}

/** Parses "1,2,3" into unique positive int4 ids, or null when the list is empty, too long or malformed. */
function parseIds(raw) {
  if (typeof raw !== 'string' || raw === '') return null;
  const parts = raw.split(',');
  if (parts.length > MAX_BULK_IDS || !parts.every((part) => /^\d+$/.test(part))) return null;
  const ids = [...new Set(parts.map(Number))];
  return ids.every((id) => id > 0 && id <= MAX_ID) ? ids : null;
}

async function deleteSubscribers(sql, req, res) {
  const ids = parseIds(req.query.ids);
  if (!ids) return send(res, 400, null, `Choose between 1 and ${MAX_BULK_IDS} subscribers`);
  const removed = await sql`DELETE FROM subscribers WHERE id = ANY(${ids}::int[]) RETURNING id`;
  return send(res, 200, { deleted: removed.length });
}

async function deleteSubscriber(sql, req, res) {
  if (req.query.ids !== undefined) return deleteSubscribers(sql, req, res);
  const id = parseId(req.query.id);
  if (!id) return send(res, 400, null, 'A valid subscriber id is required');
  const rows = await sql`DELETE FROM subscribers WHERE id = ${id} RETURNING id`;
  if (rows.length === 0) return send(res, 404, null, 'Subscriber not found');
  return send(res, 200, { deleted: id });
}

/** /api/admin/subscribers - GET list, DELETE ?id= remove. Requires a Bearer token. */
module.exports = async function handler(req, res) {
  if (!isAuthorized(req)) return send(res, 401, null, 'Unauthorized');

  const handlers = { GET: listSubscribers, DELETE: deleteSubscriber };
  const action = handlers[req.method];
  if (!action) return methodNotAllowed(res, Object.keys(handlers));

  try {
    return await action(getSql(), req, res);
  } catch (error) {
    return serverError(res, error);
  }
};
