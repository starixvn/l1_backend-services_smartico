import { apiClient } from './apiClient';
import type { LeaderboardEntry } from './api.types';

/**
 * Leaderboard API service methods
 */
export const leaderboardApi = {
  /**
   * Gets the leaderboard for a tournament
   */
  async getLeaderboard(tournamentId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>(
      `/tournaments/${tournamentId}/leaderboard`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Gets a specific player's position on the leaderboard
   */
  async getPlayerPosition(tournamentId: string, playerId: string): Promise<LeaderboardEntry> {
    const response = await apiClient.get<LeaderboardEntry>(
      `/tournaments/${tournamentId}/leaderboard/players/${playerId}`
    );
    return response.data;
  },

  /**
   * Generates mock leaderboard data for demo purposes
   */
  async generateMockLeaderboard(tournamentId: string, entryCount: number = 50): Promise<number> {
    const response = await apiClient.post<{ entriesCreated: number }>(
      `/tournaments/${tournamentId}/leaderboard/mock`,
      null,
      { params: { entryCount } }
    );
    return response.data.entriesCreated;
  }
};
