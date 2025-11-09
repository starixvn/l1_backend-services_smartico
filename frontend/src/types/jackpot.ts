/**
 * Defines the type of jackpot pool distribution model.
 */
export enum JackpotType {
  /** Shared jackpot pool among all opted-in users */
  MultiUser = 1,
  /** Individual jackpot pool per user */
  Personal = 2
}

/**
 * Defines how users contribute to a jackpot pool during gameplay.
 */
export enum JackpotContributionType {
  /** Fixed amount per bet (e.g., 10 points per bet) */
  Fixed = 1,
  /** Percentage of bet amount (e.g., 5% of each bet) */
  Percentage = 2
}

/**
 * Represents the "heat level" of a jackpot pool, indicating proximity to explosion.
 */
export enum JackPotTemperature {
  /** Pool is very small, growing slowly (blue) */
  COLD = 0,
  /** Pool is halfway to explosion threshold (yellow) */
  WARM = 1,
  /** Pool in explosion range, approaching max (orange) */
  HOT = 2,
  /** Pool very hot, explosion imminent (red) */
  BURNING = 3
}

/**
 * Public metadata for jackpot display in UI.
 */
export interface JackpotPublicMeta {
  /** Display name of the jackpot */
  name: string;
  /** User-friendly description of jackpot rules */
  description: string;
  /** URL to the jackpot thumbnail/card image */
  imageUrl: string;
  /** Custom field 1 (operator-defined) */
  placeholder1?: string | null;
  /** Custom field 2 (operator-defined) */
  placeholder2?: string | null;
  /** Custom JSON data for specialized UI needs */
  customData?: string | null;
}

/**
 * Represents a specific instance of a jackpot pot with current pool amount and temperature.
 */
export interface JackpotPot {
  /** Unique identifier for this pot instance */
  jpPotId: number;
  /** Foreign key to parent jackpot template */
  jpTemplateId: number;
  /** Current pool amount in jackpot's base currency */
  currentPotAmount: number;
  /** Current pool amount converted to user's wallet currency */
  currentPotAmountUserCurrency: number;
  /** Heat level of the pool (COLD/WARM/HOT/BURNING) */
  currentPotTemperature: JackPotTemperature;
  /** Unix timestamp (milliseconds) when this pot exploded or will explode */
  exploseDateTs: number;
}

/**
 * Represents a jackpot template with all configuration and current pot state.
 * This is the primary entity users interact with when browsing jackpots.
 */
export interface JackpotDetails {
  /** Unique identifier for the jackpot template */
  jpTemplateId: number;
  /** Type of jackpot (MultiUser=1, Personal=2) */
  jpTypeId: JackpotType;
  /** Base currency of the jackpot pool */
  jpCurrency: string;
  /** User's wallet currency for conversion display */
  userCurrency: string;
  /** How users contribute to the pool (Fixed=1, Percentage=2) */
  contributionType: JackpotContributionType;
  /** Contribution amount or percentage */
  contributionValue: number;
  /** Current pot instance with pool amount and temperature */
  pot: JackpotPot;
  /** Number of users opted in to this jackpot */
  registrationCount: number;
  /** Whether the current user is opted in to this jackpot */
  isOptedIn: boolean;
  /** Whether this jackpot applies to all games */
  achRelatedGameAllowAll: boolean;
  /** Whether winners are publicly visible via API */
  exposeWinnersOverApi: boolean;
  /** Public metadata for UI display */
  jpPublicMeta: JackpotPublicMeta;
  /** Minimum pool amount before explosion can occur */
  minAmount: number;
  /** Maximum pool amount (guaranteed explosion threshold) */
  maxAmount: number;
  /** Initial seed amount when pot is created */
  seedAmount: number;
}

/**
 * Represents a jackpot winner record when a pot explodes.
 */
export interface JackpotWinner {
  /** Pot instance ID that was drawn */
  jpPotId: number;
  /** Flag indicating if the current logged-in user is this winner */
  isMe: boolean;
  /** Username of winner (masked for others) */
  publicUsername: string;
  /** Avatar identifier for winner's profile picture */
  avatarId: string;
  /** Prize amount in jackpot's base currency */
  winningAmountJpCurrency: number;
  /** Prize amount in user's wallet currency */
  winningAmountWalletCurrency: number;
  /** Rank position (1=first, 2=second, 3=third, etc.) */
  winningPosition: number;
  /** Unix timestamp (milliseconds) when winner was drawn */
  winDateTs: number;
  /** Name of the jackpot that was won */
  jackpotName: string;
}

/**
 * API response for GET /api/jackpots
 */
export interface GetJackpotsResponse {
  /** List of active jackpots */
  jackpots: JackpotDetails[];
}

/**
 * API response for POST /api/jackpots/{id}/opt-in
 */
export interface OptInJackpotResponse {
  /** Updated jackpot details with user opted in */
  jackpot: JackpotDetails;
  /** Success message */
  message: string;
}

/**
 * API response for POST /api/jackpots/{id}/opt-out
 */
export interface OptOutJackpotResponse {
  /** Updated jackpot details with user opted out */
  jackpot: JackpotDetails;
  /** Success message */
  message: string;
}
