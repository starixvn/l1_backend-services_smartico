using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Jackpots.Commands;
using Smartico.BackOffice.Application.Jackpots.DTOs;
using Smartico.BackOffice.Application.Jackpots.Interfaces;
using FluentValidation;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for managing jackpots.
/// </summary>
[ApiController]
[Route("api/jackpots")]
[Produces("application/json")]
public class JackpotsController : ControllerBase
{
    private readonly IJackpotService _jackpotService;
    private readonly ILogger<JackpotsController> _logger;

    public JackpotsController(
        IJackpotService jackpotService,
        ILogger<JackpotsController> logger)
    {
        _jackpotService = jackpotService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new jackpot for the authenticated operator.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(JackpotDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateJackpot(
        [FromBody] CreateJackpotCommand command,
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

            _logger.LogInformation("Creating jackpot for operator {OperatorId}", operatorId);

            var jackpot = await _jackpotService.CreateAsync(command, operatorId);

            return CreatedAtAction(
                nameof(GetJackpotById),
                new { id = jackpot.Id },
                jackpot);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for jackpot creation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating jackpot");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while creating the jackpot."
            });
        }
    }

    /// <summary>
    /// Gets a jackpot by ID for the authenticated operator.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(JackpotDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetJackpotById(
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

            _logger.LogDebug("Getting jackpot {JackpotId} for operator {OperatorId}", id, operatorId);

            var jackpot = await _jackpotService.GetByIdAsync(id, operatorId);

            if (jackpot == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found",
                    Detail = $"Jackpot with ID '{id}' was not found."
                });
            }

            return Ok(jackpot);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the jackpot."
            });
        }
    }

    /// <summary>
    /// Gets all jackpots for the authenticated operator.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<JackpotDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllJackpots(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting all jackpots for operator {OperatorId}", operatorId);

            var jackpots = await _jackpotService.GetAllAsync(operatorId);

            return Ok(jackpots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving jackpots");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving jackpots."
            });
        }
    }

    /// <summary>
    /// Gets all active jackpots for the authenticated operator.
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<JackpotDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetActiveJackpots(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting active jackpots for operator {OperatorId}", operatorId);

            var jackpots = await _jackpotService.GetActiveAsync(operatorId);

            return Ok(jackpots);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active jackpots");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving active jackpots."
            });
        }
    }

    /// <summary>
    /// Updates an existing jackpot for the authenticated operator.
    /// Only allowed when jackpot is in Draft status.
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(JackpotDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateJackpot(
        [FromRoute] string id,
        [FromBody] UpdateJackpotCommand command,
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

            _logger.LogInformation("Updating jackpot {JackpotId} for operator {OperatorId}",
                id, operatorId);

            var jackpot = await _jackpotService.UpdateAsync(id, command, operatorId);

            if (jackpot == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found or cannot be updated",
                    Detail = $"Jackpot with ID '{id}' was not found or is not in draft status."
                });
            }

            return Ok(jackpot);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for jackpot update");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating the jackpot."
            });
        }
    }

    /// <summary>
    /// Activates a jackpot.
    /// Transitions from Draft to Active status.
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ActivateJackpot(
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

            _logger.LogInformation("Activating jackpot {JackpotId} for operator {OperatorId}",
                id, operatorId);

            var result = await _jackpotService.ActivateAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found or cannot be activated",
                    Detail = $"Jackpot with ID '{id}' was not found or is not in draft status."
                });
            }

            return Ok(new { message = "Jackpot activated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while activating the jackpot."
            });
        }
    }

    /// <summary>
    /// Pauses an active jackpot.
    /// </summary>
    [HttpPost("{id}/pause")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PauseJackpot(
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

            _logger.LogInformation("Pausing jackpot {JackpotId} for operator {OperatorId}",
                id, operatorId);

            var result = await _jackpotService.PauseAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found or cannot be paused",
                    Detail = $"Jackpot with ID '{id}' was not found or is not in active status."
                });
            }

            return Ok(new { message = "Jackpot paused successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while pausing the jackpot."
            });
        }
    }

    /// <summary>
    /// Resumes a paused jackpot.
    /// </summary>
    [HttpPost("{id}/resume")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ResumeJackpot(
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

            _logger.LogInformation("Resuming jackpot {JackpotId} for operator {OperatorId}",
                id, operatorId);

            var result = await _jackpotService.ResumeAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found or cannot be resumed",
                    Detail = $"Jackpot with ID '{id}' was not found or is not in paused status."
                });
            }

            return Ok(new { message = "Jackpot resumed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resuming jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while resuming the jackpot."
            });
        }
    }

    /// <summary>
    /// Archives a jackpot.
    /// </summary>
    [HttpPost("{id}/archive")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ArchiveJackpot(
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

            _logger.LogInformation("Archiving jackpot {JackpotId} for operator {OperatorId}",
                id, operatorId);

            var result = await _jackpotService.ArchiveAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found",
                    Detail = $"Jackpot with ID '{id}' was not found."
                });
            }

            return Ok(new { message = "Jackpot archived successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while archiving the jackpot."
            });
        }
    }

    /// <summary>
    /// Deletes a jackpot for the authenticated operator.
    /// Only allowed when jackpot is in Draft status.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteJackpot(
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

            _logger.LogInformation("Deleting jackpot {JackpotId} for operator {OperatorId}",
                id, operatorId);

            var result = await _jackpotService.DeleteAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Jackpot not found or cannot be deleted",
                    Detail = $"Jackpot with ID '{id}' was not found or is not in draft status."
                });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting jackpot {JackpotId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting the jackpot."
            });
        }
    }

    /// <summary>
    /// Extracts the OperatorId from HttpContext.Items.
    /// </summary>
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
