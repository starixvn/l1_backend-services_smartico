/**
 * Jackpot Service
 * Service for jackpot API operations using the centralized API client.
 */

import { apiClient } from './apiClient';
import type {
  JackpotDetails,
  JackpotWinner,
  JackpotType,
  GetJackpotsResponse,
  GetJackpotWinnersResponse,
  OptInJackpotResponse,
  OptOutJackpotResponse
} from '../types/jackpot';

/**
 * Service for jackpot API operations.
 * Now uses centralized apiClient with retry logic and error handling.
 */
export class JackpotService {
  /**
   * Fetches all active jackpots with user opt-in status.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of jackpots
   * @throws ApiError if API request fails
   */
  static async getJackpots(userId?: string): Promise<JackpotDetails[]> {
    console.log(`🎰 Fetching jackpots${userId ? ` for user ${userId}` : ''}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.get<GetJackpotsResponse>('/jackpots', params);

    console.log(`✅ Fetched ${data.jackpots.length} jackpots`);

    return data.jackpots;
  }

  /**
   * Opts a user into a jackpot.
   * @param templateId - Jackpot template ID
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to updated jackpot details and message
   * @throws ApiError if API request fails (409 if already opted in, 404 if not found)
   */
  static async optIn(templateId: number, userId?: string): Promise<OptInJackpotResponse> {
    console.log(`🎰 Opting in to jackpot ${templateId}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.post<OptInJackpotResponse>(
      `/jackpots/${templateId}/opt-in`,
      undefined,
      params
    );

    console.log(`✅ Successfully opted in to jackpot ${templateId}`);

    return data;
  }

  /**
   * Opts a user out of a jackpot.
   * @param templateId - Jackpot template ID
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to updated jackpot details and message
   * @throws ApiError if API request fails (409 if not opted in, 404 if not found)
   */
  static async optOut(templateId: number, userId?: string): Promise<OptOutJackpotResponse> {
    console.log(`🎰 Opting out of jackpot ${templateId}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.post<OptOutJackpotResponse>(
      `/jackpots/${templateId}/opt-out`,
      undefined,
      params
    );

    console.log(`✅ Successfully opted out of jackpot ${templateId}`);

    return data;
  }

  /**
   * Fetches recent jackpot winners with optional type filtering.
   * @param filterType - Optional filter by jackpot type (MultiUser/Personal)
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of winners
   * @throws ApiError if API request fails
   */
  static async getWinners(filterType?: JackpotType, userId?: string): Promise<JackpotWinner[]> {
    console.log(`🏆 Fetching jackpot winners, filter: ${filterType ?? 'All'}`);

    const params: Record<string, string> = userId ? { userId } : {};
    if (filterType !== undefined) {
      params.type = String(filterType);
    }

    const data = await apiClient.get<GetJackpotWinnersResponse>('/jackpots/winners', params);

    console.log(`✅ Fetched ${data.winners.length} winners (filter: ${filterType ?? 'All'})`);

    return data.winners;
  }
}
