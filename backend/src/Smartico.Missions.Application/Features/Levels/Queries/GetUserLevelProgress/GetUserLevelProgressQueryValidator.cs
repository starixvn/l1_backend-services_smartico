using FluentValidation;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetUserLevelProgress;

/// <summary>
/// Validator for GetUserLevelProgressQuery.
/// </summary>
public class GetUserLevelProgressQueryValidator : AbstractValidator<GetUserLevelProgressQuery>
{
    public GetUserLevelProgressQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");
    }
}
