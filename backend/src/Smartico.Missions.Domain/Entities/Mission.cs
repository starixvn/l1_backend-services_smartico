using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a gamification mission that users can complete for rewards.
/// Domain entity representing TMissionOrBadge from @smartico/public-api
/// </summary>
public class Mission
{
    /// <summary>
    /// Unique mission identifier
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Mission name
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Mission description
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Mission image URL
    /// </summary>
    public string? ImageUrl { get; init; }

    /// <summary>
    /// Mission type
    /// </summary>
    public required AchievementType Type { get; init; }

    /// <summary>
    /// Current status
    /// </summary>
    public required AchievementStatus Status { get; init; }

    /// <summary>
    /// Progress percentage (0-100)
    /// </summary>
    public required decimal Progress { get; init; }

    /// <summary>
    /// Individual tasks within the mission
    /// </summary>
    public IReadOnlyList<MissionTask> Tasks { get; init; } = Array.Empty<MissionTask>();

    /// <summary>
    /// Reward amount (points, coins, etc.)
    /// </summary>
    public decimal? RewardAmount { get; init; }

    /// <summary>
    /// Reward currency type
    /// </summary>
    public string? RewardCurrency { get; init; }

    /// <summary>
    /// Expiration date (for time-limited missions)
    /// </summary>
    public DateTime? ExpiresAt { get; init; }

    /// <summary>
    /// Is this a recurring mission?
    /// </summary>
    public bool IsRecurring { get; init; }

    /// <summary>
    /// Number of times completed (for recurring missions)
    /// </summary>
    public int CompletionCount { get; init; }

    /// <summary>
    /// Category name
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Related game IDs
    /// </summary>
    public IReadOnlyList<string> RelatedGames { get; init; } = Array.Empty<string>();
}

