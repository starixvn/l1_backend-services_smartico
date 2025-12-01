using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Demo.DTOs;
using Smartico.BackOffice.Application.Demo.Interfaces;

namespace Smartico.BackOffice.Api.Controllers;

/// <summary>
/// API controller for demo scenario setup.
/// Provides endpoints to quickly set up gamification features for demos or new operator onboarding.
/// </summary>
[ApiController]
[Route("api/demo")]
[Produces("application/json")]
[Tags("Demo Setup")]
public class DemoController : ControllerBase
{
    private readonly IDemoScenarioService _demoService;
    private readonly ILogger<DemoController> _logger;

    public DemoController(
        IDemoScenarioService demoService,
        ILogger<DemoController> logger)
    {
        _demoService = demoService;
        _logger = logger;
    }

    /// <summary>
    /// Gets all available demo scenarios.
    /// </summary>
    /// <remarks>
    /// Returns a list of all demo scenarios that can be set up, including:
    /// - Mission scenarios (New Game Launch, Weekend Warrior, VIP Retention)
    /// - Jackpot scenarios (Progressive, Daily Drop, Amount-Based, Split Winners)
    /// - Badge scenarios (Slots Master, High Roller, Loyalty Legend)
    /// - Complete starter pack
    /// </remarks>
    [HttpGet("scenarios")]
    [ProducesResponseType(typeof(IEnumerable<DemoScenarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAvailableScenarios()
    {
        try
        {
            var scenarios = await _demoService.GetAvailableScenariosAsync();
            return Ok(scenarios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving demo scenarios");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving demo scenarios."
            });
        }
    }

    /// <summary>
    /// Gets demo scenarios filtered by category.
    /// </summary>
    /// <param name="category">Category to filter by (Mission, Jackpot, Badge, Complete)</param>
    [HttpGet("scenarios/category/{category}")]
    [ProducesResponseType(typeof(IEnumerable<DemoScenarioDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetScenariosByCategory([FromRoute] string category)
    {
        try
        {
            var scenarios = await _demoService.GetScenariosByCategoryAsync(category);
            return Ok(scenarios);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving demo scenarios for category {Category}", category);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while retrieving demo scenarios."
            });
        }
    }

    /// <summary>
    /// Sets up a specific demo scenario for the authenticated operator.
    /// </summary>
    /// <param name="scenarioId">ID of the scenario to set up (e.g., 'mission-new-game-launch', 'jackpot-classic-progressive')</param>
    /// <param name="activate">If true, activates/publishes the created entities immediately. Default: false (creates as Draft)</param>
    /// <remarks>
    /// Available scenario IDs:
    ///
    /// **Missions:**
    /// - `mission-new-game-launch` - Creates a mission to promote Dragon's Fortune game
    /// - `mission-weekend-warrior` - Creates a weekend engagement boost mission
    /// - `mission-vip-retention` - Creates a VIP-exclusive challenge mission
    ///
    /// **Jackpots:**
    /// - `jackpot-classic-progressive` - Creates a 4-tier progressive jackpot (Mini, Minor, Major, Grand)
    /// - `jackpot-daily-must-drop` - Creates a time-based jackpot with daily and hourly drops
    /// - `jackpot-amount-based` - Creates a jackpot that triggers at $2,000 with proportional distribution
    /// - `jackpot-split-winners` - Creates a jackpot that splits among 10 winners
    ///
    /// **Badges:**
    /// - `badge-slots-master` - Creates Slots Master badge series (4 badges)
    /// - `badge-high-roller` - Creates High Roller badge series (4 badges)
    /// - `badge-loyalty-legend` - Creates Loyalty Legend badge series (4 badges)
    ///
    /// **Complete:**
    /// - `complete-starter-pack` - Sets up ALL of the above (3 missions, 4 jackpots, 3 badge series with 12 badges)
    /// </remarks>
    [HttpPost("setup/{scenarioId}")]
    [ProducesResponseType(typeof(DemoSetupResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SetupScenario(
        [FromRoute] string scenarioId,
        [FromQuery] bool activate = false)
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

            _logger.LogInformation(
                "Setting up demo scenario {ScenarioId} for operator {OperatorId}, activate={Activate}",
                scenarioId, operatorId, activate);

            var result = await _demoService.SetupScenarioAsync(scenarioId, operatorId, activate);

            if (!result.Success)
            {
                return BadRequest(new ProblemDetails
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Scenario setup failed",
                    Detail = result.Message
                });
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up demo scenario {ScenarioId}", scenarioId);
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = $"An error occurred while setting up the demo scenario: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Sets up all demo scenarios for the authenticated operator.
    /// </summary>
    /// <param name="activate">If true, activates/publishes all created entities immediately. Default: false (creates as Draft)</param>
    /// <remarks>
    /// This endpoint creates a complete demo environment including:
    /// - 3 Missions (New Game Launch, Weekend Warrior, VIP Retention)
    /// - 4 Jackpots (Progressive, Daily Drop, Amount-Based, Split Winners)
    /// - 3 Badge Series with 12 Badges total (Slots Master, High Roller, Loyalty Legend)
    ///
    /// Use this for new operator onboarding or comprehensive demonstrations.
    /// </remarks>
    [HttpPost("setup-all")]
    [ProducesResponseType(typeof(List<DemoSetupResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SetupAllScenarios([FromQuery] bool activate = false)
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

            _logger.LogInformation(
                "Setting up ALL demo scenarios for operator {OperatorId}, activate={Activate}",
                operatorId, activate);

            var results = await _demoService.SetupAllScenariosAsync(operatorId, activate);

            var totalEntities = results.Sum(r => r.CreatedEntities.Count);
            var successCount = results.Count(r => r.Success);

            _logger.LogInformation(
                "Completed demo setup: {SuccessCount}/{TotalCount} scenarios, {TotalEntities} entities created",
                successCount, results.Count, totalEntities);

            return Ok(new
            {
                summary = new
                {
                    totalScenarios = results.Count,
                    successfulScenarios = successCount,
                    totalEntitiesCreated = totalEntities
                },
                results
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up all demo scenarios");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = $"An error occurred while setting up demo scenarios: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Cleans up demo data for the authenticated operator.
    /// </summary>
    /// <remarks>
    /// **Warning:** This will delete all demo-created entities. Use with caution.
    ///
    /// Note: This feature is currently limited and may not remove all demo data.
    /// </remarks>
    [HttpDelete("cleanup")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CleanupDemoData()
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

            _logger.LogWarning("Cleanup demo data requested for operator {OperatorId}", operatorId);

            var result = await _demoService.CleanupDemoDataAsync(operatorId);

            return Ok(new { success = result, message = "Demo data cleanup completed." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up demo data");
            return StatusCode(StatusCodes.Status500InternalServerError, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal server error",
                Detail = "An error occurred while cleaning up demo data."
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
