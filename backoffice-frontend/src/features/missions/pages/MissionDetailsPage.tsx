import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactFlow, { Controls, Background, BackgroundVariant } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { missionApi } from '../../../services/missionApi';
import type { Mission } from '../../../services/api.types';
import { TriggerNode } from '../components/nodes/TriggerNode';
import { GoalNode } from '../components/nodes/GoalNode';
import { RewardNode } from '../components/nodes/RewardNode';
import { TriggerType as TriggerTypeEnum, GoalType as GoalTypeEnum } from '../../../services/api.types';

const nodeTypes = {
  trigger: TriggerNode,
  goal: GoalNode,
  reward: RewardNode,
};

/**
 * Mission details page with task list or read-only visual rule display
 */
export const MissionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id) {
      loadMission(id);
    }
  }, [id]);

  const loadMission = async (missionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await missionApi.getMissionById(missionId);
      setMission(data);
    } catch (err) {
      setError('Failed to load mission');
      console.error('Error loading mission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!id || !mission) return;

    try {
      setPublishing(true);
      setError(null);
      await missionApi.publishMission(id);
      // Reload mission to get updated status
      await loadMission(id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to publish mission');
      console.error('Error publishing mission:', err);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-secondary-600">Loading mission...</p>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error || 'Mission not found'}
        </div>
        <Link
          to="/missions"
          className="mt-4 inline-block text-primary-600 hover:text-primary-700"
        >
          ← Back to Missions
        </Link>
      </div>
    );
  }

  // Check if mission uses new task-based format
  const hasTaskBasedFormat = mission.tasks && mission.tasks.length > 0;

  // Convert mission rule to React Flow format (for legacy missions)
  const nodes: Node[] = mission.rule?.nodes?.map((n) => ({
    ...n,
    type: n.type.toLowerCase() as 'trigger' | 'goal' | 'reward',
  })) || [];

  const edges: Edge[] = mission.rule?.edges?.map((e) => ({
    ...e,
    type: 'smoothstep',
    animated: true,
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case TriggerTypeEnum.BET_PLACED: return 'Bet Placed';
      case TriggerTypeEnum.DEPOSIT_MADE: return 'Deposit Made';
      case TriggerTypeEnum.GAME_PLAYED: return 'Game Played';
      default: return type;
    }
  };

  const getGoalLabel = (type: string) => {
    switch (type) {
      case GoalTypeEnum.BET_COUNT: return 'Bet Count';
      case GoalTypeEnum.DEPOSIT_AMOUNT: return 'Deposit Amount';
      case GoalTypeEnum.WAGERED_AMOUNT: return 'Wagered Amount';
      case GoalTypeEnum.TURNOVER_AMOUNT: return 'Turnover Amount';
      default: return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/missions')}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-secondary-900">{mission.name}</h1>
              <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(mission.status)}`}>
                {mission.status}
              </span>
            </div>
          </div>
          {mission.status === 'Draft' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/missions/edit/${mission.id}`)}
                className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Mission
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {publishing ? 'Publishing...' : 'Publish Mission'}
              </button>
            </div>
          )}
        </div>
        {mission.description && (
          <p className="text-secondary-600 ml-14">{mission.description}</p>
        )}
      </div>

      {/* Mission Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Details</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-secondary-500">Target Segment</div>
              <div className="text-secondary-900 font-medium">
                {mission.targetSegment === 'AllPlayers' ? 'All Players' : 'VIP Only'}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Completion Points</div>
              <div className="text-secondary-900 font-medium">
                {mission.completionPoints || 0} points
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Start Date</div>
              <div className="text-secondary-900 font-medium">
                {new Date(mission.startDate).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">End Date</div>
              <div className="text-secondary-900 font-medium">
                {new Date(mission.endDate).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Statistics</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-secondary-500">Tasks</div>
              <div className="text-secondary-900 font-medium">
                {mission.tasks?.length || 0} tasks
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Bonus Rewards</div>
              <div className="text-secondary-900 font-medium">
                {mission.tasks?.filter(t => t.bonusTemplateId).length || 0} tasks with bonus
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Created</div>
              <div className="text-secondary-900 font-medium">
                {new Date(mission.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary-500">Last Updated</div>
              <div className="text-secondary-900 font-medium">
                {new Date(mission.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task-based display or Legacy visual rule display */}
      {hasTaskBasedFormat ? (
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Mission Tasks</h2>
          <div className="space-y-4">
            {mission.tasks.map((task, index) => (
              <div
                key={task.id}
                className="border border-secondary-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900">{task.name}</h3>
                    {task.description && (
                      <p className="text-sm text-secondary-600 mt-1">{task.description}</p>
                    )}
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 rounded p-2">
                        <div className="text-xs text-blue-600 font-medium">Trigger</div>
                        <div className="text-blue-800">
                          {getTriggerLabel(task.trigger.type)}
                          {task.trigger.minAmount && ` (min: $${task.trigger.minAmount})`}
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded p-2">
                        <div className="text-xs text-amber-600 font-medium">Goal</div>
                        <div className="text-amber-800">
                          {getGoalLabel(task.goal.type)}: {task.goal.targetCount || task.goal.targetAmount}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded p-2">
                        <div className="text-xs text-green-600 font-medium">Bonus Reward</div>
                        <div className="text-green-800">
                          {task.bonusTemplateId ? (task.bonusTemplateName || 'Bonus attached') : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Legacy Visual Rule Display (Read-only) */
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Mission Flow (Legacy)</h2>
          {nodes.length > 0 ? (
            <div className="h-[500px] border border-secondary-200 rounded-lg bg-secondary-50">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
              >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-500">
              No visual rule defined for this mission.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
