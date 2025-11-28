using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Domain.Repositories;

/// <summary>
/// Repository interface for BonusClaim entities.
/// Provides methods for tracking and querying bonus claims
/// to enforce per-bonus and global operator limits.
/// </summary>
public interface IBonusClaimRepository
{
    /// <summary>
    /// Creates a new bonus claim record.
    /// </summary>
    Task<BonusClaim> CreateAsync(BonusClaim claim, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a claim by its ID.
    /// </summary>
    Task<BonusClaim?> GetByIdAsync(ObjectId operatorId, ObjectId id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets claims for a specific bonus.
    /// </summary>
    Task<IReadOnlyList<BonusClaim>> GetByBonusIdAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets claims for a specific player.
    /// </summary>
    Task<IReadOnlyList<BonusClaim>> GetByPlayerIdAsync(ObjectId operatorId, string playerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total claim count for a specific bonus.
    /// Used for enforcing MaxTotalClaims limit.
    /// </summary>
    Task<int> GetTotalClaimCountAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets claim count for a player on a specific bonus.
    /// Used for enforcing MaxClaimsPerPlayer limit.
    /// </summary>
    Task<int> GetPlayerClaimCountAsync(ObjectId operatorId, ObjectId bonusId, string playerId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets claim count for a player on a specific bonus within a date range.
    /// Used for enforcing MaxClaimsPerPlayerPerDay/Week/Month limits.
    /// </summary>
    Task<int> GetPlayerClaimCountInRangeAsync(
        ObjectId operatorId,
        ObjectId bonusId,
        string playerId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total claim value for a player across all bonuses within a date range.
    /// Used for enforcing global operator limits (MaxDailyBonusValuePerPlayer, etc.).
    /// </summary>
    Task<decimal> GetPlayerTotalClaimValueInRangeAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets total claim value for a specific bonus.
    /// Used for enforcing MaxTotalValue limit.
    /// </summary>
    Task<decimal> GetTotalClaimValueAsync(ObjectId operatorId, ObjectId bonusId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the status of a claim.
    /// </summary>
    Task<BonusClaim?> UpdateStatusAsync(
        ObjectId operatorId,
        ObjectId id,
        BonusClaimStatus status,
        string? externalReferenceId = null,
        CancellationToken cancellationToken = default);
}
