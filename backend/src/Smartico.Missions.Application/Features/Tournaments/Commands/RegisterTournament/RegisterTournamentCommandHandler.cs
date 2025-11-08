using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.Tournaments.Commands.RegisterTournament;

/// <summary>
/// Handler for RegisterTournamentCommand with cache invalidation.
/// </summary>
public class RegisterTournamentCommandHandler : IRequestHandler<RegisterTournamentCommand, RegisterTournamentResponse>
{
    private readonly ISmarticoTournamentApiClient _tournamentApiClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<RegisterTournamentCommandHandler> _logger;

    private const string CacheKeyPrefix = "tournaments";

    public RegisterTournamentCommandHandler(
        ISmarticoTournamentApiClient tournamentApiClient,
        ICacheService cacheService,
        ILogger<RegisterTournamentCommandHandler> logger)
    {
        _tournamentApiClient = tournamentApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<RegisterTournamentResponse> Handle(RegisterTournamentCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling RegisterTournamentCommand for user {UserId}, tournament {TournamentInstanceId}",
            request.UserId, request.TournamentInstanceId);

        // Register via API client
        var result = await _tournamentApiClient.RegisterTournamentAsync(
            request.UserId,
            request.TournamentInstanceId,
            cancellationToken);

        if (!result.Success)
        {
            _logger.LogWarning("Registration failed for user {UserId}, tournament {TournamentInstanceId}: {ErrorMessage}",
                request.UserId, request.TournamentInstanceId, result.ErrorMessage);

            return new RegisterTournamentResponse(
                Success: false,
                Status: result.Status,
                ErrorMessage: result.ErrorMessage,
                UpdatedTournament: null);
        }

        // Invalidate tournament cache for this user (force fresh data on next fetch)
        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";
        await _cacheService.RemoveAsync(cacheKey);

        _logger.LogInformation("Successfully registered user {UserId} for tournament {TournamentInstanceId}. Cache invalidated.",
            request.UserId, request.TournamentInstanceId);

        return new RegisterTournamentResponse(
            Success: true,
            Status: result.Status,
            ErrorMessage: null,
            UpdatedTournament: result.UpdatedTournament);
    }
}
