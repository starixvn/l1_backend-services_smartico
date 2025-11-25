import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MissionCard } from '../components/MissionCard';
import { missionApi } from '../../../services/missionApi';
import type { Mission } from '../../../services/api.types';

/**
 * Missions list page - displays all missions for the operator
 */
type StatusFilter = 'All' | 'Draft' | 'Active' | 'Completed' | 'Cancelled';

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await missionApi.getAllMissions();
      setMissions(data);
    } catch (err) {
      setError('Failed to load missions');
      console.error('Error loading missions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-secondary-600">Loading missions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Missions</h1>
          <p className="text-secondary-600 mt-1">
            Manage mission campaigns with visual rule builder
          </p>
        </div>
        <Link
          to="/missions/create"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Mission
        </Link>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-secondary-700">Status:</label>
          <div className="flex gap-2">
            {(['All', 'Draft', 'Active', 'Completed', 'Cancelled'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Missions List */}
      {(() => {
        const filteredMissions = statusFilter === 'All'
          ? missions
          : missions.filter(m => m.status === statusFilter);

        return filteredMissions.length === 0 ? (
          <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
            <svg
              className="w-16 h-16 text-secondary-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {missions.length === 0 ? 'No missions yet' : `No ${statusFilter} missions`}
            </h3>
            <p className="text-secondary-600 mb-4">
              {missions.length === 0
                ? 'Get started by creating your first mission campaign'
                : `There are no missions with status "${statusFilter}"`
              }
            </p>
            {missions.length === 0 && (
              <Link
                to="/missions/create"
                className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Create First Mission
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        );
      })()}
    </div>
  );
};
