import { Mission, AchievementStatus } from '../types';

interface MissionCardProps {
  mission: Mission;
  onOptIn: (missionId: number) => void;
  onClaim: (missionId: number) => void;
  isLoading?: boolean;
}

export function MissionCard({ mission, onOptIn, onClaim, isLoading }: MissionCardProps) {
  const getStatusBadge = (status: AchievementStatus) => {
    const badges = {
      [AchievementStatus.Available]: { text: 'Available', color: 'bg-blue-100 text-blue-800' },
      [AchievementStatus.Active]: { text: 'Active', color: 'bg-green-100 text-green-800' },
      [AchievementStatus.Completed]: { text: 'Completed', color: 'bg-purple-100 text-purple-800' },
      [AchievementStatus.Expired]: { text: 'Expired', color: 'bg-gray-100 text-gray-800' },
      [AchievementStatus.Locked]: { text: 'Locked', color: 'bg-red-100 text-red-800' },
      [AchievementStatus.Claimed]: { text: 'Claimed', color: 'bg-yellow-100 text-yellow-800' },
    };
    return badges[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const statusBadge = getStatusBadge(mission.status);
  const canOptIn = mission.status === AchievementStatus.Available;
  const canClaim = mission.status === AchievementStatus.Completed;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{mission.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
          {statusBadge.text}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span className="font-medium">{mission.progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${mission.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks */}
      {mission.tasks && mission.tasks.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Tasks:</p>
          <ul className="space-y-1">
            {mission.tasks.slice(0, 3).map((task) => (
              <li key={task.id} className="text-sm text-gray-600 flex items-center">
                <span className={`mr-2 ${task.isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  {task.isCompleted ? '✓' : '○'}
                </span>
                <span className="flex-1">{task.description}</span>
                <span className="text-xs text-gray-500">
                  {task.currentValue}/{task.targetValue}
                </span>
              </li>
            ))}
            {mission.tasks.length > 3 && (
              <li className="text-sm text-gray-500 italic">
                +{mission.tasks.length - 3} more tasks...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Reward */}
      {mission.rewardAmount && (
        <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Reward:</span>{' '}
            {mission.rewardAmount} {mission.rewardCurrency || 'points'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        {canOptIn && (
          <button
            onClick={() => onOptIn(mission.id)}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Opt In'}
          </button>
        )}
        {canClaim && (
          <button
            onClick={() => onClaim(mission.id)}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Claim Reward'}
          </button>
        )}
      </div>

      {/* Meta Info */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        {mission.category && <span className="mr-3">📂 {mission.category}</span>}
        {mission.isRecurring && <span className="mr-3">🔄 Recurring</span>}
        {mission.completionCount > 0 && (
          <span>✓ Completed {mission.completionCount}x</span>
        )}
      </div>
    </div>
  );
}

