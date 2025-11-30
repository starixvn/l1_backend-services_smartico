using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Jackpots.Commands;

/// <summary>
/// Command to pause a jackpot.
/// Transitions from Active to Paused status.
/// </summary>
public class PauseJackpotCommand
{
    /// <summary>
    /// Jackpot ID to pause.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
}
