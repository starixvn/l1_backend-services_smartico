import { z } from 'zod';
import {
  JackpotType,
  JackpotTriggerType,
  JackpotResetBehavior,
  JackpotPrizeDistributionType,
  JackpotTimeInterval
} from '../../../services/api.types';

/**
 * Jackpot trigger condition schema
 */
export const jackpotTriggerConditionSchema = z.object({
  triggerType: z.enum([
    JackpotTriggerType.RANDOM,
    JackpotTriggerType.VALUE_BASED,
    JackpotTriggerType.TIME_BASED,
    JackpotTriggerType.AMOUNT_BASED
  ], { message: 'Please select a trigger type' }),
  probability: z.number()
    .min(0.000001, 'Probability must be at least 0.0001%')
    .max(0.1, 'Probability cannot exceed 10%')
    .optional(),
  betThreshold: z.number().positive('Bet threshold must be positive').optional(),
  timeInterval: z.enum([
    JackpotTimeInterval.HOURLY,
    JackpotTimeInterval.DAILY,
    JackpotTimeInterval.WEEKLY
  ]).optional(),
  timeOfDay: z.string().optional(),
  triggerAmount: z.number().positive('Trigger amount must be positive').optional()
});

/**
 * Jackpot tier schema
 */
export const jackpotTierSchema = z.object({
  tierId: z.string().optional(),
  tierName: z.string()
    .min(1, 'Tier name is required')
    .max(50, 'Tier name must not exceed 50 characters'),
  seedAmount: z.number().min(0, 'Seed amount must be non-negative'),
  contributionRate: z.number()
    .min(0, 'Contribution rate must be at least 0')
    .max(1, 'Contribution rate cannot exceed 100%'),
  maxValue: z.number().positive('Max value must be positive').optional(),
  currentValue: z.number().min(0).optional(),
  triggerCondition: jackpotTriggerConditionSchema,
  displayOrder: z.number().int().min(0)
});

/**
 * Jackpot prize distribution schema
 */
export const jackpotPrizeDistributionSchema = z.object({
  distributionType: z.enum([
    JackpotPrizeDistributionType.WINNER_TAKES_ALL,
    JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS,
    JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER
  ], { message: 'Please select a distribution type' }),
  maxWinners: z.number().int().min(1, 'Max winners must be at least 1').optional(),
  winnerPercentages: z.array(z.number().min(0).max(100)).optional(),
  // ProportionalToWager specific fields
  minimumWagerToQualify: z.number().positive('Minimum wager must be positive').optional(),
  maxPercentagePerPlayer: z.number().min(1).max(100, 'Must be 1-100%').optional()
});

/**
 * Jackpot form validation schema
 */
export const jackpotFormSchema = z.object({
  name: z.string()
    .min(1, 'Jackpot name is required')
    .max(100, 'Jackpot name must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  type: z.enum([
    JackpotType.PROGRESSIVE,
    JackpotType.FIXED
  ], { message: 'Please select a jackpot type' }),

  tiers: z.array(jackpotTierSchema)
    .min(1, 'At least one tier is required'),

  eligibleGames: z.array(z.string()).optional(),

  prizeDistribution: jackpotPrizeDistributionSchema,

  resetBehavior: z.enum([
    JackpotResetBehavior.RESET_TO_SEED,
    JackpotResetBehavior.RESET_TO_ZERO,
    JackpotResetBehavior.KEEP_REMAINDER
  ], { message: 'Please select a reset behavior' }),

  currency: z.string()
    .length(3, 'Currency must be a 3-character code (e.g., USD)')
    .default('USD'),

  startDate: z.string().optional(),
  endDate: z.string().optional()
}).superRefine((data, ctx) => {
  // Progressive jackpot must have at least one tier with contribution rate > 0
  if (data.type === JackpotType.PROGRESSIVE) {
    const hasContribution = data.tiers.some(t => t.contributionRate > 0);
    if (!hasContribution) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Progressive jackpot must have at least one tier with contribution rate > 0',
        path: ['tiers']
      });
    }
  }

  // Fixed jackpot should have contribution rate = 0 for all tiers
  if (data.type === JackpotType.FIXED) {
    const hasContribution = data.tiers.some(t => t.contributionRate > 0);
    if (hasContribution) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fixed jackpot should have contribution rate = 0 for all tiers',
        path: ['tiers']
      });
    }
  }

  // Validate tier-specific trigger conditions
  data.tiers.forEach((tier, index) => {
    // Random trigger requires probability
    if (tier.triggerCondition.triggerType === JackpotTriggerType.RANDOM) {
      if (tier.triggerCondition.probability === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Probability is required for Random trigger',
          path: ['tiers', index, 'triggerCondition', 'probability']
        });
      }
    }

    // ValueBased trigger requires betThreshold
    if (tier.triggerCondition.triggerType === JackpotTriggerType.VALUE_BASED) {
      if (tier.triggerCondition.betThreshold === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Bet threshold is required for Value-Based trigger',
          path: ['tiers', index, 'triggerCondition', 'betThreshold']
        });
      }
    }

    // TimeBased trigger requires timeInterval
    if (tier.triggerCondition.triggerType === JackpotTriggerType.TIME_BASED) {
      if (tier.triggerCondition.timeInterval === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Time interval is required for Time-Based trigger',
          path: ['tiers', index, 'triggerCondition', 'timeInterval']
        });
      }
    }

    // AmountBased trigger requires triggerAmount
    if (tier.triggerCondition.triggerType === JackpotTriggerType.AMOUNT_BASED) {
      if (tier.triggerCondition.triggerAmount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Trigger amount is required for Amount-Based trigger',
          path: ['tiers', index, 'triggerCondition', 'triggerAmount']
        });
      }
    }

    // Max value should be greater than seed amount if specified
    if (tier.maxValue !== undefined && tier.maxValue <= tier.seedAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max value must be greater than seed amount',
        path: ['tiers', index, 'maxValue']
      });
    }
  });

  // Validate unique tier names
  const tierNames = data.tiers.map(t => t.tierName);
  const uniqueNames = new Set(tierNames);
  if (uniqueNames.size !== tierNames.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Tier names must be unique',
      path: ['tiers']
    });
  }

  // Validate split distribution settings
  if (data.prizeDistribution.distributionType === JackpotPrizeDistributionType.SPLIT_AMONG_WINNERS) {
    if (data.prizeDistribution.maxWinners === undefined || data.prizeDistribution.maxWinners < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max winners is required and must be at least 2 for split distribution',
        path: ['prizeDistribution', 'maxWinners']
      });
    }

    // If custom percentages provided, they must sum to 100
    if (data.prizeDistribution.winnerPercentages && data.prizeDistribution.winnerPercentages.length > 0) {
      const sum = data.prizeDistribution.winnerPercentages.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Winner percentages must sum to 100',
          path: ['prizeDistribution', 'winnerPercentages']
        });
      }

      // Number of percentages must match max winners
      if (data.prizeDistribution.maxWinners &&
          data.prizeDistribution.winnerPercentages.length !== data.prizeDistribution.maxWinners) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Number of percentages must match max winners',
          path: ['prizeDistribution', 'winnerPercentages']
        });
      }
    }
  }

  // Validate proportional to wager distribution settings
  if (data.prizeDistribution.distributionType === JackpotPrizeDistributionType.PROPORTIONAL_TO_WAGER) {
    if (data.prizeDistribution.maxWinners === undefined || data.prizeDistribution.maxWinners < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Max winners is required for proportional distribution',
        path: ['prizeDistribution', 'maxWinners']
      });
    }
  }

  // Validate dates
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['endDate']
      });
    }
  }
});

export type JackpotFormData = z.infer<typeof jackpotFormSchema>;
export type JackpotTierData = z.infer<typeof jackpotTierSchema>;
export type JackpotTriggerConditionData = z.infer<typeof jackpotTriggerConditionSchema>;
export type JackpotPrizeDistributionData = z.infer<typeof jackpotPrizeDistributionSchema>;
