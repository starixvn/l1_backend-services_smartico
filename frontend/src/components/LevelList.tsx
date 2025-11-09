import { useLevels } from '../hooks/useLevels';
import { LevelBadge } from './LevelBadge';
import type { Level } from '../types/level';

interface LevelListProps {
  userId: string;
}

/**
 * Grid component displaying all levels visible to a user with status indicators.
 *
 * Determines each level's status:
 * - achieved: User has surpassed this level
 * - current: User's active level
 * - next: The immediate next level
 * - locked: Not yet visible to user
 *
 * @param userId - User identifier
 *
 * @example
 * ```tsx
 * <LevelList userId="user123" />
 * ```
 */
export function LevelList({ userId }: LevelListProps) {
  const { levels, userCurrentLevelId, isLoading, error, refetch } = useLevels(userId);

  /**
   * Determines the status of a level based on user's current level.
   */
  const getLevelStatus = (level: Level, index: number): 'achieved' | 'current' | 'next' | 'locked' => {
    if (level.id === userCurrentLevelId) {
      return 'current';
    }

    const currentLevelIndex = levels.findIndex((l) => l.id === userCurrentLevelId);

    if (index < currentLevelIndex) {
      return 'achieved';
    }

    if (index === currentLevelIndex + 1) {
      return 'next';
    }

    return 'locked';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Levels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Failed to load levels</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (levels.length === 0) {
    return (
      <div className="mt-8">
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">No levels available</p>
        </div>
      </div>
    );
  }

  // Success state - display levels grid
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">All Levels</h2>
        <button
          onClick={refetch}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Refresh levels"
        >
          🔄 Refresh
        </button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="list"
        aria-label="Level progression grid"
      >
        {levels.map((level, index) => (
          <div key={level.id} role="listitem">
            <LevelBadge level={level} status={getLevelStatus(level, index)} />
          </div>
        ))}
      </div>
    </div>
  );
}
