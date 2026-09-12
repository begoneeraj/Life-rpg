import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * The celebratory core-loop moment: a full-screen takeover with a confetti
 * burst whenever `info` (an object with fromLevel/toLevel) is set.
 *
 * R3 presentation: RPG level ceremony — gold-ringed sword emblem, rune tick
 * divider, animated LV X → X+1 numerals. Logic (focus, Escape, confetti,
 * dismiss) is unchanged.
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
            className="game-panel game-panel-gold hud-frame relative mx-4 flex max-w-md flex-col items-center gap-4 px-8 py-10 text-center"
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* pixel corner brackets */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 border-l-2 border-t-2 border-gold-400/80"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2.5 right-2.5 h-3.5 w-3.5 border-b-2 border-r-2 border-gold-400/80"
            />

            {/* Emblem: gold ring + sword rune (replaces the trophy emoji) */}
            <motion.span
              aria-hidden="true"
              className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-500/70 bg-dungeon-950/70 shadow-glow"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-9 w-9 text-gold-300"
              >
                <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
                <path d="m13 19 6-6" />
                <path d="m16 16 4 4" />
                <path d="m19 21 2-2" />
              </svg>
            </motion.span>

            <p className="font-hud text-[10px] uppercase tracking-[0.35em] text-mystic-400">
              Level Up
            </p>

            {/* LV X → X+1 with a count-up on the new level */}
            <h2 id="levelup-heading" className="font-display text-4xl font-extrabold sm:text-5xl">
              <motion.span
                className="text-parchment-200/80"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                LV {info?.fromLevel}
              </motion.span>
              <span aria-hidden="true" className="mx-3 text-gold-500">
                →
              </span>
              <motion.span
                className="inline-block text-gold-300 drop-shadow-[0_0_18px_rgb(var(--c-glow-gold)/0.55)]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 320, damping: 14 }}
              >
                LV {info?.toLevel}
              </motion.span>
            </h2>

            {/* rune tick divider */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-600/70" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold-500/80" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-600/70" />
            </div>

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
