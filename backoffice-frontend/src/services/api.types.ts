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
// XP is now at mission level (completionXp) and contributes to level progression
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
  /** List of game IDs that qualify for this trigger. Empty/null means all games. */
  eligibleGames?: string[];
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
  /** XP awarded when ALL tasks are completed (contributes to level progression) */
  completionXp: number;
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
  /** XP awarded when ALL tasks are completed (contributes to level progression) */
  completionXp: number;
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

// ============================================
// LEVEL SYSTEM TYPES
// ============================================

export const LevelSystemStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived'
} as const;
export type LevelSystemStatus = typeof LevelSystemStatus[keyof typeof LevelSystemStatus];

export const ProgressionCurveType = {
  LINEAR: 'Linear',
  EXPONENTIAL: 'Exponential',
  CUSTOM: 'Custom'
} as const;
export type ProgressionCurveType = typeof ProgressionCurveType[keyof typeof ProgressionCurveType];

export const TierBenefitType = {
  CASHBACK_BOOST: 'CashbackBoost',
  VIP_SUPPORT: 'VipSupport',
  WITHDRAWAL_LIMIT_BOOST: 'WithdrawalLimitBoost',
  EXCLUSIVE_TOURNAMENTS: 'ExclusiveTournaments',
  XP_MULTIPLIER: 'XpMultiplier',
  CUSTOM: 'Custom'
} as const;
export type TierBenefitType = typeof TierBenefitType[keyof typeof TierBenefitType];

export const XpActionType = {
  BET: 'Bet',
  DEPOSIT: 'Deposit',
  TOURNAMENT_PARTICIPATION: 'TournamentParticipation',
  TOURNAMENT_WIN: 'TournamentWin',
  DAILY_LOGIN: 'DailyLogin',
  REFERRAL: 'Referral',
  BADGE_UNLOCK: 'BadgeUnlock',
  CUSTOM: 'Custom'
} as const;
export type XpActionType = typeof XpActionType[keyof typeof XpActionType];

export const LevelRewardType = {
  FREE_SPINS: 'FreeSpins',
  CASH: 'Cash',
  BONUS_TEMPLATE: 'BonusTemplate',
  EXCLUSIVE_MISSION: 'ExclusiveMission',
  XP_BOOST: 'XpBoost',
  BADGE: 'Badge'
} as const;
export type LevelRewardType = typeof LevelRewardType[keyof typeof LevelRewardType];

export const DemotionType = {
  ONE_TIER: 'OneTier',
  RESET_TO_BOTTOM: 'ResetToBottom',
  ONE_LEVEL: 'OneLevel'
} as const;
export type DemotionType = typeof DemotionType[keyof typeof DemotionType];

export interface TierBenefit {
  type: TierBenefitType;
  description?: string;
  value?: number;
}

export interface LevelTier {
  id: string;
  name: string;
  fromLevel: number;
  toLevel: number;
  color?: string;
  icon?: string;
  order: number;
  benefits: TierBenefit[];
}

export interface XpRule {
  id: string;
  actionType: XpActionType;
  xpAmount: number;
  perUnitAmount?: number;
  dailyCap?: number;
  eligibleGames?: string[];
  isActive: boolean;
  description?: string;
}

export interface LevelReward {
  id: string;
  level: number;
  rewardType: LevelRewardType;
  value?: number;
  bonusTemplateId?: string;
  bonusTemplateName?: string;
  badgeId?: string;
  badgeName?: string;
  description?: string;
}

export interface DemotionRules {
  inactiveDays: number;
  demotionType: DemotionType;
  warningDays: number;
  preserveXp: boolean;
}

export interface LevelSystem {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  status: LevelSystemStatus;
  maxLevel: number;
  progressionCurve: ProgressionCurveType;
  baseXpRequired: number;
  xpMultiplier: number;
  tiers: LevelTier[];
  xpRules: XpRule[];
  levelRewards: LevelReward[];
  demotionEnabled: boolean;
  demotionRules?: DemotionRules;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLevelSystemCommand {
  name: string;
  description?: string;
  maxLevel: number;
  progressionCurve: ProgressionCurveType;
  baseXpRequired: number;
  xpMultiplier: number;
  tiers: LevelTier[];
  xpRules: XpRule[];
  levelRewards: LevelReward[];
  demotionEnabled: boolean;
  demotionRules?: DemotionRules;
}

export interface LevelPreview {
  level: number;
  xpRequired: number;
  totalXpRequired: number;
  tierName?: string;
  tierColor?: string;
  rewards: LevelReward[];
}

// ============================================
// BADGE SYSTEM TYPES
// ============================================

export const BadgeStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived'
} as const;
export type BadgeStatus = typeof BadgeStatus[keyof typeof BadgeStatus];

export const BadgeRarity = {
  COMMON: 'Common',
  RARE: 'Rare',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary'
} as const;
export type BadgeRarity = typeof BadgeRarity[keyof typeof BadgeRarity];

export const BadgeUnlockCriteriaType = {
  MISSION_COMPLETED: 'MissionCompleted',
  WAGER_AMOUNT: 'WagerAmount',
  DEPOSIT_AMOUNT: 'DepositAmount',
  BET_COUNT: 'BetCount',
  TOURNAMENT_WINS: 'TournamentWins',
  TOURNAMENT_PARTICIPATIONS: 'TournamentParticipations',
  LOGIN_STREAK: 'LoginStreak',
  TOTAL_LOGINS: 'TotalLogins',
  LEVEL_REACHED: 'LevelReached',
  TIER_REACHED: 'TierReached',
  GAME_PLAYED: 'GamePlayed',
  FIRST_DEPOSIT: 'FirstDeposit',
  FIRST_BET: 'FirstBet',
  CUSTOM: 'Custom'
} as const;
export type BadgeUnlockCriteriaType = typeof BadgeUnlockCriteriaType[keyof typeof BadgeUnlockCriteriaType];

export const BadgeRewardType = {
  NONE: 'None',
  XP_BOOST: 'XpBoost',
  FREE_SPINS: 'FreeSpins',
  CASH: 'Cash',
  BONUS_TEMPLATE: 'BonusTemplate'
} as const;
export type BadgeRewardType = typeof BadgeRewardType[keyof typeof BadgeRewardType];

export const BadgeSeriesStatus = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ARCHIVED: 'Archived'
} as const;
export type BadgeSeriesStatus = typeof BadgeSeriesStatus[keyof typeof BadgeSeriesStatus];

export interface BadgeUnlockCriteria {
  type: BadgeUnlockCriteriaType;
  thresholdValue?: number;
  eligibleGames?: string[];
  targetTier?: string;
  customEventName?: string;
  description?: string;
}

export interface BadgeReward {
  type: BadgeRewardType;
  value?: number;
  durationHours?: number;
  gameId?: string;
  bonusTemplateId?: string;
  description?: string;
}

export interface Badge {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  iconUrl?: string;
  rarity: BadgeRarity;
  status: BadgeStatus;
  unlockCriteria: BadgeUnlockCriteria;
  reward?: BadgeReward;
  isHidden: boolean;
  progressTrackingEnabled: boolean;
  seriesId?: string;
  orderInSeries?: number;
  unlockCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBadgeCommand {
  name: string;
  description?: string;
  iconUrl?: string;
  rarity: BadgeRarity;
  unlockCriteria: BadgeUnlockCriteria;
  reward?: BadgeReward;
  isHidden?: boolean;
  progressTrackingEnabled?: boolean;
  seriesId?: string;
  orderInSeries?: number;
}

export interface UpdateBadgeCommand {
  name: string;
  description?: string;
  iconUrl?: string;
  rarity: BadgeRarity;
  unlockCriteria: BadgeUnlockCriteria;
  reward?: BadgeReward;
  isHidden?: boolean;
  progressTrackingEnabled?: boolean;
  seriesId?: string;
  orderInSeries?: number;
}

export interface BadgeSeries {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  iconUrl?: string;
  displayOrder: number;
  status: BadgeSeriesStatus;
  badges?: Badge[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBadgeSeriesCommand {
  name: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
}

export interface UpdateBadgeSeriesCommand {
  name: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
}
