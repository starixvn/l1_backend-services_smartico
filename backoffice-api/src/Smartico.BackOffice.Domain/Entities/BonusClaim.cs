using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Tracks individual bonus claims for enforcing limits.
/// Used to enforce both per-bonus limits (max claims per player) and
/// global operator limits (max daily/weekly/monthly bonus value per player).
/// </summary>
public class BonusClaim : IOperatorScoped
{
    /// <summary>
    /// Unique identifier for the claim.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Operator (casino/game provider) that owns this claim.
    /// Used for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Reference to the bonus template that was claimed.
    /// </summary>
    [BsonElement("bonusId")]
    [BsonRequired]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId BonusId { get; set; }

    /// <summary>
    /// Identifier of the player who claimed the bonus.
    /// This is an external player ID from the operator's system.
    /// </summary>
    [BsonElement("playerId")]
    [BsonRequired]
    public string PlayerId { get; set; } = string.Empty;

    /// <summary>
    /// The calculated value of the bonus claim.
    /// Used for enforcing value-based limits.
    /// </summary>
    [BsonElement("claimValue")]
    [BsonRequired]
    public decimal ClaimValue { get; set; }

    /// <summary>
    /// Currency of the claim value.
    /// </summary>
    [BsonElement("currency")]
    [BsonRequired]
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Source channel that issued the bonus.
    /// </summary>
    [BsonElement("source")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public BonusClaimSource Source { get; set; }

    /// <summary>
    /// Reference ID to the source entity (e.g., MissionId, TournamentId, CampaignId).
    /// </summary>
    [BsonElement("sourceId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public ObjectId? SourceId { get; set; }

    /// <summary>
    /// Current status of the claim.
    /// </summary>
    [BsonElement("status")]
    [BsonRequired]
    [BsonRepresentation(BsonType.String)]
    public BonusClaimStatus Status { get; set; } = BonusClaimStatus.Pending;

    /// <summary>
    /// External reference ID returned by the operator's bonus system.
    /// Used for tracking and reconciliation.
    /// </summary>
    [BsonElement("externalReferenceId")]
    public string? ExternalReferenceId { get; set; }

    /// <summary>
    /// Timestamp when the claim was created (UTC).
    /// </summary>
    [BsonElement("claimedAt")]
    [BsonRequired]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the claim was last updated (UTC).
    /// </summary>
    [BsonElement("updatedAt")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Source channels that can issue bonuses.
/// </summary>
public enum BonusClaimSource
{
    /// <summary>
    /// Bonus issued through a mission reward node.
    /// </summary>
    Mission,

    /// <summary>
    /// Bonus issued as a tournament prize.
    /// </summary>
    Tournament,

    /// <summary>
    /// Bonus purchased from the store using points.
    /// </summary>
    Store,

    /// <summary>
    /// Bonus won through a mini-game (spin wheel, scratch card, etc.).
    /// </summary>
    MiniGame,

    /// <summary>
    /// Bonus issued through a marketing campaign.
    /// </summary>
    Campaign,

    /// <summary>
    /// Bonus issued through automation rules.
    /// </summary>
    Automation,

    /// <summary>
    /// Bonus issued manually by an operator.
    /// </summary>
    Manual
}

/// <summary>
/// Status of a bonus claim.
/// </summary>
public enum BonusClaimStatus
{
    /// <summary>
    /// Claim is pending processing.
    /// </summary>
    Pending,

    /// <summary>
    /// Claim was successfully issued to the external platform.
    /// </summary>
    Issued,

    /// <summary>
    /// Claim failed to be issued (API error, limit exceeded, etc.).
    /// </summary>
    Failed,

    /// <summary>
    /// Claim was rejected due to limit constraints.
    /// </summary>
    Rejected,

    /// <summary>
    /// Claim was cancelled.
    /// </summary>
    Cancelled
}
