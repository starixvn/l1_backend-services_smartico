using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Services;

/// <summary>
/// Transforms mission tasks into execution-ready format.
/// Also supports legacy visual rule transformation for backward compatibility.
/// </summary>
public class MissionRuleTransformer
{
    /// <summary>
    /// Generates an execution rule from mission tasks.
    /// This is the new task-based approach.
    /// </summary>
    /// <param name="mission">The mission with tasks</param>
    /// <returns>Execution rule for the mission processing service</returns>
    public static MissionExecutionRule TransformFromTasks(Mission mission)
    {
        if (mission.Tasks == null || mission.Tasks.Count == 0)
        {
            throw new InvalidOperationException("Mission must have at least one task");
        }

        // For execution, we build goals from each task
        // The first task's trigger becomes the mission trigger
        var firstTask = mission.Tasks.OrderBy(t => t.Order).First();

        var trigger = new TriggerCondition
        {
            Type = firstTask.Trigger.Type,
            MinAmount = firstTask.Trigger.MinAmount,
            EligibleGames = firstTask.Trigger.EligibleGames
        };

        // Build goals from all tasks
        var goals = mission.Tasks
            .OrderBy(t => t.Order)
            .Select((task, index) => new GoalStep
            {
                Order = index + 1,
                Type = task.Goal.Type,
                TargetCount = task.Goal.TargetCount,
                TargetAmount = task.Goal.TargetAmount,
                EligibleGames = task.Goal.EligibleGames
            })
            .ToList();

        // For reward, we create a placeholder that references the mission's completion points
        // Individual task bonuses are handled separately by the mission processing service
        var reward = new RewardDefinition
        {
            // Completion points are stored at mission level, not in execution rule
            // BonusTemplateId will be set if any task has a bonus template
            BonusTemplateId = mission.Tasks
                .Where(t => t.BonusTemplateId.HasValue)
                .Select(t => t.BonusTemplateId)
                .FirstOrDefault()
        };

        return new MissionExecutionRule
        {
            Trigger = trigger,
            Goals = goals,
            Reward = reward
        };
    }

    /// <summary>
    /// DEPRECATED: Converts a visual MissionRule (ReactFlow format) into a MissionExecutionRule.
    /// Kept for backward compatibility with existing missions.
    /// </summary>
    /// <param name="visualRule">The visual rule with nodes and edges</param>
    /// <returns>Linear execution rule with trigger, goals, and reward</returns>
    /// <exception cref="InvalidOperationException">Thrown when rule structure is invalid</exception>
    public static MissionExecutionRule Transform(MissionRule visualRule)
    {
        if (visualRule == null)
        {
            throw new ArgumentNullException(nameof(visualRule));
        }

        // Find all node types
        var triggerNodes = visualRule.Nodes.Where(n => n.Type == NodeType.Trigger).ToList();
        var goalNodes = visualRule.Nodes.Where(n => n.Type == NodeType.Goal).ToList();
        var rewardNodes = visualRule.Nodes.Where(n => n.Type == NodeType.Reward).ToList();

        // Validate we have required nodes
        if (triggerNodes.Count == 0)
        {
            throw new InvalidOperationException("Mission must have at least one Trigger node");
        }
        if (goalNodes.Count == 0)
        {
            throw new InvalidOperationException("Mission must have at least one Goal node");
        }

        // For MVP, we use the first trigger node
        var triggerNode = triggerNodes.First();
        var trigger = TransformTrigger(triggerNode);

        // Build ordered goal chain by following edges from trigger
        var goals = BuildGoalChain(visualRule, triggerNode, goalNodes);

        // Reward is now optional - check if we have any
        RewardDefinition reward;
        if (rewardNodes.Count > 0)
        {
            var rewardNode = FindRewardNode(visualRule, goalNodes, rewardNodes);
            reward = TransformReward(rewardNode);
        }
        else
        {
            // No reward node - create empty reward
            reward = new RewardDefinition();
        }

        return new MissionExecutionRule
        {
            Trigger = trigger,
            Goals = goals,
            Reward = reward
        };
    }

    private static TriggerCondition TransformTrigger(RuleNode triggerNode)
    {
        if (triggerNode.Data.TriggerType == null)
        {
            throw new InvalidOperationException($"Trigger node '{triggerNode.Id}' must have a trigger type");
        }

        // Legacy visual rules may have a single gameId - convert to list
        var eligibleGames = !string.IsNullOrEmpty(triggerNode.Data.GameId)
            ? new List<string> { triggerNode.Data.GameId }
            : null;

        return new TriggerCondition
        {
            Type = triggerNode.Data.TriggerType.Value,
            MinAmount = triggerNode.Data.TriggerThreshold,
            EligibleGames = eligibleGames
        };
    }

    private static List<GoalStep> BuildGoalChain(MissionRule visualRule, RuleNode triggerNode, List<RuleNode> goalNodes)
    {
        var goals = new List<GoalStep>();
        var visitedNodes = new HashSet<string>();
        var currentNodeId = triggerNode.Id;
        var order = 1;

        // Follow edges from trigger through goal nodes
        while (true)
        {
            // Find next node connected from current node
            var edge = visualRule.Edges.FirstOrDefault(e =>
                e.Source == currentNodeId &&
                !visitedNodes.Contains(e.Target));

            if (edge == null)
            {
                break; // No more connections
            }

            var nextNode = visualRule.Nodes.FirstOrDefault(n => n.Id == edge.Target);
            if (nextNode == null)
            {
                break; // Target node not found
            }

            // If it's a goal node, add it to the chain
            if (nextNode.Type == NodeType.Goal)
            {
                goals.Add(TransformGoal(nextNode, order));
                order++;
                visitedNodes.Add(nextNode.Id);
            }

            currentNodeId = nextNode.Id;
        }

        if (goals.Count == 0)
        {
            throw new InvalidOperationException("No goal nodes found connected to trigger");
        }

        return goals;
    }

    private static GoalStep TransformGoal(RuleNode goalNode, int order)
    {
        if (goalNode.Data.GoalType == null)
        {
            throw new InvalidOperationException($"Goal node '{goalNode.Id}' must have a goal type");
        }

        var goalType = goalNode.Data.GoalType.Value;

        // Determine target based on goal type
        int? targetCount = null;
        decimal? targetAmount = null;

        switch (goalType)
        {
            case GoalType.BetCount:
            case GoalType.CountBased:
                targetCount = goalNode.Data.GoalCount;
                if (targetCount == null || targetCount <= 0)
                {
                    throw new InvalidOperationException($"Goal node '{goalNode.Id}' must have a valid goal count");
                }
                break;

            case GoalType.DepositAmount:
            case GoalType.WageredAmount:
            case GoalType.TurnoverAmount:
                // For amount-based goals, we use goalCount as the target amount temporarily
                targetAmount = goalNode.Data.GoalCount;
                if (targetAmount == null || targetAmount <= 0)
                {
                    throw new InvalidOperationException($"Goal node '{goalNode.Id}' must have a valid target amount");
                }
                break;
        }

        return new GoalStep
        {
            Order = order,
            Type = goalType,
            TargetCount = targetCount,
            TargetAmount = targetAmount,
            GameId = goalNode.Data.GameId
        };
    }

    private static RuleNode FindRewardNode(MissionRule visualRule, List<RuleNode> goalNodes, List<RuleNode> rewardNodes)
    {
        // Find reward node connected to any goal node
        foreach (var goalNode in goalNodes)
        {
            var edge = visualRule.Edges.FirstOrDefault(e => e.Source == goalNode.Id);
            if (edge != null)
            {
                var rewardNode = rewardNodes.FirstOrDefault(r => r.Id == edge.Target);
                if (rewardNode != null)
                {
                    return rewardNode;
                }
            }
        }

        // If no connection found, use first reward node
        return rewardNodes.First();
    }

    private static RewardDefinition TransformReward(RuleNode rewardNode)
    {
        // With the simplified model, reward now only supports BonusTemplate
        // The BonusTemplateId is optional
        return new RewardDefinition
        {
            BonusTemplateId = rewardNode.Data.BonusTemplateId
        };
    }
}
