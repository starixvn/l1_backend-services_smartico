using System.Text.Json.Serialization;

namespace Smartico.BackOffice.Application.Demo.DTOs;

/// <summary>
/// Represents a demo scenario that can be set up for an operator.
/// </summary>
public class DemoScenarioDto
{
    /// <summary>
    /// Unique identifier for the scenario.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the scenario.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of what the scenario creates.
    /// </summary>
    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Category of the scenario (Mission, Jackpot, Badge, LevelSystem, Tournament, Complete).
    /// </summary>
    [JsonPropertyName("category")]
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// List of entities that will be created.
    /// </summary>
    [JsonPropertyName("entities")]
    public List<string> Entities { get; set; } = new();

    /// <summary>
    /// Expected business outcome from this scenario.
    /// </summary>
    [JsonPropertyName("expectedOutcome")]
    public string ExpectedOutcome { get; set; } = string.Empty;
}

/// <summary>
/// Result of setting up a demo scenario.
/// </summary>
public class DemoSetupResultDto
{
    /// <summary>
    /// ID of the scenario that was set up.
    /// </summary>
    [JsonPropertyName("scenarioId")]
    public string ScenarioId { get; set; } = string.Empty;

    /// <summary>
    /// Name of the scenario.
    /// </summary>
    [JsonPropertyName("scenarioName")]
    public string ScenarioName { get; set; } = string.Empty;

    /// <summary>
    /// Whether the setup was successful.
    /// </summary>
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    /// <summary>
    /// Message describing the result.
    /// </summary>
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// List of created entity IDs with their types.
    /// </summary>
    [JsonPropertyName("createdEntities")]
    public List<CreatedEntityDto> CreatedEntities { get; set; } = new();
}

/// <summary>
/// Represents a created entity from the demo setup.
/// </summary>
public class CreatedEntityDto
{
    /// <summary>
    /// Type of entity (Mission, Jackpot, Badge, etc.).
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// ID of the created entity.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    /// <summary>
    /// Name of the created entity.
    /// </summary>
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Status of the entity (Draft, Active, etc.).
    /// </summary>
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}
