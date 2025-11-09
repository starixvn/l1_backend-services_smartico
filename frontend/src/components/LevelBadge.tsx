import type { Level } from '../types/level';

type LevelStatus = 'achieved' | 'current' | 'next' | 'locked';

interface LevelBadgeProps {
  level: Level;
  status: LevelStatus;
}

/**
 * Badge component displaying a single level with visual status indicators.
 *
 * @param level - Level data (name, description, image, required points)
 * @param status - Visual status: 'achieved' (green), 'current' (blue), 'next' (yellow), 'locked' (gray)
 *
 * @example
 * ```tsx
 * <LevelBadge level={goldLevel} status="current" />
 * ```
 */
export function LevelBadge({ level, status }: LevelBadgeProps) {
  const statusStyles = {
    achieved: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      textColor: 'text-green-900',
      badgeBg: 'bg-green-100',
      icon: '✓',
    },
    current: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      textColor: 'text-blue-900',
      badgeBg: 'bg-blue-100',
      icon: '⭐',
    },
    next: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      textColor: 'text-yellow-900',
      badgeBg: 'bg-yellow-100',
      icon: '→',
    },
    locked: {
      border: 'border-gray-300',
      bg: 'bg-gray-50',
      textColor: 'text-gray-500',
      badgeBg: 'bg-gray-100',
      icon: '🔒',
    },
  };

  const style = statusStyles[status];

  const statusLabels = {
    achieved: 'Achieved',
    current: 'Current Level',
    next: 'Next Level',
    locked: 'Locked',
  };

  return (
    <div
      className={`relative rounded-lg border-2 ${style.border} ${style.bg} p-4 transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}
      tabIndex={0}
      role="article"
      aria-label={`${level.name} level - ${statusLabels[status]}`}
    >
      {/* Status Badge */}
      <div className={`absolute top-2 right-2 ${style.badgeBg} px-2 py-1 rounded text-xs font-medium ${style.textColor}`}>
        {style.icon} {statusLabels[status]}
      </div>

      {/* Level Image */}
      <div className="flex justify-center mb-3 mt-2">
        <div className={`w-16 h-16 rounded-full ${style.badgeBg} flex items-center justify-center shadow-md`}>
          {level.image ? (
            <img
              src={level.image}
              alt={`${level.name} level badge`}
              className="w-12 h-12 object-contain"
            />
          ) : (
            <span className="text-2xl">{style.icon}</span>
          )}
        </div>
      </div>

      {/* Level Name */}
      <h3 className={`text-center text-lg font-bold ${style.textColor} mb-1`}>
        {level.name}
      </h3>

      {/* Required Points */}
      <p className={`text-center text-sm ${style.textColor} opacity-80 mb-2`}>
        {level.requiredPoints.toLocaleString()} points
      </p>

      {/* Description */}
      <p className="text-xs text-gray-600 text-center line-clamp-2" title={level.description}>
        {level.description}
      </p>
    </div>
  );
}
