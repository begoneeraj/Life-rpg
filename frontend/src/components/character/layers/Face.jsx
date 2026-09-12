import { EYE_COLOR_HEX } from '../constants';

const FACE_PRESETS = {
  // eyebrowTilt: degrees rotation applied to each eyebrow (mirrored on the right)
  // mouth: SVG path for the mouth curve
  // jaw: extra path drawn under the head circle to suggest jaw structure
  sharp: { eyebrowTilt: -10, mouth: 'M90,86 Q100,90 110,86', jaw: 'M74,84 Q100,108 126,84 L124,72 Q100,92 76,72 Z' },
  rugged: { eyebrowTilt: -6, mouth: 'M89,87 Q100,89 111,87', jaw: 'M72,82 Q100,110 128,82 L126,70 Q100,94 74,70 Z' },
  mature: { eyebrowTilt: -2, mouth: 'M90,86 Q100,88 110,86', jaw: 'M76,86 Q100,104 124,86 L122,74 Q100,90 78,74 Z' },
  friendly: { eyebrowTilt: 2, mouth: 'M88,85 Q100,93 112,85', jaw: 'M78,88 Q100,100 122,88 L120,76 Q100,86 80,76 Z' },
  elegant: { eyebrowTilt: 4, mouth: 'M90,86 Q100,90 110,86', jaw: 'M80,88 Q100,98 120,88 L118,78 Q100,86 82,78 Z' },
  confident: { eyebrowTilt: -4, mouth: 'M89,85 Q100,91 111,85', jaw: 'M78,87 Q100,100 122,87 L120,76 Q100,88 80,76 Z' },
  athletic: { eyebrowTilt: -6, mouth: 'M89,86 Q100,89 111,86', jaw: 'M77,86 Q100,102 123,86 L121,75 Q100,89 79,75 Z' },
};

/**
 * Eyes render as a layered sclera -> iris -> pupil -> catchlight stack (per
 * the visual audit's "Eye Archetypes" spec) instead of a flat white dot, so
 * they read as dimensional rather than blank. `glow` (level 50+ mythic
 * perk) adds a soft radial halo behind the iris.
 */
function Eye({ cx, eyeColor, glow }) {
  return (
    <g>
      {glow && <circle cx={cx} cy="63" r="6.5" fill={eyeColor} opacity="0.35" />}
      <ellipse cx={cx} cy="63" rx="5" ry="3.2" fill="#f7f2ea">
        <animate attributeName="ry" values="3.2;3.2;0.3;3.2" keyTimes="0;0.92;0.96;1" dur="4.5s" repeatCount="indefinite" />
      </ellipse>
      <circle cx={cx} cy="63" r="2.6" fill={eyeColor} />
      <circle cx={cx} cy="63" r="1.1" fill="#100c08" />
      <circle cx={cx - 0.8} cy="61.8" r="0.6" fill="#ffffff" opacity="0.9" />
      {/* upper eyelid fold for depth */}
      <path d={`M${cx - 5},61.5 Q${cx},59 ${cx + 5},61.5`} stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" fill="none" />
    </g>
  );
}

export default function Face({ faceType, skinToneHex, eyeColor = 'espresso_brown', eyesGlow = false }) {
  const preset = FACE_PRESETS[faceType] || FACE_PRESETS.friendly;
  const jawShade = 'rgba(0,0,0,0.06)';
  const iris = EYE_COLOR_HEX[eyeColor] || EYE_COLOR_HEX.espresso_brown;

  return (
    <g>
      <path d={preset.jaw} fill={jawShade} />

      {/* eyebrows */}
      <rect x="80" y="55" width="14" height="3" rx="1.5" fill="#3a2a1f" transform={`rotate(${preset.eyebrowTilt} 87 56)`} />
      <rect x="106" y="55" width="14" height="3" rx="1.5" fill="#3a2a1f" transform={`rotate(${-preset.eyebrowTilt} 113 56)`} />

      <Eye cx={88} eyeColor={iris} glow={eyesGlow} />
      <Eye cx={112} eyeColor={iris} glow={eyesGlow} />

      {/* nose */}
      <path d="M99,66 Q97,74 99,76 L103,76" stroke={skinToneHex} strokeOpacity="0.5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M99,66 Q97,74 99,76 L103,76" stroke="rgba(0,0,0,0.18)" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* mouth */}
      <path d={preset.mouth} stroke="#7a3b32" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}
