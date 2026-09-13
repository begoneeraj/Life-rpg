'use strict';

const prisma = require('./prisma');

/**
 * Win/loss counts aren't stored as columns on User/Character - they're
 * derived from completed Battle rows so there's no denormalized counter to
 * keep in sync. Ties count toward neither.
 */
async function battleStats(userId) {
  const [winCount, lossCount] = await Promise.all([
    prisma.battle.count({ where: { status: 'completed', winnerId: userId } }),
    prisma.battle.count({
      where: {
        status: 'completed',
        winnerId: { not: null, notIn: [userId] },
        OR: [{ challengerId: userId }, { opponentId: userId }],
      },
    }),
  ]);
  return { winCount, lossCount };
}

module.exports = { battleStats };
