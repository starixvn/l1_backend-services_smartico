using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for leaderboard operations.
/// </summary>
public interface ILeaderboardRepository
{
    /// <summary>
    /// Gets the leaderboard for a specific tournament.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="limit">Maximum number of entries to return.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of leaderboard entries ordered by rank.</returns>
    Task<List<LeaderboardEntry>> GetLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        int limit = 100,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific player's leaderboard entry for a tournament.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="playerId">The player ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The player's leaderboard entry, or null if not found.</returns>
    Task<LeaderboardEntry?> GetPlayerEntryAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        string playerId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates or creates a player's leaderboard entry.
    /// </summary>
    /// <param name="entry">The leaderboard entry to upsert.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The upserted entry.</returns>
    Task<LeaderboardEntry> UpsertEntryAsync(
        LeaderboardEntry entry,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Recalculates all ranks for a tournament's leaderboard.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of entries updated.</returns>
    Task<int> RecalculateRanksAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes all leaderboard entries for a tournament.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of entries deleted.</returns>
    Task<long> DeleteTournamentLeaderboardAsync(
        ObjectId operatorId,
        ObjectId tournamentId,
        CancellationToken cancellationToken = default);
}
