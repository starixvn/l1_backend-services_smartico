import { apiClient } from './apiClient';
import type { Badge, CreateBadgeCommand, UpdateBadgeCommand } from './api.types';

/**
 * Badge API service methods
 */
export const badgeApi = {
  /**
   * Creates a new badge
   */
  async createBadge(command: CreateBadgeCommand): Promise<Badge> {
    const response = await apiClient.post<Badge>('/badges', command);
    return response.data;
  },

  /**
   * Gets all badges for the authenticated operator
   */
  async getAllBadges(): Promise<Badge[]> {
    const response = await apiClient.get<Badge[]>('/badges');
    return response.data;
  },

  /**
   * Gets a specific badge by ID
   */
  async getBadgeById(id: string): Promise<Badge> {
    const response = await apiClient.get<Badge>(`/badges/${id}`);
    return response.data;
  },

  /**
   * Gets all active badges for the operator
   */
  async getActiveBadges(): Promise<Badge[]> {
    const response = await apiClient.get<Badge[]>('/badges/active');
    return response.data;
  },

  /**
   * Gets all badges in a specific series
   */
  async getBadgesBySeries(seriesId: string): Promise<Badge[]> {
    const response = await apiClient.get<Badge[]>(`/badges/series/${seriesId}`);
    return response.data;
  },

  /**
   * Updates an existing badge
   */
  async updateBadge(id: string, command: UpdateBadgeCommand): Promise<Badge> {
    const response = await apiClient.put<Badge>(`/badges/${id}`, command);
    return response.data;
  },

  /**
   * Publishes (activates) a badge
   */
  async publishBadge(id: string): Promise<void> {
    await apiClient.post(`/badges/${id}/publish`);
  },

  /**
   * Archives a badge
   */
  async archiveBadge(id: string): Promise<void> {
    await apiClient.post(`/badges/${id}/archive`);
  },

  /**
   * Deletes a badge (only draft badges can be deleted)
   */
  async deleteBadge(id: string): Promise<void> {
    await apiClient.delete(`/badges/${id}`);
  }
};
