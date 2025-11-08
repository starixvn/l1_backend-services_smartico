namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents the result of a bonus claim operation
/// </summary>
public class ClaimBonusResult
{
    /// <summary>
    /// Whether the claim was successful
    /// </summary>
    public required bool Success { get; init; }

    /// <summary>
    /// Error code if claim failed (null if successful)
    /// </summary>
    public string? ErrorCode { get; init; }

    /// <summary>
    /// Human-readable error message if claim failed
    /// </summary>
    public string? ErrorMessage { get; init; }

    /// <summary>
    /// ID of the bonus that was claimed
    /// </summary>
    public required string BonusId { get; init; }

    /// <summary>
    /// Factory method for successful claim
    /// </summary>
    public static ClaimBonusResult CreateSuccess(string bonusId) => new()
    {
        Success = true,
        BonusId = bonusId
    };

    /// <summary>
    /// Factory method for failed claim
    /// </summary>
    public static ClaimBonusResult CreateFailure(string bonusId, string errorCode, string errorMessage) => new()
    {
        Success = false,
        BonusId = bonusId,
        ErrorCode = errorCode,
        ErrorMessage = errorMessage
    };
}
