using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Users.DTOs;

/// <summary>
/// Data transfer object for creating a new user.
/// </summary>
public class CreateUserDto
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's full name.
    /// </summary>
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's password (will be hashed).
    /// </summary>
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the list of role IDs to assign to this user.
    /// </summary>
    [JsonPropertyName("roleIds")]
    public List<string> RoleIds { get; set; } = new();

    /// <summary>
    /// Gets or sets whether the user account is active.
    /// Defaults to true.
    /// </summary>
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; } = true;
}
