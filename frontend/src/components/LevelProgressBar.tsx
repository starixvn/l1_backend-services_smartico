interface LevelProgressBarProps {
  currentPoints: number;
  requiredPoints: number;
  percentage: number | null;
  className?: string;
}

/**
 * Progress bar component for visualizing level progression.
 *
 * @param currentPoints - Current points in the level
 * @param requiredPoints - Total points needed to reach next level
 * @param percentage - Progress percentage (0-100), or null if max level
 * @param className - Optional additional CSS classes
 *
 * @example
 * ```tsx
 * <LevelProgressBar
 *   currentPoints={750}
 *   requiredPoints={1000}
 *   percentage={75}
 * />
 * ```
 */
export function LevelProgressBar({
  currentPoints,
  requiredPoints,
  percentage,
  className = '',
}: LevelProgressBarProps) {
  const isMaxLevel = percentage === null;
  const displayPercentage = isMaxLevel ? 100 : Math.max(0, Math.min(100, percentage));

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar container */}
      <div
        className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuenow={displayPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isMaxLevel ? 'Max level reached' : `Level progress: ${displayPercentage.toFixed(0)}%`}
      >
        {/* Progress fill */}
        <div
          className={`h-full transition-all duration-300 ease-out ${
            isMaxLevel
              ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600'
              : 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600'
          }`}
          style={{ width: `${displayPercentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="h-full w-full opacity-30 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>

        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-lg">
            {isMaxLevel ? (
              <span className="flex items-center gap-1">
                <span>👑</span>
                <span>Max Level</span>
              </span>
            ) : (
              `${displayPercentage.toFixed(0)}%`
            )}
          </span>
        </div>
      </div>

      {/* Points display */}
      {!isMaxLevel && (
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span>{currentPoints.toLocaleString()} points</span>
          <span>{requiredPoints.toLocaleString()} points to next level</span>
        </div>
      )}

      {isMaxLevel && (
        <div className="mt-2 text-center text-xs text-yellow-700 font-medium">
          You've reached the maximum level!
        </div>
      )}
    </div>
  );
}
