using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Client for interacting with the Smartico Level API.
/// Provides access to level definitions and user level progression data.
/// </summary>
public interface ISmarticoLevelApiClient
{
    /// <summary>
    /// Gets all levels with visibility filtering applied based on user's total points.
    /// Levels are returned sorted by RequiredPoints in ascending order.
    /// </summary>
    /// <param name="userId">The external user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of visible levels for the user, sorted by required points</returns>
    Task<List<Level>> GetLevelsAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the user's current level progression status including progress toward next level.
    /// Returns null if user has no level data (e.g., new user with 0 points).
    /// </summary>
    /// <param name="userId">The external user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>User's level progress or null if no level data</returns>
    Task<UserLevelProgress?> GetUserLevelProgressAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a specific level by ID.
    /// Returns null if level doesn't exist or is not visible to the user.
    /// </summary>
    /// <param name="userId">The external user ID (for visibility check)</param>
    /// <param name="levelId">The level ID to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Level details or null if not found/not visible</returns>
    Task<Level?> GetLevelByIdAsync(string userId, int levelId, CancellationToken cancellationToken = default);
}
