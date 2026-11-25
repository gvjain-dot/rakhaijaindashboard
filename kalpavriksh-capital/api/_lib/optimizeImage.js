const sharp = require('sharp');

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 80;

/**
 * Shrinks an uploaded image to web size: at most MAX_WIDTH wide, EXIF-rotated, re-encoded as WebP.
 * Optimisation is best effort. If the bytes cannot be decoded, or the result is not smaller, the original is
 * returned unchanged so an upload is never blocked by it.
 *
 * @param {Buffer} body raw image bytes
 * @param {string} contentType original MIME type
 * @param {string} extension original file extension
 * @returns {Promise<{ body: Buffer, contentType: string, extension: string, optimized: boolean }>}
 */
async function optimizeImage(body, contentType, extension) {
  const original = { body, contentType, extension, optimized: false };
  try {
    const output = await sharp(body, { animated: contentType === 'image/webp' })
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    if (output.length >= body.length) return original;
    return { body: output, contentType: 'image/webp', extension: 'webp', optimized: true };
  } catch (error) {
    console.warn('[api] image optimisation skipped:', error.message);
    return original;
  }
}

module.exports = { optimizeImage, MAX_WIDTH };
