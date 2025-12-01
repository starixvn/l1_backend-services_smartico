using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using Smartico.Missions.Api.Models;
using Smartico.Missions.Application.Features.Missions.Mappers;
using Smartico.Missions.Domain.Configuration;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for mission-related operations.
/// Reads mission data from MongoDB (populated by backoffice-api).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MissionsController : ControllerBase
{
    private readonly IMissionReadRepository _missionRepository;
    private readonly ICacheService _cacheService;
    private readonly DemoSettings _demoSettings;
    private readonly ILogger<MissionsController> _logger;

    public MissionsController(
        IMissionReadRepository missionRepository,
        ICacheService cacheService,
        IOptions<DemoSettings> demoSettings,
        ILogger<MissionsController> logger)
    {
        _missionRepository = missionRepository;
        _cacheService = cacheService;
        _demoSettings = demoSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Gets all missions for the authenticated user.
    /// </summary>
    /// <param name="userId">User ID (temporary - will come from JWT in TASK-010)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of missions</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<Mission>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMissions(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        try
        {
            _logger.LogInformation("Fetching missions for user {UserId}", userId);

            // Check cache first
            var cacheKey = $"missions:{userId}";
            var cachedMissions = await _cacheService.GetAsync<IEnumerable<Mission>>(cacheKey);

            if (cachedMissions != null)
            {
                _logger.LogInformation("Returning cached missions for user {UserId}", userId);
                return Ok(ApiResponse<IEnumerable<Mission>>.Ok(cachedMissions));
            }

            // Resolve operator ID from configuration (demo mode)
            var operatorId = ObjectId.Parse(_demoSettings.DefaultOperatorId);

            // Fetch from MongoDB (populated by backoffice-api)
            var missionEntities = await _missionRepository.GetActiveMissionsAsync(operatorId, cancellationToken);

            // Map BackOffice entities to API DTOs
            // Note: progress and status will be populated from PlayerProgress in Phase 6
            var missions = missionEntities
                .Select(m => MissionMapper.ToDto(
                    mission: m,
                    progress: 0, // TODO: Get from PlayerProgress in Phase 6
                    status: Smartico.Missions.Domain.Enums.AchievementStatus.Available,
                    taskProgress: null // TODO: Get from PlayerProgress in Phase 6
                ))
                .ToList();

            // Cache the result (30 seconds TTL from config)
            await _cacheService.SetAsync(cacheKey, missions, TimeSpan.FromSeconds(30));

            _logger.LogInformation("Successfully fetched {Count} missions for user {UserId}",
                missions.Count, userId);

            return Ok(ApiResponse<IEnumerable<Mission>>.Ok(missions));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching missions for user {UserId}", userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to fetch missions"));
        }
    }

    /// <summary>
    /// Gets a specific mission by ID.
    /// </summary>
    /// <param name="id">Mission ID</param>
    /// <param name="userId">User ID (temporary - will come from JWT in TASK-010)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Mission details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Mission>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMissionById(
        string id,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        if (!ObjectId.TryParse(id, out var missionId))
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid mission ID format"));
        }

        try
        {
            _logger.LogInformation("Fetching mission {MissionId} for user {UserId}", id, userId);

            // Check cache first
            var cacheKey = $"mission:{userId}:{id}";
            var cachedMission = await _cacheService.GetAsync<Mission>(cacheKey);

            if (cachedMission != null)
            {
                _logger.LogInformation("Returning cached mission {MissionId} for user {UserId}",
                    id, userId);
                return Ok(ApiResponse<Mission>.Ok(cachedMission));
            }

            // Resolve operator ID from configuration (demo mode)
            var operatorId = ObjectId.Parse(_demoSettings.DefaultOperatorId);

            // Fetch from MongoDB
            var missionEntity = await _missionRepository.GetByIdAsync(operatorId, missionId, cancellationToken);

            if (missionEntity == null)
            {
                _logger.LogWarning("Mission {MissionId} not found for user {UserId}", id, userId);
                return NotFound(ApiResponse<object>.Fail($"Mission {id} not found"));
            }

            // Map to DTO
            var mission = MissionMapper.ToDto(
                mission: missionEntity,
                progress: 0, // TODO: Get from PlayerProgress in Phase 6
                status: Smartico.Missions.Domain.Enums.AchievementStatus.Available,
                taskProgress: null // TODO: Get from PlayerProgress in Phase 6
            );

            // Cache the result
            await _cacheService.SetAsync(cacheKey, mission, TimeSpan.FromSeconds(30));

            return Ok(ApiResponse<Mission>.Ok(mission));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching mission {MissionId} for user {UserId}",
                id, userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to fetch mission"));
        }
    }

    /// <summary>
    /// Opts a user into a mission.
    /// </summary>
    /// <param name="id">Mission ID</param>
    /// <param name="userId">User ID (temporary - will come from JWT in TASK-010)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Opt-in result</returns>
    [HttpPost("{id}/opt-in")]
    [ProducesResponseType(typeof(ApiResponse<MissionOptInResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> OptInToMission(
        string id,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        if (!ObjectId.TryParse(id, out var missionId))
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid mission ID format"));
        }

        try
        {
            _logger.LogInformation("User {UserId} opting into mission {MissionId}", userId, id);

            // TODO: Implement opt-in with PlayerProgressRepository in Phase 6
            // For now, return a placeholder success result
            var result = new MissionOptInResult
            {
                Success = true,
                Message = "Successfully opted into mission"
            };

            // Invalidate cache for this user's missions
            await _cacheService.RemoveByPatternAsync($"missions:{userId}*");
            await _cacheService.RemoveAsync($"mission:{userId}:{id}");

            _logger.LogInformation("User {UserId} successfully opted into mission {MissionId}",
                userId, id);

            return Ok(ApiResponse<MissionOptInResult>.Ok(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error opting user {UserId} into mission {MissionId}",
                userId, id);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to opt into mission"));
        }
    }

    /// <summary>
    /// Claims reward for a completed mission.
    /// </summary>
    /// <param name="id">Mission ID</param>
    /// <param name="userId">User ID (temporary - will come from JWT in TASK-010)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Claim result</returns>
    [HttpPost("{id}/claim")]
    [ProducesResponseType(typeof(ApiResponse<MissionClaimResult>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ClaimReward(
        string id,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        if (!ObjectId.TryParse(id, out var missionId))
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid mission ID format"));
        }

        try
        {
            _logger.LogInformation("User {UserId} claiming reward for mission {MissionId}",
                userId, id);

            // TODO: Implement claim with PlayerProgressRepository in Phase 6
            // For now, return a placeholder result
            var result = new MissionClaimResult
            {
                Success = false,
                Message = "Mission not yet completed",
                RewardAmount = 0,
                RewardCurrency = "XP"
            };

            // Invalidate cache for this user's missions
            await _cacheService.RemoveByPatternAsync($"missions:{userId}*");
            await _cacheService.RemoveAsync($"mission:{userId}:{id}");

            return Ok(ApiResponse<MissionClaimResult>.Ok(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error claiming reward for mission {MissionId} by user {UserId}",
                id, userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to claim reward"));
        }
    }
}
