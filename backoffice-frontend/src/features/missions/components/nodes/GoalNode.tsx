import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeData } from '../../../../services/api.types';

interface GoalNodeProps {
  data: NodeData;
  selected?: boolean;
}

/**
 * Custom Goal Node component (purple) for the visual rule builder
 */
export const GoalNode: React.FC<GoalNodeProps> = memo(({ data, selected }) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
        ${selected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-300'}
        hover:shadow-lg transition-shadow
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-purple-600 uppercase">Goal</div>
          <div className="text-sm font-semibold text-gray-900">
            {data.label || 'Set Goal'}
          </div>
        </div>
      </div>

      {/* Content */}
      {data.goalType && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <span className="text-purple-700">
              {data.goalType === 'BetCount' && 'Bet Count'}
              {data.goalType === 'DepositAmount' && 'Deposit Amount'}
              {data.goalType === 'WageredAmount' && 'Wagered Amount'}
            </span>
          </div>
          {data.goalCount !== undefined && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Target:</span>
              <span className="text-purple-700 font-bold">
                {data.goalType === 'DepositAmount' || data.goalType === 'WageredAmount'
                  ? `$${data.goalCount}`
                  : `${data.goalCount}x`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-purple-500 border-2 border-white"
      />
    </div>
  );
});

GoalNode.displayName = 'GoalNode';
