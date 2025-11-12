/**
 * Level Service
 * Service for level API operations using the centralized API client.
 */

import { apiClient, ApiError } from './apiClient';
import type { Level, UserLevelProgress, GetUserLevelProgressResponse } from '../types/level';

interface GetLevelsResponse {
  levels: Level[];
  userCurrentLevelId: number;
}

/**
 * Service for level API operations.
 * Now uses centralized apiClient with retry logic and error handling.
 */
export class LevelService {
  /**
   * Fetches the user's current level progression status.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to user level progress or null if no level data (404)
   * @throws ApiError if API request fails (other than 404)
   */
  static async getUserLevelProgress(userId?: string): Promise<UserLevelProgress | null> {
    console.log(`📊 Fetching level progress${userId ? ` for user ${userId}` : ''}`);

    try {
      const params = userId ? { userId } : undefined;
      const data = await apiClient.get<GetUserLevelProgressResponse>('/levels/progress', params);

      if (data.progress) {
        console.log(
          `✅ Fetched level progress: ${data.progress.currentLevelName} (${data.progress.progressPercentage?.toFixed(2) ?? 'Max'}% to next level)`
        );
      } else {
        console.warn(`⚠️ No level progress data`);
      }

      return data.progress;
    } catch (error) {
      // Handle 404 Not Found (user has no level data)
      if (error instanceof ApiError && error.statusCode === 404) {
        console.warn(`⚠️ User has no level data (0 points or new user)`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Fetches all levels visible to the user, sorted by required points.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to levels list and user's current level ID
   * @throws ApiError if API request fails
   */
  static async getLevels(userId?: string): Promise<{ levels: Level[]; userCurrentLevelId: number }> {
    console.log(`📊 Fetching levels list${userId ? ` for user ${userId}` : ''}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.get<GetLevelsResponse>('/levels', params);

    console.log(
      `✅ Fetched ${data.levels.length} levels, current level ID: ${data.userCurrentLevelId}`
    );

    return data;
  }
}
