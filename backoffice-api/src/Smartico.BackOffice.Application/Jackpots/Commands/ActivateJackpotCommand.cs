using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Jackpots.Commands;

/// <summary>
/// Command to activate a jackpot.
/// Transitions from Draft to Active status.
/// </summary>
public class ActivateJackpotCommand
{
    /// <summary>
    /// Jackpot ID to activate.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
}
