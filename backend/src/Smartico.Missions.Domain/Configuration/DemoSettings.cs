namespace Smartico.Missions.Domain.Configuration;

/// <summary>
/// Demo mode configuration settings.
/// Used to provide default operator ID for the player dashboard demo.
/// </summary>
public class DemoSettings
{
    /// <summary>
    /// Default operator ID used when no operator context is provided.
    /// This allows the player dashboard to work without authentication
    /// by using a demo operator's data.
    /// </summary>
    public string DefaultOperatorId { get; set; } = "000000000000000000000001";
}
