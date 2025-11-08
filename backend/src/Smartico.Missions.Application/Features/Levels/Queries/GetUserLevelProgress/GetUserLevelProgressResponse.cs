using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Levels.Queries.GetUserLevelProgress;

/// <summary>
/// Response containing user's level progression data.
/// </summary>
/// <param name="Progress">User level progress or null if no level data</param>
public record GetUserLevelProgressResponse(UserLevelProgress? Progress);
