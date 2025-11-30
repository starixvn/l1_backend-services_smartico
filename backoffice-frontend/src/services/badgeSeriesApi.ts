import { apiClient } from './apiClient';
import type { BadgeSeries, CreateBadgeSeriesCommand, UpdateBadgeSeriesCommand } from './api.types';

/**
 * Badge Series API service methods
 */
export const badgeSeriesApi = {
  /**
   * Creates a new badge series
   */
  async createBadgeSeries(command: CreateBadgeSeriesCommand): Promise<BadgeSeries> {
    const response = await apiClient.post<BadgeSeries>('/badge-series', command);
    return response.data;
  },

  /**
   * Gets all badge series for the authenticated operator
   */
  async getAllBadgeSeries(): Promise<BadgeSeries[]> {
    const response = await apiClient.get<BadgeSeries[]>('/badge-series');
    return response.data;
  },

  /**
   * Gets a specific badge series by ID (includes badges in the series)
   */
  async getBadgeSeriesById(id: string): Promise<BadgeSeries> {
    const response = await apiClient.get<BadgeSeries>(`/badge-series/${id}`);
    return response.data;
  },

  /**
   * Gets all active badge series for the operator
   */
  async getActiveBadgeSeries(): Promise<BadgeSeries[]> {
    const response = await apiClient.get<BadgeSeries[]>('/badge-series/active');
    return response.data;
  },

  /**
   * Updates an existing badge series
   */
  async updateBadgeSeries(id: string, command: UpdateBadgeSeriesCommand): Promise<BadgeSeries> {
    const response = await apiClient.put<BadgeSeries>(`/badge-series/${id}`, command);
    return response.data;
  },

  /**
   * Publishes (activates) a badge series
   */
  async publishBadgeSeries(id: string): Promise<void> {
    await apiClient.post(`/badge-series/${id}/publish`);
  },

  /**
   * Archives a badge series
   */
  async archiveBadgeSeries(id: string): Promise<void> {
    await apiClient.post(`/badge-series/${id}/archive`);
  },

  /**
   * Deletes a badge series (only draft series without badges can be deleted)
   */
  async deleteBadgeSeries(id: string): Promise<void> {
    await apiClient.delete(`/badge-series/${id}`);
  }
};
