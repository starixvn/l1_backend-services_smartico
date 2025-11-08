using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents the result of playing a mini game.
/// Returned by ISmarticoMiniGameApiClient.PlayMiniGameAsync().
/// </summary>
/// <param name="Success">Whether the play was successful.</param>
/// <param name="PrizeId">ID of the prize won (null if no prize or error).</param>
/// <param name="PrizeName">Name of the prize won (for UI display).</param>
/// <param name="PrizeType">Type of prize won.</param>
/// <param name="PrizeValue">Numeric value of the prize (if applicable).</param>
/// <param name="ErrorCode">Error code if play failed (e.g., "INSUFFICIENT_BALANCE").</param>
/// <param name="ErrorMessage">User-friendly error message if play failed.</param>
/// <param name="UpdatedGame">Updated game state after play (with new cooldown, attempts, jackpot).</param>
public record PlayMiniGameResult(
    bool Success,
    int? PrizeId = null,
    string? PrizeName = null,
    MiniGamePrizeType? PrizeType = null,
    decimal? PrizeValue = null,
    string? ErrorCode = null,
    string? ErrorMessage = null,
    MiniGame? UpdatedGame = null
);
