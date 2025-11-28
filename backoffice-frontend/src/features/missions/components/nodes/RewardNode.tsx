import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeData } from '../../../../services/api.types';

interface RewardNodeProps {
  data: NodeData;
  selected?: boolean;
}

/**
 * Custom Reward Node component (green) for the visual rule builder
 * NOTE: This component is deprecated. Use TaskBuilder component instead.
 * Now only supports Bonus Template reward type.
 */
export const RewardNode: React.FC<RewardNodeProps> = memo(({ data, selected }) => {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px]
        ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-green-300'}
        hover:shadow-lg transition-shadow
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium text-green-600 uppercase">Reward</div>
          <div className="text-sm font-semibold text-gray-900">
            {data.label || 'Set Reward'}
          </div>
        </div>
      </div>

      {/* Content - Now only shows bonus template info */}
      <div className="text-xs text-gray-600 space-y-1">
        {data.bonusTemplateId ? (
          <>
            <div className="flex items-center justify-between">
              <span className="font-medium">Type:</span>
              <span className="text-green-700">Bonus Template</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Template:</span>
              <span className="text-green-700 font-bold truncate max-w-[120px]" title={data.bonusTemplateName || data.bonusTemplateId || ''}>
                {data.bonusTemplateName || 'Selected'}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-1 text-gray-400 italic">
            No bonus template selected
          </div>
        )}
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-green-500 border-2 border-white"
      />
    </div>
  );
});

RewardNode.displayName = 'RewardNode';
