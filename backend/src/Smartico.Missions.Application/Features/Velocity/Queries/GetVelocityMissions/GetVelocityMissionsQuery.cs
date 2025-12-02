using MediatR;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityMissions;

/// <summary>
/// Query to retrieve tier-gated missions for a player.
/// </summary>
/// <param name="UserId">Player's unique identifier</param>
public record GetVelocityMissionsQuery(string UserId) : IRequest<GetVelocityMissionsResponse>;
