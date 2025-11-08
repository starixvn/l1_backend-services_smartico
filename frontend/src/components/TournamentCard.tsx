import type { Tournament } from '../types/tournament';
import {
  getRegistrationTypeLabel,
  getStatusLabel,
  getStatusColor,
  formatTimeRemaining,
  formatTimeUntilStart,
  TournamentStatus,
  TournamentRibbonType,
} from '../types/tournament';

interface TournamentCardProps {
  tournament: Tournament;
  onRegister?: (tournamentId: number) => void;
  onViewDetails?: (tournamentId: number) => void;
  onViewLeaderboard?: (tournamentId: number) => void;
  isLoading?: boolean;
}

export function TournamentCard({ tournament, onRegister, onViewDetails, onViewLeaderboard, isLoading }: TournamentCardProps) {
  const statusColor = getStatusColor(tournament.status);
  const isUpcoming = tournament.status === TournamentStatus.Published || tournament.status === TournamentStatus.Register;
  const isActive = tournament.status === TournamentStatus.Started;

  const ribbonLabel = tournament.ribbon
    ? tournament.ribbon === TournamentRibbonType.Hot
      ? '🔥 HOT'
      : tournament.ribbon === TournamentRibbonType.New
      ? '✨ NEW'
      : tournament.ribbon === TournamentRibbonType.Sale
      ? '💰 SALE'
      : tournament.ribbon === TournamentRibbonType.Vip
      ? '👑 VIP'
      : null
    : null;

  const registrationLabel = tournament.canRegister
    ? tournament.registrationCost
      ? `Register (${tournament.registrationCost} ${getRegistrationTypeLabel(tournament.registrationType)})`
      : 'Register Free'
    : tournament.isUserRegistered
    ? '✓ Registered'
    : 'Registration Closed';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      {/* Ribbon */}
      {ribbonLabel && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            {ribbonLabel}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
        {tournament.primaryImage ? (
          <img
            src={tournament.primaryImage}
            alt={tournament.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">🏆</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md bg-${statusColor}-600`}
          >
            {getStatusLabel(tournament.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{tournament.name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tournament.description}</p>

        {/* Prize Pool */}
        {tournament.prizePoolSummary && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-2 mb-3">
            <p className="text-sm font-medium text-orange-800 text-center">{tournament.prizePoolSummary}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500 text-xs">Participants</p>
            <p className="font-semibold text-gray-900">
              {tournament.registrationCount}
              {tournament.maxPlayers && ` / ${tournament.maxPlayers}`}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500 text-xs">Entry Fee</p>
            <p className="font-semibold text-gray-900">
              {tournament.registrationCost
                ? `${tournament.registrationCost} ${getRegistrationTypeLabel(tournament.registrationType)}`
                : 'Free'}
            </p>
          </div>
        </div>

        {/* Time Info */}
        <div className="mb-3">
          {isUpcoming && (
            <p className="text-sm text-blue-600 font-medium">⏰ {formatTimeUntilStart(tournament.startTime)}</p>
          )}
          {isActive && <p className="text-sm text-green-600 font-medium">⏱️ {formatTimeRemaining(tournament.endTime)}</p>}
          {tournament.isFinished && <p className="text-sm text-gray-500">✓ Tournament Completed</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {onRegister && tournament.canRegister && !tournament.isUserRegistered && (
              <button
                onClick={() => onRegister(tournament.instanceId)}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isLoading ? 'Registering...' : registrationLabel}
              </button>
            )}

            {tournament.isUserRegistered && (
              <div className="flex-1 py-2 px-4 rounded-lg font-medium bg-green-100 text-green-800 text-center border border-green-300">
                ✓ Registered
              </div>
            )}

            {onViewDetails && (
              <button
                onClick={() => onViewDetails(tournament.instanceId)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                View Details
              </button>
            )}
          </div>

          {/* View Leaderboard Button */}
          {onViewLeaderboard && (isActive || tournament.isFinished) && (
            <button
              onClick={() => onViewLeaderboard(tournament.instanceId)}
              className="w-full py-2 px-4 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              📊 View Leaderboard
            </button>
          )}
        </div>

        {/* User Position (if registered) */}
        {tournament.currentUserParticipation && tournament.currentUserParticipation.position > 0 && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Your Position:</span> #{tournament.currentUserParticipation.position} -{' '}
              {tournament.currentUserParticipation.score} points
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
