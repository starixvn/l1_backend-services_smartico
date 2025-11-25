using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Application.Missions.DTOs;
using Smartico.BackOffice.Application.Missions.Interfaces;
using FluentValidation;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for managing missions.
/// </summary>
[ApiController]
[Route("api/missions")]
[Produces("application/json")]
public class MissionsController : ControllerBase
{
    private readonly IMissionService _missionService;
    private readonly PublishMissionCommandHandler _publishHandler;
    private readonly ILogger<MissionsController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="MissionsController"/> class.
    /// </summary>
    /// <param name="missionService">The mission service.</param>
    /// <param name="publishHandler">The publish mission handler.</param>
    /// <param name="logger">The logger instance.</param>
    public MissionsController(
        IMissionService missionService,
        PublishMissionCommandHandler publishHandler,
        ILogger<MissionsController> logger)
    {
        _missionService = missionService;
        _publishHandler = publishHandler;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new mission for the authenticated operator.
    /// </summary>
    /// <param name="command">The mission creation command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created mission.</returns>
    /// <response code="201">Mission created successfully.</response>
    /// <response code="400">Invalid request data or validation failed.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost]
    [ProducesResponseType(typeof(MissionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateMission(
        [FromBody] CreateMissionCommand command,
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

            _logger.LogInformation("Creating mission for operator {OperatorId}", operatorId);

            var mission = await _missionService.CreateMissionAsync(
                operatorId,
                command,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetMissionById),
                new { id = mission.Id },
                mission);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for mission creation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating mission");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while creating the mission."
            });
        }
    }

    /// <summary>
    /// Gets a mission by ID for the authenticated operator.
    /// </summary>
    /// <param name="id">The mission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The mission details.</returns>
    /// <response code="200">Mission found.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Mission not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMissionById(
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

            if (!ObjectId.TryParse(id, out var missionId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid mission ID",
                    Detail = "The provided mission ID is not a valid ObjectId."
                });
            }

            _logger.LogDebug("Getting mission {MissionId} for operator {OperatorId}",
                missionId, operatorId);

            var mission = await _missionService.GetMissionByIdAsync(
                operatorId,
                missionId,
                cancellationToken);

            if (mission == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Mission not found",
                    Detail = $"Mission with ID '{id}' was not found."
                });
            }

            return Ok(mission);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving mission {MissionId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the mission."
            });
        }
    }

    /// <summary>
    /// Gets all missions for the authenticated operator.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of missions.</returns>
    /// <response code="200">Missions retrieved successfully.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MissionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllMissions(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting all missions for operator {OperatorId}", operatorId);

            var missions = await _missionService.GetAllMissionsAsync(
                operatorId,
                cancellationToken);

            return Ok(missions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving missions");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving missions."
            });
        }
    }

    /// <summary>
    /// Updates an existing mission for the authenticated operator.
    /// </summary>
    /// <param name="id">The mission ID.</param>
    /// <param name="command">The mission update command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated mission.</returns>
    /// <response code="200">Mission updated successfully.</response>
    /// <response code="400">Invalid request data or validation failed.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Mission not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MissionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateMission(
        [FromRoute] string id,
        [FromBody] CreateMissionCommand command,
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

            if (!ObjectId.TryParse(id, out var missionId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid mission ID",
                    Detail = "The provided mission ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Updating mission {MissionId} for operator {OperatorId}",
                missionId, operatorId);

            var mission = await _missionService.UpdateMissionAsync(
                operatorId,
                missionId,
                command,
                cancellationToken);

            if (mission == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Mission not found",
                    Detail = $"Mission with ID '{id}' was not found."
                });
            }

            return Ok(mission);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for mission update");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating mission {MissionId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating the mission."
            });
        }
    }

    /// <summary>
    /// Deletes a mission for the authenticated operator.
    /// </summary>
    /// <param name="id">The mission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Mission deleted successfully.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Mission not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteMission(
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

            if (!ObjectId.TryParse(id, out var missionId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid mission ID",
                    Detail = "The provided mission ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Deleting mission {MissionId} for operator {OperatorId}",
                missionId, operatorId);

            await _missionService.DeleteMissionAsync(
                operatorId,
                missionId,
                cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting mission {MissionId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting the mission."
            });
        }
    }

    /// <summary>
    /// Publishes a draft mission, making it active for players.
    /// </summary>
    /// <param name="id">The mission ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    /// <response code="204">Mission published successfully.</response>
    /// <response code="400">Invalid request or validation failed.</response>
    /// <response code="401">Operator context not found.</response>
    /// <response code="404">Mission not found.</response>
    /// <response code="500">Internal server error.</response>
    [HttpPost("{id}/publish")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PublishMission(
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

            _logger.LogInformation("Publishing mission {MissionId} for operator {OperatorId}",
                id, operatorId);

            await _publishHandler.ExecuteAsync(operatorId, id, cancellationToken);

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for mission publish");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing mission {MissionId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while publishing the mission."
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
