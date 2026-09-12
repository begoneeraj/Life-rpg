import { useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';
import ShopItemCard from '../components/ShopItemCard';
import { ShopItemSkeleton } from '../components/Skeleton';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Outfits' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'special', label: 'Special' },
];

export default function Shop() {
  const character = useStore((s) => s.character);
  const shopItems = useStore((s) => s.shopItems);
  const shopStatus = useStore((s) => s.shopStatus);
  const shopCategory = useStore((s) => s.shopCategory);
  const loadShopItems = useStore((s) => s.loadShopItems);
  const buyItem = useStore((s) => s.buyItem);

  useEffect(() => {
    loadShopItems('all');
  }, [loadShopItems]);

  async function handleBuy(itemId) {
    try {
      await buyItem(itemId);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#e8c874', '#8b5cf6', '#22c55e'] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed. Try again.');
    }
  }

  const visibleItems =
    shopCategory === 'all' ? shopItems : shopItems.filter((item) => item.category === shopCategory);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-1 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">THE ARMORY</h1>
        {character && (
          <span className="mx-auto rounded-full border border-gold-600/40 bg-dungeon-800 px-3 py-1 text-sm font-semibold text-gold-400 sm:mx-0">
            🪙 {character.gold} Gold · Level {character.level}
          </span>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:justify-start" role="tablist" aria-label="Shop categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={shopCategory === c.value}
            onClick={() => loadShopItems(c.value)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
              shopCategory === c.value
                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                : 'border-dungeon-600 bg-dungeon-800 text-parchment-200/70 hover:border-mystic-500 hover:text-mystic-400'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {shopStatus === 'loading' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShopItemSkeleton key={i} />
          ))}
        </div>
      )}

      {shopStatus === 'error' && (
        <p className="parchment-card p-6 text-center text-sm text-ember-400">
          Could not load the shop. Refresh to try again.
        </p>
      )}

      {shopStatus === 'ready' && visibleItems.length === 0 && (
        <p className="parchment-card p-6 text-center text-sm text-parchment-300/60">
          No items in this category yet.
        </p>
      )}

      {shopStatus === 'ready' && visibleItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibleItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              gold={character?.gold ?? 0}
              level={character?.level ?? 1}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
