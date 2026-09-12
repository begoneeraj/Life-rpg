import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import InventoryItemCard from '../components/InventoryItemCard';
import SlotIcon from '../components/character/characterIcons';
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

// Loadout row: the five REAL equipment slots (the avatar has no headgear
// slot in the data model, so no invented HEAD tile). Slot icons come from
// the character subsystem's own icon family.
const LOADOUT_SLOTS = [
  { key: 'top', label: 'Body', icon: 'top' },
  { key: 'bottom', label: 'Legs', icon: 'legs' },
  { key: 'shoes', label: 'Shoes', icon: 'shoes' },
  { key: 'accessory', label: 'Accessory', icon: 'accessory' },
  { key: 'special', label: 'Weapon', icon: 'special' },
];

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
        <section className="game-panel game-panel-gold p-4" aria-label="Currently equipped">
          <div className="flex items-center gap-4">
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
            <div className="min-w-0">
              <p className="font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">Player loadout</p>
              <p className="mt-0.5 truncate text-sm text-parchment-300/60">
                {equippedSlots.length === 0
                  ? 'Nothing equipped yet — pick something from your collection below.'
                  : `${equippedSlots.length} of ${LOADOUT_SLOTS.length} slots filled`}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {LOADOUT_SLOTS.map((slot) => {
              const item = equipped[slot.key];
              return (
                <div
                  key={slot.key}
                  className={`flex min-w-0 items-center gap-2.5 rounded-md border px-2.5 py-2 ${
                    item
                      ? 'border-gold-500/40 bg-gold-500/5'
                      : 'border-dashed border-dungeon-700/70 bg-dungeon-900/40'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border ${
                      item
                        ? 'border-gold-500/50 bg-dungeon-950 text-gold-400'
                        : 'border-dungeon-600 bg-dungeon-950/60 text-parchment-300/40'
                    }`}
                  >
                    <SlotIcon name={slot.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-hud text-[8px] uppercase tracking-[0.18em] text-parchment-300/45">
                      {slot.label}
                    </span>
                    <span
                      className={`block truncate text-xs font-semibold ${
                        item ? 'text-parchment-100' : 'text-parchment-300/35'
                      }`}
                    >
                      {item?.name || 'Empty'}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
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
