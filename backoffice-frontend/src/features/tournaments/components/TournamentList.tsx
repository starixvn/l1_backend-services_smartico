import React, { useMemo, useState } from 'react';
import { TournamentCard } from './TournamentCard';
import type { Tournament } from '../../../services/api.types';
import { TournamentStatus, TournamentType } from '../../../services/api.types';

interface TournamentListProps {
  tournaments: Tournament[];
  isLoading?: boolean;
}

type FilterStatus = 'all' | TournamentStatus;
type FilterType = 'all' | TournamentType;

/**
 * Tournament list component with filtering
 */
export const TournamentList: React.FC<TournamentListProps> = ({
  tournaments,
  isLoading = false
}) => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tournaments based on selected filters
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      // Status filter
      if (statusFilter !== 'all' && tournament.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tournament.type !== typeFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = tournament.name.toLowerCase().includes(query);
        const descMatch = tournament.description?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [tournaments, statusFilter, typeFilter, searchQuery]);

  // Sort tournaments by start date (newest first)
  const sortedTournaments = useMemo(() => {
    return [...filteredTournaments].sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [filteredTournaments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-secondary-600">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-secondary-700">Status:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${statusFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter(TournamentStatus.ACTIVE)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${statusFilter === TournamentStatus.ACTIVE
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter(TournamentStatus.SCHEDULED)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${statusFilter === TournamentStatus.SCHEDULED
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter(TournamentStatus.COMPLETED)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${statusFilter === TournamentStatus.COMPLETED
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-secondary-700">Type:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${typeFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter(TournamentType.LEADERBOARD)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${typeFilter === TournamentType.LEADERBOARD
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setTypeFilter(TournamentType.KNOCKOUT)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${typeFilter === TournamentType.KNOCKOUT
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                Knockout
              </button>
              <button
                onClick={() => setTypeFilter(TournamentType.MISSION_BASED)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${typeFilter === TournamentType.MISSION_BASED
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                Mission Based
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-secondary-600">
          Showing {sortedTournaments.length} of {tournaments.length} tournaments
        </div>
      </div>

      {/* Tournament Grid */}
      {sortedTournaments.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-secondary-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No tournaments found</h3>
          <p className="text-secondary-600">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first tournament to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      )}
    </div>
  );
};
