using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Domain.Entities;

/// <summary>
/// Represents a tournament campaign with leaderboard configuration, prize pool, and entry requirements.
/// </summary>
public class Tournament : IOperatorScoped
{
    /// <summary>
    /// Gets or sets the unique identifier for this tournament.
    /// </summary>
    [BsonId]
    [BsonElement("_id")]
    public ObjectId Id { get; set; }

    /// <summary>
    /// Gets or sets the operator ID (casino/game provider) that owns this tournament.
    /// Required for multi-tenant data isolation.
    /// </summary>
    [BsonElement("operatorId")]
    [BsonRequired]
    public ObjectId OperatorId { get; set; }

    /// <summary>
    /// Gets or sets the name of the tournament.
    /// </summary>
    [BsonElement("name")]
    [BsonRequired]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional description of the tournament.
    /// </summary>
    [BsonElement("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of tournament (Leaderboard, Bracket, TimeBasedChallenge).
    /// </summary>
    [BsonElement("type")]
    [BsonRepresentation(BsonType.String)]
    public TournamentType Type { get; set; }

    /// <summary>
    /// Gets or sets the current status of the tournament.
    /// </summary>
    [BsonElement("status")]
    [BsonRepresentation(BsonType.String)]
    public TournamentStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the tournament start date and time.
    /// </summary>
    [BsonElement("startDate")]
    [BsonRequired]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the tournament end date and time.
    /// </summary>
    [BsonElement("endDate")]
    [BsonRequired]
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Gets or sets the scoring type for this tournament.
    /// </summary>
    [BsonElement("scoringType")]
    [BsonRepresentation(BsonType.String)]
    public ScoringType ScoringType { get; set; }

    /// <summary>
    /// Gets or sets the total prize pool amount.
    /// </summary>
    [BsonElement("prizePool")]
    [BsonRequired]
    public decimal PrizePool { get; set; }

    /// <summary>
    /// Gets or sets the prize distribution configuration.
    /// </summary>
    [BsonElement("prizeDistribution")]
    public List<PrizeDistribution> PrizeDistribution { get; set; } = new();

    /// <summary>
    /// Gets or sets the maximum number of participants allowed.
    /// </summary>
    [BsonElement("maxParticipants")]
    public int? MaxParticipants { get; set; }

    /// <summary>
    /// Gets or sets the entry fee required to join the tournament.
    /// </summary>
    [BsonElement("entryFee")]
    public decimal? EntryFee { get; set; }

    /// <summary>
    /// Gets or sets the list of eligible game IDs for this tournament.
    /// </summary>
    [BsonElement("eligibleGames")]
    public List<string>? EligibleGames { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this tournament was created.
    /// </summary>
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when this tournament was last updated.
    /// </summary>
    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
