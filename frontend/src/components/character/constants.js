// Shared enums/palettes for character creation + avatar rendering. Mirrors
// the fixed allow-lists validated server-side in
// backend/src/controllers/characterController.js - the frontend never
// invents a value the backend wouldn't accept.

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const PHYSIQUE_BY_GENDER = {
  male: [
    { value: 'lean', label: 'Lean / Scout' },
    { value: 'athletic', label: 'Athletic / Standard' },
    { value: 'heavy', label: 'Heavy / Juggernaut' },
  ],
  female: [
    { value: 'slender', label: 'Slender / Agile' },
    { value: 'athletic', label: 'Athletic / Toned' },
    { value: 'curvy', label: 'Curvy / Formidable' },
  ],
};

export const SKIN_TONES = [
  { value: 'very_light', label: 'Very Light', hex: '#f4d2b8' },
  { value: 'light', label: 'Light', hex: '#e8b892' },
  { value: 'medium', label: 'Medium', hex: '#c98f65' },
  { value: 'tan', label: 'Tan', hex: '#a8703f' },
  { value: 'brown', label: 'Brown', hex: '#7c4b28' },
  { value: 'deep_brown', label: 'Deep Brown', hex: '#4a2c18' },
];

export const FACE_TYPES_BY_GENDER = {
  male: [
    { value: 'sharp', label: 'Sharp / Heroic' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'mature', label: 'Mature' },
    { value: 'rugged', label: 'Rugged' },
  ],
  female: [
    { value: 'elegant', label: 'Elegant' },
    { value: 'confident', label: 'Confident' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'athletic', label: 'Athletic' },
  ],
};

export const EYE_COLORS = [
  { value: 'deep_obsidian', label: 'Deep Obsidian', hex: '#1a1a1d' },
  { value: 'espresso_brown', label: 'Espresso Brown', hex: '#4a2e1b' },
  { value: 'hazel_amber', label: 'Hazel Amber', hex: '#8b5a2b' },
  { value: 'glacial_blue', label: 'Glacial Blue', hex: '#4a90e2' },
  { value: 'emerald_sage', label: 'Emerald Sage', hex: '#2e7d32' },
  { value: 'storm_gray', label: 'Storm Gray', hex: '#78909c' },
];

export const HAIR_STYLES_BY_GENDER = {
  male: [
    { value: 'short_textured', label: 'Short Textured' },
    { value: 'fade', label: 'Fade' },
    { value: 'messy_medium', label: 'Messy Medium' },
    { value: 'slick_back', label: 'Slick Back' },
    { value: 'curly', label: 'Curly' },
    { value: 'long', label: 'Long' },
    { value: 'buzz_cut', label: 'Buzz Cut' },
    { value: 'undercut', label: 'Undercut', unlockLevel: 5 },
    { value: 'man_bun', label: 'Man Bun', unlockLevel: 10 },
  ],
  female: [
    { value: 'long_straight', label: 'Long Straight' },
    { value: 'wavy', label: 'Wavy' },
    { value: 'curly', label: 'Curly' },
    { value: 'ponytail', label: 'Ponytail' },
    { value: 'bob', label: 'Bob' },
    { value: 'shoulder_length', label: 'Shoulder-Length' },
    { value: 'braided', label: 'Braided' },
    { value: 'high_ponytail', label: 'High Ponytail', unlockLevel: 5 },
    { value: 'twin_braids', label: 'Twin Braids', unlockLevel: 10 },
  ],
};

export const HAIR_COLORS = [
  { value: 'black', label: 'Black', hex: '#1c1613' },
  { value: 'dark_brown', label: 'Dark Brown', hex: '#3b2a1e' },
  { value: 'brown', label: 'Brown', hex: '#6b4226' },
  { value: 'blonde', label: 'Blonde', hex: '#d9b46a' },
  { value: 'red', label: 'Red', hex: '#8a3b25' },
  { value: 'gray', label: 'Gray', hex: '#9a958f' },
  { value: 'white', label: 'White', hex: '#e8e4dc' },
];

export const SKIN_DETAILS = [
  { value: 'none', label: 'None' },
  { value: 'freckles', label: 'Freckles' },
  { value: 'blush', label: 'Blush' },
  { value: 'scar', label: 'Scar' },
];

export const FACIAL_HAIR_OPTIONS = [
  { value: 'clean_shaven', label: 'Clean Shaven' },
  { value: 'light_stubble', label: 'Light Stubble' },
  { value: 'medium_beard', label: 'Medium Beard' },
  { value: 'full_beard', label: 'Full Beard' },
  { value: 'mustache', label: 'Mustache' },
  { value: 'beard_and_mustache', label: 'Beard + Mustache' },
];

export const RARITY_STYLES = {
  common: { label: 'Common', text: 'text-parchment-300', border: 'border-parchment-300/40', glow: '' },
  uncommon: { label: 'Uncommon', text: 'text-xp-400', border: 'border-xp-500/50', glow: '' },
  // Rare = azure now (was mystic violet) so rare/epic/mythic each read distinctly.
  rare: { label: 'Rare', text: 'text-azure-400', border: 'border-azure-500/60', glow: '' },
  epic: { label: 'Epic', text: 'text-fuchsia-400', border: 'border-fuchsia-500/60', glow: 'shadow-glow-mystic' },
  legendary: { label: 'Legendary', text: 'text-gold-400', border: 'border-gold-500/70', glow: 'shadow-glow' },
  mythic: { label: 'Mythic', text: 'text-ember-400', border: 'border-ember-500/70', glow: 'shadow-glow' },
};

// Shared dye palette for garment primary/accent colors (top/bottom/shoes).
// Independent of each item's baked-in default fill/accent in Top/Bottom/
// Shoes.jsx's STYLES maps - selecting a color here overrides that default.
export const GARMENT_COLORS = [
  { value: 'slate', label: 'Slate', hex: '#4a4d53' },
  { value: 'charcoal', label: 'Charcoal', hex: '#232529' },
  { value: 'crimson', label: 'Crimson', hex: '#7a2130' },
  { value: 'forest', label: 'Forest', hex: '#2f4a34' },
  { value: 'navy', label: 'Navy', hex: '#233a52' },
  { value: 'sand', label: 'Sand', hex: '#c9a96a' },
  { value: 'ivory', label: 'Ivory', hex: '#e8e0d0' },
  { value: 'gold', label: 'Gold', hex: '#d4af37' },
  { value: 'obsidian', label: 'Obsidian', hex: '#141210' },
  { value: 'royal_purple', label: 'Royal Purple', hex: '#5a1a5c' },
];

export const GARMENT_COLOR_HEX = Object.fromEntries(GARMENT_COLORS.map((c) => [c.value, c.hex]));

export const SKIN_TONE_HEX = Object.fromEntries(SKIN_TONES.map((s) => [s.value, s.hex]));
export const HAIR_COLOR_HEX = Object.fromEntries(HAIR_COLORS.map((c) => [c.value, c.hex]));
export const EYE_COLOR_HEX = Object.fromEntries(EYE_COLORS.map((c) => [c.value, c.hex]));

// Shoulder/hip width multipliers applied to the base silhouette in Body.jsx.
export const PHYSIQUE_METRICS = {
  lean: { shoulder: 0.9, hip: 0.92, limb: 0.88 },
  athletic: { shoulder: 1.0, hip: 1.0, limb: 1.0 },
  heavy: { shoulder: 1.16, hip: 1.14, limb: 1.15 },
  slender: { shoulder: 0.92, hip: 0.95, limb: 0.9 },
  curvy: { shoulder: 1.0, hip: 1.16, limb: 1.05 },
};
