import { apiClient } from './apiClient';
import type { Bonus, CreateBonusCommand, OperatorBonusLimits } from './api.types';

/**
 * DTO for updating operator global limits
 */
export interface UpdateOperatorLimitsDto {
  maxDailyBonusValuePerPlayer?: number | null;
  maxWeeklyBonusValuePerPlayer?: number | null;
  maxMonthlyBonusValuePerPlayer?: number | null;
  maxActiveBonusesPerPlayer?: number | null;
  currency: string;
}

/**
 * Bonus API service methods
 */
export const bonusApi = {
  /**
   * Creates a new bonus
   */
  async createBonus(command: CreateBonusCommand): Promise<Bonus> {
    const response = await apiClient.post<Bonus>('/bonuses', command);
    return response.data;
  },

  /**
   * Gets all bonuses for the authenticated operator
   */
  async getAllBonuses(): Promise<Bonus[]> {
    const response = await apiClient.get<Bonus[]>('/bonuses');
    return response.data;
  },

  /**
   * Gets a specific bonus by ID
   */
  async getBonusById(id: string): Promise<Bonus> {
    const response = await apiClient.get<Bonus>(`/bonuses/${id}`);
    return response.data;
  },

  /**
   * Updates an existing bonus
   */
  async updateBonus(id: string, command: CreateBonusCommand): Promise<Bonus> {
    const response = await apiClient.put<Bonus>(`/bonuses/${id}`, command);
    return response.data;
  },

  /**
   * Deletes a bonus
   */
  async deleteBonus(id: string): Promise<void> {
    await apiClient.delete(`/bonuses/${id}`);
  },

  /**
   * Activates a bonus (changes status from Draft to Active)
   */
  async activateBonus(id: string): Promise<Bonus> {
    const response = await apiClient.post<Bonus>(`/bonuses/${id}/activate`);
    return response.data;
  },

  /**
   * Pauses an active bonus
   */
  async pauseBonus(id: string): Promise<Bonus> {
    const response = await apiClient.post<Bonus>(`/bonuses/${id}/pause`);
    return response.data;
  },

  // ==================== Global Operator Limits ====================

  /**
   * Gets the global bonus limits for the authenticated operator
   */
  async getGlobalLimits(): Promise<OperatorBonusLimits> {
    const response = await apiClient.get<OperatorBonusLimits>('/bonuses/limits');
    return response.data;
  },

  /**
   * Updates the global bonus limits for the authenticated operator
   */
  async updateGlobalLimits(limits: UpdateOperatorLimitsDto): Promise<OperatorBonusLimits> {
    const response = await apiClient.put<OperatorBonusLimits>('/bonuses/limits', limits);
    return response.data;
  },

  /**
   * Deletes the global bonus limits (resets to unlimited)
   */
  async deleteGlobalLimits(): Promise<void> {
    await apiClient.delete('/bonuses/limits');
  }
};
