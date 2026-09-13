'use strict';

/**
 * battleEngine.js — pure logic for resolving a finished 1v1 battle, mirroring
 * xpEngine.js's "no database, no network" style so it can be unit tested.
 *
 * Every battle is best-of-3: tasks are grouped into round 1/2/3, each round
 * is won by whichever side completed more of that round's tasks (a round
 * with an equal count is won by neither), and the battle winner is whoever
 * took the most rounds. A 1-1 rounds split (one round left undecided) is an
 * overall tie.
 */

const { applyXp } = require('./xpEngine');

const ROUND_COUNT = 3;
const BASE_BATTLE_XP = 50;

/**
 * @param {Array<{round:number, challengerCompletedAt:Date|null, opponentCompletedAt:Date|null}>} tasks
 * @returns {{
 *   rounds: Array<{round:number, challengerCompleted:number, opponentCompleted:number, winnerSide:'challenger'|'opponent'|null}>,
 *   roundsWon: {challenger:number, opponent:number},
 *   winnerSide: 'challenger'|'opponent'|null,
 *   challengerXp: number,
 *   opponentXp: number,
 * }}
 */
function resolveBattleOutcome(tasks) {
  const rounds = [];
  for (let round = 1; round <= ROUND_COUNT; round += 1) {
    const roundTasks = tasks.filter((t) => t.round === round);
    const challengerCompleted = roundTasks.filter((t) => t.challengerCompletedAt).length;
    const opponentCompleted = roundTasks.filter((t) => t.opponentCompletedAt).length;
    const winnerSide =
      challengerCompleted === opponentCompleted
        ? null
        : challengerCompleted > opponentCompleted
        ? 'challenger'
        : 'opponent';
    rounds.push({ round, challengerCompleted, opponentCompleted, winnerSide });
  }

  const roundsWon = {
    challenger: rounds.filter((r) => r.winnerSide === 'challenger').length,
    opponent: rounds.filter((r) => r.winnerSide === 'opponent').length,
  };

  const winnerSide =
    roundsWon.challenger === roundsWon.opponent
      ? null
      : roundsWon.challenger > roundsWon.opponent
      ? 'challenger'
      : 'opponent';

  return {
    rounds,
    roundsWon,
    winnerSide,
    challengerXp: winnerSide === null ? BASE_BATTLE_XP : Math.round(BASE_BATTLE_XP * (winnerSide === 'challenger' ? 2 : 0.5)),
    opponentXp: winnerSide === null ? BASE_BATTLE_XP : Math.round(BASE_BATTLE_XP * (winnerSide === 'opponent' ? 2 : 0.5)),
  };
}

module.exports = { ROUND_COUNT, BASE_BATTLE_XP, resolveBattleOutcome, applyXp };
