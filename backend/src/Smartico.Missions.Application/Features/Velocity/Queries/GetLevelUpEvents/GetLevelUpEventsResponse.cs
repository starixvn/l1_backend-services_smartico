using Smartico.Missions.Application.Features.Velocity.DTOs;

namespace Smartico.Missions.Application.Features.Velocity.Queries.GetLevelUpEvents;

/// <summary>
/// Response containing unacknowledged level-up events.
/// </summary>
/// <param name="Events">List of pending level-up events</param>
public record GetLevelUpEventsResponse(List<LevelUpEventDto> Events);
