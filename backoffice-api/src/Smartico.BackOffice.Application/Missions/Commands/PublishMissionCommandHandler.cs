using MongoDB.Bson;
using Smartico.BackOffice.Application.Missions.Services;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Commands;

/// <summary>
/// Handler for publishing missions with validation.
/// </summary>
public class PublishMissionCommandHandler
{
    private readonly IMissionRepository _missionRepository;

    public PublishMissionCommandHandler(IMissionRepository missionRepository)
    {
        _missionRepository = missionRepository;
    }

    public async Task ExecuteAsync(ObjectId operatorId, string missionId, CancellationToken cancellationToken)
    {
        // Get mission
        if (!ObjectId.TryParse(missionId, out var missionObjectId))
        {
            throw new ArgumentException("Invalid mission ID format", nameof(missionId));
        }

        var mission = await _missionRepository.GetByIdAsync(operatorId, missionObjectId, cancellationToken);
        if (mission == null)
        {
            throw new InvalidOperationException($"Mission with ID {missionId} not found");
        }

        // Validate mission belongs to operator
        if (mission.OperatorId != operatorId)
        {
            throw new UnauthorizedAccessException("Mission does not belong to this operator");
        }

        // Validate mission can be published
        ValidateMission(mission);

        // Transform to execution rule based on what data is available
        if (mission.Tasks.Count > 0)
        {
            // New task-based approach
            mission.ExecutionRule = MissionRuleTransformer.TransformFromTasks(mission);
        }
        else if (mission.Rule != null)
        {
            // Legacy visual rule approach
            mission.ExecutionRule = MissionRuleTransformer.Transform(mission.Rule);
        }
        else
        {
            throw new InvalidOperationException("Mission must have either tasks or a visual rule defined");
        }

        // Update status to Active
        mission.Status = MissionStatus.Active;
        mission.UpdatedAt = DateTime.UtcNow;

        await _missionRepository.UpdateAsync(mission, cancellationToken);
    }

    private static void ValidateMission(Mission mission)
    {
        var errors = new List<string>();

        // Validate required fields
        if (string.IsNullOrWhiteSpace(mission.Name))
        {
            errors.Add("Mission name is required");
        }

        // Validate dates
        if (mission.StartDate >= mission.EndDate)
        {
            errors.Add("Start date must be before end date");
        }

        if (mission.EndDate <= DateTime.UtcNow)
        {
            errors.Add("End date must be in the future");
        }

        // Validate based on mission structure type
        if (mission.Tasks.Count > 0)
        {
            // Task-based validation
            ValidateTaskBasedMission(mission, errors);
        }
        else if (mission.Rule != null)
        {
            // Legacy visual rule validation
            ValidateLegacyRuleMission(mission, errors);
        }
        else
        {
            errors.Add("Mission must have either tasks or a visual rule defined");
        }

        if (errors.Any())
        {
            throw new InvalidOperationException($"Cannot publish mission: {string.Join(", ", errors)}");
        }
    }

    private static void ValidateTaskBasedMission(Mission mission, List<string> errors)
    {
        // Validate completion XP (0 is allowed, negative is not)
        if (mission.CompletionXp < 0)
        {
            errors.Add("Mission completion XP cannot be negative");
        }

        // Validate each task
        foreach (var task in mission.Tasks)
        {
            if (string.IsNullOrWhiteSpace(task.Name))
            {
                errors.Add($"Task '{task.Id}' must have a name");
            }

            // Validate trigger
            if (task.Trigger == null)
            {
                errors.Add($"Task '{task.Name}' must have a trigger");
            }

            // Validate goal
            if (task.Goal == null)
            {
                errors.Add($"Task '{task.Name}' must have a goal");
            }
            else
            {
                // Check goal has required values based on type
                if (task.Goal.Type == GoalType.BetCount || task.Goal.Type == GoalType.CountBased || task.Goal.Type == GoalType.LoginCount)
                {
                    if (task.Goal.TargetCount == null || task.Goal.TargetCount <= 0)
                    {
                        errors.Add($"Task '{task.Name}' must have a valid target count");
                    }
                }
                else
                {
                    if (task.Goal.TargetAmount == null || task.Goal.TargetAmount <= 0)
                    {
                        errors.Add($"Task '{task.Name}' must have a valid target amount");
                    }
                }
            }
        }
    }

    private static void ValidateLegacyRuleMission(Mission mission, List<string> errors)
    {
        var rule = mission.Rule!;

        // Validate rule has at least one node of required types
        var hasTrigger = rule.Nodes.Any(n => n.Type == NodeType.Trigger);
        var hasGoal = rule.Nodes.Any(n => n.Type == NodeType.Goal);

        if (!hasTrigger)
        {
            errors.Add("Mission must have at least one Trigger node");
        }

        if (!hasGoal)
        {
            errors.Add("Mission must have at least one Goal node");
        }

        // Reward node is now optional

        // Validate nodes have required configuration
        foreach (var node in rule.Nodes)
        {
            switch (node.Type)
            {
                case NodeType.Trigger:
                    if (node.Data.TriggerType == null)
                    {
                        errors.Add($"Trigger node '{node.Id}' must have a trigger type");
                    }
                    break;

                case NodeType.Goal:
                    if (node.Data.GoalType == null)
                    {
                        errors.Add($"Goal node '{node.Id}' must have a goal type");
                    }
                    if (node.Data.GoalCount == null || node.Data.GoalCount <= 0)
                    {
                        errors.Add($"Goal node '{node.Id}' must have a valid goal count");
                    }
                    break;

                case NodeType.Reward:
                    // Reward node now only validates bonus template if set
                    // No required fields - bonus template is optional
                    break;
            }
        }

        // Validate rule has at least one connection
        if (rule.Edges.Count == 0)
        {
            errors.Add("Mission must have at least one connection between nodes");
        }
    }
}
