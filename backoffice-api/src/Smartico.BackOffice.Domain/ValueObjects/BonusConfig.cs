using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Configuration for deposit match bonuses.
/// </summary>
public record DepositMatchConfig
{
    /// <summary>
    /// Match percentage (e.g., 100 for 100% match).
    /// </summary>
    [BsonElement("matchPercentage")]
    public decimal MatchPercentage { get; init; }

    /// <summary>
    /// Maximum bonus amount from the match.
    /// </summary>
    [BsonElement("maxMatchAmount")]
    public decimal MaxMatchAmount { get; init; }
}

/// <summary>
/// Configuration for free spins bonuses.
/// </summary>
public record FreeSpinsConfig
{
    /// <summary>
    /// Number of free spins awarded.
    /// </summary>
    [BsonElement("numberOfSpins")]
    public int NumberOfSpins { get; init; }

    /// <summary>
    /// Value per spin in player's currency.
    /// </summary>
    [BsonElement("spinValue")]
    public decimal SpinValue { get; init; }

    /// <summary>
    /// Game ID where free spins can be used.
    /// </summary>
    [BsonElement("gameId")]
    public string? GameId { get; init; }

    /// <summary>
    /// Game name for display purposes.
    /// </summary>
    [BsonElement("gameName")]
    public string? GameName { get; init; }
}

/// <summary>
/// Configuration for cash bonuses.
/// </summary>
public record CashConfig
{
    /// <summary>
    /// Cash amount awarded.
    /// </summary>
    [BsonElement("amount")]
    public decimal Amount { get; init; }
}

/// <summary>
/// Configuration for points bonuses.
/// </summary>
public record PointsConfig
{
    /// <summary>
    /// Number of points awarded.
    /// </summary>
    [BsonElement("amount")]
    public int Amount { get; init; }
}

/// <summary>
/// Configuration for cashback bonuses.
/// </summary>
public record CashbackConfig
{
    /// <summary>
    /// Cashback percentage (e.g., 10 for 10% cashback).
    /// </summary>
    [BsonElement("cashbackPercentage")]
    public decimal CashbackPercentage { get; init; }

    /// <summary>
    /// Maximum cashback amount.
    /// </summary>
    [BsonElement("maxCashbackAmount")]
    public decimal MaxCashbackAmount { get; init; }

    /// <summary>
    /// Period for calculating losses (Daily, Weekly, Monthly).
    /// </summary>
    [BsonElement("calculationPeriod")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public CashbackPeriod CalculationPeriod { get; init; }
}

/// <summary>
/// Period for cashback calculation.
/// </summary>
public enum CashbackPeriod
{
    /// <summary>
    /// Daily cashback calculation.
    /// </summary>
    Daily,

    /// <summary>
    /// Weekly cashback calculation.
    /// </summary>
    Weekly,

    /// <summary>
    /// Monthly cashback calculation.
    /// </summary>
    Monthly
}

/// <summary>
/// Configuration for referral bonuses.
/// </summary>
public record ReferralConfig
{
    /// <summary>
    /// Bonus amount for the referrer.
    /// </summary>
    [BsonElement("referrerBonus")]
    public decimal ReferrerBonus { get; init; }

    /// <summary>
    /// Bonus amount for the referred player.
    /// </summary>
    [BsonElement("referredBonus")]
    public decimal ReferredBonus { get; init; }

    /// <summary>
    /// Minimum deposit required from referred player to qualify.
    /// </summary>
    [BsonElement("minReferredDeposit")]
    public decimal MinReferredDeposit { get; init; }
}

/// <summary>
/// Wagering requirements for bonus withdrawal.
/// </summary>
public record WageringRequirement
{
    /// <summary>
    /// Wagering multiplier (e.g., 30 for 30x wagering).
    /// </summary>
    [BsonElement("multiplier")]
    public decimal Multiplier { get; init; } = 30;

    /// <summary>
    /// What the wagering applies to (BonusOnly or DepositPlusBonus).
    /// </summary>
    [BsonElement("appliesTo")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public WageringAppliesTo AppliesTo { get; init; } = WageringAppliesTo.BonusOnly;

    /// <summary>
    /// Maximum bet allowed while wagering is active.
    /// </summary>
    [BsonElement("maxBetWhileWagering")]
    public decimal? MaxBetWhileWagering { get; init; }
}

/// <summary>
/// What the wagering requirement applies to.
/// </summary>
public enum WageringAppliesTo
{
    /// <summary>
    /// Wagering applies to bonus amount only.
    /// </summary>
    BonusOnly,

    /// <summary>
    /// Wagering applies to deposit + bonus amount.
    /// </summary>
    DepositPlusBonus
}

/// <summary>
/// Game contribution percentage for wagering requirements.
/// </summary>
public record GameContribution
{
    /// <summary>
    /// Game type or category (e.g., Slots, TableGames, LiveCasino).
    /// </summary>
    [BsonElement("gameType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public GameType GameType { get; init; }

    /// <summary>
    /// Contribution percentage (0-100).
    /// </summary>
    [BsonElement("contributionPercentage")]
    public decimal ContributionPercentage { get; init; }
}

/// <summary>
/// Types of games for contribution rules.
/// </summary>
public enum GameType
{
    /// <summary>
    /// Slot games.
    /// </summary>
    Slots,

    /// <summary>
    /// Table games (blackjack, roulette, etc.).
    /// </summary>
    TableGames,

    /// <summary>
    /// Live casino games.
    /// </summary>
    LiveCasino,

    /// <summary>
    /// Video poker games.
    /// </summary>
    VideoPoker,

    /// <summary>
    /// Other game types.
    /// </summary>
    Other
}

/// <summary>
/// Expiration settings for bonuses.
/// </summary>
public record BonusExpiration
{
    /// <summary>
    /// Type of expiration (TimeBased or WageringBased).
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public ExpirationType Type { get; init; } = ExpirationType.TimeBased;

    /// <summary>
    /// Number of days until expiration (for TimeBased).
    /// </summary>
    [BsonElement("daysToExpire")]
    public int DaysToExpire { get; init; } = 7;
}

/// <summary>
/// Type of bonus expiration.
/// </summary>
public enum ExpirationType
{
    /// <summary>
    /// Bonus expires after a set number of days.
    /// </summary>
    TimeBased,

    /// <summary>
    /// Bonus expires when wagering is completed.
    /// </summary>
    WageringBased
}

/// <summary>
/// Calculation rules for bonus amounts.
/// Defines whether the bonus is a fixed value or dynamically calculated based on player activity.
/// </summary>
public record BonusCalculationRule
{
    /// <summary>
    /// Type of calculation (Fixed or Dynamic).
    /// </summary>
    [BsonElement("calculationType")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public BonusCalculationType CalculationType { get; init; } = BonusCalculationType.Fixed;

    /// <summary>
    /// What player activity the dynamic calculation is based on.
    /// Only used when CalculationType is Dynamic.
    /// </summary>
    [BsonElement("basedOn")]
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public BonusCalculationBasedOn? BasedOn { get; init; }

    /// <summary>
    /// Formula for dynamic calculation (e.g., "0.01 * {totalBets}").
    /// Supports placeholders: {totalBets}, {totalWins}, {totalLosses}, {totalDeposits}, {totalWithdrawals}.
    /// </summary>
    [BsonElement("formula")]
    public string? Formula { get; init; }

    /// <summary>
    /// Fixed amount for the bonus (used when CalculationType is Fixed).
    /// </summary>
    [BsonElement("fixedAmount")]
    public decimal? FixedAmount { get; init; }

    /// <summary>
    /// Minimum amount floor for dynamic calculations.
    /// </summary>
    [BsonElement("minAmount")]
    public decimal? MinAmount { get; init; }

    /// <summary>
    /// Maximum amount cap for dynamic calculations.
    /// </summary>
    [BsonElement("maxAmount")]
    public decimal? MaxAmount { get; init; }

    /// <summary>
    /// Tiered calculation configuration for dynamic bonuses.
    /// </summary>
    [BsonElement("tieredCalculation")]
    public TieredCalculation? TieredCalculation { get; init; }
}

/// <summary>
/// Tiered calculation configuration for dynamic bonus amounts.
/// </summary>
public record TieredCalculation
{
    /// <summary>
    /// What the tier calculation is based on (e.g., deposit_amount, total_bets).
    /// </summary>
    [BsonElement("basedOn")]
    public string BasedOn { get; init; } = "deposit_amount";

    /// <summary>
    /// List of tiers defining bonus percentages based on value ranges.
    /// </summary>
    [BsonElement("tiers")]
    public List<BonusTier> Tiers { get; init; } = new();

    /// <summary>
    /// Default value if no tier matches.
    /// </summary>
    [BsonElement("defaultValue")]
    public decimal DefaultValue { get; init; }
}

/// <summary>
/// A single tier in a tiered bonus calculation.
/// </summary>
public record BonusTier
{
    /// <summary>
    /// Unique identifier for the tier.
    /// </summary>
    [BsonElement("id")]
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Minimum value for this tier to apply.
    /// </summary>
    [BsonElement("minValue")]
    public decimal MinValue { get; init; }

    /// <summary>
    /// Bonus percentage for this tier.
    /// </summary>
    [BsonElement("percentage")]
    public decimal Percentage { get; init; }

    /// <summary>
    /// Optional maximum bonus amount for this tier.
    /// </summary>
    [BsonElement("maxBonus")]
    public decimal? MaxBonus { get; init; }
}

/// <summary>
/// Type of bonus calculation.
/// </summary>
public enum BonusCalculationType
{
    /// <summary>
    /// Bonus is a fixed amount defined in the template.
    /// </summary>
    Fixed,

    /// <summary>
    /// Bonus amount is calculated dynamically based on player activity.
    /// </summary>
    Dynamic
}

/// <summary>
/// What player activity the bonus calculation is based on.
/// </summary>
public enum BonusCalculationBasedOn
{
    /// <summary>
    /// Calculate based on total bets placed.
    /// </summary>
    Bets,

    /// <summary>
    /// Calculate based on total wins.
    /// </summary>
    Wins,

    /// <summary>
    /// Calculate based on total losses.
    /// </summary>
    Losses,

    /// <summary>
    /// Calculate based on total deposits.
    /// </summary>
    Deposits,

    /// <summary>
    /// Calculate based on total withdrawals.
    /// </summary>
    Withdrawals
}

/// <summary>
/// Per-bonus limits for controlling distribution.
/// </summary>
public record BonusLimits
{
    /// <summary>
    /// Maximum total claims across all players (inventory).
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxTotalClaims")]
    public int? MaxTotalClaims { get; init; }

    /// <summary>
    /// Maximum claims per player (lifetime).
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxClaimsPerPlayer")]
    public int? MaxClaimsPerPlayer { get; init; }

    /// <summary>
    /// Maximum claims per player per day.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxClaimsPerPlayerPerDay")]
    public int? MaxClaimsPerPlayerPerDay { get; init; }

    /// <summary>
    /// Maximum claims per player per week.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxClaimsPerPlayerPerWeek")]
    public int? MaxClaimsPerPlayerPerWeek { get; init; }

    /// <summary>
    /// Maximum claims per player per month.
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxClaimsPerPlayerPerMonth")]
    public int? MaxClaimsPerPlayerPerMonth { get; init; }

    /// <summary>
    /// Maximum total value that can be issued (budget cap).
    /// Null means unlimited.
    /// </summary>
    [BsonElement("maxTotalValue")]
    public decimal? MaxTotalValue { get; init; }
}
