/**
 * Bonus Service
 * Service for bonus API operations using the centralized API client.
 */

import { apiClient } from './apiClient';
import { Bonus, ClaimResult } from '../types/bonus';

interface GetBonusesResponse {
  bonuses: Bonus[];
}

interface ClaimBonusResponse {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Service for bonus API operations.
 * Now uses centralized apiClient with retry logic and error handling.
 */
export class BonusService {
  /**
   * Fetches all bonuses for a user.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of bonuses
   * @throws ApiError if API request fails
   */
  static async getBonuses(userId?: string): Promise<Bonus[]> {
    console.log(`🎁 Fetching bonuses${userId ? ` for user ${userId}` : ''}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.get<GetBonusesResponse>('/bonuses', params);

    console.log(`✅ Fetched ${data.bonuses.length} bonuses`);

    return data.bonuses;
  }

  /**
   * Claims a bonus for a user.
   * @param bonusId - Bonus identifier
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to claim result
   * @throws ApiError if API request fails
   */
  static async claimBonus(bonusId: string, userId?: string): Promise<ClaimResult> {
    console.log(`🎁 Claiming bonus ${bonusId}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.post<ClaimBonusResponse>(`/bonuses/${bonusId}/claim`, undefined, params);

    console.log(`✅ Claimed bonus ${bonusId}, success: ${data.success}`);

    return {
      success: data.success,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
      bonusId,
    };
  }
}
