import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useBattle from '../hooks/useBattle';
import useStore from '../store/useStore';
import Icon from '../components/ui/icons';
import { Skeleton } from '../components/Skeleton';

function formatClock(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) return '--:--';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STATUS_META = {
  pending: { label: 'Waiting for accept', cls: 'border-mystic-500/50 bg-mystic-500/10 text-mystic-300' },
  active: { label: 'Battle Active', cls: 'border-ember-500/50 bg-ember-500/10 text-ember-400' },
  completed: { label: 'Completed', cls: 'border-xp-500/50 bg-xp-500/10 text-xp-400' },
  declined: { label: 'Declined', cls: 'border-dungeon-500 bg-dungeon-800 text-parchment-300/60' },
};

function RoundPip({ leading }) {
  const cls =
    leading === 'me'
      ? 'border-gold-400 bg-gold-500/20 text-gold-300'
      : leading === 'opponent'
      ? 'border-ember-500/60 bg-ember-500/10 text-ember-400'
      : 'border-dungeon-600 bg-dungeon-900 text-parchment-300/40';
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 font-hud text-[10px] font-bold ${cls}`}
    >
      {leading === 'me' ? 'W' : leading === 'opponent' ? 'L' : '·'}
    </span>
  );
}

export default function Battle() {
  const { battleId } = useParams();
  const { status, myProgress, opponentProgress, timeLeft, tasks, rounds, roundsWon, error } =
    useBattle(battleId);
  const completeBattleTask = useStore((s) => s.completeBattleTask);
  const [pendingTaskIds, setPendingTaskIds] = useState(() => new Set());

  const tasksByRound = useMemo(() => {
    const map = new Map();
    for (const t of tasks) {
      if (!map.has(t.round)) map.set(t.round, []);
      map.get(t.round).push(t);
    }
    return map;
  }, [tasks]);

  async function handleComplete(taskId) {
    setPendingTaskIds((prev) => new Set(prev).add(taskId));
    try {
      await completeBattleTask(battleId, taskId);
    } finally {
      setPendingTaskIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }

  if (error && status === null) {
    return (
      <div className="page-container">
        <div className="game-panel p-10 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-ember-400">
            Battle unavailable
          </p>
          <p className="mt-1 text-sm text-parchment-300/60">{error}</p>
          <Link to="/friends" className="btn-game mt-4 inline-flex px-4 py-2 text-xs">
            Back to Friends
          </Link>
        </div>
      </div>
    );
  }

  if (status === null) {
    return (
      <div className="page-container space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const meta = STATUS_META[status] || STATUS_META.pending;
  const outcome =
    status === 'completed'
      ? roundsWon.me > roundsWon.opponent
        ? 'victory'
        : roundsWon.me < roundsWon.opponent
        ? 'defeat'
        : 'tie'
      : null;

  return (
    <div className="page-container space-y-6">
      <header className="page-header">
        <div>
          <p className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">
            <Icon name="battle" className="h-3 w-3" aria-hidden="true" />
            Best of 3 Rounds
          </p>
          <h1 className="page-title mt-1">Battle Arena</h1>
        </div>
        <span className={`hud-badge font-hud uppercase ${meta.cls}`}>{meta.label}</span>
      </header>

      {outcome && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`game-panel p-6 text-center ${
            outcome === 'victory' ? 'game-panel-gold' : ''
          }`}
        >
          <p
            className={`font-display text-2xl font-extrabold ${
              outcome === 'victory'
                ? 'text-gold-300'
                : outcome === 'defeat'
                ? 'text-ember-400'
                : 'text-parchment-200'
            }`}
          >
            {outcome === 'victory' ? 'Victory! 2x XP earned.' : outcome === 'defeat' ? 'Defeat — 0.5x XP earned.' : "It's a tie — XP split evenly."}
          </p>
        </motion.div>
      )}

      {/* ---------------- scoreboard ---------------- */}
      <section className="game-panel hud-frame grid gap-4 p-5 sm:grid-cols-3 sm:items-center">
        <div className="text-center sm:text-left">
          <p className="font-hud text-[10px] uppercase tracking-[0.25em] text-parchment-300/50">You</p>
          <p className="font-display text-3xl font-extrabold text-gold-300">{myProgress}</p>
          <p className="text-[10px] uppercase tracking-widest text-parchment-300/40">tasks done</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center gap-1 font-hud text-lg text-parchment-100">
            <Icon name="timer" className="h-4 w-4 text-xp-400" />
            {formatClock(timeLeft)}
          </span>
          <div className="flex gap-1.5" aria-label="Round results">
            {[1, 2, 3].map((round) => {
              const r = rounds.find((rd) => rd.round === round);
              return <RoundPip key={round} leading={r?.leading ?? null} />;
            })}
          </div>
          <p className="font-hud text-[10px] uppercase tracking-widest text-parchment-300/40">
            Rounds won: {roundsWon.me ?? 0} - {roundsWon.opponent ?? 0}
          </p>
        </div>

        <div className="text-center sm:text-right">
          <p className="font-hud text-[10px] uppercase tracking-[0.25em] text-parchment-300/50">
            Opponent
          </p>
          <p className="font-display text-3xl font-extrabold text-ember-400">{opponentProgress}</p>
          <p className="text-[10px] uppercase tracking-widest text-parchment-300/40">tasks done</p>
        </div>
      </section>

      {/* ---------------- rounds ---------------- */}
      {status === 'pending' ? (
        <div className="game-panel flex flex-col items-center gap-3 p-10 text-center">
          <Icon name="timer" className="h-9 w-9 text-parchment-300/25" />
          <p className="font-display text-base font-bold text-parchment-100">Waiting to start</p>
          <p className="text-sm text-parchment-300/60">
            The battle begins the moment your opponent accepts the challenge.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((round) => (
            <section key={round} className="game-panel space-y-2 p-4">
              <h2 className="flex items-center justify-between font-display text-xs font-bold uppercase tracking-[0.2em] text-parchment-300/70">
                Round {round}
                <RoundPip leading={rounds.find((r) => r.round === round)?.leading ?? null} />
              </h2>
              <ul className="space-y-1.5">
                {(tasksByRound.get(round) || []).map((task) => (
                  <li
                    key={task.id}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-sm ${
                      task.completed_by_me
                        ? 'border-xp-600/40 bg-xp-500/[0.06] text-parchment-300/60 line-through decoration-xp-500'
                        : 'border-dungeon-700 bg-dungeon-900/60 text-parchment-100'
                    }`}
                  >
                    <button
                      type="button"
                      disabled={task.completed_by_me || status !== 'active' || pendingTaskIds.has(task.id)}
                      onClick={() => handleComplete(task.id)}
                      aria-label={`Mark "${task.task_text}" done`}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                        task.completed_by_me
                          ? 'border-xp-500 bg-xp-500/20 text-xp-300'
                          : 'border-dungeon-500 text-transparent hover:border-gold-400'
                      } disabled:cursor-not-allowed`}
                    >
                      <Icon name="check" className="h-3 w-3" />
                    </button>
                    <span className="min-w-0 flex-1 break-words">{task.task_text}</span>
                    {task.completed_by_opponent && (
                      <Icon
                        name="check"
                        className="h-3 w-3 shrink-0 text-ember-400"
                        aria-label="Opponent completed this task"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Link
        to="/friends"
        className="inline-flex items-center gap-1 text-xs font-semibold text-mystic-400 hover:underline"
      >
        <Icon name="chevron" className="h-3 w-3 rotate-180" /> Back to Friends
      </Link>
    </div>
  );
}
