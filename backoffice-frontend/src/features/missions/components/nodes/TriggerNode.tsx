import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeData } from '../../../../services/api.types';

interface TriggerNodeProps {
  data: NodeData;
  selected?: boolean;
}

/**
 * Custom Trigger Node component (blue) for the visual rule builder
 */
export const TriggerNode: React.FC<TriggerNodeProps> = memo(({ data, selected }) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-300'}
        hover:shadow-lg transition-shadow
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-blue-600 uppercase">Trigger</div>
          <div className="text-sm font-semibold text-gray-900">
            {data.label || 'Select Trigger'}
          </div>
        </div>
      </div>

      {/* Content */}
      {data.triggerType && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">Type:</span>
            <span className="text-blue-700">
              {data.triggerType === 'BetPlaced' ? 'Bet Placed' :
               data.triggerType === 'DepositMade' ? 'Deposit Made' :
               'Game Played'}
            </span>
          </div>
          {data.gameId && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Game:</span>
              <span className="text-blue-700">{data.gameId}</span>
            </div>
          )}
          {data.triggerThreshold !== undefined && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Threshold:</span>
              <span className="text-blue-700">${data.triggerThreshold}</span>
            </div>
          )}
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-500 border-2 border-white"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
