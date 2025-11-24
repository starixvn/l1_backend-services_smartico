using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a player's position on a tournament leaderboard.
/// </summary>
public class LeaderboardEntry : IOperatorScoped
{
    /// <summary>
    /// Gets or sets the entry ID.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Gets or sets the operator ID (for multi-tenant isolation).
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Gets or sets the tournament ID this entry belongs to.
    /// </summary>
    [BsonElement("tournamentId")]
    [BsonRequired]
    public ObjectId TournamentId { get; set; }

    /// <summary>
    /// Gets or sets the player ID.
    /// </summary>
    [BsonElement("playerId")]
    [BsonRequired]
    public string PlayerId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the player's display name.
    /// </summary>
    [BsonElement("playerName")]
    public string PlayerName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the player's current rank/position.
    /// </summary>
    [BsonElement("rank")]
    public int Rank { get; set; }

    /// <summary>
    /// Gets or sets the player's score.
    /// </summary>
    [BsonElement("score")]
    public decimal Score { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the last score update.
    /// </summary>
    [BsonElement("lastUpdated")]
    public DateTime LastUpdated { get; set; }

    /// <summary>
    /// Gets or sets the player's avatar URL (optional).
    /// </summary>
    [BsonElement("avatarUrl")]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Gets or sets additional metadata (e.g., wins, games played, etc.).
    /// </summary>
    [BsonElement("metadata")]
    public Dictionary<string, object>? Metadata { get; set; }

    /// <summary>
    /// Gets or sets when this entry was created.
    /// </summary>
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
