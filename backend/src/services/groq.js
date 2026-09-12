'use strict';

const { ApiError } = require('../middleware/errorHandler');
const { VALID_CATEGORIES } = require('./categories');

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.1-8b-instant requires per-account Meta license acceptance on Groq
// and 404s ("model_not_found") for accounts that haven't done that. gpt-oss-20b
// needs no such gating and is Groq's fastest current small model.
const MODEL = 'openai/gpt-oss-20b';

const SYSTEM_PROMPT = `You are a task analysis engine for a student productivity app. Given a task description, analyze it and respond with ONLY a JSON object - no prose, no markdown, no code fences.

The JSON object must have exactly these fields:
- "category": one of ${VALID_CATEGORIES.map((c) => `"${c}"`).join(', ')}
- "difficulty": one of "easy", "medium", or "hard"
- "estimated_minutes": an integer, the realistic time in minutes an average student would need to complete this task
- "reason": a short 1-2 sentence explanation for the difficulty and time estimate

Category guidelines:
- "coding": programming, software, debugging, technical assignments
- "study": reading, reviewing notes, exam prep, non-coding coursework
- "gym" / "fitness" / "running": physical exercise
- "meditation": mindfulness, breathing, relaxation practice
- "deep_work": focused creative or analytical work that isn't coding or studying
- "chores": errands, cleaning, admin, life maintenance tasks
- "healthy_habits": sleep, nutrition, hydration, other wellness routines
- "other": anything that doesn't clearly fit the above

Difficulty/time guidelines:
- "easy" tasks take roughly 5-30 minutes (quick chores, simple reading, short reviews).
- "medium" tasks take roughly 30-120 minutes (typical homework, assignments, moderate coding tasks).
- "hard" tasks take 120+ minutes (projects, exam prep, complex assignments, multi-step work).
- Base your estimate on what the task actually describes, not just its length.

Respond with ONLY the JSON object.`;

/**
 * Calls Groq's chat completions API (OpenAI-compatible) in JSON mode and
 * returns the parsed { category, difficulty, estimated_minutes, reason }
 * object. Throws ApiError for any failure mode (missing key, network/API
 * error, or a response that isn't the shape we asked for) so the route
 * handler can just let it bubble to the error middleware.
 */
async function analyzeQuestWithGroq(task) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, 'GROQ_API_KEY is not set');
  }

  let response;
  try {
    response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: task },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });
  } catch (err) {
    throw new ApiError(502, 'Could not reach the AI analysis service', err.message);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(502, 'AI analysis service returned an error', body.slice(0, 500));
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new ApiError(502, 'AI analysis service returned an empty response');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ApiError(502, 'AI analysis service returned malformed JSON');
  }

  const { category, difficulty, estimated_minutes: estimatedMinutes, reason } = parsed;
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(502, 'AI analysis service returned an invalid category');
  }
  if (!validDifficulties.includes(difficulty)) {
    throw new ApiError(502, 'AI analysis service returned an invalid difficulty');
  }
  if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) {
    throw new ApiError(502, 'AI analysis service returned an invalid time estimate');
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    throw new ApiError(502, 'AI analysis service returned an invalid reason');
  }

  return {
    category,
    difficulty,
    estimated_minutes: estimatedMinutes,
    reason: reason.trim(),
  };
}

module.exports = { analyzeQuestWithGroq, SYSTEM_PROMPT };
