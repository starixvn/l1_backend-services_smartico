using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Tournaments.Queries.GetTournaments;

/// <summary>
/// Response containing list of tournaments.
/// </summary>
/// <param name="Tournaments">List of tournaments with user-specific data</param>
public record GetTournamentsResponse(List<Tournament> Tournaments);
