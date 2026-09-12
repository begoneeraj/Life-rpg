import { useEffect } from 'react';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import InventoryItemCard from '../components/InventoryItemCard';
import { ShopItemSkeleton } from '../components/Skeleton';

const CATEGORY_LABEL = {
  top: 'Tops',
  bottom: 'Bottoms',
  shoes: 'Shoes',
  accessory: 'Accessories',
  special: 'Special Equipment',
  hair: 'Hairstyles',
};

export default function Inventory() {
  const character = useStore((s) => s.character);
  const inventoryItems = useStore((s) => s.inventoryItems);
  const inventoryStatus = useStore((s) => s.inventoryStatus);
  const loadInventory = useStore((s) => s.loadInventory);
  const equipItem = useStore((s) => s.equipItem);
  const unequipItem = useStore((s) => s.unequipItem);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  async function handleEquip(itemId) {
    try {
      await equipItem(itemId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not equip that item.');
    }
  }

  async function handleUnequip(itemId) {
    try {
      await unequipItem(itemId);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not unequip that item.');
    }
  }

  const groups = inventoryItems.reduce((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="page-container space-y-8">
      <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">Inventory</h1>

      {inventoryStatus === 'loading' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ShopItemSkeleton key={i} />
          ))}
        </div>
      )}

      {inventoryStatus === 'error' && (
        <p className="parchment-card p-6 text-center text-sm text-ember-400">
          Could not load your inventory. Refresh to try again.
        </p>
      )}

      {inventoryStatus === 'ready' && inventoryItems.length === 0 && (
        <p className="parchment-card p-6 text-center text-sm text-parchment-300/60">
          You don't own any items yet. Visit The Armory to gear up.
        </p>
      )}

      {inventoryStatus === 'ready' &&
        Object.entries(groups).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              {CATEGORY_LABEL[category] || category}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  gender={character?.gender}
                  physique={character?.physique}
                  onEquip={handleEquip}
                  onUnequip={handleUnequip}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
