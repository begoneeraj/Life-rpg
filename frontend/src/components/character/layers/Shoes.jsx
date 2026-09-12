import { PHYSIQUE_METRICS, GARMENT_COLOR_HEX } from '../constants';

const STYLES = {
  shoes_basic: { fill: '#615a4f', accent: '#48423a' },
  shoes_running: { fill: '#e0e0e0', accent: '#ff6b3d', laces: true },
  shoes_combat_boots: { fill: '#2a2621', accent: '#141210', tall: true, straps: true },
  shoes_premium_sneakers: { fill: '#f5ecd7', accent: '#d4af37', glow: true, laces: true },
};

/**
 * Scaled by the same hip metric as Body's leg group so feet track ankle
 * width at physique extremes. Dye-independent shading works over any
 * PRIMARY/ACCENT dye.
 *
 * Construction (spec: sole, upper, toe box, laces, contact shadow): every
 * shoe reads as [upper panel] + [toe box] + [midsole] + [outsole], with a
 * collar shadow where the leg enters, laces/straps per style, and a soft
 * shadow cast on the ground line.
 */
export default function Shoes({ svgKey, physique = 'athletic', primaryColor, accentColor }) {
  const base = STYLES[svgKey] || STYLES.shoes_basic;
  const style = {
    ...base,
    fill: GARMENT_COLOR_HEX[primaryColor] || base.fill,
    accent: GARMENT_COLOR_HEX[accentColor] || base.accent,
  };
  const metrics = PHYSIQUE_METRICS[physique] || PHYSIQUE_METRICS.athletic;
  const h = style.tall ? 30 : 20; // shaft height above the ankle line (300)

  return (
    <g transform={`translate(100,0) scale(${metrics.hip},1) translate(-100,0)`}>
      <defs>
        <linearGradient id="clothFormShoes" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {/* leg-entry collar shadow: the pant leg disappears INTO the shoe */}
      <ellipse cx="85" cy={300 - h} rx="12" ry="2.6" fill="rgba(0,0,0,0.35)" />
      <ellipse cx="115" cy={300 - h} rx="12" ry="2.6" fill="rgba(0,0,0,0.35)" />

      {/* upper shaft */}
      <path d={`M72,${300 - h} L98,${300 - h} L100,302 L68,302 Z`} fill={style.fill} />
      <path d={`M72,${300 - h} L98,${300 - h} L100,302 L68,302 Z`} fill="url(#clothFormShoes)" />
      <path d={`M102,${300 - h} L128,${300 - h} L132,302 L100,302 Z`} fill={style.fill} />
      <path d={`M102,${300 - h} L128,${300 - h} L132,302 L100,302 Z`} fill="url(#clothFormShoes)" />

      {/* laces / straps crossing the shaft */}
      {style.laces && (
        <path
          d={`M75,${300 - h + 5} L95,${300 - h + 9} M95,${300 - h + 5} L75,${300 - h + 9} M105,${300 - h + 9} L125,${300 - h + 5} M125,${300 - h + 9} L105,${300 - h + 5}`}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      )}
      {style.straps && (
        <>
          <path d={`M70,${300 - h + 8} L100,${300 - h + 8} M100,${300 - h + 8} L130,${300 - h + 8}`} stroke={style.accent} strokeWidth="2.4" />
          <rect x="94" y={300 - h + 5.5} width="4" height="5" rx="0.8" fill="#c9a45c" />
          <rect x="110" y={300 - h + 5.5} width="4" height="5" rx="0.8" fill="#c9a45c" />
        </>
      )}

      {/* toe box: slightly proud of the shaft for forward volume */}
      <path d={`M68,296 L100,296 L101,303 L66,303 Z`} fill={style.fill} />
      <path d={`M68,296 L100,296 L101,303 L66,303 Z`} fill="url(#clothFormShoes)" />
      <path d={`M100,296 L132,296 L134,303 L99,303 Z`} fill={style.fill} />
      <path d={`M100,296 L132,296 L134,303 L99,303 Z`} fill="url(#clothFormShoes)" />
      {/* toe seam */}
      <path d="M74,297 L98,297 M102,297 L126,297" stroke="rgba(0,0,0,0.22)" strokeWidth="1" strokeLinecap="round" />

      {/* midsole + dark outsole contact line */}
      <path d="M66,300 L101,300 L101,303.5 L65,303.5 Z" fill={style.accent} opacity="0.85" />
      <path d="M99,300 L134,300 L135,303.5 L99,303.5 Z" fill={style.accent} opacity="0.85" />
      <path d="M64.5,303.5 L101,303.5 M99,303.5 L135.5,303.5" stroke="rgba(0,0,0,0.45)" strokeWidth="1.4" strokeLinecap="round" />

      {style.glow && (
        <>
          <ellipse cx="85" cy="304" rx="16" ry="2.4" fill={style.accent} opacity="0.4" />
          <ellipse cx="115" cy="304" rx="16" ry="2.4" fill={style.accent} opacity="0.4" />
        </>
      )}
    </g>
  );
}
