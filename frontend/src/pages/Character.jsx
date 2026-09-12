import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import CharacterAvatar from '../components/character/CharacterAvatar';
import XPBar from '../components/XPBar';
import AttributeMiniBar from '../components/AttributeMiniBar';
import { Skeleton } from '../components/Skeleton';
import { GARMENT_COLORS } from '../components/character/constants';

const SLOTS = [
  { key: 'hair', label: 'Hair', icon: '💇' },
  { key: 'top', label: 'Top', icon: '👕' },
  { key: 'bottom', label: 'Bottom', icon: '👖' },
  { key: 'shoes', label: 'Shoes', icon: '👟' },
  { key: 'accessory', label: 'Accessory', icon: '💍' },
];

const DYE_SLOTS = [
  { key: 'top', label: 'Top', primaryField: 'topPrimaryColor', accentField: 'topAccentColor' },
  { key: 'bottom', label: 'Bottom', primaryField: 'bottomPrimaryColor', accentField: 'bottomAccentColor' },
  { key: 'shoes', label: 'Shoes', primaryField: 'shoesPrimaryColor', accentField: 'shoesAccentColor' },
];

function ColorSwatch({ selected, onClick, hex, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-pressed={selected}
      aria-label={label}
      className={`h-6 w-6 shrink-0 rounded-full border-2 transition-transform hover:scale-110 ${
        selected ? 'border-gold-400 shadow-glow' : 'border-dungeon-600'
      }`}
      style={{ background: hex }}
    />
  );
}

export default function Character() {
  const character = useStore((s) => s.character);
  const updateGarmentColors = useStore((s) => s.updateGarmentColors);
  const xpRequired = Math.round(100 * Math.pow(character?.level || 1, 1.5));

  if (!character) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const equipped = character.equippedItems || {};

  async function handleDye(slot, channel, colorValue) {
    const dye = DYE_SLOTS.find((d) => d.key === slot);
    const nextPrimary = channel === 'primary' ? colorValue : character[dye.primaryField] || null;
    const nextAccent = channel === 'accent' ? colorValue : character[dye.accentField] || null;
    try {
      await updateGarmentColors(slot, nextPrimary, nextAccent);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update that color.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-center font-display text-2xl font-bold text-gold-400 sm:text-3xl">
        CHARACTER
      </h1>

      <div className="parchment-card flex flex-col items-center gap-4 p-6">
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
          topPrimaryColor={character.topPrimaryColor}
          topAccentColor={character.topAccentColor}
          bottomPrimaryColor={character.bottomPrimaryColor}
          bottomAccentColor={character.bottomAccentColor}
          shoesPrimaryColor={character.shoesPrimaryColor}
          shoesAccentColor={character.shoesAccentColor}
          level={character.level}
          className="h-80 w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        />

        <div className="w-full max-w-xs">
          <XPBar level={character.level} current={character.currentXP} required={xpRequired} size="lg" />
        </div>

        <div className="grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-3">
          <AttributeMiniBar attribute="intellect" value={character.intellect} />
          <AttributeMiniBar attribute="strength" value={character.strength} />
          <AttributeMiniBar attribute="focus" value={character.focus} />
          <AttributeMiniBar attribute="discipline" value={character.discipline} />
          <AttributeMiniBar attribute="energy" value={character.energy} />
        </div>
      </div>

      <div className="parchment-card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
          Equipment
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SLOTS.map((slot) => {
            const item = slot.key === 'hair' ? null : equipped[slot.key];
            const label = slot.key === 'hair' ? character.hairStyle?.replace(/_/g, ' ') : item?.name;
            return (
              <Link
                key={slot.key}
                to="/inventory"
                className="flex flex-col items-center gap-1 rounded-md border border-dungeon-600 bg-dungeon-900/60 px-2 py-3 text-center transition-colors hover:border-mystic-500"
              >
                <span className="text-xl" aria-hidden="true">
                  {slot.icon}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-parchment-300/50">
                  {slot.label}
                </span>
                <span className="truncate text-[11px] font-semibold text-parchment-100">
                  {label || '—'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="parchment-card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
          Dye Garments
        </h2>
        <div className="space-y-4">
          {DYE_SLOTS.filter((dye) => equipped[dye.key]).map((dye) => (
            <div key={dye.key}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-parchment-300/60">
                {dye.label} · {equipped[dye.key]?.name}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {GARMENT_COLORS.map((c) => {
                    const selected = character[dye.primaryField] === c.value;
                    return (
                      <ColorSwatch
                        key={c.value}
                        selected={selected}
                        hex={c.hex}
                        label={`Primary: ${c.label}`}
                        onClick={() => handleDye(dye.key, 'primary', selected ? null : c.value)}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-parchment-300/40">Accent</span>
                <div className="flex flex-wrap gap-1.5">
                  {GARMENT_COLORS.map((c) => {
                    const selected = character[dye.accentField] === c.value;
                    return (
                      <ColorSwatch
                        key={c.value}
                        selected={selected}
                        hex={c.hex}
                        label={`Accent: ${c.label}`}
                        onClick={() => handleDye(dye.key, 'accent', selected ? null : c.value)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
          {DYE_SLOTS.every((dye) => !equipped[dye.key]) && (
            <p className="text-sm text-parchment-300/60">Equip a top, bottom, or shoes to dye them.</p>
          )}
        </div>
      </div>
    </div>
  );
}
