# Smartico.Missions.Application

**Layer:** Application (Use Cases & Business Workflows)  
**Dependencies:** Domain

## Purpose

The Application layer orchestrates business workflows and use cases. It contains feature-specific logic organized using the **Vertical Slice Architecture** pattern for better maintainability.

## Structure

```
Application/
├── Features/                    # Vertical Slices (Feature-based organization)
│   ├── Missions/
│   │   ├── Commands/           # Write operations (OptIn, Claim)
│   │   └── Queries/            # Read operations (GetMissions, GetById)
│   └── Badges/
│       ├── Commands/           # Write operations
│       └── Queries/            # Read operations (GetBadges, GetById)
└── Common/                      # Shared application logic
    ├── Exceptions/             # Application-specific exceptions
    ├── Behaviors/              # Cross-cutting concerns (Logging, Validation)
    └── Interfaces/             # Application service interfaces
```

## Principles

- **Vertical Slices**: Each feature (Missions, Badges) is self-contained
- **CQRS Pattern**: Commands (write) and Queries (read) are separated
- **Dependency on Domain**: Uses domain entities and interfaces
- **No Infrastructure Knowledge**: Depends on abstractions, not implementations
- **Thin Layer**: Delegates business logic to Domain layer

## Feature Organization

### Missions Feature
- **Commands**: OptInMissionCommand, ClaimRewardCommand
- **Queries**: GetMissionsQuery, GetMissionByIdQuery

### Badges Feature
- **Commands**: (Future: TrackBadgeProgressCommand)
- **Queries**: GetBadgesQuery, GetBadgeByIdQuery

## Common Components

### Exceptions
Application-specific exceptions that provide meaningful error messages:
- `MissionNotFoundException`
- `MissionNotEligibleException`
- `RewardAlreadyClaimedException`

### Behaviors
Cross-cutting concerns applied to all commands/queries:
- `LoggingBehavior` - Logs all requests/responses
- `ValidationBehavior` - Validates input using FluentValidation
- `PerformanceBehavior` - Monitors slow operations

---

**Architecture Pattern:** Clean Architecture + Vertical Slices + CQRS  
**Created:** 2024-10-29

