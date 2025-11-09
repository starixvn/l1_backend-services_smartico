using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Client for interacting with the Smartico Jackpot API.
/// Provides access to jackpot data, opt-in/opt-out operations, and winner history.
/// </summary>
public interface ISmarticoJackpotApiClient
{
    /// <summary>
    /// Gets all active jackpots with user-specific opt-in status.
    /// Returns jackpots sorted by template ID.
    /// </summary>
    /// <param name="userId">The external user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of jackpot details with user opt-in status</returns>
    Task<List<JackpotDetails>> GetJackpotsAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific jackpot by template ID.
    /// Returns null if jackpot doesn't exist.
    /// </summary>
    /// <param name="templateId">The jackpot template ID</param>
    /// <param name="userId">The external user ID (for opt-in status)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Jackpot details or null if not found</returns>
    Task<JackpotDetails?> GetJackpotByIdAsync(int templateId, string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Opts a user into a jackpot.
    /// User becomes eligible for prizes immediately.
    /// </summary>
    /// <param name="userId">The external user ID</param>
    /// <param name="templateId">The jackpot template ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated jackpot details with user opted in</returns>
    /// <exception cref="InvalidOperationException">If user already opted in or jackpot not found</exception>
    Task<JackpotDetails> OptInAsync(string userId, int templateId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Opts a user out of a jackpot.
    /// User stops contributing and is no longer eligible for prizes.
    /// </summary>
    /// <param name="userId">The external user ID</param>
    /// <param name="templateId">The jackpot template ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated jackpot details with user opted out</returns>
    /// <exception cref="InvalidOperationException">If user not opted in or jackpot not found</exception>
    Task<JackpotDetails> OptOutAsync(string userId, int templateId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets recent jackpot winners with optional type filtering.
    /// Returns winners from the last 30 days.
    /// </summary>
    /// <param name="userId">The external user ID (for IsMe flag)</param>
    /// <param name="filterType">Optional jackpot type filter (MultiUser/Personal)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of winners sorted by win date (descending)</returns>
    Task<List<JackpotWinner>> GetWinnersAsync(string userId, JackpotType? filterType = null, CancellationToken cancellationToken = default);
}
