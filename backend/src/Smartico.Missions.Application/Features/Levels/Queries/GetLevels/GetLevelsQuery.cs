using MediatR;
using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetLevels;

/// <summary>
/// Query to retrieve all levels visible to a user.
/// </summary>
/// <param name="UserId">User identifier</param>
public record GetLevelsQuery(string UserId) : IRequest<GetLevelsResponse>;

/// <summary>
/// Response containing list of levels and user's current level ID.
/// </summary>
/// <param name="Levels">List of levels sorted by required points (ascending)</param>
/// <param name="UserCurrentLevelId">ID of the user's current level</param>
public record GetLevelsResponse(List<Level> Levels, int UserCurrentLevelId);
