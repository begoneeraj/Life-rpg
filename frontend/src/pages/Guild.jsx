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
const DIFFICULTY_RANK = { hard: 2, medium: 1, easy: 0 };

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

  // Daily Focus = today's real Weekly Routine tasks (same store actions the
  // Quest log's routine panel uses). Nothing invented: an empty routine
  // renders an intentional empty state.
  const weeklyTasks = useStore((s) => s.weeklyTasks);
  const weeklyTasksStatus = useStore((s) => s.weeklyTasksStatus);
  const todayDayOfWeek = useStore((s) => s.weeklyTasksTodayDayOfWeek);
  const loadWeeklyTasks = useStore((s) => s.loadWeeklyTasks);
  const toggleWeeklyTaskToday = useStore((s) => s.toggleWeeklyTaskToday);

  // Transient real-reward flash on the quest that was just completed.
  const [flash, setFlash] = useState(null); // { id, xp, gold }

  useEffect(() => {
    loadQuests();
    loadWeeklyTasks();
  }, [loadQuests, loadWeeklyTasks]);

  const todaysRoutineTasks = weeklyTasks.filter((t) => t.dayOfWeek === todayDayOfWeek);

  const pendingQuests = quests.filter((q) => q.status === 'pending');
  // Featured "main quest" = the hardest active quest on the board (the one
  // most worth a player's session); everything else becomes a side quest.
  // Pure presentation ordering — the store/API list is untouched.
  const ranked = [...pendingQuests].sort(
    (a, b) =>
      (DIFFICULTY_RANK[b.difficulty] ?? 0) - (DIFFICULTY_RANK[a.difficulty] ?? 0)
  );
  const mainQuest = ranked[0];
  const sideQuests = ranked.slice(1, 5);

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
        <Skeleton className="h-16 w-72" />
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

      {/* ---------------- GREETING (page-level, not a card) ---------------- */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <p className="flex items-center gap-2 font-hud text-[10px] uppercase tracking-[0.35em] text-gold-500/80">
            <Icon name="sword" className="h-3 w-3" aria-hidden="true" />
            Guild · {today}
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-parchment-100 lg:text-4xl">
            Welcome back{user?.email ? '' : ', adventurer'}
          </h1>
          <p className="mt-0.5 truncate text-sm text-parchment-300/60">
            The board holds {pendingQuests.length} quest{pendingQuests.length === 1 ? '' : 's'} for you
            {completedToday > 0 ? ` — ${completedToday} already done today.` : '.'}
          </p>
        </div>
        <span
          className="hud-badge hud-badge-sm border-dungeon-600/70 bg-dungeon-900/70 text-parchment-300/70"
          aria-label={`${pendingQuests.length} active, ${completedToday} done today`}
        >
          <Icon name="sword" className="h-3 w-3 text-ember-400" aria-hidden="true" />
          {pendingQuests.length} active · {completedToday} done today
        </span>
      </motion.header>

      {/* ---------------- ACTIVE ADVENTURE (player hero) ---------------- */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.04 }}
        className="game-panel game-panel-gold hud-frame p-6"
      >
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          {character && (
            <Link
              to="/character"
              aria-label="View your character"
              className="mx-auto h-36 w-28 shrink-0 overflow-hidden rounded-lg border-2 border-gold-500/60 bg-dungeon-900 shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-400 lg:mx-0"
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
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-gold-600/60" aria-hidden="true" />
              <p className="font-hud text-[10px] uppercase tracking-[0.3em] text-parchment-300/60">
                Active Adventure
              </p>
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
                <Icon name="coin" className="h-3 w-3" aria-hidden="true" />
                <span className="text-reward">{character.gold.toLocaleString()}</span> Gold
              </span>
              <span
                className="hud-badge border-ember-600/40 bg-dungeon-900/80 text-ember-400"
                aria-label={`${character.currentStreak} day streak`}
              >
                <Icon name="flame" className="h-3 w-3" aria-hidden="true" />
                {character.currentStreak} day streak
              </span>
              <span
                className="hud-badge border-xp-600/40 bg-dungeon-900/80 text-xp-400"
                aria-label={`${completedToday} quests completed today`}
              >
                <Icon name="check" className="h-3 w-3" aria-hidden="true" />
                {completedToday} done today
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

      {/* ---------------- DAILY FOCUS (today's real routine) ---------------- */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.06 }}
        className="game-panel hud-frame p-5 sm:p-6"
        aria-label="Daily focus"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
            <Icon name="routine" className="h-4 w-4 text-mystic-400/80" aria-hidden="true" /> Daily
            Focus
          </h2>
          <Link
            to="/routine"
            className="text-[11px] font-semibold uppercase tracking-widest text-mystic-400 hover:text-mystic-300"
          >
            Manage routine →
          </Link>
        </div>

        {weeklyTasksStatus === 'loading' && (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {weeklyTasksStatus === 'ready' && todaysRoutineTasks.length === 0 && (
          <p className="mt-3 text-sm text-parchment-300/55">
            Nothing scheduled for today.{' '}
            <Link to="/routine" className="underline hover:text-mystic-300">
              Add a routine task
            </Link>{' '}
            and it will appear here each morning.
          </p>
        )}

        {weeklyTasksStatus === 'ready' && todaysRoutineTasks.length > 0 && (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {todaysRoutineTasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
                  task.completedToday
                    ? 'border-xp-600/40 bg-xp-500/5'
                    : 'border-dungeon-700/70 bg-dungeon-900/60 hover:border-dungeon-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleWeeklyTaskToday(task.id)}
                  role="checkbox"
                  aria-checked={Boolean(task.completedToday)}
                  aria-label={`Mark "${task.title}" ${task.completedToday ? 'not' : ''}done for today`}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-all ${
                    task.completedToday
                      ? 'border-xp-400 bg-xp-500/20 text-xp-300'
                      : 'border-dungeon-500 bg-dungeon-950 text-transparent hover:border-gold-400'
                  }`}
                >
                  <Icon name="check" className="h-3.5 w-3.5" />
                </button>
                <span
                  className={`min-w-0 flex-1 truncate text-sm font-semibold ${
                    task.completedToday ? 'text-parchment-300/50 line-through decoration-xp-500' : 'text-parchment-100'
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`shrink-0 font-hud text-[9px] uppercase tracking-[0.18em] ${
                    task.completedToday ? 'text-xp-400' : 'text-parchment-300/35'
                  }`}
                >
                  {task.completedToday ? 'Done' : 'Today'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </motion.section>

      {/* ---------------- MAIN QUEST + SIDE QUESTS ---------------- */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              <Icon name="quests" className="h-4 w-4 text-gold-500/80" aria-hidden="true" /> Active
              Quests
            </h2>
            <Link
              to="/quests"
              className="flex items-center gap-1 text-xs font-semibold text-mystic-400 hover:underline"
            >
              Quest Board <Icon name="chevron" className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          {questsStatus === 'loading' && (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {questsStatus === 'error' && (
            <div className="game-panel p-6 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-ember-400">
                Quest data unavailable
              </p>
              <p className="mt-1 text-sm text-parchment-300/60">
                Unable to load quests. Try refreshing.
              </p>
            </div>
          )}

          {questsStatus === 'ready' && pendingQuests.length === 0 && (
            <div className="game-panel flex flex-col items-center gap-3 p-10 text-center">
              <Icon name="quests" className="h-9 w-9 text-parchment-300/25" aria-hidden="true" />
              <p className="font-display text-base font-bold text-parchment-100">
                No active quests
              </p>
              <p className="text-sm text-parchment-300/60">
                Your board is clear. Forge your next adventure.
              </p>
              <Link to="/quests" className="btn-game mt-1">
                Accept New Quest
              </Link>
            </div>
          )}

          {questsStatus === 'ready' && pendingQuests.length > 0 && (
            <>
              {/* ---- FEATURED MAIN QUEST ---- */}
              <motion.article
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="game-panel game-panel-gold relative overflow-hidden p-5"
              >
                {/* pixel corner brackets */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-gold-500/70"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-gold-500/70"
                />

                <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                  <span
                    aria-hidden="true"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-gold-600/50 bg-dungeon-950/70 shadow-glow"
                  >
                    <Icon
                      name={CATEGORY_ICON[mainQuest.category] || 'quests'}
                      className="h-7 w-7 text-gold-300"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-hud text-[9px] uppercase tracking-[0.3em] text-gold-500/80">
                      Main Quest
                    </p>
                    <h3 className="truncate font-display text-xl font-bold text-parchment-100">
                      {mainQuest.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-parchment-300/60">
                      <span className="capitalize">{mainQuest.category.replace(/_/g, ' ')}</span>
                      <span
                        className={`tag-pill font-semibold ${
                          (DIFFICULTY_META[mainQuest.difficulty] || DIFFICULTY_META.easy).color
                        }`}
                      >
                        {(DIFFICULTY_META[mainQuest.difficulty] || DIFFICULTY_META.easy).label}
                      </span>
                      {mainQuest.estimatedMinutes && (
                        <span className="tag-pill border-mystic-600/40 bg-mystic-500/10 font-semibold text-mystic-400">
                          ~{mainQuest.estimatedMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative ml-auto shrink-0">
                    {flash?.id === mainQuest.id && (
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: -4 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-1 right-0 whitespace-nowrap font-hud text-xs"
                        aria-live="polite"
                      >
                        <span className="text-reward">+{flash.xp} XP</span>{' '}
                        <span className="flex items-center gap-0.5 text-gold-400">
                          <Icon name="coin" className="h-3 w-3" aria-hidden="true" />+
                          {flash.gold}
                        </span>
                      </motion.span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleQuickComplete(mainQuest.id)}
                      className="btn-game px-5 py-2.5"
                      aria-label={`Complete quest "${mainQuest.title}"`}
                    >
                      Complete Quest
                    </button>
                  </div>
                </div>
              </motion.article>

              {/* ---- SIDE QUESTS ---- */}
              {sideQuests.length > 0 && (
                <ul className="space-y-2">
                  {sideQuests.map((q) => {
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
                          <p className="truncate text-sm font-semibold text-parchment-100">
                            {q.title}
                          </p>
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
                            <span className="flex items-center gap-0.5 text-gold-400">
                              <Icon name="coin" className="h-3 w-3" aria-hidden="true" />+
                              {flash.gold}
                            </span>
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
            </>
          )}
        </section>

        {/* ---------------- ATTRIBUTES + BOARD PROGRESS ---------------- */}
        <aside className="min-w-0 space-y-6">
          <div className="game-panel h-fit p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              <Icon name="profile" className="h-4 w-4 text-gold-500/80" aria-hidden="true" />{' '}
              Attributes
            </h2>
            <div className="space-y-4">
              <AttributeMiniBar attribute="intellect" value={character.intellect} />
              <AttributeMiniBar attribute="strength" value={character.strength} />
              <AttributeMiniBar attribute="discipline" value={character.discipline} />
              <AttributeMiniBar attribute="focus" value={character.focus} />
              <AttributeMiniBar attribute="energy" value={character.energy} />
            </div>
          </div>

          <div className="game-panel p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-widest text-parchment-300/70">
              <Icon name="check" className="h-4 w-4 text-xp-400" aria-hidden="true" /> On the Board
              Today
            </h2>
            <p className="font-display text-3xl font-extrabold text-parchment-100">
              {completedToday}
              <span className="mx-1 text-parchment-300/40">/</span>
              <span className="text-parchment-300/70">{completedToday + pendingQuests.length}</span>
              <span className="ml-2 font-hud text-[10px] font-semibold uppercase tracking-[0.25em] text-parchment-300/50">
                quests
              </span>
            </p>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-dungeon-950/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={completedToday + pendingQuests.length}
              aria-valuenow={completedToday}
              aria-label="Quests completed today"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-xp-600 to-xp-400 transition-[width] duration-500"
                style={{
                  width: `${
                    completedToday + pendingQuests.length > 0
                      ? Math.round(
                          (completedToday / (completedToday + pendingQuests.length)) * 100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-parchment-300/50">
              Clear the board to grow your streak.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
