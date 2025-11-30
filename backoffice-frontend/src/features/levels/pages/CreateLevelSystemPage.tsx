import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { levelSystemApi } from '../../../services/levelSystemApi';
import { bonusApi } from '../../../services/bonusApi';
import { badgeApi } from '../../../services/badgeApi';
import {
  ProgressionCurveType,
  XpActionType,
  LevelRewardType,
  DemotionType,
  type CreateLevelSystemCommand,
  type LevelTier,
  type XpRule,
  type LevelReward,
  type Bonus,
  type Badge
} from '../../../services/api.types';

type FormData = CreateLevelSystemCommand;

const defaultTier: Omit<LevelTier, 'id'> = {
  name: '',
  fromLevel: 1,
  toLevel: 10,
  color: '#CD7F32',
  icon: '',
  order: 0,
  benefits: []
};

const defaultXpRule: Omit<XpRule, 'id'> = {
  actionType: XpActionType.BET,
  xpAmount: 1,
  perUnitAmount: 10,
  dailyCap: undefined,
  eligibleGames: undefined,
  isActive: true,
  description: ''
};

const defaultLevelReward: Omit<LevelReward, 'id'> = {
  level: 10,
  rewardType: LevelRewardType.BONUS_TEMPLATE,
  value: undefined,
  bonusTemplateId: '',
  bonusTemplateName: '',
  badgeId: '',
  badgeName: '',
  description: ''
};

/**
 * Create/Edit Level System Page
 */
export function CreateLevelSystemPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      maxLevel: 100,
      progressionCurve: ProgressionCurveType.LINEAR,
      baseXpRequired: 100,
      xpMultiplier: 1.5,
      tiers: [],
      xpRules: [],
      levelRewards: [],
      demotionEnabled: false,
      demotionRules: {
        inactiveDays: 90,
        demotionType: DemotionType.ONE_TIER,
        warningDays: 7,
        preserveXp: true
      }
    }
  });

  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
    control,
    name: 'tiers'
  });

  const { fields: xpRuleFields, append: appendXpRule, remove: removeXpRule } = useFieldArray({
    control,
    name: 'xpRules'
  });

  const { fields: rewardFields, append: appendReward, remove: removeReward } = useFieldArray({
    control,
    name: 'levelRewards'
  });

  const progressionCurve = watch('progressionCurve');
  const demotionEnabled = watch('demotionEnabled');

  useEffect(() => {
    loadBonuses();
    loadBadges();
    if (isEditing && id) {
      loadLevelSystem(id);
    }
  }, [id, isEditing]);

  const loadBonuses = async () => {
    try {
      const data = await bonusApi.getAllBonuses();
      setBonuses(data.filter(b => b.status === 'Active' || b.status === 'Draft'));
    } catch (err) {
      console.error('Failed to load bonuses:', err);
    }
  };

  const loadBadges = async () => {
    try {
      const data = await badgeApi.getActiveBadges();
      setBadges(data);
    } catch (err) {
      console.error('Failed to load badges:', err);
    }
  };

  const loadLevelSystem = async (levelSystemId: string) => {
    try {
      setIsLoading(true);
      const data = await levelSystemApi.getLevelSystemById(levelSystemId);
      reset({
        name: data.name,
        description: data.description || '',
        maxLevel: data.maxLevel,
        progressionCurve: data.progressionCurve,
        baseXpRequired: data.baseXpRequired,
        xpMultiplier: data.xpMultiplier,
        tiers: data.tiers,
        xpRules: data.xpRules,
        levelRewards: data.levelRewards,
        demotionEnabled: data.demotionEnabled,
        demotionRules: data.demotionRules || {
          inactiveDays: 90,
          demotionType: DemotionType.ONE_TIER,
          warningDays: 7,
          preserveXp: true
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load level system');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Ensure tiers have IDs
      const processedData = {
        ...data,
        tiers: data.tiers.map((tier, index) => ({
          ...tier,
          id: tier.id || crypto.randomUUID(),
          order: index
        })),
        xpRules: data.xpRules.map(rule => ({
          ...rule,
          id: rule.id || crypto.randomUUID()
        })),
        levelRewards: data.levelRewards.map(reward => ({
          ...reward,
          id: reward.id || crypto.randomUUID()
        }))
      };

      if (isEditing && id) {
        await levelSystemApi.updateLevelSystem(id, processedData);
      } else {
        await levelSystemApi.createLevelSystem(processedData);
      }

      navigate('/levels');
    } catch (err: any) {
      console.error('Failed to save level system:', err);
      setError(err.response?.data?.detail || 'Failed to save level system');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDefaultTiers = () => {
    const maxLevel = watch('maxLevel');
    const tierCount = 5;
    const levelsPerTier = Math.floor(maxLevel / tierCount);

    const defaultTiers = [
      { name: 'Bronze', color: '#CD7F32' },
      { name: 'Silver', color: '#C0C0C0' },
      { name: 'Gold', color: '#FFD700' },
      { name: 'Platinum', color: '#E5E4E2' },
      { name: 'Diamond', color: '#B9F2FF' }
    ];

    defaultTiers.forEach((tier, index) => {
      const fromLevel = index * levelsPerTier + 1;
      const toLevel = index === tierCount - 1 ? maxLevel : (index + 1) * levelsPerTier;
      appendTier({
        id: crypto.randomUUID(),
        name: tier.name,
        fromLevel,
        toLevel,
        color: tier.color,
        icon: '',
        order: index,
        benefits: []
      });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/levels')}
            className="flex items-center text-secondary-600 hover:text-secondary-900 mb-4"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Level Systems
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">
            {isEditing ? 'Edit Level System' : 'Create Level System'}
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                <input
                  {...register('name', { required: 'Name is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., VIP Progression"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional description..."
                />
              </div>
            </div>
          </div>

          {/* Progression Settings */}
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Progression Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Max Level</label>
                <input
                  type="number"
                  {...register('maxLevel', { valueAsNumber: true, min: 2, max: 1000 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Progression Curve</label>
                <select
                  {...register('progressionCurve')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={ProgressionCurveType.LINEAR}>Linear</option>
                  <option value={ProgressionCurveType.EXPONENTIAL}>Exponential</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Base XP Required</label>
                <input
                  type="number"
                  {...register('baseXpRequired', { valueAsNumber: true, min: 1 })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-secondary-500">XP needed for level 1 to 2</p>
              </div>
              {progressionCurve === ProgressionCurveType.EXPONENTIAL && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">XP Multiplier</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('xpMultiplier', { valueAsNumber: true, min: 1.1, max: 10 })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-secondary-500">Each level needs Nx more XP</p>
                </div>
              )}
            </div>
          </div>

          {/* Tiers */}
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">Tiers</h2>
              <div className="flex gap-2">
                {tierFields.length === 0 && (
                  <button
                    type="button"
                    onClick={addDefaultTiers}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Add default tiers
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => appendTier({ ...defaultTier, id: crypto.randomUUID() })}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add Tier
                </button>
              </div>
            </div>

            {tierFields.length === 0 ? (
              <p className="text-secondary-500 text-sm">No tiers defined. Add tiers to group levels together.</p>
            ) : (
              <div className="space-y-4">
                {tierFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Name</label>
                        <input
                          {...register(`tiers.${index}.name` as const)}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                          placeholder="Tier name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">From Level</label>
                        <input
                          type="number"
                          {...register(`tiers.${index}.fromLevel` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">To Level</label>
                        <input
                          type="number"
                          {...register(`tiers.${index}.toLevel` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Color</label>
                        <input
                          type="color"
                          {...register(`tiers.${index}.color` as const)}
                          className="w-full h-8 border border-secondary-300 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* XP Rules */}
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">XP Earning Rules</h2>
              <button
                type="button"
                onClick={() => appendXpRule({ ...defaultXpRule, id: crypto.randomUUID() })}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Rule
              </button>
            </div>

            {xpRuleFields.length === 0 ? (
              <p className="text-secondary-500 text-sm">No XP rules defined. Add rules to define how players earn XP.</p>
            ) : (
              <div className="space-y-4">
                {xpRuleFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Action Type</label>
                        <select
                          {...register(`xpRules.${index}.actionType` as const)}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                        >
                          <option value={XpActionType.BET}>Bet</option>
                          <option value={XpActionType.DEPOSIT}>Deposit</option>
                          <option value={XpActionType.TOURNAMENT_PARTICIPATION}>Tournament Participation</option>
                          <option value={XpActionType.TOURNAMENT_WIN}>Tournament Win</option>
                          <option value={XpActionType.DAILY_LOGIN}>Daily Login</option>
                          <option value={XpActionType.REFERRAL}>Referral</option>
                          <option value={XpActionType.BADGE_UNLOCK}>Badge Unlock</option>
                          <option value={XpActionType.CUSTOM}>Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">XP Amount</label>
                        <input
                          type="number"
                          {...register(`xpRules.${index}.xpAmount` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Per $ Amount</label>
                        <input
                          type="number"
                          {...register(`xpRules.${index}.perUnitAmount` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                          placeholder="e.g., 10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Daily Cap</label>
                        <input
                          type="number"
                          {...register(`xpRules.${index}.dailyCap` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeXpRule(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Level Rewards */}
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">Level Rewards</h2>
              <button
                type="button"
                onClick={() => appendReward({ ...defaultLevelReward, id: crypto.randomUUID() })}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add Reward
              </button>
            </div>

            {rewardFields.length === 0 ? (
              <p className="text-secondary-500 text-sm">No rewards defined. Add rewards for reaching specific levels.</p>
            ) : (
              <div className="space-y-4">
                {rewardFields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-start p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Level</label>
                        <input
                          type="number"
                          {...register(`levelRewards.${index}.level` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Reward Type</label>
                        <select
                          {...register(`levelRewards.${index}.rewardType` as const)}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                        >
                          <option value={LevelRewardType.BONUS_TEMPLATE}>Bonus Template</option>
                          <option value={LevelRewardType.FREE_SPINS}>Free Spins</option>
                          <option value={LevelRewardType.CASH}>Cash</option>
                          <option value={LevelRewardType.XP_BOOST}>XP Boost</option>
                          <option value={LevelRewardType.BADGE}>Badge</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-secondary-600 mb-1">Value</label>
                        <input
                          type="number"
                          {...register(`levelRewards.${index}.value` as const, { valueAsNumber: true })}
                          className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                          placeholder="Amount"
                        />
                      </div>
                      {watch(`levelRewards.${index}.rewardType`) === LevelRewardType.BONUS_TEMPLATE && (
                        <div>
                          <label className="block text-xs font-medium text-secondary-600 mb-1">Bonus Template</label>
                          <select
                            {...register(`levelRewards.${index}.bonusTemplateId` as const)}
                            className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                          >
                            <option value="">Select bonus...</option>
                            {bonuses.map(bonus => (
                              <option key={bonus.id} value={bonus.id}>{bonus.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {watch(`levelRewards.${index}.rewardType`) === LevelRewardType.BADGE && (
                        <div>
                          <label className="block text-xs font-medium text-secondary-600 mb-1">Badge</label>
                          <select
                            {...register(`levelRewards.${index}.badgeId` as const)}
                            className="w-full px-2 py-1.5 text-sm border border-secondary-300 rounded"
                          >
                            <option value="">Select badge...</option>
                            {badges.map(badge => (
                              <option key={badge.id} value={badge.id}>{badge.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReward(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demotion Rules */}
          <div className="bg-white rounded-xl border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary-900">Demotion Rules</h2>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('demotionEnabled')}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700">Enable demotion</span>
              </label>
            </div>

            {demotionEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Inactive Days</label>
                  <input
                    type="number"
                    {...register('demotionRules.inactiveDays', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-secondary-500">Days of inactivity before demotion</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Demotion Type</label>
                  <select
                    {...register('demotionRules.demotionType')}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={DemotionType.ONE_TIER}>One Tier</option>
                    <option value={DemotionType.ONE_LEVEL}>One Level</option>
                    <option value={DemotionType.RESET_TO_BOTTOM}>Reset to Bottom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Warning Days</label>
                  <input
                    type="number"
                    {...register('demotionRules.warningDays', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-1 text-xs text-secondary-500">Days before demotion to warn player</p>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('demotionRules.preserveXp')}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-secondary-700">Preserve XP within demoted tier</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/levels')}
              className="px-6 py-3 text-secondary-700 border border-secondary-300 rounded-lg hover:bg-secondary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEditing ? 'Update Level System' : 'Create Level System'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
