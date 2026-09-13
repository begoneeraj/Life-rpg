'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { battleStats } = require('../services/battleStats');

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

async function setUsername(req, res) {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string' || !USERNAME_RE.test(username)) {
    throw new ApiError(400, 'Username must be 3-20 characters: letters, numbers, underscore');
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== req.userId) {
    throw new ApiError(409, 'That username is already taken');
  }

  const user = await prisma.user.update({ where: { id: req.userId }, data: { username } });
  res.json({ username: user.username });
}

async function getProfile(req, res) {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { character: true },
  });
  if (!user || !user.character) {
    throw new ApiError(404, 'User not found');
  }

  const [totalQuestsDone, { winCount, lossCount }] = await Promise.all([
    prisma.quest.count({ where: { userId: user.id, status: 'completed' } }),
    battleStats(user.id),
  ]);

  res.json({
    username: user.username,
    level: user.character.level,
    xp: user.character.currentXP,
    total_quests_done: totalQuestsDone,
    win_count: winCount,
    loss_count: lossCount,
    current_streak: user.character.currentStreak,
  });
}

module.exports = { setUsername, getProfile };
