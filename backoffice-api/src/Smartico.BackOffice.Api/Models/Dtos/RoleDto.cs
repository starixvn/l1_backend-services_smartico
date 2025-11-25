using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Dtos;

/// <summary>
/// Data transfer object for Role entity.
/// Represents a role with its associated permissions and metadata.
/// </summary>
public class RoleDto
{
    /// <summary>
    /// Unique identifier for the role.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Operator (casino/game provider) that owns this role.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    /// <summary>
    /// Role name (e.g., "Administrator", "Campaign Manager", "Viewer").
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the role and its purpose.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// List of permission codes granted to this role (e.g., "tournaments.view", "missions.create").
    /// </summary>
    [JsonPropertyName("permissions")]
    public List<string> Permissions { get; set; } = new();

    /// <summary>
    /// Indicates if this is a system-defined role that cannot be deleted.
    /// System roles: Administrator, Campaign Manager, Viewer.
    /// </summary>
    [JsonPropertyName("isSystem")]
    public bool IsSystem { get; set; }

    /// <summary>
    /// Timestamp when the role was created (UTC).
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the role was last updated (UTC).
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
