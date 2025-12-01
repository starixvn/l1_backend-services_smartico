using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using Smartico.Missions.Api.Models;
using Smartico.Missions.Application.Features.Badges.Mappers;
using Smartico.Missions.Domain.Configuration;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Api.Controllers;

/// <summary>
/// Controller for badge-related operations.
/// Reads badge data from MongoDB (populated by backoffice-api).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BadgesController : ControllerBase
{
    private readonly IBadgeReadRepository _badgeRepository;
    private readonly ICacheService _cacheService;
    private readonly DemoSettings _demoSettings;
    private readonly ILogger<BadgesController> _logger;

    public BadgesController(
        IBadgeReadRepository badgeRepository,
        ICacheService cacheService,
        IOptions<DemoSettings> demoSettings,
        ILogger<BadgesController> logger)
    {
        _badgeRepository = badgeRepository;
        _cacheService = cacheService;
        _demoSettings = demoSettings.Value;
        _logger = logger;
    }

    /// <summary>
    /// Gets all badges for the authenticated user.
    /// </summary>
    /// <param name="userId">User ID (temporary - will come from JWT in TASK-010)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of badges</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<Badge>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetBadges(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        try
        {
            _logger.LogInformation("Fetching badges for user {UserId}", userId);

            // Check cache first (60 seconds TTL - badges change less frequently)
            var cacheKey = $"badges:{userId}";
            var cachedBadges = await _cacheService.GetAsync<IEnumerable<Badge>>(cacheKey);

            if (cachedBadges != null)
            {
                _logger.LogInformation("Returning cached badges for user {UserId}", userId);
                return Ok(ApiResponse<IEnumerable<Badge>>.Ok(cachedBadges));
            }

            // Resolve operator ID from configuration (demo mode)
            var operatorId = ObjectId.Parse(_demoSettings.DefaultOperatorId);

            // Fetch from MongoDB (populated by backoffice-api)
            var badgeEntities = await _badgeRepository.GetActiveBadgesAsync(operatorId, cancellationToken);

            // Map BackOffice entities to API DTOs
            // Note: progress, status, and earned info will be populated from PlayerProgress in Phase 6
            var badges = badgeEntities
                .Select(b => BadgeMapper.ToDto(
                    badge: b,
                    progress: 0, // TODO: Get from PlayerProgress in Phase 6
                    status: Smartico.Missions.Domain.Enums.AchievementStatus.Available,
                    isEarned: false, // TODO: Get from PlayerProgress in Phase 6
                    earnedAt: null // TODO: Get from PlayerProgress in Phase 6
                ))
                .ToList();

            // Cache the result (60 seconds TTL)
            await _cacheService.SetAsync(cacheKey, badges, TimeSpan.FromSeconds(60));

            _logger.LogInformation("Successfully fetched {Count} badges for user {UserId}",
                badges.Count, userId);

            return Ok(ApiResponse<IEnumerable<Badge>>.Ok(badges));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching badges for user {UserId}", userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to fetch badges"));
        }
    }

    /// <summary>
    /// Gets a specific badge by ID.
    /// </summary>
    /// <param name="id">Badge ID</param>
    /// <param name="userId">User ID (temporary - will come from JWT in TASK-010)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Badge details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<Badge>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetBadgeById(
        string id,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(ApiResponse<object>.Fail("User ID is required"));
        }

        if (!ObjectId.TryParse(id, out var badgeId))
        {
            return BadRequest(ApiResponse<object>.Fail("Invalid badge ID format"));
        }

        try
        {
            _logger.LogInformation("Fetching badge {BadgeId} for user {UserId}", id, userId);

            // Check cache first
            var cacheKey = $"badge:{userId}:{id}";
            var cachedBadge = await _cacheService.GetAsync<Badge>(cacheKey);

            if (cachedBadge != null)
            {
                _logger.LogInformation("Returning cached badge {BadgeId} for user {UserId}",
                    id, userId);
                return Ok(ApiResponse<Badge>.Ok(cachedBadge));
            }

            // Resolve operator ID from configuration (demo mode)
            var operatorId = ObjectId.Parse(_demoSettings.DefaultOperatorId);

            // Fetch from MongoDB
            var badgeEntity = await _badgeRepository.GetByIdAsync(operatorId, badgeId, cancellationToken);

            if (badgeEntity == null)
            {
                _logger.LogWarning("Badge {BadgeId} not found for user {UserId}", id, userId);
                return NotFound(ApiResponse<object>.Fail($"Badge {id} not found"));
            }

            // Map to DTO
            var badge = BadgeMapper.ToDto(
                badge: badgeEntity,
                progress: 0, // TODO: Get from PlayerProgress in Phase 6
                status: Smartico.Missions.Domain.Enums.AchievementStatus.Available,
                isEarned: false, // TODO: Get from PlayerProgress in Phase 6
                earnedAt: null // TODO: Get from PlayerProgress in Phase 6
            );

            // Cache the result (60 seconds TTL)
            await _cacheService.SetAsync(cacheKey, badge, TimeSpan.FromSeconds(60));

            _logger.LogInformation("Successfully fetched badge {BadgeId} for user {UserId}",
                id, userId);

            return Ok(ApiResponse<Badge>.Ok(badge));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching badge {BadgeId} for user {UserId}",
                id, userId);
            return StatusCode(500, ApiResponse<object>.Fail("Failed to fetch badge"));
        }
    }
}
