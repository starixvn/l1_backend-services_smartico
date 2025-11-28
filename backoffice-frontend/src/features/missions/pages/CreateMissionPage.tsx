import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskBuilder } from '../components/TaskBuilder';
import { missionFormSchema, type MissionFormData } from '../schemas/missionSchema';
import { missionApi } from '../../../services/missionApi';
import { PlayerSegment, GoalType } from '../../../services/api.types';

/**
 * Create/Edit Mission page with task-based builder
 */
export const CreateMissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<MissionFormData>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      completionPoints: 10,
      tasks: [],
      targetSegment: PlayerSegment.ALL_PLAYERS,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (id) {
      loadMission(id);
    }
  }, [id]);

  const loadMission = async (missionId: string) => {
    try {
      setLoading(true);
      const mission = await missionApi.getMissionById(missionId);

      reset({
        name: mission.name,
        description: mission.description || '',
        completionPoints: mission.completionPoints || 10,
        tasks: mission.tasks || [],
        targetSegment: mission.targetSegment,
        startDate: new Date(mission.startDate).toISOString().slice(0, 16),
        endDate: new Date(mission.endDate).toISOString().slice(0, 16),
      });
    } catch (err) {
      setError('Failed to load mission');
      console.error('Error loading mission:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check for validation warnings (without blocking save)
  const checkValidationWarnings = (data: MissionFormData): string[] => {
    const warnings: string[] = [];

    // Check if there's at least one task
    if (data.tasks.length === 0) {
      warnings.push('No tasks defined - add at least one task');
    }

    // Check each task has required configuration
    data.tasks.forEach((task, index) => {
      if (!task.trigger.type) {
        warnings.push(`Task ${index + 1}: Missing trigger type`);
      }
      if (!task.goal.type) {
        warnings.push(`Task ${index + 1}: Missing goal type`);
      }
      if (task.goal.type === GoalType.BET_COUNT && !task.goal.targetCount) {
        warnings.push(`Task ${index + 1}: Missing target count`);
      }
      if (task.goal.type !== GoalType.BET_COUNT && !task.goal.targetAmount) {
        warnings.push(`Task ${index + 1}: Missing target amount`);
      }
    });

    return warnings;
  };

  // Handler for "Save as Draft" - bypasses form validation
  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Get current form values without validation
      const data = getValues();

      // Check for validation warnings
      const warnings = checkValidationWarnings(data);
      setValidationWarnings(warnings);

      if (isEditMode && id) {
        await missionApi.updateMission(id, {
          name: data.name,
          description: data.description,
          completionPoints: data.completionPoints,
          tasks: data.tasks,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        });
      } else {
        await missionApi.createMission({
          name: data.name,
          description: data.description,
          completionPoints: data.completionPoints,
          tasks: data.tasks,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        });
      }

      navigate('/missions');
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} mission`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} mission:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: MissionFormData, shouldPublish: boolean = false) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Check for validation warnings
      const warnings = checkValidationWarnings(data);
      setValidationWarnings(warnings);

      let missionId = id;
      if (isEditMode && id) {
        await missionApi.updateMission(id, {
          name: data.name,
          description: data.description,
          completionPoints: data.completionPoints,
          tasks: data.tasks,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        });
      } else {
        const createdMission = await missionApi.createMission({
          name: data.name,
          description: data.description,
          completionPoints: data.completionPoints,
          tasks: data.tasks,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        });
        missionId = createdMission.id;
      }

      // If shouldPublish is true, publish the mission after creation/update
      if (shouldPublish && missionId) {
        await missionApi.publishMission(missionId);
      }

      navigate('/missions');
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} mission`);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} mission:`, err);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-secondary-900">
            {isEditMode ? 'Edit Mission' : 'Create Mission'}
          </h1>
        </div>
        <p className="text-secondary-600">
          {isEditMode ? 'Update your mission configuration and tasks' : 'Define mission tasks and rewards for players'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-1">
                Mission has validation warnings
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                You can save this as a draft, but you'll need to fix these issues before publishing:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Mission Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Mission Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Welcome Bonus Mission"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Target Segment *
              </label>
              <select
                {...register('targetSegment')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={PlayerSegment.ALL_PLAYERS}>All Players</option>
                <option value={PlayerSegment.VIP_ONLY}>VIP Only</option>
              </select>
              {errors.targetSegment && (
                <p className="text-red-600 text-sm mt-1">{errors.targetSegment.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Start Date *
              </label>
              <input
                {...register('startDate')}
                type="datetime-local"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.startDate && (
                <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                End Date *
              </label>
              <input
                {...register('endDate')}
                type="datetime-local"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.endDate && (
                <p className="text-red-600 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Optional mission description..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Completion Reward */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">
            Completion Reward
          </h2>
          <p className="text-sm text-secondary-600 mb-4">
            Points awarded to the player when ALL tasks are completed
          </p>

          <div className="flex items-center gap-4">
            <div className="w-48">
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Points *
              </label>
              <Controller
                name="completionPoints"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 100"
                    min="1"
                    step="1"
                  />
                )}
              />
              {errors.completionPoints && (
                <p className="text-red-600 text-sm mt-1">{errors.completionPoints.message}</p>
              )}
            </div>
            <div className="flex-1 p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  These points are awarded when the player completes ALL tasks in the mission.
                  Individual tasks can also grant bonus rewards.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Task Builder */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-2">
            Mission Tasks
          </h2>
          <p className="text-sm text-secondary-600 mb-4">
            Define what players need to do to complete this mission. Each task has a trigger (what starts tracking) and a goal (what to achieve).
          </p>

          <Controller
            name="tasks"
            control={control}
            render={({ field }) => (
              <TaskBuilder tasks={field.value} onChange={field.onChange} />
            )}
          />

          {errors.tasks && (
            <p className="text-red-600 text-sm mt-2">{errors.tasks.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/missions')}
            className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={isSubmitting}
            className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isSubmitting ? 'Publishing...' : 'Save & Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};
