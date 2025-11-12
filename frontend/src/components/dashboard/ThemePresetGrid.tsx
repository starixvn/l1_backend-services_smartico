/**
 * ThemePresetGrid Component
 * Grid of theme preset options with visual previews.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { ThemeConfig } from '../../types/dashboard/theme';

/**
 * Theme preset metadata.
 */
const THEME_PRESETS: Array<{
  id: ThemeConfig['preset'];
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
  icon: string;
}> = [
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Dark gradient glassmorphism (Default)',
    primaryColor: '#9333ea',
    accentColor: '#ec4899',
    bgGradient: 'from-purple-600 to-pink-600',
    icon: '👑',
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Cool blue waves theme',
    primaryColor: '#0ea5e9',
    accentColor: '#06b6d4',
    bgGradient: 'from-blue-500 to-cyan-500',
    icon: '🌊',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    description: 'Futuristic neon green theme',
    primaryColor: '#10b981',
    accentColor: '#8b5cf6',
    bgGradient: 'from-green-500 to-purple-600',
    icon: '🤖',
  },
  {
    id: 'nature-zen',
    name: 'Nature Zen',
    description: 'Calm green forest theme',
    primaryColor: '#22c55e',
    accentColor: '#84cc16',
    bgGradient: 'from-green-500 to-lime-500',
    icon: '🌿',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm sunset gradient theme',
    primaryColor: '#f97316',
    accentColor: '#ef4444',
    bgGradient: 'from-orange-500 to-red-500',
    icon: '🌅',
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Create your own color scheme',
    primaryColor: '#6b7280',
    accentColor: '#9ca3af',
    bgGradient: 'from-gray-500 to-gray-400',
    icon: '🎨',
  },
];

/**
 * ThemePresetGrid component props.
 */
interface ThemePresetGridProps {
  selectedPreset: ThemeConfig['preset'];
  onPresetSelect: (preset: ThemeConfig['preset']) => void;
}

/**
 * ThemePresetGrid component.
 * Displays theme preset options in a responsive grid.
 */
export function ThemePresetGrid({ selectedPreset, onPresetSelect }: ThemePresetGridProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {THEME_PRESETS.map((preset) => {
        const isSelected = selectedPreset === preset.id;

        return (
          <motion.button
            key={preset.id}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => onPresetSelect(preset.id)}
            className={`
              relative p-4 rounded-xl border-2 transition-all text-left
              ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
            `}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            {/* Preset Preview */}
            <div className="mb-3">
              <div
                className={`
                  h-20 rounded-lg bg-gradient-to-br ${preset.bgGradient}
                  flex items-center justify-center
                  relative overflow-hidden
                `}
              >
                <span className="text-4xl">{preset.icon}</span>

                {/* Glassmorphism Effect Preview */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
              </div>
            </div>

            {/* Preset Info */}
            <div className="mb-3">
              <h4 className="text-base font-semibold text-white mb-1">
                {preset.name}
              </h4>
              <p className="text-xs text-gray-400 line-clamp-2">
                {preset.description}
              </p>
            </div>

            {/* Color Swatches */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-white/20"
                style={{ backgroundColor: preset.primaryColor }}
                title="Primary Color"
              />
              <div
                className="w-6 h-6 rounded-full border-2 border-white/20"
                style={{ backgroundColor: preset.accentColor }}
                title="Accent Color"
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
