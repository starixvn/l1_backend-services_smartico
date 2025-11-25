namespace Smartico.BackOffice.Application.Missions.Commands;

/// <summary>
/// Command to publish a draft mission, making it active for players.
/// </summary>
public class PublishMissionCommand
{
    /// <summary>
    /// Gets or sets the mission ID to publish.
    /// </summary>
    public string MissionId { get; set; } = string.Empty;
}
