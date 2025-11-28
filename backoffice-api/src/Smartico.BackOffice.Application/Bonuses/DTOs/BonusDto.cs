using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Bonuses.DTOs;

/// <summary>
/// Data transfer object for bonus information.
/// </summary>
public class BonusDto
{
    /// <summary>
    /// Gets or sets the bonus ID.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the operator ID.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

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
    /// Gets or sets the bonus status.
    /// </summary>
    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the activation type.
    /// </summary>
    [JsonPropertyName("activationType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusActivationType ActivationType { get; set; }

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

    /// <summary>
    /// Gets or sets the creation date.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the last update date.
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for free spins configuration.
/// </summary>
public class FreeSpinsConfigDto
{
    [JsonPropertyName("numberOfSpins")]
    public int NumberOfSpins { get; set; }

    [JsonPropertyName("spinValue")]
    public decimal SpinValue { get; set; }

    [JsonPropertyName("gameId")]
    public string? GameId { get; set; }

    [JsonPropertyName("gameName")]
    public string? GameName { get; set; }
}

/// <summary>
/// DTO for cash bonus configuration.
/// </summary>
public class CashConfigDto
{
    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }
}

/// <summary>
/// DTO for points bonus configuration.
/// </summary>
public class PointsConfigDto
{
    [JsonPropertyName("amount")]
    public int Amount { get; set; }
}

/// <summary>
/// DTO for bonus calculation rule (dynamic bonus amounts).
/// </summary>
public class BonusCalculationRuleDto
{
    /// <summary>
    /// Type of calculation (Fixed or Dynamic).
    /// </summary>
    [JsonPropertyName("calculationType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusCalculationType CalculationType { get; set; } = BonusCalculationType.Fixed;

    /// <summary>
    /// What the dynamic calculation is based on (for Dynamic type).
    /// </summary>
    [JsonPropertyName("basedOn")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public BonusCalculationBasedOn? BasedOn { get; set; }

    /// <summary>
    /// Formula for dynamic calculation (e.g., "bets * 0.01").
    /// </summary>
    [JsonPropertyName("formula")]
    public string? Formula { get; set; }

    /// <summary>
    /// Fixed amount (for Fixed type).
    /// </summary>
    [JsonPropertyName("fixedAmount")]
    public decimal? FixedAmount { get; set; }

    /// <summary>
    /// Minimum calculated amount (floor).
    /// </summary>
    [JsonPropertyName("minAmount")]
    public decimal? MinAmount { get; set; }

    /// <summary>
    /// Maximum calculated amount (cap).
    /// </summary>
    [JsonPropertyName("maxAmount")]
    public decimal? MaxAmount { get; set; }

    /// <summary>
    /// Tiered calculation configuration for dynamic bonuses.
    /// </summary>
    [JsonPropertyName("tieredCalculation")]
    public TieredCalculationDto? TieredCalculation { get; set; }
}

/// <summary>
/// DTO for tiered bonus calculation.
/// </summary>
public class TieredCalculationDto
{
    /// <summary>
    /// What the tier calculation is based on (e.g., deposit_amount, total_bets).
    /// </summary>
    [JsonPropertyName("basedOn")]
    public string BasedOn { get; set; } = "deposit_amount";

    /// <summary>
    /// List of tiers defining bonus percentages based on value ranges.
    /// </summary>
    [JsonPropertyName("tiers")]
    public List<BonusTierDto> Tiers { get; set; } = new();

    /// <summary>
    /// Default value if no tier matches.
    /// </summary>
    [JsonPropertyName("defaultValue")]
    public decimal DefaultValue { get; set; }
}

/// <summary>
/// DTO for a single bonus tier.
/// </summary>
public class BonusTierDto
{
    /// <summary>
    /// Unique identifier for the tier.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Minimum value for this tier to apply.
    /// </summary>
    [JsonPropertyName("minValue")]
    public decimal MinValue { get; set; }

    /// <summary>
    /// Bonus percentage for this tier.
    /// </summary>
    [JsonPropertyName("percentage")]
    public decimal Percentage { get; set; }

    /// <summary>
    /// Optional maximum bonus amount for this tier.
    /// </summary>
    [JsonPropertyName("maxBonus")]
    public decimal? MaxBonus { get; set; }
}

/// <summary>
/// DTO for per-bonus limits.
/// </summary>
public class BonusLimitsDto
{
    /// <summary>
    /// Maximum total claims across all players.
    /// </summary>
    [JsonPropertyName("maxTotalClaims")]
    public int? MaxTotalClaims { get; set; }

    /// <summary>
    /// Maximum claims per player (lifetime).
    /// </summary>
    [JsonPropertyName("maxClaimsPerPlayer")]
    public int? MaxClaimsPerPlayer { get; set; }

    /// <summary>
    /// Maximum claims per player per day.
    /// </summary>
    [JsonPropertyName("maxClaimsPerPlayerPerDay")]
    public int? MaxClaimsPerPlayerPerDay { get; set; }

    /// <summary>
    /// Maximum claims per player per week.
    /// </summary>
    [JsonPropertyName("maxClaimsPerPlayerPerWeek")]
    public int? MaxClaimsPerPlayerPerWeek { get; set; }

    /// <summary>
    /// Maximum claims per player per month.
    /// </summary>
    [JsonPropertyName("maxClaimsPerPlayerPerMonth")]
    public int? MaxClaimsPerPlayerPerMonth { get; set; }

    /// <summary>
    /// Maximum total value that can be distributed from this bonus.
    /// </summary>
    [JsonPropertyName("maxTotalValue")]
    public decimal? MaxTotalValue { get; set; }
}

/// <summary>
/// Type of bonus calculation.
/// </summary>
public enum BonusCalculationType
{
    /// <summary>
    /// Fixed bonus amount.
    /// </summary>
    Fixed,

    /// <summary>
    /// Dynamic calculation based on player activity.
    /// </summary>
    Dynamic
}

/// <summary>
/// What dynamic bonus calculation is based on.
/// </summary>
public enum BonusCalculationBasedOn
{
    /// <summary>
    /// Based on player bets.
    /// </summary>
    Bets,

    /// <summary>
    /// Based on player wins.
    /// </summary>
    Wins,

    /// <summary>
    /// Based on player losses.
    /// </summary>
    Losses,

    /// <summary>
    /// Based on player deposits.
    /// </summary>
    Deposits,

    /// <summary>
    /// Based on player withdrawals.
    /// </summary>
    Withdrawals
}
