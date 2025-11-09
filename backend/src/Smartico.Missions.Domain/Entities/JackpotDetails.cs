using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a jackpot template with all configuration and current pot state.
/// This is the primary entity users interact with when browsing jackpots.
/// </summary>
public record JackpotDetails
{
    /// <summary>
    /// Unique identifier for the jackpot template.
    /// </summary>
    public required int JpTemplateId { get; init; }

    /// <summary>
    /// Type of jackpot (MultiUser=1, Personal=2).
    /// Determines pool sharing model and winner selection.
    /// </summary>
    public required JackpotType JpTypeId { get; init; }

    /// <summary>
    /// Base currency of the jackpot pool (e.g., "Points", "Gems", "USD").
    /// </summary>
    public required string JpCurrency { get; init; }

    /// <summary>
    /// User's wallet currency for conversion display (e.g., "USD", "EUR").
    /// </summary>
    public required string UserCurrency { get; init; }

    /// <summary>
    /// How users contribute to the pool (Fixed=1, Percentage=2).
    /// </summary>
    public required JackpotContributionType ContributionType { get; init; }

    /// <summary>
    /// Contribution amount or percentage.
    /// If Fixed: exact amount per bet (e.g., 10 points).
    /// If Percentage: decimal percentage (e.g., 5.0 = 5%).
    /// </summary>
    public required decimal ContributionValue { get; init; }

    /// <summary>
    /// Current pot instance with pool amount and temperature.
    /// </summary>
    public required JackpotPot Pot { get; init; }

    /// <summary>
    /// Number of users opted in to this jackpot.
    /// For Personal jackpots, always 1 (self).
    /// </summary>
    public required int RegistrationCount { get; init; }

    /// <summary>
    /// Whether the current user is opted in to this jackpot.
    /// </summary>
    public required bool IsOptedIn { get; init; }

    /// <summary>
    /// Whether this jackpot applies to all games.
    /// MVP: Always true (future: game-specific jackpots).
    /// </summary>
    public required bool AchRelatedGameAllowAll { get; init; }

    /// <summary>
    /// Whether winners are publicly visible via API.
    /// Controls winner list display in UI.
    /// </summary>
    public required bool ExposeWinnersOverApi { get; init; }

    /// <summary>
    /// Public metadata for UI display (name, description, image).
    /// </summary>
    public required JackpotPublicMeta JpPublicMeta { get; init; }

    /// <summary>
    /// Minimum pool amount before explosion can occur.
    /// </summary>
    public required decimal MinAmount { get; init; }

    /// <summary>
    /// Maximum pool amount (guaranteed explosion threshold).
    /// </summary>
    public required decimal MaxAmount { get; init; }

    /// <summary>
    /// Initial seed amount when pot is created.
    /// </summary>
    public required decimal SeedAmount { get; init; }
}
