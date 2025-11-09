namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Records when a user opts into a jackpot and tracks registration status.
/// Created on opt-in, updated (marked inactive) on opt-out.
/// </summary>
public record JackpotOptInRecord
{
    /// <summary>
    /// User identifier (composite key).
    /// </summary>
    public required string UserId { get; init; }

    /// <summary>
    /// Jackpot template ID (composite key).
    /// </summary>
    public required int JpTemplateId { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when user opted in.
    /// </summary>
    public required long OptedInTs { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when user opted out.
    /// Null if currently opted in.
    /// </summary>
    public long? OptOutTs { get; init; }
}
