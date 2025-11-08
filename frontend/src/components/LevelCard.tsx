import { useLevelProgress } from '../hooks/useLevelProgress';
import { LevelProgressBar } from './LevelProgressBar';

interface LevelCardProps {
  userId: string;
}

/**
 * Card component displaying user's current level progress.
 *
 * Shows:
 * - Current level name and badge image
 * - Level description
 * - Progress bar toward next level
 * - Points statistics
 *
 * Handles loading, error, and no-data states with appropriate UI feedback.
 *
 * @param userId - User identifier
 *
 * @example
 * ```tsx
 * <LevelCard userId="user123" />
 * ```
 */
export function LevelCard({ userId }: LevelCardProps) {
  const { data: progress, isLoading, error, refetch } = useLevelProgress(userId);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
        role="region"
        aria-label="Level progress loading"
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Loading your level progress...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="bg-white rounded-lg shadow-lg p-6 border border-red-200"
        role="region"
        aria-label="Level progress error"
      >
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Failed to load level progress</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Retry loading level progress"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // No data state (new user with 0 points)
  if (!progress) {
    return (
      <div
        className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
        role="region"
        aria-label="No level data"
      >
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Start Your Journey!</h3>
          <p className="text-gray-600">
            You haven't earned any points yet. Complete missions and activities to level up!
          </p>
        </div>
      </div>
    );
  }

  // Success state - display level progress
  const pointsInCurrentLevel = progress.totalPointsEarned - progress.currentLevelRequiredPoints;
  const pointsNeededForNext = progress.pointsToNextLevel ?? 0;

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
      role="region"
      aria-label={`Level progress: ${progress.currentLevelName}`}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Level Badge */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-md">
            {progress.currentLevelImage ? (
              <img
                src={progress.currentLevelImage}
                alt={`${progress.currentLevelName} badge`}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <span className="text-4xl">🏆</span>
            )}
          </div>

          {/* Level Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{progress.currentLevelName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {progress.totalPointsEarned.toLocaleString()} total points earned
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={refetch}
          className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Refresh level progress"
          title="Refresh"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <LevelProgressBar
        currentPoints={pointsInCurrentLevel}
        requiredPoints={pointsNeededForNext}
        percentage={progress.progressPercentage ?? null}
        className="mb-6"
      />

      {/* Next Level Info */}
      {!progress.isMaxLevel && progress.nextLevelName && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Next Level</p>
              <p className="text-lg font-bold text-gray-900">{progress.nextLevelName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Points Needed</p>
              <p className="text-lg font-bold text-blue-600">
                {progress.pointsToNextLevel?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Max Level Celebration */}
      {progress.isMaxLevel && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-center">
            <p className="text-2xl mb-2">👑</p>
            <p className="text-lg font-bold text-yellow-800">Maximum Level Reached!</p>
            <p className="text-sm text-yellow-700 mt-1">
              Congratulations! You've achieved the highest level possible.
            </p>
          </div>
        </div>
      )}

      {/* Advanced Level Counters (if present) */}
      {(progress.levelCounter1Current !== null ||
        progress.levelCounter2Current !== null) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-medium mb-2">Advanced Progression</p>
          <div className="grid grid-cols-2 gap-3">
            {progress.levelCounter1Current !== null && (
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600">Counter 1</p>
                <p className="text-sm font-bold text-gray-900">
                  {progress.levelCounter1Current}
                  {progress.levelCounter1Required && ` / ${progress.levelCounter1Required}`}
                </p>
              </div>
            )}
            {progress.levelCounter2Current !== null && (
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600">Counter 2</p>
                <p className="text-sm font-bold text-gray-900">
                  {progress.levelCounter2Current}
                  {progress.levelCounter2Required && ` / ${progress.levelCounter2Required}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
