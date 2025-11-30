using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.BadgeSeries.Commands;
using Smartico.BackOffice.Application.BadgeSeries.Interfaces;
using Smartico.BackOffice.Application.Badges.DTOs;
using FluentValidation;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for managing badge series (collections).
/// </summary>
[ApiController]
[Route("api/badge-series")]
[Produces("application/json")]
public class BadgeSeriesController : ControllerBase
{
    private readonly IBadgeSeriesService _badgeSeriesService;
    private readonly ILogger<BadgeSeriesController> _logger;

    public BadgeSeriesController(
        IBadgeSeriesService badgeSeriesService,
        ILogger<BadgeSeriesController> logger)
    {
        _badgeSeriesService = badgeSeriesService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new badge series for the authenticated operator.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(BadgeSeriesDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateBadgeSeries(
        [FromBody] CreateBadgeSeriesCommand command,
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

            _logger.LogInformation("Creating badge series for operator {OperatorId}", operatorId);

            var series = await _badgeSeriesService.CreateAsync(command, operatorId);

            return CreatedAtAction(
                nameof(GetBadgeSeriesById),
                new { id = series.Id },
                series);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for badge series creation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating badge series");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while creating the badge series."
            });
        }
    }

    /// <summary>
    /// Gets a badge series by ID with its badges.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BadgeSeriesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBadgeSeriesById(
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

            _logger.LogDebug("Getting badge series {SeriesId} for operator {OperatorId}", id, operatorId);

            var series = await _badgeSeriesService.GetByIdAsync(id, operatorId);

            if (series == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Badge series not found",
                    Detail = $"Badge series with ID '{id}' was not found."
                });
            }

            return Ok(series);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving badge series {SeriesId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the badge series."
            });
        }
    }

    /// <summary>
    /// Gets all badge series for the authenticated operator.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BadgeSeriesDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllBadgeSeries(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting all badge series for operator {OperatorId}", operatorId);

            var seriesList = await _badgeSeriesService.GetAllAsync(operatorId);

            return Ok(seriesList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving badge series");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving badge series."
            });
        }
    }

    /// <summary>
    /// Gets all active badge series for the authenticated operator.
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(IEnumerable<BadgeSeriesDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetActiveBadgeSeries(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting active badge series for operator {OperatorId}", operatorId);

            var seriesList = await _badgeSeriesService.GetActiveAsync(operatorId);

            return Ok(seriesList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active badge series");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving active badge series."
            });
        }
    }

    /// <summary>
    /// Updates an existing badge series for the authenticated operator.
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BadgeSeriesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateBadgeSeries(
        [FromRoute] string id,
        [FromBody] UpdateBadgeSeriesCommand command,
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

            _logger.LogInformation("Updating badge series {SeriesId} for operator {OperatorId}",
                id, operatorId);

            var series = await _badgeSeriesService.UpdateAsync(id, command, operatorId);

            if (series == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Badge series not found or cannot be updated",
                    Detail = $"Badge series with ID '{id}' was not found or is archived."
                });
            }

            return Ok(series);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for badge series update");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating badge series {SeriesId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating the badge series."
            });
        }
    }

    /// <summary>
    /// Publishes (activates) a badge series.
    /// </summary>
    [HttpPost("{id}/publish")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PublishBadgeSeries(
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

            _logger.LogInformation("Publishing badge series {SeriesId} for operator {OperatorId}",
                id, operatorId);

            var result = await _badgeSeriesService.PublishAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Badge series not found or cannot be published",
                    Detail = $"Badge series with ID '{id}' was not found or is not in draft status."
                });
            }

            return Ok(new { message = "Badge series published successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing badge series {SeriesId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while publishing the badge series."
            });
        }
    }

    /// <summary>
    /// Archives a badge series.
    /// </summary>
    [HttpPost("{id}/archive")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ArchiveBadgeSeries(
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

            _logger.LogInformation("Archiving badge series {SeriesId} for operator {OperatorId}",
                id, operatorId);

            var result = await _badgeSeriesService.ArchiveAsync(id, operatorId);

            if (!result)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Badge series not found",
                    Detail = $"Badge series with ID '{id}' was not found."
                });
            }

            return Ok(new { message = "Badge series archived successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error archiving badge series {SeriesId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while archiving the badge series."
            });
        }
    }

    /// <summary>
    /// Deletes a badge series for the authenticated operator.
    /// Only draft series without badges can be deleted.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteBadgeSeries(
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

            _logger.LogInformation("Deleting badge series {SeriesId} for operator {OperatorId}",
                id, operatorId);

            var result = await _badgeSeriesService.DeleteAsync(id, operatorId);

            if (!result)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Badge series cannot be deleted",
                    Detail = $"Badge series with ID '{id}' was not found, is not in draft status, or contains badges."
                });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting badge series {SeriesId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting the badge series."
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
