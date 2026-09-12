import { useState } from 'react';

const TYPE_ICON = { theme: '🎨', badge: '🎖️', avatar: '🧙' };

export default function ShopItemCard({ item, gold, owned, onBuy }) {
  const [isBuying, setIsBuying] = useState(false);
  const canAfford = gold >= item.cost;
  const disabled = owned || !canAfford || isBuying;

  async function handleBuy() {
    setIsBuying(true);
    try {
      await onBuy(item.id);
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div className={`parchment-card flex flex-col gap-3 p-4 ${owned ? 'opacity-70' : ''}`}>
      <div className="flex h-20 items-center justify-center rounded-lg border border-dungeon-600 bg-dungeon-900 text-4xl">
        <span aria-hidden="true">{TYPE_ICON[item.type] || '🎁'}</span>
      </div>
      <div>
        <p className="font-display text-sm font-bold text-parchment-100">{item.name}</p>
        <p className="text-[11px] uppercase tracking-widest text-parchment-300/60">{item.type}</p>
      </div>
      <button
        type="button"
        className="btn-primary w-full text-xs"
        onClick={handleBuy}
        disabled={disabled}
        aria-label={
          owned
            ? `${item.name} already owned`
            : `Buy ${item.name} for ${item.cost} gold`
        }
      >
        {owned ? 'Owned ✓' : isBuying ? 'Purchasing…' : `🪙 ${item.cost}`}
      </button>
      {!owned && !canAfford && (
        <p className="text-center text-[11px] text-ember-400">Not enough gold</p>
      )}
    </div>
  );
}
