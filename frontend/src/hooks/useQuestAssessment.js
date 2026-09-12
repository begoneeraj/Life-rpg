import { useCallback, useState } from 'react';
import { generateAssessmentQuestions, evaluateQuestAssessment } from '../api/questAssessment';

/**
 * Drives the two-step "assessment" flow: topic -> AI-generated questions ->
 * user answers -> AI evaluates into { category, difficulty, estimated_minutes,
 * reason }. Exposes a small state machine so the modal only has to render,
 * not manage async state itself.
 *
 * States: 'idle' | 'loading-questions' | 'awaiting-answers' | 'evaluating' | 'error'
 */
export default function useQuestAssessment() {
  const [state, setState] = useState('idle');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  const start = useCallback(async (newTopic) => {
    setTopic(newTopic);
    setState('loading-questions');
    setError(null);
    try {
      const qs = await generateAssessmentQuestions(newTopic);
      setQuestions(qs);
      setState('awaiting-answers');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not generate questions for that topic.');
      setState('error');
      throw err;
    }
  }, []);

  const submitAnswers = useCallback(
    async (answers) => {
      setState('evaluating');
      setError(null);
      try {
        const result = await evaluateQuestAssessment(topic, answers);
        setState('idle');
        return result;
      } catch (err) {
        setError(err.response?.data?.error || 'Could not evaluate your answers.');
        setState('error');
        throw err;
      }
    },
    [topic]
  );

  const reset = useCallback(() => {
    setState('idle');
    setTopic('');
    setQuestions([]);
    setError(null);
  }, []);

  return { state, topic, questions, error, start, submitAnswers, reset };
}
