import { motion } from 'framer-motion';

/**
 * Animated XP bar. `current` and `required` are XP values (not percentages) -
 * this component does the percentage math so callers never round it themselves.
 */
export default function XPBar({ level, current, required, size = 'md' }) {
  const pct = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 0;
  const height = size === 'lg' ? 'h-5' : 'h-3';

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-parchment-300/80">
        <span className="hud-badge font-hud border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-glow">
          Level {level}
        </span>
        <span aria-hidden="true" className="font-hud text-parchment-300/70">
          {current.toLocaleString()} / {required.toLocaleString()} XP
        </span>
      </div>
      <div
        className={`relative w-full overflow-hidden rounded-full border border-dungeon-600 bg-dungeon-900 ${height}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Experience progress: ${current} of ${required} XP toward level ${level + 1}`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-xp-600 via-xp-500 to-xp-400 shadow-glow-xp"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Segment ticks: pure CSS, gives the bar its game-HUD rhythm. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent 14px, rgba(10, 7, 20, 0.55) 14px, rgba(10, 7, 20, 0.55) 16px)',
          }}
        />
        {/* Bevel: light top edge inside the trough, dark inner bottom. */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow:
              'inset 0 1px 0 rgba(245, 236, 215, 0.10), inset 0 -2px 3px rgba(0, 0, 0, 0.45)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}
