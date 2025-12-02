/**
 * useVelocityProgress Hook
 * T013: Custom hook for fetching and managing player velocity progress data.
 */

import { useState, useEffect, useCallback } from 'react';
import { VelocityService } from '../services/velocityService';
import type { PlayerVelocityProgress } from '../types/velocity';

/**
 * Return type for useVelocityProgress hook.
 */
export interface UseVelocityProgressResult {
  /** Player's velocity progress data */
  data: PlayerVelocityProgress | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing player velocity progress data.
 *
 * @param userId - Player identifier
 * @returns Object containing velocity progress data, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useVelocityProgress('user123');
 *
 * if (isLoading) return <SkeletonLoader />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!data) return <NoProgressData />;
 *
 * return <VelocityTierCard progress={data} />;
 * ```
 */
export function useVelocityProgress(userId: string): UseVelocityProgressResult {
  const [data, setData] = useState<PlayerVelocityProgress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const progress = await VelocityService.getProgress(userId);
      setData(progress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch velocity progress';
      setError(errorMessage);
      console.error('Error fetching velocity progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchProgress,
  };
}
