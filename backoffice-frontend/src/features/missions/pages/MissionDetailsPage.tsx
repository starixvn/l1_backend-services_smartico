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

const nodeTypes = {
  trigger: TriggerNode,
  goal: GoalNode,
  reward: RewardNode,
};

/**
 * Mission details page with read-only visual rule display
 */
export const MissionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Convert mission rule to React Flow format
  const nodes: Node[] = mission.rule.nodes.map((n) => ({
    ...n,
    type: n.type.toLowerCase() as 'trigger' | 'goal' | 'reward',
  }));

  const edges: Edge[] = mission.rule.edges.map((e) => ({
    ...e,
    type: 'smoothstep',
    animated: true,
  }));

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
            <button
              onClick={() => navigate(`/missions/edit/${mission.id}`)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Mission
            </button>
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
              <div className="text-sm text-secondary-500">Rule Complexity</div>
              <div className="text-secondary-900 font-medium">
                {mission.rule.nodes.length} nodes, {mission.rule.edges.length} connections
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

      {/* Visual Rule Display (Read-only) */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Mission Flow</h2>
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
      </div>
    </div>
  );
};
