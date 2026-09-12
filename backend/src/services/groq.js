'use strict';

const { ApiError } = require('../middleware/errorHandler');
const { VALID_CATEGORIES } = require('./categories');

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.1-8b-instant requires per-account Meta license acceptance on Groq
// and 404s ("model_not_found") for accounts that haven't done that. gpt-oss-20b
// needs no such gating and is Groq's fastest current small model.
const MODEL = 'openai/gpt-oss-20b';

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

// ---------------------------------------------------------------------------
// Multi-key round-robin with retry
// ---------------------------------------------------------------------------
// Three ways to configure keys, checked in order: GROQ_API_KEYS (a single
// comma-separated env var), GROQ_API_KEY1/GROQ_API_KEY2/... (separate
// numbered env vars, handy if your host's UI makes one long comma-separated
// value awkward to edit), or GROQ_API_KEY (singular, one key). Rotating
// across whichever set is found and retrying on 429/5xx means one key
// hitting Groq's free-tier rate limit doesn't take the whole feature down.
function getApiKeys() {
  const multi = process.env.GROQ_API_KEYS;
  if (multi && multi.trim()) {
    return multi
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }

  const numbered = [];
  for (let i = 1; process.env[`GROQ_API_KEY${i}`]; i++) {
    numbered.push(process.env[`GROQ_API_KEY${i}`].trim());
  }
  if (numbered.length > 0) {
    return numbered;
  }

  const single = process.env.GROQ_API_KEY;
  return single ? [single] : [];
}

let nextKeyIndex = 0;

/**
 * Calls Groq's chat completions API (OpenAI-compatible) in JSON mode,
 * rotating across all configured keys and retrying on rate-limit (429) or
 * server errors (5xx) before giving up. Throws ApiError for any terminal
 * failure so callers can just let it bubble to the error middleware.
 */
async function callGroq(messages) {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new ApiError(500, 'GROQ_API_KEY is not set');
  }

  let lastErrorDetail = null;

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const apiKey = keys[nextKeyIndex % keys.length];
    nextKeyIndex += 1;

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
          messages,
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });
    } catch (err) {
      lastErrorDetail = err.message;
      continue; // network error - try the next key
    }

    if (response.status === 429 || response.status >= 500) {
      lastErrorDetail = await response.text().catch(() => `HTTP ${response.status}`);
      continue; // rate-limited or server error - try the next key
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
    try {
      return JSON.parse(content);
    } catch {
      throw new ApiError(502, 'AI analysis service returned malformed JSON');
    }
  }

  throw new ApiError(502, 'AI analysis service is unavailable (all keys rate-limited or failing)', lastErrorDetail);
}

const ANALYSIS_SYSTEM_PROMPT = `You are a task analysis engine for a student productivity app. Given a task description, analyze it and respond with ONLY a JSON object - no prose, no markdown, no code fences.

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

function validateAnalysis(parsed) {
  const { category, difficulty, estimated_minutes: estimatedMinutes, reason } = parsed || {};
  if (!VALID_CATEGORIES.includes(category)) {
    throw new ApiError(502, 'AI analysis service returned an invalid category');
  }
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    throw new ApiError(502, 'AI analysis service returned an invalid difficulty');
  }
  if (!Number.isInteger(estimatedMinutes) || estimatedMinutes <= 0) {
    throw new ApiError(502, 'AI analysis service returned an invalid time estimate');
  }
  if (typeof reason !== 'string' || !reason.trim()) {
    throw new ApiError(502, 'AI analysis service returned an invalid reason');
  }
  return { category, difficulty, estimated_minutes: estimatedMinutes, reason: reason.trim() };
}

/** Single-shot: task text in, { category, difficulty, estimated_minutes, reason } out. */
async function analyzeQuestWithGroq(task) {
  const parsed = await callGroq([
    { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
    { role: 'user', content: task },
  ]);
  return validateAnalysis(parsed);
}

const QUESTIONS_SYSTEM_PROMPT = `You are an AI assistant in a gamified task manager. A user wants to start a quest for a specific topic or task. Your job is to generate 2 to 3 concise multiple-choice questions to gauge their current knowledge/experience level, so the task's difficulty and time estimate can be personalized.

Respond with ONLY a JSON object - no prose, no markdown, no code fences - with exactly one field:
- "questions": an array of 2 to 3 objects, each with:
  - "question": a short string
  - "options": an array of 3 to 4 short answer strings (e.g. "Never done this before", "Know the basics", "Very comfortable with this")

Respond with ONLY the JSON object.`;

/** topic in, [{ question, options }] out. */
async function generateAssessmentQuestions(topic) {
  const parsed = await callGroq([
    { role: 'system', content: QUESTIONS_SYSTEM_PROMPT },
    { role: 'user', content: `Topic: ${topic}` },
  ]);

  const questions = parsed?.questions;
  if (!Array.isArray(questions) || questions.length < 2 || questions.length > 3) {
    throw new ApiError(502, 'AI analysis service returned an invalid question set');
  }
  for (const q of questions) {
    if (typeof q?.question !== 'string' || !q.question.trim()) {
      throw new ApiError(502, 'AI analysis service returned an invalid question');
    }
    if (!Array.isArray(q.options) || q.options.length < 2 || !q.options.every((o) => typeof o === 'string' && o.trim())) {
      throw new ApiError(502, 'AI analysis service returned invalid question options');
    }
  }
  return questions.map((q) => ({ question: q.question.trim(), options: q.options.map((o) => o.trim()) }));
}

const EVALUATION_SYSTEM_PROMPT = `You are an AI analyzing a user's task, personalized by their self-reported knowledge level. Given a topic and the user's answers to a short assessment, respond with ONLY a JSON object - no prose, no markdown, no code fences.

The JSON object must have exactly these fields:
- "category": one of ${VALID_CATEGORIES.map((c) => `"${c}"`).join(', ')}
- "difficulty": one of "easy", "medium", or "hard"
- "estimated_minutes": an integer, the realistic time in minutes this specific user would need, given their self-reported experience
- "reason": a short 1-2 sentence explanation referencing both the topic and the user's answers

A beginner on a hard topic should get a higher time estimate and higher difficulty than someone who already knows the material. Respond with ONLY the JSON object.`;

/** topic + [{ question, answer }] in, { category, difficulty, estimated_minutes, reason } out. */
async function evaluateQuestFromAssessment(topic, answers) {
  const answersText = answers.map((a, i) => `${i + 1}. ${a.question} -> ${a.answer}`).join('\n');
  const parsed = await callGroq([
    { role: 'system', content: EVALUATION_SYSTEM_PROMPT },
    { role: 'user', content: `Topic: ${topic}\nUser Answers:\n${answersText}` },
  ]);
  return validateAnalysis(parsed);
}

module.exports = {
  analyzeQuestWithGroq,
  generateAssessmentQuestions,
  evaluateQuestFromAssessment,
};
