import api from './axios';

/**
 * Calls POST /api/analyze-quest with a task description and returns the AI's
 * { difficulty, estimated_minutes, reason } analysis. Not a component - just
 * a fetch wrapper, so callers own their own loading/error UI state.
 *
 * @param {string} task
 * @returns {Promise<{ difficulty: 'easy'|'medium'|'hard', estimated_minutes: number, reason: string }>}
 */
export async function analyzeQuest(task) {
  const { data } = await api.post('/analyze-quest', { task });
  return data;
}
