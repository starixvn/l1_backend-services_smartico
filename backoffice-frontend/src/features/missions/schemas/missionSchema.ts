import { z } from 'zod';
import {
  PlayerSegment,
  TriggerType,
  GoalType
} from '../../../services/api.types';

/**
 * Task trigger schema
 */
export const taskTriggerSchema = z.object({
  type: z.enum([
    TriggerType.BET_PLACED,
    TriggerType.DEPOSIT_MADE,
    TriggerType.GAME_PLAYED,
    TriggerType.DAILY_LOGIN
  ], { message: 'Please select a trigger type' }),
  minAmount: z.number().positive('Minimum amount must be positive').optional(),
  gameId: z.string().optional()
});

/**
 * Task goal schema
 */
export const taskGoalSchema = z.object({
  type: z.enum([
    GoalType.BET_COUNT,
    GoalType.DEPOSIT_AMOUNT,
    GoalType.WAGERED_AMOUNT,
    GoalType.TURNOVER_AMOUNT,
    GoalType.COUNT_BASED, // Legacy, kept for backward compatibility
    GoalType.LOGIN_COUNT  // For daily login missions
  ], { message: 'Please select a goal type' }),
  targetCount: z.number().int().positive('Target count must be a positive integer').optional(),
  targetAmount: z.number().positive('Target amount must be positive').optional(),
  eligibleGames: z.array(z.string()).optional()
});

/**
 * Mission task schema - each task has trigger, goal, and optional bonus reward
 */
export const missionTaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  name: z.string()
    .min(1, 'Task name is required')
    .max(100, 'Task name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  order: z.number().int().min(0),
  trigger: taskTriggerSchema,
  goal: taskGoalSchema,
  bonusTemplateId: z.string().optional(),
  bonusTemplateName: z.string().optional()
});

/**
 * Mission form validation schema (task-based)
 */
export const missionFormSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  completionXp: z.number()
    .int('XP must be a whole number')
    .min(0, 'XP must be 0 or greater')
    .max(100000, 'XP cannot exceed 100,000'),

  tasks: z.array(missionTaskSchema)
    .min(1, 'At least one task is required'),

  targetSegment: z.enum([PlayerSegment.ALL_PLAYERS, PlayerSegment.VIP_ONLY], {
    message: 'Please select a target player segment'
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
    }, 'Invalid end date format')
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
);

export type MissionFormData = z.infer<typeof missionFormSchema>;
export type MissionTaskData = z.infer<typeof missionTaskSchema>;
export type TaskTriggerData = z.infer<typeof taskTriggerSchema>;
export type TaskGoalData = z.infer<typeof taskGoalSchema>;
