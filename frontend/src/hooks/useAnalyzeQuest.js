import { useCallback, useState } from 'react';
import { analyzeQuest } from '../api/questAnalysis';

/**
 * Wraps POST /api/analyze-quest with loading/error/result state so callers
 * just do: const { analyze, result, isLoading, error } = useAnalyzeQuest();
 */
export default function useAnalyzeQuest() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (task) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeQuest(task);
      setResult(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || 'Could not analyze that task. Try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { analyze, result, isLoading, error };
}
