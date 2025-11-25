import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RuleBuilder } from '../components/RuleBuilder';
import { missionFormSchema, type MissionFormData } from '../schemas/missionSchema';
import { missionApi } from '../../../services/missionApi';
import { PlayerSegment, type MissionRule } from '../../../services/api.types';

/**
 * Create/Edit Mission page with visual rule builder
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
      targetSegment: PlayerSegment.ALL_PLAYERS,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      rule: {
        nodes: [],
        edges: [],
      },
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
        targetSegment: mission.targetSegment,
        startDate: new Date(mission.startDate).toISOString().slice(0, 16),
        endDate: new Date(mission.endDate).toISOString().slice(0, 16),
        rule: mission.rule,
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

    // Check if rule has at least one of each node type
    const hasTrigger = data.rule.nodes.some(n => n.type === 'Trigger');
    const hasGoal = data.rule.nodes.some(n => n.type === 'Goal');
    const hasReward = data.rule.nodes.some(n => n.type === 'Reward');

    if (!hasTrigger) warnings.push('Missing Trigger node');
    if (!hasGoal) warnings.push('Missing Goal node');
    if (!hasReward) warnings.push('Missing Reward node');

    // Check if nodes have required configuration
    data.rule.nodes.forEach((node) => {
      if (node.type === 'Trigger' && !node.data.triggerType) {
        warnings.push(`Trigger node needs a trigger type configured`);
      }
      if (node.type === 'Goal' && (!node.data.goalType || !node.data.goalCount)) {
        warnings.push(`Goal node needs goal type and count configured`);
      }
      if (node.type === 'Reward' && (!node.data.rewardType || !node.data.rewardAmount)) {
        warnings.push(`Reward node needs reward type and amount configured`);
      }
    });

    // Check if rule has at least one connection
    if (data.rule.edges.length === 0 && data.rule.nodes.length > 0) {
      warnings.push('No connections between nodes');
    }

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

      let mission;
      if (isEditMode && id) {
        mission = await missionApi.updateMission(id, {
          name: data.name,
          description: data.description,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          rule: data.rule,
        });
      } else {
        mission = await missionApi.createMission({
          name: data.name,
          description: data.description,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          rule: data.rule,
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

      let mission;
      if (isEditMode && id) {
        mission = await missionApi.updateMission(id, {
          name: data.name,
          description: data.description,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          rule: data.rule,
        });
      } else {
        mission = await missionApi.createMission({
          name: data.name,
          description: data.description,
          targetSegment: data.targetSegment,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          rule: data.rule,
        });
      }

      // If shouldPublish is true, publish the mission after creation/update
      if (shouldPublish) {
        await missionApi.publishMission(mission.id);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
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
          {isEditMode ? 'Update your mission configuration and flow' : 'Build your mission flow with the visual drag-and-drop rule builder'}
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
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Optional mission description..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Rule Builder */}
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">
            Visual Rule Builder
          </h2>

          <Controller
            name="rule"
            control={control}
            render={({ field }) => (
              <RuleBuilder value={field.value} onChange={field.onChange} />
            )}
          />

          {errors.rule && (
            <p className="text-red-600 text-sm mt-2">{errors.rule.message as string}</p>
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
