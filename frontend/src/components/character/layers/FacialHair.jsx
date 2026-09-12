import { HAIR_COLOR_HEX } from '../constants';

// Each shape follows the jaw/mouth contour established in Face.jsx rather
// than sitting as a flat overlay - stubble/beards hug the same jaw curve,
// the mustache sits directly above the mouth path.
const SHAPES = {
  clean_shaven: null,
  light_stubble: { d: 'M78,80 Q100,102 122,80 L120,90 Q100,108 80,90 Z', opacity: 0.35 },
  medium_beard: { d: 'M74,78 Q100,112 126,78 L124,94 Q100,116 76,94 Z', opacity: 0.92 },
  full_beard: { d: 'M70,74 Q100,120 130,74 L129,98 Q100,124 71,98 Z', opacity: 0.96 },
  mustache: { mustacheOnly: true },
  beard_and_mustache: { d: 'M74,78 Q100,112 126,78 L124,94 Q100,116 76,94 Z', opacity: 0.92, mustache: true },
};

export default function FacialHair({ style, hairColor }) {
  const shape = SHAPES[style];
  const color = HAIR_COLOR_HEX[hairColor] || '#1c1613';
  if (!shape) return null;

  return (
    <g>
      {shape.d && <path d={shape.d} fill={color} opacity={shape.opacity} />}
      {(shape.mustacheOnly || shape.mustache) && (
        <path d="M90,83 Q100,80 110,83 Q100,86 90,83 Z" fill={color} />
      )}
    </g>
  );
}
