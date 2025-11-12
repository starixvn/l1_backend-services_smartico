/**
 * Tournament Service
 * Service for tournament API operations using the centralized API client.
 */

import { apiClient } from './apiClient';
import type {
  Tournament,
  GetTournamentsResponse,
  RegisterTournamentResponse,
  GetLeaderboardResponse,
  TournamentParticipant,
} from '../types/tournament';

/**
 * Service for tournament API operations.
 * Now uses centralized apiClient with retry logic and error handling.
 */
export class TournamentService {
  /**
   * Fetches all tournaments for a specific user.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of tournaments
   * @throws ApiError if API request fails
   */
  static async getTournaments(userId?: string): Promise<Tournament[]> {
    console.log(`📊 Fetching tournaments${userId ? ` for user ${userId}` : ''}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.get<GetTournamentsResponse>('/tournaments', params);

    console.log(`✅ Fetched ${data.tournaments.length} tournaments`);

    return data.tournaments;
  }

  /**
   * Registers a user for a tournament.
   * @param tournamentInstanceId - Tournament instance ID
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to registration result
   * @throws ApiError if API request fails
   */
  static async registerTournament(tournamentInstanceId: number, userId?: string): Promise<RegisterTournamentResponse> {
    console.log(`📝 Registering for tournament ${tournamentInstanceId}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.post<RegisterTournamentResponse>(
      `/tournaments/${tournamentInstanceId}/register`,
      undefined,
      params
    );

    if (data.success) {
      console.log(`✅ Successfully registered for tournament ${tournamentInstanceId}`);
    } else {
      console.warn(`❌ Registration failed: ${data.errorMessage} (Status: ${data.status})`);
    }

    return data;
  }

  /**
   * Fetches the leaderboard for a specific tournament.
   * @param tournamentInstanceId - Tournament instance ID
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of participants
   * @throws ApiError if API request fails
   */
  static async getLeaderboard(tournamentInstanceId: number, userId?: string): Promise<TournamentParticipant[]> {
    console.log(`📊 Fetching leaderboard for tournament ${tournamentInstanceId}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.get<GetLeaderboardResponse>(
      `/tournaments/${tournamentInstanceId}/leaderboard`,
      params
    );

    console.log(`✅ Fetched leaderboard with ${data.participants.length} participants`);

    return data.participants;
  }
}
