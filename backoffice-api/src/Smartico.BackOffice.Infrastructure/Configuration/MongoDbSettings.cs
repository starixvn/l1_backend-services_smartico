namespace Smartico.BackOffice.Infrastructure.Configuration;

/// <summary>
/// Configuration settings for MongoDB connection.
/// </summary>
public class MongoDbSettings
{
    /// <summary>
    /// Gets or sets the MongoDB connection string.
    /// </summary>
    /// <example>mongodb://localhost:27017</example>
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";

    /// <summary>
    /// Gets or sets the name of the database to use.
    /// </summary>
    /// <example>sabaone_backoffice</example>
    public string DatabaseName { get; set; } = "sabaone_backoffice";
}
