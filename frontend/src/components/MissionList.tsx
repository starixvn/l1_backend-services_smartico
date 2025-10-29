import { Mission } from '../types';
import { MissionCard } from './MissionCard';

interface MissionListProps {
  missions: Mission[];
  onOptIn: (missionId: number) => void;
  onClaim: (missionId: number) => void;
  isLoading?: boolean;
  loadingMissionId?: number;
}

export function MissionList({
  missions,
  onOptIn,
  onClaim,
  isLoading,
  loadingMissionId,
}: MissionListProps) {
  if (missions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No missions available</h3>
        <p className="text-gray-600">Check back later for new missions!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onOptIn={onOptIn}
          onClaim={onClaim}
          isLoading={isLoading && loadingMissionId === mission.id}
        />
      ))}
    </div>
  );
}

