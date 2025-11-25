import { apiClient } from './apiClient';
import type { Mission, CreateMissionCommand } from './api.types';

/**
 * Mission API service methods
 */
export const missionApi = {
  /**
   * Creates a new mission
   */
  async createMission(command: CreateMissionCommand): Promise<Mission> {
    const response = await apiClient.post<Mission>('/missions', command);
    return response.data;
  },

  /**
   * Gets all missions for the authenticated operator
   */
  async getAllMissions(): Promise<Mission[]> {
    const response = await apiClient.get<Mission[]>('/missions');
    return response.data;
  },

  /**
   * Gets a specific mission by ID
   */
  async getMissionById(id: string): Promise<Mission> {
    const response = await apiClient.get<Mission>(`/missions/${id}`);
    return response.data;
  },

  /**
   * Updates an existing mission
   */
  async updateMission(id: string, command: CreateMissionCommand): Promise<Mission> {
    const response = await apiClient.put<Mission>(`/missions/${id}`, command);
    return response.data;
  },

  /**
   * Deletes a mission
   */
  async deleteMission(id: string): Promise<void> {
    await apiClient.delete(`/missions/${id}`);
  },

  /**
   * Publishes a draft mission, making it active
   */
  async publishMission(id: string): Promise<void> {
    await apiClient.post(`/missions/${id}/publish`);
  }
};
