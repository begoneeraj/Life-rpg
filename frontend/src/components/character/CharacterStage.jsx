import { motion } from 'framer-motion';
import CharacterAvatar, { ELITE_LEVEL, MYTHIC_LEVEL } from './CharacterAvatar';
import { GlassPanel, PixelCorners } from './characterUI';

/**
 * CharacterStage — the RPG character-select presentation environment that
 * surrounds the existing CharacterAvatar. The avatar is the hero; everything
 * here is atmosphere built from CSS gradients + one small inline SVG rune
 * platform (no assets, no canvas, no heavy particle system):
 *
 *   - vertical light beam behind the character
 *   - rune circle platform with slow rotation + soft ground shadow
 *   - drifting dust motes (6 absolutely-positioned spans, CSS keyframes
 *     via framer-motion — cheap and paused under prefers-reduced-motion)
 *   - frosted-glass frame with pixel corners around the whole stage
 *   - level aura readout tied to the REAL presentation thresholds the
 *     avatar already uses (25 elite / 50 mythic) — no second system
 *
 * The avatar's own breathing/rotation/level effects are untouched.
 */

const RUNE_TICKS = Array.from({ length: 12 }, (_, i) => i * 30);

export default function CharacterStage({
  character,
  equipped,
  level,
  rotation = 0,
  className = '',
  children,
  blur = 18,
  idle = true,
  motto = '',
}) {
  const isElite = level >= ELITE_LEVEL;
  const isMythic = level >= MYTHIC_LEVEL;

  // Aura color follows the avatar's existing tier language (gold glow class
  // in tailwind config); mythic adds the ember/arcane mix the SVG already
  // paints at 50+. Decorative only.
  const auraColor = isMythic
    ? 'rgb(var(--c-ember-400) / 0.20)'
    : isElite
      ? 'rgb(var(--c-gold-400) / 0.18)'
      : 'rgb(var(--c-mystic-500) / 0.12)';

  return (
    <GlassPanel blur={blur} className={`overflow-hidden ${className}`}>
      <PixelCorners size={12} />

      {/* atmospheric corner glow + spotlight cone behind the model */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(58% 42% at 50% 26%, ${auraColor}, transparent 70%)`,
        }}
      />
      {/* Architectural framing: a stone back-wall gradient + flanking
          column silhouettes give the chamber depth without any image asset.
          Purely decorative, pointer-events off, resolved through theme vars
          so the light world renders parchment stone instead of cave black. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg, rgb(var(--c-dungeon-950) / 0.55) 0%, transparent 14%, transparent 86%, rgb(var(--c-dungeon-950) / 0.55) 100%),
            radial-gradient(90% 60% at 50% 30%, transparent 40%, rgb(var(--c-dungeon-950) / 0.35) 100%)`,
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[6%] hidden w-3 sm:block">
        <span className="stage-pillar absolute inset-0" />
        <span className="absolute inset-x-0 top-[12%] h-[3px] bg-gold-400/25" />
        <span className="absolute inset-x-0 bottom-[22%] h-[3px] bg-gold-400/25" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-[6%] hidden w-3 sm:block">
        <span className="stage-pillar absolute inset-0" />
        <span className="absolute inset-x-0 top-[12%] h-[3px] bg-gold-400/25" />
        <span className="absolute inset-x-0 bottom-[22%] h-[3px] bg-gold-400/25" />
      </div>
      {/* Beam + ground treatment resolve through scoped selectors: the
          light world gets a warm sun shaft with no dark overlay (a dark cone
          on parchment reads as grime) and only a faint ground shadow. */}
      <style>{`
        .stage-pillar {
          background: linear-gradient(180deg,
            rgb(var(--c-dungeon-800) / 0.85), rgb(var(--c-dungeon-900) / 0.55));
          border-inline: 1px solid rgb(var(--c-gold-400) / 0.14);
        }
        [data-theme='light'] .stage-pillar {
          background: linear-gradient(180deg,
            rgb(var(--c-gold-600) / 0.16), rgb(var(--c-dungeon-700) / 0.10));
        }
        .stage-beam {
          background: linear-gradient(180deg,
            rgb(var(--c-gold-400) / 0.10),
            rgb(var(--c-mystic-500) / 0.05) 60%, transparent);
        }
        .stage-groundfade {
          background: radial-gradient(120% 60% at 50% 118%,
            rgb(var(--c-dungeon-950) / 0.9), transparent 55%);
        }
        .stage-groundshadow { opacity: 0.55; }
        /* Model separation shadow: strong at night, a whisper by day (a hard
           black halo on parchment reads as dirt). */
        .avatar-drop { filter: drop-shadow(0 10px 28px rgba(0, 0, 0, 0.55)); }
        [data-theme='light'] .avatar-drop { filter: drop-shadow(0 8px 18px rgba(96, 74, 34, 0.22)); }
        [data-theme='light'] .stage-beam {
          background: linear-gradient(180deg,
            rgb(var(--c-gold-400) / 0.16),
            rgb(var(--c-gold-500) / 0.06) 60%, transparent);
        }
        [data-theme='light'] .stage-groundfade {
          background: radial-gradient(120% 60% at 50% 118%,
            rgb(var(--c-gold-600) / 0.10), transparent 55%);
        }
          [data-theme='light'] .stage-groundshadow { opacity: 0.28; }
      `}</style>
      <div
        aria-hidden="true"
        className="stage-beam pointer-events-none absolute left-1/2 top-0 h-[72%] w-[46%] -translate-x-1/2"
        style={{
          clipPath: 'polygon(38% 0, 62% 0, 92% 100%, 8% 100%)',
          filter: 'blur(2px)',
        }}
      />

      {/* drifting dust motes — six spans, slow loop, decorative */}
      {idle &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute h-1 w-1 rounded-full"
            style={{
              left: `${12 + i * 15}%`,
              bottom: '18%',
              background: 'rgb(var(--c-gold-400) / 0.5)',
            }}
            animate={{ y: [0, -90 - i * 12], opacity: [0, 0.7, 0] }}
            transition={{ duration: 7 + i * 1.3, repeat: Infinity, delay: i * 1.1, ease: 'easeInOut' }}
          />
        ))}

      {/* motto inscription — a vertical serif line beside the model, the
          chamber's quiet words (reference-style flourish, decorative). */}
      {motto && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 md:block"
        >
          <p
            className="font-display text-[11px] italic tracking-wide text-parchment-300/50"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            “{motto}”
          </p>
        </div>
      )}
      {/* character slot */}
      <div className="stage-groundfade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 flex h-full flex-col items-center justify-end">
        <motion.div
          className="relative flex w-full flex-1 items-end justify-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <CharacterAvatar
            gender={character.gender}
            physique={character.physique}
            skinTone={character.skinTone}
            faceType={character.faceType}
            eyeColor={character.eyeColor}
            hairStyle={character.hairStyle}
            hairColor={character.hairColor}
            facialHair={character.facialHair}
            skinDetail={character.skinDetail}
            equippedTop={equipped.top}
            equippedBottom={equipped.bottom}
            equippedShoes={equipped.shoes}
            equippedAccessory={equipped.accessory}
            equippedSpecial={equipped.special}
            topPrimaryColor={character.topPrimaryColor}
            topAccentColor={character.topAccentColor}
            bottomPrimaryColor={character.bottomPrimaryColor}
            bottomAccentColor={character.bottomAccentColor}
            shoesPrimaryColor={character.shoesPrimaryColor}
            shoesAccentColor={character.shoesAccentColor}
            level={level}
            rotation={rotation}
            idle={idle}
            className="avatar-drop h-full max-h-[760px] w-auto"
          />
        </motion.div>

        {/* rune platform + ground shadow */}
        <div aria-hidden="true" className="pointer-events-none relative -mt-1 h-16 w-[78%] max-w-[340px]">
          <svg viewBox="0 0 340 64" className="absolute inset-0 h-full w-full">
            {/* energy flows around the platform via dash offset (the ellipse
                itself never rotates — a spun ellipse reads as a wobble) */}
            <ellipse cx="170" cy="32" rx="160" ry="26" fill="none" stroke="rgb(var(--c-gold-400) / 0.28)" strokeWidth="1.5" strokeDasharray="10 14">
              {idle && <animate attributeName="stroke-dashoffset" values="0;-48" dur="6s" repeatCount="indefinite" />}
            </ellipse>
            <ellipse cx="170" cy="32" rx="118" ry="19" fill="none" stroke="rgb(var(--c-mystic-400) / 0.30)" strokeWidth="1" strokeDasharray="4 10">
              {idle && <animate attributeName="stroke-dashoffset" values="0;28" dur="9s" repeatCount="indefinite" />}
            </ellipse>
            {RUNE_TICKS.map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x = 170 + Math.cos(rad) * 146;
              const y = 32 + Math.sin(rad) * 23;
              return <rect key={angle} x={x - 1.5} y={y - 1.5} width="3" height="3" fill="rgb(var(--c-gold-300) / 0.55)" />;
            })}
          </svg>
          {/* soft ground shadow — faint on the light world so it doesn't
              read as a hole punched in parchment */}
          <div
            className="stage-groundshadow absolute inset-x-[12%] bottom-1 h-6 rounded-[50%]"
            style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.5), transparent 75%)' }}
          />
        </div>
      </div>

      {/* thin frosted-glass footer rail: level aura readout + slot for controls */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-t border-dungeon-600/40 bg-dungeon-950/45 px-4 py-2 backdrop-blur-sm">
        <span className="font-hud text-[10px] uppercase tracking-[0.28em] text-parchment-300/60">
          {isMythic ? 'Mythic Presence' : isElite ? 'Elite Presence' : 'Chamber of Beginnings'}
        </span>
        <span className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-[5px] w-[5px] ${
                (isMythic && i < 3) || (isElite && i < 2) || (i < 1) ? 'bg-gold-400' : 'bg-dungeon-600'
              }`}
              style={(isMythic && i < 3) || (isElite && i < 2) || i < 1
                ? { boxShadow: '0 0 6px rgb(var(--c-glow-gold) / 0.7)' }
                : undefined}
            />
          ))}
        </span>
      </div>
      {children}
    </GlassPanel>
  );
}
