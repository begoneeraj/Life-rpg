'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  cookieOptions,
} = require('../utils/tokens');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_ROUNDS = 10;

function validateCredentials(email, password) {
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }
}

async function issueSession(res, userId) {
  const accessToken = signAccessToken(userId);
  const { token: refreshToken, jti, expiresAt } = signRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });
  // Best-effort cleanup of this user's expired/revoked tokens so the table doesn't grow unbounded.
  await prisma.refreshToken.deleteMany({
    where: { userId, OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }] },
  });

  res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(15 * 60 * 1000));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(REFRESH_TOKEN_TTL_MS));

  void jti; // kept in the JWT payload for traceability/debugging
}

async function signup(req, res) {
  const { email, password } = req.body || {};
  validateCredentials(email, password);

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      character: { create: {} }, // starts at level 1, 0 XP/gold, per schema defaults
    },
    include: { character: true },
  });

  await issueSession(res, user.id);

  res.status(201).json({
    user: { id: user.id, email: user.email },
    character: user.character,
  });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  validateCredentials(email, password);

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { character: true },
  });

  // Same error for "no such user" and "wrong password" - don't leak which one it was.
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  await issueSession(res, user.id);

  res.json({
    user: { id: user.id, email: user.email },
    character: user.character,
  });
}

async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    throw new ApiError(401, 'No refresh token');
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revoked || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
    throw new ApiError(401, 'Refresh token no longer valid');
  }

  // Rotate: revoke the used token and issue a brand new pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  await issueSession(res, payload.sub);

  res.json({ ok: true });
}

async function logout(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }
  res.clearCookie(ACCESS_COOKIE_NAME, cookieOptions(0));
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(0));
  res.json({ ok: true });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { character: true },
  });
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }
  res.json({
    user: { id: user.id, email: user.email },
    character: user.character,
  });
}

module.exports = { signup, login, refresh, logout, me };
