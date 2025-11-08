namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Status codes for tournament registration attempts.
/// </summary>
public enum TournamentRegistrationStatus
{
    /// <summary>
    /// Registration successful - user is now enrolled.
    /// </summary>
    Registered = 0,

    /// <summary>
    /// Registration failed - insufficient balance for paid entry.
    /// </summary>
    InsufficientBalance = 1,

    /// <summary>
    /// Registration failed - tournament has reached maximum player capacity.
    /// </summary>
    TournamentFull = 2,

    /// <summary>
    /// Registration failed - user is already registered.
    /// </summary>
    AlreadyRegistered = 3,

    /// <summary>
    /// Registration failed - registration period has closed.
    /// </summary>
    RegistrationClosed = 4,

    /// <summary>
    /// Registration failed - user doesn't meet segment/eligibility conditions.
    /// </summary>
    SegmentMismatch = 5,

    /// <summary>
    /// Registration failed - tournament was cancelled.
    /// </summary>
    TournamentCancelled = 6,

    /// <summary>
    /// Registration failed - invite-only tournament without proper access.
    /// </summary>
    InviteRequired = 7,

    /// <summary>
    /// Registration failed - unknown/internal error occurred.
    /// </summary>
    Failed = 99
}
