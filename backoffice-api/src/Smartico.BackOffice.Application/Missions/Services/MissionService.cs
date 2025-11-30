using FluentValidation;
using MongoDB.Bson;
using Smartico.BackOffice.Application.Missions.Commands;
using Smartico.BackOffice.Application.Missions.DTOs;
using Smartico.BackOffice.Application.Missions.Interfaces;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.Repositories;
using Smartico.BackOffice.Domain.ValueObjects;

namespace Smartico.BackOffice.Application.Missions.Services;

/// <summary>
/// Service implementation for mission business logic.
/// </summary>
public class MissionService : IMissionService
{
    private readonly IMissionRepository _repository;
    private readonly IValidator<CreateMissionCommand> _validator;

    /// <summary>
    /// Initializes a new instance of the <see cref="MissionService"/> class.
    /// </summary>
    /// <param name="repository">The mission repository.</param>
    /// <param name="validator">The mission validator.</param>
    public MissionService(
        IMissionRepository repository,
        IValidator<CreateMissionCommand> validator)
    {
        _repository = repository;
        _validator = validator;
    }

    /// <inheritdoc/>
    public async Task<MissionDto> CreateMissionAsync(
        ObjectId operatorId,
        CreateMissionCommand command,
        CancellationToken cancellationToken = default)
    {
        // Basic validation for required fields (name, dates, etc.)
        // Rule structure validation is skipped for drafts - it only happens on publish
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Create entity
        var mission = new Mission
        {
            Id = ObjectId.GenerateNewId(),
            OperatorId = operatorId,
            Name = command.Name,
            Description = command.Description,
            Status = MissionStatus.Draft,
            CompletionXp = command.CompletionXp,
            Tasks = MapTasksFromDto(command.Tasks),
            Rule = command.Rule,
            TargetSegment = command.TargetSegment,
            StartDate = command.StartDate,
            EndDate = command.EndDate
        };

        await _repository.CreateAsync(mission, cancellationToken);

        return MapToDto(mission);
    }

    /// <inheritdoc/>
    public async Task<MissionDto?> GetMissionByIdAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CancellationToken cancellationToken = default)
    {
        var mission = await _repository.GetByIdAsync(operatorId, missionId, cancellationToken);
        return mission != null ? MapToDto(mission) : null;
    }

    /// <inheritdoc/>
    public async Task<List<MissionDto>> GetAllMissionsAsync(
        ObjectId operatorId,
        CancellationToken cancellationToken = default)
    {
        var missions = await _repository.GetAllAsync(operatorId, cancellationToken);
        return missions.Select(MapToDto).ToList();
    }

    /// <inheritdoc/>
    public async Task<MissionDto> UpdateMissionAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CreateMissionCommand command,
        CancellationToken cancellationToken = default)
    {
        // Basic validation for required fields (name, dates, etc.)
        // Rule structure validation is skipped for drafts - it only happens on publish
        var validationResult = await _validator.ValidateAsync(command, cancellationToken);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Get existing mission
        var existing = await _repository.GetByIdAsync(operatorId, missionId, cancellationToken);
        if (existing == null)
        {
            throw new InvalidOperationException($"Mission {missionId} not found.");
        }

        // Update properties
        existing.Name = command.Name;
        existing.Description = command.Description;
        existing.CompletionXp = command.CompletionXp;
        existing.Tasks = MapTasksFromDto(command.Tasks);
        existing.Rule = command.Rule;
        existing.TargetSegment = command.TargetSegment;
        existing.StartDate = command.StartDate;
        existing.EndDate = command.EndDate;

        await _repository.UpdateAsync(existing, cancellationToken);

        return MapToDto(existing);
    }

    /// <inheritdoc/>
    public async Task DeleteMissionAsync(
        ObjectId operatorId,
        ObjectId missionId,
        CancellationToken cancellationToken = default)
    {
        await _repository.DeleteAsync(operatorId, missionId, cancellationToken);
    }

    /// <summary>
    /// Maps a mission entity to a DTO.
    /// </summary>
    private static MissionDto MapToDto(Mission mission)
    {
        return new MissionDto
        {
            Id = mission.Id.ToString(),
            OperatorId = mission.OperatorId.ToString(),
            Name = mission.Name,
            Description = mission.Description,
            Status = mission.Status,
            CompletionXp = mission.CompletionXp,
            Tasks = MapTasksToDto(mission.Tasks),
            Rule = mission.Rule,
            TargetSegment = mission.TargetSegment,
            StartDate = mission.StartDate,
            EndDate = mission.EndDate,
            CreatedAt = mission.CreatedAt,
            UpdatedAt = mission.UpdatedAt
        };
    }

    /// <summary>
    /// Maps task DTOs to domain entities.
    /// </summary>
    private static List<MissionTask> MapTasksFromDto(List<MissionTaskDto> tasks)
    {
        return tasks.Select(t => new MissionTask
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Order = t.Order,
            Trigger = new TaskTrigger
            {
                Type = t.Trigger.Type,
                MinAmount = t.Trigger.MinAmount,
                EligibleGames = t.Trigger.EligibleGames
            },
            Goal = new TaskGoal
            {
                Type = t.Goal.Type,
                TargetCount = t.Goal.TargetCount,
                TargetAmount = t.Goal.TargetAmount,
                EligibleGames = t.Goal.EligibleGames
            },
            BonusTemplateId = !string.IsNullOrEmpty(t.BonusTemplateId)
                ? ObjectId.Parse(t.BonusTemplateId)
                : null
        }).ToList();
    }

    /// <summary>
    /// Maps domain task entities to DTOs.
    /// </summary>
    private static List<MissionTaskDto> MapTasksToDto(List<MissionTask>? tasks)
    {
        if (tasks == null || tasks.Count == 0)
        {
            return new List<MissionTaskDto>();
        }

        return tasks.Select(t => new MissionTaskDto
        {
            Id = t.Id,
            Name = t.Name,
            Description = t.Description,
            Order = t.Order,
            Trigger = new TaskTriggerDto
            {
                Type = t.Trigger.Type,
                MinAmount = t.Trigger.MinAmount,
                EligibleGames = t.Trigger.EffectiveEligibleGames
            },
            Goal = new TaskGoalDto
            {
                Type = t.Goal.Type,
                TargetCount = t.Goal.TargetCount,
                TargetAmount = t.Goal.TargetAmount,
                EligibleGames = t.Goal.EligibleGames
            },
            BonusTemplateId = t.BonusTemplateId?.ToString()
        }).ToList();
    }
}
