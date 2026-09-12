/**
 * StatusBadge — reusable game status / rarity badge language.
 *
 * Variant map covers game statuses (ACTIVE, COMPLETED, LOCKED, EQUIPPED,
 * OWNED, NEW) and rarity tiers (COMMON…MYTHIC). Every variant pairs its
 * color with a leading icon/text marker so state never relies on color
 * alone (accessibility requirement). Rendered as a hud-badge chip with
 * uppercase HUD typography.
 */
const VARIANTS = {
  // --- game statuses ---
  active: { icon: '⚔', label: 'Active', cls: 'border-mystic-500/50 bg-mystic-500/10 text-mystic-300' },
  completed: { icon: '✓', label: 'Completed', cls: 'border-xp-500/50 bg-xp-500/10 text-xp-400' },
  locked: { icon: '🔒', label: 'Locked', cls: 'border-dungeon-500 bg-dungeon-800 text-parchment-300/60' },
  equipped: { icon: '✓', label: 'Equipped', cls: 'border-xp-500/50 bg-xp-500/10 text-xp-400' },
  owned: { icon: '✓', label: 'Owned', cls: 'border-dungeon-500 bg-dungeon-800 text-parchment-300/80' },
  new: { icon: '★', label: 'New', cls: 'border-gold-500/60 bg-gold-500/10 text-gold-400' },

  // --- rarity tiers (match RARITY_STYLES hue families) ---
  common: { icon: '•', label: 'Common', cls: 'border-parchment-300/30 bg-dungeon-800 text-parchment-300' },
  uncommon: { icon: '•', label: 'Uncommon', cls: 'border-xp-500/50 bg-xp-500/10 text-xp-400' },
  rare: { icon: '◆', label: 'Rare', cls: 'border-azure-500/60 bg-azure-500/10 text-azure-400' },
  epic: { icon: '◆◆', label: 'Epic', cls: 'border-fuchsia-500/60 bg-fuchsia-500/10 text-fuchsia-400' },
  legendary: { icon: '★', label: 'Legendary', cls: 'border-gold-500/70 bg-gold-500/10 text-gold-400' },
  mythic: { icon: '★★', label: 'Mythic', cls: 'border-ember-500/70 bg-ember-500/10 text-ember-400' },
};

/**
 * @param {keyof typeof VARIANTS} variant
 * @param {string} [children] optional label override
 * @param {'md'|'sm'} [size]
 */
export default function StatusBadge({ variant, children, size = 'md', className = '' }) {
  const meta = VARIANTS[variant] || VARIANTS.common;
  return (
    <span
      className={`hud-badge font-hud uppercase ${size === 'sm' ? 'hud-badge-sm' : ''} ${meta.cls} ${className}`}
    >
      <span aria-hidden="true" className="text-[9px] leading-none">
        {meta.icon}
      </span>
      {children || meta.label}
    </span>
  );
}
