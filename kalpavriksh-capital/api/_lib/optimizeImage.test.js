const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { optimizeImage, MAX_WIDTH } = require('./optimizeImage');

// Noisy pixels so the PNG is large and WebP can genuinely shrink it.
const makePng = (width, height) =>
  sharp({ create: { width, height, channels: 3, background: { r: 30, g: 120, b: 60 }, noise: { type: 'gaussian', mean: 128, sigma: 30 } } })
    .png()
    .toBuffer();

test('a large image is resized to the maximum width and converted to WebP', async () => {
  const original = await makePng(3200, 1800);
  const result = await optimizeImage(original, 'image/png', 'png');
  const meta = await sharp(result.body).metadata();
  assert.equal(result.optimized, true);
  assert.equal(result.contentType, 'image/webp');
  assert.equal(result.extension, 'webp');
  assert.equal(meta.format, 'webp');
  assert.equal(meta.width, MAX_WIDTH);
  assert.ok(result.body.length < original.length);
});

test('a small image is not enlarged', async () => {
  const original = await makePng(400, 300);
  const result = await optimizeImage(original, 'image/png', 'png');
  const meta = await sharp(result.body).metadata();
  assert.ok(meta.width <= 400);
});

test('bytes that cannot be decoded are returned unchanged', async () => {
  const junk = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
  const result = await optimizeImage(junk, 'image/png', 'png');
  assert.equal(result.optimized, false);
  assert.equal(result.body, junk);
  assert.equal(result.extension, 'png');
});
