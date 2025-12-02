/**
 * XPActivityItem Component
 * T055-T057: Single XP activity item with type icon and timestamp.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { XpActivity, XpActivityType } from '../../types/velocity';

/**
 * Props for XPActivityItem component.
 */
export interface XPActivityItemProps {
  /** XP activity data */
  activity: XpActivity;
  /** Animation index for staggered entry */
  index?: number;
  /** Callback when item is clicked */
  onClick?: (activity: XpActivity) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Activity type configuration.
 */
interface ActivityTypeConfig {
  icon: string;
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Configuration for each activity type.
 */
const ACTIVITY_TYPE_CONFIG: Record<XpActivityType, ActivityTypeConfig> = {
  slot_play: {
    icon: '🎰',
    label: 'Slots',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  table_play: {
    icon: '🃏',
    label: 'Table Games',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  mission_complete: {
    icon: '🎯',
    label: 'Mission',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  bonus: {
    icon: '🎁',
    label: 'Bonus',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  promotion: {
    icon: '✨',
    label: 'Promotion',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
  },
};

/**
 * Formats a timestamp to relative time.
 * @param timestamp - ISO date string
 * @returns Formatted relative time string
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * XPActivityItem component.
 * Displays a single XP earning activity with icon and timestamp.
 *
 * @param props - Component props
 * @returns XP activity item element
 *
 * @example
 * ```tsx
 * <XPActivityItem
 *   activity={slotPlayActivity}
 *   index={0}
 *   onClick={handleActivityClick}
 * />
 * ```
 */
export function XPActivityItem({
  activity,
  index = 0,
  onClick,
  className = '',
}: XPActivityItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = ACTIVITY_TYPE_CONFIG[activity.type];
  const isInteractive = Boolean(onClick);

  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(activity);
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center gap-3 p-3 rounded-lg
        bg-slate-800/30 hover:bg-slate-800/50
        transition-all duration-200
        ${isInteractive ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
        ${className}
      `}
    >
      {/* Activity type icon */}
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-full
          flex items-center justify-center
          ${config.bgColor}
        `}
      >
        <span className="text-lg">{config.icon}</span>
      </div>

      {/* Activity details */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${config.color}`}>
            {config.label}
          </span>
          {activity.reference && (
            <span className="text-xs text-gray-500 truncate">
              • {activity.reference.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-300 truncate">
          {activity.description}
        </p>
      </div>

      {/* XP earned */}
      <div className="flex-shrink-0 text-right">
        <motion.p
          initial={prefersReducedMotion ? false : { scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1, type: 'spring' }}
          className="text-lg font-bold text-green-400"
        >
          +{activity.xpEarned}
        </motion.p>
        <p className="text-xs text-gray-500">XP</p>
      </div>

      {/* Timestamp */}
      <div className="flex-shrink-0 w-16 text-right">
        <p className="text-xs text-gray-500">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </motion.div>
  );
}
