import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BadgeList } from '../components/BadgeList';
import { badgeApi } from '../../../services/badgeApi';
import type { Badge } from '../../../services/api.types';
import { BadgeStatus } from '../../../services/api.types';

/**
 * Badges list page
 */
export const BadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | BadgeStatus>('all');

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await badgeApi.getAllBadges();
      setBadges(data);
    } catch (err) {
      console.error('Error loading badges:', err);
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = filter === 'all'
    ? badges
    : badges.filter(b => b.status === filter);

  const badgeCounts = {
    all: badges.length,
    [BadgeStatus.DRAFT]: badges.filter(b => b.status === BadgeStatus.DRAFT).length,
    [BadgeStatus.ACTIVE]: badges.filter(b => b.status === BadgeStatus.ACTIVE).length,
    [BadgeStatus.ARCHIVED]: badges.filter(b => b.status === BadgeStatus.ARCHIVED).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Badges</h1>
          <p className="text-secondary-600 mt-1">
            Create and manage player badges and achievements
          </p>
        </div>
        <Link
          to="/badges/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          + Create Badge
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
          <button
            onClick={loadBadges}
            className="mt-2 text-sm text-error underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-secondary-200 pb-2">
        {[
          { key: 'all', label: 'All' },
          { key: BadgeStatus.ACTIVE, label: 'Active' },
          { key: BadgeStatus.DRAFT, label: 'Draft' },
          { key: BadgeStatus.ARCHIVED, label: 'Archived' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              filter === key
                ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            }`}
          >
            {label} ({badgeCounts[key as keyof typeof badgeCounts]})
          </button>
        ))}
      </div>

      {/* Badge List */}
      <BadgeList badges={filteredBadges} isLoading={loading} />

      {/* Series Link */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-secondary-900">Badge Series</h3>
            <p className="text-sm text-secondary-600">
              Organize badges into thematic collections
            </p>
          </div>
          <Link
            to="/badges/series"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Manage Series →
          </Link>
        </div>
      </div>
    </div>
  );
};
