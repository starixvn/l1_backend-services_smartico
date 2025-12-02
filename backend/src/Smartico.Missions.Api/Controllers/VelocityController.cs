using MediatR;
using Microsoft.AspNetCore.Mvc;
using Smartico.Missions.Api.Models;
using Smartico.Missions.Application.Features.Velocity.Commands.AcknowledgeLevelUp;
using Smartico.Missions.Application.Features.Velocity.DTOs;
using Smartico.Missions.Application.Features.Velocity.Queries.GetLevelUpEvents;
using Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityMissions;
using Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityProgress;
using Smartico.Missions.Application.Features.Velocity.Queries.GetVelocityTiers;
using Smartico.Missions.Application.Features.Velocity.Queries.GetXPActivity;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for xSpeed Velocity Program tier and progress endpoints.
/// </summary>
[ApiController]
[Route("api/velocity")]
[Produces("application/json")]
public class VelocityController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<VelocityController> _logger;

    public VelocityController(IMediator mediator, ILogger<VelocityController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets the player's current Velocity tier progress.
    /// </summary>
    /// <param name="userId">Player's unique identifier (default: demo-user for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Player's velocity progress with current tier, XP, and benefits</returns>
    /// <response code="200">Successfully retrieved velocity progress</response>
    /// <response code="400">Invalid user ID</response>
    /// <response code="404">No progress data found for user</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("progress")]
    [ProducesResponseType(typeof(GetVelocityProgressResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetVelocityProgressResponse>> GetVelocityProgress(
        [FromQuery] string userId = "demo-user",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetVelocityProgress called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("GET /api/velocity/progress - User: {UserId}", userId);

        var query = new GetVelocityProgressQuery(userId);
        var response = await _mediator.Send(query, cancellationToken);

        if (response.Progress == null)
        {
            _logger.LogWarning("User {UserId} has no velocity progress data", userId);
            return NotFound(new { error = $"User {userId} has no velocity progress data" });
        }

        _logger.LogInformation("Returning velocity progress for user {UserId} - Tier: {Tier}, XP: {Xp}",
            userId, response.Progress.CurrentTierName, response.Progress.TotalXp);

        return Ok(ApiResponse<GetVelocityProgressResponse>.Ok(response));
    }

    /// <summary>
    /// Gets all Velocity tier definitions.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of all Velocity tier definitions</returns>
    /// <response code="200">Successfully retrieved tier definitions</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("tiers")]
    [ProducesResponseType(typeof(GetVelocityTiersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetVelocityTiersResponse>> GetVelocityTiers(
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("GET /api/velocity/tiers");

        var query = new GetVelocityTiersQuery();
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation("Returning {TierCount} velocity tiers", response.Tiers.Count);

        return Ok(ApiResponse<GetVelocityTiersResponse>.Ok(response));
    }

    /// <summary>
    /// Gets tier-gated mission availability for the player.
    /// </summary>
    /// <param name="userId">Player's unique identifier (default: demo-user for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>All missions with their tier requirements and availability status</returns>
    /// <response code="200">Successfully retrieved mission availability</response>
    /// <response code="400">Invalid user ID</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("missions")]
    [ProducesResponseType(typeof(GetVelocityMissionsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetVelocityMissionsResponse>> GetVelocityMissions(
        [FromQuery] string userId = "demo-user",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetVelocityMissions called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("GET /api/velocity/missions - User: {UserId}", userId);

        var query = new GetVelocityMissionsQuery(userId);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation("Returning {MissionCount} missions for user {UserId}, player tier: {Tier}",
            response.Missions.Count, userId, response.PlayerTier);

        return Ok(ApiResponse<GetVelocityMissionsResponse>.Ok(response));
    }

    /// <summary>
    /// Gets recent XP-earning activities for the player.
    /// </summary>
    /// <param name="userId">Player's unique identifier (default: demo-user for demo)</param>
    /// <param name="limit">Maximum number of activities to return (default: 20, max: 100)</param>
    /// <param name="type">Filter by activity type</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Feed of recent XP-earning activities</returns>
    /// <response code="200">Successfully retrieved XP activities</response>
    /// <response code="400">Invalid parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("xp-activity")]
    [ProducesResponseType(typeof(GetXPActivityResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetXPActivityResponse>> GetXPActivity(
        [FromQuery] string userId = "demo-user",
        [FromQuery] int limit = 20,
        [FromQuery] XpActivityType? type = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetXPActivity called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        if (limit < 1 || limit > 100)
        {
            _logger.LogWarning("GetXPActivity called with invalid limit: {Limit}", limit);
            return BadRequest(new { error = "Limit must be between 1 and 100" });
        }

        _logger.LogInformation("GET /api/velocity/xp-activity - User: {UserId}, Limit: {Limit}, Type: {Type}",
            userId, limit, type?.ToString() ?? "all");

        var query = new GetXPActivityQuery(userId, limit, type);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation("Returning {ActivityCount} XP activities for user {UserId}",
            response.Activities.Count, userId);

        return Ok(ApiResponse<GetXPActivityResponse>.Ok(response));
    }

    /// <summary>
    /// Gets unacknowledged level-up events for the player.
    /// </summary>
    /// <param name="userId">Player's unique identifier (default: demo-user for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Pending level-up events for celebration display</returns>
    /// <response code="200">Successfully retrieved level-up events</response>
    /// <response code="400">Invalid user ID</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("level-up-events")]
    [ProducesResponseType(typeof(GetLevelUpEventsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLevelUpEventsResponse>> GetLevelUpEvents(
        [FromQuery] string userId = "demo-user",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetLevelUpEvents called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("GET /api/velocity/level-up-events - User: {UserId}", userId);

        var query = new GetLevelUpEventsQuery(userId);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation("Returning {EventCount} level-up events for user {UserId}",
            response.Events.Count, userId);

        return Ok(ApiResponse<GetLevelUpEventsResponse>.Ok(response));
    }

    /// <summary>
    /// Acknowledges a level-up event.
    /// </summary>
    /// <param name="eventId">Level-up event identifier</param>
    /// <param name="userId">Player's unique identifier (default: demo-user for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Event acknowledged successfully</response>
    /// <response code="400">Invalid parameters</response>
    /// <response code="404">Event not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("level-up-events/{eventId}/acknowledge")]
    [ProducesResponseType(typeof(ApiResponse<AcknowledgeLevelUpResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> AcknowledgeLevelUp(
        [FromRoute] string eventId,
        [FromQuery] string userId = "demo-user",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(eventId))
        {
            _logger.LogWarning("AcknowledgeLevelUp called with empty eventId");
            return BadRequest(new { error = "Event ID is required" });
        }

        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("AcknowledgeLevelUp called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("POST /api/velocity/level-up-events/{EventId}/acknowledge - User: {UserId}",
            eventId, userId);

        var command = new AcknowledgeLevelUpCommand(userId, eventId);
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.Success)
        {
            _logger.LogWarning("Failed to acknowledge level-up event {EventId} for user {UserId}: {Error}",
                eventId, userId, result.Error);
            return NotFound(new { error = result.Error });
        }

        _logger.LogInformation("Level-up event {EventId} acknowledged for user {UserId}", eventId, userId);

        return Ok(ApiResponse<AcknowledgeLevelUpResponse>.Ok(result));
    }
}
