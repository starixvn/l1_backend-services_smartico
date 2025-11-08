namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a user's participation in a specific tournament.
/// </summary>
public class TournamentParticipant
{
    /// <summary>
    /// Public username displayed on leaderboard.
    /// </summary>
    public required string PublicUsername { get; init; }

    /// <summary>
    /// Avatar image URL.
    /// </summary>
    public string? AvatarUrl { get; init; }

    /// <summary>
    /// Current position in tournament leaderboard (1-indexed).
    /// </summary>
    public int Position { get; init; }

    /// <summary>
    /// Current score in tournament.
    /// </summary>
    public int Score { get; init; }

    /// <summary>
    /// External user identifier for integration with external systems.
    /// </summary>
    public string? ExternalUserId { get; init; }

    /// <summary>
    /// CRM brand identifier for multi-brand systems.
    /// </summary>
    public string? CrmBrandId { get; init; }

    /// <summary>
    /// Internal user identifier.
    /// </summary>
    public string? UserId { get; init; }
}
