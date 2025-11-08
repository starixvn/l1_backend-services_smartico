using FluentValidation;

namespace Smartico.Missions.Application.Features.Tournaments.Commands.RegisterTournament;

/// <summary>
/// Validator for RegisterTournamentCommand.
/// </summary>
public class RegisterTournamentCommandValidator : AbstractValidator<RegisterTournamentCommand>
{
    public RegisterTournamentCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.TournamentInstanceId)
            .GreaterThan(0)
            .WithMessage("Tournament instance ID must be greater than 0");
    }
}
