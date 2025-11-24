using MongoDB.Bson;
using Smartico.BackOffice.Application.Leaderboard.DTOs;

namespace Smartico.BackOffice.Application.Leaderboard.Interfaces;

/// <summary>
/// Service interface for leaderboard operations.
/// </summary>
public interface ILeaderboardService
{
    /// <summary>
    /// Gets the leaderboard for a specific tournament.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="limit">Maximum number of entries to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of leaderboard entries.</returns>
    Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a player's position on the leaderboard.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="playerId">The player ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The player's leaderboard entry, or null if not found.</returns>
    Task<LeaderboardEntryDto?> GetPlayerPositionAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        string playerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates mock leaderboard data for demo purposes.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="entryCount">Number of entries to generate.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of entries created.</returns>
    Task<int> GenerateMockLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        int entryCount = 50,
        CancellationToken cancellationToken = default);
}
