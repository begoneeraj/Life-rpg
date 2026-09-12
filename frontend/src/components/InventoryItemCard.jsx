import { useState } from 'react';
import { RARITY_STYLES } from './character/constants';
import ItemArtwork from './items/ItemArtwork';
import StatusBadge from './ui/StatusBadge';

export default function InventoryItemCard({ item, gender, physique, onEquip, onUnequip }) {
  const [isBusy, setIsBusy] = useState(false);
  const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;

  async function handleClick() {
    setIsBusy(true);
    try {
      if (item.equipped) {
        await onUnequip(item.id);
      } else {
        await onEquip(item.id);
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div
      className={`card-interactive group relative flex flex-col gap-3 border p-4 ${
        item.equipped ? `${rarity.border} shadow-glow` : rarity.border
      }`}
    >
      {/* Equipped slot treatment: glowing top rule (tasteful, not heavy) */}
      {item.equipped && (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-gold-400 to-transparent"
        />
      )}

      {/* Recessed item slot with hover art scale */}
      <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-dungeon-600 bg-dungeon-950/60 transition-colors duration-200 group-hover:border-dungeon-500">
        <ItemArtwork
          category={item.category}
          svgKey={item.svgKey}
          gender={gender}
          physique={physique}
          className="h-20 w-full transition-transform duration-300 ease-out group-hover:scale-[1.06]"
        />
      </div>

      <div>
        <p className="truncate font-display text-sm font-bold text-parchment-100">{item.name}</p>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${rarity.text}`}>{rarity.label}</p>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        className={item.equipped ? 'btn-danger w-full text-xs' : 'btn-game w-full'}
      >
        {isBusy ? 'Updating…' : item.equipped ? 'UNEQUIP' : 'EQUIP'}
      </button>
      {item.equipped && (
        <p className="text-center">
          <StatusBadge variant="equipped" size="sm" />
        </p>
      )}
    </div>
  );
}
