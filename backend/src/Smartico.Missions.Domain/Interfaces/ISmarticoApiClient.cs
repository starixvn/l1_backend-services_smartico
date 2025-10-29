using Smartico.Missions.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Interface for communicating with the Smartico Public API.
/// Defines contracts for fetching missions, badges, and performing actions.
/// </summary>
public interface ISmarticoApiClient
{
    /// <summary>
    /// Fetches all missions for a specific user.
    /// </summary>
    /// <param name="extUserId">External user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of missions</returns>
    Task<IEnumerable<Mission>> GetMissionsAsync(string extUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches a specific mission by ID.
    /// </summary>
    /// <param name="extUserId">External user ID</param>
    /// <param name="missionId">Mission ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Mission details</returns>
    Task<Mission?> GetMissionByIdAsync(string extUserId, int missionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Opts a user into a mission.
    /// </summary>
    /// <param name="extUserId">External user ID</param>
    /// <param name="missionId">Mission ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Opt-in result</returns>
    Task<MissionOptInResult> OptInToMissionAsync(string extUserId, int missionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Claims reward for a completed mission.
    /// </summary>
    /// <param name="extUserId">External user ID</param>
    /// <param name="missionId">Mission ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Claim result</returns>
    Task<MissionClaimResult> ClaimRewardAsync(string extUserId, int missionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches all badges for a specific user.
    /// </summary>
    /// <param name="extUserId">External user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of badges</returns>
    Task<IEnumerable<Badge>> GetBadgesAsync(string extUserId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Fetches a specific badge by ID.
    /// </summary>
    /// <param name="extUserId">External user ID</param>
    /// <param name="badgeId">Badge ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Badge details</returns>
    Task<Badge?> GetBadgeByIdAsync(string extUserId, int badgeId, CancellationToken cancellationToken = default);
}

