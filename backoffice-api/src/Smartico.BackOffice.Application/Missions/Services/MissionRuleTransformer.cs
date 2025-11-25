using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Services;

/// <summary>
/// Transforms visual mission rules (nodes/edges) into execution-ready format.
/// </summary>
public class MissionRuleTransformer
{
    /// <summary>
    /// Converts a visual MissionRule (ReactFlow format) into a MissionExecutionRule
    /// that can be processed by the mission processing service.
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
        if (rewardNodes.Count == 0)
        {
            throw new InvalidOperationException("Mission must have at least one Reward node");
        }

        // For MVP, we use the first trigger node
        // Future enhancement: support multiple triggers or complex logic
        var triggerNode = triggerNodes.First();
        var trigger = TransformTrigger(triggerNode);

        // Build ordered goal chain by following edges from trigger
        var goals = BuildGoalChain(visualRule, triggerNode, goalNodes);

        // For MVP, we use the first reward node connected to goals
        // Future enhancement: support multiple rewards or conditional rewards
        var rewardNode = FindRewardNode(visualRule, goalNodes, rewardNodes);
        var reward = TransformReward(rewardNode);

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

        return new TriggerCondition
        {
            Type = triggerNode.Data.TriggerType.Value,
            MinAmount = triggerNode.Data.TriggerThreshold,
            GameId = triggerNode.Data.GameId
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
                // For amount-based goals, we use goalCount as the target amount temporarily
                // This is a limitation of the current UI - in future, we should have separate fields
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
        if (rewardNode.Data.RewardType == null)
        {
            throw new InvalidOperationException($"Reward node '{rewardNode.Id}' must have a reward type");
        }

        if (rewardNode.Data.RewardAmount == null || rewardNode.Data.RewardAmount <= 0)
        {
            throw new InvalidOperationException($"Reward node '{rewardNode.Id}' must have a valid reward amount");
        }

        return new RewardDefinition
        {
            Type = rewardNode.Data.RewardType.Value,
            Amount = rewardNode.Data.RewardAmount.Value,
            GameId = rewardNode.Data.GameId
        };
    }
}
