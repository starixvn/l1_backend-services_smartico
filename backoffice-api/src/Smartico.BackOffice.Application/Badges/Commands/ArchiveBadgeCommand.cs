namespace Smartico.BackOffice.Application.Badges.Commands;

/// <summary>
/// Command to archive a badge, making it no longer earnable but still visible if unlocked.
/// </summary>
public class ArchiveBadgeCommand
{
    /// <summary>
    /// The badge ID to archive.
    /// </summary>
    public string BadgeId { get; set; } = string.Empty;
}
