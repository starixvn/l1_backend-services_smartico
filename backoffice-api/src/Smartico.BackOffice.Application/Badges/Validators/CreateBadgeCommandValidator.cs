using FluentValidation;
using Smartico.BackOffice.Application.Badges.Commands;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Badges.Validators;

/// <summary>
/// Validator for CreateBadgeCommand.
/// </summary>
public class CreateBadgeCommandValidator : AbstractValidator<CreateBadgeCommand>
{
    public CreateBadgeCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Badge name is required")
            .MaximumLength(100).WithMessage("Badge name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.IconUrl)
            .MaximumLength(500).WithMessage("Icon URL must not exceed 500 characters");

        RuleFor(x => x.UnlockCriteria)
            .NotNull().WithMessage("Unlock criteria is required");

        // Unlock criteria validation
        When(x => x.UnlockCriteria != null, () =>
        {
            RuleFor(x => x.UnlockCriteria.ThresholdValue)
                .GreaterThan(0).WithMessage("Threshold value must be greater than 0")
                .When(x => x.UnlockCriteria.Type != BadgeUnlockCriteriaType.FirstDeposit &&
                          x.UnlockCriteria.Type != BadgeUnlockCriteriaType.FirstBet);

            // For GamePlayed, eligible games should be specified
            RuleFor(x => x.UnlockCriteria.EligibleGames)
                .NotEmpty().WithMessage("Eligible games are required for GamePlayed criteria")
                .When(x => x.UnlockCriteria.Type == BadgeUnlockCriteriaType.GamePlayed);

            // For TierReached, target tier should be specified
            RuleFor(x => x.UnlockCriteria.TargetTier)
                .NotEmpty().WithMessage("Target tier is required for TierReached criteria")
                .When(x => x.UnlockCriteria.Type == BadgeUnlockCriteriaType.TierReached);

            // For Custom, custom event name should be specified
            RuleFor(x => x.UnlockCriteria.CustomEventName)
                .NotEmpty().WithMessage("Custom event name is required for Custom criteria")
                .When(x => x.UnlockCriteria.Type == BadgeUnlockCriteriaType.Custom);
        });

        // Reward validation (T029 - Phase 5)
        When(x => x.Reward != null, () =>
        {
            // XpBoost validation
            When(x => x.Reward!.Type == BadgeRewardType.XpBoost, () =>
            {
                RuleFor(x => x.Reward!.Value)
                    .NotNull().WithMessage("XpBoost multiplier is required")
                    .InclusiveBetween(1.1m, 3.0m).WithMessage("XpBoost multiplier must be between 1.1 and 3.0");

                RuleFor(x => x.Reward!.DurationHours)
                    .NotNull().WithMessage("XpBoost duration is required")
                    .InclusiveBetween(1, 168).WithMessage("XpBoost duration must be between 1 and 168 hours (1 week)");
            });

            // FreeSpins validation
            When(x => x.Reward!.Type == BadgeRewardType.FreeSpins, () =>
            {
                RuleFor(x => x.Reward!.Value)
                    .NotNull().WithMessage("Free spins count is required")
                    .GreaterThan(0).WithMessage("Free spins count must be greater than 0");
            });

            // Cash validation
            When(x => x.Reward!.Type == BadgeRewardType.Cash, () =>
            {
                RuleFor(x => x.Reward!.Value)
                    .NotNull().WithMessage("Cash amount is required")
                    .GreaterThan(0).WithMessage("Cash amount must be greater than 0");
            });

            // BonusTemplate validation
            When(x => x.Reward!.Type == BadgeRewardType.BonusTemplate, () =>
            {
                RuleFor(x => x.Reward!.BonusTemplateId)
                    .NotEmpty().WithMessage("Bonus template ID is required for BonusTemplate reward");
            });
        });

        RuleFor(x => x.OrderInSeries)
            .GreaterThanOrEqualTo(0).WithMessage("Order in series must be non-negative");
    }
}
