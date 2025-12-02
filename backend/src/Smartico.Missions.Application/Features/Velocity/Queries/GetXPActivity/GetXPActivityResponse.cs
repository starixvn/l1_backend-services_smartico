using Smartico.Missions.Application.Features.Velocity.DTOs;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetXPActivity;

/// <summary>
/// Response containing XP activity feed.
/// </summary>
/// <param name="Activities">List of recent XP activities</param>
/// <param name="TotalCount">Total number of activities available</param>
public record GetXPActivityResponse(List<XpActivityDto> Activities, int TotalCount);
