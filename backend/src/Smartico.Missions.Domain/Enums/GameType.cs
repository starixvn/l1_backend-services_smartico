namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Types of mini game mechanics.
/// Maps to SAWGameTypeName from Smartico API.
/// </summary>
public enum GameType
{
    /// <summary>
    /// Spin the Wheel game mechanic.
    /// </summary>
    Spin = 0,

    /// <summary>
    /// Gift Box reveal game mechanic.
    /// </summary>
    GiftBox = 1,

    /// <summary>
    /// Scratch card reveal game mechanic.
    /// </summary>
    Scratch = 2,

    /// <summary>
    /// Match X symbols game mechanic.
    /// </summary>
    MatchX = 3
}
