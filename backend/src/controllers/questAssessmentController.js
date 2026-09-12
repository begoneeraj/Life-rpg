'use strict';

const { ApiError } = require('../middleware/errorHandler');
const { generateAssessmentQuestions, evaluateQuestFromAssessment } = require('../services/groq');

function validateTopic(topic) {
  if (!topic || typeof topic !== 'string' || !topic.trim()) {
    throw new ApiError(400, 'topic is required');
  }
  if (topic.trim().length > 300) {
    throw new ApiError(400, 'topic must be 300 characters or fewer');
  }
  return topic.trim();
}

async function getQuestions(req, res) {
  const topic = validateTopic(req.body?.topic);
  const questions = await generateAssessmentQuestions(topic);
  res.json({ questions });
}

async function evaluate(req, res) {
  const topic = validateTopic(req.body?.topic);
  const { answers } = req.body || {};

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, 'answers is required and must be a non-empty array');
  }
  for (const a of answers) {
    if (typeof a?.question !== 'string' || !a.question.trim() || typeof a?.answer !== 'string' || !a.answer.trim()) {
      throw new ApiError(400, 'each answer must have a non-empty question and answer string');
    }
  }

  const result = await evaluateQuestFromAssessment(topic, answers);
  res.json(result);
}

module.exports = { getQuestions, evaluate };
