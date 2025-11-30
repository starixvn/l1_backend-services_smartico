using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.LevelSystems.Commands;
using Smartico.BackOffice.Application.LevelSystems.DTOs;
using Smartico.BackOffice.Application.LevelSystems.Interfaces;
using FluentValidation;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for managing player level systems.
/// </summary>
[ApiController]
[Route("api/level-systems")]
[Produces("application/json")]
public class LevelSystemsController : ControllerBase
{
    private readonly ILevelSystemService _levelSystemService;
    private readonly ILogger<LevelSystemsController> _logger;

    public LevelSystemsController(
        ILevelSystemService levelSystemService,
        ILogger<LevelSystemsController> logger)
    {
        _levelSystemService = levelSystemService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new level system for the authenticated operator.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LevelSystemDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateLevelSystem(
        [FromBody] CreateLevelSystemCommand command,
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

            _logger.LogInformation("Creating level system for operator {OperatorId}", operatorId);

            var levelSystem = await _levelSystemService.CreateLevelSystemAsync(
                operatorId,
                command,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetLevelSystemById),
                new { id = levelSystem.Id },
                levelSystem);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for level system creation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating level system");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while creating the level system."
            });
        }
    }

    /// <summary>
    /// Gets a level system by ID for the authenticated operator.
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(LevelSystemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetLevelSystemById(
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

            if (!ObjectId.TryParse(id, out var levelSystemId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid level system ID",
                    Detail = "The provided level system ID is not a valid ObjectId."
                });
            }

            _logger.LogDebug("Getting level system {LevelSystemId} for operator {OperatorId}",
                levelSystemId, operatorId);

            var levelSystem = await _levelSystemService.GetLevelSystemByIdAsync(
                operatorId,
                levelSystemId,
                cancellationToken);

            if (levelSystem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Level system not found",
                    Detail = $"Level system with ID '{id}' was not found."
                });
            }

            return Ok(levelSystem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving level system {LevelSystemId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the level system."
            });
        }
    }

    /// <summary>
    /// Gets all level systems for the authenticated operator.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LevelSystemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllLevelSystems(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting all level systems for operator {OperatorId}", operatorId);

            var levelSystems = await _levelSystemService.GetAllLevelSystemsAsync(
                operatorId,
                cancellationToken);

            return Ok(levelSystems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving level systems");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving level systems."
            });
        }
    }

    /// <summary>
    /// Gets the active level system for the authenticated operator.
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(LevelSystemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetActiveLevelSystem(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting active level system for operator {OperatorId}", operatorId);

            var levelSystem = await _levelSystemService.GetActiveLevelSystemAsync(
                operatorId,
                cancellationToken);

            if (levelSystem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "No active level system",
                    Detail = "No active level system found for this operator."
                });
            }

            return Ok(levelSystem);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active level system");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the active level system."
            });
        }
    }

    /// <summary>
    /// Updates an existing level system for the authenticated operator.
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LevelSystemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateLevelSystem(
        [FromRoute] string id,
        [FromBody] CreateLevelSystemCommand command,
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

            if (!ObjectId.TryParse(id, out var levelSystemId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid level system ID",
                    Detail = "The provided level system ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Updating level system {LevelSystemId} for operator {OperatorId}",
                levelSystemId, operatorId);

            var levelSystem = await _levelSystemService.UpdateLevelSystemAsync(
                operatorId,
                levelSystemId,
                command,
                cancellationToken);

            if (levelSystem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Level system not found",
                    Detail = $"Level system with ID '{id}' was not found."
                });
            }

            return Ok(levelSystem);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for level system update");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating level system {LevelSystemId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating the level system."
            });
        }
    }

    /// <summary>
    /// Deletes a level system for the authenticated operator.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteLevelSystem(
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

            if (!ObjectId.TryParse(id, out var levelSystemId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid level system ID",
                    Detail = "The provided level system ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Deleting level system {LevelSystemId} for operator {OperatorId}",
                levelSystemId, operatorId);

            await _levelSystemService.DeleteLevelSystemAsync(
                operatorId,
                levelSystemId,
                cancellationToken);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot delete level system {LevelSystemId}", id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid operation",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting level system {LevelSystemId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting the level system."
            });
        }
    }

    /// <summary>
    /// Activates a level system (changes status from Draft/Paused to Active).
    /// Only one level system can be active at a time.
    /// </summary>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(LevelSystemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ActivateLevelSystem(
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

            if (!ObjectId.TryParse(id, out var levelSystemId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid level system ID",
                    Detail = "The provided level system ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Activating level system {LevelSystemId} for operator {OperatorId}",
                levelSystemId, operatorId);

            var levelSystem = await _levelSystemService.ActivateLevelSystemAsync(
                operatorId,
                levelSystemId,
                cancellationToken);

            if (levelSystem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Level system not found",
                    Detail = $"Level system with ID '{id}' was not found."
                });
            }

            return Ok(levelSystem);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot activate level system {LevelSystemId}", id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid operation",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating level system {LevelSystemId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while activating the level system."
            });
        }
    }

    /// <summary>
    /// Pauses an active level system.
    /// </summary>
    [HttpPost("{id}/pause")]
    [ProducesResponseType(typeof(LevelSystemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PauseLevelSystem(
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

            if (!ObjectId.TryParse(id, out var levelSystemId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid level system ID",
                    Detail = "The provided level system ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Pausing level system {LevelSystemId} for operator {OperatorId}",
                levelSystemId, operatorId);

            var levelSystem = await _levelSystemService.PauseLevelSystemAsync(
                operatorId,
                levelSystemId,
                cancellationToken);

            if (levelSystem == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Level system not found",
                    Detail = $"Level system with ID '{id}' was not found."
                });
            }

            return Ok(levelSystem);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot pause level system {LevelSystemId}", id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid operation",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing level system {LevelSystemId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while pausing the level system."
            });
        }
    }

    /// <summary>
    /// Gets a preview of all levels with XP thresholds for a level system.
    /// </summary>
    [HttpGet("{id}/preview")]
    [ProducesResponseType(typeof(IEnumerable<LevelPreviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetLevelPreview(
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

            if (!ObjectId.TryParse(id, out var levelSystemId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid level system ID",
                    Detail = "The provided level system ID is not a valid ObjectId."
                });
            }

            _logger.LogDebug("Getting level preview for {LevelSystemId}", levelSystemId);

            var preview = await _levelSystemService.GetLevelPreviewAsync(
                operatorId,
                levelSystemId,
                cancellationToken);

            if (preview.Count == 0)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Level system not found",
                    Detail = $"Level system with ID '{id}' was not found."
                });
            }

            return Ok(preview);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting level preview for {LevelSystemId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving level preview."
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
