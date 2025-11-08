using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a mini game available to users.
/// Maps to TMiniGameTemplate from Smartico API.
/// </summary>
public class MiniGame
{
    /// <summary>
    /// Unique identifier for the mini game template.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Localized name of the mini game.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Localized description of the mini game.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// URL to the game's thumbnail image.
    /// </summary>
    public string? Thumbnail { get; init; }

    /// <summary>
    /// Type of game (Spin, GiftBox, Scratch, MatchX).
    /// </summary>
    public required GameType GameType { get; init; }

    /// <summary>
    /// Buy-in requirement type (Free, Points, Gems, Diamonds, Spin).
    /// </summary>
    public required BuyInType BuyInType { get; init; }

    /// <summary>
    /// Cost in points to play (if BuyInType is Points).
    /// </summary>
    public decimal? BuyInCostPoints { get; init; }

    /// <summary>
    /// Cost in gems to play (if BuyInType is Gems).
    /// </summary>
    public decimal? BuyInCostGems { get; init; }

    /// <summary>
    /// Cost in diamonds to play (if BuyInType is Diamonds).
    /// </summary>
    public decimal? BuyInCostDiamonds { get; init; }

    /// <summary>
    /// Current number of spin attempts available to user.
    /// Null if unlimited or not applicable.
    /// </summary>
    public int? SpinCount { get; set; }

    /// <summary>
    /// Unix timestamp (milliseconds) when next play is available.
    /// Null if no cooldown active.
    /// </summary>
    public long? NextAvailableSpinTs { get; set; }

    /// <summary>
    /// Current jackpot amount (if game has jackpot).
    /// </summary>
    public decimal? JackpotCurrent { get; set; }

    /// <summary>
    /// Amount added to jackpot on each play attempt.
    /// </summary>
    public decimal? JackpotAddOnAttempt { get; init; }

    /// <summary>
    /// Maximum number of attempts allowed per period.
    /// Null if unlimited.
    /// </summary>
    public int? MaxNumberOfAttempts { get; init; }

    /// <summary>
    /// Period duration in milliseconds for attempt limits.
    /// </summary>
    public long? MaxSpinsPeriodMs { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when game becomes available.
    /// Null if always available.
    /// </summary>
    public long? ActiveFromDate { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when game becomes unavailable.
    /// Null if no expiration.
    /// </summary>
    public long? ActiveTillDate { get; init; }

    /// <summary>
    /// List of prizes available in this mini game.
    /// </summary>
    public required List<MiniGamePrize> Prizes { get; init; }

    /// <summary>
    /// Checks if the game is currently within its active time window.
    /// </summary>
    public bool IsActive()
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        if (ActiveFromDate.HasValue && now < ActiveFromDate.Value)
            return false;

        if (ActiveTillDate.HasValue && now > ActiveTillDate.Value)
            return false;

        return true;
    }

    /// <summary>
    /// Checks if the user is on cooldown and cannot play yet.
    /// </summary>
    public bool IsOnCooldown()
    {
        if (!NextAvailableSpinTs.HasValue)
            return false;

        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        return now < NextAvailableSpinTs.Value;
    }

    /// <summary>
    /// Checks if the user has remaining attempts.
    /// </summary>
    public bool HasAttemptsRemaining()
    {
        if (!SpinCount.HasValue)
            return true; // Unlimited

        return SpinCount.Value > 0;
    }
}
