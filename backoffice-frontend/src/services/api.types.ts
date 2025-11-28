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
  GAME_PLAYED: 'GamePlayed',
  DAILY_LOGIN: 'DailyLogin'
} as const;
export type TriggerType = typeof TriggerType[keyof typeof TriggerType];

export const GoalType = {
  BET_COUNT: 'BetCount',           // Count number of bets/spins
  DEPOSIT_AMOUNT: 'DepositAmount', // Sum of deposit amounts
  WAGERED_AMOUNT: 'WageredAmount', // Sum of wagered amounts
  COUNT_BASED: 'CountBased',       // Legacy count-based goal
  TURNOVER_AMOUNT: 'TurnoverAmount', // Turnover for bonus-linked missions
  LOGIN_COUNT: 'LoginCount'        // Count number of logins (for daily login missions)
} as const;
export type GoalType = typeof GoalType[keyof typeof GoalType];

// RewardType simplified - only BonusTemplate is supported
// FreeSpins/CashBonus should be configured via Bonus Templates
// Points are now at mission level (completionPoints)
export const RewardType = {
  BONUS_TEMPLATE: 'BonusTemplate'
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
  eligibleGames?: string[]; // Games that count toward goal
  // Reward properties
  rewardType?: RewardType;
  rewardAmount?: number;
  pointsAmount?: number; // For Points reward
  bonusTemplateId?: string; // For BonusTemplate reward - references a bonus template
  bonusTemplateName?: string; // Display name for the selected bonus template (UI only, not persisted)
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

// ============================================
// NEW TASK-BASED MISSION STRUCTURE
// ============================================

/** Trigger definition for a mission task */
export interface TaskTrigger {
  type: TriggerType;
  minAmount?: number;
  gameId?: string;
}

/** Goal definition for a mission task */
export interface TaskGoal {
  type: GoalType;
  targetCount?: number;
  targetAmount?: number;
  eligibleGames?: string[];
}

/** A single task within a mission */
export interface MissionTask {
  id: string;
  name: string;
  description?: string;
  order: number;
  trigger: TaskTrigger;
  goal: TaskGoal;
  /** Optional bonus template to grant when this task is completed */
  bonusTemplateId?: string;
  /** Display name for the bonus template (UI only) */
  bonusTemplateName?: string;
}

export interface Mission {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  status: MissionStatus;
  /** Points awarded when ALL tasks are completed (required) */
  completionPoints: number;
  /** List of tasks that must be completed for this mission */
  tasks: MissionTask[];
  /** @deprecated - use tasks instead */
  rule?: MissionRule;
  targetSegment: PlayerSegment;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionCommand {
  name: string;
  description?: string;
  /** Points awarded when ALL tasks are completed (required) */
  completionPoints: number;
  /** List of tasks for this mission */
  tasks: MissionTask[];
  /** @deprecated - use tasks instead */
  rule?: MissionRule;
  targetSegment: PlayerSegment;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
}

// Bonus award types (what players receive)
export const BonusType = {
  FREE_SPINS: 'FreeSpins',
  CASH: 'Cash',
  POINTS: 'Points'
} as const;
export type BonusType = typeof BonusType[keyof typeof BonusType];

export const BonusStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
} as const;
export type BonusStatus = typeof BonusStatus[keyof typeof BonusStatus];

export const BonusActivationType = {
  AUTOMATIC: 'Automatic',
  MANUAL: 'Manual'
} as const;
export type BonusActivationType = typeof BonusActivationType[keyof typeof BonusActivationType];


// Bonus calculation types (for dynamic bonus amounts)
export const BonusCalculationType = {
  FIXED: 'Fixed',
  DYNAMIC: 'Dynamic'
} as const;
export type BonusCalculationType = typeof BonusCalculationType[keyof typeof BonusCalculationType];

// Free Spins configuration
export interface FreeSpinsConfig {
  numberOfSpins: number;
  spinValue: number;
  eligibleGames?: string[];
}

// Cash bonus configuration
export interface CashConfig {
  amount: number;
}

// Points configuration
export interface PointsConfig {
  amount: number;
}

// Variable types for tiered bonus calculation
export type FormulaVariableType =
  | 'deposit_amount'
  | 'total_bets'
  | 'total_bet_count'
  | 'min_bet'
  | 'max_bet'
  | 'total_wins'
  | 'total_losses'
  | 'player_level';

// Tiered calculation for conditional bonus amounts
export interface BonusTier {
  id: string;
  minValue: number;
  percentage: number;
  maxBonus?: number;
}

export interface TieredCalculation {
  basedOn: FormulaVariableType;
  tiers: BonusTier[];
  defaultValue: number;
}

// Bonus calculation rule for dynamic bonus amounts
export interface BonusCalculationRule {
  calculationType: BonusCalculationType;
  basedOn?: string; // Backend enum: 'Bets' | 'Wins' | 'Losses' | 'Deposits' | 'Withdrawals'
  formula?: string;
  tieredCalculation?: TieredCalculation;
  fixedAmount?: number;
  minAmount?: number;
  maxAmount?: number;
}

// Bonus amount limits
export interface BonusAmountLimits {
  minAmount?: number;
  maxAmount?: number; // CAP
}

// Approval settings
export interface BonusApprovalSettings {
  autoApprove: boolean;
  autoApproveThreshold?: number; // Auto-approve only when bonus <= this amount
}

// Per-bonus limits
export interface BonusLimits {
  // Claim limits
  maxTotalClaims?: number;
  maxClaimsPerPlayer?: number;
  maxClaimsPerPlayerPerDay?: number;
  maxClaimsPerPlayerPerWeek?: number;
  maxClaimsPerPlayerPerMonth?: number;
  // Bonus amount limits
  amountLimits?: BonusAmountLimits;
  // Approval settings
  approval?: BonusApprovalSettings;
}

// Global operator-level bonus limits
export interface OperatorBonusLimits {
  id: string;
  operatorId: string;
  maxDailyBonusValuePerPlayer?: number;
  maxWeeklyBonusValuePerPlayer?: number;
  maxMonthlyBonusValuePerPlayer?: number;
  maxActiveBonusesPerPlayer?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bonus {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  type: BonusType;
  status: BonusStatus;
  activationType?: BonusActivationType;
  giftCode?: string;
  // Type-specific configuration
  freeSpins?: FreeSpinsConfig;
  cash?: CashConfig;
  points?: PointsConfig;
  // Dynamic calculation
  calculationRule?: BonusCalculationRule;
  // Limits
  limits?: BonusLimits;
  // Schedule
  startDate: string;
  endDate: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CreateBonusCommand {
  name: string;
  description?: string;
  type: BonusType;
  activationType?: BonusActivationType;
  giftCode?: string;
  // Type-specific configuration
  freeSpins?: FreeSpinsConfig;
  cash?: CashConfig;
  points?: PointsConfig;
  // Dynamic calculation
  calculationRule?: BonusCalculationRule;
  // Limits
  limits?: BonusLimits;
  // Schedule
  startDate: string;
  endDate: string;
}
