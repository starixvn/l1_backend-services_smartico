using System.Text.Json.Serialization;
using Smartico.BackOffice.Application.Users.DTOs;

namespace Smartico.BackOffice.Application.Auth.DTOs;

/// <summary>
/// Data transfer object for successful login response.
/// </summary>
public class LoginResponseDto
{
    /// <summary>
    /// Gets or sets the JWT access token.
    /// </summary>
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the token expiration time (UTC).
    /// </summary>
    [JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the authenticated user information.
    /// </summary>
    [JsonPropertyName("user")]
    public UserDto User { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of permission codes granted to the user.
    /// </summary>
    [JsonPropertyName("permissions")]
    public List<string> Permissions { get; set; } = new();
}
