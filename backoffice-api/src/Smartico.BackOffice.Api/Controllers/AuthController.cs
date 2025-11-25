using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Auth.DTOs;
using Smartico.BackOffice.Application.Auth.Interfaces;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for authentication operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    /// <param name="loginDto">Login credentials.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Login response with token and user information.</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginDto loginDto,
        CancellationToken cancellationToken)
    {
        // For now, use a hardcoded operator ID (in production, this would come from subdomain/header/etc)
        // TODO: Extract operator ID from request context (subdomain, header, etc.)
        var operatorId = ObjectId.Parse("507f1f77bcf86cd799439011"); // Placeholder operator ID

        var result = await _authService.LoginAsync(operatorId, loginDto, cancellationToken);

        if (result == null)
        {
            _logger.LogWarning("Failed login attempt for email: {Email}", loginDto.Email);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        _logger.LogInformation("Successful login for user: {Email}", loginDto.Email);
        return Ok(result);
    }
}
