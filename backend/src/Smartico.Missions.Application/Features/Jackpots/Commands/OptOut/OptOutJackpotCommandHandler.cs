using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Jackpots.Commands.OptOut;

/// <summary>
/// Handler for opt-out command.
/// Opts user out of jackpot, decrements registration count, invalidates cache.
/// </summary>
public class OptOutJackpotCommandHandler : IRequestHandler<OptOutJackpotCommand, OptOutJackpotResponse>
{
    private readonly ISmarticoJackpotApiClient _jackpotApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<OptOutJackpotCommandHandler> _logger;

    public OptOutJackpotCommandHandler(
        ISmarticoJackpotApiClient jackpotApiClient,
        ICacheService cacheService,
        ILogger<OptOutJackpotCommandHandler> logger)
    {
        _jackpotApiClient = jackpotApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<OptOutJackpotResponse> Handle(
        OptOutJackpotCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "User {UserId} opting out of jackpot {TemplateId}",
            request.UserId,
            request.JackpotTemplateId
        );

        // Call API to opt-out
        var jackpot = await _jackpotApiClient.OptOutAsync(
            request.UserId,
            request.JackpotTemplateId,
            cancellationToken
        );

        // Invalidate cache for this user
        var cacheKey = $"jackpots:{request.UserId}";
        await _cacheService.RemoveAsync(cacheKey);

        _logger.LogInformation(
            "User {UserId} successfully opted out of jackpot {TemplateId}. Cache invalidated.",
            request.UserId,
            request.JackpotTemplateId
        );

        var message = $"You've opted out. Your bets will no longer contribute to {jackpot.JpPublicMeta.Name}.";

        return new OptOutJackpotResponse(jackpot, message);
    }
}
