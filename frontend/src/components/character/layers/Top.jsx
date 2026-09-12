import { PHYSIQUE_METRICS, GARMENT_COLOR_HEX } from '../constants';

const STYLES = {
  top_basic_tee: { fill: '#5b5f66', accent: '#4a4d53' },
  top_hoodie: { fill: '#37414f', accent: '#232a34', hood: true },
  top_leather_jacket: { fill: '#3a2418', accent: '#241609', collar: true, zip: true },
  top_cyber_jacket: { fill: '#1c2b3a', accent: '#3ad6ff', glow: true },
  top_royal_coat: { fill: '#5a1030', accent: '#e8c874', trim: true },
};

/**
 * Covers the torso and upper arms (long-sleeve silhouette); forearms/hands
 * stay skin-toned from Body.jsx. Scaled horizontally by the same shoulder
 * metric as Body's torso/arm group (same x=100 pivot) so the garment grows
 * with the body instead of clipping at the Heavy/Curvy physique extremes.
 *
 * Construction (spec: clothing must understand the body under it): shoulder
 * seams, a neckline with cast shadow, sleeve cuffs that end AT the wrists,
 * elbow/waist tension folds, a hem edge — plus per-style details (rolled
 * hood volume, jacket lapels + zip, royal trim, cyber piping). All shading
 * is dye-independent black/white overlay so any PRIMARY/ACCENT dye works.
 */
export default function Top({ svgKey, gender, physique = 'athletic', primaryColor, accentColor }) {
  const base = STYLES[svgKey] || STYLES.top_basic_tee;
  const style = {
    ...base,
    fill: GARMENT_COLOR_HEX[primaryColor] || base.fill,
    accent: GARMENT_COLOR_HEX[accentColor] || base.accent,
  };
  const metrics = PHYSIQUE_METRICS[physique] || PHYSIQUE_METRICS.athletic;
  const torso =
    gender === 'female'
      ? 'M58,112 L142,112 L128,150 L134,200 L66,200 L72,150 Z'
      : 'M55,112 L145,112 L132,200 L68,200 Z';

  return (
    <g transform={`translate(100,0) scale(${metrics.shoulder},1) translate(-100,0)`}>
      <defs>
        {/* Dye-independent fabric form: top-left key light → bottom-right
            ambient occlusion, overlaid on whatever color the player dyed.
            Same technique as the Body skin gradient, so cloth and skin read
            under the same light. */}
        <linearGradient id="clothFormTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.26" />
        </linearGradient>
      </defs>

      {/* ---- sleeves: form-shaded cylinders with shoulder seam + cuff ---- */}
      <path d="M48,116 L64,111 L58,206 L43,204 Z" fill={style.fill} />
      <path d="M48,116 L64,111 L58,206 L43,204 Z" fill="url(#clothFormTop)" />
      <path d="M152,116 L136,111 L142,206 L157,204 Z" fill={style.fill} />
      <path d="M152,116 L136,111 L142,206 L157,204 Z" fill="url(#clothFormTop)" />
      {/* shoulder seams: fabric panels meeting at the shoulder point */}
      <path d="M49,117 Q56,113 63,112 M151,117 Q144,113 137,112" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* elbow tension folds */}
      <path d="M49,156 q5,3 9,1 M151,156 q-5,3 -9,1" stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* cuffs: end right at the wrist so sleeves meet the hands naturally */}
      <path d="M43.5,200 L58,202 L57.5,206 L43,204 Z" fill={style.accent} />
      <path d="M156.5,200 L142,202 L142.5,206 L157,204 Z" fill={style.accent} />

      {/* ---- torso ---- */}
      <path d={torso} fill={style.fill} />
      <path d={torso} fill="url(#clothFormTop)" />

      {/* neckline: collar band + cast shadow under it (head occludes light) */}
      <path d="M85,112 Q100,120 115,112 L112,118 Q100,124 88,118 Z" fill={style.accent} />
      <path d="M87,117 Q100,124 113,117" stroke="rgba(0,0,0,0.22)" strokeWidth="1.6" fill="none" strokeLinecap="round" />

      {/* shoulder panel seams running down from the neckline */}
      <path d="M66,113 L72,128 M134,113 L128,128" stroke="rgba(0,0,0,0.14)" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* torso fabric tension: soft side folds following the waist taper */}
      <path d="M71,158 q3,9 2,20 M129,156 q-3,9 -2,22" stroke="rgba(0,0,0,0.11)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* hem edge + contact shadow over the legs */}
      <path d="M68.5,199 L131.5,199" stroke="rgba(0,0,0,0.18)" strokeWidth="1.6" strokeLinecap="round" />

      {/* ---- per-style construction details ---- */}
      {style.hood && (
        <>
          {/* rolled hood volume resting on the shoulders, opening toward the face */}
          <path d="M76,112 Q100,86 124,112 L120,127 Q100,104 80,127 Z" fill={style.fill} />
          <path d="M76,112 Q100,86 124,112 L120,127 Q100,104 80,127 Z" fill="url(#clothFormTop)" />
          <path d="M79,113 Q100,91 121,113" stroke={style.accent} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* hood inner shadow where it wraps the neck */}
          <path d="M84,120 Q100,106 116,120" stroke="rgba(0,0,0,0.30)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {style.collar && (
        <>
          {/* leather lapels with edge highlight */}
          <path d="M85,112 L100,126 L115,112 L112,109 L100,120 L88,109 Z" fill={style.accent} />
          <path d="M85,112 L100,126 M115,112 L100,126" stroke="rgba(255,255,255,0.14)" strokeWidth="1" fill="none" />
        </>
      )}
      {style.zip && (
        <>
          {/* zipper placket + pull */}
          <path d="M100,126 L100,198" stroke={style.accent} strokeWidth="2.4" />
          <path d="M100,126 L100,198" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" strokeDasharray="2 2.5" />
          <circle cx="100" cy="130" r="1.4" fill="#c9a45c" />
        </>
      )}
      {style.trim && (
        <path d="M58,112 L142,112 L132,200 L68,200 Z" fill="none" stroke={style.accent} strokeWidth="2.5" opacity="0.85" />
      )}
      {style.glow && (
        <path d="M92,120 L92,195 M108,120 L108,195" stroke={style.accent} strokeWidth="1.5" opacity="0.8" />
      )}
    </g>
  );
}
