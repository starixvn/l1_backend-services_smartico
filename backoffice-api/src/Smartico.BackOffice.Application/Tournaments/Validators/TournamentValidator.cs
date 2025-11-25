using FluentValidation;
using Smartico.BackOffice.Application.Tournaments.Commands;

namespace Smartico.BackOffice.Application.Tournaments.Validators;

/// <summary>
/// Validator for tournament creation commands.
/// </summary>
public class TournamentValidator : AbstractValidator<CreateTournamentCommand>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TournamentValidator"/> class.
    /// </summary>
    public TournamentValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Tournament name is required.")
            .Length(3, 100)
            .WithMessage("Tournament name must be between 3 and 100 characters.");

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithMessage("Invalid tournament type.");

        RuleFor(x => x.ScoringType)
            .IsInEnum()
            .WithMessage("Invalid scoring type.");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start date is required.")
            .GreaterThan(DateTime.UtcNow.AddHours(-1))
            .WithMessage("Start date must be in the future or very recent past.");

        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage("End date is required.")
            .GreaterThan(x => x.StartDate)
            .WithMessage("End date must be after start date.");

        RuleFor(x => x.PrizePool)
            .GreaterThan(0)
            .WithMessage("Prize pool must be greater than zero.");

        RuleFor(x => x.PrizeDistribution)
            .NotEmpty()
            .WithMessage("At least one prize distribution entry is required.")
            .Must(pd => pd.All(p => p.FromPosition > 0))
            .WithMessage("All prize FromPosition values must be greater than zero.")
            .Must(pd => pd.All(p => p.ToPosition == null || p.ToPosition >= p.FromPosition))
            .WithMessage("ToPosition must be greater than or equal to FromPosition when specified.")
            .Must(pd => pd.All(p => p.PrizeAmount > 0))
            .WithMessage("All prize amounts must be greater than zero.");

        RuleFor(x => x)
            .Must(cmd =>
            {
                // Calculate total prize amount considering ranges
                decimal totalPrize = 0;
                foreach (var prize in cmd.PrizeDistribution)
                {
                    int winnerCount = prize.ToPosition.HasValue
                        ? (prize.ToPosition.Value - prize.FromPosition + 1)
                        : 1;
                    totalPrize += prize.PrizeAmount * winnerCount;
                }
                return totalPrize <= cmd.PrizePool;
            })
            .WithMessage("Total prize distribution (including ranges) cannot exceed the prize pool.");

        RuleFor(x => x.MaxParticipants)
            .GreaterThan(0)
            .When(x => x.MaxParticipants.HasValue)
            .WithMessage("Maximum participants must be greater than zero if specified.");

        RuleFor(x => x.EntryFee)
            .GreaterThanOrEqualTo(0)
            .When(x => x.EntryFee.HasValue)
            .WithMessage("Entry fee cannot be negative.");
    }
}
