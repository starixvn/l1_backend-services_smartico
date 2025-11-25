using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Dtos;

/// <summary>
/// Data transfer object for Permission entity.
/// Represents a permission with its code, name, description, and module grouping.
/// </summary>
public class PermissionDto
{
    /// <summary>
    /// Unique identifier for the permission.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Unique permission code using dotted notation (e.g., "tournaments.view", "missions.create").
    /// </summary>
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Display name for the permission (e.g., "View Tournaments", "Create Missions").
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of what this permission allows.
    /// </summary>
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Module/feature area this permission belongs to (e.g., "Tournaments", "Missions", "Users").
    /// Used for grouping permissions in the UI.
    /// </summary>
    [JsonPropertyName("module")]
    public string Module { get; set; } = string.Empty;

    /// <summary>
    /// Whether this is a system permission that cannot be deleted.
    /// </summary>
    [JsonPropertyName("isSystem")]
    public bool IsSystem { get; set; }

    /// <summary>
    /// Display order within the module for UI sorting.
    /// </summary>
    [JsonPropertyName("displayOrder")]
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Timestamp when the permission was created (UTC).
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the permission was last updated (UTC).
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
