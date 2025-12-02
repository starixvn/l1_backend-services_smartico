using MongoDB.Bson;
using Smartico.BackOffice.Application.Demo.Configuration;
using Smartico.BackOffice.Application.Demo.DTOs;
using Smartico.BackOffice.Application.Demo.Interfaces;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Application.Missions.DTOs;
using Smartico.BackOffice.Application.Missions.Interfaces;
using Smartico.BackOffice.Application.Jackpots.Commands;
using Smartico.BackOffice.Application.Jackpots.DTOs;
using Smartico.BackOffice.Application.Jackpots.Interfaces;
using Smartico.BackOffice.Application.Badges.Commands;
using Smartico.BackOffice.Application.Badges.DTOs;
using Smartico.BackOffice.Application.Badges.Interfaces;
using Smartico.BackOffice.Application.BadgeSeries.Commands;
using Smartico.BackOffice.Application.BadgeSeries.Interfaces;
using Smartico.BackOffice.Application.Tournaments.Commands;
using Smartico.BackOffice.Application.Tournaments.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;
using Microsoft.Extensions.Logging;

namespace Smartico.BackOffice.Application.Demo.Services;

/// <summary>
/// Service for setting up demo scenarios for operator onboarding and demonstrations.
/// </summary>
public class DemoScenarioService : IDemoScenarioService
{
    private readonly IMissionService _missionService;
    private readonly PublishMissionCommandHandler _publishMissionHandler;
    private readonly IJackpotService _jackpotService;
    private readonly IBadgeService _badgeService;
    private readonly IBadgeSeriesService _badgeSeriesService;
    private readonly ITournamentService _tournamentService;
    private readonly ILogger<DemoScenarioService> _logger;

    private static readonly List<DemoScenarioDto> _scenarios = new()
    {
        // Mission Scenarios
        new DemoScenarioDto
        {
            Id = "mission-new-game-launch",
            Name = "New Game Launch Promotion",
            Description = "Creates a mission to promote a new game (Dragon's Fortune) with tasks for trying the game, wagering, and winning.",
            Category = "Mission",
            Entities = new List<string> { "Mission with 3 tasks" },
            ExpectedOutcome = "40-60% of active players try the new game within first week."
        },
        new DemoScenarioDto
        {
            Id = "mission-weekend-warrior",
            Name = "Weekend Engagement Boost",
            Description = "Creates a recurring weekend mission to increase Saturday-Sunday betting activity.",
            Category = "Mission",
            Entities = new List<string> { "Mission with 3 tasks" },
            ExpectedOutcome = "25-35% increase in weekend wagering activity."
        },
        new DemoScenarioDto
        {
            Id = "mission-vip-retention",
            Name = "VIP Player Retention",
            Description = "Creates a VIP-exclusive challenge mission to re-engage high-value players.",
            Category = "Mission",
            Entities = new List<string> { "VIP Mission with 3 tasks" },
            ExpectedOutcome = "50% VIP re-engagement rate, reduced churn."
        },

        // Jackpot Scenarios
        new DemoScenarioDto
        {
            Id = "jackpot-classic-progressive",
            Name = "Classic Progressive Jackpot",
            Description = "Creates a 4-tier progressive jackpot (Mini, Minor, Major, Grand) with random triggers.",
            Category = "Jackpot",
            Entities = new List<string> { "Progressive Jackpot with 4 tiers" },
            ExpectedOutcome = "Players stay longer chasing the growing jackpot."
        },
        new DemoScenarioDto
        {
            Id = "jackpot-daily-must-drop",
            Name = "Daily Must-Drop Jackpot",
            Description = "Creates a time-based jackpot that guarantees daily and hourly winners.",
            Category = "Jackpot",
            Entities = new List<string> { "Time-based Jackpot with 2 tiers" },
            ExpectedOutcome = "Players return daily for guaranteed drop times, 30% increase in evening activity."
        },
        new DemoScenarioDto
        {
            Id = "jackpot-amount-based",
            Name = "High-Value Must-Drop Jackpot",
            Description = "Creates an amount-based jackpot that triggers when reaching $2,000 with proportional prize distribution.",
            Category = "Jackpot",
            Entities = new List<string> { "Amount-based Jackpot with proportional distribution" },
            ExpectedOutcome = "Activity spikes as jackpot approaches target value."
        },
        new DemoScenarioDto
        {
            Id = "jackpot-split-winners",
            Name = "Tournament-Style Split Jackpot",
            Description = "Creates a jackpot with split distribution among 10 winners.",
            Category = "Jackpot",
            Entities = new List<string> { "Split Jackpot with 10 winners" },
            ExpectedOutcome = "10 winners per jackpot creates social buzz and 'it could be me' mentality."
        },

        // Badge Scenarios
        new DemoScenarioDto
        {
            Id = "badge-slots-master",
            Name = "Slots Master Badge Collection",
            Description = "Creates a badge series for slot enthusiasts (Beginner → Intermediate → Expert → Master).",
            Category = "Badge",
            Entities = new List<string> { "Badge Series", "4 Badges with progressive criteria" },
            ExpectedOutcome = "Increased slot engagement and player progression."
        },
        new DemoScenarioDto
        {
            Id = "badge-high-roller",
            Name = "High Roller Badge Collection",
            Description = "Creates a badge series for high-volume wagerers (Rising Star → Big Spender → High Roller → Whale).",
            Category = "Badge",
            Entities = new List<string> { "Badge Series", "4 Badges with wager thresholds" },
            ExpectedOutcome = "Incentivizes higher wagering volumes."
        },
        new DemoScenarioDto
        {
            Id = "badge-loyalty-legend",
            Name = "Loyalty Legend Badge Collection",
            Description = "Creates a badge series for loyal players (First Steps → Coming Back → Dedicated → Legend).",
            Category = "Badge",
            Entities = new List<string> { "Badge Series", "4 Badges with login criteria" },
            ExpectedOutcome = "25% increase in daily logins."
        },

        // Complete Scenarios
        new DemoScenarioDto
        {
            Id = "complete-starter-pack",
            Name = "Complete Starter Pack",
            Description = "Sets up a complete demo environment with missions, jackpots, and badges for new operators.",
            Category = "Complete",
            Entities = new List<string>
            {
                "3 Missions (New Game, Weekend, VIP)",
                "4 Jackpots (Progressive, Daily Drop, Amount-Based, Split)",
                "3 Badge Series (Slots, High Roller, Loyalty)"
            },
            ExpectedOutcome = "Full gamification system ready for demonstration or production use."
        },

        // xSpeed Velocity Program Scenarios
        new DemoScenarioDto
        {
            Id = "xspeed-velocity-program",
            Name = "xSpeed Velocity Program (Complete)",
            Description = "Complete xSpeed gamification journey with Velocity Tiers, level-gated missions, Mystery Drop jackpots, tournaments, and achievement badges.",
            Category = "Complete",
            Entities = new List<string>
            {
                "4 Velocity Tier Badges (Ignition, Cruiser, Turbo, Supersonic)",
                "4 Level-Gated Missions (Daily Driver, Explorer, Table Tactician, Whale)",
                "3 xSpeed Mystery Drop Jackpots (Hourly, Daily, Mega)",
                "2 Tournaments (Slot Sprint, High Roller Table Wars)"
            },
            ExpectedOutcome = "Full xSpeed Velocity Program ready for demonstration with tier progression."
        },
        new DemoScenarioDto
        {
            Id = "xspeed-phase-1",
            Name = "xSpeed Phase 1 (Soft Launch)",
            Description = "Phase 1 soft launch: Levels 1-2 (Ignition, Cruiser), Daily Driver mission, and 2 tier badges.",
            Category = "Complete",
            Entities = new List<string>
            {
                "2 Velocity Tier Badges (Ignition, Cruiser)",
                "1 Mission (Daily Driver - Level 1+)"
            },
            ExpectedOutcome = "Soft launch configuration for testing basic progression."
        },
        new DemoScenarioDto
        {
            Id = "xspeed-phase-2",
            Name = "xSpeed Phase 2 (Expansion)",
            Description = "Phase 2 expansion: All 4 tiers, Table Tactician mission, and Hourly Prize Drop jackpot.",
            Category = "Complete",
            Entities = new List<string>
            {
                "4 Velocity Tier Badges (all tiers)",
                "2 Missions (Daily Driver + Table Tactician)",
                "1 Jackpot (Hourly Prize Drop)"
            },
            ExpectedOutcome = "Expanded configuration with table game missions and hourly jackpot."
        },
        new DemoScenarioDto
        {
            Id = "xspeed-phase-3",
            Name = "xSpeed Phase 3 (Full Velocity)",
            Description = "Phase 3 full velocity: Complete journey with all missions, jackpots, tournaments, and cross-sell features.",
            Category = "Complete",
            Entities = new List<string>
            {
                "4 Velocity Tier Badges",
                "4 Missions (all including Explorer and Whale)",
                "3 Jackpots (Hourly, Daily, Mega)",
                "2 Tournaments (Slot Sprint, High Roller Table Wars)"
            },
            ExpectedOutcome = "Complete xSpeed journey with tournaments and cross-sell missions."
        }
    };

    public DemoScenarioService(
        IMissionService missionService,
        PublishMissionCommandHandler publishMissionHandler,
        IJackpotService jackpotService,
        IBadgeService badgeService,
        IBadgeSeriesService badgeSeriesService,
        ITournamentService tournamentService,
        ILogger<DemoScenarioService> logger)
    {
        _missionService = missionService;
        _publishMissionHandler = publishMissionHandler;
        _jackpotService = jackpotService;
        _badgeService = badgeService;
        _badgeSeriesService = badgeSeriesService;
        _tournamentService = tournamentService;
        _logger = logger;
    }

    public Task<IEnumerable<DemoScenarioDto>> GetAvailableScenariosAsync()
    {
        return Task.FromResult<IEnumerable<DemoScenarioDto>>(_scenarios);
    }

    public Task<IEnumerable<DemoScenarioDto>> GetScenariosByCategoryAsync(string category)
    {
        var filtered = _scenarios.Where(s =>
            s.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(filtered);
    }

    public async Task<DemoSetupResultDto> SetupScenarioAsync(
        string scenarioId,
        ObjectId operatorId,
        bool activateEntities = false)
    {
        var scenario = _scenarios.FirstOrDefault(s => s.Id == scenarioId);
        if (scenario == null)
        {
            return new DemoSetupResultDto
            {
                ScenarioId = scenarioId,
                Success = false,
                Message = $"Scenario '{scenarioId}' not found."
            };
        }

        _logger.LogInformation("Setting up demo scenario {ScenarioId} for operator {OperatorId}",
            scenarioId, operatorId);

        try
        {
            var result = new DemoSetupResultDto
            {
                ScenarioId = scenarioId,
                ScenarioName = scenario.Name,
                Success = true,
                CreatedEntities = new List<CreatedEntityDto>()
            };

            switch (scenarioId)
            {
                // Mission Scenarios
                case "mission-new-game-launch":
                    await SetupNewGameLaunchMission(operatorId, result, activateEntities);
                    break;
                case "mission-weekend-warrior":
                    await SetupWeekendWarriorMission(operatorId, result, activateEntities);
                    break;
                case "mission-vip-retention":
                    await SetupVipRetentionMission(operatorId, result, activateEntities);
                    break;

                // Jackpot Scenarios
                case "jackpot-classic-progressive":
                    await SetupClassicProgressiveJackpot(operatorId, result, activateEntities);
                    break;
                case "jackpot-daily-must-drop":
                    await SetupDailyMustDropJackpot(operatorId, result, activateEntities);
                    break;
                case "jackpot-amount-based":
                    await SetupAmountBasedJackpot(operatorId, result, activateEntities);
                    break;
                case "jackpot-split-winners":
                    await SetupSplitWinnersJackpot(operatorId, result, activateEntities);
                    break;

                // Badge Scenarios
                case "badge-slots-master":
                    await SetupSlotsMasterBadges(operatorId, result, activateEntities);
                    break;
                case "badge-high-roller":
                    await SetupHighRollerBadges(operatorId, result, activateEntities);
                    break;
                case "badge-loyalty-legend":
                    await SetupLoyaltyLegendBadges(operatorId, result, activateEntities);
                    break;

                // Complete Scenarios
                case "complete-starter-pack":
                    await SetupCompleteStarterPack(operatorId, result, activateEntities);
                    break;

                // xSpeed Velocity Program Scenarios
                case "xspeed-velocity-program":
                    await SetupXSpeedVelocityProgram(operatorId, result, activateEntities);
                    break;
                case "xspeed-phase-1":
                    await SetupXSpeedPhase1(operatorId, result, activateEntities);
                    break;
                case "xspeed-phase-2":
                    await SetupXSpeedPhase2(operatorId, result, activateEntities);
                    break;
                case "xspeed-phase-3":
                    await SetupXSpeedPhase3(operatorId, result, activateEntities);
                    break;

                default:
                    result.Success = false;
                    result.Message = $"Scenario '{scenarioId}' implementation not found.";
                    break;
            }

            if (result.Success)
            {
                result.Message = $"Successfully created {result.CreatedEntities.Count} entities for scenario '{scenario.Name}'.";
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up demo scenario {ScenarioId}", scenarioId);
            return new DemoSetupResultDto
            {
                ScenarioId = scenarioId,
                ScenarioName = scenario.Name,
                Success = false,
                Message = $"Error setting up scenario: {ex.Message}"
            };
        }
    }

    public async Task<List<DemoSetupResultDto>> SetupAllScenariosAsync(
        ObjectId operatorId,
        bool activateEntities = false)
    {
        var results = new List<DemoSetupResultDto>();

        // Skip the "complete-starter-pack" to avoid duplicates
        var scenariosToSetup = _scenarios.Where(s => s.Id != "complete-starter-pack");

        foreach (var scenario in scenariosToSetup)
        {
            var result = await SetupScenarioAsync(scenario.Id, operatorId, activateEntities);
            results.Add(result);
        }

        return results;
    }

    public Task<bool> CleanupDemoDataAsync(ObjectId operatorId)
    {
        // This would delete all demo-created data
        // For now, return true - implementation would require tracking demo-created entities
        _logger.LogInformation("Cleanup demo data requested for operator {OperatorId}", operatorId);
        return Task.FromResult(true);
    }

    #region Mission Setup Methods

    private async Task SetupNewGameLaunchMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = new CreateMissionCommand
        {
            Name = "Dragon's Fortune Discovery",
            Description = "Complete these game challenges to win amazing rewards! Try our newest slot game.",
            CompletionXp = 1000,
            TargetSegment = PlayerSegment.AllPlayers,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(7),
            Tasks = new List<MissionTaskDto>
            {
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Try Dragon's Fortune",
                    Description = "Play 10 spins on Dragon's Fortune",
                    Order = 1,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.BetPlaced,
                        EligibleGames = new List<string> { "dragon-fortune" }
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.BetCount,
                        TargetCount = 10
                    }
                },
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Big Spender",
                    Description = "Wager $100 on Dragon's Fortune with bets of $10+",
                    Order = 2,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.BetPlaced,
                        MinAmount = 10,
                        EligibleGames = new List<string> { "dragon-fortune" }
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.WageredAmount,
                        TargetAmount = 100
                    }
                },
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Lucky Dragon",
                    Description = "Win 5 times on Dragon's Fortune",
                    Order = 3,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.BetPlaced,
                        EligibleGames = new List<string> { "dragon-fortune" }
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.BetCount,
                        TargetCount = 5
                    }
                }
            }
        };

        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    private async Task SetupWeekendWarriorMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        // Get next Saturday
        var today = DateTime.UtcNow.Date;
        var daysUntilSaturday = ((int)DayOfWeek.Saturday - (int)today.DayOfWeek + 7) % 7;
        if (daysUntilSaturday == 0) daysUntilSaturday = 7;
        var nextSaturday = today.AddDays(daysUntilSaturday);

        var command = new CreateMissionCommand
        {
            Name = "Weekend Warrior",
            Description = "Complete these weekend challenges for bonus rewards!",
            CompletionXp = 500,
            TargetSegment = PlayerSegment.AllPlayers,
            StartDate = nextSaturday,
            EndDate = nextSaturday.AddDays(2).AddSeconds(-1), // Sunday 23:59:59
            Tasks = new List<MissionTaskDto>
            {
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Saturday Starter",
                    Description = "Make a deposit of $50 or more",
                    Order = 1,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.DepositMade,
                        MinAmount = 50
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.DepositAmount,
                        TargetAmount = 50
                    }
                },
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Spin Master",
                    Description = "Complete 100 spins on any slot game",
                    Order = 2,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.BetPlaced
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.BetCount,
                        TargetCount = 100
                    }
                },
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "High Roller Hour",
                    Description = "Place 10 bets of $25 or more",
                    Order = 3,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.BetPlaced,
                        MinAmount = 25
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.BetCount,
                        TargetCount = 10
                    }
                }
            }
        };

        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    private async Task SetupVipRetentionMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = new CreateMissionCommand
        {
            Name = "VIP Exclusive Challenge",
            Description = "Exclusive challenges for our VIP players - complete for premium rewards!",
            CompletionXp = 2500,
            TargetSegment = PlayerSegment.VipOnly,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            Tasks = new List<MissionTaskDto>
            {
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "High Stakes",
                    Description = "Place 20 bets of $100 or more",
                    Order = 1,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.BetPlaced,
                        MinAmount = 100
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.BetCount,
                        TargetCount = 20
                    }
                },
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Multi-Game Master",
                    Description = "Play on 5 different slot games",
                    Order = 2,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.GamePlayed,
                        EligibleGames = new List<string> { "wukong", "candy-land", "olympub", "dragon-fortune", "mega-moolah" }
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.BetCount,
                        TargetCount = 5,
                        EligibleGames = new List<string> { "wukong", "candy-land", "olympub", "dragon-fortune", "mega-moolah" }
                    }
                },
                new MissionTaskDto
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = "Persistence Pays",
                    Description = "Login 7 consecutive days",
                    Order = 3,
                    Trigger = new TaskTriggerDto
                    {
                        Type = TriggerType.DailyLogin
                    },
                    Goal = new TaskGoalDto
                    {
                        Type = GoalType.LoginCount,
                        TargetCount = 7
                    }
                }
            }
        };

        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    #endregion

    #region Jackpot Setup Methods

    private async Task SetupClassicProgressiveJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = new CreateJackpotCommand
        {
            Name = "Mega Fortune Jackpot",
            Description = "The ultimate progressive jackpot with 4 tiers - Mini, Minor, Major, and Grand!",
            Type = JackpotType.Progressive,
            Currency = "USD",
            EligibleGames = new List<string>(), // All games
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
                    TierName = "Grand",
                    SeedAmount = 10000,
                    ContributionRate = 0.001m, // 0.1%
                    CurrentValue = 10000,
                    DisplayOrder = 4,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.Random,
                        Probability = 0.000001m // 0.0001%
                    }
                },
                new JackpotTierDto
                {
                    TierId = Guid.NewGuid().ToString(),
                    TierName = "Major",
                    SeedAmount = 1000,
                    ContributionRate = 0.0005m, // 0.05%
                    CurrentValue = 1000,
                    DisplayOrder = 3,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.Random,
                        Probability = 0.00001m // 0.001%
                    }
                },
                new JackpotTierDto
                {
                    TierId = Guid.NewGuid().ToString(),
                    TierName = "Minor",
                    SeedAmount = 100,
                    ContributionRate = 0.0003m, // 0.03%
                    CurrentValue = 100,
                    DisplayOrder = 2,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.Random,
                        Probability = 0.0001m // 0.01%
                    }
                },
                new JackpotTierDto
                {
                    TierId = Guid.NewGuid().ToString(),
                    TierName = "Mini",
                    SeedAmount = 10,
                    ContributionRate = 0.0002m, // 0.02%
                    CurrentValue = 10,
                    DisplayOrder = 1,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.Random,
                        Probability = 0.001m // 0.1%
                    }
                }
            }
        };

        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    private async Task SetupDailyMustDropJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = new CreateJackpotCommand
        {
            Name = "Daily Drop Jackpot",
            Description = "Guaranteed daily and hourly drops - someone wins every hour!",
            Type = JackpotType.Progressive,
            Currency = "USD",
            EligibleGames = new List<string> { "wukong", "candy-land", "olympub" },
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
                    ContributionRate = 0.002m, // 0.2%
                    CurrentValue = 500,
                    DisplayOrder = 2,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.TimeBased,
                        TimeInterval = JackpotTimeInterval.Daily,
                        TimeOfDay = "21:00"
                    }
                },
                new JackpotTierDto
                {
                    TierId = Guid.NewGuid().ToString(),
                    TierName = "Hourly Mini",
                    SeedAmount = 25,
                    ContributionRate = 0.001m, // 0.1%
                    CurrentValue = 25,
                    DisplayOrder = 1,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.TimeBased,
                        TimeInterval = JackpotTimeInterval.Hourly
                    }
                }
            }
        };

        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    private async Task SetupAmountBasedJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = new CreateJackpotCommand
        {
            Name = "Guaranteed $2K Drop",
            Description = "This jackpot MUST drop when it reaches $2,000 - watch it grow!",
            Type = JackpotType.Progressive,
            Currency = "USD",
            EligibleGames = new List<string>(), // All games
            ResetBehavior = JackpotResetBehavior.ResetToSeed,
            PrizeDistribution = new JackpotPrizeDistributionDto
            {
                DistributionType = PrizeDistributionType.ProportionalToWager,
                MaxWinners = 10,
                MinimumWagerToQualify = 10,
                MaxPercentagePerPlayer = 50
            },
            Tiers = new List<JackpotTierDto>
            {
                new JackpotTierDto
                {
                    TierId = Guid.NewGuid().ToString(),
                    TierName = "Mega Drop",
                    SeedAmount = 500,
                    ContributionRate = 0.0015m, // 0.15%
                    CurrentValue = 500,
                    MaxValue = 2500,
                    DisplayOrder = 1,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.AmountBased,
                        TriggerAmount = 2000
                    }
                }
            }
        };

        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    private async Task SetupSplitWinnersJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = new CreateJackpotCommand
        {
            Name = "Lucky 10 Jackpot",
            Description = "10 players share the jackpot - more winners, more excitement!",
            Type = JackpotType.Progressive,
            Currency = "USD",
            EligibleGames = new List<string>(), // All games
            ResetBehavior = JackpotResetBehavior.ResetToSeed,
            PrizeDistribution = new JackpotPrizeDistributionDto
            {
                DistributionType = PrizeDistributionType.SplitAmongWinners,
                MaxWinners = 10,
                WinnerPercentages = new List<decimal> { 30, 20, 15, 10, 8, 6, 5, 3, 2, 1 }
            },
            Tiers = new List<JackpotTierDto>
            {
                new JackpotTierDto
                {
                    TierId = Guid.NewGuid().ToString(),
                    TierName = "Lucky 10",
                    SeedAmount = 1000,
                    ContributionRate = 0.001m, // 0.1%
                    CurrentValue = 1000,
                    DisplayOrder = 1,
                    TriggerCondition = new JackpotTriggerConditionDto
                    {
                        TriggerType = JackpotTriggerType.Random,
                        Probability = 0.00001m // 0.001%
                    }
                }
            }
        };

        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    #endregion

    #region Badge Setup Methods

    private async Task SetupSlotsMasterBadges(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        // Create the series first
        var seriesCommand = new CreateBadgeSeriesCommand
        {
            Name = "Slots Master",
            Description = "Progress from beginner to master slot player!",
            DisplayOrder = 1
        };

        var series = await _badgeSeriesService.CreateAsync(seriesCommand, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "BadgeSeries",
            Id = series.Id,
            Name = series.Name,
            Status = series.Status.ToString()
        });

        // Create badges
        var badges = new[]
        {
            new CreateBadgeCommand
            {
                Name = "Slot Beginner",
                Description = "Play 100 slot spins",
                Rarity = BadgeRarity.Common,
                SeriesId = series.Id,
                OrderInSeries = 1,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.BetCount,
                    ThresholdValue = 100,
                    Description = "Play 100 slot spins"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.FreeSpins,
                    Value = 10
                }
            },
            new CreateBadgeCommand
            {
                Name = "Slot Intermediate",
                Description = "Play 1,000 slot spins",
                Rarity = BadgeRarity.Rare,
                SeriesId = series.Id,
                OrderInSeries = 2,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.BetCount,
                    ThresholdValue = 1000,
                    Description = "Play 1,000 slot spins"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.FreeSpins,
                    Value = 50
                }
            },
            new CreateBadgeCommand
            {
                Name = "Slot Expert",
                Description = "Play 10,000 slot spins",
                Rarity = BadgeRarity.Epic,
                SeriesId = series.Id,
                OrderInSeries = 3,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.BetCount,
                    ThresholdValue = 10000,
                    Description = "Play 10,000 slot spins"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.FreeSpins,
                    Value = 200
                }
            },
            new CreateBadgeCommand
            {
                Name = "Slot Master",
                Description = "Play 100,000 slot spins - you are a true master!",
                Rarity = BadgeRarity.Legendary,
                SeriesId = series.Id,
                OrderInSeries = 4,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.BetCount,
                    ThresholdValue = 100000,
                    Description = "Play 100,000 slot spins"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.Cash,
                    Value = 100
                }
            }
        };

        foreach (var badgeCmd in badges)
        {
            var badge = await _badgeService.CreateAsync(badgeCmd, operatorId);
            result.CreatedEntities.Add(new CreatedEntityDto
            {
                Type = "Badge",
                Id = badge.Id,
                Name = badge.Name,
                Status = badge.Status.ToString()
            });

            if (activate)
            {
                await _badgeService.PublishAsync(badge.Id, operatorId);
                result.CreatedEntities[^1].Status = "Active";
            }
        }

        if (activate)
        {
            await _badgeSeriesService.PublishAsync(series.Id, operatorId);
            result.CreatedEntities[0].Status = "Active";
        }
    }

    private async Task SetupHighRollerBadges(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var seriesCommand = new CreateBadgeSeriesCommand
        {
            Name = "High Roller",
            Description = "Climb the ranks from Rising Star to Whale!",
            DisplayOrder = 2
        };

        var series = await _badgeSeriesService.CreateAsync(seriesCommand, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "BadgeSeries",
            Id = series.Id,
            Name = series.Name,
            Status = series.Status.ToString()
        });

        var badges = new[]
        {
            new CreateBadgeCommand
            {
                Name = "Rising Star",
                Description = "Wager $1,000 total",
                Rarity = BadgeRarity.Common,
                SeriesId = series.Id,
                OrderInSeries = 1,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.WagerAmount,
                    ThresholdValue = 1000,
                    Description = "Wager $1,000 total"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.FreeSpins,
                    Value = 25
                }
            },
            new CreateBadgeCommand
            {
                Name = "Big Spender",
                Description = "Wager $10,000 total",
                Rarity = BadgeRarity.Rare,
                SeriesId = series.Id,
                OrderInSeries = 2,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.WagerAmount,
                    ThresholdValue = 10000,
                    Description = "Wager $10,000 total"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.Cash,
                    Value = 50
                }
            },
            new CreateBadgeCommand
            {
                Name = "High Roller",
                Description = "Wager $100,000 total",
                Rarity = BadgeRarity.Epic,
                SeriesId = series.Id,
                OrderInSeries = 3,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.WagerAmount,
                    ThresholdValue = 100000,
                    Description = "Wager $100,000 total"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.Cash,
                    Value = 500
                }
            },
            new CreateBadgeCommand
            {
                Name = "Whale",
                Description = "Wager $1,000,000 total - You're legendary!",
                Rarity = BadgeRarity.Legendary,
                SeriesId = series.Id,
                OrderInSeries = 4,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.WagerAmount,
                    ThresholdValue = 1000000,
                    Description = "Wager $1,000,000 total"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.Cash,
                    Value = 5000
                }
            }
        };

        foreach (var badgeCmd in badges)
        {
            var badge = await _badgeService.CreateAsync(badgeCmd, operatorId);
            result.CreatedEntities.Add(new CreatedEntityDto
            {
                Type = "Badge",
                Id = badge.Id,
                Name = badge.Name,
                Status = badge.Status.ToString()
            });

            if (activate)
            {
                await _badgeService.PublishAsync(badge.Id, operatorId);
                result.CreatedEntities[^1].Status = "Active";
            }
        }

        if (activate)
        {
            await _badgeSeriesService.PublishAsync(series.Id, operatorId);
            result.CreatedEntities[0].Status = "Active";
        }
    }

    private async Task SetupLoyaltyLegendBadges(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var seriesCommand = new CreateBadgeSeriesCommand
        {
            Name = "Loyalty Legend",
            Description = "Show your dedication and become a legend!",
            DisplayOrder = 3
        };

        var series = await _badgeSeriesService.CreateAsync(seriesCommand, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "BadgeSeries",
            Id = series.Id,
            Name = series.Name,
            Status = series.Status.ToString()
        });

        var badges = new[]
        {
            new CreateBadgeCommand
            {
                Name = "First Steps",
                Description = "Make your first deposit",
                Rarity = BadgeRarity.Common,
                SeriesId = series.Id,
                OrderInSeries = 1,
                ProgressTrackingEnabled = false,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.FirstDeposit,
                    ThresholdValue = 1,
                    Description = "Make your first deposit"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.FreeSpins,
                    Value = 50
                }
            },
            new CreateBadgeCommand
            {
                Name = "Coming Back",
                Description = "Login 7 days in a row",
                Rarity = BadgeRarity.Rare,
                SeriesId = series.Id,
                OrderInSeries = 2,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.LoginStreak,
                    ThresholdValue = 7,
                    Description = "Login 7 days in a row"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.XpBoost,
                    Value = 2, // 2x multiplier
                    DurationHours = 24
                }
            },
            new CreateBadgeCommand
            {
                Name = "Dedicated",
                Description = "Login 30 days in a row",
                Rarity = BadgeRarity.Epic,
                SeriesId = series.Id,
                OrderInSeries = 3,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.LoginStreak,
                    ThresholdValue = 30,
                    Description = "Login 30 days in a row"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.Cash,
                    Value = 25
                }
            },
            new CreateBadgeCommand
            {
                Name = "Loyalty Legend",
                Description = "Login 365 days total - You're a legend!",
                Rarity = BadgeRarity.Legendary,
                SeriesId = series.Id,
                OrderInSeries = 4,
                ProgressTrackingEnabled = true,
                UnlockCriteria = new BadgeUnlockCriteriaDto
                {
                    Type = BadgeUnlockCriteriaType.TotalLogins,
                    ThresholdValue = 365,
                    Description = "Login 365 days total"
                },
                Reward = new BadgeRewardDto
                {
                    Type = BadgeRewardType.Cash,
                    Value = 500
                }
            }
        };

        foreach (var badgeCmd in badges)
        {
            var badge = await _badgeService.CreateAsync(badgeCmd, operatorId);
            result.CreatedEntities.Add(new CreatedEntityDto
            {
                Type = "Badge",
                Id = badge.Id,
                Name = badge.Name,
                Status = badge.Status.ToString()
            });

            if (activate)
            {
                await _badgeService.PublishAsync(badge.Id, operatorId);
                result.CreatedEntities[^1].Status = "Active";
            }
        }

        if (activate)
        {
            await _badgeSeriesService.PublishAsync(series.Id, operatorId);
            result.CreatedEntities[0].Status = "Active";
        }
    }

    #endregion

    #region Complete Setup Methods

    private async Task SetupCompleteStarterPack(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        // Setup all missions
        await SetupNewGameLaunchMission(operatorId, result, activate);
        await SetupWeekendWarriorMission(operatorId, result, activate);
        await SetupVipRetentionMission(operatorId, result, activate);

        // Setup all jackpots
        await SetupClassicProgressiveJackpot(operatorId, result, activate);
        await SetupDailyMustDropJackpot(operatorId, result, activate);
        await SetupAmountBasedJackpot(operatorId, result, activate);
        await SetupSplitWinnersJackpot(operatorId, result, activate);

        // Setup all badge series
        await SetupSlotsMasterBadges(operatorId, result, activate);
        await SetupHighRollerBadges(operatorId, result, activate);
        await SetupLoyaltyLegendBadges(operatorId, result, activate);
    }

    #endregion

    #region xSpeed Velocity Program Setup Methods

    /// <summary>
    /// Sets up the complete xSpeed Velocity Program with all tiers, missions, jackpots, and badges.
    /// </summary>
    private async Task SetupXSpeedVelocityProgram(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        _logger.LogInformation("Setting up xSpeed Velocity Program for operator {OperatorId}", operatorId);

        // Setup Velocity Tier badges (all 4 tiers)
        await SetupXSpeedVelocityTierBadges(operatorId, result, activate, XSpeedConfiguration.Tiers);

        // Setup all missions
        await SetupXSpeedDailyDriverMission(operatorId, result, activate);
        await SetupXSpeedExplorerMission(operatorId, result, activate);
        await SetupXSpeedTableTacticianMission(operatorId, result, activate);
        await SetupXSpeedWhaleMission(operatorId, result, activate);

        // Setup all jackpots
        await SetupXSpeedHourlyJackpot(operatorId, result, activate);
        await SetupXSpeedDailyPotJackpot(operatorId, result, activate);
        await SetupXSpeedMegaPotJackpot(operatorId, result, activate);

        // Setup tournaments
        await SetupXSpeedSlotSprintTournament(operatorId, result, activate);
        await SetupXSpeedHighRollerTournament(operatorId, result, activate);
    }

    /// <summary>
    /// Sets up xSpeed Phase 1 (Soft Launch): Tiers 1-2, Daily Driver mission, 2 badges.
    /// </summary>
    private async Task SetupXSpeedPhase1(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        _logger.LogInformation("Setting up xSpeed Phase 1 (Soft Launch) for operator {OperatorId}", operatorId);

        // Setup only tiers 1-2 (Ignition, Cruiser)
        var phase1Tiers = XSpeedConfiguration.Tiers.Take(2).ToArray();
        await SetupXSpeedVelocityTierBadges(operatorId, result, activate, phase1Tiers);

        // Setup Daily Driver mission only
        await SetupXSpeedDailyDriverMission(operatorId, result, activate);
    }

    /// <summary>
    /// Sets up xSpeed Phase 2 (Expansion): All tiers, Table Tactician mission, Hourly jackpot.
    /// </summary>
    private async Task SetupXSpeedPhase2(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        _logger.LogInformation("Setting up xSpeed Phase 2 (Expansion) for operator {OperatorId}", operatorId);

        // Setup all 4 tiers
        await SetupXSpeedVelocityTierBadges(operatorId, result, activate, XSpeedConfiguration.Tiers);

        // Setup Daily Driver and Table Tactician missions
        await SetupXSpeedDailyDriverMission(operatorId, result, activate);
        await SetupXSpeedTableTacticianMission(operatorId, result, activate);

        // Setup Hourly jackpot
        await SetupXSpeedHourlyJackpot(operatorId, result, activate);
    }

    /// <summary>
    /// Sets up xSpeed Phase 3 (Full Velocity): All missions, all jackpots.
    /// </summary>
    private async Task SetupXSpeedPhase3(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        _logger.LogInformation("Setting up xSpeed Phase 3 (Full Velocity) for operator {OperatorId}", operatorId);

        // Setup all tiers
        await SetupXSpeedVelocityTierBadges(operatorId, result, activate, XSpeedConfiguration.Tiers);

        // Setup all missions
        await SetupXSpeedDailyDriverMission(operatorId, result, activate);
        await SetupXSpeedExplorerMission(operatorId, result, activate);
        await SetupXSpeedTableTacticianMission(operatorId, result, activate);
        await SetupXSpeedWhaleMission(operatorId, result, activate);

        // Setup all jackpots
        await SetupXSpeedHourlyJackpot(operatorId, result, activate);
        await SetupXSpeedDailyPotJackpot(operatorId, result, activate);
        await SetupXSpeedMegaPotJackpot(operatorId, result, activate);

        // Setup tournaments
        await SetupXSpeedSlotSprintTournament(operatorId, result, activate);
        await SetupXSpeedHighRollerTournament(operatorId, result, activate);
    }

    /// <summary>
    /// Creates the Velocity Tier badge series and badges for the specified tiers.
    /// </summary>
    private async Task SetupXSpeedVelocityTierBadges(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate,
        XSpeedConfiguration.VelocityTier[] tiers)
    {
        // Create the series first
        var seriesCommand = new CreateBadgeSeriesCommand
        {
            Name = "xSpeed Velocity Tiers",
            Description = "Progress through the Velocity Program: Ignition → Cruiser → Turbo → Supersonic!",
            DisplayOrder = 10
        };

        var series = await _badgeSeriesService.CreateAsync(seriesCommand, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "BadgeSeries",
            Id = series.Id,
            Name = series.Name,
            Status = series.Status.ToString()
        });

        // Create badges for each tier
        foreach (var tier in tiers)
        {
            var badgeCommand = XSpeedConfiguration.CreateVelocityTierBadge(tier, series.Id);
            var badge = await _badgeService.CreateAsync(badgeCommand, operatorId);

            result.CreatedEntities.Add(new CreatedEntityDto
            {
                Type = "Badge",
                Id = badge.Id,
                Name = badge.Name,
                Status = badge.Status.ToString()
            });

            if (activate)
            {
                await _badgeService.PublishAsync(badge.Id, operatorId);
                result.CreatedEntities[^1].Status = "Active";
            }
        }

        if (activate)
        {
            await _badgeSeriesService.PublishAsync(series.Id, operatorId);
            // Update series status (first entity added for this method)
            var seriesEntity = result.CreatedEntities.FirstOrDefault(e => e.Id == series.Id);
            if (seriesEntity != null) seriesEntity.Status = "Active";
        }
    }

    /// <summary>
    /// Creates the Daily Driver mission (Level 1+).
    /// </summary>
    private async Task SetupXSpeedDailyDriverMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateDailyDriverMission();
        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the Explorer mission (Level 2+).
    /// </summary>
    private async Task SetupXSpeedExplorerMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateExplorerMission();
        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the Table Tactician mission (Level 3+).
    /// </summary>
    private async Task SetupXSpeedTableTacticianMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateTableTacticianMission();
        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the Whale Challenge mission (Level 4+).
    /// </summary>
    private async Task SetupXSpeedWhaleMission(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateWhaleMission();
        var mission = await _missionService.CreateMissionAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Mission",
            Id = mission.Id,
            Name = mission.Name,
            Status = mission.Status.ToString()
        });

        if (activate)
        {
            await _publishMissionHandler.ExecuteAsync(operatorId, mission.Id, CancellationToken.None);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the xSpeed Hourly Prize Drop jackpot.
    /// </summary>
    private async Task SetupXSpeedHourlyJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateHourlyPrizeDropJackpot();
        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the xSpeed Daily Pot jackpot.
    /// </summary>
    private async Task SetupXSpeedDailyPotJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateDailyPotJackpot();
        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the xSpeed Mega Pot jackpot.
    /// </summary>
    private async Task SetupXSpeedMegaPotJackpot(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateMegaPotJackpot();
        var jackpot = await _jackpotService.CreateAsync(command, operatorId);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Jackpot",
            Id = jackpot.Id,
            Name = jackpot.Name,
            Status = jackpot.Status.ToString()
        });

        if (activate)
        {
            await _jackpotService.ActivateAsync(jackpot.Id, operatorId);
            result.CreatedEntities[^1].Status = "Active";
        }
    }

    /// <summary>
    /// Creates the xSpeed Slot Sprint tournament (Level 2+).
    /// Track A: Highest Single Spin Win Multiplier.
    /// </summary>
    private async Task SetupXSpeedSlotSprintTournament(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateSlotSprintTournament();
        var tournament = await _tournamentService.CreateTournamentAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Tournament",
            Id = tournament.Id,
            Name = tournament.Name,
            Status = tournament.Status.ToString()
        });
    }

    /// <summary>
    /// Creates the xSpeed High Roller Table Wars tournament (Level 3+).
    /// Track B: Total Wager Amount on table games.
    /// </summary>
    private async Task SetupXSpeedHighRollerTournament(
        ObjectId operatorId,
        DemoSetupResultDto result,
        bool activate)
    {
        var command = XSpeedConfiguration.CreateHighRollerTableWarsTournament();
        var tournament = await _tournamentService.CreateTournamentAsync(operatorId, command);

        result.CreatedEntities.Add(new CreatedEntityDto
        {
            Type = "Tournament",
            Id = tournament.Id,
            Name = tournament.Name,
            Status = tournament.Status.ToString()
        });
    }

    #endregion
}
