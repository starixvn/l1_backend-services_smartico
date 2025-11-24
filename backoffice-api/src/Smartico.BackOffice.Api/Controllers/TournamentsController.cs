using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Tournaments.Commands;
using Smartico.BackOffice.Application.Tournaments.DTOs;
using Smartico.BackOffice.Application.Tournaments.Interfaces;
using FluentValidation;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for managing tournaments.
/// </summary>
[ApiController]
[Route("api/tournaments")]
[Produces("application/json")]
public class TournamentsController : ControllerBase
{
    private readonly ITournamentService _tournamentService;
    private readonly ILogger<TournamentsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="TournamentsController"/> class.
    /// </summary>
    /// <param name="tournamentService">The tournament service.</param>
    /// <param name="logger">The logger instance.</param>
    public TournamentsController(
        ITournamentService tournamentService,
        ILogger<TournamentsController> logger)
    {
        _tournamentService = tournamentService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new tournament for the authenticated operator.
    /// </summary>
    /// <param name="command">The tournament creation command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created tournament.</returns>
    /// <response code="201">Tournament created successfully.</response>
    /// <response code="400">Invalid request data or validation failed.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost]
    [ProducesResponseType(typeof(TournamentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateTournament(
        [FromBody] CreateTournamentCommand command,
        CancellationToken cancellationToken)
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

            _logger.LogInformation("Creating tournament for operator {OperatorId}", operatorId);

            var tournament = await _tournamentService.CreateTournamentAsync(
                operatorId,
                command,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetTournamentById),
                new { id = tournament.Id },
                tournament);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for tournament creation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating tournament");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while creating the tournament."
            });
        }
    }

    /// <summary>
    /// Gets a tournament by ID for the authenticated operator.
    /// </summary>
    /// <param name="id">The tournament ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The tournament details.</returns>
    /// <response code="200">Tournament found.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Tournament not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TournamentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetTournamentById(
        [FromRoute] string id,
        CancellationToken cancellationToken)
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

            if (!ObjectId.TryParse(id, out var tournamentId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid tournament ID",
                    Detail = "The provided tournament ID is not a valid ObjectId."
                });
            }

            _logger.LogDebug("Getting tournament {TournamentId} for operator {OperatorId}",
                tournamentId, operatorId);

            var tournament = await _tournamentService.GetTournamentByIdAsync(
                operatorId,
                tournamentId,
                cancellationToken);

            if (tournament == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Tournament not found",
                    Detail = $"Tournament with ID '{id}' was not found."
                });
            }

            return Ok(tournament);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tournament {TournamentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the tournament."
            });
        }
    }

    /// <summary>
    /// Gets all tournaments for the authenticated operator.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of tournaments.</returns>
    /// <response code="200">Tournaments retrieved successfully.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TournamentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllTournaments(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting all tournaments for operator {OperatorId}", operatorId);

            var tournaments = await _tournamentService.GetAllTournamentsAsync(
                operatorId,
                cancellationToken);

            return Ok(tournaments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tournaments");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving tournaments."
            });
        }
    }

    /// <summary>
    /// Updates an existing tournament for the authenticated operator.
    /// </summary>
    /// <param name="id">The tournament ID.</param>
    /// <param name="command">The tournament update command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated tournament.</returns>
    /// <response code="200">Tournament updated successfully.</response>
    /// <response code="400">Invalid request data or validation failed.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Tournament not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TournamentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateTournament(
        [FromRoute] string id,
        [FromBody] CreateTournamentCommand command,
        CancellationToken cancellationToken)
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

            if (!ObjectId.TryParse(id, out var tournamentId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid tournament ID",
                    Detail = "The provided tournament ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Updating tournament {TournamentId} for operator {OperatorId}",
                tournamentId, operatorId);

            var tournament = await _tournamentService.UpdateTournamentAsync(
                operatorId,
                tournamentId,
                command,
                cancellationToken);

            if (tournament == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Tournament not found",
                    Detail = $"Tournament with ID '{id}' was not found."
                });
            }

            return Ok(tournament);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for tournament update");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating tournament {TournamentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating the tournament."
            });
        }
    }

    /// <summary>
    /// Deletes a tournament for the authenticated operator.
    /// </summary>
    /// <param name="id">The tournament ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Tournament deleted successfully.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Tournament not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteTournament(
        [FromRoute] string id,
        CancellationToken cancellationToken)
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

            if (!ObjectId.TryParse(id, out var tournamentId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid tournament ID",
                    Detail = "The provided tournament ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Deleting tournament {TournamentId} for operator {OperatorId}",
                tournamentId, operatorId);

            await _tournamentService.DeleteTournamentAsync(
                operatorId,
                tournamentId,
                cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting tournament {TournamentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting the tournament."
            });
        }
    }

    /// <summary>
    /// Extracts the OperatorId from HttpContext.Items.
    /// </summary>
    /// <returns>The OperatorId or ObjectId.Empty if not found.</returns>
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
