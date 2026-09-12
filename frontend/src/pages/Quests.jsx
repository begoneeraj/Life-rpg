import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import QuestCard from '../components/QuestCard';
import { QuestCardSkeleton } from '../components/Skeleton';
import LevelUpModal from '../components/LevelUpModal';
import QuestAssessmentModal from '../components/QuestAssessmentModal';
import useQuestAssessment from '../hooks/useQuestAssessment';

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
 * Quest category and difficulty are no longer picked manually. Clicking
 * "Start Assessment" opens a short AI-generated Q&A (useQuestAssessment +
 * QuestAssessmentModal) that personalizes the difficulty/time estimate to
 * the user's self-reported experience with the topic, then creates the
 * quest with the AI's classification. XP is a non-linear function of the
 * resulting estimatedMinutes (see backend xpEngine.xpForMinutes).
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
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const assessment = useQuestAssessment();

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  async function handleStartAssessment(e) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Give your quest a topic before starting.');
      return;
    }
    setTitleError('');
    try {
      await assessment.start(title.trim());
    } catch {
      // assessment.error is set; the modal shows it
    }
  }

  async function handleAssessmentComplete(evaluation) {
    try {
      await addQuest(title.trim(), evaluation.category, evaluation.difficulty, evaluation.estimated_minutes);
      setTitle('');
      assessment.reset();
      toast.success(
        `Quest added — AI classified it as ${CATEGORY_LABEL[evaluation.category] || evaluation.category} · ${
          evaluation.difficulty
        } · ~${evaluation.estimated_minutes} min`
      );
    } catch (err) {
      assessment.reset();
      toast.error(err.response?.data?.error || 'Could not add quest. Try again.');
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
    <div className="page-container quest-log space-y-5">
      <LevelUpModal info={levelUpInfo} onDismiss={clearLevelUp} />
      <QuestAssessmentModal
        assessment={assessment}
        onComplete={handleAssessmentComplete}
        onCancel={assessment.reset}
      />

      <div className="quest-log-heading">
        <span aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">Quest Log</h1>
        <span aria-hidden="true" />
      </div>

      <form onSubmit={handleStartAssessment} noValidate className="quest-console hud-frame space-y-3 p-4 sm:p-5">
        <div>
          <label htmlFor="title" className="label-text">
            Input New Quest Topic
          </label>
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
          {titleError && (
            <p id="title-error" className="mt-1 text-xs text-ember-400">
              {titleError}
            </p>
          )}
          <p className="mt-1.5 text-[11px] text-parchment-300/50">
            ✨ You'll answer a couple of quick questions so the AI can personalize the difficulty and reward.
          </p>
        </div>

        <div className="quest-console-action">
          <span aria-hidden="true" />
          <button type="submit" className="btn-primary quest-assessment-button">
            Start Assessment
          </button>
          <span aria-hidden="true" />
        </div>
      </form>

      <div className="quest-tabs" role="tablist" aria-label="Quest status">
        {['all', 'pending', 'completed'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`quest-tab ${filter === f ? 'quest-tab-active' : ''}`}
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
        <ul className="quest-list space-y-2.5">
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
