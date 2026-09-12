import CharacterAvatar from './CharacterAvatar';

/**
 * Head-and-shoulders portrait crop of the ONE real character (spec: profile
 * avatar must be a face/head portrait, never the full-body figure). Reuses
 * CharacterAvatar's fixed 200x320 stage via its `viewBox` crop prop — same
 * face, same hair, same customization — just framed as a player icon.
 *
 * `frame` selects a tier of portrait frame treatment (presentation only —
 * derived from the character's REAL level, never from invented ownership):
 *   - 'none':  thin gold ring (default everywhere)
 *   - 'shield': full frame — ornate ring + corner notches + LV chip below
 *
 * Common usage: Profile hero portrait, HUD identity chip.
 */
export default function PortraitAvatar({
  // straight passthrough of the appearance/equipment state
  level = 1,
  frame = 'none',
  className = '',
  ...appearance
}) {
  const showShield = frame === 'shield';

  return (
    <span className={`relative inline-block ${className}`}>
      {showShield && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-4px] rounded-[inherit] border-2 border-gold-500/70"
          />
          {/* pixel corner notches — the app's signature frame detail */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-[4px] -top-[4px] h-2 w-2 border-l-2 border-t-2 border-gold-300"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-[4px] -top-[4px] h-2 w-2 border-r-2 border-t-2 border-gold-300"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[4px] -left-[4px] h-2 w-2 border-b-2 border-l-2 border-gold-300"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[4px] -right-[4px] h-2 w-2 border-b-2 border-r-2 border-gold-300"
          />
        </>
      )}

      <CharacterAvatar
        {...appearance}
        level={level}
        idle={false}
        viewBox="40 18 120 120"
        className="h-full w-full"
      />

      {showShield && (
        <span
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded border border-gold-500/70 bg-dungeon-950/95 px-1.5 py-0.5 font-hud text-[9px] font-bold tracking-widest text-gold-300"
          aria-label={`Level ${level}`}
        >
          LV {level}
        </span>
      )}
    </span>
  );
}
