import { SKIN_TONE_HEX, PHYSIQUE_METRICS } from '../constants';

/**
 * The base silhouette: head, neck, torso, arms/hands, legs - all in the
 * character's skin tone. Clothing layers render on top and cover most of
 * this; it exists so nothing is ever "missing" if a slot is unequipped.
 *
 * Cel-shaded with a top-left key light and bottom-right ambient occlusion,
 * plus a thin gold rim light on the right edge to visually tie the model to
 * the UI's gold accents. Shoulder/hip width comes from the physique metric
 * (lean/athletic/heavy for male, slender/athletic/curvy for female) applied
 * as a horizontal scale on the torso and hip/leg groups so we don't need a
 * separate hand-authored path per physique.
 */
export default function Body({ gender, skinTone, physique = 'athletic' }) {
  const skin = SKIN_TONE_HEX[skinTone] || SKIN_TONE_HEX.medium;
  const metrics = PHYSIQUE_METRICS[physique] || PHYSIQUE_METRICS.athletic;
  const gradId = `skinGrad-${skinTone}`;
  const rimId = 'goldRim';

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="45%" stopColor={skin} stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
        <filter id={rimId} x="-20%" y="-20%" width="140%" height="140%">
          {/* Rim crescent = flood ∩ alpha, shifted, then SUBTRACTED by the
              un-shifted alpha (operator="out"). Tinting the whole shape
              washes out — especially in the light theme. */}
          <feFlood floodColor="#e5c07b" floodOpacity="0.75" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feOffset dx="2" dy="0" result="offsetRim" />
          <feComposite in="offsetRim" in2="SourceAlpha" operator="out" result="rim" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="rim" />
          </feMerge>
        </filter>
      </defs>

      {/* legs + hips: contrapposto weight shift, tapered thigh/knee/calf */}
      <g transform={`translate(100,200) scale(${metrics.hip},1) translate(-100,-200)`} filter={`url(#${rimId})`}>
        <path
          d="M72,198 Q69,230 73,258 Q74,278 71,300 L91,300 Q92,276 90,256 Q93,228 92,198 Z"
          fill={skin}
        />
        <path
          d="M108,198 Q106,226 109,254 L107,300 L129,300 Q131,276 127,254 Q130,226 128,198 Z"
          fill={skin}
          transform="rotate(3 118 250)"
        />
        <path d="M72,198 Q69,230 73,258 Q74,278 71,300 L91,300 Q92,276 90,256 Q93,228 92,198 Z" fill={`url(#${gradId})`} />
      </g>

      {/* torso + arms + neck: shoulder width via physique scale */}
      <g transform={`translate(100,150) scale(${metrics.shoulder},1) translate(-100,-150)`}>
        {/* trapezius / shoulder slope replacing a blunt neck cylinder */}
        <path d="M82,96 Q100,108 118,96 L124,116 Q100,126 76,116 Z" fill={skin} />

        {/* tapered torso: broad chest -> narrow waist -> flare for female hips */}
        <path
          d={
            gender === 'female'
              ? 'M64,114 Q100,106 136,114 L131,150 Q134,172 130,196 L70,196 Q66,172 69,150 Z'
              : 'M58,114 Q100,104 142,114 L134,148 Q138,176 132,198 L68,198 Q62,176 66,148 Z'
          }
          fill={skin}
        />
        <path
          d={
            gender === 'female'
              ? 'M64,114 Q100,106 136,114 L131,150 Q134,172 130,196 L70,196 Q66,172 69,150 Z'
              : 'M58,114 Q100,104 142,114 L134,148 Q138,176 132,198 L68,198 Q62,176 66,148 Z'
          }
          fill={`url(#${gradId})`}
        />
        {/* subtle pectoral/ab seam */}
        <path d="M100,120 L100,168" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" fill="none" />

        {/* relaxed, slightly bent arms (not a rigid 90 degree T-pose) */}
        <path
          d="M60,118 Q46,128 44,158 Q42,182 48,206 L58,208 Q54,182 56,158 Q58,136 68,120 Z"
          fill={skin}
        />
        <path
          d="M140,118 Q154,128 156,158 Q158,182 152,206 L142,208 Q146,182 144,158 Q142,136 132,120 Z"
          fill={skin}
        />
        {/* hands with a hint of finger separation instead of plain orbs */}
        <g transform="translate(48,208)">
          <circle r="8.5" fill={skin} />
          <path d="M-5,-2 L-5,6 M0,-3 L0,7 M5,-2 L5,6" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeLinecap="round" />
        </g>
        <g transform="translate(152,208)">
          <circle r="8.5" fill={skin} />
          <path d="M-5,-2 L-5,6 M0,-3 L0,7 M5,-2 L5,6" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeLinecap="round" />
        </g>
      </g>

      {/* head (fixed position/scale so Face/Hair layers always align) */}
      <circle cx="100" cy="66" r="33" fill={skin} />
      <circle cx="100" cy="66" r="33" fill={`url(#${gradId})`} />
    </g>
  );
}
