using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Application.Features.Tournaments.Commands.RegisterTournament;

/// <summary>
/// Response from tournament registration attempt.
/// </summary>
/// <param name="Success">Indicates if registration was successful</param>
/// <param name="Status">Registration status code</param>
/// <param name="ErrorMessage">Error message if registration failed</param>
/// <param name="UpdatedTournament">Updated tournament data after registration</param>
public record RegisterTournamentResponse(
    bool Success,
    TournamentRegistrationStatus Status,
    string? ErrorMessage,
    Tournament? UpdatedTournament);
