/** Renders BEHIND the body (aura glow, blade silhouette) - passed as `back`, or omitted for none. */
export function SpecialFxBack({ svgKey }) {
  if (svgKey === 'special_aura') {
    return (
      <g>
        <circle cx="100" cy="150" r="90" fill="url(#auraGradient)" opacity="0.55">
          <animate attributeName="r" values="86;96;86" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.6;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <defs>
          <radialGradient id="auraGradient">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </g>
    );
  }
  if (svgKey === 'special_back_blade') {
    return (
      <g transform="rotate(28 130 150)">
        <rect x="126" y="60" width="8" height="130" rx="2" fill="#c9ced6" />
        <rect x="122" y="182" width="16" height="18" rx="2" fill="#3a2418" />
      </g>
    );
  }
  return null;
}

export default SpecialFxBack;
