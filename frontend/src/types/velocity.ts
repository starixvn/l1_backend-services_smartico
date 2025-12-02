/**
 * Velocity Program Type Definitions
 * Types for the xSpeed Velocity Tier progression system.
 */

// =============================================================================
// T001: VelocityTier Interface
// =============================================================================

/**
 * Rarity classification for tier visual styling.
 */
export type TierRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Feature type unlocked at a specific tier.
 */
export type TierFeatureType = 'jackpot' | 'tournament' | 'multiplier' | 'mission';

/**
 * Feature unlocked at a specific velocity tier.
 */
export interface TierFeature {
  /** Feature type */
  readonly type: TierFeatureType;
  /** Feature name */
  readonly name: string;
  /** Feature description */
  readonly description: string;
  /** Numeric value if applicable (e.g., 1.2 for multiplier) */
  readonly value?: number;
}

/**
 * Velocity Tier configuration - static data from backend.
 * Represents a tier in the xSpeed Velocity Program progression system.
 */
export interface VelocityTier {
  /** Tier number (1-4) */
  readonly tierNumber: number;
  /** Display name (Ignition, Cruiser, Turbo, Supersonic) */
  readonly name: string;
  /** XP required to reach this tier */
  readonly xpRequired: number;
  /** Primary benefit description unlocked at this tier */
  readonly benefit: string;
  /** Badge rarity for visual styling */
  readonly rarity: TierRarity;
  /** Icon/image URL for tier badge */
  readonly iconUrl: string;
  /** Color theme for tier (CSS color value) */
  readonly themeColor: string;
  /** Number of daily missions available at this tier */
  readonly dailyMissionCount: number;
  /** List of specific mission names unlocked */
  readonly unlockedMissions: string[];
  /** Additional features unlocked (jackpots, tournaments, etc.) */
  readonly unlockedFeatures: TierFeature[];
}

// =============================================================================
// T002: PlayerVelocityProgress Interface
// =============================================================================

/**
 * XP earned by source category.
 */
export interface XpBreakdown {
  /** XP from slot games */
  readonly slots: number;
  /** XP from table games */
  readonly tableGames: number;
  /** XP from mission completions */
  readonly missions: number;
  /** XP from other sources (bonuses, promotions) */
  readonly other: number;
}

/**
 * Player's current Velocity Progress - fetched from API.
 * Represents a player's current position in the Velocity Program.
 */
export interface PlayerVelocityProgress {
  /** Player's unique identifier */
  readonly userId: string;
  /** Current tier number (1-4) */
  readonly currentTier: number;
  /** Current tier name for display */
  readonly currentTierName: string;
  /** Total XP accumulated */
  readonly totalXp: number;
  /** XP threshold for current tier */
  readonly currentTierXpThreshold: number;
  /** XP threshold for next tier (null if max tier) */
  readonly nextTierXpThreshold: number | null;
  /** XP remaining to reach next tier (null if max tier) */
  readonly xpToNextTier: number | null;
  /** Progress percentage within current tier (0-100) */
  readonly progressPercentage: number;
  /** Whether player is at maximum tier (Supersonic) */
  readonly isMaxTier: boolean;
  /** Timestamp when current tier was achieved (ISO date) */
  readonly tierAchievedAt: string;
  /** XP breakdown by source */
  readonly xpBreakdown: XpBreakdown;
}

// =============================================================================
// T003: XpActivity Interface
// =============================================================================

/**
 * Type of XP-earning activity.
 */
export type XpActivityType = 'slot_play' | 'table_play' | 'mission_complete' | 'bonus' | 'promotion';

/**
 * Reference to game or mission that generated XP.
 */
export interface ActivityReference {
  /** Reference type */
  readonly type: 'game' | 'mission';
  /** Reference identifier */
  readonly id: string;
  /** Display name */
  readonly name: string;
}

/**
 * XP activity event for the activity feed.
 * Represents a single XP-earning event.
 */
export interface XpActivity {
  /** Unique activity identifier */
  readonly id: string;
  /** Activity type */
  readonly type: XpActivityType;
  /** Human-readable activity description */
  readonly description: string;
  /** XP earned from this activity */
  readonly xpEarned: number;
  /** Timestamp of activity (ISO date) */
  readonly timestamp: string;
  /** Game or mission reference (optional) */
  readonly reference?: ActivityReference;
}

// =============================================================================
// T004: TierMission and MissionReward Interfaces
// =============================================================================

/**
 * Type of mission reward.
 */
export type MissionRewardType = 'free_spins' | 'cash' | 'xp_boost' | 'badge';

/**
 * Mission reward structure.
 */
export interface MissionReward {
  /** Reward type */
  readonly type: MissionRewardType;
  /** Reward value (amount) */
  readonly value: number;
  /** Human-readable description */
  readonly description: string;
}

/**
 * Mission with tier availability information.
 * Represents mission availability based on player tier.
 */
export interface TierMission {
  /** Mission identifier */
  readonly id: string;
  /** Mission name */
  readonly name: string;
  /** Mission description */
  readonly description: string;
  /** Minimum tier required to access (1-4) */
  readonly requiredTier: number;
  /** Whether mission is available to current player */
  readonly isAvailable: boolean;
  /** Whether mission is completed today */
  readonly isCompleted: boolean;
  /** XP reward for completion */
  readonly xpReward: number;
  /** Other rewards */
  readonly rewards: MissionReward[];
}

// =============================================================================
// T005: LevelUpEvent Interface
// =============================================================================

/**
 * Level up event for celebration display.
 * Represents a tier advancement event.
 */
export interface LevelUpEvent {
  /** Event identifier */
  readonly id: string;
  /** Previous tier number */
  readonly previousTier: number;
  /** Previous tier name */
  readonly previousTierName: string;
  /** New tier number */
  readonly newTier: number;
  /** New tier name */
  readonly newTierName: string;
  /** Timestamp of advancement (ISO date) */
  readonly achievedAt: string;
  /** Benefits newly unlocked */
  readonly newBenefits: TierFeature[];
  /** New missions unlocked */
  readonly newMissions: string[];
  /** Has been acknowledged by user */
  readonly acknowledged: boolean;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * API response for GET /api/velocity/progress
 */
export interface VelocityProgressResponse {
  /** Player velocity progress */
  readonly progress: PlayerVelocityProgress;
}

/**
 * API response for GET /api/velocity/tiers
 */
export interface VelocityTiersResponse {
  /** All velocity tier definitions */
  readonly tiers: VelocityTier[];
}

/**
 * API response for GET /api/velocity/missions
 */
export interface VelocityMissionsResponse {
  /** Tier-gated missions */
  readonly missions: TierMission[];
  /** Player's current tier for context */
  readonly playerTier: number;
}

/**
 * API response for GET /api/velocity/xp-activity
 */
export interface XpActivityResponse {
  /** XP activity events */
  readonly activities: XpActivity[];
  /** Total count of activities available */
  readonly totalCount: number;
}

/**
 * API response for GET /api/velocity/level-up-events
 */
export interface LevelUpEventsResponse {
  /** Unacknowledged level-up events */
  readonly events: LevelUpEvent[];
}

/**
 * Request params for GET /api/velocity/xp-activity
 */
export interface XpActivityParams {
  /** Player identifier */
  readonly userId: string;
  /** Maximum activities to return */
  readonly limit?: number;
  /** Filter by activity type */
  readonly type?: XpActivityType;
}
