import React from 'react';
import { Link } from 'react-router-dom';
import type { BadgeSeries } from '../../../services/api.types';
import { BadgeSeriesStatus } from '../../../services/api.types';

interface BadgeSeriesCardProps {
  series: BadgeSeries;
}

/**
 * Badge series card component for displaying series summary
 */
export const BadgeSeriesCard: React.FC<BadgeSeriesCardProps> = ({ series }) => {
  const getStatusColor = () => {
    switch (series.status) {
      case BadgeSeriesStatus.ACTIVE:
        return 'bg-success text-white';
      case BadgeSeriesStatus.DRAFT:
        return 'bg-yellow-500 text-white';
      case BadgeSeriesStatus.ARCHIVED:
        return 'bg-secondary-500 text-white';
      default:
        return 'bg-secondary-300 text-secondary-800';
    }
  };

  return (
    <Link to={`/badges/series/${series.id}`}>
      <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Series Icon */}
            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              {series.iconUrl ? (
                <img src={series.iconUrl} alt={series.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-2xl">📚</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                {series.name}
              </h3>
              <span className="text-xs text-secondary-500">
                Order: {series.displayOrder}
              </span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {series.status}
          </span>
        </div>

        {/* Description */}
        {series.description && (
          <p className="text-sm text-secondary-600 line-clamp-2 mb-4">
            {series.description}
          </p>
        )}

        {/* Badge Count */}
        <div className="border-t border-secondary-100 pt-4 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondary-500">Badges in series:</span>
            <span className="font-medium text-secondary-900">
              {series.badges?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
