/**
 * Represents the lifecycle status of a bonus
 */
export enum BonusStatus {
  /** Bonus has been created but not yet issued to user */
  New = 1,
  /** Bonus has been issued to user and is available for claiming */
  Issued = 2,
  /** Bonus has been successfully claimed by user */
  Claimed = 3,
  /** Bonus claim attempt failed (user can retry) */
  RedeemFailed = 4,
  /** Bonus issue attempt failed */
  IssueFailed = 5,
  /** Bonus has expired and is no longer claimable */
  Expired = 6,
}

/**
 * Represents different types of bonuses available
 */
export enum BonusType {
  /** Welcome bonus for new users */
  WelcomeBonus = 1,
  /** Bonus triggered by user deposit */
  DepositBonus = 2,
  /** Free spins for slot games */
  FreeSpins = 3,
  /** Cash back on losses */
  CashBack = 4,
  /** Reload bonus for existing users */
  Reload = 5,
  /** VIP exclusive bonus */
  VIPBonus = 6,
}

/**
 * Represents a bonus issued to a user
 */
export interface Bonus {
  /** Unique identifier for the bonus */
  id: string;
  /** Display name of the bonus */
  name: string;
  /** Detailed description of the bonus */
  description?: string | null;
  /** URL to bonus image for display */
  imageUrl?: string | null;
  /** Current status of the bonus */
  status: BonusStatus;
  /** Bonus amount value */
  amount: number;
  /** Currency code (e.g., USD, EUR) */
  currency: string;
  /** Expiration date/time (null if no expiration) */
  expiresAt?: string | null;
  /** Whether the bonus can be claimed by user */
  isRedeemable: boolean;
  /** Timestamp when bonus was created */
  createdAt: string;
  /** Timestamp when bonus was claimed (null if not claimed) */
  redeemedAt?: string | null;
  /** Additional metadata from Smartico template (JSON) */
  templateMetadata?: string | null;
  /** Type of bonus */
  type?: BonusType | null;
}

/**
 * Represents the result of a bonus claim operation
 */
export interface ClaimResult {
  /** Whether the claim was successful */
  success: boolean;
  /** Error code if claim failed (null if successful) */
  errorCode?: string | null;
  /** Human-readable error message if claim failed */
  errorMessage?: string | null;
  /** ID of the bonus that was claimed */
  bonusId: string;
}
