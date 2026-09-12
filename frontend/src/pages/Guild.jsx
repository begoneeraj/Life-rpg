import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import XPBar from '../components/XPBar';
import StreakTracker from '../components/StreakTracker';
import AttributeMiniBar from '../components/AttributeMiniBar';
import CharacterAvatar from '../components/character/CharacterAvatar';
import LevelUpModal from '../components/LevelUpModal';
import { Skeleton } from '../components/Skeleton';

// Mirrors backend's xpRequiredForLevel(n) = round(100 * n^1.5) so the bar
// renders instantly without waiting on a round trip to /api/character.
function xpRequiredForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

export default function Guild() {
  const user = useStore((s) => s.user);
  const character = useStore((s) => s.character);
  const quests = useStore((s) => s.quests);
  const questsStatus = useStore((s) => s.questsStatus);
  const loadQuests = useStore((s) => s.loadQuests);
  const levelUpInfo = useStore((s) => s.levelUpInfo);
  const clearLevelUp = useStore((s) => s.clearLevelUp);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const pendingQuests = quests.filter((q) => q.status === 'pending');
  // "Completed today" = completed quests whose `completedAt` timestamp (set
  // by the server on completion, see questController.completeQuest) falls on
  // the user's current local calendar day. Older completions, and completed
  // quests with a missing timestamp, must not count.
  const todayKey = new Date().toDateString();
  const completedToday = quests.filter(
    (q) =>
      q.status === 'completed' &&
      q.completedAt &&
      new Date(q.completedAt).toDateString() === todayKey
  ).length;

  if (!character) {
    return (
      <div className="page-container space-y-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      {/* App-wide level-up celebration: fires here too if a quest was completed on another surface. */}
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        {character && (
          <Link
            to="/character"
            aria-label="View your character"
            className="h-16 w-12 shrink-0 overflow-hidden rounded-lg border-2 border-gold-500/60 bg-dungeon-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-glow"
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
              equippedTop={character.equippedItems?.top}
              equippedBottom={character.equippedItems?.bottom}
              equippedShoes={character.equippedItems?.shoes}
              equippedAccessory={character.equippedItems?.accessory}
              equippedSpecial={character.equippedItems?.special}
              topPrimaryColor={character.topPrimaryColor}
              topAccentColor={character.topAccentColor}
              bottomPrimaryColor={character.bottomPrimaryColor}
              bottomAccentColor={character.bottomAccentColor}
              shoesPrimaryColor={character.shoesPrimaryColor}
              shoesAccentColor={character.shoesAccentColor}
              level={character.level}
              idle={false}
              className="h-full w-full"
            />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">
            Welcome back, adventurer
          </h1>
          <p className="mt-1 truncate text-sm text-parchment-300/70">{user?.email}</p>
        </div>
      </motion.div>

      <div className="game-panel game-panel-gold hud-frame grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <XPBar
            level={character.level}
            current={character.currentXP}
            required={xpRequiredForLevel(character.level)}
            size="lg"
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="hud-badge border-gold-600/40 bg-dungeon-800 px-3 py-1 font-hud uppercase text-gold-400">
              🪙 {character.gold.toLocaleString()} Gold
            </span>
            <span className="hud-badge border-mystic-600/40 bg-dungeon-800 px-3 py-1 font-hud uppercase text-mystic-400">
              {completedToday} quest{completedToday === 1 ? '' : 's'} completed
            </span>
          </div>
        </div>
        <StreakTracker
          currentStreak={character.currentStreak}
          longestStreak={character.longestStreak}
        />
      </div>

      <div className="game-panel p-6">
        <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
          Attributes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AttributeMiniBar attribute="intellect" value={character.intellect} />
          <AttributeMiniBar attribute="strength" value={character.strength} />
          <AttributeMiniBar attribute="discipline" value={character.discipline} />
          <AttributeMiniBar attribute="focus" value={character.focus} />
          <AttributeMiniBar attribute="energy" value={character.energy} />
        </div>
      </div>

      <div className="game-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            Active Quests
          </h2>
          <Link to="/quests" className="text-xs font-semibold text-mystic-400 hover:underline">
            View all →
          </Link>
        </div>

        {questsStatus === 'loading' && (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {questsStatus === 'ready' && pendingQuests.length === 0 && (
          <p className="py-6 text-center text-sm text-parchment-300/60">
            No active quests. Head to the Quests page to add one.
          </p>
        )}

        {questsStatus === 'ready' && pendingQuests.length > 0 && (
          <ul className="space-y-2">
            {pendingQuests.slice(0, 4).map((q) => (
              <li
                key={q.id}
                className="flex items-center justify-between rounded-md border border-dungeon-700 bg-dungeon-900/60 px-3 py-2 text-sm"
              >
                <span className="truncate text-parchment-100">{q.title}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-widest text-parchment-300/50">
                  {q.category.replace(/_/g, ' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
