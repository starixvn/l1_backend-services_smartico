using MediatR;
using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Application.Features.MiniGames.Commands;

/// <summary>
/// Command to play a mini game
/// </summary>
public record PlayMiniGameCommand(string UserId, int GameId) : IRequest<PlayMiniGameResponse>;

/// <summary>
/// Response from playing a mini game
/// </summary>
public record PlayMiniGameResponse(
    bool Success,
    int? PrizeId = null,
    string? PrizeName = null,
    MiniGamePrizeType? PrizeType = null,
    decimal? PrizeValue = null,
    MiniGame? UpdatedGame = null,
    string? ErrorCode = null,
    string? ErrorMessage = null
);

/// <summary>
/// Handler for PlayMiniGameCommand
/// </summary>
public class PlayMiniGameCommandHandler : IRequestHandler<PlayMiniGameCommand, PlayMiniGameResponse>
{
    private readonly ISmarticoMiniGameApiClient _miniGameApiClient;
    private readonly ICacheService _cacheService;
    private readonly IProgressBroadcaster _progressBroadcaster;
    private readonly ILogger<PlayMiniGameCommandHandler> _logger;
    private const string CacheKeyPrefix = "minigames";

    public PlayMiniGameCommandHandler(
        ISmarticoMiniGameApiClient miniGameApiClient,
        ICacheService cacheService,
        IProgressBroadcaster progressBroadcaster,
        ILogger<PlayMiniGameCommandHandler> logger)
    {
        _miniGameApiClient = miniGameApiClient;
        _cacheService = cacheService;
        _progressBroadcaster = progressBroadcaster;
        _logger = logger;
    }

    public async Task<PlayMiniGameResponse> Handle(
        PlayMiniGameCommand request,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("User {UserId} playing mini game {GameId}", request.UserId, request.GameId);

        try
        {
            // Call API client to play game
            var result = await _miniGameApiClient.PlayMiniGameAsync(request.UserId, request.GameId, cancellationToken);

            // If play failed, return error response
            if (!result.Success)
            {
                _logger.LogWarning("Failed to play game {GameId} for user {UserId}: {ErrorCode}",
                    request.GameId, request.UserId, result.ErrorCode);

                return new PlayMiniGameResponse(
                    Success: false,
                    ErrorCode: result.ErrorCode,
                    ErrorMessage: result.ErrorMessage
                );
            }

            // Invalidate cache for user
            var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";
            await _cacheService.RemoveAsync(cacheKey);

            _logger.LogInformation("Invalidated cache for user {UserId} after playing game {GameId}",
                request.UserId, request.GameId);

            // Broadcast game played event
            if (result.UpdatedGame != null)
            {
                await _progressBroadcaster.BroadcastMiniGamePlayedAsync(
                    request.UserId,
                    result.UpdatedGame,
                    cancellationToken);

                _logger.LogInformation("Broadcasted MiniGamePlayed event for user {UserId}, game {GameId}",
                    request.UserId, request.GameId);
            }

            // If prize won, broadcast prize won event
            if (result.PrizeId.HasValue && result.PrizeType != MiniGamePrizeType.NoPrize && result.UpdatedGame != null)
            {
                var prize = result.UpdatedGame.Prizes.FirstOrDefault(p => p.Id == result.PrizeId.Value);
                if (prize != null)
                {
                    await _progressBroadcaster.BroadcastMiniGamePrizeWonAsync(
                        request.UserId,
                        result.UpdatedGame,
                        prize,
                        cancellationToken);

                    _logger.LogInformation("Broadcasted MiniGamePrizeWon event for user {UserId}, prize {PrizeId} ({PrizeType})",
                        request.UserId, result.PrizeId.Value, result.PrizeType);

                    // If jackpot won, broadcast jackpot event to ALL users
                    if (result.PrizeType == MiniGamePrizeType.Jackpot && result.PrizeValue.HasValue)
                    {
                        await _progressBroadcaster.BroadcastMiniGameJackpotWonAsync(
                            request.UserId,
                            result.UpdatedGame,
                            result.PrizeValue.Value,
                            cancellationToken);

                        _logger.LogInformation("Broadcasted MiniGameJackpotWon event to ALL users - Winner: {UserId}, Amount: {Amount}",
                            request.UserId, result.PrizeValue.Value);
                    }
                }
            }

            _logger.LogInformation("User {UserId} successfully played game {GameId}, won prize {PrizeId} ({PrizeType})",
                request.UserId, request.GameId, result.PrizeId, result.PrizeType);

            return new PlayMiniGameResponse(
                Success: true,
                PrizeId: result.PrizeId,
                PrizeName: result.PrizeName,
                PrizeType: result.PrizeType,
                PrizeValue: result.PrizeValue,
                UpdatedGame: result.UpdatedGame
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error playing game {GameId} for user {UserId}", request.GameId, request.UserId);

            return new PlayMiniGameResponse(
                Success: false,
                ErrorCode: "PLAY_ERROR",
                ErrorMessage: "An error occurred while playing the game. Please try again."
            );
        }
    }
}
