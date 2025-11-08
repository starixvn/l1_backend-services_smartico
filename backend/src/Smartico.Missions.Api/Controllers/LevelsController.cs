using MediatR;
using Microsoft.AspNetCore.Mvc;
using Smartico.Missions.Application.Features.Levels.Queries.GetUserLevelProgress;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for player level operations.
/// </summary>
[ApiController]
[Route("api/levels")]
[Produces("application/json")]
public class LevelsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<LevelsController> _logger;

    public LevelsController(IMediator mediator, ILogger<LevelsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets the user's current level progression status including progress toward next level.
    /// </summary>
    /// <param name="userId">User identifier (default: user123 for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>User level progress with current level, points, and percentage to next level</returns>
    /// <response code="200">Successfully retrieved level progress</response>
    /// <response code="400">Invalid user ID</response>
    /// <response code="404">User has no level data (new user with 0 points)</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("progress")]
    [ProducesResponseType(typeof(GetUserLevelProgressResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetUserLevelProgressResponse>> GetUserLevelProgress(
        [FromQuery] string userId = "user123",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetUserLevelProgress called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("GET /api/levels/progress - User: {UserId}", userId);

        var query = new GetUserLevelProgressQuery(userId);
        var response = await _mediator.Send(query, cancellationToken);

        // If user has no level data (0 points, new user)
        if (response.Progress == null)
        {
            _logger.LogWarning("User {UserId} has no level data", userId);
            return NotFound(new { error = $"User {userId} has no level data (0 points or new user)" });
        }

        _logger.LogInformation("Returning level progress for user {UserId} - Level: {Level}, Progress: {Progress}%",
            userId, response.Progress.CurrentLevelName, response.Progress.ProgressPercentage?.ToString("F2") ?? "Max Level");

        return Ok(response);
    }
}
