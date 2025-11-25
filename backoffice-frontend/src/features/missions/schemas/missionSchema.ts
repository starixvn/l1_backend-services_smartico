import { z } from 'zod';
import {
  PlayerSegment,
  NodeType,
  TriggerType,
  GoalType,
  RewardType
} from '../../../services/api.types';

/**
 * Node position schema for visual builder
 */
export const nodePositionSchema = z.object({
  x: z.number(),
  y: z.number()
});

/**
 * Node data schema with validation for different node types
 */
export const nodeDataSchema = z.object({
  label: z.string().optional(),
  // Trigger properties
  triggerType: z.enum([TriggerType.BET_PLACED, TriggerType.DEPOSIT_MADE, TriggerType.GAME_PLAYED]).optional(),
  triggerThreshold: z.number().positive('Trigger threshold must be positive').optional(),
  // Goal properties
  goalType: z.enum([GoalType.BET_COUNT, GoalType.DEPOSIT_AMOUNT, GoalType.WAGERED_AMOUNT, GoalType.COUNT_BASED]).optional(),
  goalCount: z.number().int().positive('Goal count must be a positive integer').optional(),
  // Reward properties
  rewardType: z.enum([RewardType.FREE_SPINS, RewardType.CASH_BONUS]).optional(),
  rewardAmount: z.number().positive('Reward amount must be positive').optional()
});

/**
 * Rule node schema for visual flow builder
 * Note: Field validation is relaxed for drafts - full validation happens on publish
 */
export const ruleNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  type: z.enum([NodeType.TRIGGER, NodeType.GOAL, NodeType.REWARD], {
    message: 'Invalid node type'
  }),
  position: nodePositionSchema,
  data: nodeDataSchema
});

/**
 * Rule edge schema for node connections
 */
export const ruleEdgeSchema = z.object({
  id: z.string().min(1, 'Edge ID is required'),
  source: z.string().min(1, 'Source node ID is required'),
  target: z.string().min(1, 'Target node ID is required'),
  label: z.string().optional()
});

/**
 * Mission rule schema (visual flow structure)
 * Note: Validation is relaxed for drafts - full validation happens on publish
 */
export const missionRuleSchema = z.object({
  nodes: z.array(ruleNodeSchema),
  edges: z.array(ruleEdgeSchema)
});

/**
 * Mission form validation schema
 */
export const missionFormSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  rule: missionRuleSchema,

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
