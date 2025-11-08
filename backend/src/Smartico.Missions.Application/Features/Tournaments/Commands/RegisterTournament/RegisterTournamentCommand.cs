using MediatR;

namespace Smartico.Missions.Application.Features.Tournaments.Commands.RegisterTournament;

/// <summary>
/// Command to register a user for a tournament.
/// </summary>
/// <param name="UserId">User identifier</param>
/// <param name="TournamentInstanceId">Tournament instance identifier</param>
public record RegisterTournamentCommand(string UserId, int TournamentInstanceId) : IRequest<RegisterTournamentResponse>;
