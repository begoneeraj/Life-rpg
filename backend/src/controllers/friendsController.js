'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { battleStats } = require('../services/battleStats');
const { totalXpEarned } = require('../services/xpEngine');

async function sendRequest(req, res) {
  const { username } = req.body || {};
  if (!username || typeof username !== 'string') {
    throw new ApiError(400, 'username is required');
  }

  const receiver = await prisma.user.findUnique({ where: { username } });
  if (!receiver) {
    throw new ApiError(404, 'No user with that username');
  }
  if (receiver.id === req.userId) {
    throw new ApiError(400, 'You cannot friend yourself');
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: req.userId, receiverId: receiver.id },
        { requesterId: receiver.id, receiverId: req.userId },
      ],
      status: { in: ['pending', 'accepted'] },
    },
  });
  if (existing) {
    throw new ApiError(409, 'friend already added');
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: req.userId, receiverId: receiver.id },
  });

  res.status(201).json({ friendship });
}

async function respond(req, res) {
  const { request_id: requestId, action } = req.body || {};
  if (!requestId || !['accept', 'reject'].includes(action)) {
    throw new ApiError(400, 'request_id and action ("accept"|"reject") are required');
  }

  const friendship = await prisma.friendship.findUnique({ where: { id: requestId } });
  if (!friendship || friendship.receiverId !== req.userId) {
    throw new ApiError(404, 'Friend request not found');
  }
  if (friendship.status !== 'pending') {
    throw new ApiError(400, 'Friend request already resolved');
  }

  const updated = await prisma.friendship.update({
    where: { id: requestId },
    data: { status: action === 'accept' ? 'accepted' : 'rejected' },
  });

  res.json({ friendship: updated });
}

async function list(req, res) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ requesterId: req.userId }, { receiverId: req.userId }],
    },
    include: {
      requester: { include: { character: true } },
      receiver: { include: { character: true } },
    },
  });

  const friends = await Promise.all(
    friendships.map(async (f) => {
      const friend = f.requesterId === req.userId ? f.receiver : f.requester;
      const { winCount } = await battleStats(friend.id);
      const totalQuestsDone = await prisma.quest.count({
        where: { userId: friend.id, status: 'completed' },
      });
      return {
        username: friend.username,
        level: friend.character?.level ?? 1,
        xp: friend.character?.currentXP ?? 0,
        total_quests_done: totalQuestsDone,
        win_count: winCount,
      };
    })
  );

  res.json({ friends });
}

async function incomingRequests(req, res) {
  const requests = await prisma.friendship.findMany({
    where: { receiverId: req.userId, status: 'pending' },
    include: { requester: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    requests: requests.map((r) => ({
      request_id: r.id,
      from_username: r.requester.username,
      created_at: r.createdAt,
    })),
  });
}

/**
 * Ranks the caller plus their accepted friends by lifetime XP (comparable
 * across levels, unlike currentXP which resets every level-up).
 */
async function leaderboard(req, res) {
  const [me, friendships] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId }, include: { character: true } }),
    prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: req.userId }, { receiverId: req.userId }],
      },
      include: {
        requester: { include: { character: true } },
        receiver: { include: { character: true } },
      },
    }),
  ]);

  const friends = friendships.map((f) => (f.requesterId === req.userId ? f.receiver : f.requester));
  const players = [me, ...friends].filter((u) => u?.character);

  const rows = await Promise.all(
    players.map(async (u) => {
      const { winCount } = await battleStats(u.id);
      return {
        username: u.username,
        is_you: u.id === req.userId,
        level: u.character.level,
        xp: u.character.currentXP,
        total_xp: totalXpEarned(u.character.level, u.character.currentXP),
        win_count: winCount,
        current_streak: u.character.currentStreak,
      };
    })
  );

  rows.sort((a, b) => b.total_xp - a.total_xp);
  rows.forEach((row, i) => {
    row.rank = i + 1;
  });

  res.json({ leaderboard: rows });
}

module.exports = { sendRequest, respond, list, incomingRequests, leaderboard };
