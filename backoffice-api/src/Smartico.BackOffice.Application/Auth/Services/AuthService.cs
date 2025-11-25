using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Auth.DTOs;
using Smartico.BackOffice.Application.Auth.Interfaces;
using Smartico.BackOffice.Application.Users.DTOs;
using Smartico.BackOffice.Domain.Repositories;

namespace Smartico.BackOffice.Application.Auth.Services;

/// <summary>
/// Service for authentication operations including login and JWT token generation.
/// </summary>
public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRoleRepository _roleRepository;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IRoleRepository roleRepository,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _roleRepository = roleRepository;
        _configuration = configuration;
    }

    /// <inheritdoc />
    public async Task<LoginResponseDto?> LoginAsync(
        ObjectId operatorId,
        LoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        // Find user by email
        var user = await _userRepository.GetByEmailAsync(
            operatorId,
            loginDto.Email.ToLowerInvariant(),
            cancellationToken);

        if (user == null)
        {
            return null;
        }

        // Check if user is active
        if (!user.IsActive)
        {
            return null;
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null;
        }

        // Update last login timestamp
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Load roles to get permissions
        var roles = await _roleRepository.GetByIdsAsync(user.OperatorId, user.RoleIds, cancellationToken);

        // Collect all unique permission codes from all roles
        var permissions = roles
            .SelectMany(r => r.Permissions)
            .Distinct()
            .ToList();

        // Generate JWT token
        var (token, expiresAt) = await GenerateTokenAsync(
            user.Id,
            user.OperatorId,
            user.Email,
            user.RoleIds,
            cancellationToken);

        // Map user to DTO
        var userDto = new UserDto
        {
            Id = user.Id.ToString(),
            OperatorId = user.OperatorId.ToString(),
            Email = user.Email,
            FullName = user.FullName,
            RoleIds = user.RoleIds.Select(r => r.ToString()).ToList(),
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = userDto,
            Permissions = permissions
        };
    }

    /// <inheritdoc />
    public async Task<(string token, DateTime expiresAt)> GenerateTokenAsync(
        ObjectId userId,
        ObjectId operatorId,
        string email,
        List<ObjectId> roleIds,
        CancellationToken cancellationToken = default)
    {
        // Load roles to get permissions
        var roles = await _roleRepository.GetByIdsAsync(operatorId, roleIds, cancellationToken);

        // Collect all unique permission codes from all roles
        var permissions = roles
            .SelectMany(r => r.Permissions)
            .Distinct()
            .ToList();

        // Create claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, email),
            new("OperatorId", operatorId.ToString())
        };

        // Add role claims
        foreach (var roleId in roleIds)
        {
            claims.Add(new Claim(ClaimTypes.Role, roleId.ToString()));
        }

        // Add permission claims
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("Permission", permission));
        }

        // Get JWT settings from configuration
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
        var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");
        var jwtExpiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAt = DateTime.UtcNow.AddMinutes(jwtExpiryMinutes);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        return (tokenString, expiresAt);
    }
}
