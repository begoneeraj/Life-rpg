import { useState } from 'react';
import { RARITY_STYLES } from './character/constants';
import ItemArtwork from './items/ItemArtwork';

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
    <div className={`card-interactive parchment-card flex flex-col gap-3 border p-4 ${rarity.border}`}>
      <div className="flex h-20 items-center justify-center rounded-lg border border-dungeon-600 bg-dungeon-900">
        <ItemArtwork
          category={item.category}
          svgKey={item.svgKey}
          gender={gender}
          physique={physique}
          className="h-16 w-full"
        />
      </div>
      <div>
        <p className="font-display text-sm font-bold text-parchment-100">{item.name}</p>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${rarity.text}`}>{rarity.label}</p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        className={item.equipped ? 'btn-danger w-full text-xs' : 'btn-primary w-full text-xs'}
      >
        {isBusy ? 'Updating…' : item.equipped ? 'UNEQUIP' : 'EQUIP'}
      </button>
      {item.equipped && (
        <p className="text-center text-[11px] font-semibold text-xp-400">✓ Equipped</p>
      )}
    </div>
  );
}
