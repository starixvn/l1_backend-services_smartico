namespace Smartico.Missions.Infrastructure.SmarticoApi;

/// <summary>
/// Configuration options for the Smartico API client.
/// Bound from appsettings.json "Smartico" section.
/// </summary>
public class SmarticoApiOptions
{
    /// <summary>
    /// Smartico API key for authentication
    /// </summary>
    public required string ApiKey { get; set; }

    /// <summary>
    /// Brand key for multi-tenant setup
    /// </summary>
    public required string BrandKey { get; set; }

    /// <summary>
    /// Environment (production, development, staging)
    /// </summary>
    public required string Environment { get; set; }

    /// <summary>
    /// Base URL for Smartico API
    /// </summary>
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Timeout in seconds for API requests
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Number of retry attempts for failed requests
    /// </summary>
    public int MaxRetryAttempts { get; set; } = 3;
}

