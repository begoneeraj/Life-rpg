import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// XP is no longer a flat per-difficulty value - it's computed server-side
// from the AI's estimatedMinutes (see backend xpEngine.xpForMinutes), so the
// card shows the AI's difficulty label + time estimate, not a promised XP
// amount. The actual reward is only known (and shown) at completion time.
const DIFFICULTY_META = {
  easy: { label: 'Easy', color: 'text-xp-400 border-xp-600/40' },
  medium: { label: 'Medium', color: 'text-gold-400 border-gold-600/40' },
  hard: { label: 'Hard', color: 'text-ember-400 border-ember-600/40' },
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
      className={`card-interactive parchment-card flex items-center justify-between gap-4 p-4 transition-opacity ${
        isDone ? 'border-xp-600/30 bg-xp-500/[0.04] opacity-70' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-semibold text-parchment-100 ${
            isDone ? 'line-through decoration-xp-500' : ''
          }`}
        >
          <span aria-hidden="true">{CATEGORY_ICON[quest.category] || '📜'}</span> {quest.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-parchment-300/60">
          <span className="capitalize">{quest.category.replace(/_/g, ' ')}</span>
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

      <div className="flex shrink-0 items-center gap-2">
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
              className="btn-primary px-3.5 py-2 text-xs"
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
            className="btn-danger"
            aria-label={`Delete quest "${quest.title}"`}
          >
            ✕
          </button>
        )}
      </div>
    </motion.li>
  );
}
