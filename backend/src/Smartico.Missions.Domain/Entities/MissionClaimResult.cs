namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Result of a mission reward claim operation.
/// Represents TMissionClaimRewardResult from @smartico/public-api
/// </summary>
public class MissionClaimResult
{
    /// <summary>
    /// Was the claim successful?
    /// </summary>
    public required bool Success { get; init; }

    /// <summary>
    /// Result message
    /// </summary>
    public required string Message { get; init; }

    /// <summary>
    /// Reward amount claimed
    /// </summary>
    public decimal? RewardAmount { get; init; }

    /// <summary>
    /// Reward currency type
    /// </summary>
    public string? RewardCurrency { get; init; }

    /// <summary>
    /// Updated mission data (if successful)
    /// </summary>
    public Mission? Mission { get; init; }

    /// <summary>
    /// Error code (if failed)
    /// </summary>
    public string? ErrorCode { get; init; }
}

