import api from './axios';

/** @returns {Promise<{ questions: { question: string, options: string[] }[] }>} */
export async function generateAssessmentQuestions(topic) {
  const { data } = await api.post('/quest-assessment/questions', { topic });
  return data.questions;
}

/**
 * @param {string} topic
 * @param {{ question: string, answer: string }[]} answers
 * @returns {Promise<{ category: string, difficulty: string, estimated_minutes: number, reason: string }>}
 */
export async function evaluateQuestAssessment(topic, answers) {
  const { data } = await api.post('/quest-assessment/evaluate', { topic, answers });
  return data;
}
