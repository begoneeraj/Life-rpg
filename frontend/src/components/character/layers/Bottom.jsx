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
 * Construction (spec: pants need waistband, seams, knee shape, ankle
 * transition): a real waistband seated at the hips, inseam shadow between
 * the legs, knee crease, side seams, and a hem that lands exactly at the
 * ankle line. Dye-independent shading works over any PRIMARY/ACCENT dye.
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

  // leg paths computed so waistband/hem math stays in sync with the widths
  const leftTop = 70 - hipWidth / 2;
  const leftInner = 98 - hipWidth / 2;
  const rightTop = 102 + hipWidth / 2;
  const rightOuter = 130 + hipWidth / 2;

  return (
    <g transform={`translate(100,0) scale(${metrics.hip},1) translate(-100,0)`}>
      <defs>
        {/* same cloth-form light as Top.jsx — one light source across the outfit */}
        <linearGradient id="clothFormBottom" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.13" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
        </linearGradient>
      </defs>

      {/* legs */}
      <path d={`M${leftTop},200 L${leftInner},200 L96,296 L74,296 Z`} fill={style.fill} />
      <path d={`M${leftTop},200 L${leftInner},200 L96,296 L74,296 Z`} fill="url(#clothFormBottom)" />
      <path d={`M${rightTop},200 L${rightOuter},200 L126,296 L104,296 Z`} fill={style.fill} />
      <path d={`M${rightTop},200 L${rightOuter},200 L126,296 L104,296 Z`} fill="url(#clothFormBottom)" />

      {/* inseam contact shadow between the thighs */}
      <path d="M100,206 L100,290" stroke="rgba(0,0,0,0.16)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />

      {/* side seams: fabric panels joined down the outer leg */}
      <path d={`M${leftTop + 1},204 L75,292 M${rightOuter - 1},204 L125,292`} stroke="rgba(0,0,0,0.10)" strokeWidth="1.1" fill="none" strokeLinecap="round" />

      {/* knee crease — slight bend hint at mid-leg */}
      <path d="M77,252 q6,3 12,1 M111,253 q6,-1 12,-3" stroke="rgba(0,0,0,0.13)" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* ankle hem: pants end exactly at the shoe line */}
      <path d="M74,293 L96,293 M104,293 L126,293" stroke="rgba(0,0,0,0.20)" strokeWidth="1.6" strokeLinecap="round" />

      {/* waistband: a distinct band seated at the natural waist */}
      <path d={`M${leftTop},200 L${rightOuter},200 L${rightOuter - 2},214 L${leftTop + 2},214 Z`} fill={style.accent} />
      <path d={`M${leftTop + 2},213 L${rightOuter - 2},213`} stroke="rgba(255,255,255,0.10)" strokeWidth="1" />

      {style.pockets && (
        <>
          <rect x="76" y="228" width="10" height="14" rx="1.5" fill={style.accent} />
          <rect x="114" y="228" width="10" height="14" rx="1.5" fill={style.accent} />
          {/* pocket flap stitching */}
          <path d="M76,232 L86,232 M114,232 L124,232" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
        </>
      )}
      {style.trim && (
        <path d={`M${leftTop},296 L96,296 M104,296 L${rightOuter},296`} stroke={style.accent} strokeWidth="2" />
      )}
    </g>
  );
}
