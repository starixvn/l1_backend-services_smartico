import React from 'react';
import { Link } from 'react-router-dom';
import type { Tournament } from '../../../services/api.types';
import { TournamentStatus } from '../../../services/api.types';

interface TournamentCardProps {
  tournament: Tournament;
}

/**
 * Tournament card component for displaying tournament summary
 */
export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  const now = new Date();

  const isActive = tournament.status === TournamentStatus.ACTIVE;
  const isUpcoming = tournament.status === TournamentStatus.SCHEDULED;

  const getStatusColor = () => {
    switch (tournament.status) {
      case TournamentStatus.ACTIVE:
        return 'bg-success text-white';
      case TournamentStatus.DRAFT:
        return 'bg-yellow-500 text-white';
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = () => {
    if (isActive) {
      const diff = endDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} days remaining` : 'Ending soon';
    }
    if (isUpcoming) {
      const diff = startDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? `Starts in ${days} days` : 'Starting soon';
    }
    return null;
  };

  return (
    <Link to={`/tournaments/${tournament.id}`}>
      <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-secondary-900 mb-1">
              {tournament.name}
            </h3>
            {tournament.description && (
              <p className="text-sm text-secondary-600 line-clamp-2">
                {tournament.description}
              </p>
            )}
          </div>
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium ml-4 flex-shrink-0
              ${getStatusColor()}
            `}
          >
            {tournament.status}
          </span>
        </div>

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-secondary-500 mb-1">Type</p>
            <p className="text-sm font-medium text-secondary-900">{tournament.type}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Scoring</p>
            <p className="text-sm font-medium text-secondary-900">{tournament.scoringType}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Prize Pool</p>
            <p className="text-sm font-medium text-success">
              ${tournament.prizePool.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Participants</p>
            <p className="text-sm font-medium text-secondary-900">
              {tournament.maxParticipants
                ? `Max ${tournament.maxParticipants}`
                : 'Unlimited'}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="border-t border-secondary-100 pt-4 mt-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-secondary-500">Start: </span>
              <span className="text-secondary-900 font-medium">
                {formatDate(startDate)}
              </span>
            </div>
            <div>
              <span className="text-secondary-500">End: </span>
              <span className="text-secondary-900 font-medium">
                {formatDate(endDate)}
              </span>
            </div>
          </div>

          {/* Days Remaining */}
          {getDaysRemaining() && (
            <div className="mt-2 text-center">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                {getDaysRemaining()}
              </span>
            </div>
          )}
        </div>

        {/* Entry Fee */}
        {tournament.entryFee && tournament.entryFee > 0 && (
          <div className="mt-4 pt-4 border-t border-secondary-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-600">Entry Fee:</span>
              <span className="text-sm font-semibold text-secondary-900">
                ${tournament.entryFee.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};
