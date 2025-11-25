using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Requests;

/// <summary>
/// Request model for assigning roles to a user.
/// </summary>
public class AssignRolesRequest
{
    /// <summary>
    /// List of role IDs to assign to the user.
    /// Must contain at least one role.
    /// Replaces all existing role assignments.
    /// </summary>
    [Required(ErrorMessage = "At least one role is required")]
    [MinLength(1, ErrorMessage = "User must have at least one role")]
    [JsonPropertyName("roleIds")]
    public List<string> RoleIds { get; set; } = new();
}
