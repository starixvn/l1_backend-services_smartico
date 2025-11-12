/**
 * LayoutCustomizer Component
 * Modal for customizing widget visibility in the dashboard layout.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetLayout } from '../../hooks/useWidgetLayout';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { WidgetId } from '../../types/dashboard/widgets';

/**
 * Widget metadata for display in customizer.
 */
const WIDGET_METADATA: Record<WidgetId, { label: string; description: string; emoji: string }> = {
  'daily-challenge': {
    label: 'Daily Challenge',
    description: 'Today\'s mission with countdown timer',
    emoji: '🎯',
  },
  'level-progress': {
    label: 'Level Progress',
    description: 'Current level and XP progress',
    emoji: '⬆️',
  },
  'streak-tracker': {
    label: 'Daily Streak',
    description: 'Login streak with milestones',
    emoji: '🔥',
  },
  'active-missions': {
    label: 'Active Missions',
    description: 'In-progress missions list',
    emoji: '📋',
  },
  'tournament': {
    label: 'Tournament',
    description: 'Active tournament rankings',
    emoji: '🏆',
  },
  'jackpot': {
    label: 'Jackpot',
    description: 'Prize pool and tickets',
    emoji: '💎',
  },
  'bonus-tracker': {
    label: 'Bonuses',
    description: 'Active bonus offers',
    emoji: '🎁',
  },
  'mini-games': {
    label: 'Mini Games',
    description: 'Available games to play',
    emoji: '🎮',
  },
  'personal-goals': {
    label: 'Personal Goals',
    description: 'Your custom goals',
    emoji: '🎯',
  },
  'reward-calendar': {
    label: 'Daily Rewards',
    description: 'Monthly login calendar',
    emoji: '📅',
  },
  'vip-status': {
    label: 'VIP Status',
    description: 'VIP tier and benefits',
    emoji: '👑',
  },
  'activity-feed': {
    label: 'Activity Feed',
    description: 'Recent events',
    emoji: '📢',
  },
  'recent-achievements': {
    label: 'Recent Achievements',
    description: 'Recently earned achievements',
    emoji: '🏆',
  },
  'leaderboard': {
    label: 'Leaderboard',
    description: 'Top player rankings',
    emoji: '📊',
  },
};

/**
 * LayoutCustomizer component props.
 */
interface LayoutCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * LayoutCustomizer component.
 * Modal for managing widget visibility settings.
 */
export function LayoutCustomizer({ isOpen, onClose }: LayoutCustomizerProps) {
  const { layout, setWidgetVisibility, resetLayout } = useWidgetLayout();
  const prefersReducedMotion = useReducedMotion();

  // Local state for draft changes (apply on save)
  const [draftVisibility, setDraftVisibility] = useState(layout.visibility);

  // Update draft when layout changes
  useEffect(() => {
    setDraftVisibility(layout.visibility);
  }, [layout.visibility]);

  // Handle visibility toggle
  const handleToggle = (widgetId: WidgetId) => {
    setDraftVisibility((prev: Record<WidgetId, boolean>) => ({
      ...prev,
      [widgetId]: !prev[widgetId],
    }));
  };

  // Handle save
  const handleSave = () => {
    // Apply all visibility changes
    Object.entries(draftVisibility).forEach(([widgetId, visible]) => {
      setWidgetVisibility(widgetId as WidgetId, visible);
    });
    onClose();
  };

  // Handle reset
  const handleReset = () => {
    resetLayout();
    setDraftVisibility(
      Object.keys(WIDGET_METADATA).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<WidgetId, boolean>
      )
    );
  };

  // Handle cancel (revert draft)
  const handleCancel = () => {
    setDraftVisibility(layout.visibility);
    onClose();
  };

  // Count visible widgets
  const visibleCount = Object.values(draftVisibility).filter(Boolean).length;
  const totalCount = Object.keys(WIDGET_METADATA).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="
                glass-dark-strong rounded-2xl border border-purple-500/30
                max-w-2xl w-full max-h-[80vh] overflow-hidden
                shadow-2xl shadow-purple-500/20
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>⚙️</span> Layout Customizer
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="
                      text-gray-400 hover:text-white
                      transition-colors p-2 rounded-lg
                      hover:bg-white/5
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                    "
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Show or hide widgets to customize your dashboard layout
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-gray-400">Visible:</span>
                  <span className="font-semibold text-white">
                    {visibleCount} / {totalCount}
                  </span>
                </div>
              </div>

              {/* Widget List */}
              <div className="p-6 overflow-y-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(WIDGET_METADATA) as WidgetId[]).map((widgetId) => {
                    const metadata = WIDGET_METADATA[widgetId];
                    const isVisible = draftVisibility[widgetId] !== false;

                    return (
                      <motion.label
                        key={widgetId}
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                        className={`
                          flex items-start gap-3 p-4 rounded-lg border cursor-pointer
                          transition-all
                          ${
                            isVisible
                              ? 'bg-purple-500/10 border-purple-500/50'
                              : 'bg-slate-800/30 border-slate-700/30'
                          }
                          hover:border-purple-500/50
                        `}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => handleToggle(widgetId)}
                          className="
                            mt-0.5 w-5 h-5 rounded border-gray-600
                            text-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
                            bg-slate-700 cursor-pointer
                          "
                        />

                        {/* Widget Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{metadata.emoji}</span>
                            <span className="font-semibold text-white text-sm">
                              {metadata.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-1">
                            {metadata.description}
                          </p>
                        </div>
                      </motion.label>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={handleReset}
                  className="
                    px-4 py-2 text-sm font-medium
                    text-gray-300 hover:text-white
                    bg-slate-700 hover:bg-slate-600
                    rounded-lg transition-colors
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900
                  "
                >
                  Reset to Default
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="
                      px-4 py-2 text-sm font-medium
                      text-gray-300 hover:text-white
                      hover:bg-white/5
                      rounded-lg transition-colors
                      focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    "
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    onClick={handleSave}
                    className="
                      px-6 py-2 text-sm font-medium
                      bg-gradient-to-r from-purple-600 to-pink-600
                      hover:from-purple-700 hover:to-pink-700
                      text-white rounded-lg
                      transition-all shadow-lg shadow-purple-500/30
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    "
                  >
                    Save Layout
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
