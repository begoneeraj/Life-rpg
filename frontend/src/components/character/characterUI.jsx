import SlotIcon from './characterIcons';

/**
 * Shared presentational primitives for the Character / Character Forge
 * screens — the RPG-HUD layer that wraps the existing data. All styling is
 * component-local Tailwind + inline styles built on the theme's CSS-variable
 * token classes (dungeon/parchment/gold/hud-badge/…) so this file stays
 * independently mergeable with the parallel global-theme track: no literals,
 * no global CSS, no new dependencies.
 */

/* ------------------------------------------------------------------ */
/* Level tiers — purely cosmetic labels aligned with the avatar's      */
/* EXISTING presentation thresholds in CharacterAvatar (25+ elite      */
/* breathing, 50+ mythic eyes). No new progression logic.              */
/* ------------------------------------------------------------------ */
export function levelTier(level) {
  if (level >= 50) return 'MYTHIC';
  if (level >= 25) return 'ELITE';
  if (level >= 15) return 'VETERAN';
  if (level >= 5) return 'ADVENTURER';
  return 'NOVICE';
}

/* ------------------------------------------------------------------ */
/* Pixel corners — four 2px L-brackets (plus a 2px dot) that turn any  */
/* relative container into a game-window frame. Decorative only.       */
/* ------------------------------------------------------------------ */
const CORNER_STYLES = [
  { top: '-1px', left: '-1px', borderWidth: '2px 0 0 2px' },
  { top: '-1px', right: '-1px', borderWidth: '2px 2px 0 0' },
  { bottom: '-1px', left: '-1px', borderWidth: '0 0 2px 2px' },
  { bottom: '-1px', right: '-1px', borderWidth: '0 2px 2px 0' },
];

export function PixelCorners({ color = 'rgb(var(--c-hudline) / 0.9)', size = 9 }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {CORNER_STYLES.map((pos, i) => (
        <span
          key={i}
          className="absolute"
          style={{ ...pos, width: size, height: size, borderStyle: 'solid', borderColor: color }}
        />
      ))}
      <span
        className="absolute"
        style={{ top: 2, left: 2, width: 2, height: 2, background: color }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* GlassPanel — the frosted-glass HUD surface: translucent token-based */
/* fill + backdrop blur + hairline border + inner top highlight.       */
/* The character/avatar itself is NEVER made transparent by this.      */
/* ------------------------------------------------------------------ */
export function GlassPanel({ children, className = '', blur = 14 }) {
  return (
    <div
      className={`relative rounded-lg border border-dungeon-600/50 ${className}`}
      style={{
        background:
          'linear-gradient(165deg, rgb(var(--c-dungeon-850) / 0.78), rgb(var(--c-dungeon-900) / 0.66))',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        /* Depth resolves through the theme's shadow tokens: soft brown
           shadows on parchment in light mode, deep black in dark mode —
           never a hardcoded black drop shadow on the light world. */
        boxShadow:
          'inset 0 1px 0 rgb(var(--c-parchment-100) / 0.08), inset 0 0 0 1px rgb(var(--c-gold-400) / 0.05), var(--shadow-panel-lg)',
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SectionTitle — pixel rune marker + tracked label, quiet by design   */
/* so panels never outshine the character.                             */
/* ------------------------------------------------------------------ */
export function SectionTitle({ icon, children, right = null }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span aria-hidden="true" className="flex flex-col gap-[2px]">
        <span className="h-[3px] w-[3px] bg-gold-400/80" />
        <span className="h-[3px] w-[3px] bg-gold-400/40" />
      </span>
      {icon && <SlotIcon name={icon} className="h-3.5 w-3.5 text-parchment-300/60" />}
      <h2 className="font-hud text-[11px] uppercase tracking-[0.22em] text-parchment-300/70">
        {children}
      </h2>
      {right && <span className="ml-auto">{right}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LevelPlate — "LV 2 / ADVENTURER" as a proper RPG readout: big       */
/* tabular numeral, tier word, pixel frame, glass surface.             */
/* ------------------------------------------------------------------ */
export function LevelPlate({ level, className = '' }) {
  return (
    <GlassPanel className={`flex items-center gap-4 px-4 py-3 ${className}`}>
      <PixelCorners size={10} />
      <div className="relative flex items-baseline gap-1.5">
        <span className="font-hud text-[11px] uppercase tracking-[0.3em] text-gold-500/90">LV</span>
        <span
          className="font-hud text-4xl leading-none text-gold-400"
          style={{ textShadow: '0 0 18px rgb(var(--c-glow-gold) / 0.45)' }}
        >
          {level}
        </span>
      </div>
      <div className="relative min-w-0 border-l border-dungeon-600/70 pl-3">
        <p className="font-hud text-sm tracking-[0.18em] text-parchment-100">
          {levelTier(level)}
        </p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-parchment-300/50">
          Adventurer Rank
        </p>
      </div>
    </GlassPanel>
  );
}

/* ------------------------------------------------------------------ */
/* OptionChip — selectable appearance choice. Selected state uses      */
/* gold border + fill + pixel corners + glow (never color alone);      */
/* locked state shows the real unlock level with a lock icon.          */
/* ------------------------------------------------------------------ */
export function OptionChip({ selected, onClick, disabled = false, locked = false, unlockLevel, children }) {
  const base =
    'relative inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:translate-y-px active:opacity-90';
  const state = locked
    ? 'cursor-not-allowed border-dashed border-dungeon-700 bg-dungeon-900/80 text-parchment-300/70'
    : selected
      ? 'border-gold-500 bg-gold-500/10 text-gold-300 shadow-glow'
      : 'border-dungeon-600 bg-dungeon-800/80 text-parchment-200/80 hover:border-mystic-500 hover:text-mystic-400';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || locked}
      aria-pressed={selected}
      title={locked ? `Locked — unlocks at level ${unlockLevel}` : undefined}
      className={`${base} ${state} disabled:cursor-not-allowed`}
    >
      {selected && <PixelCorners size={7} color="rgb(var(--c-gold-300) / 0.95)" />}
      {locked && <SlotIcon name="lock" className="h-3 w-3" />}
      <span className="relative">{children}</span>
      {locked && (
        <span className="relative font-hud text-[9px] uppercase tracking-widest text-gold-500/90">
          LV {unlockLevel}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Swatch — square game-style color well (dyes, skin, eyes, hair).     */
/* Selected: gold double ring + corner pixel + slight lift.            */
/* ------------------------------------------------------------------ */
export function Swatch({ selected, onClick, hex, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={selected}
      aria-label={label}
      className={`relative h-7 w-7 shrink-0 rounded-sm border transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
        selected
          ? 'border-gold-400 shadow-glow ring-1 ring-gold-300/70 ring-offset-1 ring-offset-dungeon-900'
          : 'border-dungeon-600 hover:border-parchment-300/50'
      }`}
      style={{ background: hex }}
    >
      {selected && (
        <>
          <PixelCorners size={6} color="rgb(var(--c-gold-300) / 1)" />
          {/* Center pixel marker: value-inverted via difference blending so
              it reads on light AND dark swatches without a color database. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 m-auto h-1.5 w-1.5"
            style={{ background: '#f5ecd7', mixBlendMode: 'difference' }}
          />
        </>
      )}
    </button>
  );
}
