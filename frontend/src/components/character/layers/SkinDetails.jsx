/**
 * Subtle skin markings from spec S4.2's "Skin Details" column - a purely
 * cosmetic choice made once at character creation (like faceType/skinTone),
 * never regenerated afterward. Positioned around the same head circle
 * (cx=100, cy=66, r=33) established in Body.jsx so every detail lines up
 * regardless of face/hair style. Renders above Face (on top of the skin)
 * and below Hair, so bangs still occlude the forehead naturally.
 */
export default function SkinDetails({ skinDetail }) {
  if (!skinDetail || skinDetail === 'none') return null;

  if (skinDetail === 'freckles') {
    const dots = [
      [82, 70], [86, 73], [90, 71], [110, 71], [114, 73], [118, 70],
      [84, 76], [116, 76],
    ];
    return (
      <g fill="#00000022">
        {dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" />
        ))}
      </g>
    );
  }

  if (skinDetail === 'blush') {
    return (
      <g fill="#e8637a" opacity="0.28">
        <ellipse cx="83" cy="72" rx="6" ry="3.2" />
        <ellipse cx="117" cy="72" rx="6" ry="3.2" />
      </g>
    );
  }

  if (skinDetail === 'scar') {
    return (
      <path
        d="M108,52 L112,72"
        stroke="#8a5a52"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
        fill="none"
      />
    );
  }

  return null;
}
