# Smartico.Missions.Domain

**Layer:** Domain (Core Business Logic)  
**Dependencies:** None (Pure business logic)

## Purpose

The Domain layer contains the core business logic and entities of the Missions & Badges feature. This layer has **no external dependencies** and represents the heart of the application.

## Structure

```
Domain/
├── Entities/           # Domain entities (Mission, Badge, Task)
├── Enums/              # Domain enumerations (MissionStatus, AchievementType)
├── Interfaces/         # Domain service interfaces
└── ValueObjects/       # Value objects (MissionId, UserId, Progress)
```

## Principles

- **No Dependencies**: This layer should not reference any other project
- **Pure Business Logic**: Contains only domain-specific logic
- **SOLID Compliant**: Each entity follows Single Responsibility Principle
- **Immutability Preferred**: Use value objects where applicable
- **No Infrastructure Concerns**: No database, API, or external service logic

## Key Entities

### Mission
Represents a gamification mission that users can complete for rewards.

### Badge
Represents an achievement badge earned by completing specific actions.

### Task
Represents an individual task within a mission.

## Interfaces

Domain interfaces define contracts for infrastructure services without depending on their implementations.

Example:
- `ISmarticoApiClient` - Contract for external API communication
- `ICacheService` - Contract for caching mechanism
- `IProgressBroadcaster` - Contract for real-time updates

---

**Architecture Pattern:** Clean Architecture (Onion Architecture)  
**Created:** 2024-10-29

