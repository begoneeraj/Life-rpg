'use strict';

const { ApiError } = require('../middleware/errorHandler');
const { analyzeQuestWithGroq } = require('../services/groq');

async function analyzeQuest(req, res) {
  const { task } = req.body || {};

  if (!task || typeof task !== 'string' || !task.trim()) {
    throw new ApiError(400, 'task is required');
  }
  if (task.trim().length > 300) {
    throw new ApiError(400, 'task must be 300 characters or fewer');
  }

  const result = await analyzeQuestWithGroq(task.trim());
  res.json(result);
}

module.exports = { analyzeQuest };
