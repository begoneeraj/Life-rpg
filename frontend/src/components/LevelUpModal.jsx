import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * The celebratory core-loop moment: a full-screen takeover with a confetti
 * burst whenever `info` (an object with fromLevel/toLevel) is set.
 */
export default function LevelUpModal({ info, onDismiss }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!info) return;

    const duration = 1200;
    const end = Date.now() + duration;
    const colors = ['#e8c874', '#8b5cf6', '#22c55e', '#ff6b3d'];

    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 65, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 65, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors, startVelocity: 45 });

    closeButtonRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') onDismiss();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [info, onDismiss]);

  return (
    <AnimatePresence>
      {info && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="levelup-heading"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dungeon-950/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            className="relative mx-4 flex max-w-md flex-col items-center gap-4 rounded-2xl border-2 border-gold-500/70 bg-gradient-to-b from-dungeon-850 to-dungeon-900 px-8 py-10 text-center shadow-glow"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.span
              aria-hidden="true"
              className="text-6xl"
              initial={{ rotate: -15 }}
              animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              🏆
            </motion.span>

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-mystic-400">
              Level Up!
            </p>

            <h2
              id="levelup-heading"
              className="font-display text-3xl font-extrabold text-gold-400 sm:text-4xl"
            >
              Level {info?.fromLevel} <span className="text-parchment-100">→</span> Level{' '}
              {info?.toLevel}
            </h2>

            <p className="text-sm text-parchment-200/80">
              Your legend grows. Keep completing quests to push even further.
            </p>

            <button
              ref={closeButtonRef}
              type="button"
              className="btn-primary mt-2 w-full"
              onClick={onDismiss}
            >
              Continue the Journey
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
