namespace Smartico.BackOffice.Application.Leaderboard.DTOs;

/// <summary>
/// Data transfer object for leaderboard entries.
/// </summary>
public class LeaderboardEntryDto
{
    public string Id { get; set; } = string.Empty;
    public string TournamentId { get; set; } = string.Empty;
    public string PlayerId { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public int Rank { get; set; }
    public decimal Score { get; set; }
    public DateTime LastUpdated { get; set; }
    public string? AvatarUrl { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}
