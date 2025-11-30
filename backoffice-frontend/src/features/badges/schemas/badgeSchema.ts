import { z } from 'zod';
import {
  BadgeRarity,
  BadgeUnlockCriteriaType,
  BadgeRewardType
} from '../../../services/api.types';

/**
 * Badge unlock criteria schema
 */
export const badgeUnlockCriteriaSchema = z.object({
  type: z.enum([
    BadgeUnlockCriteriaType.MISSION_COMPLETED,
    BadgeUnlockCriteriaType.WAGER_AMOUNT,
    BadgeUnlockCriteriaType.DEPOSIT_AMOUNT,
    BadgeUnlockCriteriaType.BET_COUNT,
    BadgeUnlockCriteriaType.TOURNAMENT_WINS,
    BadgeUnlockCriteriaType.TOURNAMENT_PARTICIPATIONS,
    BadgeUnlockCriteriaType.LOGIN_STREAK,
    BadgeUnlockCriteriaType.TOTAL_LOGINS,
    BadgeUnlockCriteriaType.LEVEL_REACHED,
    BadgeUnlockCriteriaType.TIER_REACHED,
    BadgeUnlockCriteriaType.GAME_PLAYED,
    BadgeUnlockCriteriaType.FIRST_DEPOSIT,
    BadgeUnlockCriteriaType.FIRST_BET,
    BadgeUnlockCriteriaType.CUSTOM
  ], { message: 'Please select an unlock criteria type' }),
  thresholdValue: z.number().positive('Threshold value must be positive').optional(),
  eligibleGames: z.array(z.string()).optional(),
  targetTier: z.string().optional(),
  customEventName: z.string().optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional()
});

/**
 * Badge reward schema
 */
export const badgeRewardSchema = z.object({
  type: z.enum([
    BadgeRewardType.NONE,
    BadgeRewardType.XP_BOOST,
    BadgeRewardType.FREE_SPINS,
    BadgeRewardType.CASH,
    BadgeRewardType.BONUS_TEMPLATE
  ], { message: 'Please select a reward type' }),
  value: z.number().positive('Value must be positive').optional(),
  durationHours: z.number()
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 hour')
    .max(168, 'Duration cannot exceed 168 hours (1 week)')
    .optional(),
  gameId: z.string().optional(),
  bonusTemplateId: z.string().optional(),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional()
});

/**
 * Badge form validation schema
 */
export const badgeFormSchema = z.object({
  name: z.string()
    .min(1, 'Badge name is required')
    .max(100, 'Badge name must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  iconUrl: z.string()
    .max(500, 'Icon URL must not exceed 500 characters')
    .optional(),

  rarity: z.enum([
    BadgeRarity.COMMON,
    BadgeRarity.RARE,
    BadgeRarity.EPIC,
    BadgeRarity.LEGENDARY
  ], { message: 'Please select a rarity level' }),

  unlockCriteria: badgeUnlockCriteriaSchema,

  reward: badgeRewardSchema.optional(),

  isHidden: z.boolean(),

  progressTrackingEnabled: z.boolean(),

  seriesId: z.string().optional(),

  orderInSeries: z.number().int().min(0, 'Order must be non-negative').optional()
}).superRefine((data, ctx) => {
  // Validate threshold is required for criteria types that need it
  const criteriaTypesRequiringThreshold: BadgeUnlockCriteriaType[] = [
    BadgeUnlockCriteriaType.WAGER_AMOUNT,
    BadgeUnlockCriteriaType.DEPOSIT_AMOUNT,
    BadgeUnlockCriteriaType.BET_COUNT,
    BadgeUnlockCriteriaType.TOURNAMENT_WINS,
    BadgeUnlockCriteriaType.TOURNAMENT_PARTICIPATIONS,
    BadgeUnlockCriteriaType.LOGIN_STREAK,
    BadgeUnlockCriteriaType.TOTAL_LOGINS,
    BadgeUnlockCriteriaType.LEVEL_REACHED,
    BadgeUnlockCriteriaType.GAME_PLAYED,
    BadgeUnlockCriteriaType.MISSION_COMPLETED
  ];

  if (
    criteriaTypesRequiringThreshold.includes(data.unlockCriteria.type as BadgeUnlockCriteriaType) &&
    (data.unlockCriteria.thresholdValue === undefined || data.unlockCriteria.thresholdValue <= 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Threshold value is required for this criteria type',
      path: ['unlockCriteria', 'thresholdValue']
    });
  }

  // Validate TierReached requires targetTier
  if (
    data.unlockCriteria.type === BadgeUnlockCriteriaType.TIER_REACHED &&
    !data.unlockCriteria.targetTier
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Target tier is required for TierReached criteria',
      path: ['unlockCriteria', 'targetTier']
    });
  }

  // Validate Custom requires customEventName
  if (
    data.unlockCriteria.type === BadgeUnlockCriteriaType.CUSTOM &&
    !data.unlockCriteria.customEventName
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Custom event name is required for Custom criteria',
      path: ['unlockCriteria', 'customEventName']
    });
  }

  // Validate GamePlayed requires eligibleGames
  if (
    data.unlockCriteria.type === BadgeUnlockCriteriaType.GAME_PLAYED &&
    (!data.unlockCriteria.eligibleGames || data.unlockCriteria.eligibleGames.length === 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one eligible game is required for GamePlayed criteria',
      path: ['unlockCriteria', 'eligibleGames']
    });
  }

  // Validate XpBoost reward requires value (multiplier) and duration
  if (data.reward?.type === BadgeRewardType.XP_BOOST) {
    if (data.reward.value === undefined || data.reward.value < 1.1 || data.reward.value > 3.0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'XP Boost multiplier must be between 1.1 and 3.0',
        path: ['reward', 'value']
      });
    }
    if (data.reward.durationHours === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duration is required for XP Boost reward',
        path: ['reward', 'durationHours']
      });
    }
  }

  // Validate BonusTemplate reward requires bonusTemplateId
  if (
    data.reward?.type === BadgeRewardType.BONUS_TEMPLATE &&
    !data.reward.bonusTemplateId
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Bonus template ID is required for BonusTemplate reward',
      path: ['reward', 'bonusTemplateId']
    });
  }

  // Validate FreeSpins and Cash require value
  if (
    (data.reward?.type === BadgeRewardType.FREE_SPINS || data.reward?.type === BadgeRewardType.CASH) &&
    (data.reward.value === undefined || data.reward.value <= 0)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Value is required for this reward type',
      path: ['reward', 'value']
    });
  }
});

/**
 * Badge series form validation schema
 */
export const badgeSeriesFormSchema = z.object({
  name: z.string()
    .min(1, 'Series name is required')
    .max(100, 'Series name must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  iconUrl: z.string()
    .max(500, 'Icon URL must not exceed 500 characters')
    .optional(),

  displayOrder: z.number().int().min(0, 'Display order must be non-negative')
});

export type BadgeFormData = z.infer<typeof badgeFormSchema>;
export type BadgeUnlockCriteriaData = z.infer<typeof badgeUnlockCriteriaSchema>;
export type BadgeRewardData = z.infer<typeof badgeRewardSchema>;
export type BadgeSeriesFormData = z.infer<typeof badgeSeriesFormSchema>;
