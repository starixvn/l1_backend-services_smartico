using Smartico.Missions.Application.Features.Velocity.DTOs;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityMissions;

/// <summary>
/// Response containing tier-gated missions and player's current tier.
/// </summary>
/// <param name="Missions">List of all tier-gated missions</param>
/// <param name="PlayerTier">Player's current tier number</param>
public record GetVelocityMissionsResponse(List<TierMissionDto> Missions, int PlayerTier);
