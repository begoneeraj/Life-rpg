'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { resolveQuestCompletion, BASE_XP_BY_DIFFICULTY } = require('../services/xpEngine');
const { grantFreeLevelUnlocks } = require('../services/itemGrants');

const VALID_DIFFICULTIES = Object.keys(BASE_XP_BY_DIFFICULTY);
const VALID_CATEGORIES = [
  'coding',
  'study',
  'gym',
  'fitness',
  'running',
  'meditation',
  'deep_work',
  'chores',
  'healthy_habits',
  'other',
];

async function listQuests(req, res) {
  const quests = await prisma.quest.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ quests });
}

async function createQuest(req, res) {
  const { title, category, difficulty } = req.body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new ApiError(400, 'Quest title is required');
  }
  if (title.trim().length > 140) {
    throw new ApiError(400, 'Quest title must be 140 characters or fewer');
  }
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    throw new ApiError(400, `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }
  const normalizedCategory = (category || 'other').toLowerCase();
  if (!VALID_CATEGORIES.includes(normalizedCategory)) {
    throw new ApiError(400, `category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  const quest = await prisma.quest.create({
    data: {
      userId: req.userId,
      title: title.trim(),
      category: normalizedCategory,
      difficulty,
    },
  });

  res.status(201).json({ quest });
}

/**
 * Completing a quest is the one write in this app where anti-cheat matters
 * most: a replayed/double-fired request must never grant rewards twice.
 *
 * We rely on Prisma's `updateMany` with a WHERE clause that includes
 * `status: 'pending'` - this makes the "claim" atomic at the database level.
 * If two requests race, only the one whose UPDATE actually matches a row
 * (count === 1) proceeds to grant rewards; the loser sees count === 0 and
 * is told the quest was already completed.
 */
async function completeQuest(req, res) {
  const { id } = req.params;

  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest || quest.userId !== req.userId) {
    throw new ApiError(404, 'Quest not found');
  }
  if (quest.status !== 'pending') {
    throw new ApiError(400, 'Quest is already completed');
  }

  const claim = await prisma.quest.updateMany({
    where: { id, userId: req.userId, status: 'pending' },
    data: { status: 'completed', completedAt: new Date() },
  });

  if (claim.count === 0) {
    // Someone else (or another tab) claimed it a moment ago - no rewards this time.
    throw new ApiError(400, 'Quest is already completed');
  }

  const character = await prisma.character.findUnique({ where: { userId: req.userId } });
  if (!character) {
    throw new ApiError(500, 'Character not found for user');
  }

  const result = resolveQuestCompletion(quest, character, new Date());

  const attributeField = result.attribute; // 'intellect' | 'strength' | 'discipline' | 'focus' | 'energy'
  const updatedCharacter = await prisma.$transaction(async (tx) => {
    const updated = await tx.character.update({
      where: { userId: req.userId },
      data: {
        level: result.level,
        currentXP: result.currentXP,
        gold: result.gold,
        currentStreak: result.currentStreak,
        longestStreak: result.longestStreak,
        lastActiveDate: new Date(),
        [attributeField]: { increment: result.xpGained },
      },
    });

    if (result.leveledUp) {
      await grantFreeLevelUnlocks(tx, req.userId, updated.gender, updated.level);
    }

    return updated;
  });

  res.json({
    character: updatedCharacter,
    leveledUp: result.leveledUp,
    levelsGained: result.levelsGained,
    newLevel: result.newLevel,
    xpGained: result.xpGained,
    goldGained: result.goldGained,
    attribute: result.attribute,
    quest: { ...quest, status: 'completed', completedAt: new Date() },
  });
}

async function deleteQuest(req, res) {
  const { id } = req.params;
  const quest = await prisma.quest.findUnique({ where: { id } });
  if (!quest || quest.userId !== req.userId) {
    throw new ApiError(404, 'Quest not found');
  }
  await prisma.quest.delete({ where: { id } });
  res.json({ ok: true });
}

module.exports = { listQuests, createQuest, completeQuest, deleteQuest };
