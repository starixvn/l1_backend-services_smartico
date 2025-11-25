import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { GoalNode } from './nodes/GoalNode';
import { RewardNode } from './nodes/RewardNode';
import { RuleBuilderToolbox } from './RuleBuilderToolbox';
import { NodeConfigPanel } from './NodeConfigPanel';
import type { MissionRule, NodeData, NodeType } from '../../../services/api.types';

const nodeTypes = {
  trigger: TriggerNode,
  goal: GoalNode,
  reward: RewardNode,
};

interface RuleBuilderProps {
  value: MissionRule;
  onChange: (rule: MissionRule) => void;
}

/**
 * Main visual rule builder component with drag-and-drop
 */
export const RuleBuilder: React.FC<RuleBuilderProps> = ({ value, onChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(value.nodes.map(n => ({
    ...n,
    type: n.type.toLowerCase() as 'trigger' | 'goal' | 'reward',
  })));

  const [edges, setEdges, onEdgesChange] = useEdgesState(value.edges.map(e => ({
    ...e,
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  })));

  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  // Update parent when nodes or edges change
  React.useEffect(() => {
    onChange({
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type === 'trigger' ? 'Trigger' : n.type === 'goal' ? 'Goal' : 'Reward',
        position: n.position,
        data: n.data,
      })) as any,
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
      })),
    });
  }, [nodes, edges, onChange]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle node click for configuration
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
    },
    []
  );

  // Handle dropping a new node from toolbox
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 100,
      };

      const newNode: Node<NodeData> = {
        id: `${type}-${Date.now()}`,
        type: type.toLowerCase() as 'trigger' | 'goal' | 'reward',
        position,
        data: {
          label: `New ${type}`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Update selected node data
  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, ...data },
            };
          }
          return node;
        })
      );

      // Update selectedNode to reflect changes
      setSelectedNode((prev) => {
        if (prev && prev.id === nodeId) {
          return {
            ...prev,
            data: { ...prev.data, ...data },
          };
        }
        return prev;
      });
    },
    [setNodes]
  );

  // Delete selected node
  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode(null);
    },
    [setNodes, setEdges]
  );

  return (
    <div className="flex gap-4 h-[600px] border border-secondary-200 rounded-lg bg-white">
      {/* Toolbox */}
      <RuleBuilderToolbox />

      {/* Canvas */}
      <div className="flex-1 bg-secondary-50 rounded-lg relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
        </ReactFlow>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-secondary-500">
              <svg
                className="w-16 h-16 mx-auto mb-3 opacity-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              <p className="font-medium">Drag blocks from the left to start building</p>
              <p className="text-sm mt-1">Create your mission flow: Trigger → Goal → Reward</p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Panel */}
      <NodeConfigPanel
        node={selectedNode}
        onUpdate={updateNodeData}
        onDelete={deleteNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};
