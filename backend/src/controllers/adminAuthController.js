'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ApiError } = require('../middleware/errorHandler');

const ADMIN_COOKIE_NAME = 'life_rpg_admin';
const ADMIN_TOKEN_TTL = '12h';
const ADMIN_COOKIE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * Constant-time string comparison so a mismatched-length or early-byte-diff
 * guess can't be distinguished from a near-miss by response timing.
 */
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function adminCookieOptions(maxAgeMs) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  };
}

/**
 * Entirely separate from the real user auth system (authController.js) -
 * this is a single hidden admin session gated by ADMIN_USERNAME/
 * ADMIN_PASSWORD env vars (set on the host, never committed to source), not
 * a User row. There is currently no admin-only functionality behind this;
 * it's a login gate awaiting a purpose.
 */
async function login(req, res) {
  const { username, password } = req.body || {};
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    throw new ApiError(500, 'Admin login is not configured');
  }
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'username and password are required');
  }
  if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
    throw new ApiError(401, 'Invalid admin credentials');
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: ADMIN_TOKEN_TTL });
  res.cookie(ADMIN_COOKIE_NAME, token, adminCookieOptions(ADMIN_COOKIE_MAX_AGE_MS));
  res.json({ ok: true });
}

async function logout(req, res) {
  res.clearCookie(ADMIN_COOKIE_NAME, adminCookieOptions(0));
  res.json({ ok: true });
}

async function me(req, res) {
  res.json({ admin: true });
}

module.exports = { login, logout, me, ADMIN_COOKIE_NAME };
