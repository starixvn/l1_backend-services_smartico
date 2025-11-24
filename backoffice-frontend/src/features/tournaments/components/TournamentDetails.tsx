import React from 'react';
import type { Tournament } from '../../../services/api.types';
import { TournamentStatus } from '../../../services/api.types';

interface TournamentDetailsProps {
  tournament: Tournament;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Tournament details component showing full tournament information
 */
export const TournamentDetails: React.FC<TournamentDetailsProps> = ({
  tournament,
  onEdit,
  onDelete
}) => {
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    switch (tournament.status) {
      case TournamentStatus.ACTIVE:
        return 'bg-success text-white';
      case TournamentStatus.SCHEDULED:
        return 'bg-info text-white';
      case TournamentStatus.COMPLETED:
        return 'bg-secondary-500 text-white';
      case TournamentStatus.CANCELLED:
        return 'bg-error text-white';
      default:
        return 'bg-secondary-300 text-secondary-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b border-secondary-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              {tournament.name}
            </h1>
            {tournament.description && (
              <p className="text-secondary-600">{tournament.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 ml-6">
            <span
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                ${getStatusColor()}
              `}
            >
              {tournament.status}
            </span>
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 border border-error text-error rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-error"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tournament Type */}
          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Tournament Type</h3>
            <p className="text-lg font-semibold text-secondary-900">{tournament.type}</p>
          </div>

          {/* Scoring Type */}
          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Scoring Type</h3>
            <p className="text-lg font-semibold text-secondary-900">{tournament.scoringType}</p>
          </div>

          {/* Prize Pool */}
          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Total Prize Pool</h3>
            <p className="text-lg font-semibold text-success">
              ${tournament.prizePool.toLocaleString()}
            </p>
          </div>

          {/* Start Date */}
          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Start Date</h3>
            <p className="text-lg font-semibold text-secondary-900">{formatDate(startDate)}</p>
          </div>

          {/* End Date */}
          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">End Date</h3>
            <p className="text-lg font-semibold text-secondary-900">{formatDate(endDate)}</p>
          </div>

          {/* Max Participants */}
          <div>
            <h3 className="text-sm font-medium text-secondary-500 mb-2">Max Participants</h3>
            <p className="text-lg font-semibold text-secondary-900">
              {tournament.maxParticipants || 'Unlimited'}
            </p>
          </div>

          {/* Entry Fee */}
          {tournament.entryFee !== undefined && (
            <div>
              <h3 className="text-sm font-medium text-secondary-500 mb-2">Entry Fee</h3>
              <p className="text-lg font-semibold text-secondary-900">
                {tournament.entryFee > 0 ? `$${tournament.entryFee.toLocaleString()}` : 'Free'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Prize Distribution */}
      {tournament.prizeDistribution && tournament.prizeDistribution.length > 0 && (
        <div className="border-t border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Prize Distribution</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                    Prize Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-secondary-700">
                    Prize Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {tournament.prizeDistribution
                  .sort((a, b) => a.rank - b.rank)
                  .map((prize) => (
                    <tr key={prize.rank} className="border-b border-secondary-100">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-semibold">
                          {prize.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-secondary-900 font-semibold">
                        ${prize.prizeAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-700">
                          {prize.prizeType}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Eligible Games */}
      {tournament.eligibleGames && tournament.eligibleGames.length > 0 && (
        <div className="border-t border-secondary-200 p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">Eligible Games</h2>
          <div className="flex flex-wrap gap-2">
            {tournament.eligibleGames.map((game, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
              >
                {game}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t border-secondary-200 p-6 bg-secondary-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-secondary-500">Created: </span>
            <span className="text-secondary-900 font-medium">
              {new Date(tournament.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-secondary-500">Last Updated: </span>
            <span className="text-secondary-900 font-medium">
              {new Date(tournament.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
