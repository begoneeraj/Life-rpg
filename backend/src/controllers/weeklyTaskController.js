'use strict';

const prisma = require('../services/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { toDateKey, toDayOfWeek } = require('../services/xpEngine');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function validateTitle(title) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new ApiError(400, 'title is required');
  }
  if (title.trim().length > 140) {
    throw new ApiError(400, 'title must be 140 characters or fewer');
  }
  return title.trim();
}

function validateDayOfWeek(dayOfWeek) {
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new ApiError(400, `dayOfWeek must be an integer 0-6 (${DAY_NAMES.join(', ')})`);
  }
}

/**
 * Lists every weekly task the user has scheduled, annotated with whether
 * it's already been completed for today's specific calendar occurrence
 * (never "was it ever completed" - that resets every week by design).
 */
async function listWeeklyTasks(req, res) {
  const now = new Date();
  const todayKey = toDateKey(now);
  const todayDayOfWeek = toDayOfWeek(now);

  const tasks = await prisma.weeklyTask.findMany({
    where: { userId: req.userId },
    include: { completions: { where: { dateKey: todayKey } } },
    orderBy: [{ dayOfWeek: 'asc' }, { createdAt: 'asc' }],
  });

  res.json({
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      dayOfWeek: t.dayOfWeek,
      completedToday: t.completions.length > 0,
    })),
    todayDayOfWeek,
  });
}

async function createWeeklyTask(req, res) {
  const title = validateTitle(req.body?.title);
  const dayOfWeek = req.body?.dayOfWeek;
  validateDayOfWeek(dayOfWeek);

  const task = await prisma.weeklyTask.create({
    data: { userId: req.userId, title, dayOfWeek },
  });

  res.status(201).json({ task: { id: task.id, title: task.title, dayOfWeek: task.dayOfWeek, completedToday: false } });
}

/** Editable any time - change the title, move it to a different day, or both. */
async function updateWeeklyTask(req, res) {
  const { id } = req.params;
  const existing = await prisma.weeklyTask.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    throw new ApiError(404, 'Weekly task not found');
  }

  const data = {};
  if (req.body?.title !== undefined) {
    data.title = validateTitle(req.body.title);
  }
  if (req.body?.dayOfWeek !== undefined) {
    validateDayOfWeek(req.body.dayOfWeek);
    data.dayOfWeek = req.body.dayOfWeek;
  }

  const task = await prisma.weeklyTask.update({ where: { id }, data });
  res.json({ task: { id: task.id, title: task.title, dayOfWeek: task.dayOfWeek } });
}

async function deleteWeeklyTask(req, res) {
  const { id } = req.params;
  const existing = await prisma.weeklyTask.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.userId) {
    throw new ApiError(404, 'Weekly task not found');
  }
  await prisma.weeklyTask.delete({ where: { id } });
  res.json({ ok: true });
}

/** Toggles completion for today's specific occurrence only - not the slot itself. */
async function toggleCompletionToday(req, res) {
  const { id } = req.params;
  const task = await prisma.weeklyTask.findUnique({ where: { id } });
  if (!task || task.userId !== req.userId) {
    throw new ApiError(404, 'Weekly task not found');
  }

  const todayKey = toDateKey(new Date());
  const existingCompletion = await prisma.weeklyTaskCompletion.findUnique({
    where: { weeklyTaskId_dateKey: { weeklyTaskId: id, dateKey: todayKey } },
  });

  if (existingCompletion) {
    await prisma.weeklyTaskCompletion.delete({ where: { id: existingCompletion.id } });
    return res.json({ completedToday: false });
  }

  await prisma.weeklyTaskCompletion.create({ data: { weeklyTaskId: id, dateKey: todayKey } });
  res.json({ completedToday: true });
}

module.exports = {
  listWeeklyTasks,
  createWeeklyTask,
  updateWeeklyTask,
  deleteWeeklyTask,
  toggleCompletionToday,
};
