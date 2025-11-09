using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Jackpots.Commands.OptIn;

/// <summary>
/// Handler for opt-in command.
/// Opts user into jackpot, increments registration count, invalidates cache.
/// </summary>
public class OptInJackpotCommandHandler : IRequestHandler<OptInJackpotCommand, OptInJackpotResponse>
{
    private readonly ISmarticoJackpotApiClient _jackpotApiClient;
    private readonly ICacheService _cacheService;
    private readonly IProgressBroadcaster _progressBroadcaster;
    private readonly ILogger<OptInJackpotCommandHandler> _logger;

    public OptInJackpotCommandHandler(
        ISmarticoJackpotApiClient jackpotApiClient,
        ICacheService cacheService,
        IProgressBroadcaster progressBroadcaster,
        ILogger<OptInJackpotCommandHandler> logger)
    {
        _jackpotApiClient = jackpotApiClient;
        _cacheService = cacheService;
        _progressBroadcaster = progressBroadcaster;
        _logger = logger;
    }

    public async Task<OptInJackpotResponse> Handle(
        OptInJackpotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "User {UserId} opting in to jackpot {TemplateId}",
            request.UserId,
            request.JackpotTemplateId
        );

        // Call API to opt-in
        var jackpot = await _jackpotApiClient.OptInAsync(
            request.UserId,
            request.JackpotTemplateId,
            cancellationToken
        );

        // Invalidate cache for this user
        var cacheKey = $"jackpots:{request.UserId}";
        await _cacheService.RemoveAsync(cacheKey);

        // Broadcast pool update to all connected clients
        await _progressBroadcaster.BroadcastJackpotPoolUpdatedAsync(
            jackpot.JpTemplateId,
            jackpot.Pot.CurrentPotAmount,
            jackpot.Pot.CurrentPotAmountUserCurrency,
            jackpot.RegistrationCount,
            cancellationToken
        );

        _logger.LogInformation(
            "User {UserId} successfully opted in to jackpot {TemplateId}. Cache invalidated. Pool update broadcasted.",
            request.UserId,
            request.JackpotTemplateId
        );

        var contributionInfo = jackpot.ContributionType == Domain.Enums.JackpotContributionType.Fixed
            ? $"{jackpot.ContributionValue} {jackpot.JpCurrency} per bet"
            : $"{jackpot.ContributionValue}% of each bet";

        var message = $"You're in! Your bets will now contribute {contributionInfo} to {jackpot.JpPublicMeta.Name}.";

        return new OptInJackpotResponse(jackpot, message);
    }
}
