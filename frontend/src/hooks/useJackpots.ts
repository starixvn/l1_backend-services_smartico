import { useState, useEffect, useCallback } from 'react';
import { JackpotService } from '../services/jackpotService';
import { signalRService } from '../services/signalr';
import type { JackpotDetails } from '../types/jackpot';

/**
 * Hook for fetching and managing jackpot data with real-time SignalR updates.
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

  // Subscribe to real-time jackpot pool updates
  useEffect(() => {
    if (!signalRService.isConnected()) {
      return;
    }

    const handlePoolUpdate = (data: {
      templateId: number;
      currentPotJp: number;
      currentPotUser: number;
      registrationCount: number;
      timestamp: number;
    }) => {
      setJackpots((prevJackpots) =>
        prevJackpots.map((jackpot) =>
          jackpot.jpTemplateId === data.templateId
            ? {
                ...jackpot,
                pot: {
                  ...jackpot.pot,
                  currentPotAmount: data.currentPotJp,
                  currentPotAmountUserCurrency: data.currentPotUser
                },
                registrationCount: data.registrationCount
              }
            : jackpot
        )
      );
    };

    const handleTemperatureChange = (data: {
      templateId: number;
      temperature: number;
      currentPot: number;
      timestamp: number;
    }) => {
      setJackpots((prevJackpots) =>
        prevJackpots.map((jackpot) =>
          jackpot.jpTemplateId === data.templateId
            ? {
                ...jackpot,
                pot: {
                  ...jackpot.pot,
                  currentPotTemperature: data.temperature,
                  currentPotAmount: data.currentPot
                }
              }
            : jackpot
        )
      );
    };

    signalRService.onJackpotPoolUpdated(handlePoolUpdate);
    signalRService.onJackpotTemperatureChanged(handleTemperatureChange);

    // Cleanup is not needed since SignalR connection persists across components
  }, []);

  return {
    jackpots,
    loading,
    error,
    refetch: fetchJackpots
  };
}
