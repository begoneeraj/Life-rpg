import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import QuestCard from '../components/QuestCard';
import { QuestCardSkeleton } from '../components/Skeleton';
import LevelUpModal from '../components/LevelUpModal';
import useAnalyzeQuest from '../hooks/useAnalyzeQuest';

const CATEGORIES = [
  { value: 'coding', label: '💻 Coding (Intellect)' },
  { value: 'study', label: '📚 Study (Intellect)' },
  { value: 'gym', label: '🏋️ Gym (Strength)' },
  { value: 'fitness', label: '🏃 Fitness (Strength)' },
  { value: 'running', label: '🏃 Running (Strength)' },
  { value: 'meditation', label: '🧘 Meditation (Focus)' },
  { value: 'deep_work', label: '🎯 Deep Work (Discipline)' },
  { value: 'chores', label: '🧹 Chores (Discipline)' },
  { value: 'healthy_habits', label: '❤️ Healthy Habits (Energy)' },
  { value: 'other', label: '📜 Other (Discipline)' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', xp: 10 },
  { value: 'medium', label: 'Medium', xp: 25 },
  { value: 'hard', label: 'Hard', xp: 50 },
];

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
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [difficulty, setDifficulty] = useState('easy');
  const [titleError, setTitleError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const { analyze, result: aiResult, isLoading: isAnalyzing } = useAnalyzeQuest();
  const [analyzedTitle, setAnalyzedTitle] = useState('');

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const selectedDifficulty = DIFFICULTIES.find((d) => d.value === difficulty);

  async function handleAnalyze() {
    if (!title.trim()) {
      setTitleError('Type a quest title first, then analyze it.');
      return;
    }
    setTitleError('');
    try {
      const data = await analyze(title.trim());
      setDifficulty(data.difficulty);
      setAnalyzedTitle(title.trim());
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not analyze that task. Try again.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Give your quest a title before adding it.');
      return;
    }
    setTitleError('');
    setIsSubmitting(true);
    try {
      await addQuest(title.trim(), category, difficulty);
      setTitle('');
      toast.success('Quest added to your log!');
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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />

      <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">Quest Log</h1>

      <form onSubmit={handleSubmit} noValidate className="parchment-card space-y-4 p-6">
        <div>
          <label htmlFor="title" className="label-text">
            New Quest
          </label>
          <div className="flex gap-2">
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
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !title.trim()}
              className="shrink-0 rounded-md border border-mystic-600 bg-mystic-500/10 px-3 text-xs font-semibold text-mystic-400 transition-colors hover:border-mystic-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isAnalyzing ? 'Analyzing…' : '✨ Analyze'}
            </button>
          </div>
          {titleError && (
            <p id="title-error" className="mt-1 text-xs text-ember-400">
              {titleError}
            </p>
          )}
          {aiResult && analyzedTitle === title.trim() && (
            <p className="mt-1.5 text-xs text-mystic-400/80">
              AI suggests <span className="font-semibold capitalize">{aiResult.difficulty}</span> ·{' '}
              ~{aiResult.estimated_minutes} min — {aiResult.reason}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="label-text">
              Category
            </label>
            <select
              id="category"
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="label-text">Difficulty</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Quest difficulty">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  role="radio"
                  aria-checked={difficulty === d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                    difficulty === d.value
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                      : 'border-dungeon-600 bg-dungeon-900 text-parchment-300/70 hover:border-dungeon-500'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-dungeon-700 bg-dungeon-900/60 px-3 py-2 text-xs text-parchment-300/70">
          <span>Reward preview</span>
          <span className="font-semibold text-gold-400">
            +{selectedDifficulty.xp} XP · +{Math.floor(selectedDifficulty.xp / 2)} Gold
          </span>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add Quest'}
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
