using MediatR;
using Microsoft.AspNetCore.Mvc;
using Smartico.Missions.Api.Models;
using Smartico.Missions.Application.Features.MiniGames.Commands;
using Smartico.Missions.Application.Features.MiniGames.Queries;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for mini game operations using CQRS pattern with MediatR.
/// Provides endpoints for browsing and playing mini games.
/// </summary>
[ApiController]
[Route("api/mini-games")]
[Produces("application/json")]
public class MiniGamesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<MiniGamesController> _logger;

    public MiniGamesController(
        IMediator mediator,
        ILogger<MiniGamesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets all available mini games for the specified user.
    /// </summary>
    /// <remarks>
    /// Returns list of all mini games with current state including:
    /// - Available games with buy-in requirements
    /// - Cooldowns and attempt counters
    /// - Current jackpot amounts
    /// - Prize pool status
    ///
    /// Results are cached for 30 seconds per user for optimal performance.
    /// </remarks>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of available mini games</returns>
    /// <response code="200">Successfully retrieved mini games</response>
    /// <response code="400">Invalid request (missing userId)</response>
    /// <response code="500">Server error</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<GetMiniGamesResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMiniGames(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        try
        {
            _logger.LogInformation("Fetching mini games for user {UserId}", userId);

            var query = new GetMiniGamesQuery(userId);
            var response = await _mediator.Send(query, cancellationToken);

            _logger.LogInformation("Successfully fetched {Count} mini games for user {UserId}",
                response.MiniGames.Count(), userId);

            return Ok(ApiResponse<GetMiniGamesResponse>.Ok(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching mini games for user {UserId}", userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to fetch mini games"));
        }
    }

    /// <summary>
    /// Plays a mini game for the specified user.
    /// </summary>
    /// <remarks>
    /// Executes a mini game play and awards prizes. Side effects:
    /// - Deducts buy-in cost from user balance
    /// - Updates game cooldown and attempt counters
    /// - Increments jackpot (if applicable)
    /// - Decrements prize pool (if applicable)
    /// - Invalidates mini games cache for user
    /// - Broadcasts SignalR events (MiniGamePlayed, MiniGamePrizeWon, potentially MiniGameJackpotWon)
    ///
    /// Performance: &lt; 500ms (p95)
    /// </remarks>
    /// <param name="gameId">ID of the mini game template to play</param>
    /// <param name="userId">Unique identifier of the user</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Play result with prize information and updated game state</returns>
    /// <response code="200">Game played successfully (check success field for win/loss)</response>
    /// <response code="400">Invalid request or game validation failed</response>
    /// <response code="404">Game not found</response>
    /// <response code="500">Server error</response>
    [HttpPost("{gameId}/play")]
    [ProducesResponseType(typeof(ApiResponse<PlayMiniGameResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PlayMiniGame(
        int gameId,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        if (gameId <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("Game ID must be greater than 0"));
        }

        try
        {
            _logger.LogInformation("User {UserId} playing mini game {GameId}", userId, gameId);

            var command = new PlayMiniGameCommand(userId, gameId);
            var response = await _mediator.Send(command, cancellationToken);

            if (!response.Success)
            {
                _logger.LogWarning("Failed to play mini game {GameId} for user {UserId}: {ErrorCode}",
                    gameId, userId, response.ErrorCode);

                // Return 404 if game not found, otherwise 400
                if (response.ErrorCode == "GAME_NOT_FOUND")
                {
                    return NotFound(ApiResponse<object>.Fail(response.ErrorMessage ?? "Game not found"));
                }

                return BadRequest(ApiResponse<PlayMiniGameResponse>.Fail(
                    response.ErrorMessage ?? "Failed to play game"));
            }

            _logger.LogInformation("Successfully played mini game {GameId} for user {UserId}, prize: {PrizeType}",
                gameId, userId, response.PrizeType);

            return Ok(ApiResponse<PlayMiniGameResponse>.Ok(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error playing mini game {GameId} for user {UserId}",
                gameId, userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to play mini game"));
        }
    }
}
