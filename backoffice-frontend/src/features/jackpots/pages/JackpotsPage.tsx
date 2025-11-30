import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JackpotList } from '../components/JackpotList';
import { jackpotApi } from '../../../services/jackpotApi';
import type { Jackpot } from '../../../services/api.types';
import { JackpotStatus } from '../../../services/api.types';

/**
 * Jackpots list page
 */
export const JackpotsPage: React.FC = () => {
  const [jackpots, setJackpots] = useState<Jackpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | JackpotStatus>('all');

  useEffect(() => {
    loadJackpots();
  }, []);

  const loadJackpots = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jackpotApi.getAllJackpots();
      setJackpots(data);
    } catch (err) {
      console.error('Error loading jackpots:', err);
      setError('Failed to load jackpots');
    } finally {
      setLoading(false);
    }
  };

  const filteredJackpots = filter === 'all'
    ? jackpots
    : jackpots.filter(j => j.status === filter);

  const jackpotCounts = {
    all: jackpots.length,
    [JackpotStatus.DRAFT]: jackpots.filter(j => j.status === JackpotStatus.DRAFT).length,
    [JackpotStatus.ACTIVE]: jackpots.filter(j => j.status === JackpotStatus.ACTIVE).length,
    [JackpotStatus.PAUSED]: jackpots.filter(j => j.status === JackpotStatus.PAUSED).length,
    [JackpotStatus.COMPLETED]: jackpots.filter(j => j.status === JackpotStatus.COMPLETED).length,
    [JackpotStatus.ARCHIVED]: jackpots.filter(j => j.status === JackpotStatus.ARCHIVED).length
  };

  // Calculate total value across all active jackpots
  const totalActiveValue = jackpots
    .filter(j => j.status === JackpotStatus.ACTIVE)
    .reduce((sum, j) => sum + j.tiers.reduce((s, t) => s + t.currentValue, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Jackpots</h1>
          <p className="text-secondary-600 mt-1">
            Configure progressive and fixed jackpots with multi-tier support
          </p>
        </div>
        <Link
          to="/jackpots/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          + Create Jackpot
        </Link>
      </div>

      {/* Summary Stats */}
      {jackpots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-secondary-200">
            <p className="text-sm text-secondary-500 mb-1">Total Active Jackpots</p>
            <p className="text-2xl font-bold text-secondary-900">
              {jackpotCounts[JackpotStatus.ACTIVE]}
            </p>
          </div>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
            <p className="text-sm text-primary-600 mb-1">Total Active Value</p>
            <p className="text-2xl font-bold text-primary-700">
              ${totalActiveValue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-secondary-200">
            <p className="text-sm text-secondary-500 mb-1">Total Jackpots</p>
            <p className="text-2xl font-bold text-secondary-900">
              {jackpotCounts.all}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
          <button
            onClick={loadJackpots}
            className="mt-2 text-sm text-error underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-secondary-200 pb-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All' },
          { key: JackpotStatus.ACTIVE, label: 'Active' },
          { key: JackpotStatus.PAUSED, label: 'Paused' },
          { key: JackpotStatus.DRAFT, label: 'Draft' },
          { key: JackpotStatus.COMPLETED, label: 'Completed' },
          { key: JackpotStatus.ARCHIVED, label: 'Archived' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
              filter === key
                ? 'bg-primary-100 text-primary-700 border-b-2 border-primary-600'
                : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50'
            }`}
          >
            {label} ({jackpotCounts[key as keyof typeof jackpotCounts]})
          </button>
        ))}
      </div>

      {/* Jackpot List */}
      <JackpotList jackpots={filteredJackpots} isLoading={loading} />
    </div>
  );
};
