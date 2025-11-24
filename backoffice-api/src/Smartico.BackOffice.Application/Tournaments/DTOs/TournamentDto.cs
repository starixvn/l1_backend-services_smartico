using System.Text.Json.Serialization;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Tournaments.DTOs;

/// <summary>
/// Data transfer object for tournament information.
/// </summary>
public class TournamentDto
{
    /// <summary>
    /// Gets or sets the tournament ID.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the operator ID.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the tournament name.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional tournament description.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the tournament type.
    /// </summary>
    [JsonPropertyName("type")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TournamentType Type { get; set; }

    /// <summary>
    /// Gets or sets the tournament status.
    /// </summary>
    [JsonPropertyName("status")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TournamentStatus Status { get; set; }

    /// <summary>
    /// Gets or sets the start date.
    /// </summary>
    [JsonPropertyName("startDate")]
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date.
    /// </summary>
    [JsonPropertyName("endDate")]
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Gets or sets the scoring type.
    /// </summary>
    [JsonPropertyName("scoringType")]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ScoringType ScoringType { get; set; }

    /// <summary>
    /// Gets or sets the prize pool amount.
    /// </summary>
    [JsonPropertyName("prizePool")]
    public decimal PrizePool { get; set; }

    /// <summary>
    /// Gets or sets the prize distribution configuration.
    /// </summary>
    [JsonPropertyName("prizeDistribution")]
    public List<PrizeDistribution> PrizeDistribution { get; set; } = new();

    /// <summary>
    /// Gets or sets the maximum participants.
    /// </summary>
    [JsonPropertyName("maxParticipants")]
    public int? MaxParticipants { get; set; }

    /// <summary>
    /// Gets or sets the entry fee.
    /// </summary>
    [JsonPropertyName("entryFee")]
    public decimal? EntryFee { get; set; }

    /// <summary>
    /// Gets or sets the list of eligible game IDs.
    /// </summary>
    [JsonPropertyName("eligibleGames")]
    public List<string>? EligibleGames { get; set; }

    /// <summary>
    /// Gets or sets the creation date.
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the last update date.
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
