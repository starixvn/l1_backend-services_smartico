using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Commands;

/// <summary>
/// Command to create a new mission.
/// </summary>
public class CreateMissionCommand
{
    /// <summary>
    /// Gets or sets the name of the mission.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional description of the mission.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the visual rule structure defining the mission flow.
    /// </summary>
    public MissionRule Rule { get; set; } = new();

    /// <summary>
    /// Gets or sets the player segment that can participate in this mission.
    /// </summary>
    public PlayerSegment TargetSegment { get; set; }

    /// <summary>
    /// Gets or sets the mission start date and time.
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the mission end date and time.
    /// </summary>
    public DateTime EndDate { get; set; }
}
