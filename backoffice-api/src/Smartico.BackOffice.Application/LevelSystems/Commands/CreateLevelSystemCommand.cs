using System.Text.Json.Serialization;
using Smartico.BackOffice.Application.LevelSystems.DTOs;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.BackOffice.Application.LevelSystems.Commands;

/// <summary>
/// Command for creating a new level system.
/// </summary>
public class CreateLevelSystemCommand
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("maxLevel")]
    public int MaxLevel { get; set; } = 100;

    [JsonPropertyName("progressionCurve")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProgressionCurveType ProgressionCurve { get; set; } = ProgressionCurveType.Linear;

    [JsonPropertyName("baseXpRequired")]
    public int BaseXpRequired { get; set; } = 100;

    [JsonPropertyName("xpMultiplier")]
    public decimal XpMultiplier { get; set; } = 1.5m;

    [JsonPropertyName("tiers")]
    public List<LevelTierDto> Tiers { get; set; } = new();

    [JsonPropertyName("xpRules")]
    public List<XpRuleDto> XpRules { get; set; } = new();

    [JsonPropertyName("levelRewards")]
    public List<LevelRewardDto> LevelRewards { get; set; } = new();

    [JsonPropertyName("demotionEnabled")]
    public bool DemotionEnabled { get; set; } = false;

    [JsonPropertyName("demotionRules")]
    public DemotionRulesDto? DemotionRules { get; set; }
}
