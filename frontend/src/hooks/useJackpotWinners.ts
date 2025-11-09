import { useState, useEffect } from 'react';
import { JackpotService } from '../services/jackpotService';
import type { JackpotWinner, JackpotType } from '../types/jackpot';

interface UseJackpotWinnersResult {
  /** List of jackpot winners */
  winners: JackpotWinner[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Function to manually refetch winners */
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching jackpot winners with optional type filtering.
 * @param userId - User identifier
 * @param filterType - Optional filter by jackpot type (MultiUser/Personal)
 * @returns Object containing winners, loading state, error, and refetch function
 */
export function useJackpotWinners(
  userId: string,
  filterType?: JackpotType
): UseJackpotWinnersResult {
  const [winners, setWinners] = useState<JackpotWinner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await JackpotService.getWinners(userId, filterType);
      setWinners(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch winners';
      setError(errorMessage);
      console.error('Error fetching jackpot winners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [userId, filterType]); // Re-fetch when userId or filterType changes

  return {
    winners,
    loading,
    error,
    refetch: fetchWinners
  };
}
