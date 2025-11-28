import React, { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import type { NodeData, TriggerType, GoalType, Bonus } from '../../../services/api.types';
import { bonusApi } from '../../../services/bonusApi';

interface NodeConfigPanelProps {
  node: Node<NodeData> | null;
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

/**
 * Side panel for configuring selected nodes (Legacy - for visual rule builder)
 * NOTE: This component is deprecated and will be removed.
 * Use TaskBuilder component instead.
 */
export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [localData, setLocalData] = useState<NodeData>({});
  const [bonusTemplates, setBonusTemplates] = useState<Bonus[]>([]);
  const [loadingBonuses, setLoadingBonuses] = useState(false);

  // Load bonus templates when reward type is set
  useEffect(() => {
    if (node?.type === 'reward') {
      setLoadingBonuses(true);
      bonusApi.getAllBonuses()
        .then(bonuses => {
          // Filter to only show active bonus templates
          setBonusTemplates(bonuses.filter(b => b.status === 'Active' || b.status === 'Draft'));
        })
        .catch(console.error)
        .finally(() => setLoadingBonuses(false));
    }
  }, [node?.type]);

  // Only reset local data when node ID changes, not when data changes
  useEffect(() => {
    if (node) {
      setLocalData(node.data);
    } else {
      setLocalData({});
    }
  }, [node?.id]); // Changed from [node] to [node?.id]

  if (!node) {
    return (
      <div className="w-80 bg-secondary-50 border-l border-secondary-200 p-4 flex items-center justify-center">
        <div className="text-center text-secondary-500">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
          <p className="text-sm">Click a node to configure it</p>
        </div>
      </div>
    );
  }

  const handleUpdate = () => {
    onUpdate(node.id, localData);
  };

  const nodeType = node.type === 'trigger' ? 'Trigger' : node.type === 'goal' ? 'Goal' : 'Reward';

  return (
    <div className="w-80 bg-white border-l border-secondary-200 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">
          Configure {nodeType}
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-secondary-100 rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Label */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Label
        </label>
        <input
          type="text"
          value={localData.label || ''}
          onChange={(e) => setLocalData({ ...localData, label: e.target.value })}
          onBlur={handleUpdate}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Node label"
        />
      </div>

      {/* Trigger Configuration */}
      {node.type === 'trigger' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Trigger Type
            </label>
            <select
              value={localData.triggerType || ''}
              onChange={(e) => {
                setLocalData({ ...localData, triggerType: e.target.value as TriggerType });
                setTimeout(handleUpdate, 0);
              }}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select trigger type</option>
              <option value="BetPlaced">Bet Placed</option>
              <option value="DepositMade">Deposit Made</option>
              <option value="GamePlayed">Game Played</option>
            </select>
          </div>

          {localData.triggerType === 'GamePlayed' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Game ID (optional)
              </label>
              <input
                type="text"
                value={localData.gameId || ''}
                onChange={(e) => setLocalData({ ...localData, gameId: e.target.value })}
                onBlur={handleUpdate}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 123"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Threshold (optional)
            </label>
            <input
              type="number"
              value={localData.triggerThreshold || ''}
              onChange={(e) => setLocalData({ ...localData, triggerThreshold: parseFloat(e.target.value) })}
              onBlur={handleUpdate}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Minimum amount"
              min="0"
              step="0.01"
            />
          </div>
        </>
      )}

      {/* Goal Configuration */}
      {node.type === 'goal' && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Goal Type
            </label>
            <select
              value={localData.goalType || ''}
              onChange={(e) => {
                setLocalData({ ...localData, goalType: e.target.value as GoalType });
                setTimeout(handleUpdate, 0);
              }}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select goal type</option>
              <option value="BetCount">Bet Count</option>
              <option value="DepositAmount">Deposit Amount</option>
              <option value="WageredAmount">Wagered Amount</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {localData.goalType === 'DepositAmount' || localData.goalType === 'WageredAmount'
                ? 'Target Amount *'
                : 'Target Count *'}
            </label>
            <input
              type="number"
              value={localData.goalCount || ''}
              onChange={(e) => setLocalData({ ...localData, goalCount: parseInt(e.target.value) })}
              onBlur={handleUpdate}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={
                localData.goalType === 'BetCount'
                  ? 'Number of bets/spins'
                  : localData.goalType === 'DepositAmount'
                  ? 'Total deposit amount'
                  : localData.goalType === 'WageredAmount'
                  ? 'Total wagered amount'
                  : 'Enter target value'
              }
              min="1"
              step={localData.goalType === 'DepositAmount' || localData.goalType === 'WageredAmount' ? '0.01' : '1'}
            />
          </div>
        </>
      )}

      {/* Reward Configuration - Simplified to only BonusTemplate */}
      {node.type === 'reward' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Bonus Template (optional)
          </label>
          {loadingBonuses ? (
            <div className="flex items-center gap-2 text-secondary-500 text-sm py-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading bonus templates...
            </div>
          ) : (
            <select
              value={localData.bonusTemplateId || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedBonus = bonusTemplates.find(b => b.id === selectedId);
                setLocalData({
                  ...localData,
                  bonusTemplateId: selectedId || undefined,
                  bonusTemplateName: selectedBonus ? `${selectedBonus.name} (${selectedBonus.type})` : undefined,
                });
                setTimeout(handleUpdate, 0);
              }}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No bonus (use mission points)</option>
              {bonusTemplates.map((bonus) => (
                <option key={bonus.id} value={bonus.id}>
                  {bonus.name} ({bonus.type})
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-secondary-500 mt-1">
            Select a bonus template to grant on completion, or leave empty to only award mission points.
          </p>
          {bonusTemplates.length === 0 && !loadingBonuses && (
            <p className="text-xs text-amber-600 mt-1">
              No bonus templates available. Create one in the Bonuses section first.
            </p>
          )}
        </div>
      )}

      {/* Delete Button */}
      <div className="pt-4 border-t border-secondary-200">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
};
