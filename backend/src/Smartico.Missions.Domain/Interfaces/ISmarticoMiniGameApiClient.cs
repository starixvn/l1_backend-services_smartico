using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Abstraction for Smartico Mini Game API operations.
/// Enables demo data implementation for MVP and real API integration later.
/// </summary>
public interface ISmarticoMiniGameApiClient
{
    /// <summary>
    /// Gets all mini games available to the specified user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available mini games with current state.</returns>
    Task<List<MiniGame>> GetMiniGamesAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Plays a mini game and returns the result.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="gameId">Mini game template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Play result with prize information or error details.</returns>
    Task<PlayMiniGameResult> PlayMiniGameAsync(string userId, int gameId, CancellationToken cancellationToken = default);
}
