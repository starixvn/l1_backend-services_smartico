using FluentValidation;
using Smartico.BackOffice.Application.Jackpots.Commands;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Jackpots.Validators;

/// <summary>
/// Validator for UpdateJackpotCommand.
/// </summary>
public class UpdateJackpotCommandValidator : AbstractValidator<UpdateJackpotCommand>
{
    public UpdateJackpotCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Jackpot ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Jackpot name is required")
            .MaximumLength(100).WithMessage("Jackpot name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Currency is required")
            .Length(3).WithMessage("Currency must be a 3-character code (e.g., USD, EUR)");

        // At least one tier is required
        RuleFor(x => x.Tiers)
            .NotEmpty().WithMessage("At least one tier is required");

        // Tier validation
        RuleForEach(x => x.Tiers).ChildRules(tier =>
        {
            tier.RuleFor(t => t.TierName)
                .NotEmpty().WithMessage("Tier name is required")
                .MaximumLength(50).WithMessage("Tier name must not exceed 50 characters");

            tier.RuleFor(t => t.SeedAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Seed amount must be non-negative");

            tier.RuleFor(t => t.ContributionRate)
                .InclusiveBetween(0, 1).WithMessage("Contribution rate must be between 0 and 1 (0% to 100%)");

            tier.RuleFor(t => t.MaxValue)
                .GreaterThan(t => t.SeedAmount)
                .When(t => t.MaxValue.HasValue)
                .WithMessage("Max value must be greater than seed amount");

            tier.RuleFor(t => t.TriggerCondition)
                .NotNull().WithMessage("Trigger condition is required");
        });

        // Progressive jackpot must have contribution rate > 0 for at least one tier
        When(x => x.Type == JackpotType.Progressive, () =>
        {
            RuleFor(x => x.Tiers)
                .Must(tiers => tiers.Any(t => t.ContributionRate > 0))
                .WithMessage("Progressive jackpot must have at least one tier with contribution rate > 0");
        });

        // Fixed jackpot should have contribution rate = 0 for all tiers
        When(x => x.Type == JackpotType.Fixed, () =>
        {
            RuleFor(x => x.Tiers)
                .Must(tiers => tiers.All(t => t.ContributionRate == 0))
                .WithMessage("Fixed jackpot should have contribution rate = 0 for all tiers");
        });

        // Trigger condition validation
        RuleForEach(x => x.Tiers).ChildRules(tier =>
        {
            tier.RuleFor(t => t.TriggerCondition.Probability)
                .InclusiveBetween(0.000001m, 0.1m)
                .When(t => t.TriggerCondition.TriggerType == JackpotTriggerType.Random)
                .WithMessage("Random probability must be between 0.0001% and 10%");

            tier.RuleFor(t => t.TriggerCondition.BetThreshold)
                .GreaterThan(0)
                .When(t => t.TriggerCondition.TriggerType == JackpotTriggerType.ValueBased)
                .WithMessage("Bet threshold must be greater than 0 for value-based trigger");

            tier.RuleFor(t => t.TriggerCondition.TimeInterval)
                .NotNull()
                .When(t => t.TriggerCondition.TriggerType == JackpotTriggerType.TimeBased)
                .WithMessage("Time interval is required for time-based trigger");
        });

        // Prize distribution validation
        When(x => x.PrizeDistribution != null, () =>
        {
            When(x => x.PrizeDistribution.DistributionType == PrizeDistributionType.SplitAmongWinners, () =>
            {
                RuleFor(x => x.PrizeDistribution.MaxWinners)
                    .NotNull().WithMessage("Max winners is required for split distribution")
                    .GreaterThan(1).WithMessage("Max winners must be greater than 1 for split distribution");

                RuleFor(x => x.PrizeDistribution.WinnerPercentages)
                    .Must(percentages => percentages == null || percentages.Sum() == 100)
                    .WithMessage("Winner percentages must sum to 100");
            });
        });

        // Date validation
        When(x => x.StartDate.HasValue && x.EndDate.HasValue, () =>
        {
            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate)
                .WithMessage("End date must be after start date");
        });

        // Tier names must be unique
        RuleFor(x => x.Tiers)
            .Must(tiers => tiers.Select(t => t.TierName).Distinct().Count() == tiers.Count)
            .WithMessage("Tier names must be unique within the jackpot");
    }
}
