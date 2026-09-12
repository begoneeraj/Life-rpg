import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import QuestCard from '../components/QuestCard';
import { QuestCardSkeleton } from '../components/Skeleton';
import LevelUpModal from '../components/LevelUpModal';
import useAnalyzeQuest from '../hooks/useAnalyzeQuest';

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

/**
 * Quest category and difficulty are no longer picked manually - the AI
 * (POST /api/analyze-quest) classifies both, along with a time estimate that
 * drives non-linear XP (see backend xpEngine.xpForMinutes). This keeps the
 * reward tied to what the task actually is instead of a flat 3-bucket pick.
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

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const { analyze } = useAnalyzeQuest();

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Give your quest a title before adding it.');
      return;
    }
    setTitleError('');
    setIsSubmitting(true);
    try {
      const analysis = await analyze(title.trim());
      await addQuest(title.trim(), analysis.category, analysis.difficulty, analysis.estimated_minutes);
      setTitle('');
      toast.success(
        `Quest added — AI classified it as ${CATEGORY_LABEL[analysis.category] || analysis.category} · ${
          analysis.difficulty
        } · ~${analysis.estimated_minutes} min`
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not add quest. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete(id) {
    try {
      await completeQuest(id);
    } catch {
      // store already rolled back optimistic state + toasted the error
    }
  }

  const visibleQuests = quests.filter((q) => filter === 'all' || q.status === filter);

  return (
    <div className="page-container space-y-6">
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />

      <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">Quest Log</h1>

      <form onSubmit={handleSubmit} noValidate className="parchment-card space-y-4 p-6">
        <div>
          <label htmlFor="title" className="label-text">
            New Quest
          </label>
          <input
            id="title"
            className="input-field"
            placeholder="e.g. Finish the algorithms assignment"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            maxLength={140}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'title-error' : undefined}
          />
          {titleError && (
            <p id="title-error" className="mt-1 text-xs text-ember-400">
              {titleError}
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-parchment-300/50">
            ✨ Category, difficulty, and reward are set automatically by AI based on what you type.
          </p>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Analyzing & adding…' : 'Add Quest'}
        </button>
      </form>

      <div className="flex gap-2">
        {['all', 'pending', 'completed'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-dungeon-700 text-gold-400'
                : 'bg-dungeon-800 text-parchment-300/60 hover:text-parchment-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {questsStatus === 'loading' && (
        <div className="space-y-3">
          <QuestCardSkeleton />
          <QuestCardSkeleton />
          <QuestCardSkeleton />
        </div>
      )}

      {questsStatus === 'error' && (
        <p className="parchment-card p-6 text-center text-sm text-ember-400">
          Could not load your quests. Refresh to try again.
        </p>
      )}

      {questsStatus === 'ready' && visibleQuests.length === 0 && (
        <p className="parchment-card p-8 text-center text-sm text-parchment-300/60">
          {filter === 'all'
            ? 'Your quest log is empty. Add your first quest above!'
            : `No ${filter} quests.`}
        </p>
      )}

      {questsStatus === 'ready' && visibleQuests.length > 0 && (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {visibleQuests.map((quest) => (
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
  );
}
