using MongoDB.Bson;
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

        // Validate rule has at least one node of each type
        var hasTrigger = mission.Rule.Nodes.Any(n => n.Type == NodeType.Trigger);
        var hasGoal = mission.Rule.Nodes.Any(n => n.Type == NodeType.Goal);
        var hasReward = mission.Rule.Nodes.Any(n => n.Type == NodeType.Reward);

        if (!hasTrigger)
        {
            errors.Add("Mission must have at least one Trigger node");
        }

        if (!hasGoal)
        {
            errors.Add("Mission must have at least one Goal node");
        }

        if (!hasReward)
        {
            errors.Add("Mission must have at least one Reward node");
        }

        // Validate nodes have required configuration
        foreach (var node in mission.Rule.Nodes)
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
                    if (node.Data.RewardType == null)
                    {
                        errors.Add($"Reward node '{node.Id}' must have a reward type");
                    }
                    if (node.Data.RewardAmount == null || node.Data.RewardAmount <= 0)
                    {
                        errors.Add($"Reward node '{node.Id}' must have a valid reward amount");
                    }
                    break;
            }
        }

        // Validate rule has at least one connection
        if (mission.Rule.Edges.Count == 0)
        {
            errors.Add("Mission must have at least one connection between nodes");
        }

        if (errors.Any())
        {
            throw new InvalidOperationException($"Cannot publish mission: {string.Join(", ", errors)}");
        }
    }
}
