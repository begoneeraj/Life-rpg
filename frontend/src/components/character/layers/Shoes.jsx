import { PHYSIQUE_METRICS, GARMENT_COLOR_HEX } from '../constants';

const STYLES = {
  shoes_basic: { fill: '#615a4f', accent: '#48423a' },
  shoes_running: { fill: '#e0e0e0', accent: '#ff6b3d' },
  shoes_combat_boots: { fill: '#2a2621', accent: '#141210', tall: true },
  shoes_premium_sneakers: { fill: '#f5ecd7', accent: '#d4af37', glow: true },
};

/**
 * Scaled by the same hip metric as Body's leg group so feet track ankle
 * width at physique extremes. `primaryColor`/`accentColor` (GARMENT_COLORS
 * values) override the item's baked-in default fill/accent when the player
 * has dyed this slot; null falls back to the item's own STYLES colors.
 */
export default function Shoes({ svgKey, physique = 'athletic', primaryColor, accentColor }) {
  const base = STYLES[svgKey] || STYLES.shoes_basic;
  const style = {
    ...base,
    fill: GARMENT_COLOR_HEX[primaryColor] || base.fill,
    accent: GARMENT_COLOR_HEX[accentColor] || base.accent,
  };
  const metrics = PHYSIQUE_METRICS[physique] || PHYSIQUE_METRICS.athletic;
  const h = style.tall ? 30 : 20;

  return (
    <g transform={`translate(100,0) scale(${metrics.hip},1) translate(-100,0)`}>
      <defs>
        <linearGradient id="clothFormShoes" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      {/* toe caps: forward volume so shoes read as worn, not painted on */}
      <path d={`M72,${300 - h} L98,${300 - h} L100,304 L68,304 Z`} fill={style.fill} />
      <path d={`M72,${300 - h} L98,${300 - h} L100,304 L68,304 Z`} fill="url(#clothFormShoes)" />
      <path d={`M102,${300 - h} L128,${300 - h} L132,304 L100,304 Z`} fill={style.fill} />
      <path d={`M102,${300 - h} L128,${300 - h} L132,304 L100,304 Z`} fill="url(#clothFormShoes)" />
      <path d="M68,304 L100,304 L100,300 L72,300 Z" fill={style.accent} opacity="0.7" />
      <path d="M100,304 L132,304 L128,300 L100,300 Z" fill={style.accent} opacity="0.7" />
      {style.glow && (
        <>
          <ellipse cx="85" cy="304" rx="16" ry="3" fill={style.accent} opacity="0.4" />
          <ellipse cx="115" cy="304" rx="16" ry="3" fill={style.accent} opacity="0.4" />
        </>
      )}
    </g>
  );
}
