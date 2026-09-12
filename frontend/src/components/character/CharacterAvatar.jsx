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
          viewBox="0 0 200 320"
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
          </defs>

          <g transform={`translate(${hairParallax},0)`}>
            <HairBack hairStyle={hairStyle} hairColor={hairColor} gender={gender} />
          </g>

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
