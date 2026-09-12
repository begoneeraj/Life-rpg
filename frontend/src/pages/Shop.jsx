import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import ShopItemCard from '../components/ShopItemCard';
import { ShopItemSkeleton } from '../components/Skeleton';

export default function Shop() {
  const character = useStore((s) => s.character);
  const shopItems = useStore((s) => s.shopItems);
  const shopStatus = useStore((s) => s.shopStatus);
  const loadShopItems = useStore((s) => s.loadShopItems);
  const buyItem = useStore((s) => s.buyItem);

  useEffect(() => {
    loadShopItems();
  }, [loadShopItems]);

  async function handleBuy(itemId) {
    try {
      await buyItem(itemId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed. Try again.');
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">Shop</h1>
        {character && (
          <span className="rounded-full border border-gold-600/40 bg-dungeon-800 px-3 py-1 text-sm font-semibold text-gold-400">
            🪙 {character.gold} Gold
          </span>
        )}
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

      {shopStatus === 'ready' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shopItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              gold={character?.gold ?? 0}
              owned={character?.ownedItems?.includes(item.id)}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
