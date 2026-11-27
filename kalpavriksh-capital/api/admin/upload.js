const crypto = require('crypto');
const { put } = require('@vercel/blob');
const { isAuthorized } = require('../_lib/auth');
const { send, methodNotAllowed, serverError } = require('../_lib/http');
const { optimizeImage } = require('../_lib/optimizeImage');

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

/**
 * Collects the raw request body using 'data'/'end' listeners. `vercel dev` buffers the body and
 * replays it only through those events, so async iteration (`for await ... of req`) would see nothing.
 * An oversized body is drained rather than buffered, so the connection still closes cleanly.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;
    let tooLarge = false;

    req.on('data', (chunk) => {
      received += chunk.length;
      if (received > MAX_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) reject(new PayloadTooLargeError('Image is too large'));
      else resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

/** POST /api/admin/upload - raw image bytes with an image/* Content-Type. Returns { url }. */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!isAuthorized(req)) return send(res, 401, null, 'Unauthorized');

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('[api] BLOB_READ_WRITE_TOKEN is not set; image uploads are disabled');
    return send(res, 503, null, 'Image storage is not configured. Paste an image URL instead, or add BLOB_READ_WRITE_TOKEN.');
  }

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

    // Resize and convert to WebP so readers never download a multi-MB original.
    const image = await optimizeImage(body, contentType, extension);
    // Never trust a client-supplied file name: generate our own.
    const pathname = `blog/${crypto.randomUUID()}.${image.extension}`;
    const blob = await put(pathname, image.body, { access: 'public', contentType: image.contentType });
    return send(res, 201, { url: blob.url });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return send(res, 413, null, 'Image must be 4 MB or smaller');
    }
    if (error && error.name === 'BlobError') {
      // Storage misconfiguration (e.g. a private store). The caller is an authenticated admin, so the
      // real reason is shown instead of a generic message that hides how to fix it.
      console.error('[api] blob storage error:', error);
      return send(res, 502, null, `Image storage rejected the upload: ${error.message}`);
    }
    return serverError(res, error);
  }
};

// Disable the default body parser so the raw image bytes can be read.
module.exports.config = { api: { bodyParser: false } };
