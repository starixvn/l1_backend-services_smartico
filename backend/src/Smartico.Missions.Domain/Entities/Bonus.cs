using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a bonus issued to a user
/// </summary>
public class Bonus
{
    /// <summary>
    /// Unique identifier for the bonus
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    /// Display name of the bonus
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Detailed description of the bonus
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// URL to bonus image for display
    /// </summary>
    public string? ImageUrl { get; init; }

    /// <summary>
    /// Current status of the bonus
    /// </summary>
    public required BonusStatus Status { get; init; }

    /// <summary>
    /// Bonus amount value
    /// </summary>
    public required decimal Amount { get; init; }

    /// <summary>
    /// Currency code (e.g., USD, EUR)
    /// </summary>
    public required string Currency { get; init; }

    /// <summary>
    /// Expiration date/time (null if no expiration)
    /// </summary>
    public DateTime? ExpiresAt { get; init; }

    /// <summary>
    /// Whether the bonus can be claimed by user
    /// </summary>
    public required bool IsRedeemable { get; init; }

    /// <summary>
    /// Timestamp when bonus was created
    /// </summary>
    public required DateTime CreatedAt { get; init; }

    /// <summary>
    /// Timestamp when bonus was claimed (null if not claimed)
    /// </summary>
    public DateTime? RedeemedAt { get; init; }

    /// <summary>
    /// Additional metadata from Smartico template (JSON)
    /// </summary>
    public string? TemplateMetadata { get; init; }

    /// <summary>
    /// Type of bonus
    /// </summary>
    public BonusType? Type { get; init; }
}
