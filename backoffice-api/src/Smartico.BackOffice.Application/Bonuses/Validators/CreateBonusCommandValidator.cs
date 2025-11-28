using FluentValidation;
using Smartico.BackOffice.Application.Bonuses.Commands;
using Smartico.BackOffice.Application.Bonuses.DTOs;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.Bonuses.Validators;

/// <summary>
/// Validator for CreateBonusCommand.
/// Validates bonus creation with simplified 3 award types: FreeSpins, Cash, Points.
/// </summary>
public class CreateBonusCommandValidator : AbstractValidator<CreateBonusCommand>
{
    public CreateBonusCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MinimumLength(3).WithMessage("Name must be at least 3 characters.")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Invalid bonus type.");

        RuleFor(x => x.ActivationType)
            .IsInEnum().WithMessage("Invalid activation type.");

        RuleFor(x => x.GiftCode)
            .NotEmpty().WithMessage("Gift code is required for manual activation.")
            .MinimumLength(4).WithMessage("Gift code must be at least 4 characters.")
            .MaximumLength(20).WithMessage("Gift code cannot exceed 20 characters.")
            .Matches("^[A-Z0-9]+$").WithMessage("Gift code must contain only uppercase letters and numbers.")
            .When(x => x.ActivationType == BonusActivationType.Manual);

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date.");

        // Free Spins validation (only required for Fixed calculation)
        When(x => x.Type == BonusType.FreeSpins && x.CalculationRule?.CalculationType == BonusCalculationType.Fixed, () =>
        {
            RuleFor(x => x.FreeSpins)
                .NotNull().WithMessage("Free spins configuration is required for FreeSpins bonus type.");
        });

        When(x => x.Type == BonusType.FreeSpins && x.FreeSpins != null, () =>
        {
            RuleFor(x => x.FreeSpins!.NumberOfSpins)
                .GreaterThan(0).WithMessage("Number of spins must be greater than 0.")
                .LessThanOrEqualTo(10000).WithMessage("Number of spins cannot exceed 10000.")
                .When(x => x.CalculationRule?.CalculationType == BonusCalculationType.Fixed);

            RuleFor(x => x.FreeSpins!.SpinValue)
                .GreaterThan(0).WithMessage("Spin value must be greater than 0.");
        });

        // Cash validation (only required for Fixed calculation)
        When(x => x.Type == BonusType.Cash && x.CalculationRule?.CalculationType == BonusCalculationType.Fixed, () =>
        {
            RuleFor(x => x.Cash)
                .NotNull().WithMessage("Cash configuration is required for Cash bonus type.");

            RuleFor(x => x.Cash!.Amount)
                .GreaterThan(0).WithMessage("Cash amount must be greater than 0.")
                .When(x => x.Cash != null);
        });

        // Points validation (only required for Fixed calculation)
        When(x => x.Type == BonusType.Points && x.CalculationRule?.CalculationType == BonusCalculationType.Fixed, () =>
        {
            RuleFor(x => x.Points)
                .NotNull().WithMessage("Points configuration is required for Points bonus type.");

            RuleFor(x => x.Points!.Amount)
                .GreaterThan(0).WithMessage("Points amount must be greater than 0.")
                .When(x => x.Points != null);
        });

        // Calculation rule validation (optional)
        When(x => x.CalculationRule != null, () =>
        {
            RuleFor(x => x.CalculationRule!.CalculationType)
                .IsInEnum().WithMessage("Invalid calculation type.");

            RuleFor(x => x.CalculationRule!.MinAmount)
                .GreaterThan(0).WithMessage("Minimum amount must be greater than 0.")
                .When(x => x.CalculationRule!.MinAmount.HasValue);

            RuleFor(x => x.CalculationRule!.MaxAmount)
                .GreaterThan(0).WithMessage("Maximum amount must be greater than 0.")
                .GreaterThanOrEqualTo(x => x.CalculationRule!.MinAmount ?? 0)
                .WithMessage("Maximum amount must be greater than or equal to minimum amount.")
                .When(x => x.CalculationRule!.MaxAmount.HasValue);
        });

        // Dynamic calculation requires BasedOn
        When(x => x.CalculationRule != null && x.CalculationRule.CalculationType == BonusCalculationType.Dynamic, () =>
        {
            RuleFor(x => x.CalculationRule!.BasedOn)
                .NotNull().WithMessage("Based on is required for dynamic calculation.")
                .IsInEnum().WithMessage("Invalid calculation based on value.");
        });

        // Bonus limits validation (optional)
        When(x => x.Limits != null, () =>
        {
            RuleFor(x => x.Limits!.MaxTotalClaims)
                .GreaterThan(0).WithMessage("Max total claims must be greater than 0.")
                .When(x => x.Limits!.MaxTotalClaims.HasValue);

            RuleFor(x => x.Limits!.MaxClaimsPerPlayer)
                .GreaterThan(0).WithMessage("Max claims per player must be greater than 0.")
                .When(x => x.Limits!.MaxClaimsPerPlayer.HasValue);

            RuleFor(x => x.Limits!.MaxClaimsPerPlayerPerDay)
                .GreaterThan(0).WithMessage("Max claims per player per day must be greater than 0.")
                .When(x => x.Limits!.MaxClaimsPerPlayerPerDay.HasValue);

            RuleFor(x => x.Limits!.MaxClaimsPerPlayerPerWeek)
                .GreaterThan(0).WithMessage("Max claims per player per week must be greater than 0.")
                .When(x => x.Limits!.MaxClaimsPerPlayerPerWeek.HasValue);

            RuleFor(x => x.Limits!.MaxClaimsPerPlayerPerMonth)
                .GreaterThan(0).WithMessage("Max claims per player per month must be greater than 0.")
                .When(x => x.Limits!.MaxClaimsPerPlayerPerMonth.HasValue);

            RuleFor(x => x.Limits!.MaxTotalValue)
                .GreaterThan(0).WithMessage("Max total value must be greater than 0.")
                .When(x => x.Limits!.MaxTotalValue.HasValue);
        });
    }
}
