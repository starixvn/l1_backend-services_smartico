import { Bonus, ClaimResult } from '../types/bonus';

const API_BASE_URL = 'http://localhost:5227';

export class BonusService {
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

  static async getBonuses(userId: string): Promise<Bonus[]> {
    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/api/bonuses?userId=${userId}`
    );

    // API returns { success, data, error }
    if (response.success && response.data && response.data.bonuses) {
      return response.data.bonuses;
    }

    throw new Error(response.error || 'Failed to fetch bonuses');
  }

  static async claimBonus(userId: string, bonusId: string): Promise<ClaimResult> {
    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/api/bonuses/${bonusId}/claim?userId=${userId}`,
      {
        method: 'POST',
      }
    );

    // API returns { success, data, error }
    if (response.success && response.data) {
      return {
        success: response.data.success,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
        bonusId,
      };
    }

    throw new Error(response.error || 'Failed to claim bonus');
  }
}
