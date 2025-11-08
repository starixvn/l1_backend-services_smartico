namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a level in the player progression system.
/// Levels are ordered by required_points and define achievement milestones.
/// </summary>
public class Level
{
    /// <summary>
    /// Unique identifier for this level.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Level display name (user-facing, translated to user language).
    /// Examples: "Bronze", "Silver", "Gold", "Platinum"
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Level description explaining the achievement (translated to user language).
    /// </summary>
    public required string Description { get; init; }

    /// <summary>
    /// URL to the level badge/icon image.
    /// </summary>
    public required string Image { get; init; }

    /// <summary>
    /// Total points required to reach this level.
    /// Levels are ordered by this property (ascending).
    /// </summary>
    public required int RequiredPoints { get; init; }

    /// <summary>
    /// Number of points user must collect before this level becomes visible.
    /// Allows hiding high-level achievements until user is close to reaching them.
    /// </summary>
    public required int VisibilityPoints { get; init; }

    /// <summary>
    /// Counter of 1st metric used to reach the level (advanced leveling logic).
    /// Optional - only used when advanced leveling is enabled.
    /// See: https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users
    /// </summary>
    public int? RequiredLevelCounter1 { get; init; }

    /// <summary>
    /// Counter of 2nd metric used to reach the level (advanced leveling logic).
    /// Optional - only used when advanced leveling is enabled.
    /// See: https://help.smartico.ai/welcome/more/release-notes/september-2022#new-logic-for-leveling-users
    /// </summary>
    public int? RequiredLevelCounter2 { get; init; }

    /// <summary>
    /// Custom data as string or JSON string for building custom UI.
    /// Can be managed from Smartico BackOffice with custom fields.
    /// See: https://help.smartico.ai/welcome/products/general-concepts/custom-fields-attributes
    /// </summary>
    public string? CustomData { get; init; }
}
