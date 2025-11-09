using FluentValidation;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetJackpots;

/// <summary>
/// Validator for GetJackpotsQuery.
/// </summary>
public class GetJackpotsQueryValidator : AbstractValidator<GetJackpotsQuery>
{
    public GetJackpotsQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required")
            .MaximumLength(255)
            .WithMessage("User ID must not exceed 255 characters");
    }
}
