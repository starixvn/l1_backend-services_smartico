namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Result of a mission opt-in operation.
/// Represents TMissionOptInResult from @smartico/public-api
/// </summary>
public class MissionOptInResult
{
    /// <summary>
    /// Was the opt-in successful?
    /// </summary>
    public required bool Success { get; init; }

    /// <summary>
    /// Result message
    /// </summary>
    public required string Message { get; init; }

    /// <summary>
    /// Updated mission data (if successful)
    /// </summary>
    public Mission? Mission { get; init; }

    /// <summary>
    /// Error code (if failed)
    /// </summary>
    public string? ErrorCode { get; init; }
}

