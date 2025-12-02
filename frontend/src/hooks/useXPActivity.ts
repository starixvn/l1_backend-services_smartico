/**
 * useXPActivity Hook
 * T017: Custom hook for fetching and managing XP activity feed data.
 */

import { useState, useEffect, useCallback } from 'react';
import { VelocityService } from '../services/velocityService';
import type { XpActivity, XpActivityType } from '../types/velocity';

/**
 * Return type for useXPActivity hook.
 */
export interface UseXPActivityResult {
  /** Array of XP activity events */
  data: XpActivity[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Total count of activities available */
  totalCount: number;
  /** Current filter type */
  filterType: XpActivityType | undefined;
  /** Function to set filter type */
  setFilterType: (type: XpActivityType | undefined) => void;
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
  /** Load more activities */
  loadMore: () => Promise<void>;
  /** Whether there are more activities to load */
  hasMore: boolean;
}

/**
 * Default number of activities to fetch per page.
 */
const DEFAULT_LIMIT = 20;

/**
 * Custom hook for fetching and managing XP activity feed data.
 *
 * @param userId - Player identifier
 * @param initialLimit - Initial number of activities to fetch (default: 20)
 * @returns Object containing activity data, loading state, error state, and management functions
 *
 * @example
 * ```tsx
 * const {
 *   data: activities,
 *   isLoading,
 *   filterType,
 *   setFilterType,
 *   loadMore,
 *   hasMore
 * } = useXPActivity('user123');
 *
 * return (
 *   <div>
 *     <FilterButtons currentFilter={filterType} onFilterChange={setFilterType} />
 *     <ActivityList activities={activities} isLoading={isLoading} />
 *     {hasMore && <LoadMoreButton onClick={loadMore} />}
 *   </div>
 * );
 * ```
 */
export function useXPActivity(userId: string, initialLimit: number = DEFAULT_LIMIT): UseXPActivityResult {
  const [data, setData] = useState<XpActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filterType, setFilterType] = useState<XpActivityType | undefined>(undefined);
  const [limit, setLimit] = useState<number>(initialLimit);

  const fetchActivities = useCallback(
    async (appendMode: boolean = false) => {
      if (!userId) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        if (!appendMode) {
          setError(null);
        }

        const result = await VelocityService.getXPActivity(userId, limit, filterType);

        if (appendMode) {
          setData(prev => [...prev, ...result.activities.slice(prev.length)]);
        } else {
          setData(result.activities);
        }
        setTotalCount(result.totalCount);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch XP activity';
        setError(errorMessage);
        console.error('Error fetching XP activity:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, limit, filterType]
  );

  // Fetch when userId, limit, or filterType changes
  useEffect(() => {
    // Reset limit when filter changes
    setLimit(initialLimit);
    fetchActivities(false);
  }, [userId, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch more when limit increases
  useEffect(() => {
    if (limit > initialLimit) {
      fetchActivities(true);
    }
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle filter type change.
   */
  const handleSetFilterType = useCallback((type: XpActivityType | undefined) => {
    setFilterType(type);
    setData([]); // Clear data when filter changes
    setLimit(DEFAULT_LIMIT); // Reset limit
  }, []);

  /**
   * Load more activities.
   */
  const loadMore = useCallback(async () => {
    if (data.length < totalCount) {
      setLimit(prev => prev + DEFAULT_LIMIT);
    }
  }, [data.length, totalCount]);

  /**
   * Refetch activities from scratch.
   */
  const refetch = useCallback(async () => {
    setLimit(initialLimit);
    await fetchActivities(false);
  }, [fetchActivities, initialLimit]);

  return {
    data,
    isLoading,
    error,
    totalCount,
    filterType,
    setFilterType: handleSetFilterType,
    refetch,
    loadMore,
    hasMore: data.length < totalCount,
  };
}
