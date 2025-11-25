using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Requests;

/// <summary>
/// Request model for creating a new role.
/// </summary>
public class CreateRoleRequest
{
    /// <summary>
    /// Role name (e.g., "Marketing Manager", "Content Editor").
    /// Must be 3-50 characters long.
    /// </summary>
    [Required(ErrorMessage = "Role name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Role name must be between 3 and 50 characters")]
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Optional description of the role and its purpose.
    /// </summary>
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// List of permission codes to grant to this role.
    /// Must contain at least one permission.
    /// Example: ["tournaments.view", "tournaments.create", "missions.view"]
    /// </summary>
    [Required(ErrorMessage = "At least one permission is required")]
    [MinLength(1, ErrorMessage = "Role must have at least one permission")]
    [JsonPropertyName("permissionCodes")]
    public List<string> PermissionCodes { get; set; } = new();
}
