using FluentValidation;
using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetWinners;

/// <summary>
/// Validator for GetJackpotWinnersQuery
/// </summary>
public class GetJackpotWinnersQueryValidator : AbstractValidator<GetJackpotWinnersQuery>
{
    public GetJackpotWinnersQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.FilterType)
            .IsInEnum()
            .When(x => x.FilterType.HasValue)
            .WithMessage("Filter type must be a valid JackpotType value (1=MultiUser, 2=Personal)");
    }
}
