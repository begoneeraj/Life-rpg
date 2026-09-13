import { motion } from 'framer-motion';
import { SKIN_TONE_HEX } from './constants';
import Body from './layers/Body';
import Face from './layers/Face';
import Hair, { HairBack } from './layers/Hair';
import FacialHair from './layers/FacialHair';
import SkinDetails from './layers/SkinDetails';
import Top from './layers/Top';
import Bottom from './layers/Bottom';
import Shoes from './layers/Shoes';
import Accessory from './layers/Accessory';
import { SpecialFxBack } from './layers/SpecialFx';

/**
 * Assembles every modular layer into one fixed z-order stack. This is the
 * ONE place appearance + equipment come together - every page that shows
 * the character renders through this component so the same face/hair/skin
 * stays consistent everywhere (spec: character identity never regenerates,
 * only equipped cosmetics change).
 *
 * `level` drives purely cosmetic progression tiers (spec S6.2): 25+ gets a
 * faster/more "alive" idle breathing loop, 50+ gets glowing mythic eyes.
 * These are derived from the character's real level, never client-set.
 */

// Exported so presentation components (CharacterStage, HUD chrome) can align
// their aura language with the avatar's own thresholds — one source of truth.
export const ELITE_LEVEL = 25;
export const MYTHIC_LEVEL = 50;

// Stage-scoped theme wiring for the avatar's presentation effects. SVG
// paint servers can't consume CSS vars directly, so the class hooks above
// are themed here (light world: soft shadow + pale-gold sun rim).
const AVATAR_STAGE_CSS = `
  .avatar-ground-shadow { opacity: 1; }
  .avatar-rim-flood { flood-color: #e8c874; }
  [data-theme='light'] .avatar-ground-shadow { opacity: 0.22; }
  [data-theme='light'] .avatar-rim-flood { flood-color: #f0dca8; }
`;

if (typeof document !== 'undefined' && !document.getElementById('avatar-stage-css')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'avatar-stage-css';
  styleEl.textContent = AVATAR_STAGE_CSS;
  document.head.appendChild(styleEl);
}

export default function CharacterAvatar({
  gender = 'male',
  physique = 'athletic',
  skinTone = 'medium',
  faceType = 'friendly',
  eyeColor = 'espresso_brown',
  hairStyle = 'short_textured',
  hairColor = 'black',
  facialHair = 'clean_shaven',
  skinDetail = 'none',
  equippedTop,
  equippedBottom,
  equippedShoes,
  equippedAccessory,
  equippedSpecial,
  topPrimaryColor,
  topAccentColor,
  bottomPrimaryColor,
  bottomAccentColor,
  shoesPrimaryColor,
  shoesAccentColor,
  level = 1,
  rotation = 0,
  className = '',
  idle = true,
  // Optional crop of the model's fixed 200x320 stage (e.g. the Forge's
  // face thumbnails use "58 20 84 84" to frame the head). Default shows
  // the full figure, exactly as before.
  viewBox = '0 0 200 320',
}) {
  const skinHex = SKIN_TONE_HEX[skinTone] || SKIN_TONE_HEX.medium;
  const isElite = level >= ELITE_LEVEL;
  const isMythic = level >= MYTHIC_LEVEL;

  // Rotation is a flat SVG plane rotated in CSS 3D space, pivoting around
  // its own center - which sits right on the character's spine. That
  // leaves almost no foreshortening on the figure itself (only the empty
  // background trapezoids), so the control barely reads as "turning".
  // `t` (-1..1) drives two cheap, non-geometric exaggerations instead of
  // redrawing art: a parallax offset on the back-hair layer (it sits
  // farther back, so it should visually lag the body as the model turns)
  // and a directional shading pass that darkens the side rotating away
  // from the viewer, the way a turntable light would.
  const t = Math.max(-1, Math.min(1, rotation / 45));
  const hairParallax = -t * 5;
  const shadeOpacity = Math.abs(t) * 0.32;

  return (
    <div className={className} style={{ perspective: 500 }}>
      <div className="h-full w-full" style={{ transform: `rotateY(${rotation}deg)` }}>
        <motion.svg
          viewBox={viewBox}
          className="h-full w-full"
          role="img"
          aria-label="Your character"
          animate={idle ? { scale: [1, isElite ? 1.02 : 1.012, 1] } : undefined}
          transition={idle ? { duration: isElite ? 2.6 : 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        >
          <SpecialFxBack svgKey={equippedSpecial?.svgKey} />
          {isMythic && (
            <circle cx="100" cy="150" r="92" fill="url(#mythicAura)" opacity="0.5">
              <animate attributeName="r" values="88;96;88" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
          <defs>
            <radialGradient id="mythicAura">
              <stop offset="60%" stopColor="#d4af37" stopOpacity="0" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0.35" />
            </radialGradient>
            <linearGradient id="rotationShade" x1={t >= 0 ? '0%' : '100%'} x2={t >= 0 ? '100%' : '0%'} y1="0" y2="0">
              <stop offset="55%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
            </linearGradient>
            {/* Model-level ground contact shadow — grounds the figure without
                touching any clothing/hair/skin path. */}
            <radialGradient id="avatarGroundShadow">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            {/* Rim light on the key-lit side; theme resolves the flood color
                (braziers' gold by night, sunlight by day). The flood is
                SUBTRACTED from the source alpha (operator="out") so only the
                offset crescent outside the silhouette is painted — tinting
                the whole body would wash the character out. Kept thin, soft
                and low-opacity: this is meant to read as ambient stage
                light grazing the figure, not an outline stroke around every
                garment edge (a bright hard-edged version reads as a flat
                sticker cutout instead of a lit 3D form). */}
            <filter id="avatarRimLight" x="-20%" y="-20%" width="140%" height="140%">
              <feFlood className="avatar-rim-flood" floodColor="#e8c874" floodOpacity="0.5" />
              <feComposite in2="SourceAlpha" operator="in" />
              <feOffset dx="1" dy="0.5" result="offsetRim" />
              <feGaussianBlur in="offsetRim" stdDeviation="0.6" result="softRim" />
              <feComposite in="softRim" in2="SourceAlpha" operator="out" result="rim" />
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="rim" />
              </feMerge>
            </filter>
          </defs>
          <ellipse cx="100" cy="303" rx="54" ry="7" fill="url(#avatarGroundShadow)" className="avatar-ground-shadow" />

          <g transform={`translate(${hairParallax},0)`}>
            <HairBack hairStyle={hairStyle} hairColor={hairColor} gender={gender} />
          </g>

          {/* Rim light wraps the body AND every clothing layer together so the
              gold highlight traces the character's true outer silhouette
              (garment edge where equipped, skin edge where bare) instead of
              always tracing the bare body's edge — which used to shine
              through as a gold outline anywhere a sleeve/pant leg didn't
              cover the body underneath by a wide margin. */}
          <g filter="url(#avatarRimLight)">
            <Body gender={gender} skinTone={skinTone} physique={physique} />
            {equippedBottom && (
              <Bottom
                svgKey={equippedBottom.svgKey}
                gender={gender}
                physique={physique}
                primaryColor={bottomPrimaryColor}
                accentColor={bottomAccentColor}
              />
            )}
            {equippedShoes && (
              <Shoes
                svgKey={equippedShoes.svgKey}
                physique={physique}
                primaryColor={shoesPrimaryColor}
                accentColor={shoesAccentColor}
              />
            )}
            {equippedTop && (
              <Top
                svgKey={equippedTop.svgKey}
                gender={gender}
                physique={physique}
                primaryColor={topPrimaryColor}
                accentColor={topAccentColor}
              />
            )}
          </g>

          {gender === 'male' && <FacialHair style={facialHair} hairColor={hairColor} />}
          <Face faceType={faceType} skinToneHex={skinHex} eyeColor={eyeColor} eyesGlow={isMythic} />
          <SkinDetails skinDetail={skinDetail} />
          <Hair hairStyle={hairStyle} hairColor={hairColor} gender={gender} />

          <Accessory svgKey={equippedAccessory?.svgKey} />

          {shadeOpacity > 0 && (
            <rect x="35" y="30" width="130" height="280" fill="url(#rotationShade)" opacity={shadeOpacity} style={{ mixBlendMode: 'multiply' }} />
          )}
        </motion.svg>
      </div>
    </div>
  );
}
