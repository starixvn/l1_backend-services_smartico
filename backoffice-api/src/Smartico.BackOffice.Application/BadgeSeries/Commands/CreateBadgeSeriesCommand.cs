using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.BadgeSeries.Commands;

/// <summary>
/// Command to create a new badge series.
/// </summary>
public class CreateBadgeSeriesCommand
{
    /// <summary>
    /// Series name displayed to players.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the series.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// URL or path to the series icon/image.
    /// </summary>
    [JsonPropertyName("iconUrl")]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Display order for ordering series in UI.
    /// </summary>
    [JsonPropertyName("displayOrder")]
    public int DisplayOrder { get; set; } = 0;
}
