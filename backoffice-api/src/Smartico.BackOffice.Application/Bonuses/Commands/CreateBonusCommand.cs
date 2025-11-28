using System.Text.Json.Serialization;
using Smartico.BackOffice.Application.Bonuses.DTOs;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Bonuses.Commands;

/// <summary>
/// Command for creating a new bonus.
/// </summary>
public class CreateBonusCommand
{
    /// <summary>
    /// Gets or sets the bonus name.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional bonus description.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the bonus type.
    /// </summary>
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusType Type { get; set; }

    /// <summary>
    /// Gets or sets the activation type.
    /// </summary>
    [JsonPropertyName("activationType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusActivationType ActivationType { get; set; } = BonusActivationType.Automatic;

    /// <summary>
    /// Gets or sets the gift code for manual activation.
    /// </summary>
    [JsonPropertyName("giftCode")]
    public string? GiftCode { get; set; }

    /// <summary>
    /// Gets or sets the free spins configuration.
    /// </summary>
    [JsonPropertyName("freeSpins")]
    public FreeSpinsConfigDto? FreeSpins { get; set; }

    /// <summary>
    /// Gets or sets the cash configuration.
    /// </summary>
    [JsonPropertyName("cash")]
    public CashConfigDto? Cash { get; set; }

    /// <summary>
    /// Gets or sets the points configuration.
    /// </summary>
    [JsonPropertyName("points")]
    public PointsConfigDto? Points { get; set; }

    /// <summary>
    /// Gets or sets the start date.
    /// </summary>
    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date.
    /// </summary>
    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Gets or sets the calculation rule for dynamic bonus amounts.
    /// </summary>
    [JsonPropertyName("calculationRule")]
    public BonusCalculationRuleDto? CalculationRule { get; set; }

    /// <summary>
    /// Gets or sets the per-bonus limits.
    /// </summary>
    [JsonPropertyName("limits")]
    public BonusLimitsDto? Limits { get; set; }
}
