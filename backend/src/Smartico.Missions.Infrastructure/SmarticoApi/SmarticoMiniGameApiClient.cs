using Microsoft.Extensions.Logging;
using Smartico.Missions.Domain.Entities;
using Smartico.Missions.Domain.Enums;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// Demo implementation of ISmarticoMiniGameApiClient.
/// Returns 5 hardcoded mini games with in-memory state management.
/// </summary>
public class SmarticoMiniGameApiClient : ISmarticoMiniGameApiClient
{
    private readonly ILogger<SmarticoMiniGameApiClient> _logger;
    private static readonly object _lock = new();

    // In-memory game state (for demo MVP)
    private static readonly Dictionary<int, GameState> _gameStates = new()
    {
        { 1, new GameState { JackpotCurrent = 105.00m, SpinCount = 1 } },
        { 2, new GameState { JackpotCurrent = 0m, SpinCount = 3 } },
        { 3, new GameState { JackpotCurrent = 0m, SpinCount = 5 } },
        { 4, new GameState { JackpotCurrent = 0m, SpinCount = 2 } },
        { 5, new GameState { JackpotCurrent = 500.00m, SpinCount = 1 } }
    };

    // Prize pool tracking (gameId -> prizeId -> remaining pool)
    private static readonly Dictionary<int, Dictionary<int, int>> _prizePools = new()
    {
        { 1, new Dictionary<int, int> { { 102, 50 }, { 103, 1 } } },
        { 2, new Dictionary<int, int> { { 202, 100 }, { 203, 75 } } },
        { 3, new Dictionary<int, int> { { 302, 200 }, { 303, 150 }, { 304, 100 } } },
        { 4, new Dictionary<int, int> { { 402, 50 }, { 403, 25 } } },
        { 5, new Dictionary<int, int> { { 503, 1 } } }
    };

    public SmarticoMiniGameApiClient(ILogger<SmarticoMiniGameApiClient> logger)
    {
        _logger = logger;
    }

    public async Task<List<MiniGame>> GetMiniGamesAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Fetching mini games for user {UserId} (DEMO MODE - Returning 5 demo games)", userId);

        await Task.Delay(50, cancellationToken); // Simulate network delay

        var games = new List<MiniGame>();

        lock (_lock)
        {
            // Game 1: Daily Lucky Spin (Free, Spin the Wheel)
            games.Add(new MiniGame
            {
                Id = 1,
                Name = "Daily Lucky Spin",
                Description = "Spin the wheel once per day for free prizes!",
                Thumbnail = "https://via.placeholder.com/300x200?text=Daily+Spin",
                GameType = GameType.Spin,
                BuyInType = BuyInType.Free,
                BuyInCostPoints = null,
                BuyInCostGems = null,
                BuyInCostDiamonds = null,
                SpinCount = _gameStates[1].SpinCount,
                NextAvailableSpinTs = null,
                JackpotCurrent = _gameStates[1].JackpotCurrent,
                JackpotAddOnAttempt = 5.00m,
                MaxNumberOfAttempts = 1,
                MaxSpinsPeriodMs = 86400000, // 24 hours
                ActiveFromDate = null,
                ActiveTillDate = null,
                Prizes = new List<MiniGamePrize>
                {
                    new()
                    {
                        Id = 101,
                        Name = "No Prize",
                        PrizeType = MiniGamePrizeType.NoPrize,
                        PrizeValue = null,
                        Icon = null,
                        Pool = null,
                        PoolInitial = null,
                        WinsCount = 342,
                        AcknowledgeMessage = "Better luck next time!",
                        AcknowledgeDp = null,
                        AcknowledgeActionTitle = null,
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 102,
                        Name = "100 Points",
                        PrizeType = MiniGamePrizeType.Points,
                        PrizeValue = 100,
                        Icon = "https://via.placeholder.com/50x50?text=Points",
                        Pool = _prizePools[1][102],
                        PoolInitial = 100,
                        WinsCount = 50,
                        AcknowledgeMessage = "Congratulations! You won 100 points!",
                        AcknowledgeDp = "/points",
                        AcknowledgeActionTitle = "View Points",
                        OutOfStockMessage = "Points prize is currently unavailable",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 103,
                        Name = "Jackpot Prize",
                        PrizeType = MiniGamePrizeType.Jackpot,
                        PrizeValue = null,
                        Icon = "https://via.placeholder.com/50x50?text=Jackpot",
                        Pool = _prizePools[1][103],
                        PoolInitial = 1,
                        WinsCount = 12,
                        AcknowledgeMessage = "JACKPOT! You won the grand prize!",
                        AcknowledgeDp = "/jackpot-winners",
                        AcknowledgeActionTitle = "View Winners",
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    }
                }
            });

            // Game 2: Gems Treasure Box (Points buy-in, Gift Box)
            games.Add(new MiniGame
            {
                Id = 2,
                Name = "Gems Treasure Box",
                Description = "Open mystery boxes to win gems!",
                Thumbnail = "https://via.placeholder.com/300x200?text=Treasure+Box",
                GameType = GameType.GiftBox,
                BuyInType = BuyInType.Points,
                BuyInCostPoints = 50,
                BuyInCostGems = null,
                BuyInCostDiamonds = null,
                SpinCount = _gameStates[2].SpinCount,
                NextAvailableSpinTs = null,
                JackpotCurrent = null,
                JackpotAddOnAttempt = null,
                MaxNumberOfAttempts = 3,
                MaxSpinsPeriodMs = 86400000,
                ActiveFromDate = null,
                ActiveTillDate = null,
                Prizes = new List<MiniGamePrize>
                {
                    new()
                    {
                        Id = 201,
                        Name = "No Prize",
                        PrizeType = MiniGamePrizeType.NoPrize,
                        PrizeValue = null,
                        Icon = null,
                        Pool = null,
                        PoolInitial = null,
                        WinsCount = 150,
                        AcknowledgeMessage = "Try another box!",
                        AcknowledgeDp = null,
                        AcknowledgeActionTitle = null,
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 202,
                        Name = "50 Gems",
                        PrizeType = MiniGamePrizeType.GemsAndDiamonds,
                        PrizeValue = 50,
                        Icon = "https://via.placeholder.com/50x50?text=Gems",
                        Pool = _prizePools[2][202],
                        PoolInitial = 200,
                        WinsCount = 100,
                        AcknowledgeMessage = "You won 50 gems!",
                        AcknowledgeDp = "/inventory",
                        AcknowledgeActionTitle = "View Inventory",
                        OutOfStockMessage = "Gems prize depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 203,
                        Name = "Bonus Spin",
                        PrizeType = MiniGamePrizeType.Spin,
                        PrizeValue = 1,
                        Icon = "https://via.placeholder.com/50x50?text=Spin",
                        Pool = _prizePools[2][203],
                        PoolInitial = 100,
                        WinsCount = 25,
                        AcknowledgeMessage = "You won an extra spin!",
                        AcknowledgeDp = null,
                        AcknowledgeActionTitle = null,
                        OutOfStockMessage = "Bonus spins depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    }
                }
            });

            // Game 3: Scratch & Win (Free, Scratch Card)
            games.Add(new MiniGame
            {
                Id = 3,
                Name = "Scratch & Win",
                Description = "Scratch cards with multiple chances to win!",
                Thumbnail = "https://via.placeholder.com/300x200?text=Scratch+Card",
                GameType = GameType.Scratch,
                BuyInType = BuyInType.Free,
                BuyInCostPoints = null,
                BuyInCostGems = null,
                BuyInCostDiamonds = null,
                SpinCount = _gameStates[3].SpinCount,
                NextAvailableSpinTs = null,
                JackpotCurrent = null,
                JackpotAddOnAttempt = null,
                MaxNumberOfAttempts = 5,
                MaxSpinsPeriodMs = 86400000,
                ActiveFromDate = null,
                ActiveTillDate = null,
                Prizes = new List<MiniGamePrize>
                {
                    new()
                    {
                        Id = 301,
                        Name = "No Prize",
                        PrizeType = MiniGamePrizeType.NoPrize,
                        PrizeValue = null,
                        Icon = null,
                        Pool = null,
                        PoolInitial = null,
                        WinsCount = 500,
                        AcknowledgeMessage = "Keep scratching!",
                        AcknowledgeDp = null,
                        AcknowledgeActionTitle = null,
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 302,
                        Name = "25 Points",
                        PrizeType = MiniGamePrizeType.Points,
                        PrizeValue = 25,
                        Icon = "https://via.placeholder.com/50x50?text=Points",
                        Pool = _prizePools[3][302],
                        PoolInitial = 500,
                        WinsCount = 300,
                        AcknowledgeMessage = "You won 25 points!",
                        AcknowledgeDp = "/points",
                        AcknowledgeActionTitle = "View Points",
                        OutOfStockMessage = "Points depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 303,
                        Name = "10 Gems",
                        PrizeType = MiniGamePrizeType.GemsAndDiamonds,
                        PrizeValue = 10,
                        Icon = "https://via.placeholder.com/50x50?text=Gems",
                        Pool = _prizePools[3][303],
                        PoolInitial = 300,
                        WinsCount = 150,
                        AcknowledgeMessage = "You won 10 gems!",
                        AcknowledgeDp = "/inventory",
                        AcknowledgeActionTitle = "View Inventory",
                        OutOfStockMessage = "Gems depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 304,
                        Name = "Raffle Ticket",
                        PrizeType = MiniGamePrizeType.RaffleTicket,
                        PrizeValue = 1,
                        Icon = "https://via.placeholder.com/50x50?text=Ticket",
                        Pool = _prizePools[3][304],
                        PoolInitial = 200,
                        WinsCount = 100,
                        AcknowledgeMessage = "You won a raffle ticket!",
                        AcknowledgeDp = "/raffle",
                        AcknowledgeActionTitle = "View Raffle",
                        OutOfStockMessage = "Tickets depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    }
                }
            });

            // Game 4: Match 3 Challenge (Gems buy-in, MatchX)
            games.Add(new MiniGame
            {
                Id = 4,
                Name = "Match 3 Challenge",
                Description = "Match 3 symbols to win prizes!",
                Thumbnail = "https://via.placeholder.com/300x200?text=Match+3",
                GameType = GameType.MatchX,
                BuyInType = BuyInType.Gems,
                BuyInCostPoints = null,
                BuyInCostGems = 10,
                BuyInCostDiamonds = null,
                SpinCount = _gameStates[4].SpinCount,
                NextAvailableSpinTs = null,
                JackpotCurrent = null,
                JackpotAddOnAttempt = null,
                MaxNumberOfAttempts = 3,
                MaxSpinsPeriodMs = 86400000,
                ActiveFromDate = null,
                ActiveTillDate = null,
                Prizes = new List<MiniGamePrize>
                {
                    new()
                    {
                        Id = 401,
                        Name = "No Match",
                        PrizeType = MiniGamePrizeType.NoPrize,
                        PrizeValue = null,
                        Icon = null,
                        Pool = null,
                        PoolInitial = null,
                        WinsCount = 200,
                        AcknowledgeMessage = "Try matching again!",
                        AcknowledgeDp = null,
                        AcknowledgeActionTitle = null,
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 402,
                        Name = "200 Points",
                        PrizeType = MiniGamePrizeType.Points,
                        PrizeValue = 200,
                        Icon = "https://via.placeholder.com/50x50?text=Points",
                        Pool = _prizePools[4][402],
                        PoolInitial = 100,
                        WinsCount = 50,
                        AcknowledgeMessage = "Perfect match! You won 200 points!",
                        AcknowledgeDp = "/points",
                        AcknowledgeActionTitle = "View Points",
                        OutOfStockMessage = "Points prize depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 403,
                        Name = "Level Up",
                        PrizeType = MiniGamePrizeType.ChangeLevel,
                        PrizeValue = 1,
                        Icon = "https://via.placeholder.com/50x50?text=Level",
                        Pool = _prizePools[4][403],
                        PoolInitial = 50,
                        WinsCount = 25,
                        AcknowledgeMessage = "Level up reward!",
                        AcknowledgeDp = "/profile",
                        AcknowledgeActionTitle = "View Profile",
                        OutOfStockMessage = "Level rewards depleted",
                        IsSurcharge = false,
                        HidePrizeFromHistory = false
                    }
                }
            });

            // Game 5: VIP Mega Wheel (Free, Spin the Wheel with BIG jackpot)
            games.Add(new MiniGame
            {
                Id = 5,
                Name = "VIP Mega Wheel",
                Description = "Exclusive VIP wheel with mega jackpot!",
                Thumbnail = "https://via.placeholder.com/300x200?text=VIP+Wheel",
                GameType = GameType.Spin,
                BuyInType = BuyInType.Free,
                BuyInCostPoints = null,
                BuyInCostGems = null,
                BuyInCostDiamonds = null,
                SpinCount = _gameStates[5].SpinCount,
                NextAvailableSpinTs = null,
                JackpotCurrent = _gameStates[5].JackpotCurrent,
                JackpotAddOnAttempt = 10.00m,
                MaxNumberOfAttempts = 1,
                MaxSpinsPeriodMs = 604800000, // 7 days
                ActiveFromDate = null,
                ActiveTillDate = null,
                Prizes = new List<MiniGamePrize>
                {
                    new()
                    {
                        Id = 501,
                        Name = "No Prize",
                        PrizeType = MiniGamePrizeType.NoPrize,
                        PrizeValue = null,
                        Icon = null,
                        Pool = null,
                        PoolInitial = null,
                        WinsCount = 50,
                        AcknowledgeMessage = "Better luck next week!",
                        AcknowledgeDp = null,
                        AcknowledgeActionTitle = null,
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 502,
                        Name = "500 Points",
                        PrizeType = MiniGamePrizeType.Points,
                        PrizeValue = 500,
                        Icon = "https://via.placeholder.com/50x50?text=Points",
                        Pool = null, // Unlimited surcharge prize
                        PoolInitial = null,
                        WinsCount = 20,
                        AcknowledgeMessage = "Amazing! You won 500 points!",
                        AcknowledgeDp = "/points",
                        AcknowledgeActionTitle = "View Points",
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    },
                    new()
                    {
                        Id = 503,
                        Name = "MEGA JACKPOT",
                        PrizeType = MiniGamePrizeType.Jackpot,
                        PrizeValue = null,
                        Icon = "https://via.placeholder.com/50x50?text=MEGA",
                        Pool = _prizePools[5][503],
                        PoolInitial = 1,
                        WinsCount = 3,
                        AcknowledgeMessage = "MEGA JACKPOT!!! You're the big winner!",
                        AcknowledgeDp = "/vip-winners",
                        AcknowledgeActionTitle = "See Hall of Fame",
                        OutOfStockMessage = null,
                        IsSurcharge = true,
                        HidePrizeFromHistory = false
                    }
                }
            });
        }

        _logger.LogInformation("Returning {Count} mini games for user {UserId}", games.Count, userId);
        return games;
    }

    public async Task<PlayMiniGameResult> PlayMiniGameAsync(
        string userId,
        int gameId,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("User {UserId} playing mini game {GameId} (DEMO MODE)", userId, gameId);

        await Task.Delay(200, cancellationToken); // Simulate network delay

        // Get current game data BEFORE entering lock to avoid deadlock
        var allGames = await GetMiniGamesAsync(userId, cancellationToken);
        var currentGame = allGames.FirstOrDefault(g => g.Id == gameId);

        if (currentGame == null)
        {
            return new PlayMiniGameResult(
                Success: false,
                ErrorCode: "GAME_NOT_FOUND",
                ErrorMessage: "This game is no longer available"
            );
        }

        MiniGamePrize? wonPrize;

        lock (_lock)
        {
            // Validate game exists in state
            if (!_gameStates.ContainsKey(gameId))
            {
                return new PlayMiniGameResult(
                    Success: false,
                    ErrorCode: "GAME_NOT_FOUND",
                    ErrorMessage: "This game is no longer available"
                );
            }

            var state = _gameStates[gameId];

            // Check if user has spins remaining
            if (state.SpinCount <= 0)
            {
                return new PlayMiniGameResult(
                    Success: false,
                    ErrorCode: "MAX_ATTEMPTS_EXCEEDED",
                    ErrorMessage: "You've reached the maximum attempts for this period"
                );
            }

            // Deduct spin
            state.SpinCount--;

            // Simulate prize selection (weighted random)
            var random = new Random();
            var roll = random.Next(100);

            // Simple prize logic for demo:
            // - 60% chance: No Prize
            // - 30% chance: Common prize (first non-NoPrize with available pool)
            // - 9% chance: Rare prize (second prize with available pool)
            // - 1% chance: Jackpot (if exists)

            if (roll < 60)
            {
                // No prize
                wonPrize = currentGame.Prizes.First(p => p.PrizeType == MiniGamePrizeType.NoPrize);
            }
            else if (roll < 90)
            {
                // Common prize
                wonPrize = currentGame.Prizes
                    .Where(p => p.PrizeType != MiniGamePrizeType.NoPrize
                        && p.PrizeType != MiniGamePrizeType.Jackpot
                        && p.IsAvailable())
                    .FirstOrDefault();

                if (wonPrize == null)
                    wonPrize = currentGame.Prizes.First(p => p.PrizeType == MiniGamePrizeType.NoPrize);
            }
            else if (roll < 99)
            {
                // Rare prize
                wonPrize = currentGame.Prizes
                    .Where(p => p.PrizeType != MiniGamePrizeType.NoPrize
                        && p.PrizeType != MiniGamePrizeType.Jackpot
                        && p.IsAvailable())
                    .Skip(1)
                    .FirstOrDefault();

                if (wonPrize == null)
                    wonPrize = currentGame.Prizes.First(p => p.PrizeType == MiniGamePrizeType.NoPrize);
            }
            else
            {
                // Jackpot
                wonPrize = currentGame.Prizes
                    .FirstOrDefault(p => p.PrizeType == MiniGamePrizeType.Jackpot && p.IsAvailable());

                if (wonPrize == null)
                    wonPrize = currentGame.Prizes.First(p => p.PrizeType == MiniGamePrizeType.NoPrize);
            }

            // Update prize pool if applicable
            if (wonPrize.Pool.HasValue && !wonPrize.IsSurcharge)
            {
                if (_prizePools.ContainsKey(gameId) && _prizePools[gameId].ContainsKey(wonPrize.Id))
                {
                    _prizePools[gameId][wonPrize.Id]--;
                }
            }

            // Update jackpot
            if (currentGame.JackpotAddOnAttempt.HasValue)
            {
                if (wonPrize.PrizeType == MiniGamePrizeType.Jackpot)
                {
                    // Reset to seed value (10)
                    state.JackpotCurrent = 10.00m;
                }
                else
                {
                    // Increment jackpot
                    state.JackpotCurrent += currentGame.JackpotAddOnAttempt.Value;
                }
            }
        }

        // Get updated game state AFTER lock is released
        var updatedGames = await GetMiniGamesAsync(userId, cancellationToken);
        var updatedGame = updatedGames.First(g => g.Id == gameId);

        _logger.LogInformation("User {UserId} won prize {PrizeId} ({PrizeType}) in game {GameId}",
            userId, wonPrize.Id, wonPrize.PrizeType, gameId);

        return new PlayMiniGameResult(
            Success: true,
            PrizeId: wonPrize.Id,
            PrizeName: wonPrize.Name,
            PrizeType: wonPrize.PrizeType,
            PrizeValue: wonPrize.PrizeValue,
            UpdatedGame: updatedGame
        );
    }

    /// <summary>
    /// Internal class to track mutable game state
    /// </summary>
    private class GameState
    {
        public decimal JackpotCurrent { get; set; }
        public int SpinCount { get; set; }
    }
}
