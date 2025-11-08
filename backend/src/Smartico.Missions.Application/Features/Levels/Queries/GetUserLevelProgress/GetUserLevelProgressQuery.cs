using MediatR;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetUserLevelProgress;

/// <summary>
/// Query to retrieve a user's current level progression status.
/// </summary>
/// <param name="UserId">User identifier</param>
public record GetUserLevelProgressQuery(string UserId) : IRequest<GetUserLevelProgressResponse>;
