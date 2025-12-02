using MediatR;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityTiers;

/// <summary>
/// Query to retrieve all Velocity tier definitions.
/// </summary>
public record GetVelocityTiersQuery() : IRequest<GetVelocityTiersResponse>;
