using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Api.Models.Requests;

/// <summary>
/// Request model for updating an existing user.
/// </summary>
public class UpdateUserRequest
{
    /// <summary>
    /// User's full name for display purposes.
    /// </summary>
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Whether the user account is active.
    /// Inactive users cannot log in.
    /// </summary>
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    /// <summary>
    /// Optional new password (if changing password).
    /// If provided, must be at least 8 characters long.
    /// </summary>
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be at least 8 characters")]
    [JsonPropertyName("newPassword")]
    public string? NewPassword { get; set; }
}
