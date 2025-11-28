using FluentValidation;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Validators;

/// <summary>
/// Validator for mission creation commands.
/// Supports both task-based (new) and visual rule-based (legacy) mission definitions.
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
            .WithMessage("Start date is required.");

        RuleFor(x => x.EndDate)
            .NotEmpty()
            .WithMessage("End date is required.")
            .GreaterThan(x => x.StartDate)
            .WithMessage("End date must be after start date.");

        // CompletionPoints is required for task-based missions
        RuleFor(x => x.CompletionPoints)
            .GreaterThan(0)
            .When(x => x.Tasks != null && x.Tasks.Count > 0)
            .WithMessage("Completion points must be greater than 0 for task-based missions.");

        // Note: Either Tasks OR Rule should be provided, but this is validated at publish time.
        // For drafts, we allow saving with incomplete configuration.
        // Full validation (tasks have triggers/goals, rule has nodes/connections) happens
        // only when publishing via PublishMissionCommandHandler.
    }
}
