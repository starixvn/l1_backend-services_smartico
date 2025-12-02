# xSpeed Demo Journey APIs - Implementation Plan

**Version:** 1.0
**Created:** 2025-12-02
**Status:** Draft
**Owner:** Claude

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [x] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards
- [x] **Testing Strategy:** AAA pattern with single assertions specified for all components
- [x] **UX Consistency:** API responses follow existing demo API patterns
- [x] **Performance:** Setup completes in <5 seconds, leverages existing caching
- [x] **Type Safety:** TypeScript strict mode compliance, all DTOs fully typed

## Executive Summary

This implementation extends the existing `DemoScenarioService` in the backoffice-api to support xSpeed-specific demo scenarios based on "The Velocity Program" specification. The feature adds 4 new scenario endpoints that create the complete xSpeed gamification journey including Velocity Tiers (level system), tiered missions, xSpeed Mystery Drop jackpots, and tier achievement badges.

The implementation follows the established demo API patterns already in place, requiring only additions to the existing `DemoScenarioService` class and static scenario definitions. No new infrastructure or architectural changes are needed.

## Goals & Objectives

### Primary Goals
- Add xSpeed scenario definitions to existing `_scenarios` list
- Implement xSpeed-specific entity creation methods
- Support phased rollout scenarios (Phase 1, 2, 3)
- Single API call creates complete xSpeed journey

### Success Metrics
- Complete xSpeed setup: < 5 seconds
- Phase setup: < 2 seconds
- All scenarios discoverable via `GET /api/demo/scenarios`
- Dashboard displays all created entities correctly

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backoffice API                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  DemoController                          │   │
│  │  POST /api/demo/setup/{scenarioId}                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               DemoScenarioService                        │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  _scenarios (static list)                        │    │   │
│  │  │  + xspeed-velocity-program    ◄── NEW           │    │   │
│  │  │  + xspeed-phase-1             ◄── NEW           │    │   │
│  │  │  + xspeed-phase-2             ◄── NEW           │    │   │
│  │  │  + xspeed-phase-3             ◄── NEW           │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  │  SetupScenarioAsync()                                   │   │
│  │    ├── SetupXSpeedVelocityProgram()    ◄── NEW         │   │
│  │    ├── SetupXSpeedPhase1()             ◄── NEW         │   │
│  │    ├── SetupXSpeedPhase2()             ◄── NEW         │   │
│  │    └── SetupXSpeedPhase3()             ◄── NEW         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│          ┌───────────────────┼───────────────────┐             │
│          ▼                   ▼                   ▼             │
│  IMissionService    IJackpotService      IBadgeService         │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 9 / ASP.NET Core 9
- Language: C# 12
- Database: MongoDB
- Patterns: Clean Architecture, CQRS

**Existing Dependencies:**
- `IMissionService` - Mission creation
- `IJackpotService` - Jackpot creation
- `IBadgeService` / `IBadgeSeriesService` - Badge creation
- `PublishMissionCommandHandler` - Mission activation

### Key Design Decisions

1. **Extend existing service**: Add to `DemoScenarioService` rather than creating new service - follows existing patterns
2. **Static configuration**: Define xSpeed config as static data for easy maintenance
3. **Reuse entity creation patterns**: Use same Mission/Jackpot/Badge creation flow as existing scenarios
4. **Phased approach**: Support incremental rollout matching xSpeed deployment phases

## Implementation Phases

### Phase 1: xSpeed Scenario Definitions
**Dependencies:** None

**Tasks:**
- [ ] Add 4 xSpeed scenario definitions to `_scenarios` list
- [ ] Add scenario IDs as constants

**Deliverables:**
- Updated `_scenarios` with xSpeed entries
- xSpeed scenarios visible in `GET /api/demo/scenarios`

**Constitution Compliance:**
- Testing: Unit tests for scenario discovery
- Performance: Static data, no performance impact
- Types: New scenario DTOs properly typed

### Phase 2: xSpeed Configuration Data
**Dependencies:** Phase 1

**Tasks:**
- [ ] Create `XSpeedConfiguration` static class
- [ ] Define Velocity Tiers configuration
- [ ] Define Mission configurations (Daily Driver, Explorer, Table Tactician, Whale)
- [ ] Define Jackpot configurations (Hourly, Daily, Mega)
- [ ] Define Badge configurations (tier badges)

**Deliverables:**
- `XSpeedConfiguration.cs` with all entity definitions

**Constitution Compliance:**
- Testing: Configuration data validation tests
- Types: Strongly typed configuration classes

### Phase 3: xSpeed Setup Methods
**Dependencies:** Phase 2

**Tasks:**
- [ ] Implement `SetupXSpeedVelocityProgram()` - creates all entities
- [ ] Implement `SetupXSpeedPhase1()` - Levels 1-2, Daily Driver
- [ ] Implement `SetupXSpeedPhase2()` - All levels, Table missions, Hourly jackpot
- [ ] Implement `SetupXSpeedPhase3()` - Complete with tournaments
- [ ] Add switch cases in `SetupScenarioAsync()`

**Deliverables:**
- Working xSpeed demo setup via API calls

**Constitution Compliance:**
- Testing: Integration tests for each setup method
- Performance: < 5 seconds for complete setup

### Phase 4: Level-Gated Missions
**Dependencies:** Phase 3

**Tasks:**
- [ ] Add `RequiredLevel` property to Mission entity (if not exists)
- [ ] Configure mission level requirements:
  - Daily Driver: Level 1+
  - Explorer: Level 2+
  - Table Tactician: Level 3+
  - Whale Challenge: Level 4+

**Deliverables:**
- Missions created with level requirements
- Dashboard shows level-gated missions correctly

### Phase 5: Testing & Documentation
**Dependencies:** Phase 4

**Tasks:**
- [ ] Write unit tests for all new methods
- [ ] Write integration tests for API endpoints
- [ ] Update API documentation
- [ ] Test with player dashboard

**Deliverables:**
- Complete test coverage
- Updated Swagger documentation

## Testing Strategy

### Unit Testing
- **Coverage Target:** 80% minimum for new code
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion
- **Naming:** `should_ExpectedBehavior_When_StateUnderTest`

**Test Cases:**
```csharp
// Scenario Discovery
should_return_xspeed_scenarios_when_getting_all_scenarios()
should_return_xspeed_scenarios_when_filtering_by_complete_category()

// Setup Methods
should_create_all_entities_when_setting_up_velocity_program()
should_create_only_phase1_entities_when_setting_up_phase1()
should_activate_entities_when_activate_flag_is_true()
should_return_error_when_scenario_not_found()
```

### Integration Testing
- **Scope:** API endpoints, MongoDB entity creation
- **Tools:** xUnit, Testcontainers for MongoDB

**Test Cases:**
```csharp
// API Integration
POST_setup_xspeed_velocity_program_should_create_entities()
POST_setup_xspeed_phase1_should_create_phase1_only()
GET_scenarios_should_include_xspeed_scenarios()
```

## Performance Requirements

### Backend
- xSpeed complete setup: < 5 seconds
- Phase setup: < 2 seconds
- Scenario discovery: < 100ms

### Monitoring
- Log entity creation times
- Track setup success/failure rates

## File Changes Summary

### New Files
```
backoffice-api/src/Smartico.BackOffice.Application/Demo/
└── Configuration/
    └── XSpeedConfiguration.cs       # xSpeed entity definitions
```

### Modified Files
```
backoffice-api/src/Smartico.BackOffice.Application/Demo/Services/
└── DemoScenarioService.cs
    ├── Add _scenarios entries       # 4 new xSpeed scenarios
    ├── Add SetupXSpeedVelocityProgram()
    ├── Add SetupXSpeedPhase1()
    ├── Add SetupXSpeedPhase2()
    ├── Add SetupXSpeedPhase3()
    └── Update SetupScenarioAsync() switch cases
```

### Test Files
```
backoffice-api/tests/Smartico.BackOffice.Application.Tests/Demo/
├── DemoScenarioServiceTests.cs      # Add xSpeed test cases
└── XSpeedConfigurationTests.cs      # Validate configuration
```

## Dependencies

### Internal Dependencies
- `IMissionService`: Mission creation (exists)
- `IJackpotService`: Jackpot creation (exists)
- `IBadgeService`: Badge creation (exists)
- `IBadgeSeriesService`: Badge series creation (exists)
- `PublishMissionCommandHandler`: Mission activation (exists)

### No External Dependencies
All required infrastructure already exists.

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Mission level-gating not supported | Low | High | Check existing `PlayerSegment` or add `RequiredLevel` |
| Entity creation failures | Low | Medium | Use transactions, comprehensive error handling |
| Setup exceeds 5s timeout | Low | Medium | Parallel entity creation, optimize DB writes |

## Success Criteria

The implementation is considered successful when:

1. `POST /api/demo/setup/xspeed-velocity-program` creates all entities
2. `GET /api/demo/scenarios` includes 4 xSpeed scenarios
3. Player dashboard displays xSpeed missions with level requirements
4. Setup completes in < 5 seconds
5. All tests passing
6. API documentation updated

---

**Last Updated:** 2025-12-02
