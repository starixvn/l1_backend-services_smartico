import { MiniGame, PlayResult } from '../types/minigame';

const API_BASE_URL = 'http://localhost:5227';

export class MiniGameService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    // TODO: Add JWT token from auth context
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async getMiniGames(userId: string): Promise<MiniGame[]> {
    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/api/mini-games?userId=${userId}`
    );

    // API returns { success, data, error }
    if (response.success && response.data && response.data.miniGames) {
      return response.data.miniGames;
    }

    throw new Error(response.error || 'Failed to fetch mini games');
  }

  static async playMiniGame(userId: string, gameId: number): Promise<PlayResult> {
    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/api/mini-games/${gameId}/play?userId=${userId}`,
      {
        method: 'POST',
      }
    );

    // API returns { success, data, error }
    if (response.success && response.data) {
      return {
        success: response.data.success,
        prizeId: response.data.prizeId,
        prizeName: response.data.prizeName,
        prizeType: response.data.prizeType,
        prizeValue: response.data.prizeValue,
        updatedGame: response.data.updatedGame,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
      };
    }

    throw new Error(response.error || 'Failed to play mini game');
  }
}
