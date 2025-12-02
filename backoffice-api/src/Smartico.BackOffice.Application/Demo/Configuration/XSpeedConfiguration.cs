using Smartico.BackOffice.Application.Badges.Commands;
using Smartico.BackOffice.Application.Badges.DTOs;
using Smartico.BackOffice.Application.Jackpots.Commands;
using Smartico.BackOffice.Application.Jackpots.DTOs;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Application.Missions.DTOs;
using Smartico.BackOffice.Application.Tournaments.Commands;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Demo.Configuration;

/// <summary>
/// Configuration data for xSpeed "Velocity Program" demo scenarios.
/// Contains all entity definitions matching the xSpeed specification.
/// </summary>
public static class XSpeedConfiguration
{
    #region Velocity Tiers

    /// <summary>
    /// Represents a Velocity Tier level configuration.
    /// </summary>
    public record VelocityTier(
        int TierNumber,
        string Name,
        int XpRequired,
        string Benefit,
        string RiskControl,
        BadgeRarity BadgeRarity);

    /// <summary>
    /// The 4 Velocity Tiers: Ignition, Cruiser, Turbo, Supersonic.
    /// </summary>
    public static readonly VelocityTier[] Tiers =
    {
        new VelocityTier(
            TierNumber: 1,
            Name: "Ignition",
            XpRequired: 0,
            Benefit: "Access to Basic Missions",
            RiskControl: "Cap rewards at $5 total value",
            BadgeRarity: BadgeRarity.Common),
        new VelocityTier(
            TierNumber: 2,
            Name: "Cruiser",
            XpRequired: 500,
            Benefit: "Unlocks Daily Drop Jackpot",
            RiskControl: "Must have deposited once",
            BadgeRarity: BadgeRarity.Rare),
        new VelocityTier(
            TierNumber: 3,
            Name: "Turbo",
            XpRequired: 5000,
            Benefit: "1.2x Multiplier on Mission Rewards",
            RiskControl: "Flag accounts reaching in <24h",
            BadgeRarity: BadgeRarity.Epic),
        new VelocityTier(
            TierNumber: 4,
            Name: "Supersonic",
            XpRequired: 25000,
            Benefit: "Private VIP Tournament Access",
            RiskControl: "Manual Withdrawal Review enabled",
            BadgeRarity: BadgeRarity.Legendary)
    };

    #endregion

    #region Mission Configurations

    /// <summary>
    /// Creates the Daily Driver mission command (Level 1+).
    /// Login + Wager $50 on any Slot = 10 Free Spins.
    /// </summary>
    public static CreateMissionCommand CreateDailyDriverMission() => new()
    {
        Name = "The Daily Driver",
        Description = "Your daily habit-building slot challenge. Requires Level 1+",
        CompletionXp = 100,
        TargetSegment = PlayerSegment.AllPlayers,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(365),
        Tasks = new List<MissionTaskDto>
        {
            new MissionTaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Login Today",
                Description = "Login to the platform",
                Order = 1,
                Trigger = new TaskTriggerDto
                {
                    Type = TriggerType.DailyLogin
                },
                Goal = new TaskGoalDto
                {
                    Type = GoalType.LoginCount,
                    TargetCount = 1
                }
            },
            new MissionTaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Spin the Reels",
                Description = "Wager $50 on any Slot",
                Order = 2,
                Trigger = new TaskTriggerDto
                {
                    Type = TriggerType.BetPlaced
                },
                Goal = new TaskGoalDto
                {
                    Type = GoalType.WageredAmount,
                    TargetAmount = 50
                }
            }
        }
    };

    /// <summary>
    /// Creates the Explorer mission command (Level 2+).
    /// Play 5 rounds of Keno/Lottery = 50 XP + Badge.
    /// </summary>
    public static CreateMissionCommand CreateExplorerMission() => new()
    {
        Name = "The Explorer",
        Description = "Try new game categories for XP boost! Requires Level 2+",
        CompletionXp = 50,
        TargetSegment = PlayerSegment.AllPlayers,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(365),
        Tasks = new List<MissionTaskDto>
        {
            new MissionTaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Try Keno or Lottery",
                Description = "Play 5 rounds of Keno or Lottery",
                Order = 1,
                Trigger = new TaskTriggerDto
                {
                    Type = TriggerType.GamePlayed,
                    EligibleGames = new List<string> { "keno", "lottery" }
                },
                Goal = new TaskGoalDto
                {
                    Type = GoalType.BetCount,
                    TargetCount = 5,
                    EligibleGames = new List<string> { "keno", "lottery" }
                }
            }
        }
    };

    /// <summary>
    /// Creates the Table Tactician mission command (Level 3+).
    /// Win 5 hands of Blackjack/Baccarat in a row = $10 Cash Credit.
    /// </summary>
    public static CreateMissionCommand CreateTableTacticianMission() => new()
    {
        Name = "The Table Tactician",
        Description = "Master the tables for cash rewards. Requires Level 3+",
        CompletionXp = 250,
        TargetSegment = PlayerSegment.AllPlayers,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(365),
        Tasks = new List<MissionTaskDto>
        {
            new MissionTaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Win Streak",
                Description = "Win 5 hands of Blackjack or Baccarat (min bet $2)",
                Order = 1,
                Trigger = new TaskTriggerDto
                {
                    Type = TriggerType.BetPlaced,
                    MinAmount = 2,
                    EligibleGames = new List<string> { "blackjack", "baccarat" }
                },
                Goal = new TaskGoalDto
                {
                    Type = GoalType.BetCount,
                    TargetCount = 5,
                    EligibleGames = new List<string> { "blackjack", "baccarat" }
                }
            }
        }
    };

    /// <summary>
    /// Creates the Whale Challenge mission command (Level 4+).
    /// Wager $5,000 total = VIP Bonus Package.
    /// </summary>
    public static CreateMissionCommand CreateWhaleMission() => new()
    {
        Name = "The Whale Challenge",
        Description = "Weekly VIP high-stakes challenge. Requires Level 4+",
        CompletionXp = 1000,
        TargetSegment = PlayerSegment.VipOnly,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(7),
        Tasks = new List<MissionTaskDto>
        {
            new MissionTaskDto
            {
                Id = Guid.NewGuid().ToString(),
                Name = "High Volume",
                Description = "Wager $5,000 total this week",
                Order = 1,
                Trigger = new TaskTriggerDto
                {
                    Type = TriggerType.BetPlaced
                },
                Goal = new TaskGoalDto
                {
                    Type = GoalType.WageredAmount,
                    TargetAmount = 5000
                }
            }
        }
    };

    #endregion

    #region Jackpot Configurations

    /// <summary>
    /// Creates the Hourly Prize Drop jackpot command.
    /// Time-based, drops every 60 minutes.
    /// </summary>
    public static CreateJackpotCommand CreateHourlyPrizeDropJackpot() => new()
    {
        Name = "xSpeed Hourly Prize Drop",
        Description = "Surprise drop every 60 minutes! Must wager >$10 in last 15 mins to qualify.",
        Type = JackpotType.Progressive,
        Currency = "USD",
        EligibleGames = new List<string>(),
        ResetBehavior = JackpotResetBehavior.ResetToSeed,
        PrizeDistribution = new JackpotPrizeDistributionDto
        {
            DistributionType = PrizeDistributionType.WinnerTakesAll
        },
        Tiers = new List<JackpotTierDto>
        {
            new JackpotTierDto
            {
                TierId = Guid.NewGuid().ToString(),
                TierName = "Hourly Drop",
                SeedAmount = 50,
                ContributionRate = 0.001m,
                CurrentValue = 50,
                DisplayOrder = 1,
                TriggerCondition = new JackpotTriggerConditionDto
                {
                    TriggerType = JackpotTriggerType.TimeBased,
                    TimeInterval = JackpotTimeInterval.Hourly
                }
            }
        }
    };

    /// <summary>
    /// Creates the Daily Pot jackpot command.
    /// Time-based, drops during prime-time 8-10 PM.
    /// </summary>
    public static CreateJackpotCommand CreateDailyPotJackpot() => new()
    {
        Name = "xSpeed Daily Pot",
        Description = "Prime-time jackpot drop 8-10 PM! RNG review required.",
        Type = JackpotType.Progressive,
        Currency = "USD",
        EligibleGames = new List<string>(),
        ResetBehavior = JackpotResetBehavior.ResetToSeed,
        PrizeDistribution = new JackpotPrizeDistributionDto
        {
            DistributionType = PrizeDistributionType.WinnerTakesAll
        },
        Tiers = new List<JackpotTierDto>
        {
            new JackpotTierDto
            {
                TierId = Guid.NewGuid().ToString(),
                TierName = "Daily Grand",
                SeedAmount = 500,
                ContributionRate = 0.002m,
                CurrentValue = 500,
                DisplayOrder = 1,
                TriggerCondition = new JackpotTriggerConditionDto
                {
                    TriggerType = JackpotTriggerType.TimeBased,
                    TimeInterval = JackpotTimeInterval.Daily,
                    TimeOfDay = "20:00"
                }
            }
        }
    };

    /// <summary>
    /// Creates the Mega Pot jackpot command.
    /// Amount-based, drops at $50,000.
    /// </summary>
    public static CreateJackpotCommand CreateMegaPotJackpot() => new()
    {
        Name = "xSpeed Mega Pot",
        Description = "The life-changing jackpot - drops at $50,000! Alert if growth >20% above average.",
        Type = JackpotType.Progressive,
        Currency = "USD",
        EligibleGames = new List<string>(),
        ResetBehavior = JackpotResetBehavior.ResetToSeed,
        PrizeDistribution = new JackpotPrizeDistributionDto
        {
            DistributionType = PrizeDistributionType.WinnerTakesAll
        },
        Tiers = new List<JackpotTierDto>
        {
            new JackpotTierDto
            {
                TierId = Guid.NewGuid().ToString(),
                TierName = "Mega",
                SeedAmount = 10000,
                ContributionRate = 0.0015m,
                CurrentValue = 10000,
                MaxValue = 60000,
                DisplayOrder = 1,
                TriggerCondition = new JackpotTriggerConditionDto
                {
                    TriggerType = JackpotTriggerType.AmountBased,
                    TriggerAmount = 50000
                }
            }
        }
    };

    #endregion

    #region Badge Configurations

    /// <summary>
    /// Creates a Velocity Tier badge command.
    /// </summary>
    public static CreateBadgeCommand CreateVelocityTierBadge(
        VelocityTier tier,
        string seriesId) => new()
    {
        Name = $"{tier.Name} Badge",
        Description = tier.TierNumber == 1
            ? "Welcome to the Velocity Program!"
            : $"You've reached {tier.Name} tier - {tier.Benefit}",
        Rarity = tier.BadgeRarity,
        SeriesId = seriesId,
        OrderInSeries = tier.TierNumber,
        ProgressTrackingEnabled = tier.TierNumber > 1,
        UnlockCriteria = new BadgeUnlockCriteriaDto
        {
            Type = tier.TierNumber == 1
                ? BadgeUnlockCriteriaType.FirstDeposit
                : BadgeUnlockCriteriaType.WagerAmount,
            ThresholdValue = tier.XpRequired * 10, // XP = wager / 10, so threshold = XP * 10
            Description = tier.TierNumber == 1
                ? "Join the Velocity Program"
                : $"Reach {tier.XpRequired:N0} XP (wager ${tier.XpRequired * 10:N0})"
        },
        Reward = new BadgeRewardDto
        {
            Type = tier.BadgeRarity switch
            {
                BadgeRarity.Common => BadgeRewardType.FreeSpins,
                BadgeRarity.Rare => BadgeRewardType.FreeSpins,
                BadgeRarity.Epic => BadgeRewardType.Cash,
                BadgeRarity.Legendary => BadgeRewardType.Cash,
                _ => BadgeRewardType.FreeSpins
            },
            Value = tier.BadgeRarity switch
            {
                BadgeRarity.Common => 10,
                BadgeRarity.Rare => 25,
                BadgeRarity.Epic => 50,
                BadgeRarity.Legendary => 100,
                _ => 10
            }
        }
    };

    /// <summary>
    /// Gets all badge definitions for the Velocity Tier series.
    /// </summary>
    public static IEnumerable<CreateBadgeCommand> GetVelocityTierBadges(string seriesId)
    {
        return Tiers.Select(tier => CreateVelocityTierBadge(tier, seriesId));
    }

    #endregion

    #region Tournament Configurations

    /// <summary>
    /// Creates the Slot Sprint tournament command.
    /// Track A: Highest Single Spin Win Multiplier.
    /// Weekly tournament with $2,500 prize pool.
    /// </summary>
    public static CreateTournamentCommand CreateSlotSprintTournament() => new()
    {
        Name = "xSpeed Slot Sprint",
        Description = "Weekly slot tournament! Compete for the highest single spin win multiplier. Level 2+ only.",
        Type = TournamentType.Leaderboard,
        ScoringType = ScoringType.HighestWin,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(7),
        PrizePool = 2500,
        MaxParticipants = 500,
        EntryFee = 0,
        EligibleGames = new List<string> { "slots" },
        PrizeDistribution = new List<PrizeDistribution>
        {
            new PrizeDistribution(1, null, 1000, PrizeType.Cash),
            new PrizeDistribution(2, null, 500, PrizeType.Cash),
            new PrizeDistribution(3, null, 250, PrizeType.Cash),
            new PrizeDistribution(4, 10, 75, PrizeType.Cash)
        }
    };

    /// <summary>
    /// Creates the High Roller Table Wars tournament command.
    /// Track B: Total Wager Amount on table games.
    /// Weekly tournament with $5,000 prize pool.
    /// </summary>
    public static CreateTournamentCommand CreateHighRollerTableWarsTournament() => new()
    {
        Name = "xSpeed High Roller Table Wars",
        Description = "Weekly table games tournament! Compete for the highest total wager. Level 3+ VIPs only.",
        Type = TournamentType.Leaderboard,
        ScoringType = ScoringType.WageringVolume,
        StartDate = DateTime.UtcNow,
        EndDate = DateTime.UtcNow.AddDays(7),
        PrizePool = 5000,
        MaxParticipants = 100,
        EntryFee = 0,
        EligibleGames = new List<string> { "blackjack", "baccarat", "roulette", "poker" },
        PrizeDistribution = new List<PrizeDistribution>
        {
            new PrizeDistribution(1, null, 2000, PrizeType.Cash),
            new PrizeDistribution(2, null, 1000, PrizeType.Cash),
            new PrizeDistribution(3, null, 500, PrizeType.Cash),
            new PrizeDistribution(4, 10, 150, PrizeType.Cash)
        }
    };

    #endregion
}
