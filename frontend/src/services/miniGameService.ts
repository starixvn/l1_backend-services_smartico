/**
 * Mini Game Service
 * Service for mini game API operations using the centralized API client.
 */

import { apiClient } from './apiClient';
import { MiniGame, PlayResult, MiniGamePrizeType } from '../types/minigame';

interface GetMiniGamesResponse {
  miniGames: MiniGame[];
}

interface PlayMiniGameResponse {
  success: boolean;
  prizeId: number;
  prizeName: string;
  prizeType: string;
  prizeValue: number;
  updatedGame: MiniGame;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Service for mini game API operations.
 * Now uses centralized apiClient with retry logic and error handling.
 */
export class MiniGameService {
  /**
   * Fetches all available mini games for a user.
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to list of mini games
   * @throws ApiError if API request fails
   */
  static async getMiniGames(userId?: string): Promise<MiniGame[]> {
    console.log(`🎮 Fetching mini games${userId ? ` for user ${userId}` : ''}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.get<GetMiniGamesResponse>('/minigames', params);

    console.log(`✅ Fetched ${data.miniGames.length} mini games`);

    return data.miniGames;
  }

  /**
   * Plays a mini game and returns the result.
   * @param gameId - Mini game ID
   * @param userId - User identifier (optional, uses environment userId if not provided)
   * @returns Promise resolving to play result with prize details
   * @throws ApiError if API request fails
   */
  static async playMiniGame(gameId: number, userId?: string): Promise<PlayResult> {
    console.log(`🎮 Playing mini game ${gameId}`);

    const params = userId ? { userId } : undefined;
    const data = await apiClient.post<PlayMiniGameResponse>(`/minigames/${gameId}/play`, undefined, params);

    console.log(`✅ Played mini game ${gameId}, success: ${data.success}`);

    // Convert prizeType string to enum
    const prizeTypeEnum = data.prizeType ? (MiniGamePrizeType[data.prizeType as keyof typeof MiniGamePrizeType] ?? null) : null;

    return {
      success: data.success,
      prizeId: data.prizeId,
      prizeName: data.prizeName,
      prizeType: prizeTypeEnum,
      prizeValue: data.prizeValue,
      updatedGame: data.updatedGame,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
    };
  }
}
