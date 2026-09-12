import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import QuestCard from '../components/QuestCard';
import { QuestCardSkeleton } from '../components/Skeleton';
import LevelUpModal from '../components/LevelUpModal';
import QuestAssessmentModal from '../components/QuestAssessmentModal';
import useQuestAssessment from '../hooks/useQuestAssessment';
import Icon, { CATEGORY_ICON } from '../components/ui/icons';

const CATEGORY_LABEL = {
  coding: 'Coding',
  study: 'Study',
  gym: 'Gym',
  fitness: 'Fitness',
  running: 'Running',
  meditation: 'Meditation',
  deep_work: 'Deep Work',
  chores: 'Chores',
  healthy_habits: 'Healthy Habits',
  other: 'Other',
};

const FILTERS = [
  { value: 'all', label: 'All', icon: 'quests' },
  { value: 'pending', label: 'Active', icon: 'sword' },
  { value: 'completed', label: 'Completed', icon: 'check' },
];

// Featured-quest ranking + presentation metadata (same values as QuestCard).
const DIFFICULTY_META = {
  easy: { label: 'Easy', color: 'text-xp-400 border-xp-600/40' },
  medium: { label: 'Medium', color: 'text-gold-400 border-gold-600/40' },
  hard: { label: 'Hard', color: 'text-ember-400 border-ember-600/40' },
};
const DIFFICULTY_RANK = { hard: 2, medium: 1, easy: 0 };
// Deterministic category → glyph mapping lives in ui/icons.jsx (shared with
// QuestCard) so every quest renders the same sigil for the same category.

/**
 * Quests — the QUEST LOG.
 *
 * Creating a quest is DIRECT: the player enters a title, picks category,
 * difficulty, and time, and the quest is forged immediately ("Forge a Quest").
 * An optional "Refine with AI" step (useQuestAssessment + QuestAssessmentModal)
 * can fill those same fields from a short Q&A — it's offered, never required.
 * The former "Start Assessment" gate is gone. XP remains a non-linear
 * function of estimatedMinutes (see backend xpEngine.xpForMinutes).
 */
export default function Quests() {
  const quests = useStore((s) => s.quests);
  const questsStatus = useStore((s) => s.questsStatus);
  const loadQuests = useStore((s) => s.loadQuests);
  const addQuest = useStore((s) => s.addQuest);
  const completeQuest = useStore((s) => s.completeQuest);
  const removeQuest = useStore((s) => s.removeQuest);
  const levelUpInfo = useStore((s) => s.levelUpInfo);
  const clearLevelUp = useStore((s) => s.clearLevelUp);

  const weeklyTasks = useStore((s) => s.weeklyTasks);
  const weeklyTasksStatus = useStore((s) => s.weeklyTasksStatus);
  const todayDayOfWeek = useStore((s) => s.weeklyTasksTodayDayOfWeek);
  const loadWeeklyTasks = useStore((s) => s.loadWeeklyTasks);
  const toggleWeeklyTaskToday = useStore((s) => s.toggleWeeklyTaskToday);

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [assessmentOpen, setAssessmentOpen] = useState(false); // optional AI refine step
  const assessmentState = useQuestAssessment();
  const [draft, setDraft] = useState(null); // { category, difficulty, estimatedMinutes }
  const [creating, setCreating] = useState(false);
  // Transient real-reward flash for the featured main quest completion.
  const [flash, setFlash] = useState(null); // { xp, gold }

  useEffect(() => {
    loadQuests();
    loadWeeklyTasks();
  }, [loadQuests, loadWeeklyTasks]);

  const todaysRoutineTasks = weeklyTasks.filter((t) => t.dayOfWeek === todayDayOfWeek);

  /**
   * Direct quest creation: title + the player's own category/difficulty/minutes
   * picks go straight to the backend (same createQuest contract the AI flow
   * feeds). "Refine with AI" opens the same assessment Q&A as an optional
   * step that fills these fields — creation itself never requires it.
   */
  async function handleCreateQuest(e) {
    e.preventDefault();
    if (creating) return;
    if (!title.trim()) {
      setTitleError('Give your quest a name before forging it.');
      return;
    }
    if (!draft) {
      setTitleError('Choose a category and difficulty for your quest.');
      return;
    }
    setTitleError('');
    setCreating(true);
    try {
      await addQuest(title.trim(), draft.category, draft.difficulty, draft.estimatedMinutes);
      setTitle('');
      setDraft(null);
      toast.success(
        `Quest forged — ${CATEGORY_LABEL[draft.category] || draft.category} · ${draft.difficulty} · ~${draft.estimatedMinutes} min`
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not forge quest. Try again.');
    } finally {
      setCreating(false);
    }
  }

  /** Optional AI refine: same assessment flow as before, prefilled from the draft. */
  async function handleAssessmentComplete(evaluation) {
    setDraft({
      category: evaluation.category,
      difficulty: evaluation.difficulty,
      estimatedMinutes: evaluation.estimated_minutes,
    });
    setAssessmentOpen(false);
    assessmentState.reset();
    toast.success(
      `AI refined your quest — ${CATEGORY_LABEL[evaluation.category] || evaluation.category} · ${evaluation.difficulty} · ~${evaluation.estimated_minutes} min`
    );
  }

  async function handleComplete(id) {
    try {
      return await completeQuest(id);
    } catch {
      // store already rolled back optimistic state + toasted the error
    }
  }

  async function handleFeaturedComplete(id) {
    try {
      const data = await completeQuest(id);
      if (data) {
        setFlash({ xp: data.xpGained, gold: data.goldGained });
        setTimeout(() => setFlash(null), 2200);
      }
    } catch {
      // store already rolled back optimistic state + toasted the error
    }
  }

  const visibleQuests = quests.filter((q) => filter === 'all' || q.status === filter);
  const pendingQuests = quests.filter((q) => q.status === 'pending');
  // Featured "main quest" = the hardest active quest on the board; it gets
  // its own spotlight panel, so it's excluded from the row list below (when
  // the current filter would show it). Pure presentation ordering only.
  const mainQuest = pendingQuests.length
    ? [...pendingQuests].sort(
        (a, b) =>
          (DIFFICULTY_RANK[b.difficulty] ?? 0) - (DIFFICULTY_RANK[a.difficulty] ?? 0)
      )[0]
    : null;
  const featuredVisible = mainQuest && filter !== 'completed';
  const listQuests = featuredVisible
    ? visibleQuests.filter((q) => q.id !== mainQuest.id)
    : visibleQuests;
  return (
    <div className="page-container quest-log space-y-5">
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />
      <QuestAssessmentModal
        assessment={assessmentState}
        open={assessmentOpen}
        onComplete={handleAssessmentComplete}
        onCancel={() => {
          setAssessmentOpen(false);
          assessmentState.reset();
        }}
      />

      {/* ---------------- Quest board header ---------------- */}
      <div className="quest-log-heading">
        <span aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">
          Quest Log
          <span className="sr-only"> — your current adventures</span>
        </h1>
      </div>

      {/* ---------------- Today's routine (linked from Weekly Routine) ---------------- */}
      <div className="quest-console hud-frame space-y-2.5 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-parchment-300/70">
            <Icon name="routine" className="h-4 w-4 text-mystic-400/80" aria-hidden="true" />
            Today&apos;s Routine
          </h2>
          <Link
            to="/routine"
            className="text-[11px] font-semibold uppercase tracking-widest text-mystic-400 hover:text-mystic-300"
          >
            Manage routine →
          </Link>
        </div>

        {weeklyTasksStatus === 'loading' && (
          <p className="text-sm text-parchment-300/50">Loading today&apos;s routine…</p>
        )}

        {weeklyTasksStatus === 'ready' && todaysRoutineTasks.length === 0 && (
          <p className="text-sm text-parchment-300/50">
            Nothing scheduled for today. <Link to="/routine" className="underline hover:text-mystic-300">Add a routine task</Link>.
          </p>
        )}

        {weeklyTasksStatus === 'ready' && todaysRoutineTasks.length > 0 && (
          <ul className="space-y-1.5">
            {todaysRoutineTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-2.5 rounded-md border border-dungeon-700 bg-dungeon-900/60 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={Boolean(task.completedToday)}
                  onChange={() => toggleWeeklyTaskToday(task.id)}
                  className="h-4 w-4 shrink-0 accent-gold-500"
                  aria-label={`Mark "${task.title}" done for today`}
                />
                <span
                  className={`min-w-0 flex-1 truncate text-sm text-parchment-100 ${
                    task.completedToday ? 'line-through decoration-xp-500 text-parchment-300/50' : ''
                  }`}
                >
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---------------- Forge a new quest (direct creation) ---------------- */}
      <form onSubmit={handleCreateQuest} noValidate className="quest-console hud-frame space-y-3 p-4 sm:p-5">
        <div>
          <label htmlFor="title" className="label-text">
            Forge a New Quest
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="title"
              className="input-field"
              placeholder="e.g. learn hashtables"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              maxLength={140}
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'title-error' : undefined}
            />
            <button type="submit" disabled={creating} className="btn-primary shrink-0 sm:w-auto disabled:cursor-not-allowed disabled:opacity-40">
              {creating ? 'Forging…' : '+ Forge Quest'}
            </button>
          </div>
        </div>

        {/* category / difficulty / time — the real createQuest contract fields */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="quest-category" className="label-text text-[10px] uppercase tracking-widest">
              Category
            </label>
            <select
              id="quest-category"
              className="input-field mt-1"
              value={draft?.category ?? ''}
              onChange={(e) => {
                if (titleError) setTitleError('');
                const category = e.target.value || undefined;
                setDraft((d) => (category ? { ...(d || {}), category } : null));
              }}
            >
              <option value="">Choose…</option>
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quest-difficulty" className="label-text text-[10px] uppercase tracking-widest">
              Difficulty
            </label>
            <select
              id="quest-difficulty"
              className="input-field mt-1"
              value={draft?.difficulty ?? ''}
              onChange={(e) => {
                if (titleError) setTitleError('');
                const difficulty = e.target.value || undefined;
                setDraft((d) => (difficulty ? { ...(d || {}), difficulty } : null));
              }}
            >
              <option value="">Choose…</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="quest-minutes" className="label-text text-[10px] uppercase tracking-widest">
              Time
            </label>
            <select
              id="quest-minutes"
              className="input-field mt-1"
              value={draft?.estimatedMinutes ?? ''}
              onChange={(e) => {
                if (titleError) setTitleError('');
                const v = e.target.value ? Number(e.target.value) : undefined;
                setDraft((d) => (v ? { ...(d || {}), estimatedMinutes: v } : null));
              }}
            >
              <option value="">Estimate…</option>
              {[10, 15, 20, 30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  ~{m} min
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                setTitleError('Give your quest a name before refining it.');
                return;
              }
              setTitleError('');
              setAssessmentOpen(true);
              assessmentState.start(title.trim()).catch(() => {
                // assessmentState.error is set; the modal shows it
              });
            }}
            className="text-[11px] font-semibold uppercase tracking-widest text-mystic-400 transition-colors hover:text-mystic-300"
          >
            ✦ Refine with AI (optional)
          </button>
          {titleError && (
            <p id="title-error" className="text-xs text-ember-400" role="alert">
              {titleError}
            </p>
          )}
        </div>
      </form>

      {/* ---------------- Segmented board filters ---------------- */}
      <div className="quest-tabs" role="tablist" aria-label="Quest status">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`quest-tab ${filter === f.value ? 'quest-tab-active' : ''}`}
          >
            <Icon name={f.icon} className="h-3.5 w-3.5" aria-hidden="true" />
            {f.label}
          </button>
        ))}
      </div>

      {/* ---------------- Quest Log: list + featured detail ---------------- */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] lg:items-start">
        {/* LEFT: the log list (featured quest excluded — it's spotlighted right) */}
        <div className="min-w-0 space-y-3">
          {questsStatus === 'loading' && (
            <div className="space-y-3">
              <QuestCardSkeleton />
              <QuestCardSkeleton />
              <QuestCardSkeleton />
            </div>
          )}

          {questsStatus === 'error' && (
            <div className="game-panel-quest rounded-lg p-8 text-center">
              <p className="font-display text-sm font-bold uppercase tracking-widest text-ember-400">
                Quest data unavailable
              </p>
              <p className="mt-1 text-sm text-parchment-300/60">
                The board could not be loaded. Refresh to try again.
              </p>
            </div>
          )}

          {questsStatus === 'ready' && !featuredVisible && listQuests.length === 0 && (
            <div className="game-panel flex flex-col items-center gap-3 p-10 text-center">
              <Icon name="quests" className="h-10 w-10 text-parchment-300/25" aria-hidden="true" />
              <p className="font-display text-base font-bold text-parchment-100">
                {filter === 'all'
                  ? 'Quest board empty'
                  : `No ${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} quests`}
              </p>
              <p className="text-sm text-parchment-300/60">
                {filter === 'all'
                  ? 'Your next adventure awaits — accept a new quest above.'
                  : 'New adventures will appear here as you take them on.'}
              </p>
            </div>
          )}

          {questsStatus === 'ready' && listQuests.length > 0 && (
            <ul className="quest-list space-y-2.5">
              <AnimatePresence initial={false}>
                {listQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleComplete}
                    onDelete={removeQuest}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* RIGHT: featured quest spotlight — sticky on desktop */}
        <aside className="min-w-0 lg:sticky lg:top-20">
          {questsStatus === 'ready' && featuredVisible && (
            <motion.article
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="game-panel game-panel-gold relative overflow-hidden p-5 sm:p-6"
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

              <p className="relative font-hud text-[9px] uppercase tracking-[0.3em] text-gold-500/80">
                Main Quest
              </p>
              <div className="relative mt-2 flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-gold-600/50 bg-dungeon-950/70 shadow-glow"
                >
                  <Icon
                    name={CATEGORY_ICON[mainQuest.category] || 'quests'}
                    className="h-7 w-7 text-gold-300"
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold leading-tight text-parchment-100">
                    {mainQuest.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-widest text-parchment-300/60">
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
              </div>

              {/* difficulty flavor line — presentation only, no invented data */}
              <p className="relative mt-4 border-l-2 border-gold-600/50 pl-3 text-sm italic leading-relaxed text-parchment-300/65">
                {mainQuest.difficulty === 'hard'
                  ? 'A trial worthy of legend — steady yourself before you begin.'
                  : mainQuest.difficulty === 'medium'
                    ? 'A worthy task. The guild believes you are ready.'
                    : 'A small step, but every legend begins with one.'}
              </p>

              <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-dungeon-600/40 pt-4">
                {flash ? (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: -4 }}
                    exit={{ opacity: 0 }}
                    className="font-hud text-sm"
                    aria-live="polite"
                  >
                    <span className="text-reward">+{flash.xp} XP</span>{' '}
                    <span className="flex items-center gap-0.5 text-gold-400">
                      <Icon name="coin" className="h-3 w-3" aria-hidden="true" />+{flash.gold}
                    </span>
                  </motion.span>
                ) : (
                  <span className="font-hud text-[10px] uppercase tracking-[0.2em] text-parchment-300/45">
                    Rewards await completion
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleFeaturedComplete(mainQuest.id)}
                  className="btn-game shrink-0 px-5 py-2.5"
                  aria-label={`Complete quest "${mainQuest.title}"`}
                >
                  Complete Quest
                </button>
              </div>
            </motion.article>
          )}

          {questsStatus === 'ready' && !featuredVisible && (
            <div className="game-panel p-6 text-center">
              <Icon name="sword" className="mx-auto h-8 w-8 text-parchment-300/25" aria-hidden="true" />
              <p className="mt-2 font-hud text-[10px] uppercase tracking-[0.2em] text-parchment-300/50">
                No featured quest
              </p>
              <p className="mt-1 text-sm text-parchment-300/55">
                {filter === 'completed'
                  ? 'Completed quests rest in the log on the left.'
                  : 'Accept a new quest to feature it here.'}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
