using System.Text.Json.Serialization;

namespace Smartico.Missions.Application.Features.Velocity.DTOs;

/// <summary>
/// Tier rarity classification for visual styling.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<TierRarity>))]
public enum TierRarity
{
    [JsonStringEnumMemberName("common")]
    Common,
    [JsonStringEnumMemberName("rare")]
    Rare,
    [JsonStringEnumMemberName("epic")]
    Epic,
    [JsonStringEnumMemberName("legendary")]
    Legendary
}

/// <summary>
/// Feature type unlocked at a specific tier.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<TierFeatureType>))]
public enum TierFeatureType
{
    [JsonStringEnumMemberName("jackpot")]
    Jackpot,
    [JsonStringEnumMemberName("tournament")]
    Tournament,
    [JsonStringEnumMemberName("multiplier")]
    Multiplier,
    [JsonStringEnumMemberName("mission")]
    Mission
}

/// <summary>
/// XP activity type.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<XpActivityType>))]
public enum XpActivityType
{
    [JsonStringEnumMemberName("slot_play")]
    SlotPlay,
    [JsonStringEnumMemberName("table_play")]
    TablePlay,
    [JsonStringEnumMemberName("mission_complete")]
    MissionComplete,
    [JsonStringEnumMemberName("bonus")]
    Bonus,
    [JsonStringEnumMemberName("promotion")]
    Promotion
}

/// <summary>
/// Mission reward type.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<MissionRewardType>))]
public enum MissionRewardType
{
    [JsonStringEnumMemberName("free_spins")]
    FreeSpins,
    [JsonStringEnumMemberName("cash")]
    Cash,
    [JsonStringEnumMemberName("xp_boost")]
    XpBoost,
    [JsonStringEnumMemberName("badge")]
    Badge
}

/// <summary>
/// XP earned by source category.
/// </summary>
public record XpBreakdownDto(
    int Slots,
    int TableGames,
    int Missions,
    int Other
);

/// <summary>
/// Feature unlocked at a specific velocity tier.
/// </summary>
public record TierFeatureDto(
    TierFeatureType Type,
    string Name,
    string Description,
    double? Value = null
);

/// <summary>
/// Velocity tier configuration.
/// </summary>
public record VelocityTierDto(
    int TierNumber,
    string Name,
    int XpRequired,
    string Benefit,
    TierRarity Rarity,
    string IconUrl,
    string ThemeColor,
    int DailyMissionCount,
    List<string> UnlockedMissions,
    List<TierFeatureDto> UnlockedFeatures
);

/// <summary>
/// Player's velocity progress data.
/// </summary>
public record PlayerVelocityProgressDto(
    string UserId,
    int CurrentTier,
    string CurrentTierName,
    int TotalXp,
    int CurrentTierXpThreshold,
    int? NextTierXpThreshold,
    int? XpToNextTier,
    double ProgressPercentage,
    bool IsMaxTier,
    DateTime TierAchievedAt,
    XpBreakdownDto XpBreakdown
);

/// <summary>
/// Mission reward structure.
/// </summary>
public record MissionRewardDto(
    MissionRewardType Type,
    double Value,
    string Description
);

/// <summary>
/// Tier-gated mission data.
/// </summary>
public record TierMissionDto(
    string Id,
    string Name,
    string Description,
    int RequiredTier,
    bool IsAvailable,
    bool IsCompleted,
    int XpReward,
    List<MissionRewardDto> Rewards
);

/// <summary>
/// Reference to game or mission that generated XP.
/// </summary>
public record ActivityReferenceDto(
    string Type,
    string Id,
    string Name
);

/// <summary>
/// XP activity event.
/// </summary>
public record XpActivityDto(
    string Id,
    XpActivityType Type,
    string Description,
    int XpEarned,
    DateTime Timestamp,
    ActivityReferenceDto? Reference = null
);

/// <summary>
/// Level-up event for celebration.
/// </summary>
public record LevelUpEventDto(
    string Id,
    int PreviousTier,
    string PreviousTierName,
    int NewTier,
    string NewTierName,
    DateTime AchievedAt,
    List<TierFeatureDto> NewBenefits,
    List<string> NewMissions,
    bool Acknowledged
);
