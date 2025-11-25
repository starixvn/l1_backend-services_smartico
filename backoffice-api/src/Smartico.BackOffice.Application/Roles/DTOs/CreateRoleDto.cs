using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Roles.DTOs;

/// <summary>
/// Data transfer object for creating a new role.
/// </summary>
public class CreateRoleDto
{
    /// <summary>
    /// Gets or sets the role name.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional role description.
    /// </summary>
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the list of permission codes to grant to this role.
    /// </summary>
    [JsonPropertyName("permissions")]
    public List<string> Permissions { get; set; } = new();
}
