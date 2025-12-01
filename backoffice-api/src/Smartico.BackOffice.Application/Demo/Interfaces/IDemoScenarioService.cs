using MongoDB.Bson;
using Smartico.BackOffice.Application.Demo.DTOs;

namespace Smartico.BackOffice.Application.Demo.Interfaces;

/// <summary>
/// Service for managing demo scenarios for operator onboarding and demonstrations.
/// </summary>
public interface IDemoScenarioService
{
    /// <summary>
    /// Gets all available demo scenarios.
    /// </summary>
    Task<IEnumerable<DemoScenarioDto>> GetAvailableScenariosAsync();

    /// <summary>
    /// Gets scenarios by category.
    /// </summary>
    Task<IEnumerable<DemoScenarioDto>> GetScenariosByCategoryAsync(string category);

    /// <summary>
    /// Sets up a specific demo scenario for an operator.
    /// </summary>
    Task<DemoSetupResultDto> SetupScenarioAsync(string scenarioId, ObjectId operatorId, bool activateEntities = false);

    /// <summary>
    /// Sets up all demo scenarios for an operator (complete demo environment).
    /// </summary>
    Task<List<DemoSetupResultDto>> SetupAllScenariosAsync(ObjectId operatorId, bool activateEntities = false);

    /// <summary>
    /// Cleans up demo data for an operator (removes all demo-created entities).
    /// </summary>
    Task<bool> CleanupDemoDataAsync(ObjectId operatorId);
}
