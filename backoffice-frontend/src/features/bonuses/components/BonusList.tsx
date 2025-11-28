import React from 'react';
import { Link } from 'react-router-dom';
import type { Bonus, BonusType, BonusStatus } from '../../../services/api.types';

interface BonusListProps {
  bonuses: Bonus[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onActivate?: (id: string) => void;
  onPause?: (id: string) => void;
}

const statusColors: Record<BonusStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Active: 'bg-green-100 text-green-800',
  Paused: 'bg-yellow-100 text-yellow-800',
  Expired: 'bg-red-100 text-red-800',
  Cancelled: 'bg-red-100 text-red-800'
};

const typeConfig: Record<BonusType, { label: string; icon: string; color: string }> = {
  FreeSpins: { label: 'Free Spins', icon: '🎰', color: 'bg-orange-100 text-orange-800' },
  Cash: { label: 'Cash', icon: '💵', color: 'bg-green-100 text-green-800' },
  Points: { label: 'Points', icon: '⭐', color: 'bg-purple-100 text-purple-800' }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getBonusValue = (bonus: Bonus): string => {
  switch (bonus.type) {
    case 'FreeSpins':
      return bonus.freeSpins
        ? `${bonus.freeSpins.numberOfSpins} spins @ $${bonus.freeSpins.spinValue}`
        : '-';
    case 'Cash':
      return bonus.cash
        ? `$${bonus.cash.amount}`
        : '-';
    case 'Points':
      return bonus.points
        ? `${bonus.points.amount} pts`
        : '-';
    default:
      return '-';
  }
};

export const BonusList: React.FC<BonusListProps> = ({
  bonuses,
  isLoading,
  onDelete,
  onActivate,
  onPause
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-secondary-600">Loading bonuses...</span>
        </div>
      </div>
    );
  }

  if (bonuses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-secondary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-secondary-900">No bonuses yet</h3>
        <p className="mt-2 text-secondary-600">
          Get started by creating your first bonus template.
        </p>
        <Link
          to="/bonuses/create"
          className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Bonus
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
      <table className="min-w-full divide-y divide-secondary-200">
        <thead className="bg-secondary-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Period
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-secondary-200">
          {bonuses.map((bonus) => {
            const config = typeConfig[bonus.type];
            return (
              <tr key={bonus.id} className="hover:bg-secondary-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/bonuses/${bonus.id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    {bonus.name}
                  </Link>
                  {bonus.description && (
                    <p className="text-xs text-secondary-500 mt-1 truncate max-w-xs">
                      {bonus.description}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
                    <span>{config.icon}</span>
                    {config.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {getBonusValue(bonus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[bonus.status]}`}>
                    {bonus.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                  {formatDate(bonus.startDate)} - {formatDate(bonus.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/bonuses/edit/${bonus.id}`}
                      className="text-secondary-600 hover:text-primary-600"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>

                    {bonus.status === 'Draft' && onActivate && (
                      <button
                        onClick={() => onActivate(bonus.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Activate"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}

                    {bonus.status === 'Active' && onPause && (
                      <button
                        onClick={() => onPause(bonus.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Pause"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}

                    {bonus.status === 'Paused' && onActivate && (
                      <button
                        onClick={() => onActivate(bonus.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Resume"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}

                    {onDelete && bonus.status === 'Draft' && (
                      <button
                        onClick={() => onDelete(bonus.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
