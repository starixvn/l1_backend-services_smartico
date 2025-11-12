/**
 * ActiveMissionsWidget Component
 * Displays list of active missions with progress bars.
 */

import { AnimatedCard } from '../shared/AnimatedCard';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { EmptyState } from '../shared/EmptyState';
import { useDashboardData } from '../../../hooks/useDashboardData';

/**
 * ActiveMissionsWidget component.
 * Shows up to 5 active missions with progress.
 */
export function ActiveMissionsWidget() {
  const { data, isLoading } = useDashboardData();

  // Get active missions (limit to 5)
  const missions = data?.missions?.slice(0, 5) || [];

  // TODO: Add SignalR listener for mission progress updates
  // useEffect(() => {
  //   const handleMissionProgress = (event: MissionProgressEvent) => {
  //     // Update mission progress in real-time
  //   };
  //   signalrService.on('mission-progress', handleMissionProgress);
  //   return () => signalrService.off('mission-progress', handleMissionProgress);
  // }, []);

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="text" lines={1} className="mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <SkeletonLoader variant="text" lines={2} />
            <SkeletonLoader variant="rectangular" height="0.75rem" className="mt-2" />
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
          <span className="text-2xl">📋</span>
          Active Missions
        </h3>
        <span className="text-sm text-gray-400">{missions.length} active</span>
      </div>

      {/* Mission List */}
      {missions.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title="No Active Missions"
          description="Complete available missions to start your journey"
        />
      ) : (
        <div className="space-y-4">
          {missions.map((mission, index) => (
            <div
              key={mission.id}
              className="group hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              {/* Mission Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {mission.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">{mission.description}</p>
                </div>
                {mission.isCompleted && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {mission.currentValue} / {mission.targetValue}
                  </span>
                  <span className="text-purple-400 font-semibold">
                    {mission.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${mission.progress}%`,
                      background: mission.isCompleted
                        ? 'linear-gradient(to right, #10b981, #059669)'
                        : 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                    }}
                  >
                    {/* Shine effect */}
                    {!mission.isCompleted && (
                      <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    )}
                  </div>
                </div>
                {mission.rewardPoints > 0 && (
                  <div className="flex items-center justify-end">
                    <span className="text-xs text-yellow-400">
                      +{mission.rewardPoints} pts
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Button */}
      {missions.length > 0 && (
        <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-purple-300 font-medium border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900">
          View All Missions →
        </button>
      )}
    </AnimatedCard>
  );
}
