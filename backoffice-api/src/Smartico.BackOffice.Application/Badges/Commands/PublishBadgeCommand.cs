namespace Smartico.BackOffice.Application.Badges.Commands;

/// <summary>
/// Command to publish (activate) a badge, making it earnable by players.
/// </summary>
public class PublishBadgeCommand
{
    /// <summary>
    /// The badge ID to publish.
    /// </summary>
    public string BadgeId { get; set; } = string.Empty;
}
