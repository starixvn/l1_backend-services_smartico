using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a reward awarded based on tournament placement.
/// </summary>
public class TournamentPrize
{
    /// <summary>
    /// Unique prize identifier within the tournament.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Prize display name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Prize description explaining what the winner receives.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Prize image URL.
    /// </summary>
    public string? ImageUrl { get; init; }

    /// <summary>
    /// Starting position in prize range (inclusive). Example: 1 for "1st place".
    /// </summary>
    public required int PlaceFrom { get; init; }

    /// <summary>
    /// Ending position in prize range (inclusive). Example: 3 for "1st-3rd place".
    /// </summary>
    public required int PlaceTo { get; init; }

    /// <summary>
    /// Type of prize determining how it's awarded.
    /// </summary>
    public required TournamentPrizeType PrizeType { get; init; }

    /// <summary>
    /// Point value for points-based prizes (null for other prize types).
    /// </summary>
    public int? PointValue { get; init; }

    /// <summary>
    /// Formatted display text for the prize range (e.g., "1st place", "2nd-5th").
    /// </summary>
    public string PlaceRangeDisplay => PlaceFrom == PlaceTo
        ? $"{PlaceFrom}{GetOrdinalSuffix(PlaceFrom)} place"
        : $"{PlaceFrom}{GetOrdinalSuffix(PlaceFrom)}-{PlaceTo}{GetOrdinalSuffix(PlaceTo)} place";

    private static string GetOrdinalSuffix(int number)
    {
        if (number <= 0) return string.Empty;

        return (number % 100) switch
        {
            11 or 12 or 13 => "th",
            _ => (number % 10) switch
            {
                1 => "st",
                2 => "nd",
                3 => "rd",
                _ => "th"
            }
        };
    }
}
