using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smartico.Missions.Api.Models;
using Smartico.Missions.Application.Features.Bonuses.Commands;
using Smartico.Missions.Application.Features.Bonuses.Queries;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for bonus-related operations using CQRS pattern with MediatR.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BonusesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<BonusesController> _logger;

    public BonusesController(
        IMediator mediator,
        ILogger<BonusesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets all bonuses for the authenticated user.
    /// </summary>
    /// <param name="userId">User ID (temporary - will come from JWT in production)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of bonuses</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<GetBonusesResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBonuses(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        try
        {
            _logger.LogInformation("Fetching bonuses for user {UserId}", userId);

            var query = new GetBonusesQuery(userId);
            var response = await _mediator.Send(query, cancellationToken);

            _logger.LogInformation("Successfully fetched {Count} bonuses for user {UserId}",
                response.Bonuses.Count(), userId);

            return Ok(ApiResponse<GetBonusesResponse>.Ok(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching bonuses for user {UserId}", userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to fetch bonuses"));
        }
    }

    /// <summary>
    /// Claims a specific bonus for the authenticated user.
    /// </summary>
    /// <param name="bonusId">Bonus ID to claim</param>
    /// <param name="userId">User ID (temporary - will come from JWT in production)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Claim result</returns>
    [HttpPost("{bonusId}/claim")]
    [ProducesResponseType(typeof(ApiResponse<ClaimBonusResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ClaimBonus(
        string bonusId,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        if (string.IsNullOrWhiteSpace(bonusId))
        {
            return BadRequest(ApiResponse<object>.Fail("Bonus ID is required"));
        }

        try
        {
            _logger.LogInformation("User {UserId} claiming bonus {BonusId}", userId, bonusId);

            var command = new ClaimBonusCommand(userId, bonusId);
            var response = await _mediator.Send(command, cancellationToken);

            if (!response.Success)
            {
                _logger.LogWarning("Failed to claim bonus {BonusId} for user {UserId}: {ErrorCode}",
                    bonusId, userId, response.ErrorCode);

                return BadRequest(ApiResponse<ClaimBonusResponse>.Fail(
                    response.ErrorMessage ?? "Failed to claim bonus"));
            }

            _logger.LogInformation("Successfully claimed bonus {BonusId} for user {UserId}",
                bonusId, userId);

            return Ok(ApiResponse<ClaimBonusResponse>.Ok(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error claiming bonus {BonusId} for user {UserId}",
                bonusId, userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to claim bonus"));
        }
    }
}
