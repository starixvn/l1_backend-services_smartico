using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.LevelSystems.DTOs;

/// <summary>
/// Data transfer object for level system information.
/// </summary>
public class LevelSystemDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public LevelSystemStatus Status { get; set; }

    [JsonPropertyName("maxLevel")]
    public int MaxLevel { get; set; }

    [JsonPropertyName("progressionCurve")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProgressionCurveType ProgressionCurve { get; set; }

    [JsonPropertyName("baseXpRequired")]
    public int BaseXpRequired { get; set; }

    [JsonPropertyName("xpMultiplier")]
    public decimal XpMultiplier { get; set; }

    [JsonPropertyName("tiers")]
    public List<LevelTierDto> Tiers { get; set; } = new();

    [JsonPropertyName("xpRules")]
    public List<XpRuleDto> XpRules { get; set; } = new();

    [JsonPropertyName("levelRewards")]
    public List<LevelRewardDto> LevelRewards { get; set; } = new();

    [JsonPropertyName("demotionEnabled")]
    public bool DemotionEnabled { get; set; }

    [JsonPropertyName("demotionRules")]
    public DemotionRulesDto? DemotionRules { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for level tier configuration.
/// </summary>
public class LevelTierDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("fromLevel")]
    public int FromLevel { get; set; }

    [JsonPropertyName("toLevel")]
    public int ToLevel { get; set; }

    [JsonPropertyName("color")]
    public string? Color { get; set; }

    [JsonPropertyName("icon")]
    public string? Icon { get; set; }

    [JsonPropertyName("order")]
    public int Order { get; set; }

    [JsonPropertyName("benefits")]
    public List<TierBenefitDto> Benefits { get; set; } = new();
}

/// <summary>
/// DTO for tier benefit.
/// </summary>
public class TierBenefitDto
{
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TierBenefitType Type { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("value")]
    public decimal? Value { get; set; }
}

/// <summary>
/// DTO for XP earning rule.
/// </summary>
public class XpRuleDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("actionType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public XpActionType ActionType { get; set; }

    [JsonPropertyName("xpAmount")]
    public int XpAmount { get; set; }

    [JsonPropertyName("perUnitAmount")]
    public decimal? PerUnitAmount { get; set; }

    [JsonPropertyName("dailyCap")]
    public int? DailyCap { get; set; }

    [JsonPropertyName("eligibleGames")]
    public List<string>? EligibleGames { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>
/// DTO for level reward.
/// </summary>
public class LevelRewardDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("level")]
    public int Level { get; set; }

    [JsonPropertyName("rewardType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public LevelRewardType RewardType { get; set; }

    [JsonPropertyName("value")]
    public decimal? Value { get; set; }

    [JsonPropertyName("bonusTemplateId")]
    public string? BonusTemplateId { get; set; }

    [JsonPropertyName("bonusTemplateName")]
    public string? BonusTemplateName { get; set; }

    [JsonPropertyName("badgeId")]
    public string? BadgeId { get; set; }

    [JsonPropertyName("badgeName")]
    public string? BadgeName { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>
/// DTO for demotion rules.
/// </summary>
public class DemotionRulesDto
{
    [JsonPropertyName("inactiveDays")]
    public int InactiveDays { get; set; }

    [JsonPropertyName("demotionType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public DemotionType DemotionType { get; set; }

    [JsonPropertyName("warningDays")]
    public int WarningDays { get; set; }

    [JsonPropertyName("preserveXp")]
    public bool PreserveXp { get; set; }
}

/// <summary>
/// DTO for level preview (shows XP thresholds for each level).
/// </summary>
public class LevelPreviewDto
{
    [JsonPropertyName("level")]
    public int Level { get; set; }

    [JsonPropertyName("xpRequired")]
    public long XpRequired { get; set; }

    [JsonPropertyName("totalXpRequired")]
    public long TotalXpRequired { get; set; }

    [JsonPropertyName("tierName")]
    public string? TierName { get; set; }

    [JsonPropertyName("tierColor")]
    public string? TierColor { get; set; }

    [JsonPropertyName("rewards")]
    public List<LevelRewardDto> Rewards { get; set; } = new();
}
