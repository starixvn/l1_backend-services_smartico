using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Dtos;

/// <summary>
/// Data transfer object for User entity.
/// Represents a back office user with their roles and status.
/// </summary>
public class UserDto
{
    /// <summary>
    /// Unique identifier for the user.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Operator (casino/game provider) that owns this user.
    /// </summary>
    [JsonPropertyName("operatorId")]
    public string OperatorId { get; set; } = string.Empty;

    /// <summary>
    /// User's email address (used for login).
    /// </summary>
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's full name for display purposes.
    /// </summary>
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// List of role IDs assigned to this user.
    /// </summary>
    [JsonPropertyName("roleIds")]
    public List<string> RoleIds { get; set; } = new();

    /// <summary>
    /// List of role names for display (not persisted, populated from roles).
    /// </summary>
    [JsonPropertyName("roleNames")]
    public List<string> RoleNames { get; set; } = new();

    /// <summary>
    /// Whether the user account is active.
    /// Inactive users cannot log in.
    /// </summary>
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    /// <summary>
    /// Timestamp of the user's last login (UTC), null if never logged in.
    /// </summary>
    [JsonPropertyName("lastLoginAt")]
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Timestamp when the user was created (UTC).
    /// </summary>
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the user was last updated (UTC).
    /// </summary>
    [JsonPropertyName("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}
