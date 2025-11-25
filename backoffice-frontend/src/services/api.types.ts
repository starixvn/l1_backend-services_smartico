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

// Mission types
export const MissionStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
} as const;
export type MissionStatus = typeof MissionStatus[keyof typeof MissionStatus];

export const PlayerSegment = {
  ALL_PLAYERS: 'AllPlayers',
  VIP_ONLY: 'VipOnly'
} as const;
export type PlayerSegment = typeof PlayerSegment[keyof typeof PlayerSegment];

export const NodeType = {
  TRIGGER: 'Trigger',
  GOAL: 'Goal',
  REWARD: 'Reward'
} as const;
export type NodeType = typeof NodeType[keyof typeof NodeType];

export const TriggerType = {
  BET_PLACED: 'BetPlaced',
  DEPOSIT_MADE: 'DepositMade',
  GAME_PLAYED: 'GamePlayed'
} as const;
export type TriggerType = typeof TriggerType[keyof typeof TriggerType];

export const GoalType = {
  BET_COUNT: 'BetCount',           // Count number of bets/spins
  DEPOSIT_AMOUNT: 'DepositAmount', // Sum of deposit amounts
  WAGERED_AMOUNT: 'WageredAmount', // Sum of wagered amounts
  COUNT_BASED: 'CountBased'        // Legacy count-based goal
} as const;
export type GoalType = typeof GoalType[keyof typeof GoalType];

export const RewardType = {
  FREE_SPINS: 'FreeSpins',
  CASH_BONUS: 'CashBonus'
} as const;
export type RewardType = typeof RewardType[keyof typeof RewardType];

// Visual rule builder structures
export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  label?: string;
  // Trigger properties
  triggerType?: TriggerType;
  triggerThreshold?: number;
  gameId?: string; // Specific game ID for GamePlayed triggers
  // Goal properties
  goalType?: GoalType;
  goalCount?: number;
  // Reward properties
  rewardType?: RewardType;
  rewardAmount?: number;
}

export interface RuleNode {
  id: string;
  type: NodeType;
  position: NodePosition;
  data: NodeData;
}

export interface RuleEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MissionRule {
  nodes: RuleNode[];
  edges: RuleEdge[];
}

export interface Mission {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  status: MissionStatus;
  rule: MissionRule;
  targetSegment: PlayerSegment;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionCommand {
  name: string;
  description?: string;
  rule: MissionRule;
  targetSegment: PlayerSegment;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}
