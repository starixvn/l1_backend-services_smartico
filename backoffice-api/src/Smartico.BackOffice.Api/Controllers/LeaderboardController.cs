using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Leaderboard.DTOs;
using Smartico.BackOffice.Application.Leaderboard.Interfaces;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for tournament leaderboards.
/// </summary>
[ApiController]
[Route("api/tournaments/{tournamentId}/leaderboard")]
[Produces("application/json")]
public class LeaderboardController : ControllerBase
{
    private readonly ILeaderboardService _leaderboardService;
    private readonly ILogger<LeaderboardController> _logger;

    public LeaderboardController(
        ILeaderboardService leaderboardService,
        ILogger<LeaderboardController> logger)
    {
        _leaderboardService = leaderboardService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the leaderboard for a tournament.
    /// </summary>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="limit">Maximum number of entries to return (default: 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of leaderboard entries.</returns>
    /// <response code="200">Leaderboard retrieved successfully.</response>
    /// <response code="400">Invalid tournament ID.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LeaderboardEntryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetLeaderboard(
        [FromRoute] string tournamentId,
        [FromQuery] int limit = 100,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var operatorId = GetOperatorId();
            if (operatorId == ObjectId.Empty)
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "Operator context not found",
                    Detail = "Unable to determine operator context from request."
                });
            }

            if (!ObjectId.TryParse(tournamentId, out var tournamentObjectId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid tournament ID",
                    Detail = "The provided tournament ID is not a valid ObjectId."
                });
            }

            if (limit < 1 || limit > 1000)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid limit",
                    Detail = "Limit must be between 1 and 1000."
                });
            }

            _logger.LogDebug(
                "Getting leaderboard for tournament {TournamentId}, limit {Limit}",
                tournamentId,
                limit);

            var leaderboard = await _leaderboardService.GetLeaderboardAsync(
                operatorId,
                tournamentObjectId,
                limit,
                cancellationToken);

            return Ok(leaderboard);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving leaderboard for tournament {TournamentId}", tournamentId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the leaderboard."
            });
        }
    }

    /// <summary>
    /// Gets a specific player's position on the leaderboard.
    /// </summary>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="playerId">The player ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The player's leaderboard entry.</returns>
    /// <response code="200">Player position found.</response>
    /// <response code="400">Invalid tournament ID.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Player not found on leaderboard.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("players/{playerId}")]
    [ProducesResponseType(typeof(LeaderboardEntryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPlayerPosition(
        [FromRoute] string tournamentId,
        [FromRoute] string playerId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var operatorId = GetOperatorId();
            if (operatorId == ObjectId.Empty)
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "Operator context not found",
                    Detail = "Unable to determine operator context from request."
                });
            }

            if (!ObjectId.TryParse(tournamentId, out var tournamentObjectId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid tournament ID",
                    Detail = "The provided tournament ID is not a valid ObjectId."
                });
            }

            _logger.LogDebug(
                "Getting player {PlayerId} position for tournament {TournamentId}",
                playerId,
                tournamentId);

            var entry = await _leaderboardService.GetPlayerPositionAsync(
                operatorId,
                tournamentObjectId,
                playerId,
                cancellationToken);

            if (entry == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Player not found",
                    Detail = $"Player '{playerId}' is not on the leaderboard."
                });
            }

            return Ok(entry);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving player {PlayerId} position for tournament {TournamentId}",
                playerId,
                tournamentId);

            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the player position."
            });
        }
    }

    /// <summary>
    /// Generates mock leaderboard data for demo purposes.
    /// FOR DEVELOPMENT/DEMO ONLY - Remove in production.
    /// </summary>
    /// <param name="tournamentId">The tournament ID.</param>
    /// <param name="entryCount">Number of entries to generate (default: 50).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of entries created.</returns>
    /// <response code="200">Mock data generated successfully.</response>
    /// <response code="400">Invalid tournament ID.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("mock")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GenerateMockLeaderboard(
        [FromRoute] string tournamentId,
        [FromQuery] int entryCount = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var operatorId = GetOperatorId();
            if (operatorId == ObjectId.Empty)
            {
                return Unauthorized(new ProblemDetails
                {
                    Status = StatusCodes.Status401Unauthorized,
                    Title = "Operator context not found",
                    Detail = "Unable to determine operator context from request."
                });
            }

            if (!ObjectId.TryParse(tournamentId, out var tournamentObjectId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid tournament ID",
                    Detail = "The provided tournament ID is not a valid ObjectId."
                });
            }

            if (entryCount < 1 || entryCount > 1000)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid entry count",
                    Detail = "Entry count must be between 1 and 1000."
                });
            }

            _logger.LogInformation(
                "Generating {EntryCount} mock leaderboard entries for tournament {TournamentId}",
                entryCount,
                tournamentId);

            var count = await _leaderboardService.GenerateMockLeaderboardAsync(
                operatorId,
                tournamentObjectId,
                entryCount,
                cancellationToken);

            return Ok(new { entriesCreated = count });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error generating mock leaderboard for tournament {TournamentId}",
                tournamentId);

            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while generating mock leaderboard data."
            });
        }
    }

    private ObjectId GetOperatorId()
    {
        if (HttpContext.Items.TryGetValue("OperatorId", out var operatorIdObj)
            && operatorIdObj is ObjectId operatorId)
        {
            return operatorId;
        }

        return ObjectId.Empty;
    }
}
