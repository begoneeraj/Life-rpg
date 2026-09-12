import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import XPBar from '../components/XPBar';
import AttributeMiniBar from '../components/AttributeMiniBar';
import LevelUpModal from '../components/LevelUpModal';
import { Skeleton } from '../components/Skeleton';
import ItemArtwork from '../components/items/ItemArtwork';
import CharacterStage from '../components/character/CharacterStage';
import SlotIcon from '../components/character/characterIcons';
import { GlassPanel, LevelPlate, PixelCorners, SectionTitle } from '../components/character/characterUI';
import { GARMENT_COLORS } from '../components/character/constants';

const EQUIPMENT_SLOTS = [
  { key: 'head', label: 'Head', icon: 'head', identity: true },
  { key: 'top', label: 'Body', icon: 'top' },
  { key: 'bottom', label: 'Legs', icon: 'legs' },
  { key: 'shoes', label: 'Shoes', icon: 'shoes' },
  { key: 'accessory', label: 'Accessory', icon: 'accessory' },
  { key: 'special', label: 'Weapon', icon: 'special' },
];

const DYE_SLOTS = [
  { key: 'top', label: 'Body', primaryField: 'topPrimaryColor', accentField: 'topAccentColor' },
  { key: 'bottom', label: 'Legs', primaryField: 'bottomPrimaryColor', accentField: 'bottomAccentColor' },
  { key: 'shoes', label: 'Shoes', primaryField: 'shoesPrimaryColor', accentField: 'shoesAccentColor' },
];

function xpRequiredForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

function DyeSwatch({ selected, onClick, hex, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={selected}
      aria-label={label}
      className={`relative h-7 w-7 shrink-0 rounded-sm border transition-all duration-150 hover:-translate-y-0.5 ${
        selected
          ? 'border-gold-400 shadow-glow ring-1 ring-gold-300/70 ring-offset-1 ring-offset-dungeon-900'
          : 'border-dungeon-600 hover:border-parchment-300/50'
      }`}
      style={{ background: hex }}
    >
      {selected && <PixelCorners size={6} color="rgb(var(--c-gold-300) / 0.95)" />}
    </button>
  );
}

function EquipmentSlot({ slot, item, character }) {
  const status = slot.identity ? 'Identity' : item ? 'Equipped' : 'Empty';
  const itemName = slot.identity
    ? character.hairStyle?.replace(/_/g, ' ')
    : item?.name || 'No item equipped';

  return (
    <Link
      to="/inventory"
      className={`group relative flex min-h-28 flex-col rounded-md border p-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-lg ${
        item || slot.identity
          ? 'border-dungeon-600/70 bg-dungeon-900/50 hover:border-gold-500/60'
          : 'border-dungeon-700/60 bg-dungeon-900/30 hover:border-dungeon-500'
      }`}
      aria-label={`Open inventory to manage ${slot.label.toLowerCase()} equipment`}
    >
      <span className="absolute right-2 top-2 text-[9px] font-hud uppercase tracking-[0.14em] text-parchment-300/45">
        {status}
      </span>
      <div className="mb-2 flex h-10 items-center justify-between">
        <span className="flex h-7 w-7 items-center justify-center rounded border border-dungeon-600 bg-dungeon-850 text-parchment-300/70 group-hover:border-gold-500/60 group-hover:text-gold-400">
          <SlotIcon name={slot.icon} className="h-4 w-4" />
        </span>
        {item && (
          <ItemArtwork
            category={item.category}
            svgKey={item.svgKey}
            gender={character.gender}
            physique={character.physique}
            className="h-10 w-14 opacity-90 transition-transform duration-150 group-hover:scale-110"
          />
        )}
      </div>
      <span className="font-hud text-[10px] uppercase tracking-[0.18em] text-parchment-300/55">{slot.label}</span>
      <span className="mt-1 truncate text-xs font-semibold capitalize text-parchment-100">{itemName || '—'}</span>
      <span className="mt-auto pt-1 text-[10px] uppercase tracking-widest text-gold-500/0 transition-colors group-hover:text-gold-400/80">
        Manage
      </span>
    </Link>
  );
}

export default function Character() {
  const character = useStore((s) => s.character);
  const updateGarmentColors = useStore((s) => s.updateGarmentColors);
  const levelUpInfo = useStore((s) => s.levelUpInfo);
  const clearLevelUp = useStore((s) => s.clearLevelUp);

  if (!character) {
    return (
      <div className="page-container space-y-6">
        <Skeleton className="h-[560px] w-full" />
      </div>
    );
  }

  const equipped = character.equippedItems || {};
  const xpRequired = xpRequiredForLevel(character.level);

  async function handleDye(slot, channel, colorValue) {
    const dye = DYE_SLOTS.find((entry) => entry.key === slot);
    const nextPrimary = channel === 'primary' ? colorValue : character[dye.primaryField] || null;
    const nextAccent = channel === 'accent' ? colorValue : character[dye.accentField] || null;
    try {
      await updateGarmentColors(slot, nextPrimary, nextAccent);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update that color.');
    }
  }

  return (
    <div className="page-container space-y-6">
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />

      <header className="page-header">
        <div>
          <p className="font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">Player loadout</p>
          <h1 className="page-title mt-1">Character</h1>
          <p className="page-subtitle">Your appearance, equipment, and progression in one place.</p>
        </div>
        <LevelPlate level={character.level} className="min-w-[220px]" />
      </header>

      <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.22fr)_minmax(360px,0.78fr)]">
        <CharacterStage
          character={character}
          equipped={equipped}
          level={character.level}
          className="h-[500px] min-h-[420px] sm:h-[560px]"
        />

        <div className="flex min-w-0 flex-col gap-4">
          <GlassPanel className="p-5" blur={16}>
            <PixelCorners size={11} />
            <SectionTitle icon="special">Adventurer progress</SectionTitle>
            <div className="relative space-y-4">
              <XPBar level={character.level} current={character.currentXP} required={xpRequired} size="lg" />
              <div className="grid grid-cols-2 gap-2 border-t border-dungeon-600/40 pt-4 text-center">
                <div>
                  <p className="font-hud text-lg text-gold-400">{character.gold.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-widest text-parchment-300/50">Gold</p>
                </div>
                <div>
                  <p className="font-hud text-lg text-ember-400">{character.currentStreak}</p>
                  <p className="text-[10px] uppercase tracking-widest text-parchment-300/50">Day streak</p>
                </div>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="flex-1 p-5" blur={14}>
            <SectionTitle icon="head">Attribute matrix</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <AttributeMiniBar attribute="intellect" value={character.intellect} />
              <AttributeMiniBar attribute="strength" value={character.strength} />
              <AttributeMiniBar attribute="discipline" value={character.discipline} />
              <AttributeMiniBar attribute="focus" value={character.focus} />
              <AttributeMiniBar attribute="energy" value={character.energy} />
            </div>
          </GlassPanel>
        </div>
      </section>

      <GlassPanel className="p-5 sm:p-6" blur={14}>
        <PixelCorners size={10} />
        <SectionTitle icon="top" right={<Link to="/inventory" className="relative text-xs font-semibold text-gold-400 hover:underline">Open inventory →</Link>}>
          Equipped loadout
        </SectionTitle>
        <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {EQUIPMENT_SLOTS.map((slot) => (
            <EquipmentSlot
              key={slot.key}
              slot={slot}
              item={slot.identity ? null : equipped[slot.key]}
              character={character}
            />
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6" blur={14}>
        <PixelCorners size={10} />
        <SectionTitle icon="dye">Garment dye bench</SectionTitle>
        <div className="relative space-y-5">
          {DYE_SLOTS.filter((dye) => equipped[dye.key]).map((dye) => (
            <div key={dye.key} className="grid gap-3 border-b border-dungeon-600/35 pb-5 last:border-0 last:pb-0 md:grid-cols-[150px_1fr_1fr] md:items-center">
              <div>
                <p className="font-hud text-[11px] uppercase tracking-[0.18em] text-parchment-200">{dye.label}</p>
                <p className="mt-1 truncate text-xs text-parchment-300/55">{equipped[dye.key]?.name}</p>
              </div>
              <div>
                <p className="mb-2 font-hud text-[10px] uppercase tracking-[0.16em] text-gold-500/75">Primary</p>
                <div className="flex flex-wrap gap-2">
                  {GARMENT_COLORS.map((color) => {
                    const selected = character[dye.primaryField] === color.value;
                    return <DyeSwatch key={color.value} selected={selected} hex={color.hex} label={`Primary: ${color.label}`} onClick={() => handleDye(dye.key, 'primary', selected ? null : color.value)} />;
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 font-hud text-[10px] uppercase tracking-[0.16em] text-mystic-400/80">Accent</p>
                <div className="flex flex-wrap gap-2">
                  {GARMENT_COLORS.map((color) => {
                    const selected = character[dye.accentField] === color.value;
                    return <DyeSwatch key={color.value} selected={selected} hex={color.hex} label={`Accent: ${color.label}`} onClick={() => handleDye(dye.key, 'accent', selected ? null : color.value)} />;
                  })}
                </div>
              </div>
            </div>
          ))}
          {DYE_SLOTS.every((dye) => !equipped[dye.key]) && (
            <p className="relative py-4 text-sm text-parchment-300/60">Equip body, leg, or shoe gear from your inventory to use the dye bench.</p>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
