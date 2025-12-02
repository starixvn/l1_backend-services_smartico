/**
 * useVelocityTiers Hook
 * T015: Custom hook for fetching velocity tier definitions (static config).
 */

import { useState, useEffect, useCallback } from 'react';
import { VelocityService } from '../services/velocityService';
import type { VelocityTier } from '../types/velocity';

/**
 * Return type for useVelocityTiers hook.
 */
export interface UseVelocityTiersResult {
  /** Array of velocity tier definitions */
  data: VelocityTier[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually refetch data */
  refetch: () => Promise<void>;
  /** Get a specific tier by number */
  getTier: (tierNumber: number) => VelocityTier | undefined;
  /** Get the next tier after a given tier number */
  getNextTier: (currentTier: number) => VelocityTier | undefined;
}

/**
 * Custom hook for fetching velocity tier definitions.
 * Tier data is static and rarely changes, suitable for client-side caching.
 *
 * @returns Object containing tier data, loading state, error state, and utility functions
 *
 * @example
 * ```tsx
 * const { data: tiers, isLoading, getTier, getNextTier } = useVelocityTiers();
 *
 * if (isLoading) return <SkeletonLoader />;
 *
 * const currentTier = getTier(2); // Get Cruiser tier
 * const nextTier = getNextTier(2); // Get Turbo tier
 * ```
 */
export function useVelocityTiers(): UseVelocityTiersResult {
  const [data, setData] = useState<VelocityTier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tiers = await VelocityService.getTiers();
      // Sort by tier number for consistent ordering
      const sortedTiers = [...tiers].sort((a, b) => a.tierNumber - b.tierNumber);
      setData(sortedTiers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch velocity tiers';
      setError(errorMessage);
      console.error('Error fetching velocity tiers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  /**
   * Gets a specific tier by tier number.
   */
  const getTier = useCallback(
    (tierNumber: number): VelocityTier | undefined => {
      return data.find(tier => tier.tierNumber === tierNumber);
    },
    [data]
  );

  /**
   * Gets the next tier after the given tier number.
   * Returns undefined if already at max tier.
   */
  const getNextTier = useCallback(
    (currentTier: number): VelocityTier | undefined => {
      return data.find(tier => tier.tierNumber === currentTier + 1);
    },
    [data]
  );

  return {
    data,
    isLoading,
    error,
    refetch: fetchTiers,
    getTier,
    getNextTier,
  };
}
