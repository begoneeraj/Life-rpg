import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './ui/icons';

// XP is no longer a flat per-difficulty value - it's computed server-side
// from the AI's estimatedMinutes (see backend xpEngine.xpForMinutes), so the
// card shows the AI's difficulty label + time estimate, not a promised XP
// amount. The actual reward is only known (and shown) at completion time.
const DIFFICULTY_META = {
  easy: { label: 'Easy', color: 'quest-difficulty-easy' },
  medium: { label: 'Medium', color: 'quest-difficulty-medium' },
  hard: { label: 'Hard', color: 'quest-difficulty-hard' },
};

const CATEGORY_ICON = {
  coding: 'cat_coding',
  study: 'cat_study',
  gym: 'cat_gym',
  fitness: 'cat_gym',
  running: 'cat_running',
  meditation: 'cat_meditation',
  deep_work: 'cat_deep_work',
  chores: 'cat_chores',
  healthy_habits: 'cat_healthy',
  other: 'quests',
};

export default function QuestCard({ quest, onComplete, onDelete }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Real backend reward from a successful completion this session — used
  // only for the transient celebration; nothing is invented.
  const [reward, setReward] = useState(null);
  const isDone = quest.status === 'completed';
  const difficulty = DIFFICULTY_META[quest.difficulty] || DIFFICULTY_META.easy;

  async function handleComplete() {
    if (isDone || isCompleting) return;
    setIsCompleting(true);
    try {
      const data = await onComplete(quest.id);
      if (data) {
        setReward({ xp: data.xpGained, gold: data.goldGained });
        setTimeout(() => setReward(null), 2000);
      }
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(quest.id);
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`quest-row card-interactive flex items-center justify-between gap-3 p-3 transition-opacity sm:gap-4 sm:p-4 ${
        isDone ? 'border-xp-600/30 bg-xp-500/[0.04] opacity-70' : ''
      } ${reward ? 'ring-1 ring-xp-500/50' : ''}`}
    >
      {/* Real-reward celebration (transient, backend data only) */}
      <AnimatePresence>
        {reward && (
          <motion.div
            key="reward"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -2, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.95 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="pointer-events-none absolute right-3 top-1.5 z-10 flex items-center gap-2 font-hud text-sm"
            aria-live="polite"
          >
            <span className="text-reward">+{reward.xp} XP</span>
            <span aria-hidden="true" className="text-[10px] text-gold-500/80">
              ✦
            </span>
            <span className="flex items-center gap-1 font-hud text-sm text-gold-400">
              <Icon name="coin" className="h-3.5 w-3.5" />+{reward.gold}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest sigil: real category icon inside the framed quest-icon tile */}
      <span className="quest-icon" aria-hidden="true">
        <span>
          <Icon name={CATEGORY_ICON[quest.category] || 'quests'} className="h-6 w-6 text-parchment-200/80" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold text-parchment-100 ${
            isDone ? 'line-through decoration-xp-500' : ''
          }`}
        >
          {quest.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-parchment-300/60">
          <span className="capitalize">{quest.category.replace(/_/g, ' ')}</span>
          <span className={`tag-pill font-semibold sm:hidden ${difficulty.color}`}>{difficulty.label}</span>
          {quest.estimatedMinutes && (
            <span className="tag-pill border-mystic-600/40 bg-mystic-500/10 font-semibold text-mystic-400">
              ~{quest.estimatedMinutes} min
            </span>
          )}
        </div>
      </div>

      <div className="quest-row-actions flex shrink-0 items-center gap-2">
        <span className={`quest-difficulty ${difficulty.color}`}>{difficulty.label}</span>
        <AnimatePresence mode="wait" initial={false}>
          {isDone ? (
            <motion.span
              key="done"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-xp-500/20 text-xp-400"
              aria-hidden="true"
            >
              <Icon name="check" className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.button
              key="complete"
              type="button"
              onClick={handleComplete}
              disabled={isCompleting}
              className="btn-game px-3 py-2 text-[10px] sm:px-3.5"
              aria-label={`Mark quest "${quest.title}" as complete`}
            >
              {isCompleting ? 'Completing…' : 'Complete'}
            </motion.button>
          )}
        </AnimatePresence>

        {!isDone && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="quest-delete"
            aria-label={`Delete quest "${quest.title}"`}
          >
            ✕
          </button>
        )}
      </div>
    </motion.li>
  );
}
