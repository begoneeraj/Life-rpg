import { useState } from 'react';
import { RARITY_STYLES } from './character/constants';

const CATEGORY_ICON = {
  top: '👕',
  bottom: '👖',
  shoes: '👟',
  accessory: '💍',
  special: '✨',
  hair: '💇',
};

export default function InventoryItemCard({ item, onEquip, onUnequip }) {
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
      <div className="flex h-20 items-center justify-center rounded-lg border border-dungeon-600 bg-dungeon-900 text-4xl">
        <span aria-hidden="true">{CATEGORY_ICON[item.category] || '🎁'}</span>
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
