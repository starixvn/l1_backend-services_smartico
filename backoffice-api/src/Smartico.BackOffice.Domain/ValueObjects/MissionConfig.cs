namespace Smartico.BackOffice.Domain.ValueObjects;

/// <summary>
/// Defines the current status of a mission.
/// </summary>
public enum MissionStatus
{
    /// <summary>
    /// Mission is being configured and not yet published.
    /// </summary>
    Draft,

    /// <summary>
    /// Mission is currently active and available to eligible players.
    /// </summary>
    Active,

    /// <summary>
    /// Mission has ended and is no longer available.
    /// </summary>
    Completed,

    /// <summary>
    /// Mission was cancelled before completion.
    /// </summary>
    Cancelled
}

/// <summary>
/// Defines player segments for mission targeting.
/// </summary>
public enum PlayerSegment
{
    /// <summary>
    /// Mission is available to all players.
    /// </summary>
    AllPlayers,

    /// <summary>
    /// Mission is available only to VIP tier players.
    /// </summary>
    VipOnly
}
