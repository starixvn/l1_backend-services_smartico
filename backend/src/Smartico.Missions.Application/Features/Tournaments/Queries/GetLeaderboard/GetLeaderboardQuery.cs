using MediatR;

namespace Smartico.Missions.Application.Features.Tournaments.Queries.GetLeaderboard;

/// <summary>
/// Query to get tournament leaderboard with hybrid pagination (top 50 + user position).
/// </summary>
/// <param name="UserId">User identifier</param>
/// <param name="TournamentInstanceId">Tournament instance identifier</param>
public record GetLeaderboardQuery(string UserId, int TournamentInstanceId) : IRequest<GetLeaderboardResponse>;
