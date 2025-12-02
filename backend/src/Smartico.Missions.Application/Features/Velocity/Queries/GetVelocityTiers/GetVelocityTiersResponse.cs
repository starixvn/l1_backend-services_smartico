using Smartico.Missions.Application.Features.Velocity.DTOs;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityTiers;

/// <summary>
/// Response containing all Velocity tier definitions.
/// </summary>
/// <param name="Tiers">List of all tier configurations</param>
public record GetVelocityTiersResponse(List<VelocityTierDto> Tiers);
