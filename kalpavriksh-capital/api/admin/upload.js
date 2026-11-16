const crypto = require('crypto');
const { put } = require('@vercel/blob');
const { isAuthorized } = require('../_lib/auth');
const { send, methodNotAllowed, serverError } = require('../_lib/http');

const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless request bodies are capped at ~4.5 MB
const ALLOWED_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

class PayloadTooLargeError extends Error {}

/** Confirms the bytes really are the claimed image type, since Content-Type is client-controlled. */
function matchesImageSignature(body, contentType) {
  if (contentType === 'image/jpeg') return body.length > 3 && body[0] === 0xff && body[1] === 0xd8 && body[2] === 0xff;
  if (contentType === 'image/png') return body.length > 8 && body.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === 'image/webp') {
    return body.length > 12 && body.subarray(0, 4).toString('ascii') === 'RIFF' && body.subarray(8, 12).toString('ascii') === 'WEBP';
  }
  return false;
}

async function readBody(req) {
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_BYTES) throw new PayloadTooLargeError('Image is too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** POST /api/admin/upload - raw image bytes with an image/* Content-Type. Returns { url }. */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isAuthorized(req)) return send(res, 401, null, 'Unauthorized');

  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const extension = ALLOWED_TYPES[contentType];
  if (!extension) {
    return send(res, 400, null, 'Only JPEG, PNG or WebP images are allowed');
  }

  try {
    const body = await readBody(req);
    if (body.length === 0) return send(res, 400, null, 'The image is empty');
    if (!matchesImageSignature(body, contentType)) {
      return send(res, 400, null, 'The file does not look like a valid image');
    }

    // Never trust a client-supplied file name: generate our own.
    const pathname = `blog/${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, body, { access: 'public', contentType });
    return send(res, 201, { url: blob.url });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return send(res, 413, null, 'Image must be 4 MB or smaller');
    }
    return serverError(res, error);
  }
};

// Disable the default body parser so the raw image bytes can be read.
module.exports.config = { api: { bodyParser: false } };
