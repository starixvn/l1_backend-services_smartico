/**
 * Jackpot Service
 * Service for jackpot API operations.
 * Note: Jackpots API returns data directly (not wrapped in ApiResponse),
 * so we use fetch directly instead of apiClient.
 */

import type {
  JackpotDetails,
  JackpotWinner,
  JackpotType,
  GetJackpotsResponse,
  GetJackpotWinnersResponse,
  OptInJackpotResponse,
  OptOutJackpotResponse
} from '../types/jackpot';

const API_BASE_URL = 'http://localhost:5227/api';

/**
 * Service for jackpot API operations.
 * Uses direct fetch since Jackpots API doesn't use ApiResponse wrapper.
 */
export class JackpotService {
  /**
   * Fetches all active jackpots with user opt-in status.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of jackpots
   * @throws Error if API request fails
   */
  static async getJackpots(userId?: string): Promise<JackpotDetails[]> {
    console.log(`🎰 Fetching jackpots${userId ? ` for user ${userId}` : ''}`);

    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);

    const response = await fetch(`${API_BASE_URL}/jackpots?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch jackpots: ${response.status}`);
    }

    const data: GetJackpotsResponse = await response.json();
    console.log(`✅ Fetched ${data.jackpots.length} jackpots`, data);

    return data.jackpots;
  }

  /**
   * Opts a user into a jackpot.
   * @param templateId - Jackpot template ID
   * @param userId - User identifier
   * @returns Promise resolving to updated jackpot details and message
   * @throws Error if API request fails (409 if already opted in, 404 if not found)
   */
  static async optIn(templateId: number, userId: string): Promise<OptInJackpotResponse> {
    console.log(`🎰 Opting in to jackpot ${templateId}`);

    const response = await fetch(`${API_BASE_URL}/jackpots/${templateId}/opt-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to opt in: ${response.status}`);
    }

    const data: OptInJackpotResponse = await response.json();
    console.log(`✅ Successfully opted in to jackpot ${templateId}`);

    return data;
  }

  /**
   * Opts a user out of a jackpot.
   * @param templateId - Jackpot template ID
   * @param userId - User identifier
   * @returns Promise resolving to updated jackpot details and message
   * @throws Error if API request fails (409 if not opted in, 404 if not found)
   */
  static async optOut(templateId: number, userId: string): Promise<OptOutJackpotResponse> {
    console.log(`🎰 Opting out of jackpot ${templateId}`);

    const response = await fetch(`${API_BASE_URL}/jackpots/${templateId}/opt-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to opt out: ${response.status}`);
    }

    const data: OptOutJackpotResponse = await response.json();
    console.log(`✅ Successfully opted out of jackpot ${templateId}`);

    return data;
  }

  /**
   * Fetches recent jackpot winners with optional type filtering.
   * @param filterType - Optional filter by jackpot type (MultiUser/Personal)
   * @param userId - User identifier
   * @returns Promise resolving to list of winners
   * @throws Error if API request fails
   */
  static async getWinners(filterType?: JackpotType, userId?: string): Promise<JackpotWinner[]> {
    console.log(`🏆 Fetching jackpot winners, filter: ${filterType ?? 'All'}`);

    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (filterType !== undefined) params.set('type', String(filterType));

    const response = await fetch(`${API_BASE_URL}/jackpots/winners?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch winners: ${response.status}`);
    }

    const data: GetJackpotWinnersResponse = await response.json();
    console.log(`✅ Fetched ${data.winners.length} winners (filter: ${filterType ?? 'All'})`);

    return data.winners;
  }
}
