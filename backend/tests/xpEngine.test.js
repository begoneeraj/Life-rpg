'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  xpRequiredForLevel,
  applyXp,
  computeStreak,
  resolveQuestCompletion,
  xpForMinutes,
  goldForXp,
  attributeForCategory,
} = require('../src/services/xpEngine');

test('xpRequiredForLevel matches the 100 * n^1.5 formula', () => {
  assert.equal(xpRequiredForLevel(1), 100);
  assert.equal(xpRequiredForLevel(2), Math.round(100 * Math.pow(2, 1.5))); // 283
  assert.equal(xpRequiredForLevel(3), Math.round(100 * Math.pow(3, 1.5))); // 520
});

test('xpRequiredForLevel rejects invalid levels', () => {
  assert.throws(() => xpRequiredForLevel(0));
  assert.throws(() => xpRequiredForLevel(-1));
});

test('xpForMinutes grows sublinearly with task length and clamps at both ends', () => {
  assert.equal(xpForMinutes(1), 5); // clamped up to MIN_XP
  assert.equal(xpForMinutes(10), 10);
  assert.equal(xpForMinutes(30), 25);
  assert.equal(xpForMinutes(60), 44);
  assert.equal(xpForMinutes(120), 76);
  assert.equal(xpForMinutes(1000), 200); // clamped down to MAX_XP
  assert.throws(() => xpForMinutes(0));
  assert.throws(() => xpForMinutes(-5));
});

test('xpForMinutes does not scale linearly: doubling minutes does not double XP', () => {
  const xp30 = xpForMinutes(30);
  const xp60 = xpForMinutes(60);
  assert.ok(xp60 < xp30 * 2, 'sublinear growth: 60min should earn less than 2x the 30min reward');
});

test('goldForXp floors half of XP', () => {
  assert.equal(goldForXp(50), 25);
  assert.equal(goldForXp(11), 5); // floors
});

test('attributeForCategory maps known categories and falls back for unknown ones', () => {
  assert.equal(attributeForCategory('coding'), 'intellect');
  assert.equal(attributeForCategory('gym'), 'strength');
  assert.equal(attributeForCategory('running'), 'strength');
  assert.equal(attributeForCategory('meditation'), 'focus');
  assert.equal(attributeForCategory('deep_work'), 'discipline');
  assert.equal(attributeForCategory('healthy_habits'), 'energy');
  assert.equal(attributeForCategory('mystery-category'), 'discipline');
});

test('applyXp: no level up when XP stays under the threshold', () => {
  const result = applyXp(1, 50, 10);
  assert.equal(result.level, 1);
  assert.equal(result.currentXP, 60);
  assert.equal(result.leveledUp, false);
  assert.equal(result.levelsGained, 0);
});

test('applyXp: levels up exactly at the threshold and carries over remainder', () => {
  // Level 1 requires 100 XP. 90 + 25 = 115 -> level up, 15 XP carried over.
  const result = applyXp(1, 90, 25);
  assert.equal(result.level, 2);
  assert.equal(result.currentXP, 15);
  assert.equal(result.leveledUp, true);
  assert.equal(result.levelsGained, 1);
});

test('applyXp: cascades through multiple level-ups from one large XP grant', () => {
  // Level 1 -> 2 needs 100, level 2 -> 3 needs 283. A 500 XP grant should
  // cover both and leave remainder for level 3.
  const result = applyXp(1, 0, 500);
  assert.equal(result.level, 3);
  assert.equal(result.leveledUp, true);
  assert.equal(result.levelsGained, 2);
  assert.equal(result.currentXP, 500 - 100 - 283);
});

test('computeStreak: first ever completion starts a streak of 1', () => {
  const now = new Date('2026-01-10T12:00:00Z');
  const result = computeStreak(null, 0, 0, now);
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 1);
  assert.equal(result.streakChanged, true);
});

test('computeStreak: completing again same day does not change the streak', () => {
  const now = new Date('2026-01-10T18:00:00Z');
  const lastActive = new Date('2026-01-10T08:00:00Z');
  const result = computeStreak(lastActive, 3, 5, now);
  assert.equal(result.currentStreak, 3);
  assert.equal(result.longestStreak, 5);
  assert.equal(result.streakChanged, false);
});

test('computeStreak: completing the day after increments the streak', () => {
  const lastActive = new Date('2026-01-10T10:00:00Z'); // 2026-01-10 15:30 IST
  const now = new Date('2026-01-11T10:00:00Z'); // 2026-01-11 15:30 IST
  const result = computeStreak(lastActive, 3, 5, now);
  assert.equal(result.currentStreak, 4);
  assert.equal(result.longestStreak, 5);
  assert.equal(result.streakChanged, true);
});

test('computeStreak: a beaten longest streak is updated', () => {
  const lastActive = new Date('2026-01-10T12:00:00Z');
  const now = new Date('2026-01-11T12:00:00Z');
  const result = computeStreak(lastActive, 5, 5, now);
  assert.equal(result.currentStreak, 6);
  assert.equal(result.longestStreak, 6);
});

test('computeStreak: a gap of more than one day resets the streak to 1', () => {
  const lastActive = new Date('2026-01-01T12:00:00Z');
  const now = new Date('2026-01-10T12:00:00Z');
  const result = computeStreak(lastActive, 12, 12, now);
  assert.equal(result.currentStreak, 1);
  assert.equal(result.longestStreak, 12); // longest is untouched, not beaten
  assert.equal(result.streakChanged, true);
});

test('computeStreak is timezone-safe around the IST boundary (UTC date differs from IST date)', () => {
  // 2026-01-10T19:30:00Z is 2026-01-11T01:00 IST (IST = UTC+5:30) - already "tomorrow" in IST.
  const lastActive = new Date('2026-01-10T10:00:00Z'); // 2026-01-10 15:30 IST
  const now = new Date('2026-01-10T19:30:00Z'); // 2026-01-11 01:00 IST
  const result = computeStreak(lastActive, 1, 1, now);
  assert.equal(result.currentStreak, 2, 'should treat this as the next IST calendar day');
});

test('resolveQuestCompletion: full happy path for a 30-minute coding quest', () => {
  const quest = { difficulty: 'medium', category: 'coding', estimatedMinutes: 30 };
  const character = {
    level: 1,
    currentXP: 90,
    gold: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };
  const now = new Date('2026-01-10T12:00:00Z');
  const result = resolveQuestCompletion(quest, character, now);

  assert.equal(result.xpGained, 25); // xpForMinutes(30)
  assert.equal(result.goldGained, 12);
  assert.equal(result.attribute, 'intellect');
  assert.equal(result.level, 2); // 90 + 25 = 115 >= 100
  assert.equal(result.currentXP, 15);
  assert.equal(result.leveledUp, true);
  assert.equal(result.gold, 12);
  assert.equal(result.currentStreak, 1);
  assert.deepEqual(result.attributeDelta, { intellect: 25 });
});
