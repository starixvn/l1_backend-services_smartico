using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Tournaments.Commands;

/// <summary>
/// Command to create a new tournament.
/// </summary>
public class CreateTournamentCommand
{
    /// <summary>
    /// Gets or sets the name of the tournament.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional description of the tournament.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of tournament.
    /// </summary>
    public TournamentType Type { get; set; }

    /// <summary>
    /// Gets or sets the scoring type for the tournament.
    /// </summary>
    public ScoringType ScoringType { get; set; }

    /// <summary>
    /// Gets or sets the start date and time of the tournament.
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date and time of the tournament.
    /// </summary>
    public DateTime EndDate { get; set; }

    /// <summary>
    /// Gets or sets the total prize pool amount.
    /// </summary>
    public decimal PrizePool { get; set; }

    /// <summary>
    /// Gets or sets the prize distribution configuration.
    /// </summary>
    public List<PrizeDistribution> PrizeDistribution { get; set; } = new();

    /// <summary>
    /// Gets or sets the maximum number of participants (optional).
    /// </summary>
    public int? MaxParticipants { get; set; }

    /// <summary>
    /// Gets or sets the entry fee (default is 0 for free tournaments).
    /// </summary>
    public decimal? EntryFee { get; set; }

    /// <summary>
    /// Gets or sets the list of eligible game IDs (optional).
    /// </summary>
    public List<string>? EligibleGames { get; set; }
}
