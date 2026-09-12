import { useState } from 'react';
import { RARITY_STYLES } from './character/constants';
import ItemArtwork from './items/ItemArtwork';

export default function ShopItemCard({ item, gold, level, gender, physique, onBuy }) {
  const [isBuying, setIsBuying] = useState(false);
  const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
  const canAfford = gold >= item.price;
  const isLocked = level < item.requiredLevel;
  const disabled = item.owned || !canAfford || isLocked || isBuying;

  async function handleBuy() {
    setIsBuying(true);
    try {
      await onBuy(item.id);
    } finally {
      setIsBuying(false);
    }
  }

  return (    <div
      className={`card-interactive parchment-card flex flex-col gap-3 border p-4 ${rarity.border} ${
        item.owned ? 'opacity-70' : ''
      } ${!item.owned && !isLocked ? rarity.glow : ''}`
      }
    >
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

      {item.owned ? (
        <button type="button" className="btn-primary w-full text-xs" disabled>
          Owned ✓
        </button>
      ) : isLocked ? (
        <div className="space-y-1">
          <button type="button" className="btn-secondary w-full text-xs" disabled>
            LOCKED
          </button>
          <p className="text-center text-[11px] text-ember-400">Required Level: {item.requiredLevel}</p>
        </div>
      ) : (
        <div className="space-y-1">
          <button
            type="button"
            className="btn-primary w-full text-xs"
            onClick={handleBuy}
            disabled={disabled}
            aria-label={`Buy ${item.name} for ${item.price} gold`}
          >
            {isBuying ? 'Purchasing…' : `BUY · 🪙 ${item.price}`}
          </button>
          {!canAfford && (
            <p className="text-center text-[11px] text-ember-400">You have {gold} Gold</p>
          )}
          {item.requiredLevel > 1 && (
            <p className="text-center text-[10px] uppercase tracking-widest text-parchment-300/40">
              Required Level: {item.requiredLevel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
