using MediatR;
using Microsoft.AspNetCore.Mvc;
using Smartico.Missions.Application.Features.Tournaments.Queries.GetTournaments;
using Smartico.Missions.Application.Features.Tournaments.Queries.GetLeaderboard;
using Smartico.Missions.Application.Features.Tournaments.Commands.RegisterTournament;
using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for tournament operations.
/// </summary>
[ApiController]
[Route("api/tournaments")]
[Produces("application/json")]
public class TournamentsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<TournamentsController> _logger;

    public TournamentsController(IMediator mediator, ILogger<TournamentsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets all tournaments for a specific user.
    /// </summary>
    /// <param name="userId">User identifier (default: user123 for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of tournaments with user-specific data</returns>
    /// <response code="200">Successfully retrieved tournaments</response>
    /// <response code="400">Invalid user ID</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    [ProducesResponseType(typeof(GetTournamentsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetTournamentsResponse>> GetTournaments(
        [FromQuery] string userId = "user123",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetTournaments called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("GET /api/tournaments - User: {UserId}", userId);

        var query = new GetTournamentsQuery(userId);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation("Returning {Count} tournaments for user {UserId}",
            response.Tournaments.Count, userId);

        return Ok(response);
    }

    /// <summary>
    /// Registers a user for a tournament.
    /// </summary>
    /// <param name="tournamentInstanceId">Tournament instance identifier</param>
    /// <param name="request">Registration request containing user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Registration result with updated tournament data</returns>
    /// <response code="200">Successfully registered for tournament</response>
    /// <response code="400">Registration failed (closed, max players, insufficient funds, etc.)</response>
    /// <response code="403">Tournament is invite-only</response>
    /// <response code="404">Tournament not found</response>
    /// <response code="409">Already registered for this tournament</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{tournamentInstanceId}/register")]
    [ProducesResponseType(typeof(RegisterTournamentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(RegisterTournamentResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(RegisterTournamentResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(RegisterTournamentResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(RegisterTournamentResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<RegisterTournamentResponse>> RegisterTournament(
        int tournamentInstanceId,
        [FromBody] RegisterTournamentRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("POST /api/tournaments/{TournamentInstanceId}/register - User: {UserId}",
            tournamentInstanceId, request.UserId);

        var command = new RegisterTournamentCommand(request.UserId, tournamentInstanceId);
        var response = await _mediator.Send(command, cancellationToken);

        if (!response.Success)
        {
            _logger.LogWarning("Registration failed for user {UserId}, tournament {TournamentInstanceId}: {Status} - {ErrorMessage}",
                request.UserId, tournamentInstanceId, response.Status, response.ErrorMessage);

            return response.Status switch
            {
                TournamentRegistrationStatus.AlreadyRegistered => Conflict(response),
                TournamentRegistrationStatus.RegistrationClosed => BadRequest(response),
                TournamentRegistrationStatus.TournamentFull => BadRequest(response),
                TournamentRegistrationStatus.InsufficientBalance => BadRequest(response),
                TournamentRegistrationStatus.TournamentCancelled => BadRequest(response),
                TournamentRegistrationStatus.SegmentMismatch => BadRequest(response),
                TournamentRegistrationStatus.InviteRequired => Forbid(),
                _ => BadRequest(response)
            };
        }

        _logger.LogInformation("Successfully registered user {UserId} for tournament {TournamentInstanceId}",
            request.UserId, tournamentInstanceId);

        return Ok(response);
    }

    /// <summary>
    /// Gets the leaderboard for a specific tournament.
    /// </summary>
    /// <param name="tournamentInstanceId">Tournament instance identifier</param>
    /// <param name="userId">User identifier (default: user123 for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Leaderboard with participants (hybrid: top 50 + user position if not in top 50)</returns>
    /// <response code="200">Successfully retrieved leaderboard</response>
    /// <response code="400">Invalid parameters</response>
    /// <response code="404">Tournament not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{tournamentInstanceId}/leaderboard")]
    [ProducesResponseType(typeof(GetLeaderboardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetLeaderboardResponse>> GetLeaderboard(
        int tournamentInstanceId,
        [FromQuery] string userId = "user123",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetLeaderboard called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        if (tournamentInstanceId <= 0)
        {
            _logger.LogWarning("GetLeaderboard called with invalid tournamentInstanceId: {TournamentInstanceId}", tournamentInstanceId);
            return BadRequest(new { error = "Tournament instance ID must be greater than 0" });
        }

        _logger.LogInformation("GET /api/tournaments/{TournamentInstanceId}/leaderboard - User: {UserId}",
            tournamentInstanceId, userId);

        var query = new GetLeaderboardQuery(userId, tournamentInstanceId);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation("Returning leaderboard for tournament {TournamentInstanceId} with {Count} participants",
            tournamentInstanceId, response.Participants.Count);

        return Ok(response);
    }
}

/// <summary>
/// Request model for tournament registration.
/// </summary>
/// <param name="UserId">User identifier</param>
public record RegisterTournamentRequest(string UserId);
