import React from 'react';
import type { FormulaVariableType, BonusType } from '../../../services/api.types';

export interface BonusTier {
  id: string;
  minValue: number;
  percentage: number;
  maxBonus?: number;
}

export interface TieredCalculation {
  basedOn: FormulaVariableType;
  tiers: BonusTier[];
  defaultValue: number;
}

interface TieredCalculationBuilderProps {
  value: TieredCalculation;
  onChange: (value: TieredCalculation) => void;
  bonusType: BonusType;
}

const variableOptions: { value: FormulaVariableType; label: string }[] = [
  { value: 'deposit_amount', label: 'Deposit Amount' },
  { value: 'total_bets', label: 'Total Bets ($)' },
  { value: 'total_bet_count', label: 'Bet Count' },
  { value: 'total_wins', label: 'Total Wins' },
  { value: 'total_losses', label: 'Total Losses' },
  { value: 'player_level', label: 'Player Level' },
];

export const TieredCalculationBuilder: React.FC<TieredCalculationBuilderProps> = ({
  value,
  onChange,
  bonusType,
}) => {
  const addTier = () => {
    const newTier: BonusTier = {
      id: `tier-${Date.now()}`,
      minValue: 0,
      percentage: 10,
    };
    onChange({
      ...value,
      tiers: [...value.tiers, newTier],
    });
  };

  const updateTier = (tierId: string, updates: Partial<BonusTier>) => {
    onChange({
      ...value,
      tiers: value.tiers.map((tier) =>
        tier.id === tierId ? { ...tier, ...updates } : tier
      ),
    });
  };

  const removeTier = (tierId: string) => {
    onChange({
      ...value,
      tiers: value.tiers.filter((tier) => tier.id !== tierId),
    });
  };

  const sortedTiers = [...value.tiers].sort((a, b) => b.minValue - a.minValue);

  const getVariableLabel = (varType: FormulaVariableType): string => {
    return variableOptions.find(o => o.value === varType)?.label || varType;
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Based On
        </label>
        <select
          value={value.basedOn}
          onChange={(e) => onChange({ ...value, basedOn: e.target.value as FormulaVariableType })}
          className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {variableOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-secondary-700">
            Bonus Tiers
          </label>
          <button
            type="button"
            onClick={addTier}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg border border-primary-200"
          >
            + Add Tier
          </button>
        </div>

        {value.tiers.length === 0 ? (
          <div className="text-center py-8 bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-200">
            <p className="text-secondary-500 text-sm">No tiers defined yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 px-3 text-xs font-medium text-secondary-500 uppercase">
              <div className="col-span-3">If {getVariableLabel(value.basedOn)} ≥</div>
              <div className="col-span-3">Bonus %</div>
              <div className="col-span-3">Max Bonus</div>
              <div className="col-span-3">Actions</div>
            </div>

            {sortedTiers.map((tier) => (
              <div key={tier.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white border border-secondary-200 rounded-lg">
                <div className="col-span-3">
                  <input
                    type="number"
                    value={tier.minValue}
                    onChange={(e) => updateTier(tier.id, { minValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 border border-secondary-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
                <div className="col-span-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tier.percentage}
                      onChange={(e) => updateTier(tier.id, { percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1.5 border border-secondary-300 rounded-lg text-sm"
                      min="0"
                      max="100"
                    />
                    <span className="text-secondary-400">%</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    value={tier.maxBonus ?? ''}
                    onChange={(e) => updateTier(tier.id, {
                      maxBonus: e.target.value ? parseFloat(e.target.value) : undefined
                    })}
                    className="w-full px-2 py-1.5 border border-secondary-300 rounded-lg text-sm"
                    placeholder="No max"
                    min="0"
                  />
                </div>
                <div className="col-span-3">
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-12 gap-3 items-center p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
              <div className="col-span-3 text-sm text-secondary-600">Otherwise (default)</div>
              <div className="col-span-3">
                <input
                  type="number"
                  value={value.defaultValue}
                  onChange={(e) => onChange({ ...value, defaultValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border border-secondary-300 rounded-lg text-sm"
                  min="0"
                />
              </div>
              <div className="col-span-6 text-xs text-secondary-400">Fixed amount when no tier matches</div>
            </div>
          </div>
        )}
      </div>

      {/* Example Calculations */}
      {value.tiers.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Example Calculations</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {generateExamples(value, getVariableLabel(value.basedOn), bonusType).map((example, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-blue-400">→</span>
                <span>{example}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getAwardUnit(bonusType: BonusType): { prefix: string; suffix: string; isWholeNumber: boolean } {
  switch (bonusType) {
    case 'FreeSpins':
      return { prefix: '', suffix: ' spins', isWholeNumber: true };
    case 'Points':
      return { prefix: '', suffix: ' pts', isWholeNumber: true };
    case 'Cash':
    default:
      return { prefix: '$', suffix: '', isWholeNumber: false };
  }
}

function formatAward(value: number, bonusType: BonusType): string {
  const unit = getAwardUnit(bonusType);
  const formattedValue = unit.isWholeNumber ? Math.round(value) : value.toFixed(2);
  return `${unit.prefix}${formattedValue}${unit.suffix}`;
}

function generateExamples(calc: TieredCalculation, variableLabel: string, bonusType: BonusType): string[] {
  const examples: string[] = [];
  const sortedTiers = [...calc.tiers].sort((a, b) => b.minValue - a.minValue);

  // Generate example for each tier
  sortedTiers.forEach((tier) => {
    const exampleValue = tier.minValue > 0 ? tier.minValue : 100;
    const rawBonus = (exampleValue * tier.percentage) / 100;
    const finalBonus = tier.maxBonus ? Math.min(tier.maxBonus, rawBonus) : rawBonus;

    let example = `${variableLabel} = $${exampleValue}`;
    example += ` → ${tier.percentage}% = ${formatAward(finalBonus, bonusType)}`;
    if (tier.maxBonus && rawBonus > tier.maxBonus) {
      example += ` (capped at ${formatAward(tier.maxBonus, bonusType)})`;
    }
    examples.push(example);
  });

  // Add default example if there's a gap
  if (sortedTiers.length > 0) {
    const lowestTier = sortedTiers[sortedTiers.length - 1];
    if (lowestTier.minValue > 0) {
      const belowMin = Math.max(1, lowestTier.minValue - 10);
      examples.push(`${variableLabel} = $${belowMin} → Default = ${formatAward(calc.defaultValue, bonusType)}`);
    }
  }

  return examples;
}

export function generateTieredFormulaString(calc: TieredCalculation): string {
  if (calc.tiers.length === 0) {
    return `${calc.defaultValue}`;
  }

  const sorted = [...calc.tiers].sort((a, b) => b.minValue - a.minValue);
  let formula = '';

  sorted.forEach((tier, index) => {
    const baseCalc = `(${calc.basedOn} * ${tier.percentage} / 100)`;
    const withMax = tier.maxBonus ? `min(${tier.maxBonus}, ${baseCalc})` : baseCalc;

    if (index === 0) {
      formula = `if(${calc.basedOn} >= ${tier.minValue}, ${withMax}`;
    } else {
      formula += `, if(${calc.basedOn} >= ${tier.minValue}, ${withMax}`;
    }
  });

  formula += `, ${calc.defaultValue}` + ')'.repeat(calc.tiers.length);
  return formula;
}
