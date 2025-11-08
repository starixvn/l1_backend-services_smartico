/**
 * Types of mini game mechanics
 */
export enum GameType {
  /** Spin the Wheel game mechanic */
  Spin = 0,
  /** Gift Box reveal game mechanic */
  GiftBox = 1,
  /** Scratch card reveal game mechanic */
  Scratch = 2,
  /** Match X symbols game mechanic */
  MatchX = 3,
}

/**
 * Buy-in requirement types for mini games
 */
export enum BuyInType {
  /** No cost to play */
  Free = 0,
  /** Costs gamification points */
  Points = 1,
  /** Costs gems */
  Gems = 2,
  /** Costs diamonds */
  Diamonds = 3,
  /** Consumes spin attempts */
  Spin = 4,
}

/**
 * Types of prizes that can be won
 */
export enum MiniGamePrizeType {
  /** No reward */
  NoPrize = 0,
  /** Gamification points */
  Points = 1,
  /** Bonus template trigger */
  Bonus = 2,
  /** Manual intervention required */
  Manual = 3,
  /** Additional spin attempts */
  Spin = 4,
  /** Jackpot prize pool */
  Jackpot = 5,
  /** Level progression */
  ChangeLevel = 6,
  /** Mission unlock */
  Mission = 7,
  /** Raffle entry */
  RaffleTicket = 8,
  /** Virtual currency */
  GemsAndDiamonds = 9,
  /** Fallback for unknown types */
  Unknown = 10,
}

/**
 * Represents a prize in a mini game
 */
export interface MiniGamePrize {
  /** Unique identifier of the prize */
  id: number;
  /** Display name of the prize */
  name: string;
  /** Type of prize */
  prizeType: MiniGamePrizeType;
  /** Numeric value (for POINTS, SPIN, GEMS_AND_DIAMONDS) */
  prizeValue?: number | null;
  /** URL to prize icon */
  icon?: string | null;
  /** Remaining items in stock */
  pool?: number | null;
  /** Initial stock amount */
  poolInitial?: number | null;
  /** Total wins recorded */
  winsCount?: number | null;
  /** Message shown when prize won */
  acknowledgeMessage?: string | null;
  /** Deep link for action button */
  acknowledgeDp?: string | null;
  /** Action button text */
  acknowledgeActionTitle?: string | null;
  /** Message when prize depleted */
  outOfStockMessage?: string | null;
  /** Always available regardless of pool */
  isSurcharge: boolean;
  /** Hide from user's prize history */
  hidePrizeFromHistory: boolean;
}

/**
 * Represents a mini game
 */
export interface MiniGame {
  /** Unique identifier of the mini game template */
  id: number;
  /** Localized name of the mini game */
  name: string;
  /** Localized description of the mini game */
  description?: string | null;
  /** URL to the game's thumbnail image */
  thumbnail?: string | null;
  /** Type of game mechanic */
  gameType: GameType;
  /** Buy-in requirement type */
  buyInType: BuyInType;
  /** Cost in points (if buyInType is POINTS) */
  buyInCostPoints?: number | null;
  /** Cost in gems (if buyInType is GEMS) */
  buyInCostGems?: number | null;
  /** Cost in diamonds (if buyInType is DIAMONDS) */
  buyInCostDiamonds?: number | null;
  /** Number of spin attempts remaining for user */
  spinCount?: number | null;
  /** Unix timestamp (milliseconds) when next play is available */
  nextAvailableSpinTs?: number | null;
  /** Current jackpot amount */
  jackpotCurrent?: number | null;
  /** Amount added to jackpot per play */
  jackpotAddOnAttempt?: number | null;
  /** Maximum plays allowed per period */
  maxNumberOfAttempts?: number | null;
  /** Period duration in milliseconds */
  maxSpinsPeriodMs?: number | null;
  /** Unix timestamp when game becomes available */
  activeFromDate?: number | null;
  /** Unix timestamp when game becomes unavailable */
  activeTillDate?: number | null;
  /** List of prizes in this game */
  prizes: MiniGamePrize[];
}

/**
 * Represents the result of playing a mini game
 */
export interface PlayResult {
  /** Whether the play was successful */
  success: boolean;
  /** ID of the prize won (null if error or NO_PRIZE) */
  prizeId?: number | null;
  /** Name of the prize won */
  prizeName?: string | null;
  /** Type of prize won */
  prizeType?: MiniGamePrizeType | null;
  /** Numeric value of prize (for POINTS, SPIN, GEMS_AND_DIAMONDS) */
  prizeValue?: number | null;
  /** Updated game state after play (new cooldown, attempts, jackpot) */
  updatedGame?: MiniGame | null;
  /** Error code if play failed */
  errorCode?: string | null;
  /** User-friendly error message if play failed */
  errorMessage?: string | null;
}
