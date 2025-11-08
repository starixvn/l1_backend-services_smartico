/**
 * Represents a level in the player progression system.
 * Maps to backend Level entity.
 */
export interface Level {
  /** Unique identifier for this level */
  id: number;
  /** Level display name (user-facing, translated) */
  name: string;
  /** Level description explaining the achievement (translated) */
  description: string;
  /** URL to the level badge/icon image */
  image: string;
  /** Total points required to reach this level */
  requiredPoints: number;
  /** Points threshold before level becomes visible to user */
  visibilityPoints: number;
  /** Counter of 1st metric for advanced leveling (optional) */
  requiredLevelCounter1?: number | null;
  /** Counter of 2nd metric for advanced leveling (optional) */
  requiredLevelCounter2?: number | null;
  /** Custom data as JSON string for custom UI */
  customData?: string | null;
}

/**
 * Represents a user's current position in the leveling system.
 * Maps to backend UserLevelProgress entity.
 */
export interface UserLevelProgress {
  /** ID of the user's current level */
  currentLevelId: number;
  /** Name of the current level (user-facing, translated) */
  currentLevelName: string;
  /** Image URL of the current level badge */
  currentLevelImage: string;
  /** Total points accumulated by the user */
  totalPointsEarned: number;
  /** Points required to reach the current level */
  currentLevelRequiredPoints: number;
  /** ID of the next achievable level (null if at max level) */
  nextLevelId?: number | null;
  /** Name of the next level (null if at max level) */
  nextLevelName?: string | null;
  /** Points required to reach the next level (null if at max level) */
  nextLevelRequiredPoints?: number | null;
  /** Points still needed to advance to next level */
  pointsToNextLevel?: number | null;
  /** Percentage progress toward next level (0-100, null if at max level) */
  progressPercentage?: number | null;
  /** Current value of level counter 1 (advanced leveling) */
  levelCounter1Current?: number | null;
  /** Required value of level counter 1 for next level */
  levelCounter1Required?: number | null;
  /** Current value of level counter 2 (advanced leveling) */
  levelCounter2Current?: number | null;
  /** Required value of level counter 2 for next level */
  levelCounter2Required?: number | null;
  /** Indicates whether the user is at the maximum level */
  isMaxLevel: boolean;
}

/**
 * API response for GET /api/levels/progress
 */
export interface GetUserLevelProgressResponse {
  /** User level progress or null if no level data */
  progress: UserLevelProgress | null;
}
