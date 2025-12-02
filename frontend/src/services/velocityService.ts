/**
 * Velocity Service
 * Service for xSpeed Velocity Program API operations.
 * T007-T011: Implements all velocity API methods.
 */

import { apiClient, ApiError } from './apiClient';
import type {
  VelocityProgressResponse,
  VelocityTiersResponse,
  VelocityMissionsResponse,
  XpActivityResponse,
  LevelUpEventsResponse,
  PlayerVelocityProgress,
  VelocityTier,
  TierMission,
  XpActivity,
  LevelUpEvent,
  XpActivityType,
} from '../types/velocity';

/**
 * Service for xSpeed Velocity Program API operations.
 * Uses centralized apiClient with retry logic and error handling.
 */
export class VelocityService {
  // =========================================================================
  // T007: getProgress method
  // =========================================================================

  /**
   * Fetches the player's current velocity tier progress.
   * @param userId - Player identifier
   * @returns Promise resolving to player velocity progress
   * @throws ApiError if API request fails
   */
  static async getProgress(userId: string): Promise<PlayerVelocityProgress> {
    console.log(`🚀 Fetching velocity progress for user ${userId}`);

    try {
      const data = await apiClient.get<VelocityProgressResponse>('/velocity/progress', { userId });

      console.log(
        `✅ Velocity progress: ${data.progress.currentTierName} (Tier ${data.progress.currentTier}), ` +
          `${data.progress.totalXp} XP, ${data.progress.progressPercentage.toFixed(1)}% to next tier`
      );

      return data.progress;
    } catch (error) {
      console.error('❌ Failed to fetch velocity progress:', error);
      throw error;
    }
  }

  // =========================================================================
  // T008: getTiers method
  // =========================================================================

  /**
   * Fetches all velocity tier definitions (static configuration).
   * @returns Promise resolving to array of velocity tiers
   * @throws ApiError if API request fails
   */
  static async getTiers(): Promise<VelocityTier[]> {
    console.log('📊 Fetching velocity tier definitions');

    try {
      const data = await apiClient.get<VelocityTiersResponse>('/velocity/tiers');

      console.log(`✅ Fetched ${data.tiers.length} velocity tiers`);

      return data.tiers;
    } catch (error) {
      console.error('❌ Failed to fetch velocity tiers:', error);
      throw error;
    }
  }

  // =========================================================================
  // T009: getMissions method
  // =========================================================================

  /**
   * Fetches tier-gated mission availability for a player.
   * @param userId - Player identifier
   * @returns Promise resolving to missions and player's current tier
   * @throws ApiError if API request fails
   */
  static async getMissions(userId: string): Promise<{ missions: TierMission[]; playerTier: number }> {
    console.log(`🎯 Fetching velocity missions for user ${userId}`);

    try {
      const data = await apiClient.get<VelocityMissionsResponse>('/velocity/missions', { userId });

      const availableCount = data.missions.filter(m => m.isAvailable).length;
      const completedCount = data.missions.filter(m => m.isCompleted).length;

      console.log(
        `✅ Fetched ${data.missions.length} missions: ${availableCount} available, ${completedCount} completed`
      );

      return {
        missions: data.missions,
        playerTier: data.playerTier,
      };
    } catch (error) {
      console.error('❌ Failed to fetch velocity missions:', error);
      throw error;
    }
  }

  // =========================================================================
  // T010: getXPActivity method
  // =========================================================================

  /**
   * Fetches recent XP-earning activities for a player.
   * @param userId - Player identifier
   * @param limit - Maximum number of activities to return (default: 20)
   * @param type - Optional filter by activity type
   * @returns Promise resolving to XP activities and total count
   * @throws ApiError if API request fails
   */
  static async getXPActivity(
    userId: string,
    limit: number = 20,
    type?: XpActivityType
  ): Promise<{ activities: XpActivity[]; totalCount: number }> {
    console.log(`📈 Fetching XP activity for user ${userId} (limit: ${limit}${type ? `, type: ${type}` : ''})`);

    try {
      const params: Record<string, string> = {
        userId,
        limit: limit.toString(),
      };

      if (type) {
        params.type = type;
      }

      const data = await apiClient.get<XpActivityResponse>('/velocity/xp-activity', params);

      const totalXp = data.activities.reduce((sum, a) => sum + a.xpEarned, 0);
      console.log(`✅ Fetched ${data.activities.length} activities (${totalXp} XP total)`);

      return {
        activities: data.activities,
        totalCount: data.totalCount,
      };
    } catch (error) {
      console.error('❌ Failed to fetch XP activity:', error);
      throw error;
    }
  }

  // =========================================================================
  // T011: getLevelUpEvents and acknowledgeLevelUp methods
  // =========================================================================

  /**
   * Fetches unacknowledged level-up events for a player.
   * @param userId - Player identifier
   * @returns Promise resolving to array of level-up events
   * @throws ApiError if API request fails
   */
  static async getLevelUpEvents(userId: string): Promise<LevelUpEvent[]> {
    console.log(`🎉 Fetching level-up events for user ${userId}`);

    try {
      const data = await apiClient.get<LevelUpEventsResponse>('/velocity/level-up-events', { userId });

      if (data.events.length > 0) {
        console.log(`✅ Found ${data.events.length} unacknowledged level-up event(s)`);
      } else {
        console.log('✅ No pending level-up events');
      }

      return data.events;
    } catch (error) {
      // Handle 404 gracefully (no events)
      if (error instanceof ApiError && error.statusCode === 404) {
        console.log('✅ No pending level-up events');
        return [];
      }
      console.error('❌ Failed to fetch level-up events:', error);
      throw error;
    }
  }

  /**
   * Acknowledges a level-up event (marks it as seen).
   * @param eventId - Level-up event identifier
   * @param userId - Player identifier
   * @returns Promise resolving when acknowledgement is complete
   * @throws ApiError if API request fails
   */
  static async acknowledgeLevelUp(eventId: string, userId: string): Promise<void> {
    console.log(`✨ Acknowledging level-up event ${eventId} for user ${userId}`);

    try {
      await apiClient.post<void>(`/velocity/level-up-events/${eventId}/acknowledge`, undefined, { userId });

      console.log(`✅ Level-up event ${eventId} acknowledged`);
    } catch (error) {
      console.error('❌ Failed to acknowledge level-up event:', error);
      throw error;
    }
  }
}
