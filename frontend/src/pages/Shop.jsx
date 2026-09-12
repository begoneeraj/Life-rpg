import { useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import useStore from '../store/useStore';
import ShopItemCard from '../components/ShopItemCard';
import { ShopItemSkeleton } from '../components/Skeleton';
import Icon from '../components/ui/icons';

const CATEGORIES = [
  { value: 'all', label: 'All', icon: 'inventory' },
  { value: 'top', label: 'Outfits', icon: 'character' },
  { value: 'bottom', label: 'Bottoms', icon: 'cat_chores' },
  { value: 'shoes', label: 'Shoes', icon: 'cat_running' },
  { value: 'accessory', label: 'Accessories', icon: 'armory' },
  { value: 'special', label: 'Special', icon: 'xp' },
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
    <div className="page-container space-y-6">
      {/* ---------------- Armory header ---------------- */}
      <header className="page-header !mb-0">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Icon name="armory" className="h-6 w-6 text-gold-400" aria-hidden="true" />
            The Armory
          </h1>
          <p className="page-subtitle">Upgrade your appearance. Gear is yours forever once acquired.</p>
        </div>
        {character && (
          <span
            className="hud-badge border-gold-600/40 bg-dungeon-900/80 px-3 py-1.5 text-gold-400"
            aria-label={`${character.gold} gold available`}
          >
            <Icon name="coin" className="h-3.5 w-3.5" />
            <span className="text-reward">{character.gold.toLocaleString()}</span> Gold
            <span className="text-parchment-300/40">· Level {character.level}</span>
          </span>
        )}
      </header>

      {/* ---------------- Category controls ---------------- */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Armory categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={shopCategory === c.value}
            onClick={() => loadShopItems(c.value)}
            className={`flex items-center gap-1.5 rounded-md border px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-150 ${
              shopCategory === c.value
                ? 'border-gold-500/60 bg-gold-500/10 text-gold-400'
                : 'border-dungeon-600 bg-dungeon-900/70 text-parchment-200/70 hover:border-dungeon-500 hover:text-parchment-100'
            }`}
          >
            <Icon name={c.icon} className="h-3.5 w-3.5" aria-hidden="true" />
            {c.label}
          </button>
        ))}
      </div>

      {/* ---------------- Grid states ---------------- */}
      {shopStatus === 'loading' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ShopItemSkeleton key={i} />
          ))}
        </div>
      )}

      {shopStatus === 'error' && (
        <div className="game-panel-quest rounded-lg p-8 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-ember-400">
            The armory is unreachable
          </p>
          <p className="mt-1 text-sm text-parchment-300/60">
            Could not load the shop. Refresh to try again.
          </p>
        </div>
      )}

      {shopStatus === 'ready' && visibleItems.length === 0 && (
        <div className="game-panel flex flex-col items-center gap-3 p-10 text-center">
          <Icon name="armory" className="h-10 w-10 text-parchment-300/25" aria-hidden="true" />
          <p className="font-display text-base font-bold text-parchment-100">Nothing in this case yet</p>
          <p className="text-sm text-parchment-300/60">New wares arrive as the world grows.</p>
        </div>
      )}

      {shopStatus === 'ready' && visibleItems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {visibleItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              gold={character?.gold ?? 0}
              level={character?.level ?? 1}
              gender={character?.gender}
              physique={character?.physique}
              onBuy={handleBuy}
            />
          ))}
        </div>
      )}
    </div>
  );
}
