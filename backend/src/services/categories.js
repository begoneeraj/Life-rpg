'use strict';

/**
 * The one place the quest category enum is defined - shared between the
 * quest creation validator (questController.js) and the AI prompt (groq.js)
 * so both always agree on the same fixed allow-list.
 */
const VALID_CATEGORIES = [
  'coding',
  'study',
  'gym',
  'fitness',
  'running',
  'meditation',
  'deep_work',
  'chores',
  'healthy_habits',
  'other',
];

module.exports = { VALID_CATEGORIES };
