import { apiClient } from './apiClient';
import type { LevelSystem, CreateLevelSystemCommand, LevelPreview } from './api.types';

/**
 * Level System API service methods
 */
export const levelSystemApi = {
  /**
   * Creates a new level system
   */
  async createLevelSystem(command: CreateLevelSystemCommand): Promise<LevelSystem> {
    const response = await apiClient.post<LevelSystem>('/level-systems', command);
    return response.data;
  },

  /**
   * Gets all level systems for the authenticated operator
   */
  async getAllLevelSystems(): Promise<LevelSystem[]> {
    const response = await apiClient.get<LevelSystem[]>('/level-systems');
    return response.data;
  },

  /**
   * Gets a specific level system by ID
   */
  async getLevelSystemById(id: string): Promise<LevelSystem> {
    const response = await apiClient.get<LevelSystem>(`/level-systems/${id}`);
    return response.data;
  },

  /**
   * Gets the active level system for the operator
   */
  async getActiveLevelSystem(): Promise<LevelSystem | null> {
    try {
      const response = await apiClient.get<LevelSystem>('/level-systems/active');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Updates an existing level system
   */
  async updateLevelSystem(id: string, command: CreateLevelSystemCommand): Promise<LevelSystem> {
    const response = await apiClient.put<LevelSystem>(`/level-systems/${id}`, command);
    return response.data;
  },

  /**
   * Deletes a level system
   */
  async deleteLevelSystem(id: string): Promise<void> {
    await apiClient.delete(`/level-systems/${id}`);
  },

  /**
   * Activates a level system (only one can be active at a time)
   */
  async activateLevelSystem(id: string): Promise<LevelSystem> {
    const response = await apiClient.post<LevelSystem>(`/level-systems/${id}/activate`);
    return response.data;
  },

  /**
   * Pauses an active level system
   */
  async pauseLevelSystem(id: string): Promise<LevelSystem> {
    const response = await apiClient.post<LevelSystem>(`/level-systems/${id}/pause`);
    return response.data;
  },

  /**
   * Gets a preview of all levels with XP thresholds
   */
  async getLevelPreview(id: string): Promise<LevelPreview[]> {
    const response = await apiClient.get<LevelPreview[]>(`/level-systems/${id}/preview`);
    return response.data;
  }
};
