import type {
  JackpotDetails,
  GetJackpotsResponse,
  OptInJackpotResponse,
  OptOutJackpotResponse
} from '../types/jackpot';

const API_BASE_URL = 'http://localhost:5227/api';

/**
 * Service for jackpot API operations.
 */
export class JackpotService {
  /**
   * Fetches all active jackpots with user opt-in status.
   * @param userId - User identifier
   * @returns Promise resolving to list of jackpots
   * @throws Error if API request fails
   */
  static async getJackpots(userId: string): Promise<JackpotDetails[]> {
    console.log(`🎰 Fetching jackpots for user ${userId}`);

    const response = await fetch(`${API_BASE_URL}/jackpots?userId=${encodeURIComponent(userId)}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch jackpots:', errorText);
      throw new Error(`Failed to fetch jackpots: ${response.statusText}`);
    }

    const data: GetJackpotsResponse = await response.json();

    console.log(
      `✅ Fetched ${data.jackpots.length} jackpots for user ${userId}`
    );

    return data.jackpots;
  }

  /**
   * Opts a user into a jackpot.
   * @param userId - User identifier
   * @param templateId - Jackpot template ID
   * @returns Promise resolving to updated jackpot details and message
   * @throws Error if API request fails
   */
  static async optIn(userId: string, templateId: number): Promise<OptInJackpotResponse> {
    console.log(`🎰 User ${userId} opting in to jackpot ${templateId}`);

    const response = await fetch(`${API_BASE_URL}/jackpots/${templateId}/opt-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to opt-in to jackpot:', errorText);

      // Handle specific error codes
      if (response.status === 409) {
        throw new Error('You are already opted in to this jackpot');
      }
      if (response.status === 404) {
        throw new Error('Jackpot not found');
      }

      throw new Error(`Failed to opt-in: ${response.statusText}`);
    }

    const data: OptInJackpotResponse = await response.json();

    console.log(`✅ User ${userId} successfully opted in to jackpot ${templateId}`);

    return data;
  }

  /**
   * Opts a user out of a jackpot.
   * @param userId - User identifier
   * @param templateId - Jackpot template ID
   * @returns Promise resolving to updated jackpot details and message
   * @throws Error if API request fails
   */
  static async optOut(userId: string, templateId: number): Promise<OptOutJackpotResponse> {
    console.log(`🎰 User ${userId} opting out of jackpot ${templateId}`);

    const response = await fetch(`${API_BASE_URL}/jackpots/${templateId}/opt-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to opt-out of jackpot:', errorText);

      // Handle specific error codes
      if (response.status === 409) {
        throw new Error('You are not opted in to this jackpot');
      }
      if (response.status === 404) {
        throw new Error('Jackpot not found');
      }

      throw new Error(`Failed to opt-out: ${response.statusText}`);
    }

    const data: OptOutJackpotResponse = await response.json();

    console.log(`✅ User ${userId} successfully opted out of jackpot ${templateId}`);

    return data;
  }
}
