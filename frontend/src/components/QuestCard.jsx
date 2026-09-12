import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  coding: '💻',
  study: '📚',
  gym: '🏋️',
  fitness: '🏃',
  running: '🏃',
  meditation: '🧘',
  deep_work: '🎯',
  chores: '🧹',
  healthy_habits: '❤️',
  other: '📜',
};

export default function QuestCard({ quest, onComplete, onDelete }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isDone = quest.status === 'completed';
  const difficulty = DIFFICULTY_META[quest.difficulty] || DIFFICULTY_META.easy;

  async function handleComplete() {
    if (isDone || isCompleting) return;
    setIsCompleting(true);
    try {
      await onComplete(quest.id);
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
      }`}
    >
      <div className="quest-icon" aria-hidden="true">
        <span>{CATEGORY_ICON[quest.category] || '📜'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-display text-lg font-semibold text-parchment-100 sm:text-xl ${
            isDone ? 'line-through decoration-xp-500' : ''
          }`}
        >
          <span aria-hidden="true">{CATEGORY_ICON[quest.category] || '📜'}</span> {quest.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-parchment-300/60">
          <span className="tag-pill border-dungeon-600/70 bg-dungeon-900/70 font-semibold text-parchment-300/80">
            {quest.category.replace(/_/g, ' ')}
          </span>
          <span
            className={`tag-pill font-semibold ${difficulty.color}`}
          >
            {difficulty.label}
          </span>
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
              ✓
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
