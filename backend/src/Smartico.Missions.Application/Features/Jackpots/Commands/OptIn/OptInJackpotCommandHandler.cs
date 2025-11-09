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
    private readonly ILogger<OptInJackpotCommandHandler> _logger;

    public OptInJackpotCommandHandler(
        ISmarticoJackpotApiClient jackpotApiClient,
        ICacheService cacheService,
        ILogger<OptInJackpotCommandHandler> logger)
    {
        _jackpotApiClient = jackpotApiClient;
        _cacheService = cacheService;
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

        _logger.LogInformation(
            "User {UserId} successfully opted in to jackpot {TemplateId}. Cache invalidated.",
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
