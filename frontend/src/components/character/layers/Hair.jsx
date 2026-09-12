import { HAIR_COLOR_HEX } from '../constants';

// Every shape is built around the same head circle (cx=100, cy=66, r=33)
// established in Body.jsx, so hair always sits correctly regardless of
// which style is equipped.
//
// Styles with hanging length (ponytails, long hair, braids) are split into
// `front` (the cap/fringe, rendered above the face) and `back` (the trailing
// length, rendered behind the body/clothing so it drapes naturally instead
// of pasting flat over the shoulders). Short styles only define `front`.
const SHAPES = {
  short_textured: { front: 'M67,58 Q70,28 100,26 Q130,28 133,58 Q120,44 100,44 Q80,44 67,58 Z' },
  fade: { front: 'M70,50 Q75,30 100,28 Q125,30 130,50 Q118,40 100,40 Q82,40 70,50 Z' },
  messy_medium: {
    front:
      'M64,60 Q66,24 100,22 Q134,24 136,60 Q128,40 116,46 Q108,32 100,42 Q92,32 84,46 Q72,40 64,60 Z',
  },
  slick_back: {
    front: 'M68,52 Q72,30 100,28 Q128,30 132,52 L132,40 Q128,32 100,32 Q72,32 68,40 Z',
  },
  curly: {
    front:
      'M63,56 Q60,26 100,24 Q140,26 137,56 Q134,38 122,42 Q124,30 108,34 Q104,26 96,34 Q84,28 80,40 Q68,36 63,56 Z',
  },
  long: {
    front: 'M65,60 Q66,26 100,24 Q134,26 135,60 Q130,42 100,40 Q70,42 65,60 Z',
    back: 'M65,60 L62,120 Q70,124 74,90 Z M135,60 L138,120 Q130,124 126,90 Z',
  },
  buzz_cut: { front: 'M69,54 Q73,32 100,30 Q127,32 131,54 Q118,46 100,46 Q82,46 69,54 Z' },
  undercut: { front: 'M74,48 Q78,28 100,26 Q122,28 126,48 Q112,36 100,36 Q88,36 74,48 Z' },
  man_bun: {
    front: 'M69,54 Q73,30 100,28 Q127,30 131,54 Q118,42 100,42 Q82,42 69,54 Z',
    back: 'M100,26 a10,9 0 1,0 0.1,0 Z',
  },

  long_straight: {
    front: 'M62,60 Q64,24 100,22 Q136,24 138,60 Q132,40 100,38 Q68,40 62,60 Z',
    back: 'M62,60 L58,140 Q68,146 72,86 Z M138,60 L142,140 Q132,146 128,86 Z',
  },
  wavy: {
    front: 'M61,58 Q64,24 100,22 Q136,24 139,58 Q133,40 100,38 Q67,40 61,58 Z',
    back: 'M61,58 Q55,90 66,120 Q60,132 72,86 Z M139,58 Q145,90 134,120 Q140,132 128,86 Z',
  },
  curly_f: {
    front:
      'M60,56 Q57,24 100,22 Q143,24 140,56 Q136,36 122,42 Q124,28 106,34 Q102,24 94,34 Q80,28 76,42 Q64,36 60,56 Z',
  },
  ponytail: {
    front: 'M67,56 Q70,26 100,24 Q130,26 133,56 Q120,42 100,42 Q80,42 67,56 Z',
    back: 'M133,50 Q152,58 148,100 Q142,90 138,58 Z',
  },
  bob: {
    front:
      'M63,64 Q64,26 100,24 Q136,26 137,64 Q138,84 130,92 L128,60 Q114,42 100,42 Q86,42 72,60 L70,92 Q62,84 63,64 Z',
  },
  shoulder_length: {
    front:
      'M62,62 Q63,25 100,23 Q137,25 138,62 Q140,100 132,130 Q126,110 128,66 L100,42 L72,66 Q74,110 68,130 Q60,100 62,62 Z',
  },
  braided: {
    front: 'M65,58 Q68,26 100,24 Q132,26 135,58 Q122,42 100,42 Q78,42 65,58 Z',
    back: 'M65,58 Q60,70 64,84 Q68,72 70,60 Z M135,58 Q140,70 136,84 Q132,72 130,60 Z',
  },
  high_ponytail: {
    front: 'M67,54 Q70,26 100,24 Q130,26 133,54 Q120,40 100,40 Q80,40 67,54 Z',
    back: 'M100,26 Q112,10 122,18 Q126,34 108,30 Z',
  },
  twin_braids: {
    front: 'M66,58 Q69,26 100,24 Q131,26 134,58 Q120,42 100,42 Q80,42 66,58 Z',
    back: 'M66,58 Q58,80 62,110 Q68,96 70,64 Z M134,58 Q142,80 138,110 Q132,96 130,64 Z',
  },
};

// hairStyle "curly" is shared by both genders but needs a different silhouette
// per head shape; disambiguate by gender at lookup time.
function resolveShapeKey(hairStyle, gender) {
  if (hairStyle === 'curly' && gender === 'female') return 'curly_f';
  return hairStyle;
}

function shapeFor(hairStyle, gender) {
  return SHAPES[resolveShapeKey(hairStyle, gender)] || SHAPES.short_textured;
}

/** Trailing length (ponytails/braids/long locks) - render BEHIND the body/clothing. */
export function HairBack({ hairStyle, hairColor, gender }) {
  const shape = shapeFor(hairStyle, gender);
  if (!shape.back) return null;
  const color = HAIR_COLOR_HEX[hairColor] || '#1c1613';
  return <path d={shape.back} fill={color} fillRule="evenodd" />;
}

/** Cap + fringe - render ABOVE the face so bangs fall over the forehead correctly. */
export default function Hair({ hairStyle, hairColor, gender }) {
  const shape = shapeFor(hairStyle, gender);
  const color = HAIR_COLOR_HEX[hairColor] || '#1c1613';
  return (
    <g>
      <path d={shape.front} fill={color} fillRule="evenodd" />
      <path d={shape.front} fill="url(#hairSheen)" fillRule="evenodd" />
      <defs>
        <linearGradient id="hairSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </g>
  );
}
