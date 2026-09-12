import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import XPBar from '../components/XPBar';
import StreakTracker from '../components/StreakTracker';
import AttributeMiniBar from '../components/AttributeMiniBar';
import CharacterAvatar from '../components/character/CharacterAvatar';
import LevelUpModal from '../components/LevelUpModal';
import Icon from '../components/ui/icons';
import { Skeleton } from '../components/Skeleton';

// Mirrors backend's xpRequiredForLevel(n) = round(100 * n^1.5) so the bar
// renders instantly without waiting on a round trip to /api/character.
function xpRequiredForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

const DIFFICULTY_META = {
  easy: { label: 'Easy', color: 'text-xp-400 border-xp-600/40' },
  medium: { label: 'Medium', color: 'text-gold-400 border-gold-600/40' },
  hard: { label: 'Hard', color: 'text-ember-400 border-ember-600/40' },
};

const CATEGORY_ICON = {
  coding: 'cat_coding',
  study: 'cat_study',
  gym: 'cat_gym',
  fitness: 'cat_gym',
  running: 'cat_running',
  meditation: 'cat_meditation',
  deep_work: 'cat_deep_work',
  chores: 'cat_chores',
  healthy_habits: 'cat_healthy',
  other: 'quests',
};

export default function Guild() {
  const user = useStore((s) => s.user);
  const character = useStore((s) => s.character);
  const quests = useStore((s) => s.quests);
  const questsStatus = useStore((s) => s.questsStatus);
  const loadQuests = useStore((s) => s.loadQuests);
  const completeQuest = useStore((s) => s.completeQuest);
  const levelUpInfo = useStore((s) => s.levelUpInfo);
  const clearLevelUp = useStore((s) => s.clearLevelUp);

  // Transient real-reward flash on the row that was just completed.
  const [flash, setFlash] = useState(null); // { id, xp, gold }

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const pendingQuests = quests.filter((q) => q.status === 'pending');
  // "Completed today" = completed quests whose `completedAt` timestamp falls
  // on the user's current local calendar day (server sets completedAt).
  const todayKey = new Date().toDateString();
  const completedToday = quests.filter(
    (q) =>
      q.status === 'completed' &&
      q.completedAt &&
      new Date(q.completedAt).toDateString() === todayKey
  ).length;

  async function handleQuickComplete(id) {
    try {
      const data = await completeQuest(id);
      if (data) {
        setFlash({ id, xp: data.xpGained, gold: data.goldGained });
        setTimeout(() => setFlash(null), 2200);
      }
    } catch {
      // store already rolled back optimistic state + toasted the error
    }
  }

  if (!character) {
    return (
      <div className="page-container space-y-6">
        <Skeleton className="h-44 w-full" />
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const equipped = character.equippedItems || {};
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="page-container space-y-6">
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />

      {/* ---------------- PLAYER HERO ---------------- */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="game-panel game-panel-gold hud-frame p-6"
      >
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          {character && (
            <Link
              to="/character"
              aria-label="View your character"
              className="mx-auto h-32 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-gold-500/60 bg-dungeon-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-glow lg:mx-0"
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

          <div className="min-w-0 space-y-3">
            <div>
              <p className="font-hud text-[10px] uppercase tracking-[0.3em] text-parchment-300/50">
                Today · {today}
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-extrabold text-parchment-100 lg:text-3xl">
                Welcome back, adventurer
              </h1>
              <p className="mt-0.5 truncate text-sm text-parchment-300/60">{user?.email}</p>
            </div>
            <XPBar
              level={character.level}
              current={character.currentXP}
              required={xpRequiredForLevel(character.level)}
              size="lg"
            />
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="hud-badge border-gold-600/40 bg-dungeon-900/80 text-gold-400"
                aria-label={`${character.gold} gold`}
              >
                <Icon name="coin" className="h-3 w-3" />
                <span className="text-reward">{character.gold.toLocaleString()}</span> Gold
              </span>
              <span
                className="hud-badge border-xp-600/40 bg-dungeon-900/80 text-xp-400"
                aria-label={`${completedToday} quests completed today`}
              >
                <Icon name="check" className="h-3 w-3" />
                {completedToday} completed today
              </span>
              <span
                className="hud-badge border-ember-600/40 bg-dungeon-900/80 text-ember-400"
                aria-label={`${character.currentStreak} day streak`}
              >
                <Icon name="flame" className="h-3 w-3" />
                {character.currentStreak} day streak
              </span>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <StreakTracker
              currentStreak={character.currentStreak}
              longestStreak={character.longestStreak}
            />
          </div>
        </div>
      </motion.section>

      {/* ---------------- TODAY'S QUESTS + PLAYER STATS ---------------- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="game-panel min-w-0 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              <Icon name="quests" className="h-4 w-4 text-gold-500/80" /> Today&apos;s Quests
            </h2>
            <Link to="/quests" className="flex items-center gap-1 text-xs font-semibold text-mystic-400 hover:underline">
              Quest Board <Icon name="chevron" className="h-3 w-3" />
            </Link>
          </div>

          {questsStatus === 'loading' && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {questsStatus === 'ready' && pendingQuests.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Icon name="quests" className="h-8 w-8 text-parchment-300/30" aria-hidden="true" />
              <p className="text-sm text-parchment-300/60">
                Quest board empty. Your next adventure awaits.
              </p>
              <Link to="/quests" className="btn-game">
                Create Quest
              </Link>
            </div>
          )}

          {questsStatus === 'ready' && pendingQuests.length > 0 && (
            <ul className="space-y-2">
              {pendingQuests.slice(0, 5).map((q) => {
                const difficulty = DIFFICULTY_META[q.difficulty] || DIFFICULTY_META.easy;
                return (
                  <li
                    key={q.id}
                    className="relative flex items-center gap-3 rounded-md border border-dungeon-700/70 bg-dungeon-900/60 px-3 py-2.5"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-dungeon-600 bg-dungeon-950/60 text-parchment-200/70"
                    >
                      <Icon name={CATEGORY_ICON[q.category] || 'quests'} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-parchment-100">{q.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-parchment-300/50">
                        <span className={`tag-pill font-semibold ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                        {q.estimatedMinutes && <span>~{q.estimatedMinutes} min</span>}
                      </div>
                    </div>
                    {flash?.id === q.id && (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: -2 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-2 right-3 font-hud text-xs"
                        aria-live="polite"
                      >
                        <span className="text-reward">+{flash.xp} XP</span>{' '}
                        <span className="text-gold-400">+{flash.gold} 🪙</span>
                      </motion.span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleQuickComplete(q.id)}
                      className="btn-game shrink-0 px-2.5 py-1.5 text-[10px]"
                      aria-label={`Complete quest "${q.title}"`}
                    >
                      Done
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="game-panel h-fit min-w-0 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            <Icon name="profile" className="h-4 w-4 text-gold-500/80" /> Player Stats
          </h2>
          <div className="space-y-4">
            <AttributeMiniBar attribute="intellect" value={character.intellect} />
            <AttributeMiniBar attribute="strength" value={character.strength} />
            <AttributeMiniBar attribute="discipline" value={character.discipline} />
            <AttributeMiniBar attribute="focus" value={character.focus} />
            <AttributeMiniBar attribute="energy" value={character.energy} />
          </div>
        </aside>
      </div>
    </div>
  );
}
