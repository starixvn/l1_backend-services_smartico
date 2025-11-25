/**
 * API type definitions for the Back Office frontend
 */

// Type-safe enums matching backend (using const objects for erasableSyntaxOnly)
export const TournamentType = {
  LEADERBOARD: 'Leaderboard',
  BRACKET: 'Bracket',
  TIME_BASED_CHALLENGE: 'TimeBasedChallenge'
} as const;
export type TournamentType = typeof TournamentType[keyof typeof TournamentType];

export const ScoringType = {
  POINTS: 'Points',
  HIGHEST_WIN: 'HighestWin',
  MOST_WINS: 'MostWins',
  WAGERING_VOLUME: 'WageringVolume'
} as const;
export type ScoringType = typeof ScoringType[keyof typeof ScoringType];

export const TournamentStatus = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
} as const;
export type TournamentStatus = typeof TournamentStatus[keyof typeof TournamentStatus];

export const PrizeType = {
  CASH: 'Cash',
  FREE_SPINS: 'FreeSpins',
  BONUS_CREDIT: 'BonusCredit'
} as const;
export type PrizeType = typeof PrizeType[keyof typeof PrizeType];

// DTOs matching backend
export interface PrizeDistribution {
  fromPosition: number;
  toPosition?: number; // Optional: if set, creates a range (e.g., 4-100)
  prizeAmount: number;
  prizeType: PrizeType;
}

export interface Tournament {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  type: TournamentType;
  scoringType: ScoringType;
  status: TournamentStatus;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  prizePool: number;
  prizeDistribution: PrizeDistribution[];
  maxParticipants?: number;
  entryFee?: number;
  eligibleGames?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTournamentCommand {
  name: string;
  description?: string;
  type: TournamentType;
  scoringType: ScoringType;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  prizePool: number;
  prizeDistribution: PrizeDistribution[];
  maxParticipants?: number;
  entryFee?: number;
  eligibleGames?: string[];
}

export interface ApiError {
  status: number;
  title: string;
  detail: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  tournamentId: string;
  playerId: string;
  playerName: string;
  rank: number;
  score: number;
  lastUpdated: string; // ISO 8601
  avatarUrl?: string;
  metadata?: Record<string, any>;
}
