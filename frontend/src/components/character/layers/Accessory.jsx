export default function Accessory({ svgKey }) {
  if (!svgKey) return null;

  switch (svgKey) {
    case 'accessory_watch':
      return (
        <g>
          <rect x="41" y="204" width="12" height="8" rx="2" fill="#2a2621" />
          <circle cx="47" cy="208" r="3" fill="#e8c874" />
        </g>
      );
    case 'accessory_sunglasses':
      return (
        <g>
          <rect x="80" y="59" width="16" height="9" rx="3" fill="#111" opacity="0.88" />
          <rect x="104" y="59" width="16" height="9" rx="3" fill="#111" opacity="0.88" />
          <rect x="96" y="61" width="8" height="2.5" fill="#111" opacity="0.88" />
        </g>
      );
    case 'accessory_necklace':
      return (
        <g>
          <path d="M90,113 Q100,124 110,113" stroke="#e8c874" strokeWidth="2" fill="none" />
          <circle cx="100" cy="122" r="3.5" fill="#e8c874" />
        </g>
      );
    default:
      return null;
  }
}
