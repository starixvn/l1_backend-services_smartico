using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a collectible badge achievement.
/// Domain entity representing TMissionOrBadge (where Type = Badge) from @smartico/public-api
/// </summary>
public class Badge
{
    /// <summary>
    /// Unique badge identifier
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Badge name
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Badge description
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Badge image URL
    /// </summary>
    public string? ImageUrl { get; init; }

    /// <summary>
    /// Achievement type (should always be Badge)
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
    /// Is this badge earned?
    /// </summary>
    public bool IsEarned { get; init; }

    /// <summary>
    /// Date when badge was earned
    /// </summary>
    public DateTime? EarnedAt { get; init; }

    /// <summary>
    /// Category name
    /// </summary>
    public string? Category { get; init; }

    /// <summary>
    /// Completion criteria description
    /// </summary>
    public string? CompletionCriteria { get; init; }
}

