'use strict';

/**
 * xpEngine.js — pure, unit-testable game logic for Life RPG.
 *
 * Nothing here touches the database or the network. Every function takes
 * plain data in and returns plain data out, so the leveling/streak math can
 * be verified with `node --test` without ever booting a server.
 */

const TIMEZONE = 'Asia/Kolkata';

// XP is a sublinear (exponent < 1) function of the AI-estimated task length,
// not a flat lookup by difficulty tier - a 10-minute task and a 200-minute
// task are rewarded on a curve, not bucketed into one of three fixed values.
// Diminishing returns per minute keep a single huge estimate from dominating
// the economy the way a flat "hard = 50 XP" bucket couldn't scale down for.
const XP_PER_MINUTE_COEFFICIENT = 1.65;
const XP_GROWTH_EXPONENT = 0.8;
const MIN_XP = 5;
const MAX_XP = 200;

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

/**
 * xpForMinutes(m) = clamp(round(1.65 * m^0.8), MIN_XP, MAX_XP)
 * A 10-min task -> ~10 XP, a 30-min task -> ~25 XP, a 120-min task -> ~76 XP,
 * a 300-min task -> ~152 XP (clamped at MAX_XP well before it could run away).
 */
function xpForMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new RangeError(`xpForMinutes: minutes must be a positive number, got ${minutes}`);
  }
  const raw = XP_PER_MINUTE_COEFFICIENT * Math.pow(minutes, XP_GROWTH_EXPONENT);
  return Math.min(MAX_XP, Math.max(MIN_XP, Math.round(raw)));
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

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/**
 * Returns 0 (Sunday) through 6 (Saturday) for the given instant, rendered in
 * the Asia/Kolkata timezone - same rationale as toDateKey: a weekly-recurring
 * task's "today" must mean the same calendar day for every user regardless
 * of server timezone.
 */
function toDayOfWeek(date) {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, weekday: 'short' }).format(date);
  return WEEKDAY_INDEX[weekday];
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
 * Top-level orchestration: given a quest's estimatedMinutes/category and the
 * character's current state, computes every reward and the resulting
 * character state. Does not mutate its inputs.
 */
function resolveQuestCompletion(quest, character, now = new Date()) {
  const xpGained = xpForMinutes(quest.estimatedMinutes);
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
  CATEGORY_TO_ATTRIBUTE,
  xpRequiredForLevel,
  xpForMinutes,
  goldForXp,
  attributeForCategory,
  applyXp,
  toDateKey,
  toDayOfWeek,
  computeStreak,
  resolveQuestCompletion,
};
