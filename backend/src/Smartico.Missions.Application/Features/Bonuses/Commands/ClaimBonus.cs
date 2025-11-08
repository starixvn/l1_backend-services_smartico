using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Bonuses.Commands;

/// <summary>
/// Command to claim a bonus
/// </summary>
public record ClaimBonusCommand(string UserId, string BonusId) : IRequest<ClaimBonusResponse>;

/// <summary>
/// Response for claiming a bonus
/// </summary>
public record ClaimBonusResponse(
    bool Success,
    string? ErrorCode = null,
    string? ErrorMessage = null,
    Bonus? UpdatedBonus = null);

/// <summary>
/// Validator for ClaimBonusCommand
/// </summary>
public class ClaimBonusCommandValidator : AbstractValidator<ClaimBonusCommand>
{
    public ClaimBonusCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.BonusId)
            .NotEmpty()
            .WithMessage("Bonus ID is required");
    }
}

/// <summary>
/// Handler for ClaimBonusCommand
/// </summary>
public class ClaimBonusCommandHandler : IRequestHandler<ClaimBonusCommand, ClaimBonusResponse>
{
    private readonly ISmarticoBonusApiClient _bonusApiClient;
    private readonly ICacheService _cacheService;
    private readonly IProgressBroadcaster _progressBroadcaster;
    private readonly ILogger<ClaimBonusCommandHandler> _logger;

    public ClaimBonusCommandHandler(
        ISmarticoBonusApiClient bonusApiClient,
        ICacheService cacheService,
        IProgressBroadcaster progressBroadcaster,
        ILogger<ClaimBonusCommandHandler> logger)
    {
        _bonusApiClient = bonusApiClient;
        _cacheService = cacheService;
        _progressBroadcaster = progressBroadcaster;
        _logger = logger;
    }

    public async Task<ClaimBonusResponse> Handle(
        ClaimBonusCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Processing claim bonus command for user {UserId}, bonus {BonusId}",
            request.UserId, request.BonusId);

        // Call the Smartico Bonus API to claim
        var claimResult = await _bonusApiClient.ClaimBonusAsync(
            request.UserId,
            request.BonusId,
            cancellationToken);

        if (!claimResult.Success)
        {
            _logger.LogWarning("Failed to claim bonus {BonusId} for user {UserId}: {ErrorCode}",
                request.BonusId, request.UserId, claimResult.ErrorCode);

            return new ClaimBonusResponse(
                Success: false,
                ErrorCode: claimResult.ErrorCode,
                ErrorMessage: claimResult.ErrorMessage);
        }

        // Invalidate cache for this user
        var cacheKey = $"bonuses:{request.UserId}";
        await _cacheService.RemoveAsync(cacheKey);

        // Fetch updated bonuses to get the claimed bonus
        var updatedBonuses = await _bonusApiClient.GetBonusesAsync(request.UserId, cancellationToken);
        var claimedBonus = updatedBonuses.FirstOrDefault(b => b.Id == request.BonusId);

        if (claimedBonus != null)
        {
            // Broadcast the claim success via SignalR
            await _progressBroadcaster.BroadcastBonusClaimedAsync(
                request.UserId,
                claimedBonus,
                cancellationToken);
        }

        _logger.LogInformation("Successfully claimed bonus {BonusId} for user {UserId}",
            request.BonusId, request.UserId);

        return new ClaimBonusResponse(
            Success: true,
            UpdatedBonus: claimedBonus);
    }
}
