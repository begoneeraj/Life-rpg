import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import XPBar from '../components/XPBar';
import AttributeMiniBar from '../components/AttributeMiniBar';
import LevelUpModal from '../components/LevelUpModal';
import { Skeleton } from '../components/Skeleton';
import ItemArtwork from '../components/items/ItemArtwork';
import CharacterStage from '../components/character/CharacterStage';
import SlotIcon from '../components/character/characterIcons';
import { GlassPanel, PixelCorners, SectionTitle } from '../components/character/characterUI';
import { GARMENT_COLORS, RARITY_STYLES } from '../components/character/constants';

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

/* ------------------------------------------------------------------ */
/* Small HUD glyph set (coin / flame / laurel) in the same stroke       */
/* language as the slot icons. Keeps the identity card readable at a    */
/* glance without pulling in any new icon dependency.                   */
/* ------------------------------------------------------------------ */
function CoinGlyph({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6.6" y="6.6" width="2.8" height="2.8" fill="currentColor" />
    </svg>
  );
}

function FlameGlyph({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 1.8c2 2.1 4.4 3.8 4.4 7a4.4 4.4 0 1 1-8.8 0c0-1.6.8-2.9 1.9-4 .2 1 .8 1.7 1.6 2 .1-2 .4-3.6.9-5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LaurelGlyph({ className }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path d="M3 3.5v3.2a5 5 0 0 0 10 0V3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 9.2v4M5.4 11.6 8 13.2l2.6-1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* LevelShield — the game-badge presentation of the REAL level: bronze  */
/* shield plate, tabular numeral, restrained glow. Recognition, not     */
/* size.                                                                */
/* ------------------------------------------------------------------ */
function LevelShield({ level }) {
  return (
    <span className="relative inline-flex h-16 w-14 shrink-0 items-center justify-center" role="img" aria-label={`Level ${level}`}>
      <svg viewBox="0 0 48 56" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="shieldFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(var(--c-gold-400))" stopOpacity="0.30" />
            <stop offset="1" stopColor="rgb(var(--c-gold-600))" stopOpacity="0.10" />
          </linearGradient>
        </defs>
        <path
          d="M24 2 L45 10 V27 C45 41 36 50 24 54 C12 50 3 41 3 27 V10 Z"
          fill="url(#shieldFill)"
          stroke="rgb(var(--c-gold-400) / 0.85)"
          strokeWidth="1.6"
        />
        <path
          d="M24 6.5 L41 13 V26.5 C41 38 33.8 45.8 24 49.4 C14.2 45.8 7 38 7 26.5 V13 Z"
          fill="rgb(var(--c-dungeon-900) / 0.55)"
          stroke="rgb(var(--c-gold-400) / 0.25)"
          strokeWidth="1"
        />
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        <span className="font-hud text-[8px] uppercase tracking-[0.24em] text-gold-400/80">LV</span>
        <span
          className="font-hud text-2xl font-extrabold text-gold-300"
          style={{ textShadow: '0 0 12px rgb(var(--c-glow-gold) / 0.5)' }}
        >
          {level}
        </span>
      </span>
    </span>
  );
}

function StatChip({ icon: Glyph, value, label, className = '' }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border border-dungeon-600/60 bg-dungeon-900/50 px-2.5 py-1.5 ${className}`}>
      <Glyph className="h-3.5 w-3.5 text-gold-400/90" />
      <span className="min-w-0">
        <span className="block font-hud text-sm leading-none text-parchment-100">{value}</span>
        <span className="mt-0.5 block text-[8px] uppercase tracking-[0.16em] text-parchment-300/50">{label}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LoadoutTile — one equipment slot in the 2-col grid beside the        */
/* character. The remount key replays the glow-in whenever the REAL     */
/* equipped item changes (slot feedback → character changed); artwork   */
/* is the actual svgKey item art.                                       */
/* ------------------------------------------------------------------ */
function LoadoutTile({ slot, item, character }) {
  const status = slot.identity ? 'Identity' : item ? 'Equipped' : 'Empty';
  const itemName = slot.identity
    ? character.hairStyle?.replace(/_/g, ' ')
    : item?.name || 'No item equipped';
  const rarity = item ? RARITY_STYLES[item.rarity] || RARITY_STYLES.common : null;
  const itemKey = slot.identity ? 'identity' : item?.id || 'empty';

  return (
    <motion.div
      key={itemKey}
      initial={{ opacity: 0.35 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-md"
    >
      <Link
        to="/inventory"
        className={`group relative flex h-full flex-col rounded-md border p-2.5 transition-colors duration-150 hover:border-gold-500/70 ${
          item || slot.identity
            ? `border-dungeon-600/70 bg-dungeon-900/50 ${rarity ? rarity.border : ''}`
            : 'border-dashed border-dungeon-700/60 bg-dungeon-900/30'
        }`}
        style={item && rarity?.glow ? { boxShadow: '0 0 14px rgb(var(--c-glow-gold) / 0.14)' } : undefined}
        aria-label={`Open inventory to manage ${slot.label.toLowerCase()} equipment`}
      >
        <span className="flex items-center justify-between">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded border border-dungeon-600 bg-dungeon-850 transition-colors group-hover:border-gold-500/60 group-hover:text-gold-400 ${
              item ? rarity.text : 'text-parchment-300/60'
            }`}
          >
            <SlotIcon name={slot.icon} className="h-3.5 w-3.5" />
          </span>
          <span className="font-hud text-[8px] uppercase tracking-[0.14em] text-parchment-300/40">{status}</span>
        </span>

        <span className="mt-1 flex h-12 items-center justify-center">
          {item ? (
            <ItemArtwork
              category={item.category}
              svgKey={item.svgKey}
              gender={character.gender}
              physique={character.physique}
              className="h-12 w-16 transition-transform duration-150 group-hover:scale-110"
            />
          ) : (
            <span aria-hidden="true" className="h-8 w-8 rounded-sm border border-dungeon-700/50 bg-dungeon-900/40" />
          )}
        </span>

        <span className="font-hud text-[9px] uppercase tracking-[0.18em] text-parchment-300/55">{slot.label}</span>
        <span className="mt-0.5 truncate text-[11px] font-semibold capitalize leading-tight text-parchment-100">
          {itemName || '—'}
        </span>
        <span
          className={`text-[8px] font-bold uppercase tracking-[0.16em] ${
            item ? rarity.text : 'text-transparent'
          }`}
        >
          {item ? rarity.label : '·'}
        </span>
      </Link>
    </motion.div>
  );
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

export default function Character() {
  const character = useStore((s) => s.character);
  const user = useStore((s) => s.user);
  const updateGarmentColors = useStore((s) => s.updateGarmentColors);
  const levelUpInfo = useStore((s) => s.levelUpInfo);
  const clearLevelUp = useStore((s) => s.clearLevelUp);
  const [rotation, setRotation] = useState(0);

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
          <p className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">
            <span aria-hidden="true" className="flex flex-col gap-[2px]">
              <span className="h-[3px] w-[3px] bg-gold-400/80" />
              <span className="h-[3px] w-[3px] bg-gold-400/40" />
            </span>
            Your story. Your choices. Your growth.
          </p>
          <h1 className="page-title mt-1">Character</h1>
        </div>
      </header>

      {/* ---- hero band: dominant stage + reference-style info rail ---- */}
      <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.88fr)]">
        {/* LEFT: the character, larger than anything else on the page */}
        <CharacterStage
          character={character}
          equipped={equipped}
          level={character.level}
          rotation={rotation}
          motto="Small actions create epic lives."
          className="min-h-[520px] sm:min-h-[600px]"
        >
          {/* ◀ ROTATE CHARACTER ▶ — compact game controls under the platform */}
          <div className="relative z-10 flex items-center justify-center gap-3 border-t border-dungeon-600/40 bg-dungeon-950/45 px-4 py-2.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRotation((r) => Math.max(-45, r - 15))}
              aria-label="Rotate left"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dungeon-500 bg-dungeon-900 text-gold-400 transition-all hover:border-gold-400 hover:shadow-glow active:translate-y-px"
            >
              <SlotIcon name="chevronLeft" className="h-4 w-4" />
            </button>
            <span className="font-hud text-[10px] uppercase tracking-[0.3em] text-parchment-300/60">
              Rotate character
            </span>
            <button
              type="button"
              onClick={() => setRotation((r) => Math.min(45, r + 15))}
              aria-label="Rotate right"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dungeon-500 bg-dungeon-900 text-gold-400 transition-all hover:border-gold-400 hover:shadow-glow active:translate-y-px"
            >
              <SlotIcon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </CharacterStage>

        {/* RIGHT: identity → equipment → attributes, the reference rail */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* identity: shield LV + XP + tier/email + real stat chips */}
          <GlassPanel className="p-5" blur={16}>
            <PixelCorners size={11} />
            <div className="relative flex items-start gap-4">
              <LevelShield level={character.level} />
              <div className="min-w-0 flex-1">
                <p className="font-hud text-[11px] uppercase tracking-[0.2em] text-gold-400">
                  {levelTierLabel(character.level)}
                </p>
                <p className="truncate text-[11px] text-parchment-300/60">{user?.email || 'Adventurer'}</p>
                <div className="mt-2.5">
                  <XPBar level={character.level} current={character.currentXP} required={xpRequired} />
                </div>
              </div>
            </div>
            <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-dungeon-600/40 pt-4">
              <StatChip icon={CoinGlyph} value={character.gold.toLocaleString()} label="Gold" />
              <StatChip icon={FlameGlyph} value={character.currentStreak} label="Day streak" />
              <StatChip icon={LaurelGlyph} value={character.longestStreak ?? character.currentStreak} label="Best" />
            </div>
          </GlassPanel>

          {/* equipment: 2×3 tile grid, real svgKey artwork, rarity frames */}
          <GlassPanel className="flex-1 p-5" blur={14}>
            <PixelCorners size={10} />
            <SectionTitle
              icon="top"
              right={
                <Link to="/inventory" className="relative text-xs font-semibold text-gold-400 hover:underline">
                  Manage →
                </Link>
              }
            >
              Equipment
            </SectionTitle>
            <div className="relative grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-2">
              {EQUIPMENT_SLOTS.map((slot) => (
                <LoadoutTile
                  key={slot.key}
                  slot={slot}
                  item={slot.identity ? null : equipped[slot.key]}
                  character={character}
                />
              ))}
            </div>
          </GlassPanel>

          {/* attributes: icon + name + value + bar, quiet by design */}
          <GlassPanel className="p-5" blur={14}>
            <PixelCorners size={10} />
            <SectionTitle icon="character">Attributes</SectionTitle>
            <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <AttributeMiniBar attribute="intellect" value={character.intellect} />
              <AttributeMiniBar attribute="strength" value={character.strength} />
              <AttributeMiniBar attribute="discipline" value={character.discipline} />
              <AttributeMiniBar attribute="focus" value={character.focus} />
              <AttributeMiniBar attribute="energy" value={character.energy} />
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* ---- customization last in hierarchy ---- */}
      <GlassPanel className="p-5 sm:p-6" blur={14}>
        <PixelCorners size={10} />
        <SectionTitle icon="dye">Garment dye</SectionTitle>
        <div className="relative space-y-5">
          {DYE_SLOTS.filter((dye) => equipped[dye.key]).map((dye) => (
            <div
              key={dye.key}
              className="grid gap-3 border-b border-dungeon-600/35 pb-5 last:border-0 last:pb-0 md:grid-cols-[150px_1fr_1fr] md:items-center"
            >
              <div>
                <p className="font-hud text-[11px] uppercase tracking-[0.18em] text-parchment-200">{dye.label}</p>
                <p className="mt-1 truncate text-xs text-parchment-300/55">{equipped[dye.key]?.name}</p>
              </div>
              <div>
                <p className="mb-2 font-hud text-[10px] uppercase tracking-[0.16em] text-gold-500/75">Primary</p>
                <div className="flex flex-wrap gap-2">
                  {GARMENT_COLORS.map((color) => {
                    const selected = character[dye.primaryField] === color.value;
                    return (
                      <DyeSwatch
                        key={color.value}
                        selected={selected}
                        hex={color.hex}
                        label={`Primary: ${color.label}`}
                        onClick={() => handleDye(dye.key, 'primary', selected ? null : color.value)}
                      />
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 font-hud text-[10px] uppercase tracking-[0.16em] text-mystic-400/80">Accent</p>
                <div className="flex flex-wrap gap-2">
                  {GARMENT_COLORS.map((color) => {
                    const selected = character[dye.accentField] === color.value;
                    return (
                      <DyeSwatch
                        key={color.value}
                        selected={selected}
                        hex={color.hex}
                        label={`Accent: ${color.label}`}
                        onClick={() => handleDye(dye.key, 'accent', selected ? null : color.value)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {DYE_SLOTS.every((dye) => !equipped[dye.key]) && (
            <p className="relative py-4 text-sm text-parchment-300/60">
              Equip body, leg, or shoe gear from your inventory to use the dye bench.
            </p>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}

/* Tier word lives beside the import block to keep the component tree tidy;
   same thresholds the avatar/stage already use — no second system. */
function levelTierLabel(level) {
  if (level >= 50) return 'Mythic';
  if (level >= 25) return 'Elite';
  if (level >= 15) return 'Veteran';
  if (level >= 5) return 'Adventurer';
  return 'Novice';
}
