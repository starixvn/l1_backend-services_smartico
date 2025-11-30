import { apiClient } from './apiClient';
import type { Jackpot, CreateJackpotCommand, UpdateJackpotCommand } from './api.types';

/**
 * Jackpot API service methods
 */
export const jackpotApi = {
  /**
   * Creates a new jackpot
   */
  async createJackpot(command: CreateJackpotCommand): Promise<Jackpot> {
    const response = await apiClient.post<Jackpot>('/jackpots', command);
    return response.data;
  },

  /**
   * Gets all jackpots for the authenticated operator
   */
  async getAllJackpots(): Promise<Jackpot[]> {
    const response = await apiClient.get<Jackpot[]>('/jackpots');
    return response.data;
  },

  /**
   * Gets a specific jackpot by ID
   */
  async getJackpotById(id: string): Promise<Jackpot> {
    const response = await apiClient.get<Jackpot>(`/jackpots/${id}`);
    return response.data;
  },

  /**
   * Gets all active jackpots for the operator
   */
  async getActiveJackpots(): Promise<Jackpot[]> {
    const response = await apiClient.get<Jackpot[]>('/jackpots/active');
    return response.data;
  },

  /**
   * Updates an existing jackpot (only draft jackpots can be updated)
   */
  async updateJackpot(id: string, command: UpdateJackpotCommand): Promise<Jackpot> {
    const response = await apiClient.put<Jackpot>(`/jackpots/${id}`, command);
    return response.data;
  },

  /**
   * Activates a jackpot (transitions from Draft to Active)
   */
  async activateJackpot(id: string): Promise<void> {
    await apiClient.post(`/jackpots/${id}/activate`);
  },

  /**
   * Pauses an active jackpot
   */
  async pauseJackpot(id: string): Promise<void> {
    await apiClient.post(`/jackpots/${id}/pause`);
  },

  /**
   * Resumes a paused jackpot
   */
  async resumeJackpot(id: string): Promise<void> {
    await apiClient.post(`/jackpots/${id}/resume`);
  },

  /**
   * Archives a jackpot
   */
  async archiveJackpot(id: string): Promise<void> {
    await apiClient.post(`/jackpots/${id}/archive`);
  },

  /**
   * Deletes a jackpot (only draft jackpots can be deleted)
   */
  async deleteJackpot(id: string): Promise<void> {
    await apiClient.delete(`/jackpots/${id}`);
  }
};
