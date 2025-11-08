import { useState, useEffect } from 'react';
import { LevelService } from '../services/levelService';
import type { UserLevelProgress } from '../types/level';

/**
 * Custom hook for fetching and managing user level progress data.
 *
 * @param userId - User identifier
 * @returns Object containing level progress data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useLevelProgress('user123');
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!data) return <NoLevelData />;
 *
 * return <LevelCard progress={data} />;
 * ```
 */
export function useLevelProgress(userId: string) {
  const [data, setData] = useState<UserLevelProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const progress = await LevelService.getUserLevelProgress(userId);
      setData(progress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch level progress';
      setError(errorMessage);
      console.error('Error fetching level progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError('User ID is required');
      setIsLoading(false);
      return;
    }

    fetchLevelProgress();
  }, [userId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchLevelProgress,
  };
}
