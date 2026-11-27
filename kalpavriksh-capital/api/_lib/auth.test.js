const test = require('node:test');
const assert = require('node:assert/strict');

process.env.ADMIN_PASSWORD = 'correct horse battery staple';
process.env.ADMIN_TOKEN_SECRET = 'test-secret-with-more-than-16-chars';

const { passwordMatches, createToken, isAuthorized, isRateLimited, recordFailedAttempt } = require('./auth');

test('accepts the right password and rejects a wrong one', () => {
  assert.equal(passwordMatches('correct horse battery staple'), true);
  assert.equal(passwordMatches('wrong'), false);
});

test('a freshly created token authorises a request', () => {
  const req = { headers: { authorization: `Bearer ${createToken()}` } };
  assert.equal(isAuthorized(req), true);
});

test('a tampered or missing token is rejected', () => {
  const [payload] = createToken().split('.');
  assert.equal(isAuthorized({ headers: { authorization: `Bearer ${payload}.forged` } }), false);
  assert.equal(isAuthorized({ headers: {} }), false);
  assert.equal(isAuthorized({ headers: { authorization: 'Bearer ' } }), false);
});

test('an expired token is rejected', () => {
  const realNow = Date.now;
  const token = createToken();
  Date.now = () => realNow() + 9 * 60 * 60 * 1000;
  try {
    assert.equal(isAuthorized({ headers: { authorization: `Bearer ${token}` } }), false);
  } finally {
    Date.now = realNow;
  }
});

test('login attempts are limited after repeated failures', () => {
  const client = 'test-client';
  for (let i = 0; i < 5; i += 1) recordFailedAttempt(client);
  assert.equal(isRateLimited(client), true);
  assert.equal(isRateLimited('someone-else'), false);
});

test('tokens with extra segments or an over-long lifetime are rejected', () => {
  const token = createToken();
  assert.equal(isAuthorized({ headers: { authorization: `Bearer ${token}.extra` } }), false);

  const crypto = require('crypto');
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 365 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.ADMIN_TOKEN_SECRET).update(payload).digest('base64url');
  assert.equal(isAuthorized({ headers: { authorization: `Bearer ${payload}.${signature}` } }), false);
});
