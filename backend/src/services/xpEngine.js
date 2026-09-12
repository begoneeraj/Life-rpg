'use strict';

/**
 * xpEngine.js — pure, unit-testable game logic for Life RPG.
 *
 * Nothing here touches the database or the network. Every function takes
 * plain data in and returns plain data out, so the leveling/streak math can
 * be verified with `node --test` without ever booting a server.
 */

const TIMEZONE = 'Asia/Kolkata';

const BASE_XP_BY_DIFFICULTY = Object.freeze({
  easy: 10,
  medium: 25,
  hard: 50,
});

const CATEGORY_TO_ATTRIBUTE = Object.freeze({
  coding: 'intellect',
  study: 'intellect',
  gym: 'strength',
  fitness: 'strength',
  running: 'strength',
  meditation: 'focus',
  deep_work: 'discipline',
  chores: 'discipline',
  discipline: 'discipline',
  healthy_habits: 'energy',
});

const DEFAULT_ATTRIBUTE = 'discipline';

/**
 * xpRequiredForLevel(n) = round(100 * n^1.5)
 * This is the amount of XP needed to go from level n to level n+1.
 */
function xpRequiredForLevel(level) {
  if (!Number.isFinite(level) || level < 1) {
    throw new RangeError(`xpRequiredForLevel: level must be a positive integer, got ${level}`);
  }
  return Math.round(100 * Math.pow(level, 1.5));
}

function baseXpForDifficulty(difficulty) {
  const xp = BASE_XP_BY_DIFFICULTY[difficulty];
  if (xp === undefined) {
    throw new RangeError(`Unknown difficulty: ${difficulty}`);
  }
  return xp;
}

function goldForXp(xp) {
  return Math.floor(xp / 2);
}

function attributeForCategory(category) {
  return CATEGORY_TO_ATTRIBUTE[String(category).toLowerCase()] || DEFAULT_ATTRIBUTE;
}

/**
 * Applies XP gained to a level/currentXP pair, cascading through as many
 * level-ups as the XP amount covers (in case of very large XP grants).
 *
 * @returns {{ level: number, currentXP: number, leveledUp: boolean, levelsGained: number }}
 */
function applyXp(currentLevel, currentXP, xpGained) {
  let level = currentLevel;
  let xp = currentXP + xpGained;
  let levelsGained = 0;

  let required = xpRequiredForLevel(level);
  while (xp >= required) {
    xp -= required;
    level += 1;
    levelsGained += 1;
    required = xpRequiredForLevel(level);
  }

  return {
    level,
    currentXP: xp,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}

/**
 * Returns a YYYY-MM-DD date string for the given instant, rendered in the
 * Asia/Kolkata timezone, so "today" is computed consistently for all users
 * regardless of the server's local timezone.
 */
function toDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dateKeyToUTCDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function diffInCalendarDays(fromKey, toKey) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((dateKeyToUTCDate(toKey) - dateKeyToUTCDate(fromKey)) / MS_PER_DAY);
}

/**
 * Computes the new streak state given the last active date and "now".
 *
 * Rules (all comparisons done on Asia/Kolkata calendar dates):
 *  - No lastActiveDate yet -> this is the first ever completion: streak = 1.
 *  - lastActiveDate is today -> already counted today, streak unchanged.
 *  - lastActiveDate is yesterday -> streak += 1.
 *  - lastActiveDate is more than 1 day ago -> streak resets to 1.
 *
 * @param {Date|null} lastActiveDate
 * @param {number} currentStreak
 * @param {number} longestStreak
 * @param {Date} [now]
 */
function computeStreak(lastActiveDate, currentStreak, longestStreak, now = new Date()) {
  const todayKey = toDateKey(now);

  if (!lastActiveDate) {
    const newStreak = 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActiveDate: todayKey,
      streakChanged: true,
    };
  }

  const lastKey = toDateKey(lastActiveDate);
  const dayGap = diffInCalendarDays(lastKey, todayKey);

  if (dayGap === 0) {
    // Already completed a quest today - streak doesn't change.
    return {
      currentStreak,
      longestStreak,
      lastActiveDate: lastKey,
      streakChanged: false,
    };
  }

  if (dayGap === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastActiveDate: todayKey,
      streakChanged: true,
    };
  }

  // Gap of more than one day (or a negative gap from clock skew) resets the streak.
  const newStreak = 1;
  return {
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastActiveDate: todayKey,
    streakChanged: true,
  };
}

/**
 * Top-level orchestration: given a quest's difficulty/category and the
 * character's current state, computes every reward and the resulting
 * character state. Does not mutate its inputs.
 */
function resolveQuestCompletion(quest, character, now = new Date()) {
  const xpGained = baseXpForDifficulty(quest.difficulty);
  const goldGained = goldForXp(xpGained);
  const attribute = attributeForCategory(quest.category);

  const { level, currentXP, leveledUp, levelsGained } = applyXp(
    character.level,
    character.currentXP,
    xpGained
  );

  const streak = computeStreak(
    character.lastActiveDate,
    character.currentStreak,
    character.longestStreak,
    now
  );

  return {
    xpGained,
    goldGained,
    attribute,
    level,
    currentXP,
    leveledUp,
    levelsGained,
    newLevel: level,
    gold: character.gold + goldGained,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActiveDate: streak.lastActiveDate,
    attributeDelta: { [attribute]: xpGained },
  };
}

module.exports = {
  TIMEZONE,
  BASE_XP_BY_DIFFICULTY,
  CATEGORY_TO_ATTRIBUTE,
  xpRequiredForLevel,
  baseXpForDifficulty,
  goldForXp,
  attributeForCategory,
  applyXp,
  toDateKey,
  computeStreak,
  resolveQuestCompletion,
};
