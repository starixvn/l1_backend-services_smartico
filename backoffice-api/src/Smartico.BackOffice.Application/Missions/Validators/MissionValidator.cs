using FluentValidation;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Validators;

/// <summary>
/// Validator for mission creation commands.
/// </summary>
public class MissionValidator : AbstractValidator<CreateMissionCommand>
{
    /// <summary>
    /// Initializes a new instance of the <see cref="MissionValidator"/> class.
    /// </summary>
    public MissionValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Mission name is required.")
            .Length(3, 100)
            .WithMessage("Mission name must be between 3 and 100 characters.");

        RuleFor(x => x.TargetSegment)
            .IsInEnum()
            .WithMessage("Invalid player segment.");

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

        RuleFor(x => x.Rule)
            .NotNull()
            .WithMessage("Mission rule is required.");

        // Note: Rule structure validation (nodes, connections, node data) is intentionally
        // relaxed for drafts. Full validation happens only when publishing via PublishMissionCommandHandler.
    }
}
