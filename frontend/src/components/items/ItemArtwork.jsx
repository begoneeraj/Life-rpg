import Top from '../character/layers/Top';
import Bottom from '../character/layers/Bottom';
import Shoes from '../character/layers/Shoes';
import Accessory from '../character/layers/Accessory';
import { SpecialFxBack } from '../character/layers/SpecialFx';
import Hair, { HairBack } from '../character/layers/Hair';

/**
 * ItemArtwork — reusable visual presentation for catalog/inventory items.
 *
 * Reuses the character subsystem's own layer components (the exact artwork
 * worn by the avatar) rendered on a plain tile, zoomed via a per-category
 * viewBox crop. No new art, no invented data: an item shows artwork only if
 * its svgKey is one the character layers actually implement; otherwise we
 * fall back to the category emoji so unknown/future items never render a
 * misleading default garment.
 *
 * svgKey coverage mirrors the layer STYLES maps:
 *   top:       top_basic_tee, top_hoodie, top_leather_jacket, top_cyber_jacket, top_royal_coat
 *   bottom:    bottom_basic_pants, bottom_jeans, bottom_cargo_pants, bottom_premium_pants
 *   shoes:     shoes_basic, shoes_running, shoes_combat_boots, shoes_premium_sneakers
 *   accessory: accessory_watch, accessory_sunglasses, accessory_necklace
 *   special:   special_aura, special_back_blade
 *   hair:      hair_undercut, hair_man_bun, hair_high_ponytail, hair_twin_braids
 *              (seed svgKeys map to Hair's hairstyle enums by stripping "hair_")
 */

// Keys the character layers can actually draw. Anything else -> emoji fallback.
const KNOWN_KEYS = new Set([
  'top_basic_tee',
  'top_hoodie',
  'top_leather_jacket',
  'top_cyber_jacket',
  'top_royal_coat',
  'bottom_basic_pants',
  'bottom_jeans',
  'bottom_cargo_pants',
  'bottom_premium_pants',
  'shoes_basic',
  'shoes_running',
  'shoes_combat_boots',
  'shoes_premium_sneakers',
  'accessory_watch',
  'accessory_sunglasses',
  'accessory_necklace',
  'special_aura',
  'special_back_blade',
  'hair_undercut',
  'hair_man_bun',
  'hair_high_ponytail',
  'hair_twin_braids',
]);

// Zoom crops into the 200x320 doll coordinate space so each item fills its tile.
const VIEW_BOX_BY_CATEGORY = {
  top: '35,105,130,110',
  bottom: '62,192,76,116',
  shoes: '58,266,84,46',
  hair: '55,8,90,142',
  accessory: {
    accessory_watch: '36,197,24,22',
    accessory_sunglasses: '75,54,50,20',
    accessory_necklace: '83,107,34,24',
  },
  special: {
    special_aura: '40,90,120,120',
    special_back_blade: '98,48,64,162',
  },
};

const FALLBACK_ICON = {
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessory: '💍',
  special: '✨',
  hair: '💇',
  facial_hair: '🧔',
};

export default function ItemArtwork({
  category,
  svgKey,
  gender,
  physique = 'athletic',
  primaryColor,
  accentColor,
  className = '',
}) {
  if (!svgKey || !KNOWN_KEYS.has(svgKey)) {
    if (import.meta.env.DEV && svgKey) {
      console.warn(`[ItemArtwork] No artwork for svgKey "${svgKey}" — using emoji fallback.`);
    }
    return (
      <span className={className} role="img" aria-label={category}>
        {FALLBACK_ICON[category] || '🎁'}
      </span>
    );
  }

  const vbByCat = VIEW_BOX_BY_CATEGORY[category];
  const viewBox = typeof vbByCat === 'string' ? vbByCat : (vbByCat && vbByCat[svgKey]) || '35,105,130,110';

  // Garment dye overrides (GARMENT_COLORS values). Callers pass the
  // character's saved dye fields for equipped items; null/undefined falls
  // back to the item's own baked-in colors inside the layer components.
  const dye = { primaryColor, accentColor };

  return (
    <svg
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={`${category} item artwork`}
      preserveAspectRatio="xMidYMid meet"
    >
      {category === 'top' && (
        <Top svgKey={svgKey} gender={gender} physique={physique} {...dye} />
      )}
      {category === 'bottom' && (
        <Bottom svgKey={svgKey} gender={gender} physique={physique} {...dye} />
      )}
      {category === 'shoes' && <Shoes svgKey={svgKey} physique={physique} {...dye} />}
      {category === 'accessory' && <Accessory svgKey={svgKey} />}
      {category === 'special' && <SpecialFxBack svgKey={svgKey} />}
      {category === 'hair' && (
        <>
          {/* Back length first so the front cap overlaps it, matching the doll's z-order.
              Hair unlock items carry no color data; the layers default to black. */}
          <HairBack
            hairStyle={svgKey.replace(/^hair_/, '')}
            hairColor={undefined}
            gender={gender}
          />
          <Hair hairStyle={svgKey.replace(/^hair_/, '')} hairColor={undefined} gender={gender} />
        </>
      )}
    </svg>
  );
}
