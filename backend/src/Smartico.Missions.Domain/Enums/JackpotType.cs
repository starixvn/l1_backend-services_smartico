namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Defines the type of jackpot pool distribution model.
/// </summary>
public enum JackpotType
{
    /// <summary>
    /// Shared jackpot pool among all opted-in users.
    /// Multiple users contribute to the same pool and compete for prizes.
    /// Higher collective prizes with community engagement.
    /// </summary>
    MultiUser = 1,

    /// <summary>
    /// Individual jackpot pool per user.
    /// Each user has their own isolated pool and wins.
    /// Personalized experience with guaranteed individual progression.
    /// </summary>
    Personal = 2
}
