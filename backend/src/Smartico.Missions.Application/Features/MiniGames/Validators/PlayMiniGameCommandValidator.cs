using FluentValidation;
using Smartico.Missions.Application.Features.MiniGames.Commands;

namespace Smartico.Missions.Application.Features.MiniGames.Validators;

/// <summary>
/// Validator for PlayMiniGameCommand
/// </summary>
public class PlayMiniGameCommandValidator : AbstractValidator<PlayMiniGameCommand>
{
    public PlayMiniGameCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.GameId)
            .GreaterThan(0)
            .WithMessage("Game ID must be greater than 0");
    }
}
