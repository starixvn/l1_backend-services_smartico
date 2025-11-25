using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Requests;

/// <summary>
/// Request model for creating a new user.
/// </summary>
public class CreateUserRequest
{
    /// <summary>
    /// User's email address (must be unique within the operator).
    /// </summary>
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// User's full name for display purposes.
    /// </summary>
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// User's password (will be hashed with BCrypt).
    /// Must be at least 8 characters long.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// List of role IDs to assign to the user.
    /// Must contain at least one role.
    /// </summary>
    [Required(ErrorMessage = "At least one role is required")]
    [MinLength(1, ErrorMessage = "User must have at least one role")]
    [JsonPropertyName("roleIds")]
    public List<string> RoleIds { get; set; } = new();
}
