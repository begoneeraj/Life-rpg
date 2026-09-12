'use strict';

const { ACCESS_COOKIE_NAME, verifyAccessToken } = require('../utils/tokens');
const { ApiError } = require('./errorHandler');

/**
 * Verifies the access-token httpOnly cookie and attaches `req.userId`.
 * Returns 401 (never redirects - that's a frontend concern) so the client
 * can attempt a silent refresh via POST /api/auth/refresh before bouncing
 * the user to the login screen.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.[ACCESS_COOKIE_NAME];
  if (!token) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    next(new ApiError(401, 'Session expired'));
  }
}

module.exports = { requireAuth };
