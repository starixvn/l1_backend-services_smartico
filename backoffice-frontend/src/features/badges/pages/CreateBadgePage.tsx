import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BadgeForm } from '../components/BadgeForm';
import { badgeFormSchema, type BadgeFormData } from '../schemas/badgeSchema';
import { badgeApi } from '../../../services/badgeApi';
import { BadgeRarity, BadgeRewardType, BadgeUnlockCriteriaType } from '../../../services/api.types';

/**
 * Create/Edit Badge page
 */
export const CreateBadgePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  const form = useForm<BadgeFormData>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      iconUrl: '',
      rarity: BadgeRarity.COMMON,
      unlockCriteria: {
        type: BadgeUnlockCriteriaType.BET_COUNT,
        thresholdValue: undefined,
        eligibleGames: [],
        targetTier: '',
        customEventName: '',
        description: ''
      },
      reward: {
        type: BadgeRewardType.NONE,
        value: undefined,
        durationHours: undefined,
        gameId: '',
        bonusTemplateId: '',
        description: ''
      },
      isHidden: false,
      progressTrackingEnabled: true,
      seriesId: '',
      orderInSeries: 0
    }
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (id) {
      loadBadge(id);
    }
  }, [id]);

  const loadBadge = async (badgeId: string) => {
    try {
      setLoading(true);
      const badge = await badgeApi.getBadgeById(badgeId);

      reset({
        name: badge.name,
        description: badge.description || '',
        iconUrl: badge.iconUrl || '',
        rarity: badge.rarity,
        unlockCriteria: {
          type: badge.unlockCriteria.type,
          thresholdValue: badge.unlockCriteria.thresholdValue,
          eligibleGames: badge.unlockCriteria.eligibleGames || [],
          targetTier: badge.unlockCriteria.targetTier || '',
          customEventName: badge.unlockCriteria.customEventName || '',
          description: badge.unlockCriteria.description || ''
        },
        reward: badge.reward ? {
          type: badge.reward.type,
          value: badge.reward.value,
          durationHours: badge.reward.durationHours,
          gameId: badge.reward.gameId || '',
          bonusTemplateId: badge.reward.bonusTemplateId || '',
          description: badge.reward.description || ''
        } : {
          type: BadgeRewardType.NONE,
          value: undefined,
          durationHours: undefined,
          gameId: '',
          bonusTemplateId: '',
          description: ''
        },
        isHidden: badge.isHidden,
        progressTrackingEnabled: badge.progressTrackingEnabled,
        seriesId: badge.seriesId || '',
        orderInSeries: badge.orderInSeries || 0
      });
    } catch (err) {
      setError('Failed to load badge');
      console.error('Error loading badge:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BadgeFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const command = {
        name: data.name,
        description: data.description || undefined,
        iconUrl: data.iconUrl || undefined,
        rarity: data.rarity,
        unlockCriteria: {
          type: data.unlockCriteria.type,
          thresholdValue: data.unlockCriteria.thresholdValue,
          eligibleGames: data.unlockCriteria.eligibleGames?.length ? data.unlockCriteria.eligibleGames : undefined,
          targetTier: data.unlockCriteria.targetTier || undefined,
          customEventName: data.unlockCriteria.customEventName || undefined,
          description: data.unlockCriteria.description || undefined
        },
        reward: data.reward?.type !== BadgeRewardType.NONE ? {
          type: data.reward!.type,
          value: data.reward!.value,
          durationHours: data.reward!.durationHours,
          gameId: data.reward!.gameId || undefined,
          bonusTemplateId: data.reward!.bonusTemplateId || undefined,
          description: data.reward!.description || undefined
        } : undefined,
        isHidden: data.isHidden,
        progressTrackingEnabled: data.progressTrackingEnabled,
        seriesId: data.seriesId || undefined,
        orderInSeries: data.orderInSeries
      };

      if (isEditMode && id) {
        await badgeApi.updateBadge(id, command);
      } else {
        await badgeApi.createBadge(command);
      }

      navigate('/badges');
    } catch (err: any) {
      console.error('Error saving badge:', err);
      setError(err.response?.data?.detail || 'Failed to save badge');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
            <Link to="/badges" className="hover:text-primary-600">Badges</Link>
            <span>/</span>
            <span className="text-secondary-900">{isEditMode ? 'Edit Badge' : 'Create Badge'}</span>
          </nav>
          <h1 className="text-2xl font-bold text-secondary-900">
            {isEditMode ? 'Edit Badge' : 'Create New Badge'}
          </h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <BadgeForm form={form} />

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-secondary-200">
          <Link
            to="/badges"
            className="px-4 py-2 text-secondary-700 font-medium hover:text-secondary-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Badge')}
          </button>
        </div>
      </form>
    </div>
  );
};
