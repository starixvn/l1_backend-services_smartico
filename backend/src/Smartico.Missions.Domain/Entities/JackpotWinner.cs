namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a jackpot winner record when a pot explodes.
/// Multiple winners per pot are supported with positional ranking.
/// </summary>
public record JackpotWinner
{
    /// <summary>
    /// Pot instance ID that was drawn.
    /// </summary>
    public required int JpPotId { get; init; }

    /// <summary>
    /// Flag indicating if the current logged-in user is this winner.
    /// True only for querying user; False for all others.
    /// </summary>
    public required bool IsMe { get; init; }

    /// <summary>
    /// Username of winner.
    /// Masked format (e.g., "J***n") for others; full name if IsMe=true.
    /// </summary>
    public required string PublicUsername { get; init; }

    /// <summary>
    /// Avatar identifier for winner's profile picture.
    /// </summary>
    public required string AvatarId { get; init; }

    /// <summary>
    /// Prize amount in jackpot's base currency.
    /// </summary>
    public required decimal WinningAmountJpCurrency { get; init; }

    /// <summary>
    /// Prize amount in user's wallet currency (pre-calculated).
    /// </summary>
    public required decimal WinningAmountWalletCurrency { get; init; }

    /// <summary>
    /// Rank position (1=first, 2=second, 3=third, etc.).
    /// </summary>
    public required int WinningPosition { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when winner was drawn.
    /// </summary>
    public required long WinDateTs { get; init; }

    /// <summary>
    /// Name of the jackpot that was won.
    /// Denormalized for convenience in winner lists.
    /// </summary>
    public required string JackpotName { get; init; }
}
