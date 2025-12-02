using Smartico.Missions.Application.Features.Velocity.DTOs;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityProgress;

/// <summary>
/// Response containing player's velocity progress data.
/// </summary>
/// <param name="Progress">Player velocity progress or null if no data</param>
public record GetVelocityProgressResponse(PlayerVelocityProgressDto? Progress);
