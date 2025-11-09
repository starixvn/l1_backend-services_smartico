import { useState, useEffect, useCallback } from 'react';
import { JackpotService } from '../services/jackpotService';
import type { JackpotDetails } from '../types/jackpot';

/**
 * Hook for fetching and managing jackpot data.
 * @param userId - User identifier
 * @returns Object containing jackpots, loading state, error, and refetch function
 */
export function useJackpots(userId: string) {
  const [jackpots, setJackpots] = useState<JackpotDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJackpots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await JackpotService.getJackpots(userId);
      setJackpots(data);
    } catch (err) {
      console.error('Error fetching jackpots:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jackpots');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchJackpots();
  }, [fetchJackpots]);

  return {
    jackpots,
    loading,
    error,
    refetch: fetchJackpots
  };
}
