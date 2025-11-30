import React, { useState, useEffect } from 'react';
import type { MissionTask, Bonus, TriggerType, GoalType } from '../../../services/api.types';
import { TriggerType as TriggerTypeEnum, GoalType as GoalTypeEnum } from '../../../services/api.types';
import { bonusApi } from '../../../services/bonusApi';

interface TaskBuilderProps {
  tasks: MissionTask[];
  onChange: (tasks: MissionTask[]) => void;
}

/**
 * Task Builder component for creating and editing mission tasks.
 * Replaces the visual RuleBuilder with a form-based approach.
 */
export const TaskBuilder: React.FC<TaskBuilderProps> = ({ tasks, onChange }) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [bonusTemplates, setBonusTemplates] = useState<Bonus[]>([]);
  const [loadingBonuses, setLoadingBonuses] = useState(false);

  // Load bonus templates on mount
  useEffect(() => {
    setLoadingBonuses(true);
    bonusApi.getAllBonuses()
      .then(bonuses => {
        setBonusTemplates(bonuses.filter(b => b.status === 'Active' || b.status === 'Draft'));
      })
      .catch(console.error)
      .finally(() => setLoadingBonuses(false));
  }, []);

  const addTask = () => {
    const newTask: MissionTask = {
      id: `task-${Date.now()}`,
      name: `Task ${tasks.length + 1}`,
      order: tasks.length,
      trigger: { type: TriggerTypeEnum.BET_PLACED },
      goal: { type: GoalTypeEnum.BET_COUNT, targetCount: 1 }
    };
    onChange([...tasks, newTask]);
    setExpandedTaskId(newTask.id);
  };

  const updateTask = (taskId: string, updates: Partial<MissionTask>) => {
    onChange(tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    const newTasks = tasks.filter(task => task.id !== taskId)
      .map((task, index) => ({ ...task, order: index }));
    onChange(newTasks);
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    }
  };

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const index = tasks.findIndex(t => t.id === taskId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === tasks.length - 1)
    ) {
      return;
    }
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newTasks = [...tasks];
    [newTasks[index], newTasks[newIndex]] = [newTasks[newIndex], newTasks[index]];
    onChange(newTasks.map((task, i) => ({ ...task, order: i })));
  };

  return (
    <div className="space-y-4">
      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-300">
          <svg className="w-12 h-12 mx-auto text-secondary-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-secondary-600 mb-2">No tasks defined</p>
          <p className="text-sm text-secondary-500 mb-4">Add at least one task to this mission</p>
          <button
            type="button"
            onClick={addTask}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add First Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              isExpanded={expandedTaskId === task.id}
              onToggle={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              onUpdate={(updates) => updateTask(task.id, updates)}
              onDelete={() => deleteTask(task.id)}
              onMoveUp={() => moveTask(task.id, 'up')}
              onMoveDown={() => moveTask(task.id, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < tasks.length - 1}
              bonusTemplates={bonusTemplates}
              loadingBonuses={loadingBonuses}
            />
          ))}
        </div>
      )}

      {/* Add Task Button */}
      {tasks.length > 0 && (
        <button
          type="button"
          onClick={addTask}
          className="w-full py-3 border-2 border-dashed border-secondary-300 rounded-lg text-secondary-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Task
        </button>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: MissionTask;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<MissionTask>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  bonusTemplates: Bonus[];
  loadingBonuses: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  bonusTemplates,
  loadingBonuses
}) => {
  const getTriggerLabel = (type: TriggerType) => {
    switch (type) {
      case TriggerTypeEnum.BET_PLACED: return 'Bet Placed';
      case TriggerTypeEnum.DEPOSIT_MADE: return 'Deposit Made';
      case TriggerTypeEnum.GAME_PLAYED: return 'Game Played';
      case TriggerTypeEnum.DAILY_LOGIN: return 'Daily Login';
      default: return type;
    }
  };

  const getGoalLabel = (type: GoalType) => {
    switch (type) {
      case GoalTypeEnum.BET_COUNT: return 'Bet Count';
      case GoalTypeEnum.DEPOSIT_AMOUNT: return 'Deposit Amount';
      case GoalTypeEnum.WAGERED_AMOUNT: return 'Wagered Amount';
      case GoalTypeEnum.TURNOVER_AMOUNT: return 'Turnover Amount';
      case GoalTypeEnum.LOGIN_COUNT: return 'Login Count';
      default: return type;
    }
  };

  const getTaskSummary = () => {
    const trigger = getTriggerLabel(task.trigger.type);
    const goal = getGoalLabel(task.goal.type);
    const target = task.goal.targetCount || task.goal.targetAmount || 0;
    const games = task.trigger.eligibleGames?.length
      ? ` (${task.trigger.eligibleGames.slice(0, 2).join(', ')}${task.trigger.eligibleGames.length > 2 ? '...' : ''})`
      : '';
    return `${trigger}${games} → ${goal}: ${target}`;
  };

  return (
    <div className={`border rounded-lg ${isExpanded ? 'border-primary-300 bg-primary-50/30' : 'border-secondary-200 bg-white'}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={!canMoveUp}
            className="p-1 hover:bg-secondary-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={!canMoveDown}
            className="p-1 hover:bg-secondary-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
          {index + 1}
        </div>

        <div className="flex-1">
          <div className="font-medium text-secondary-900">{task.name}</div>
          <div className="text-sm text-secondary-500">{getTaskSummary()}</div>
        </div>

        {task.bonusTemplateId && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            + Bonus
          </span>
        )}

        <svg
          className={`w-5 h-5 text-secondary-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-secondary-200">
          <div className="pt-4 space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Task Name *
              </label>
              <input
                type="text"
                value={task.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Make 5 bets"
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={task.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Brief description of this task"
              />
            </div>

            {/* Trigger Section */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Trigger (What starts tracking)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    Trigger Type *
                  </label>
                  <select
                    value={task.trigger.type}
                    onChange={(e) => onUpdate({
                      trigger: { ...task.trigger, type: e.target.value as TriggerType }
                    })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value={TriggerTypeEnum.BET_PLACED}>Bet Placed</option>
                    <option value={TriggerTypeEnum.DEPOSIT_MADE}>Deposit Made</option>
                    <option value={TriggerTypeEnum.GAME_PLAYED}>Game Played</option>
                    <option value={TriggerTypeEnum.DAILY_LOGIN}>Daily Login</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    Min Amount (optional)
                  </label>
                  <input
                    type="number"
                    value={task.trigger.minAmount || ''}
                    onChange={(e) => onUpdate({
                      trigger: { ...task.trigger, minAmount: e.target.value ? parseFloat(e.target.value) : undefined }
                    })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="e.g., 10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              {(task.trigger.type === TriggerTypeEnum.BET_PLACED || task.trigger.type === TriggerTypeEnum.GAME_PLAYED) && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    Eligible Games (optional)
                  </label>
                  <input
                    type="text"
                    value={task.trigger.eligibleGames?.join(', ') || ''}
                    onChange={(e) => {
                      const games = e.target.value
                        .split(',')
                        .map(g => g.trim())
                        .filter(g => g.length > 0);
                      onUpdate({
                        trigger: { ...task.trigger, eligibleGames: games.length > 0 ? games : undefined }
                      });
                    }}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="e.g., wukong, candy-land, olympub"
                  />
                  <p className="text-xs text-secondary-500 mt-1">
                    Comma-separated game IDs. Leave empty for all games.
                  </p>
                </div>
              )}
            </div>

            {/* Goal Section */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Goal (What to achieve)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    Goal Type *
                  </label>
                  <select
                    value={task.goal.type}
                    onChange={(e) => onUpdate({
                      goal: { ...task.goal, type: e.target.value as GoalType }
                    })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value={GoalTypeEnum.BET_COUNT}>Bet Count</option>
                    <option value={GoalTypeEnum.DEPOSIT_AMOUNT}>Deposit Amount</option>
                    <option value={GoalTypeEnum.WAGERED_AMOUNT}>Wagered Amount</option>
                    <option value={GoalTypeEnum.TURNOVER_AMOUNT}>Turnover Amount</option>
                    <option value={GoalTypeEnum.LOGIN_COUNT}>Login Count</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-600 mb-1">
                    {(task.goal.type === GoalTypeEnum.BET_COUNT || task.goal.type === GoalTypeEnum.LOGIN_COUNT) ? 'Target Count *' : 'Target Amount *'}
                  </label>
                  <input
                    type="number"
                    value={(task.goal.type === GoalTypeEnum.BET_COUNT || task.goal.type === GoalTypeEnum.LOGIN_COUNT) ? (task.goal.targetCount || '') : (task.goal.targetAmount || '')}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (task.goal.type === GoalTypeEnum.BET_COUNT || task.goal.type === GoalTypeEnum.LOGIN_COUNT) {
                        onUpdate({ goal: { ...task.goal, targetCount: value || undefined, targetAmount: undefined } });
                      } else {
                        onUpdate({ goal: { ...task.goal, targetAmount: value || undefined, targetCount: undefined } });
                      }
                    }}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder={task.goal.type === GoalTypeEnum.LOGIN_COUNT ? 'e.g., 7' : task.goal.type === GoalTypeEnum.BET_COUNT ? 'e.g., 5' : 'e.g., 100'}
                    min="1"
                    step={(task.goal.type === GoalTypeEnum.BET_COUNT || task.goal.type === GoalTypeEnum.LOGIN_COUNT) ? '1' : '0.01'}
                  />
                </div>
              </div>
            </div>

            {/* Bonus Reward Section (Optional) */}
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Bonus Reward (Optional)
              </h4>
              <p className="text-xs text-green-700 mb-2">
                Optionally award a bonus when this task is completed
              </p>
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
                  value={task.bonusTemplateId || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const selectedBonus = bonusTemplates.find(b => b.id === selectedId);
                    onUpdate({
                      bonusTemplateId: selectedId || undefined,
                      bonusTemplateName: selectedBonus ? `${selectedBonus.name} (${selectedBonus.type})` : undefined
                    });
                  }}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">No bonus for this task</option>
                  {bonusTemplates.map((bonus) => (
                    <option key={bonus.id} value={bonus.id}>
                      {bonus.name} ({bonus.type})
                    </option>
                  ))}
                </select>
              )}
              {bonusTemplates.length === 0 && !loadingBonuses && (
                <p className="text-xs text-amber-600 mt-1">
                  No bonus templates available. Create one in the Bonuses section first.
                </p>
              )}
            </div>

            {/* Delete Button */}
            <div className="pt-2 border-t border-secondary-200">
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
