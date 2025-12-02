using MediatR;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityProgress;

/// <summary>
/// Query to retrieve a player's Velocity tier progress.
/// </summary>
/// <param name="UserId">Player's unique identifier</param>
public record GetVelocityProgressQuery(string UserId) : IRequest<GetVelocityProgressResponse>;
