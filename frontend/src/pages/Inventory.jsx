import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import InventoryItemCard from '../components/InventoryItemCard';
import CharacterAvatar from '../components/character/CharacterAvatar';
import { ShopItemSkeleton } from '../components/Skeleton';
import Icon from '../components/ui/icons';

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

  const equipped = character?.equippedItems || {};
  const equippedSlots = ['top', 'bottom', 'shoes', 'accessory', 'special'].filter(
    (slot) => equipped[slot]
  );

  return (
    <div className="page-container space-y-6">
      {/* ---------------- Inventory header ---------------- */}
      <header className="page-header !mb-0">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Icon name="inventory" className="h-6 w-6 text-gold-400" aria-hidden="true" />
            Player Inventory
          </h1>
          <p className="page-subtitle">
            {inventoryStatus === 'ready'
              ? `${inventoryItems.length} item${inventoryItems.length === 1 ? '' : 's'} collected`
              : 'Your collected gear'}
          </p>
        </div>
      </header>

      {/* ---------------- Loadout strip (real equipped items) ---------------- */}
      {character && inventoryStatus === 'ready' && (
        <section className="game-panel game-panel-gold flex flex-wrap items-center gap-4 p-4" aria-label="Currently equipped">
          <Link
            to="/character"
            aria-label="View your character"
            className="h-16 w-12 shrink-0 overflow-hidden rounded-md border border-gold-500/40 bg-dungeon-900 transition-transform hover:-translate-y-0.5"
          >
            <CharacterAvatar
              gender={character.gender}
              physique={character.physique}
              skinTone={character.skinTone}
              faceType={character.faceType}
              eyeColor={character.eyeColor}
              hairStyle={character.hairStyle}
              hairColor={character.hairColor}
              facialHair={character.facialHair}
              skinDetail={character.skinDetail}
              equippedTop={equipped.top}
              equippedBottom={equipped.bottom}
              equippedShoes={equipped.shoes}
              equippedAccessory={equipped.accessory}
              equippedSpecial={equipped.special}
              level={character.level}
              idle={false}
              className="h-full w-full"
            />
          </Link>
          {equippedSlots.length === 0 ? (
            <p className="text-sm text-parchment-300/60">
              Nothing equipped yet — pick something from your collection below.
            </p>
          ) : (
            equippedSlots.map((slot) => (
              <div
                key={slot}
                className="flex items-center gap-2 rounded-md border border-dungeon-700/70 bg-dungeon-900/70 px-2.5 py-1.5"
              >
                <span aria-hidden="true" className="font-hud text-[9px] uppercase tracking-[0.2em] text-parchment-300/50">
                  {slot}
                </span>
                <span className="text-xs font-semibold text-parchment-100">
                  {equipped[slot]?.name}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {/* ---------------- Grid states ---------------- */}
      {inventoryStatus === 'loading' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ShopItemSkeleton key={i} />
          ))}
        </div>
      )}

      {inventoryStatus === 'error' && (
        <div className="game-panel-quest rounded-lg p-8 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-widest text-ember-400">
            Inventory unavailable
          </p>
          <p className="mt-1 text-sm text-parchment-300/60">
            Could not load your inventory. Refresh to try again.
          </p>
        </div>
      )}

      {inventoryStatus === 'ready' && inventoryItems.length === 0 && (
        <div className="game-panel flex flex-col items-center gap-3 p-10 text-center">
          <Icon name="inventory" className="h-10 w-10 text-parchment-300/25" aria-hidden="true" />
          <p className="font-display text-base font-bold text-parchment-100">
            Your inventory is empty
          </p>
          <p className="text-sm text-parchment-300/60">
            Earn rewards and collect your first item — the Armory awaits.
          </p>
        </div>
      )}

      {inventoryStatus === 'ready' &&
        Object.entries(groups).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              {CATEGORY_LABEL[category] || category}
              <span className="ml-2 text-parchment-300/40">{items.length}</span>
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
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
