import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Drives the "Start Assessment" flow's UI on top of useQuestAssessment's
 * state machine: a loading state while questions generate, the multiple-
 * choice Q&A itself, a loading state while the AI evaluates, and an error
 * state with retry. `onComplete` fires with the final
 * { category, difficulty, estimated_minutes, reason } once evaluation
 * succeeds; `onCancel` closes the modal at any point without creating a quest.
 */
export default function QuestAssessmentModal({ assessment, onComplete, onCancel }) {
  const { state, topic, questions, error, submitAnswers } = assessment;
  const [selected, setSelected] = useState({}); // { [questionIndex]: optionIndex }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = state !== 'idle';
  const allAnswered = questions.length > 0 && questions.every((_, i) => selected[i] !== undefined);

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const answers = questions.map((q, i) => ({ question: q.question, answer: q.options[selected[i]] }));
      const result = await submitAnswers(answers);
      onComplete(result);
    } catch {
      // assessment.error is already set; the modal shows it and offers retry/cancel
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-heading"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-dungeon-950/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex w-full max-w-lg flex-col gap-4 rounded-2xl border-2 border-mystic-500/60 bg-dungeon-900 p-6 shadow-glow-mystic"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            <h2 id="assessment-heading" className="font-display text-lg font-bold text-mystic-400">
              ✨ Quest Assessment
            </h2>
            <p className="truncate text-sm text-parchment-300/70">"{topic}"</p>

            {state === 'loading-questions' && (
              <LoadingState label="Analyzing topic to generate questions…" />
            )}

            {state === 'evaluating' && <LoadingState label="AI is thinking…" />}

            {state === 'error' && (
              <div className="space-y-3 py-2">
                <p className="text-sm text-ember-400">{error}</p>
                <div className="flex gap-2">
                  <button type="button" className="btn-primary flex-1" onClick={() => onCancel()}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {state === 'awaiting-answers' && (
              <div className="space-y-4">
                {questions.map((q, qi) => (
                  <div key={q.question}>
                    <p className="mb-2 text-sm font-semibold text-parchment-100">{q.question}</p>
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((option, oi) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setSelected((prev) => ({ ...prev, [qi]: oi }))}
                          aria-pressed={selected[qi] === oi}
                          className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            selected[qi] === oi
                              ? 'border-mystic-500 bg-mystic-500/10 text-mystic-400'
                              : 'border-dungeon-600 bg-dungeon-800 text-parchment-200/80 hover:border-mystic-500 hover:text-mystic-400'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onCancel()}
                    className="rounded-md border border-dungeon-600 px-4 py-2 text-xs font-semibold text-parchment-300/70 transition-colors hover:border-ember-500 hover:text-ember-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!allAnswered || isSubmitting}
                    className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting ? 'Evaluating…' : 'Generate Quest'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingState({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <motion.span
        aria-hidden="true"
        className="text-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      >
        ⚙️
      </motion.span>
      <p className="text-sm text-parchment-300/70">{label}</p>
    </div>
  );
}
