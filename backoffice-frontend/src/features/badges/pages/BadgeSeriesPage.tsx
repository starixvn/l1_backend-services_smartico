import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeSeriesList } from '../components/BadgeSeriesList';
import { badgeSeriesApi } from '../../../services/badgeSeriesApi';
import type { BadgeSeries } from '../../../services/api.types';

/**
 * Badge Series list page
 */
export const BadgeSeriesPage: React.FC = () => {
  const [seriesList, setSeriesList] = useState<BadgeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await badgeSeriesApi.getAllBadgeSeries();
      setSeriesList(data);
    } catch (err) {
      console.error('Error loading badge series:', err);
      setError('Failed to load badge series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
            <Link to="/badges" className="hover:text-primary-600">Badges</Link>
            <span>/</span>
            <span className="text-secondary-900">Series</span>
          </nav>
          <h1 className="text-2xl font-bold text-secondary-900">Badge Series</h1>
          <p className="text-secondary-600 mt-1">
            Organize badges into thematic collections
          </p>
        </div>
        <Link
          to="/badges/series/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          + Create Series
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
          <button
            onClick={loadSeries}
            className="mt-2 text-sm text-error underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Series List */}
      <BadgeSeriesList seriesList={seriesList} isLoading={loading} />
    </div>
  );
};
