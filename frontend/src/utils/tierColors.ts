/**
 * Tier Rarity Color Mapping Utility
 * T006: Maps Velocity Tiers to their visual styling.
 */

import type { TierRarity } from '../types/velocity';

/**
 * Color configuration for a velocity tier.
 */
export interface TierColorConfig {
  /** Tier display name */
  readonly name: string;
  /** Rarity classification */
  readonly rarity: TierRarity;
  /** Border color class (TailwindCSS) */
  readonly border: string;
  /** Background color class (TailwindCSS) */
  readonly bg: string;
  /** Text color class (TailwindCSS) */
  readonly text: string;
  /** Gradient from color (TailwindCSS) */
  readonly gradientFrom: string;
  /** Gradient to color (TailwindCSS) */
  readonly gradientTo: string;
  /** Ring/outline color for focus states */
  readonly ring: string;
  /** Hex color for SVG/canvas usage */
  readonly hex: string;
}

/**
 * Tier color configurations indexed by tier number (1-4).
 */
export const TIER_COLORS: Record<number, TierColorConfig> = {
  1: {
    name: 'Ignition',
    rarity: 'common',
    border: 'border-gray-500/30',
    bg: 'bg-gray-500',
    text: 'text-gray-400',
    gradientFrom: 'from-gray-600',
    gradientTo: 'to-gray-400',
    ring: 'ring-gray-500/50',
    hex: '#6b7280',
  },
  2: {
    name: 'Cruiser',
    rarity: 'rare',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500',
    text: 'text-blue-400',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-blue-400',
    ring: 'ring-blue-500/50',
    hex: '#3b82f6',
  },
  3: {
    name: 'Turbo',
    rarity: 'epic',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-purple-400',
    ring: 'ring-purple-500/50',
    hex: '#a855f7',
  },
  4: {
    name: 'Supersonic',
    rarity: 'legendary',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    gradientFrom: 'from-yellow-600',
    gradientTo: 'to-yellow-400',
    ring: 'ring-yellow-500/50',
    hex: '#eab308',
  },
} as const;

/**
 * Default color config for unknown/invalid tiers.
 */
const DEFAULT_TIER_COLOR: TierColorConfig = {
  name: 'Unknown',
  rarity: 'common',
  border: 'border-gray-500/30',
  bg: 'bg-gray-500',
  text: 'text-gray-400',
  gradientFrom: 'from-gray-600',
  gradientTo: 'to-gray-400',
  ring: 'ring-gray-500/50',
  hex: '#6b7280',
};

/**
 * Gets the color configuration for a tier number.
 * @param tierNumber - Tier number (1-4)
 * @returns TierColorConfig for the tier
 */
export function getTierColors(tierNumber: number): TierColorConfig {
  return TIER_COLORS[tierNumber] ?? DEFAULT_TIER_COLOR;
}

/**
 * Gets the CSS class string for tier card styling.
 * @param tierNumber - Tier number (1-4)
 * @returns Combined CSS classes for card styling
 */
export function getTierCardClasses(tierNumber: number): string {
  const colors = getTierColors(tierNumber);
  return `${colors.border} ${colors.ring}`;
}

/**
 * Gets the gradient CSS class for tier backgrounds.
 * @param tierNumber - Tier number (1-4)
 * @returns Gradient CSS classes
 */
export function getTierGradient(tierNumber: number): string {
  const colors = getTierColors(tierNumber);
  return `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}`;
}

/**
 * Maps rarity to corresponding tier number.
 * @param rarity - Tier rarity
 * @returns Tier number (1-4)
 */
export function rarityToTierNumber(rarity: TierRarity): number {
  const mapping: Record<TierRarity, number> = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
  };
  return mapping[rarity];
}

/**
 * Tier thresholds for XP requirements.
 */
export const TIER_XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 5000,
  4: 25000,
} as const;

/**
 * Gets the XP threshold for a tier.
 * @param tierNumber - Tier number (1-4)
 * @returns XP required for the tier
 */
export function getTierXpThreshold(tierNumber: number): number {
  return TIER_XP_THRESHOLDS[tierNumber] ?? 0;
}
