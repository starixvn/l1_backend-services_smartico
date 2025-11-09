namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Public metadata for jackpot display in UI.
/// Contains user-facing information like name, description, and images.
/// </summary>
public record JackpotPublicMeta
{
    /// <summary>
    /// Display name of the jackpot (e.g., "Mega Jackpot", "Community Pot").
    /// User-facing, should be translated to user's language.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// User-friendly description of jackpot rules and rewards.
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// URL to the jackpot thumbnail/card image.
    /// Used in jackpot list and detail views.
    /// </summary>
    public required string ImageUrl { get; init; }

    /// <summary>
    /// Custom field 1 (operator-defined).
    /// Can be used for additional metadata like "next_draw_date" or "sponsor".
    /// </summary>
    public string? Placeholder1 { get; init; }

    /// <summary>
    /// Custom field 2 (operator-defined).
    /// Can be used for additional metadata like "all_time_winners_count".
    /// </summary>
    public string? Placeholder2 { get; init; }

    /// <summary>
    /// Custom JSON data for specialized UI needs.
    /// Can store structured data for custom jackpot features.
    /// </summary>
    public string? CustomData { get; init; }
}
