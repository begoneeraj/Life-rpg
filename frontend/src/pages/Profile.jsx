import { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import AttributeRadar from '../components/AttributeRadar';
import XPBar from '../components/XPBar';
import { Skeleton } from '../components/Skeleton';
import PortraitAvatar from '../components/character/PortraitAvatar';
import { PixelCorners } from '../components/character/characterUI';
import Icon from '../components/ui/icons';
import displayName from '../utils/displayName';

function xpRequiredForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

// Streak badges: real thresholds checked against the REAL longest streak.
// Icons come from the project's own icon family — no emoji.
const BADGES = [
  { threshold: 3, label: 'Streak Starter', icon: 'flame', caption: '3-day streak' },
  { threshold: 7, label: 'Week Warrior', icon: 'sword', caption: '7-day streak' },
  { threshold: 30, label: 'Monthly Legend', icon: 'xp', caption: '30-day streak' },
];

function UsernameField({ user }) {
  const setUsername = useStore((s) => s.setUsername);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isSaving) return;
    setIsSaving(true);
    try {
      await setUsername(trimmed);
      setIsEditing(false);
    } catch {
      // toasted by the store
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="mt-1 flex items-center gap-1.5">
        <input
          autoFocus
          className="input-field w-40 py-1 text-xs"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={20}
          placeholder="battletag"
        />
        <button type="submit" className="btn-game px-2 py-1 text-[10px]" disabled={isSaving}>
          {isSaving ? '…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(user?.username || '');
            setIsEditing(false);
          }}
          className="text-[10px] uppercase tracking-widest text-parchment-300/40 hover:text-parchment-300/70"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="mt-0.5 flex items-center gap-1.5 font-hud text-[10px] uppercase tracking-[0.18em] text-mystic-400/80 hover:text-mystic-300"
      title="Click to change your battle tag"
    >
      {user?.username ? `@${user.username}` : 'Set a username to add friends →'}
    </button>
  );
}

export default function Profile() {
  const user = useStore((s) => s.user);
  const character = useStore((s) => s.character);

  if (!character) {
    return (
      <div className="page-container space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const equipped = character.equippedItems || {};
  const itemsOwned = character.inventory?.length ?? 0;

  const stats = [
    { label: 'Gold', value: character.gold.toLocaleString(), icon: 'coin', accent: 'text-gold-400' },
    { label: 'Current Streak', value: character.currentStreak, icon: 'flame', accent: 'text-ember-400' },
    { label: 'Longest Streak', value: character.longestStreak, icon: 'xp', accent: 'text-xp-400' },
    { label: 'Items Owned', value: itemsOwned, icon: 'inventory', accent: 'text-mystic-400' },
  ];

  return (
    <div className="page-container space-y-6">
      {/* ---------------- page header ---------------- */}
      <header className="page-header">
        <div>
          <p className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">
            <span aria-hidden="true" className="flex flex-col gap-[2px]">
              <span className="h-[3px] w-[3px] bg-gold-400/80" />
              <span className="h-[3px] w-[3px] bg-gold-400/40" />
            </span>
            Adventurer profile
          </p>
          <h1 className="page-title mt-1">Profile</h1>
          <p className="page-subtitle">The legend of your journey so far.</p>
        </div>
        <Link to="/character" className="btn-secondary shrink-0">
          Open character sheet
        </Link>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)] xl:items-start">
        {/* ---------------- adventurer card ---------------- */}
        <section className="game-panel game-panel-gold hud-frame p-6">
          <PixelCorners size={11} />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Head portrait with a gold pixel-corner frame — the player icon,
                not the full-body figure (spec). Links to the full character. */}
            <Link
              to="/character"
              aria-label="View your character"
              className="mx-auto block h-36 w-36 shrink-0 sm:mx-0"
            >
              <PortraitAvatar
                frame="shield"
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
                className="h-full w-full"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <p className="font-hud text-[10px] uppercase tracking-[0.3em] text-gold-500/80">
                Level {character.level} Adventurer
              </p>
              <p className="mt-0.5 truncate font-display text-xl font-bold text-parchment-100">
                {displayName(user)}
              </p>
              <p className="truncate font-hud text-[10px] uppercase tracking-[0.18em] text-parchment-300/45">
                {user?.email}
              </p>
              <UsernameField user={user} />
              <div className="mt-3">
                <XPBar
                  level={character.level}
                  current={character.currentXP}
                  required={xpRequiredForLevel(character.level)}
                  size="lg"
                />
              </div>
            </div>
          </div>

          {/* real stat band */}
          <div className="relative mt-6 grid grid-cols-2 gap-2.5 border-t border-dungeon-600/40 pt-5 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-md border border-dungeon-600/60 bg-dungeon-900/50 px-3 py-2.5"
              >
                <Icon name={s.icon} className={`h-4 w-4 shrink-0 ${s.accent}`} />
                <span className="min-w-0">
                  <span className="block font-hud text-base leading-none text-parchment-100">{s.value}</span>
                  <span className="mt-1 block truncate text-[9px] uppercase tracking-[0.16em] text-parchment-300/50">
                    {s.label}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- attributes ---------------- */}
        <section className="game-panel p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            <Icon name="profile" className="h-4 w-4 text-gold-500/80" aria-hidden="true" /> Attributes
          </h2>
          <AttributeRadar character={character} />
        </section>
      </div>

      {/* ---------------- badges ---------------- */}
      <section className="game-panel p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
          <Icon name="armory" className="h-4 w-4 text-gold-500/80" aria-hidden="true" /> Badges
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {BADGES.map((b) => {
            const earned = character.longestStreak >= b.threshold;
            return (
              <li
                key={b.label}
                className={`flex items-center gap-3 rounded-md border p-3.5 transition-colors ${
                  earned
                    ? 'border-gold-600/50 bg-gold-500/5'
                    : 'border-dashed border-dungeon-700/70 bg-dungeon-900/40'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                    earned
                      ? 'border-gold-400/80 bg-dungeon-900 text-gold-300 shadow-glow'
                      : 'border-dungeon-600 bg-dungeon-900 text-parchment-300/30'
                  }`}
                >
                  <Icon name={earned ? b.icon : 'lock'} className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate font-display text-sm font-bold ${
                      earned ? 'text-parchment-100' : 'text-parchment-300/50'
                    }`}
                  >
                    {b.label}
                  </span>
                  <span className="block font-hud text-[9px] uppercase tracking-[0.16em] text-parchment-300/45">
                    {earned ? 'Earned' : b.caption}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
