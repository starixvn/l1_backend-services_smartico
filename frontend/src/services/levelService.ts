import type { Level, UserLevelProgress, GetUserLevelProgressResponse } from '../types/level';

const API_BASE_URL = 'http://localhost:5227/api';

/**
 * Service for level API operations.
 */
export class LevelService {
  /**
   * Fetches the user's current level progression status.
   * @param userId - User identifier
   * @returns Promise resolving to user level progress or null if no level data
   * @throws Error if API request fails
   */
  static async getUserLevelProgress(userId: string): Promise<UserLevelProgress | null> {
    console.log(`📊 Fetching level progress for user ${userId}`);

    const response = await fetch(`${API_BASE_URL}/levels/progress?userId=${encodeURIComponent(userId)}`);

    // Handle 404 Not Found (user has no level data)
    if (response.status === 404) {
      console.warn(`⚠️ User ${userId} has no level data (0 points or new user)`);
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch level progress:', errorText);
      throw new Error(`Failed to fetch level progress: ${response.statusText}`);
    }

    const data: GetUserLevelProgressResponse = await response.json();

    if (data.progress) {
      console.log(
        `✅ Fetched level progress: ${data.progress.currentLevelName} (${data.progress.progressPercentage?.toFixed(2) ?? 'Max'}% to next level)`
      );
    } else {
      console.warn(`⚠️ No level progress data for user ${userId}`);
    }

    return data.progress;
  }

  /**
   * Fetches all levels visible to the user, sorted by required points.
   * @param userId - User identifier
   * @returns Promise resolving to levels list and user's current level ID
   * @throws Error if API request fails
   */
  static async getLevels(userId: string): Promise<{ levels: Level[]; userCurrentLevelId: number }> {
    console.log(`📊 Fetching levels list for user ${userId}`);

    const response = await fetch(`${API_BASE_URL}/levels?userId=${encodeURIComponent(userId)}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch levels:', errorText);
      throw new Error(`Failed to fetch levels: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(
      `✅ Fetched ${data.levels.length} levels for user ${userId}, current level ID: ${data.userCurrentLevelId}`
    );

    return data;
  }
}
