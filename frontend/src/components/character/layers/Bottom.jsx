import { PHYSIQUE_METRICS, GARMENT_COLOR_HEX } from '../constants';

const STYLES = {
  bottom_basic_pants: { fill: '#3d4147', accent: '#2d3033' },
  bottom_jeans: { fill: '#2f4d6b', accent: '#233a52' },
  bottom_cargo_pants: { fill: '#4a5240', accent: '#343a2c', pockets: true },
  bottom_premium_pants: { fill: '#232529', accent: '#e8c874', trim: true },
};

/**
 * Covers the legs from waist to ankle; feet stay skin-toned until Shoes
 * renders on top. Scaled horizontally by the same hip metric as Body's
 * leg group (same x=100 pivot) so the garment grows with the body instead
 * of clipping at the Heavy/Curvy physique extremes.
 *
 * `primaryColor`/`accentColor` (GARMENT_COLORS values) override the item's
 * baked-in default fill/accent when the player has dyed this slot; null
 * falls back to the item's own STYLES colors.
 */
export default function Bottom({ svgKey, gender, physique = 'athletic', primaryColor, accentColor }) {
  const base = STYLES[svgKey] || STYLES.bottom_basic_pants;
  const style = {
    ...base,
    fill: GARMENT_COLOR_HEX[primaryColor] || base.fill,
    accent: GARMENT_COLOR_HEX[accentColor] || base.accent,
  };
  const metrics = PHYSIQUE_METRICS[physique] || PHYSIQUE_METRICS.athletic;
  const hipWidth = gender === 'female' ? 8 : 0;

  return (
    <g transform={`translate(100,0) scale(${metrics.hip},1) translate(-100,0)`}>
      <path d={`M${70 - hipWidth / 2},200 L${98 - hipWidth / 2},200 L96,296 L74,296 Z`} fill={style.fill} />
      <path d={`M${102 + hipWidth / 2},200 L${130 + hipWidth / 2},200 L126,296 L104,296 Z`} fill={style.fill} />
      <path d="M74,200 L126,200 L124,214 L76,214 Z" fill={style.accent} />
      {style.pockets && (
        <>
          <rect x="76" y="230" width="10" height="14" rx="1.5" fill={style.accent} />
          <rect x="114" y="230" width="10" height="14" rx="1.5" fill={style.accent} />
        </>
      )}
      {style.trim && (
        <path d="M74,296 L96,296 M104,296 L126,296" stroke={style.accent} strokeWidth="2" />
      )}
    </g>
  );
}
