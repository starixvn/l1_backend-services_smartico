/**
 * LeaderboardWidget Component
 * Displays top 10 player rankings with current user highlight.
 */

import { AnimatedCard } from '../shared/AnimatedCard';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { EmptyState } from '../shared/EmptyState';
import { useDashboardData } from '../../../hooks/useDashboardData';

/**
 * Get medal emoji for top 3 positions.
 */
function getMedalEmoji(rank: number): string | null {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return null;
  }
}

/**
 * LeaderboardWidget component.
 * Shows top 10 players with points.
 */
export function LeaderboardWidget() {
  const { data, isLoading } = useDashboardData();

  const leaderboard = data?.leaderboard || [];

  // TODO: Add SignalR listener for leaderboard updates
  // useEffect(() => {
  //   const handleLeaderboardUpdate = () => {
  //     // Refresh leaderboard data
  //   };
  //   signalrService.on('leaderboard-update', handleLeaderboardUpdate);
  //   return () => signalrService.off('leaderboard-update', handleLeaderboardUpdate);
  // }, []);

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="text" lines={1} className="mb-4" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="mb-3">
            <SkeletonLoader variant="text" lines={1} />
          </div>
        ))}
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Leaderboard
        </h3>
        <span className="text-sm text-gray-400">Top Players</span>
      </div>

      {/* Leaderboard List */}
      {leaderboard.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          title="No Rankings Available"
          description="Leaderboard data will appear here"
        />
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const medal = getMedalEmoji(entry.rank);
            const isCurrentUser = entry.isCurrentUser;

            return (
              <div
                key={`${entry.rank}-${entry.username}`}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 ring-2 ring-purple-500/30'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 text-center">
                  {medal ? (
                    <span className="text-2xl">{medal}</span>
                  ) : (
                    <span className={`text-sm font-bold ${isCurrentUser ? 'text-purple-400' : 'text-gray-400'}`}>
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCurrentUser
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                      : 'bg-slate-700 text-gray-300'
                  }`}>
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${
                      isCurrentUser ? 'text-white' : 'text-gray-300'
                    }`}>
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className={`text-sm font-bold ${
                      isCurrentUser ? 'text-purple-300' : 'text-gray-400'
                    }`}>
                      {entry.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Full Leaderboard Button */}
      {leaderboard.length > 0 && (
        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 font-medium border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900">
          View Full Leaderboard →
        </button>
      )}
    </AnimatedCard>
  );
}
