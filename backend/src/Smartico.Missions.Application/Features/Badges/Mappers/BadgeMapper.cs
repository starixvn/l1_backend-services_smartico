using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using BackOfficeBadge = Smartico.BackOffice.Domain.Entities.Badge;
using BackOfficeBadgeRarity = Smartico.BackOffice.Domain.Entities.BadgeRarity;

namespace Smartico.Missions.Application.Features.Badges.Mappers;

/// <summary>
/// Maps BackOffice Badge entities to API DTO responses.
/// Converts MongoDB entities to player-facing badge details.
/// </summary>
public static class BadgeMapper
{
    /// <summary>
    /// Converts a BackOffice Badge entity to a Badge DTO.
    /// </summary>
    /// <param name="badge">The badge entity from MongoDB.</param>
    /// <param name="progress">Player's progress percentage (0-100).</param>
    /// <param name="status">Player's badge status.</param>
    /// <param name="isEarned">Whether the player has earned this badge.</param>
    /// <param name="earnedAt">When the badge was earned (if applicable).</param>
    /// <returns>The mapped Badge DTO.</returns>
    public static Badge ToDto(
        BackOfficeBadge badge,
        decimal progress = 0,
        AchievementStatus status = AchievementStatus.Available,
        bool isEarned = false,
        DateTime? earnedAt = null)
    {
        return new Badge
        {
            Id = badge.Id.GetHashCode(), // Use hash as int ID for compatibility
            Name = badge.Name,
            Description = badge.Description ?? string.Empty,
            ImageUrl = badge.IconUrl ?? $"https://images.example.com/badges/{badge.Id}.png",
            Type = AchievementType.Badge,
            Status = status,
            Progress = progress,
            IsEarned = isEarned,
            EarnedAt = earnedAt,
            Category = MapRarityToCategory(badge.Rarity),
            CompletionCriteria = badge.UnlockCriteria?.Description ?? GetDefaultCriteria(badge)
        };
    }

    /// <summary>
    /// Maps BadgeRarity enum to a category string for display.
    /// </summary>
    /// <param name="rarity">The badge rarity.</param>
    /// <returns>Category string for display.</returns>
    public static string MapRarityToCategory(BackOfficeBadgeRarity rarity)
    {
        return rarity switch
        {
            BackOfficeBadgeRarity.Common => "Common",
            BackOfficeBadgeRarity.Rare => "Rare",
            BackOfficeBadgeRarity.Epic => "Epic",
            BackOfficeBadgeRarity.Legendary => "Legendary",
            _ => "Common"
        };
    }

    /// <summary>
    /// Gets a default completion criteria string based on badge properties.
    /// </summary>
    private static string GetDefaultCriteria(BackOfficeBadge badge)
    {
        var criteria = badge.UnlockCriteria;
        if (criteria == null)
        {
            return "Complete the required actions to unlock this badge.";
        }

        // Build criteria description from unlock criteria ThresholdValue
        if (criteria.ThresholdValue > 0)
        {
            return $"Reach {criteria.ThresholdValue:N0} to unlock this badge.";
        }

        return "Complete the required actions to unlock this badge.";
    }
}
