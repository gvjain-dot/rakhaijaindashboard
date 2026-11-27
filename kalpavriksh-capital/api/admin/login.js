const {
  passwordMatches,
  createToken,
  isRateLimited,
  recordFailedAttempt,
  clearAttempts,
} = require('../_lib/auth');
const { send, methodNotAllowed, serverError, clientIp } = require('../_lib/http');

const MAX_PASSWORD_LENGTH = 200;

/** POST /api/admin/login { password } -> { token } */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const client = clientIp(req);
  if (isRateLimited(client)) {
    return send(res, 429, null, 'Too many attempts. Please try again in a few minutes.');
  }

  try {
    const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
    if (!password || password.length > MAX_PASSWORD_LENGTH || !passwordMatches(password)) {
      recordFailedAttempt(client);
      return send(res, 401, null, 'Incorrect password');
    }

    clearAttempts(client);
    return send(res, 200, { token: createToken() });
  } catch (error) {
    return serverError(res, error);
  }
};
