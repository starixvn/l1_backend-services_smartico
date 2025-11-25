import React from 'react';
import { Link } from 'react-router-dom';
import type { Mission } from '../../../services/api.types';
import { MissionStatus } from '../../../services/api.types';

interface MissionCardProps {
  mission: Mission;
}

/**
 * Mission card component for displaying mission summary
 */
export const MissionCard: React.FC<MissionCardProps> = ({ mission }) => {
  const startDate = new Date(mission.startDate);
  const endDate = new Date(mission.endDate);
  const now = new Date();

  const isActive = mission.status === MissionStatus.ACTIVE;
  const isDraft = mission.status === MissionStatus.DRAFT;

  const getStatusColor = () => {
    switch (mission.status) {
      case MissionStatus.ACTIVE:
        return 'bg-success text-white';
      case MissionStatus.DRAFT:
        return 'bg-yellow-500 text-white';
      case MissionStatus.COMPLETED:
        return 'bg-secondary-500 text-white';
      case MissionStatus.CANCELLED:
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
    if (isDraft) {
      return 'Not published';
    }
    return null;
  };

  const getTriggerCount = () => {
    return mission.rule.nodes.filter(n => n.type === 'Trigger').length;
  };

  const getGoalCount = () => {
    return mission.rule.nodes.filter(n => n.type === 'Goal').length;
  };

  const getRewardCount = () => {
    return mission.rule.nodes.filter(n => n.type === 'Reward').length;
  };

  return (
    <Link to={`/missions/${mission.id}`}>
      <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-secondary-900 mb-1">
              {mission.name}
            </h3>
            {mission.description && (
              <p className="text-sm text-secondary-600 line-clamp-2">
                {mission.description}
              </p>
            )}
          </div>
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium ml-4 flex-shrink-0
              ${getStatusColor()}
            `}
          >
            {mission.status}
          </span>
        </div>

        {/* Mission Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-secondary-500 mb-1">Target</p>
            <p className="text-sm font-medium text-secondary-900">
              {mission.targetSegment === 'AllPlayers' ? 'All Players' : 'VIP Only'}
            </p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Triggers</p>
            <p className="text-sm font-medium text-secondary-900">{getTriggerCount()}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Goals</p>
            <p className="text-sm font-medium text-secondary-900">{getGoalCount()}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-500 mb-1">Rewards</p>
            <p className="text-sm font-medium text-secondary-900">{getRewardCount()}</p>
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

          {/* Days Remaining / Status Info */}
          {getDaysRemaining() && (
            <div className="mt-2 text-center">
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                isDraft ? 'bg-yellow-50 text-yellow-700' : 'bg-primary-50 text-primary-700'
              }`}>
                {getDaysRemaining()}
              </span>
            </div>
          )}
        </div>

        {/* Rule Complexity */}
        <div className="mt-4 pt-4 border-t border-secondary-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-600">Total Nodes:</span>
            <span className="text-sm font-semibold text-secondary-900">
              {mission.rule.nodes.length}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
