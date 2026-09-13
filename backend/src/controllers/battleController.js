'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { applyXp } = require('../services/xpEngine');
const { ROUND_COUNT, resolveBattleOutcome } = require('../services/battleEngine');

const MIN_TASKS_PER_ROUND = 1;
const MAX_TASKS_PER_ROUND = 5;
const MIN_TIME_LIMIT_MINUTES = 1;
const MAX_TIME_LIMIT_MINUTES = 24 * 60;

function side(battle, userId) {
  if (battle.challengerId === userId) return 'challenger';
  if (battle.opponentId === userId) return 'opponent';
  return null;
}

/**
 * Finalizes an active battle whose time limit has elapsed: resolves each of
 * the 3 rounds, tallies rounds won, grants XP via xpEngine.applyXp (same
 * leveling curve as quests), and marks the battle completed. No-op if the
 * battle isn't active or hasn't expired yet. Returns the battle row as it is
 * after this call (completed or still active), with tasks included.
 */
async function finalizeIfExpired(battle) {
  if (battle.status !== 'active') return battle;

  const deadline = new Date(battle.startedAt).getTime() + battle.timeLimitMinutes * 60 * 1000;
  if (Date.now() < deadline) return battle;

  const tasks = await prisma.battleTask.findMany({ where: { battleId: battle.id } });
  const outcome = resolveBattleOutcome(tasks);
  const winnerId =
    outcome.winnerSide === 'challenger'
      ? battle.challengerId
      : outcome.winnerSide === 'opponent'
      ? battle.opponentId
      : null;

  await prisma.$transaction(async (tx) => {
    await tx.battle.update({
      where: { id: battle.id },
      data: { status: 'completed', endedAt: new Date(), winnerId },
    });

    for (const [userId, xpGained] of [
      [battle.challengerId, outcome.challengerXp],
      [battle.opponentId, outcome.opponentXp],
    ]) {
      const character = await tx.character.findUnique({ where: { userId } });
      if (!character) continue;
      const result = applyXp(character.level, character.currentXP, xpGained);
      await tx.character.update({
        where: { userId },
        data: { level: result.level, currentXP: result.currentXP },
      });
    }
  });

  return prisma.battle.findUnique({ where: { id: battle.id }, include: { tasks: true } });
}

async function challenge(req, res) {
  const { opponent_username: opponentUsername, rounds, time_limit_minutes: timeLimitMinutes } =
    req.body || {};

  if (!opponentUsername || typeof opponentUsername !== 'string') {
    throw new ApiError(400, 'opponent_username is required');
  }
  if (!Array.isArray(rounds) || rounds.length !== ROUND_COUNT) {
    throw new ApiError(400, `rounds must be an array of exactly ${ROUND_COUNT} task lists (round 1, 2, 3)`);
  }
  for (const roundTasks of rounds) {
    if (
      !Array.isArray(roundTasks) ||
      roundTasks.length < MIN_TASKS_PER_ROUND ||
      roundTasks.length > MAX_TASKS_PER_ROUND
    ) {
      throw new ApiError(
        400,
        `Each round must have ${MIN_TASKS_PER_ROUND}-${MAX_TASKS_PER_ROUND} tasks`
      );
    }
    if (roundTasks.some((t) => typeof t !== 'string' || !t.trim())) {
      throw new ApiError(400, 'Every task must be a non-empty string');
    }
  }
  if (
    !Number.isInteger(timeLimitMinutes) ||
    timeLimitMinutes < MIN_TIME_LIMIT_MINUTES ||
    timeLimitMinutes > MAX_TIME_LIMIT_MINUTES
  ) {
    throw new ApiError(
      400,
      `time_limit_minutes must be an integer between ${MIN_TIME_LIMIT_MINUTES} and ${MAX_TIME_LIMIT_MINUTES}`
    );
  }

  const opponent = await prisma.user.findUnique({ where: { username: opponentUsername } });
  if (!opponent) {
    throw new ApiError(404, 'No user with that username');
  }
  if (opponent.id === req.userId) {
    throw new ApiError(400, 'You cannot challenge yourself');
  }

  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { requesterId: req.userId, receiverId: opponent.id },
        { requesterId: opponent.id, receiverId: req.userId },
      ],
    },
  });
  if (!friendship) {
    throw new ApiError(403, 'You can only challenge a friend');
  }

  const existingBattle = await prisma.battle.findFirst({
    where: {
      status: { in: ['pending', 'active'] },
      OR: [
        { challengerId: req.userId, opponentId: opponent.id },
        { challengerId: opponent.id, opponentId: req.userId },
      ],
    },
  });
  if (existingBattle) {
    throw new ApiError(409, 'battle already active');
  }

  const taskRows = rounds.flatMap((roundTasks, i) =>
    roundTasks.map((taskText) => ({ round: i + 1, taskText: taskText.trim() }))
  );

  const battle = await prisma.battle.create({
    data: {
      challengerId: req.userId,
      opponentId: opponent.id,
      timeLimitMinutes,
      tasks: { create: taskRows },
    },
    include: { tasks: true },
  });

  res.status(201).json({ battle });
}

async function respond(req, res) {
  const { battle_id: battleId, action } = req.body || {};
  if (!battleId || !['accept', 'decline'].includes(action)) {
    throw new ApiError(400, 'battle_id and action ("accept"|"decline") are required');
  }

  const battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle || battle.opponentId !== req.userId) {
    throw new ApiError(404, 'Battle challenge not found');
  }
  if (battle.status !== 'pending') {
    throw new ApiError(400, 'Battle is no longer pending');
  }

  const updated = await prisma.battle.update({
    where: { id: battleId },
    data:
      action === 'accept'
        ? { status: 'active', startedAt: new Date() }
        : { status: 'declined' },
  });

  res.json({ battle: updated });
}

async function completeTask(req, res) {
  const { battle_id: battleId, task_id: taskId } = req.body || {};
  if (!battleId || !taskId) {
    throw new ApiError(400, 'battle_id and task_id are required');
  }

  let battle = await prisma.battle.findUnique({ where: { id: battleId } });
  if (!battle || side(battle, req.userId) === null) {
    throw new ApiError(404, 'Battle not found');
  }

  battle = await finalizeIfExpired(battle);
  if (battle.status !== 'active') {
    throw new ApiError(400, `Battle is ${battle.status}, not active`);
  }

  const task = await prisma.battleTask.findUnique({ where: { id: taskId } });
  if (!task || task.battleId !== battleId) {
    throw new ApiError(404, 'task not in this battle');
  }

  const mySide = side(battle, req.userId);
  const field = mySide === 'challenger' ? 'challengerCompletedAt' : 'opponentCompletedAt';
  if (task[field]) {
    return res.json({ task }); // already marked done - idempotent no-op
  }

  const updated = await prisma.battleTask.update({
    where: { id: taskId },
    data: { [field]: new Date() },
  });

  res.json({ task: updated });
}

function buildStatusPayload(battle, userId) {
  const mySide = side(battle, userId);
  const myField = mySide === 'challenger' ? 'challengerCompletedAt' : 'opponentCompletedAt';
  const theirField = mySide === 'challenger' ? 'opponentCompletedAt' : 'challengerCompletedAt';

  const myProgress = battle.tasks.filter((t) => t[myField]).length;
  const opponentProgress = battle.tasks.filter((t) => t[theirField]).length;

  let timeRemainingSeconds = null;
  if (battle.status === 'active' && battle.startedAt) {
    const deadline = new Date(battle.startedAt).getTime() + battle.timeLimitMinutes * 60 * 1000;
    timeRemainingSeconds = Math.max(0, Math.round((deadline - Date.now()) / 1000));
  }

  // Live per-round tally (round "winner" here just reflects current counts;
  // it isn't locked in until the battle actually completes).
  const outcome = resolveBattleOutcome(battle.tasks);
  const rounds = outcome.rounds.map((r) => ({
    round: r.round,
    my_completed: mySide === 'challenger' ? r.challengerCompleted : r.opponentCompleted,
    opponent_completed: mySide === 'challenger' ? r.opponentCompleted : r.challengerCompleted,
    leading: r.winnerSide === null ? null : r.winnerSide === mySide ? 'me' : 'opponent',
  }));
  const roundsWon = {
    me: mySide === 'challenger' ? outcome.roundsWon.challenger : outcome.roundsWon.opponent,
    opponent: mySide === 'challenger' ? outcome.roundsWon.opponent : outcome.roundsWon.challenger,
  };

  return {
    status: battle.status,
    time_remaining_seconds: timeRemainingSeconds,
    my_progress: myProgress,
    opponent_progress: opponentProgress,
    rounds,
    rounds_won: roundsWon,
    tasks: battle.tasks.map((t) => ({
      id: t.id,
      round: t.round,
      task_text: t.taskText,
      completed_by_me: Boolean(t[myField]),
      completed_by_opponent: Boolean(t[theirField]),
    })),
    winner_id: battle.winnerId,
  };
}

async function getStatus(req, res) {
  const { battle_id: battleId } = req.params;

  let battle = await prisma.battle.findUnique({
    where: { id: battleId },
    include: { tasks: true },
  });
  if (!battle || side(battle, req.userId) === null) {
    throw new ApiError(404, 'Battle not found');
  }

  battle = await finalizeIfExpired(battle);

  res.json(buildStatusPayload(battle, req.userId));
}

async function end(req, res) {
  const { battle_id: battleId } = req.body || {};
  if (!battleId) {
    throw new ApiError(400, 'battle_id is required');
  }

  let battle = await prisma.battle.findUnique({ where: { id: battleId }, include: { tasks: true } });
  if (!battle || side(battle, req.userId) === null) {
    throw new ApiError(404, 'Battle not found');
  }
  if (battle.status === 'completed') {
    return res.json(buildStatusPayload(battle, req.userId));
  }
  if (battle.status !== 'active') {
    throw new ApiError(400, `Battle is ${battle.status}, not active`);
  }

  const deadline = new Date(battle.startedAt).getTime() + battle.timeLimitMinutes * 60 * 1000;
  if (Date.now() < deadline) {
    throw new ApiError(400, 'Battle time has not expired yet');
  }

  battle = await finalizeIfExpired(battle);
  res.json(buildStatusPayload(battle, req.userId));
}

module.exports = { challenge, respond, completeTask, getStatus, end };
