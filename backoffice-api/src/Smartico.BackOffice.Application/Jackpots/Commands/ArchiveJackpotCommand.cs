using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Jackpots.Commands;

/// <summary>
/// Command to archive a jackpot.
/// Transitions to Archived status.
/// </summary>
public class ArchiveJackpotCommand
{
    /// <summary>
    /// Jackpot ID to archive.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
}
