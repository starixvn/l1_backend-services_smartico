using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for tournament API client providing tournament data and registration operations.
/// </summary>
public interface ISmarticoTournamentApiClient
{
    /// <summary>
    /// Retrieves all tournaments for a specific user.
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of tournaments with user-specific data</returns>
    Task<List<Tournament>> GetTournamentsAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves detailed information for a specific tournament.
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="tournamentInstanceId">Tournament instance identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Detailed tournament information</returns>
    Task<Tournament?> GetTournamentDetailsAsync(string userId, int tournamentInstanceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves the leaderboard for a specific tournament.
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="tournamentInstanceId">Tournament instance identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of participants ranked by score</returns>
    Task<List<TournamentParticipant>> GetLeaderboardAsync(string userId, int tournamentInstanceId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Registers a user for a tournament.
    /// </summary>
    /// <param name="userId">User identifier</param>
    /// <param name="tournamentInstanceId">Tournament instance identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Registration result with updated tournament state</returns>
    Task<RegisterTournamentResult> RegisterTournamentAsync(string userId, int tournamentInstanceId, CancellationToken cancellationToken = default);
}
