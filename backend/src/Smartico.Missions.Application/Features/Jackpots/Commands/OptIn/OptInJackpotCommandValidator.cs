using FluentValidation;

namespace Smartico.Missions.Application.Features.Jackpots.Commands.OptIn;

/// <summary>
/// Validator for OptInJackpotCommand.
/// </summary>
public class OptInJackpotCommandValidator : AbstractValidator<OptInJackpotCommand>
{
    public OptInJackpotCommandValidator()
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
