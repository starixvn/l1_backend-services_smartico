import { apiClient } from './apiClient';
import type { Tournament, CreateTournamentCommand } from './api.types';

/**
 * Tournament API service methods
 */
export const tournamentApi = {
  /**
   * Creates a new tournament
   */
  async createTournament(command: CreateTournamentCommand): Promise<Tournament> {
    const response = await apiClient.post<Tournament>('/tournaments', command);
    return response.data;
  },

  /**
   * Gets all tournaments for the authenticated operator
   */
  async getAllTournaments(): Promise<Tournament[]> {
    const response = await apiClient.get<Tournament[]>('/tournaments');
    return response.data;
  },

  /**
   * Gets a specific tournament by ID
   */
  async getTournamentById(id: string): Promise<Tournament> {
    const response = await apiClient.get<Tournament>(`/tournaments/${id}`);
    return response.data;
  },

  /**
   * Updates an existing tournament
   */
  async updateTournament(id: string, command: CreateTournamentCommand): Promise<Tournament> {
    const response = await apiClient.put<Tournament>(`/tournaments/${id}`, command);
    return response.data;
  },

  /**
   * Deletes a tournament
   */
  async deleteTournament(id: string): Promise<void> {
    await apiClient.delete(`/tournaments/${id}`);
  }
};
