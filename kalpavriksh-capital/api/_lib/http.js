/** Sends a JSON envelope: { success, data, error }. */
function send(res, status, data, error = null) {
  res.status(status).json({ success: status < 400, data: status < 400 ? data : null, error });
}

function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  send(res, 405, null, 'Method not allowed');
}

/** Logs the real error server-side and returns a generic message to the client. */
function serverError(res, error) {
  console.error('[api] unhandled error:', error);
  send(res, 500, null, 'Something went wrong. Please try again later.');
}

/** Prefers headers set by Vercel's edge (not client-controllable) over the spoofable left-most x-forwarded-for entry. */
function clientIp(req) {
  const trusted = req.headers['x-real-ip'] || req.headers['x-vercel-forwarded-for'];
  if (typeof trusted === 'string' && trusted.length > 0) return trusted.split(',')[0].trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

module.exports = { send, methodNotAllowed, serverError, clientIp };
