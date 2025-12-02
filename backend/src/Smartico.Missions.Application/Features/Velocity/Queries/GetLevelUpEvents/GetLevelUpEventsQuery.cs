using MediatR;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetLevelUpEvents;

/// <summary>
/// Query to retrieve unacknowledged level-up events for a player.
/// </summary>
/// <param name="UserId">Player's unique identifier</param>
public record GetLevelUpEventsQuery(string UserId) : IRequest<GetLevelUpEventsResponse>;
