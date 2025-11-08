namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// Configuration options for Smartico Bonus API
/// </summary>
public class SmarticoBonusApiOptions
{
    /// <summary>
    /// API key for authentication
    /// </summary>
    public required string ApiKey { get; set; }

    /// <summary>
    /// Base URL for the Smartico Bonus API
    /// </summary>
    public required string BaseUrl { get; set; }

    /// <summary>
    /// HTTP request timeout in seconds (default: 30)
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;
}
