namespace Smartico.Missions.Infrastructure.Configuration;

/// <summary>
/// MongoDB connection settings for reading from the shared backoffice database.
/// </summary>
public class MongoDbSettings
{
    /// <summary>
    /// MongoDB connection string.
    /// </summary>
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";

    /// <summary>
    /// Database name (shared with backoffice-api).
    /// </summary>
    public string DatabaseName { get; set; } = "smartico_backoffice_dev";
}
