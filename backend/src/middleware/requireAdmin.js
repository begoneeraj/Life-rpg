'use strict';

const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const { ADMIN_COOKIE_NAME } = require('../controllers/adminAuthController');

/** Gates admin-only routes behind the separate admin cookie session (see adminAuthController.js). */
function requireAdmin(req, res, next) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, 'Admin login required');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      throw new Error('not an admin token');
    }
  } catch {
    throw new ApiError(401, 'Admin login required');
  }
  next();
}

module.exports = requireAdmin;
