namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents an individual task within a mission.
/// Domain entity representing TMissionOrBadgeTask from @smartico/public-api
/// </summary>
public class MissionTask
{
    /// <summary>
    /// Task identifier
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    /// Task description/name
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// Current progress value
    /// </summary>
    public required decimal CurrentValue { get; init; }

    /// <summary>
    /// Target value to complete the task
    /// </summary>
    public required decimal TargetValue { get; init; }

    /// <summary>
    /// Progress percentage (0-100)
    /// </summary>
    public required decimal Progress { get; init; }

    /// <summary>
    /// Is this task completed?
    /// </summary>
    public required bool IsCompleted { get; init; }

    /// <summary>
    /// Task order/index
    /// </summary>
    public int Order { get; init; }
}

