using MongoDB.Bson;
using Smartico.BackOffice.Application.Auth.DTOs;

namespace Smartico.BackOffice.Application.Auth.Interfaces;

/// <summary>
/// Service interface for authentication operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Authenticates a user and generates a JWT token.
    /// </summary>
    /// <param name="operatorId">The operator ID for the login attempt.</param>
    /// <param name="loginDto">The login credentials.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Login response with token and user information, or null if authentication fails.</returns>
    Task<LoginResponseDto?> LoginAsync(
        ObjectId operatorId,
        LoginDto loginDto,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a JWT token for the specified user.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="operatorId">The operator ID.</param>
    /// <param name="email">The user's email.</param>
    /// <param name="roleIds">The user's role IDs.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The generated JWT token and expiration time.</returns>
    Task<(string token, DateTime expiresAt)> GenerateTokenAsync(
        ObjectId userId,
        ObjectId operatorId,
        string email,
        List<ObjectId> roleIds,
        CancellationToken cancellationToken = default);
}
