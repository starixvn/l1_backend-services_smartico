using FluentValidation;

namespace Smartico.Missions.Application.Features.Jackpots.Commands.OptOut;

/// <summary>
/// Validator for OptOutJackpotCommand.
/// </summary>
public class OptOutJackpotCommandValidator : AbstractValidator<OptOutJackpotCommand>
{
    public OptOutJackpotCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required")
            .MaximumLength(255)
            .WithMessage("User ID must not exceed 255 characters");

        RuleFor(x => x.JackpotTemplateId)
            .GreaterThan(0)
            .WithMessage("Jackpot template ID must be a positive integer");
    }
}
