using MediatR;
using Microsoft.AspNetCore.Mvc;
using Smartico.Missions.Application.Features.Jackpots.Queries.GetJackpots;
using Smartico.Missions.Application.Features.Jackpots.Queries.GetWinners;
using Smartico.Missions.Application.Features.Jackpots.Commands.OptIn;
using Smartico.Missions.Application.Features.Jackpots.Commands.OptOut;
using Smartico.Missions.Domain.Enums;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for jackpot operations.
/// </summary>
[ApiController]
[Route("api/jackpots")]
[Produces("application/json")]
public class JackpotsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<JackpotsController> _logger;

    public JackpotsController(IMediator mediator, ILogger<JackpotsController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets all active jackpots with user opt-in status.
    /// </summary>
    /// <param name="userId">User identifier (default: user123 for demo)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of active jackpots with pool amounts, temperatures, and opt-in status</returns>
    /// <response code="200">Successfully retrieved jackpots</response>
    /// <response code="400">Invalid user ID</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    [ProducesResponseType(typeof(GetJackpotsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetJackpotsResponse>> GetJackpots(
        [FromQuery] string userId = "user123",
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetJackpots called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation("GET /api/jackpots - User: {UserId}", userId);

        var query = new GetJackpotsQuery(userId);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation(
            "Returning {JackpotCount} jackpots for user {UserId}",
            response.Jackpots.Count,
            userId
        );

        return Ok(response);
    }

    /// <summary>
    /// Gets recent jackpot winners with optional type filtering.
    /// Returns winners from the last 30 days.
    /// </summary>
    /// <param name="userId">User identifier (default: user123 for demo)</param>
    /// <param name="type">Optional filter by jackpot type (1=MultiUser, 2=Personal)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of jackpot winners with positions, prizes, and masked usernames</returns>
    /// <response code="200">Successfully retrieved winners</response>
    /// <response code="400">Invalid parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("winners")]
    [ProducesResponseType(typeof(GetJackpotWinnersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GetJackpotWinnersResponse>> GetWinners(
        [FromQuery] string userId = "user123",
        [FromQuery] JackpotType? type = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            _logger.LogWarning("GetWinners called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation(
            "GET /api/jackpots/winners - User: {UserId}, Type: {FilterType}",
            userId,
            type?.ToString() ?? "All"
        );

        var query = new GetJackpotWinnersQuery(userId, type);
        var response = await _mediator.Send(query, cancellationToken);

        _logger.LogInformation(
            "Returning {WinnerCount} jackpot winners for user {UserId}",
            response.Winners.Count,
            userId
        );

        return Ok(response);
    }

    /// <summary>
    /// Opts a user into a jackpot.
    /// User becomes eligible for prizes immediately.
    /// </summary>
    /// <param name="templateId">Jackpot template ID</param>
    /// <param name="request">Request body containing user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message and updated jackpot details</returns>
    /// <response code="200">Successfully opted in to jackpot</response>
    /// <response code="400">Invalid request parameters</response>
    /// <response code="404">Jackpot not found</response>
    /// <response code="409">User already opted in</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{templateId}/opt-in")]
    [ProducesResponseType(typeof(OptInJackpotResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OptInJackpotResponse>> OptIn(
        [FromRoute] int templateId,
        [FromBody] OptInRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            _logger.LogWarning("OptIn called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation(
            "POST /api/jackpots/{TemplateId}/opt-in - User: {UserId}",
            templateId,
            request.UserId
        );

        var command = new OptInJackpotCommand(request.UserId, templateId);

        try
        {
            var response = await _mediator.Send(command, cancellationToken);

            _logger.LogInformation(
                "User {UserId} successfully opted in to jackpot {TemplateId}",
                request.UserId,
                templateId
            );

            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning("Jackpot {TemplateId} not found", templateId);
            return NotFound(new { error = $"Jackpot {templateId} not found" });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("already opted in"))
        {
            _logger.LogWarning(
                "User {UserId} already opted in to jackpot {TemplateId}",
                request.UserId,
                templateId
            );
            return Conflict(new { error = $"User {request.UserId} already opted in to jackpot {templateId}" });
        }
    }

    /// <summary>
    /// Opts a user out of a jackpot.
    /// User stops contributing and is no longer eligible for prizes.
    /// </summary>
    /// <param name="templateId">Jackpot template ID</param>
    /// <param name="request">Request body containing user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success message and updated jackpot details</returns>
    /// <response code="200">Successfully opted out of jackpot</response>
    /// <response code="400">Invalid request parameters</response>
    /// <response code="404">Jackpot not found</response>
    /// <response code="409">User not opted in</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("{templateId}/opt-out")]
    [ProducesResponseType(typeof(OptOutJackpotResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<OptOutJackpotResponse>> OptOut(
        [FromRoute] int templateId,
        [FromBody] OptOutRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
        {
            _logger.LogWarning("OptOut called with empty userId");
            return BadRequest(new { error = "User ID is required" });
        }

        _logger.LogInformation(
            "POST /api/jackpots/{TemplateId}/opt-out - User: {UserId}",
            templateId,
            request.UserId
        );

        var command = new OptOutJackpotCommand(request.UserId, templateId);

        try
        {
            var response = await _mediator.Send(command, cancellationToken);

            _logger.LogInformation(
                "User {UserId} successfully opted out of jackpot {TemplateId}",
                request.UserId,
                templateId
            );

            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            _logger.LogWarning("Jackpot {TemplateId} not found", templateId);
            return NotFound(new { error = $"Jackpot {templateId} not found" });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not opted in"))
        {
            _logger.LogWarning(
                "User {UserId} not opted in to jackpot {TemplateId}",
                request.UserId,
                templateId
            );
            return Conflict(new { error = $"User {request.UserId} not opted in to jackpot {templateId}" });
        }
    }
}

/// <summary>
/// Request to opt-in to a jackpot.
/// </summary>
/// <param name="UserId">User identifier</param>
public record OptInRequest(string UserId);

/// <summary>
/// Request to opt-out from a jackpot.
/// </summary>
/// <param name="UserId">User identifier</param>
public record OptOutRequest(string UserId);
