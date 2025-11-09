import { useState, useEffect } from 'react';
import { LevelService } from '../services/levelService';
import type { Level } from '../types/level';

/**
 * Custom hook for fetching all levels visible to a user.
 *
 * @param userId - User identifier
 * @returns Object containing levels array, current level ID, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { levels, userCurrentLevelId, isLoading, error, refetch } = useLevels('user123');
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage message={error} />;
 *
 * return <LevelGrid levels={levels} currentLevelId={userCurrentLevelId} />;
 * ```
 */
export function useLevels(userId: string) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [userCurrentLevelId, setUserCurrentLevelId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await LevelService.getLevels(userId);
      setLevels(data.levels);
      setUserCurrentLevelId(data.userCurrentLevelId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch levels';
      setError(errorMessage);
      console.error('Error fetching levels:', err);
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

    fetchLevels();
  }, [userId]);

  return {
    levels,
    userCurrentLevelId,
    isLoading,
    error,
    refetch: fetchLevels,
  };
}
