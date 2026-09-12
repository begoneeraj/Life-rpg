'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_TOKEN_TTL = '30d';

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return secret;
}

function signAccessToken(userId) {
  return jwt.sign({ sub: userId, type: 'access' }, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken(userId) {
  // jti (JWT ID) lets us identify + revoke this specific refresh token server-side.
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, type: 'refresh', jti }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_TTL,
  });
  return { token, jti, expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) };
}

function verifyAccessToken(token) {
  return jwt.verify(token, getAccessSecret());
}

function verifyRefreshToken(token) {
  return jwt.verify(token, getRefreshSecret());
}

/** We never store raw refresh tokens - only a SHA-256 hash, so a DB leak can't be replayed. */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const ACCESS_COOKIE_NAME = 'life_rpg_access';
const REFRESH_COOKIE_NAME = 'life_rpg_refresh';

function cookieOptions(maxAgeMs) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // requires HTTPS in production (Render/Vercel both provide it)
    sameSite: isProd ? 'none' : 'lax', // 'none' needed for cross-site Vercel <-> Render calls
    maxAge: maxAgeMs,
    path: '/',
  };
}

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  cookieOptions,
};
