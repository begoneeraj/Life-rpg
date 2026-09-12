import { useState } from 'react';
import { RARITY_STYLES } from './character/constants';
import ItemArtwork from './items/ItemArtwork';
import Icon from './ui/icons';

export default function ShopItemCard({ item, gold, level, gender, physique, onBuy }) {
  const [isBuying, setIsBuying] = useState(false);
  // Real purchase confirmation this session — transient "ITEM ACQUIRED"
  // moment over the slot; ownership itself comes from the server refetch.
  const [justBought, setJustBought] = useState(false);
  const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
  const canAfford = gold >= item.price;
  const isLocked = level < item.requiredLevel;
  const disabled = item.owned || !canAfford || isLocked || isBuying;

  async function handleBuy() {
    setIsBuying(true);
    try {
      await onBuy(item.id);
      setJustBought(true);
      setTimeout(() => setJustBought(false), 1800);
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div
      className={`card-interactive group relative flex flex-col gap-3 border p-4 ${rarity.border} ${
        item.owned ? 'opacity-70' : ''
      } ${!item.owned && !isLocked ? rarity.glow : ''}`}
    >
      {/* Item slot: recessed art tile that brightens toward its rarity on hover */}
      <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-md border border-dungeon-600 bg-dungeon-950/60 transition-colors duration-200 group-hover:border-dungeon-500">
        <div className={`pointer-events-none absolute inset-0 border ${rarity.border} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} aria-hidden="true" />
        <ItemArtwork
          category={item.category}
          svgKey={item.svgKey}
          gender={gender}
          physique={physique}
          className="h-20 w-full transition-transform duration-300 ease-out group-hover:scale-[1.06]"
        />
        {/* ITEM ACQUIRED moment (real purchase only) */}
        {justBought && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-dungeon-950/85 backdrop-blur-[2px]"
            aria-live="polite"
          >
            <Icon name="check" className="h-5 w-5 text-xp-400" />
            <span className="font-hud text-[10px] uppercase tracking-[0.25em] text-gold-400">
              Item Acquired
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="truncate font-display text-sm font-bold text-parchment-100">{item.name}</p>
        <p className={`text-[11px] font-bold uppercase tracking-widest ${rarity.text}`}>{rarity.label}</p>
      </div>

      {item.owned ? (
        <button type="button" className="btn-primary w-full text-xs" disabled>
          Owned <Icon name="check" className="h-3.5 w-3.5" />
        </button>
      ) : isLocked ? (
        <div className="space-y-1">
          <button type="button" className="btn-secondary w-full text-xs" disabled>
            <Icon name="lock" className="h-3.5 w-3.5" /> Locked
          </button>
          <p className="flex items-center justify-center gap-1 text-center text-[11px] text-ember-400">
            <Icon name="xp" className="h-3 w-3" /> Requires Level {item.requiredLevel}
          </p>
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
            {isBuying ? (
              'Purchasing…'
            ) : (
              <span className="flex items-center gap-1.5">
                Buy <Icon name="coin" className="h-3.5 w-3.5" /> {item.price}
              </span>
            )}
          </button>
          {!canAfford && (
            <p className="text-center text-[11px] text-ember-400">You have {gold} Gold</p>
          )}
          {item.requiredLevel > 1 && (
            <p className="text-center text-[10px] uppercase tracking-widest text-parchment-300/40">
              Requires Level {item.requiredLevel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
