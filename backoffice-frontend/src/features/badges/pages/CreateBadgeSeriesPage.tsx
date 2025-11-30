import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { badgeSeriesFormSchema, type BadgeSeriesFormData } from '../schemas/badgeSchema';
import { badgeSeriesApi } from '../../../services/badgeSeriesApi';

/**
 * Create/Edit Badge Series page
 */
export const CreateBadgeSeriesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BadgeSeriesFormData>({
    resolver: zodResolver(badgeSeriesFormSchema),
    defaultValues: {
      name: '',
      description: '',
      iconUrl: '',
      displayOrder: 0
    }
  });

  useEffect(() => {
    if (id) {
      loadSeries(id);
    }
  }, [id]);

  const loadSeries = async (seriesId: string) => {
    try {
      setLoading(true);
      const series = await badgeSeriesApi.getBadgeSeriesById(seriesId);

      reset({
        name: series.name,
        description: series.description || '',
        iconUrl: series.iconUrl || '',
        displayOrder: series.displayOrder
      });
    } catch (err) {
      setError('Failed to load series');
      console.error('Error loading series:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BadgeSeriesFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const command = {
        name: data.name,
        description: data.description || undefined,
        iconUrl: data.iconUrl || undefined,
        displayOrder: data.displayOrder
      };

      if (isEditMode && id) {
        await badgeSeriesApi.updateBadgeSeries(id, command);
      } else {
        await badgeSeriesApi.createBadgeSeries(command);
      }

      navigate('/badges/series');
    } catch (err: any) {
      console.error('Error saving series:', err);
      setError(err.response?.data?.detail || 'Failed to save series');
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
      <div>
        <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-2">
          <Link to="/badges" className="hover:text-primary-600">Badges</Link>
          <span>/</span>
          <Link to="/badges/series" className="hover:text-primary-600">Series</Link>
          <span>/</span>
          <span className="text-secondary-900">{isEditMode ? 'Edit' : 'Create'}</span>
        </nav>
        <h1 className="text-2xl font-bold text-secondary-900">
          {isEditMode ? 'Edit Badge Series' : 'Create Badge Series'}
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-light border border-error rounded-md p-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-secondary-200 rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-1">
              Series Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Tournament Champion Series, VIP Collection"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe this badge collection..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="iconUrl" className="block text-sm font-medium text-secondary-700 mb-1">
                Icon URL
              </label>
              <input
                id="iconUrl"
                type="text"
                {...register('iconUrl')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://..."
              />
              {errors.iconUrl && (
                <p className="mt-1 text-sm text-error">{errors.iconUrl.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="displayOrder" className="block text-sm font-medium text-secondary-700 mb-1">
                Display Order
              </label>
              <input
                id="displayOrder"
                type="number"
                min="0"
                {...register('displayOrder', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-secondary-500">
                Lower numbers appear first
              </p>
              {errors.displayOrder && (
                <p className="mt-1 text-sm text-error">{errors.displayOrder.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-secondary-200">
          <Link
            to="/badges/series"
            className="px-4 py-2 text-secondary-700 font-medium hover:text-secondary-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Series')}
          </button>
        </div>
      </form>
    </div>
  );
};
