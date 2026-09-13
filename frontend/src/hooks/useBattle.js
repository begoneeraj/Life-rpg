import { useEffect, useRef, useState } from 'react';
import { fetchBattleStatus } from '../api/battle';

const POLL_INTERVAL_MS = 5000;

/**
 * Polls GET /battle/:id/status every 5s (no WebSockets yet) and exposes the
 * live state of a 1v1 battle. Polling stops once the battle reaches a
 * terminal status so a finished match doesn't keep hitting the API.
 */
export default function useBattle(battleId) {
  const [status, setStatus] = useState(null);
  const [myProgress, setMyProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [roundsWon, setRoundsWon] = useState({ me: 0, opponent: 0 });
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!battleId) return undefined;

    let cancelled = false;

    async function poll() {
      try {
        const { data } = await fetchBattleStatus(battleId);
        if (cancelled) return;

        setStatus(data.status);
        setMyProgress(data.my_progress);
        setOpponentProgress(data.opponent_progress);
        setTimeLeft(data.time_remaining_seconds);
        setTasks(data.tasks);
        setRounds(data.rounds);
        setRoundsWon(data.rounds_won);
        setError(null);

        if (['completed', 'declined'].includes(data.status) && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Could not load battle status');
      }
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [battleId]);

  return { status, myProgress, opponentProgress, timeLeft, tasks, rounds, roundsWon, error };
}
