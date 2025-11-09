using FluentValidation;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetLevels;

/// <summary>
/// Validator for GetLevelsQuery.
/// </summary>
public class GetLevelsQueryValidator : AbstractValidator<GetLevelsQuery>
{
    public GetLevelsQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");
    }
}
