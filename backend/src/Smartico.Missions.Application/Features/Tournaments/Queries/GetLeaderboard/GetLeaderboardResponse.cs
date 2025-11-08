using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Application.Features.Tournaments.Queries.GetLeaderboard;

/// <summary>
/// Response containing tournament leaderboard data.
/// </summary>
/// <param name="Participants">List of tournament participants (hybrid: top 50 + user position if not in top 50)</param>
public record GetLeaderboardResponse(List<TournamentParticipant> Participants);
