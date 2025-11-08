namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Featured tournament ribbon types for visual indicators.
/// </summary>
public enum TournamentRibbonType
{
    /// <summary>
    /// No ribbon - standard tournament.
    /// </summary>
    None = 0,

    /// <summary>
    /// Sale ribbon - special pricing or discounted entry.
    /// </summary>
    Sale = 1,

    /// <summary>
    /// Hot ribbon - trending or popular tournament.
    /// </summary>
    Hot = 2,

    /// <summary>
    /// New ribbon - newly released tournament.
    /// </summary>
    New = 3,

    /// <summary>
    /// VIP ribbon - exclusive tournament for VIP users.
    /// </summary>
    Vip = 4,

    /// <summary>
    /// Custom ribbon - operator-defined special indicator.
    /// </summary>
    Custom = 99
}
