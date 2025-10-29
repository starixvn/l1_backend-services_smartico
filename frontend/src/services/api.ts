import axios, { AxiosInstance } from 'axios';
import type { 
  Mission, 
  Badge, 
  MissionOptInResult, 
  MissionClaimResult,
  ApiResponse 
} from '../types';

const API_BASE_URL = 'http://localhost:5227/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Missions
  async getMissions(userId: string): Promise<Mission[]> {
    const response = await this.client.get<ApiResponse<Mission[]>>(
      `/missions`,
      { params: { userId } }
    );
    return response.data.data || [];
  }

  async getMissionById(userId: string, missionId: number): Promise<Mission | null> {
    try {
      const response = await this.client.get<ApiResponse<Mission>>(
        `/missions/${missionId}`,
        { params: { userId } }
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to fetch mission ${missionId}:`, error);
      return null;
    }
  }

  async optInToMission(
    userId: string, 
    missionId: number
  ): Promise<MissionOptInResult> {
    const response = await this.client.post<ApiResponse<MissionOptInResult>>(
      `/missions/${missionId}/opt-in`,
      null,
      { params: { userId } }
    );
    return response.data.data || {
      success: false,
      message: 'Unknown error occurred',
    };
  }

  async claimReward(
    userId: string, 
    missionId: number
  ): Promise<MissionClaimResult> {
    const response = await this.client.post<ApiResponse<MissionClaimResult>>(
      `/missions/${missionId}/claim`,
      null,
      { params: { userId } }
    );
    return response.data.data || {
      success: false,
      message: 'Unknown error occurred',
    };
  }

  // Badges
  async getBadges(userId: string): Promise<Badge[]> {
    const response = await this.client.get<ApiResponse<Badge[]>>(
      `/badges`,
      { params: { userId } }
    );
    return response.data.data || [];
  }

  async getBadgeById(userId: string, badgeId: number): Promise<Badge | null> {
    try {
      const response = await this.client.get<ApiResponse<Badge>>(
        `/badges/${badgeId}`,
        { params: { userId } }
      );
      return response.data.data || null;
    } catch (error) {
      console.error(`Failed to fetch badge ${badgeId}:`, error);
      return null;
    }
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();

