using FluentValidation;
using Smartico.BackOffice.Application.LevelSystems.Commands;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.LevelSystems.Validators;

/// <summary>
/// Validator for CreateLevelSystemCommand.
/// </summary>
public class CreateLevelSystemCommandValidator : AbstractValidator<CreateLevelSystemCommand>
{
    public CreateLevelSystemCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MinimumLength(3).WithMessage("Name must be at least 3 characters.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.MaxLevel)
            .InclusiveBetween(2, 1000).WithMessage("Max level must be between 2 and 1000.");

        RuleFor(x => x.ProgressionCurve)
            .IsInEnum().WithMessage("Invalid progression curve type.");

        RuleFor(x => x.BaseXpRequired)
            .GreaterThan(0).WithMessage("Base XP required must be greater than 0.")
            .LessThanOrEqualTo(1000000).WithMessage("Base XP required cannot exceed 1,000,000.");

        RuleFor(x => x.XpMultiplier)
            .GreaterThan(1).WithMessage("XP multiplier must be greater than 1.")
            .LessThanOrEqualTo(10).WithMessage("XP multiplier cannot exceed 10.")
            .When(x => x.ProgressionCurve == ProgressionCurveType.Exponential);

        // Tiers validation
        RuleFor(x => x.Tiers)
            .Must(HaveNonOverlappingTiers).WithMessage("Tier level ranges must not overlap.")
            .Must(CoverAllLevels).WithMessage("Tiers must cover all levels from 1 to max level.")
            .When(x => x.Tiers.Count > 0);

        RuleForEach(x => x.Tiers).ChildRules(tier =>
        {
            tier.RuleFor(t => t.Name)
                .NotEmpty().WithMessage("Tier name is required.")
                .MaximumLength(50).WithMessage("Tier name cannot exceed 50 characters.");

            tier.RuleFor(t => t.FromLevel)
                .GreaterThanOrEqualTo(1).WithMessage("From level must be at least 1.");

            tier.RuleFor(t => t.ToLevel)
                .GreaterThanOrEqualTo(t => t.FromLevel).WithMessage("To level must be greater than or equal to from level.");
        });

        // XP Rules validation
        RuleForEach(x => x.XpRules).ChildRules(rule =>
        {
            rule.RuleFor(r => r.ActionType)
                .IsInEnum().WithMessage("Invalid XP action type.");

            rule.RuleFor(r => r.XpAmount)
                .GreaterThan(0).WithMessage("XP amount must be greater than 0.")
                .LessThanOrEqualTo(100000).WithMessage("XP amount cannot exceed 100,000.");

            rule.RuleFor(r => r.PerUnitAmount)
                .GreaterThan(0).WithMessage("Per unit amount must be greater than 0.")
                .When(r => r.PerUnitAmount.HasValue);

            rule.RuleFor(r => r.DailyCap)
                .GreaterThan(0).WithMessage("Daily cap must be greater than 0.")
                .When(r => r.DailyCap.HasValue);
        });

        // Level Rewards validation
        RuleForEach(x => x.LevelRewards).ChildRules(reward =>
        {
            reward.RuleFor(r => r.Level)
                .GreaterThanOrEqualTo(1).WithMessage("Reward level must be at least 1.");

            reward.RuleFor(r => r.RewardType)
                .IsInEnum().WithMessage("Invalid reward type.");

            reward.RuleFor(r => r.Value)
                .GreaterThan(0).WithMessage("Reward value must be greater than 0.")
                .When(r => r.Value.HasValue);

            reward.RuleFor(r => r.BonusTemplateId)
                .NotEmpty().WithMessage("Bonus template ID is required for BonusTemplate reward type.")
                .When(r => r.RewardType == LevelRewardType.BonusTemplate);

            reward.RuleFor(r => r.BadgeId)
                .NotEmpty().WithMessage("Badge ID is required for Badge reward type.")
                .When(r => r.RewardType == LevelRewardType.Badge);
        });

        // Demotion rules validation
        When(x => x.DemotionEnabled && x.DemotionRules != null, () =>
        {
            RuleFor(x => x.DemotionRules!.InactiveDays)
                .GreaterThan(0).WithMessage("Inactive days must be greater than 0.")
                .LessThanOrEqualTo(365).WithMessage("Inactive days cannot exceed 365.");

            RuleFor(x => x.DemotionRules!.DemotionType)
                .IsInEnum().WithMessage("Invalid demotion type.");

            RuleFor(x => x.DemotionRules!.WarningDays)
                .GreaterThanOrEqualTo(0).WithMessage("Warning days cannot be negative.")
                .LessThan(x => x.DemotionRules!.InactiveDays).WithMessage("Warning days must be less than inactive days.");
        });
    }

    private bool HaveNonOverlappingTiers(CreateLevelSystemCommand command, List<DTOs.LevelTierDto> tiers)
    {
        if (tiers.Count <= 1) return true;

        var sortedTiers = tiers.OrderBy(t => t.FromLevel).ToList();
        for (int i = 0; i < sortedTiers.Count - 1; i++)
        {
            if (sortedTiers[i].ToLevel >= sortedTiers[i + 1].FromLevel)
            {
                return false;
            }
        }

        return true;
    }

    private bool CoverAllLevels(CreateLevelSystemCommand command, List<DTOs.LevelTierDto> tiers)
    {
        if (tiers.Count == 0) return true;

        var sortedTiers = tiers.OrderBy(t => t.FromLevel).ToList();

        // Check first tier starts at 1
        if (sortedTiers[0].FromLevel != 1) return false;

        // Check last tier ends at max level
        if (sortedTiers[^1].ToLevel != command.MaxLevel) return false;

        // Check tiers are contiguous
        for (int i = 0; i < sortedTiers.Count - 1; i++)
        {
            if (sortedTiers[i].ToLevel + 1 != sortedTiers[i + 1].FromLevel)
            {
                return false;
            }
        }

        return true;
    }
}
