import { z } from 'zod';
import { TournamentType, ScoringType, PrizeType } from '../../../services/api.types';

/**
 * Prize distribution schema
 */
export const prizeDistributionSchema = z.object({
  position: z.number().int().positive('Position must be a positive integer'),
  prizeAmount: z.number().positive('Prize amount must be greater than 0'),
  prizeType: z.enum([PrizeType.CASH, PrizeType.FREE_SPINS, PrizeType.BONUS_CREDIT], {
    message: 'Invalid prize type'
  })
});

/**
 * Tournament form validation schema
 */
export const tournamentFormSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  type: z.enum([TournamentType.LEADERBOARD, TournamentType.BRACKET, TournamentType.TIME_BASED_CHALLENGE], {
    message: 'Please select a tournament type'
  }),

  scoringType: z.enum([ScoringType.POINTS, ScoringType.HIGHEST_WIN, ScoringType.MOST_WINS, ScoringType.WAGERING_VOLUME], {
    message: 'Please select a scoring type'
  }),

  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const startDate = new Date(date);
      return !isNaN(startDate.getTime());
    }, 'Invalid start date format'),

  endDate: z.string()
    .min(1, 'End date is required')
    .refine((date) => {
      const endDate = new Date(date);
      return !isNaN(endDate.getTime());
    }, 'Invalid end date format'),

  prizePool: z.number()
    .positive('Prize pool must be greater than 0')
    .max(1000000000, 'Prize pool is too large'),

  prizeDistribution: z.array(prizeDistributionSchema)
    .min(1, 'At least one prize distribution is required')
    .refine(
      (distributions) => {
        const positions = distributions.map(d => d.position);
        return new Set(positions).size === positions.length;
      },
      'Prize distribution positions must be unique'
    )
    .refine(
      (distributions) => {
        const totalPrize = distributions.reduce((sum, d) => sum + d.prizeAmount, 0);
        return totalPrize > 0;
      },
      'Total prize distribution must be greater than 0'
    ),

  maxParticipants: z.number()
    .int()
    .positive('Maximum participants must be a positive integer')
    .optional(),

  entryFee: z.number()
    .nonnegative('Entry fee cannot be negative')
    .optional(),

  eligibleGames: z.array(z.string())
    .optional()
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
).refine(
  (data) => {
    const totalPrize = data.prizeDistribution.reduce((sum, d) => sum + d.prizeAmount, 0);
    return totalPrize <= data.prizePool;
  },
  {
    message: 'Total prize distribution cannot exceed prize pool',
    path: ['prizeDistribution']
  }
);

export type TournamentFormData = z.infer<typeof tournamentFormSchema>;
