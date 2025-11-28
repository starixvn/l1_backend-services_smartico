using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Bonuses.Commands;
using Smartico.BackOffice.Application.Bonuses.DTOs;
using Smartico.BackOffice.Application.Bonuses.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using FluentValidation;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for managing bonuses and global bonus limits.
/// </summary>
[ApiController]
[Route("api/bonuses")]
[Produces("application/json")]
public class BonusesController : ControllerBase
{
    private readonly IBonusService _bonusService;
    private readonly IOperatorBonusLimitsRepository _limitsRepository;
    private readonly ILogger<BonusesController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="BonusesController"/> class.
    /// </summary>
    public BonusesController(
        IBonusService bonusService,
        IOperatorBonusLimitsRepository limitsRepository,
        ILogger<BonusesController> logger)
    {
        _bonusService = bonusService;
        _limitsRepository = limitsRepository;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new bonus for the authenticated operator.
    /// </summary>
    /// <param name="command">The bonus creation command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created bonus.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(BonusDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateBonus(
        [FromBody] CreateBonusCommand command,
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

            _logger.LogInformation("Creating bonus for operator {OperatorId}", operatorId);

            var bonus = await _bonusService.CreateBonusAsync(
                operatorId,
                command,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetBonusById),
                new { id = bonus.Id },
                bonus);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for bonus creation");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bonus");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while creating the bonus."
            });
        }
    }

    /// <summary>
    /// Gets a bonus by ID for the authenticated operator.
    /// </summary>
    /// <param name="id">The bonus ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The bonus details.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BonusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBonusById(
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

            if (!ObjectId.TryParse(id, out var bonusId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid bonus ID",
                    Detail = "The provided bonus ID is not a valid ObjectId."
                });
            }

            _logger.LogDebug("Getting bonus {BonusId} for operator {OperatorId}",
                bonusId, operatorId);

            var bonus = await _bonusService.GetBonusByIdAsync(
                operatorId,
                bonusId,
                cancellationToken);

            if (bonus == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Bonus not found",
                    Detail = $"Bonus with ID '{id}' was not found."
                });
            }

            return Ok(bonus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving bonus {BonusId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving the bonus."
            });
        }
    }

    /// <summary>
    /// Gets all bonuses for the authenticated operator.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of bonuses.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BonusDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllBonuses(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting all bonuses for operator {OperatorId}", operatorId);

            var bonuses = await _bonusService.GetAllBonusesAsync(
                operatorId,
                cancellationToken);

            return Ok(bonuses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving bonuses");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving bonuses."
            });
        }
    }

    /// <summary>
    /// Updates an existing bonus for the authenticated operator.
    /// </summary>
    /// <param name="id">The bonus ID.</param>
    /// <param name="command">The bonus update command.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated bonus.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BonusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateBonus(
        [FromRoute] string id,
        [FromBody] CreateBonusCommand command,
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

            if (!ObjectId.TryParse(id, out var bonusId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid bonus ID",
                    Detail = "The provided bonus ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Updating bonus {BonusId} for operator {OperatorId}",
                bonusId, operatorId);

            var bonus = await _bonusService.UpdateBonusAsync(
                operatorId,
                bonusId,
                command,
                cancellationToken);

            if (bonus == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Bonus not found",
                    Detail = $"Bonus with ID '{id}' was not found."
                });
            }

            return Ok(bonus);
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validation failed for bonus update");
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation failed",
                Detail = string.Join("; ", ex.Errors.Select(e => e.ErrorMessage))
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating bonus {BonusId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating the bonus."
            });
        }
    }

    /// <summary>
    /// Deletes a bonus for the authenticated operator.
    /// </summary>
    /// <param name="id">The bonus ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteBonus(
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

            if (!ObjectId.TryParse(id, out var bonusId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid bonus ID",
                    Detail = "The provided bonus ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Deleting bonus {BonusId} for operator {OperatorId}",
                bonusId, operatorId);

            await _bonusService.DeleteBonusAsync(
                operatorId,
                bonusId,
                cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting bonus {BonusId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting the bonus."
            });
        }
    }

    /// <summary>
    /// Activates a bonus (changes status from Draft to Active).
    /// </summary>
    /// <param name="id">The bonus ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The activated bonus.</returns>
    [HttpPost("{id}/activate")]
    [ProducesResponseType(typeof(BonusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ActivateBonus(
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

            if (!ObjectId.TryParse(id, out var bonusId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid bonus ID",
                    Detail = "The provided bonus ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Activating bonus {BonusId} for operator {OperatorId}",
                bonusId, operatorId);

            var bonus = await _bonusService.ActivateBonusAsync(
                operatorId,
                bonusId,
                cancellationToken);

            if (bonus == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Bonus not found",
                    Detail = $"Bonus with ID '{id}' was not found."
                });
            }

            return Ok(bonus);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot activate bonus {BonusId}", id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid operation",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error activating bonus {BonusId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while activating the bonus."
            });
        }
    }

    /// <summary>
    /// Pauses an active bonus.
    /// </summary>
    /// <param name="id">The bonus ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The paused bonus.</returns>
    [HttpPost("{id}/pause")]
    [ProducesResponseType(typeof(BonusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PauseBonus(
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

            if (!ObjectId.TryParse(id, out var bonusId))
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Invalid bonus ID",
                    Detail = "The provided bonus ID is not a valid ObjectId."
                });
            }

            _logger.LogInformation("Pausing bonus {BonusId} for operator {OperatorId}",
                bonusId, operatorId);

            var bonus = await _bonusService.PauseBonusAsync(
                operatorId,
                bonusId,
                cancellationToken);

            if (bonus == null)
            {
                return NotFound(new ProblemDetails
                {
                    Status = StatusCodes.Status404NotFound,
                    Title = "Bonus not found",
                    Detail = $"Bonus with ID '{id}' was not found."
                });
            }

            return Ok(bonus);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cannot pause bonus {BonusId}", id);
            return BadRequest(new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Invalid operation",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error pausing bonus {BonusId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while pausing the bonus."
            });
        }
    }

    // ==================== Global Operator Limits ====================

    /// <summary>
    /// Gets the global bonus limits for the authenticated operator.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The operator's global bonus limits.</returns>
    [HttpGet("limits")]
    [ProducesResponseType(typeof(OperatorBonusLimitsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetGlobalLimits(CancellationToken cancellationToken)
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

            _logger.LogDebug("Getting global bonus limits for operator {OperatorId}", operatorId);

            var limits = await _limitsRepository.GetByOperatorIdAsync(operatorId, cancellationToken);

            // Return empty limits if not configured
            var dto = limits != null ? MapToDto(limits) : new OperatorBonusLimitsDto { Currency = "USD" };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving global bonus limits");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving global bonus limits."
            });
        }
    }

    /// <summary>
    /// Updates the global bonus limits for the authenticated operator.
    /// </summary>
    /// <param name="dto">The limits to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated limits.</returns>
    [HttpPut("limits")]
    [ProducesResponseType(typeof(OperatorBonusLimitsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateGlobalLimits(
        [FromBody] OperatorBonusLimitsDto dto,
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

            // Validate limits
            var validationErrors = ValidateLimits(dto);
            if (validationErrors.Count > 0)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Validation failed",
                    Detail = string.Join("; ", validationErrors)
                });
            }

            _logger.LogInformation("Updating global bonus limits for operator {OperatorId}", operatorId);

            var limits = new OperatorBonusLimits
            {
                OperatorId = operatorId,
                MaxDailyBonusValuePerPlayer = dto.MaxDailyBonusValuePerPlayer,
                MaxWeeklyBonusValuePerPlayer = dto.MaxWeeklyBonusValuePerPlayer,
                MaxMonthlyBonusValuePerPlayer = dto.MaxMonthlyBonusValuePerPlayer,
                MaxActiveBonusesPerPlayer = dto.MaxActiveBonusesPerPlayer,
                Currency = dto.Currency ?? "USD"
            };

            var updated = await _limitsRepository.UpsertAsync(limits, cancellationToken);

            return Ok(MapToDto(updated));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating global bonus limits");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while updating global bonus limits."
            });
        }
    }

    /// <summary>
    /// Deletes the global bonus limits for the authenticated operator (resets to unlimited).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content.</returns>
    [HttpDelete("limits")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteGlobalLimits(CancellationToken cancellationToken)
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

            _logger.LogInformation("Deleting global bonus limits for operator {OperatorId}", operatorId);

            await _limitsRepository.DeleteAsync(operatorId, cancellationToken);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting global bonus limits");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while deleting global bonus limits."
            });
        }
    }

    // ==================== Helper Methods ====================

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

    /// <summary>
    /// Maps OperatorBonusLimits entity to DTO.
    /// </summary>
    private static OperatorBonusLimitsDto MapToDto(OperatorBonusLimits limits)
    {
        return new OperatorBonusLimitsDto
        {
            MaxDailyBonusValuePerPlayer = limits.MaxDailyBonusValuePerPlayer,
            MaxWeeklyBonusValuePerPlayer = limits.MaxWeeklyBonusValuePerPlayer,
            MaxMonthlyBonusValuePerPlayer = limits.MaxMonthlyBonusValuePerPlayer,
            MaxActiveBonusesPerPlayer = limits.MaxActiveBonusesPerPlayer,
            Currency = limits.Currency,
            CreatedAt = limits.CreatedAt,
            UpdatedAt = limits.UpdatedAt
        };
    }

    /// <summary>
    /// Validates the limits DTO.
    /// </summary>
    private static List<string> ValidateLimits(OperatorBonusLimitsDto dto)
    {
        var errors = new List<string>();

        if (dto.MaxDailyBonusValuePerPlayer.HasValue && dto.MaxDailyBonusValuePerPlayer.Value <= 0)
        {
            errors.Add("Max daily bonus value must be greater than 0.");
        }

        if (dto.MaxWeeklyBonusValuePerPlayer.HasValue && dto.MaxWeeklyBonusValuePerPlayer.Value <= 0)
        {
            errors.Add("Max weekly bonus value must be greater than 0.");
        }

        if (dto.MaxMonthlyBonusValuePerPlayer.HasValue && dto.MaxMonthlyBonusValuePerPlayer.Value <= 0)
        {
            errors.Add("Max monthly bonus value must be greater than 0.");
        }

        if (dto.MaxActiveBonusesPerPlayer.HasValue && dto.MaxActiveBonusesPerPlayer.Value <= 0)
        {
            errors.Add("Max active bonuses must be greater than 0.");
        }

        // Validate logical hierarchy: daily <= weekly <= monthly
        if (dto.MaxDailyBonusValuePerPlayer.HasValue && dto.MaxWeeklyBonusValuePerPlayer.HasValue
            && dto.MaxDailyBonusValuePerPlayer.Value > dto.MaxWeeklyBonusValuePerPlayer.Value)
        {
            errors.Add("Max daily bonus value cannot exceed max weekly bonus value.");
        }

        if (dto.MaxWeeklyBonusValuePerPlayer.HasValue && dto.MaxMonthlyBonusValuePerPlayer.HasValue
            && dto.MaxWeeklyBonusValuePerPlayer.Value > dto.MaxMonthlyBonusValuePerPlayer.Value)
        {
            errors.Add("Max weekly bonus value cannot exceed max monthly bonus value.");
        }

        if (string.IsNullOrWhiteSpace(dto.Currency) || dto.Currency.Length != 3)
        {
            errors.Add("Currency must be a 3-letter code (e.g., USD, EUR).");
        }

        return errors;
    }
}

/// <summary>
/// DTO for operator global bonus limits.
/// </summary>
public class OperatorBonusLimitsDto
{
    /// <summary>
    /// Maximum total bonus value a player can receive per day across all bonuses.
    /// Null means unlimited.
    /// </summary>
    public decimal? MaxDailyBonusValuePerPlayer { get; set; }

    /// <summary>
    /// Maximum total bonus value a player can receive per week across all bonuses.
    /// Null means unlimited.
    /// </summary>
    public decimal? MaxWeeklyBonusValuePerPlayer { get; set; }

    /// <summary>
    /// Maximum total bonus value a player can receive per month across all bonuses.
    /// Null means unlimited.
    /// </summary>
    public decimal? MaxMonthlyBonusValuePerPlayer { get; set; }

    /// <summary>
    /// Maximum number of active bonuses a player can have at once.
    /// Null means unlimited.
    /// </summary>
    public int? MaxActiveBonusesPerPlayer { get; set; }

    /// <summary>
    /// Currency for value-based limits (e.g., USD, EUR).
    /// </summary>
    public string Currency { get; set; } = "USD";

    /// <summary>
    /// Timestamp when the limits were created (UTC).
    /// </summary>
    public DateTime? CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the limits were last updated (UTC).
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}
