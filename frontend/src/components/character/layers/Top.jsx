import { PHYSIQUE_METRICS, GARMENT_COLOR_HEX } from '../constants';

const STYLES = {
  top_basic_tee: { fill: '#5b5f66', accent: '#4a4d53' },
  top_hoodie: { fill: '#37414f', accent: '#232a34', hood: true },
  top_leather_jacket: { fill: '#3a2418', accent: '#241609', collar: true },
  top_cyber_jacket: { fill: '#1c2b3a', accent: '#3ad6ff', glow: true },
  top_royal_coat: { fill: '#5a1030', accent: '#e8c874', trim: true },
};

/**
 * Covers the torso and upper arms (long-sleeve silhouette); forearms/hands
 * stay skin-toned from Body.jsx. Scaled horizontally by the same shoulder
 * metric as Body's torso/arm group (same x=100 pivot) so the garment grows
 * with the body instead of clipping at the Heavy/Curvy physique extremes.
 *
 * `primaryColor`/`accentColor` (GARMENT_COLORS values) override the item's
 * baked-in default fill/accent when the player has dyed this slot; null
 * falls back to the item's own STYLES colors.
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
      <path d="M48,116 L64,111 L58,206 L43,204 Z" fill={style.fill} />
      <path d="M152,116 L136,111 L142,206 L157,204 Z" fill={style.fill} />
      <path d={torso} fill={style.fill} />
      <path d="M85,112 Q100,120 115,112 L112,118 Q100,124 88,118 Z" fill={style.accent} />
      {style.collar && <path d="M85,112 L100,126 L115,112 L112,109 L100,120 L88,109 Z" fill={style.accent} />}
      {style.trim && (
        <path d="M58,112 L142,112 L132,200 L68,200 Z" fill="none" stroke={style.accent} strokeWidth="2.5" opacity="0.85" />
      )}
      {style.glow && (
        <path d="M92,120 L92,195 M108,120 L108,195" stroke={style.accent} strokeWidth="1.5" opacity="0.8" />
      )}
    </g>
  );
}
