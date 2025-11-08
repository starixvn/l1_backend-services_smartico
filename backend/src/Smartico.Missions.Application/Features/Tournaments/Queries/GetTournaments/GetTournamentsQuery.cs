using MediatR;
using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Tournaments.Queries.GetTournaments;

/// <summary>
/// Query to retrieve all tournaments for a specific user.
/// </summary>
/// <param name="UserId">User identifier</param>
public record GetTournamentsQuery(string UserId) : IRequest<GetTournamentsResponse>;
