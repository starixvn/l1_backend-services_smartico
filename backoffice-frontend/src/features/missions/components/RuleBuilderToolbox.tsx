import React from 'react';

interface ToolboxItem {
  type: 'Trigger' | 'Goal' | 'Reward';
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const toolboxItems: ToolboxItem[] = [
  {
    type: 'Trigger',
    label: 'Trigger',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    type: 'Goal',
    label: 'Goal',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    type: 'Reward',
    label: 'Reward',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

/**
 * Toolbox with draggable blocks for the rule builder
 */
export const RuleBuilderToolbox: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-48 bg-white border-r border-secondary-200 p-4">
      <h3 className="text-sm font-semibold text-secondary-900 mb-3">
        Building Blocks
      </h3>
      <div className="space-y-2">
        {toolboxItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className={`
              p-3 rounded-lg border-2 ${item.borderColor} ${item.bgColor}
              cursor-grab active:cursor-grabbing
              hover:shadow-md transition-shadow
            `}
          >
            <div className="flex items-center gap-2">
              <div className={`${item.color}`}>{item.icon}</div>
              <div>
                <div className={`text-xs font-medium uppercase ${item.color}`}>
                  {item.label}
                </div>
                <div className="text-xs text-secondary-600 mt-0.5">
                  {item.type === 'Trigger' && 'Start event'}
                  {item.type === 'Goal' && 'Completion'}
                  {item.type === 'Reward' && 'Prize'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-secondary-50 rounded-lg border border-secondary-200">
        <div className="text-xs text-secondary-600">
          <p className="font-medium mb-2">How to use:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Drag blocks to canvas</li>
            <li>Connect them together</li>
            <li>Click to configure</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
