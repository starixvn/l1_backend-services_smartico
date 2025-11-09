using MediatR;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Application.Features.Jackpots.Queries.GetWinners;

/// <summary>
/// Query to retrieve jackpot winners with optional filtering by jackpot type
/// </summary>
/// <param name="UserId">The unique identifier of the requesting user</param>
/// <param name="FilterType">Optional filter to show only winners from specific jackpot type (MultiUser or Personal)</param>
public record GetJackpotWinnersQuery(
    string UserId,
    JackpotType? FilterType = null
) : IRequest<GetJackpotWinnersResponse>;

/// <summary>
/// Response containing the list of jackpot winners
/// </summary>
/// <param name="Winners">List of jackpot winners, with usernames masked for privacy except for current user</param>
public record GetJackpotWinnersResponse(List<JackpotWinner> Winners);
