import type {
  Tournament,
  GetTournamentsResponse,
  RegisterTournamentResponse,
  GetLeaderboardResponse,
  TournamentParticipant,
} from '../types/tournament';

const API_BASE_URL = 'http://localhost:5227/api';

/**
 * Service for tournament API operations.
 */
export class TournamentService {
  /**
   * Fetches all tournaments for a specific user.
   * @param userId - User identifier
   * @returns Promise resolving to list of tournaments
   */
  static async getTournaments(userId: string): Promise<Tournament[]> {
    console.log(`📊 Fetching tournaments for user ${userId}`);

    const response = await fetch(`${API_BASE_URL}/tournaments?userId=${encodeURIComponent(userId)}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch tournaments:', errorText);
      throw new Error(`Failed to fetch tournaments: ${response.statusText}`);
    }

    const data: GetTournamentsResponse = await response.json();
    console.log(`✅ Fetched ${data.tournaments.length} tournaments`);

    return data.tournaments;
  }

  /**
   * Registers a user for a tournament.
   * @param userId - User identifier
   * @param tournamentInstanceId - Tournament instance ID
   * @returns Promise resolving to registration result
   */
  static async registerTournament(userId: string, tournamentInstanceId: number): Promise<RegisterTournamentResponse> {
    console.log(`📝 Registering user ${userId} for tournament ${tournamentInstanceId}`);

    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentInstanceId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    // Parse JSON response (works for both success and error responses)
    const data: RegisterTournamentResponse = await response.json();

    if (data.success) {
      console.log(`✅ Successfully registered for tournament ${tournamentInstanceId}`);
    } else {
      console.warn(`❌ Registration failed: ${data.errorMessage} (Status: ${data.status})`);
    }

    return data;
  }

  /**
   * Fetches the leaderboard for a specific tournament.
   * @param userId - User identifier
   * @param tournamentInstanceId - Tournament instance ID
   * @returns Promise resolving to list of participants
   */
  static async getLeaderboard(userId: string, tournamentInstanceId: number): Promise<TournamentParticipant[]> {
    console.log(`📊 Fetching leaderboard for tournament ${tournamentInstanceId}, user ${userId}`);

    const response = await fetch(
      `${API_BASE_URL}/tournaments/${tournamentInstanceId}/leaderboard?userId=${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch leaderboard:', errorText);
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }

    const data: GetLeaderboardResponse = await response.json();
    console.log(`✅ Fetched leaderboard with ${data.participants.length} participants`);

    return data.participants;
  }
}
