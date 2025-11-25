using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Auth.DTOs;

/// <summary>
/// Data transfer object for user login request.
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's password.
    /// </summary>
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}
