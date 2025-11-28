using MongoDB.Bson;

namespace Smartico.BackOffice.Domain.Services;

/// <summary>
/// Service for checking and enforcing bonus limits.
/// Handles both per-bonus limits and global operator limits.
/// </summary>
public interface IBonusLimitService
{
    /// <summary>
    /// Checks if a player can claim a specific bonus.
    /// Validates against both per-bonus limits and global operator limits.
    /// </summary>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="playerId">The player's external ID.</param>
    /// <param name="bonusId">The bonus template ID.</param>
    /// <param name="claimValue">The calculated claim value.</param>
    /// <param name="currency">The currency of the claim.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Result indicating if claim is allowed and any rejection reasons.</returns>
    Task<BonusClaimCheckResult> CheckPlayerCanClaimAsync(
        ObjectId operatorId,
        string playerId,
        ObjectId bonusId,
        decimal claimValue,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the player's total bonus value claimed today.
    /// </summary>
    Task<decimal> GetPlayerDailyTotalAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the player's total bonus value claimed this week.
    /// </summary>
    Task<decimal> GetPlayerWeeklyTotalAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the player's total bonus value claimed this month.
    /// </summary>
    Task<decimal> GetPlayerMonthlyTotalAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the player's remaining limit for the current day.
    /// Returns null if no daily limit is configured.
    /// </summary>
    Task<decimal?> GetPlayerRemainingDailyLimitAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the player's remaining limit for the current week.
    /// Returns null if no weekly limit is configured.
    /// </summary>
    Task<decimal?> GetPlayerRemainingWeeklyLimitAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the player's remaining limit for the current month.
    /// Returns null if no monthly limit is configured.
    /// </summary>
    Task<decimal?> GetPlayerRemainingMonthlyLimitAsync(
        ObjectId operatorId,
        string playerId,
        string currency,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of a bonus claim eligibility check.
/// </summary>
public record BonusClaimCheckResult
{
    /// <summary>
    /// Whether the claim is allowed.
    /// </summary>
    public bool IsAllowed { get; init; }

    /// <summary>
    /// Reason for rejection if not allowed.
    /// </summary>
    public string? RejectionReason { get; init; }

    /// <summary>
    /// Specific limit that was exceeded if rejected.
    /// </summary>
    public BonusLimitType? ExceededLimit { get; init; }

    /// <summary>
    /// The limit value that was exceeded.
    /// </summary>
    public decimal? LimitValue { get; init; }

    /// <summary>
    /// The current usage toward the limit.
    /// </summary>
    public decimal? CurrentUsage { get; init; }

    /// <summary>
    /// Creates an allowed result.
    /// </summary>
    public static BonusClaimCheckResult Allowed() => new() { IsAllowed = true };

    /// <summary>
    /// Creates a rejected result.
    /// </summary>
    public static BonusClaimCheckResult Rejected(
        string reason,
        BonusLimitType? exceededLimit = null,
        decimal? limitValue = null,
        decimal? currentUsage = null) => new()
    {
        IsAllowed = false,
        RejectionReason = reason,
        ExceededLimit = exceededLimit,
        LimitValue = limitValue,
        CurrentUsage = currentUsage
    };
}

/// <summary>
/// Types of bonus limits that can be exceeded.
/// </summary>
public enum BonusLimitType
{
    /// <summary>
    /// Per-bonus: Maximum total claims across all players.
    /// </summary>
    BonusMaxTotalClaims,

    /// <summary>
    /// Per-bonus: Maximum claims per player (lifetime).
    /// </summary>
    BonusMaxClaimsPerPlayer,

    /// <summary>
    /// Per-bonus: Maximum claims per player per day.
    /// </summary>
    BonusMaxClaimsPerPlayerPerDay,

    /// <summary>
    /// Per-bonus: Maximum claims per player per week.
    /// </summary>
    BonusMaxClaimsPerPlayerPerWeek,

    /// <summary>
    /// Per-bonus: Maximum claims per player per month.
    /// </summary>
    BonusMaxClaimsPerPlayerPerMonth,

    /// <summary>
    /// Per-bonus: Maximum total value distributed.
    /// </summary>
    BonusMaxTotalValue,

    /// <summary>
    /// Global: Maximum daily bonus value per player across all bonuses.
    /// </summary>
    GlobalMaxDailyValuePerPlayer,

    /// <summary>
    /// Global: Maximum weekly bonus value per player across all bonuses.
    /// </summary>
    GlobalMaxWeeklyValuePerPlayer,

    /// <summary>
    /// Global: Maximum monthly bonus value per player across all bonuses.
    /// </summary>
    GlobalMaxMonthlyValuePerPlayer,

    /// <summary>
    /// Global: Maximum active bonuses per player.
    /// </summary>
    GlobalMaxActiveBonusesPerPlayer
}
