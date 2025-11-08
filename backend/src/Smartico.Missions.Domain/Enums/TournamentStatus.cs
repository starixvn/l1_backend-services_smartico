namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Tournament lifecycle status.
/// </summary>
public enum TournamentStatus
{
    /// <summary>
    /// Tournament published and visible to users but not accepting registrations yet.
    /// </summary>
    Published = 0,

    /// <summary>
    /// Tournament accepting registrations.
    /// </summary>
    Register = 1,

    /// <summary>
    /// Tournament in progress - active gameplay period.
    /// </summary>
    Started = 2,

    /// <summary>
    /// Tournament ended - finalizing results and prize distribution.
    /// </summary>
    Finalizing = 3,

    /// <summary>
    /// Tournament completed - results finalized.
    /// </summary>
    Finished = 4,

    /// <summary>
    /// Tournament cancelled before completion.
    /// </summary>
    Cancelled = 5
}
