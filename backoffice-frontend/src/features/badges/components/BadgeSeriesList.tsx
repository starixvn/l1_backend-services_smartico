import React from 'react';
import type { BadgeSeries } from '../../../services/api.types';
import { BadgeSeriesCard } from './BadgeSeriesCard';

interface BadgeSeriesListProps {
  seriesList: BadgeSeries[];
  isLoading?: boolean;
}

/**
 * Badge series list component for displaying a grid of series cards
 */
export const BadgeSeriesList: React.FC<BadgeSeriesListProps> = ({ seriesList, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-secondary-200 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-secondary-200" />
              <div className="flex-1">
                <div className="h-5 bg-secondary-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-secondary-200 rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-secondary-200 rounded w-full mb-2" />
            <div className="h-4 bg-secondary-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (seriesList.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary-50 rounded-lg">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          No badge series yet
        </h3>
        <p className="text-secondary-600">
          Create your first series to organize badges into collections
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {seriesList.map((series) => (
        <BadgeSeriesCard key={series.id} series={series} />
      ))}
    </div>
  );
};
