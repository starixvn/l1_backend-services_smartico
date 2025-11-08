using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for communicating with Smartico Bonus API
/// </summary>
public interface ISmarticoBonusApiClient
{
    /// <summary>
    /// Retrieves all bonuses for a specific user
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of bonuses for the user</returns>
    Task<IEnumerable<Bonus>> GetBonusesAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Claims a specific bonus for a user
    /// </summary>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="bonusId">Unique identifier of the bonus to claim</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result of the claim operation</returns>
    Task<ClaimBonusResult> ClaimBonusAsync(string userId, string bonusId, CancellationToken cancellationToken = default);
}
