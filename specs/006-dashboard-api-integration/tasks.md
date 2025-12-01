# Dashboard API Integration - Task Breakdown

**Epic:** Dashboard API Integration (006)
**Created:** 2025-12-01
**Owner:** Development Team
**Status:** Ready for Implementation

## Task Categorization

- **[P]** Parallelizable - Can run concurrently with other [P] tasks
- **[US1]** User Story 1: Jackpot API Integration
- **[US2]** User Story 2: Mission API Integration
- **[US3]** User Story 3: Badge API Integration
- **[US4]** User Story 4: Player Progress Tracking

## Epic Overview

**Goal:** Enable backend API to read gamification data from MongoDB populated by backoffice-api
**Business Value:** Players see demo content configured by operators immediately
**Success Criteria:**
- GET /api/jackpots returns data from MongoDB
- GET /api/missions returns data from MongoDB
- GET /api/badges returns data from MongoDB
- Response time < 200ms (p95)

---

## Phase 1: Setup

**Goal:** Configure MongoDB connection and project references
**Independent Test:** `dotnet build` succeeds with MongoDB.Driver package

- [x] T001 Add MongoDB.Driver package to `backend/src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj`
- [x] T002 [P] Add project reference to BackOffice.Domain in `backend/src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj`
- [x] T003 [P] Create MongoDbSettings configuration class in `backend/src/Smartico.Missions.Infrastructure/Configuration/MongoDbSettings.cs`
- [x] T004 Add MongoDB configuration section to `backend/src/Smartico.Missions.Api/appsettings.json`
- [x] T005 [P] Add MongoDB configuration section to `backend/src/Smartico.Missions.Api/appsettings.Development.json`
- [x] T006 Add Demo.DefaultOperatorId configuration to `backend/src/Smartico.Missions.Api/appsettings.Development.json`
- [x] T007 Register MongoDB services (IMongoClient, IMongoDatabase) in `backend/src/Smartico.Missions.Api/Program.cs`

---

## Phase 2: Foundational - Repository Interfaces

**Goal:** Define repository contracts for data access
**Independent Test:** Interfaces compile with no errors
**Blocking:** Must complete before US1-US4

- [x] T008 [P] Create IJackpotReadRepository interface in `backend/src/Smartico.Missions.Domain/Interfaces/IJackpotReadRepository.cs`
- [x] T009 [P] Create IMissionReadRepository interface in `backend/src/Smartico.Missions.Domain/Interfaces/IMissionReadRepository.cs`
- [x] T010 [P] Create IBadgeReadRepository interface in `backend/src/Smartico.Missions.Domain/Interfaces/IBadgeReadRepository.cs`
- [x] T011 [P] Create IPlayerProgressRepository interface in `backend/src/Smartico.Missions.Domain/Interfaces/IPlayerProgressRepository.cs`

---

## Phase 3: User Story 1 - Jackpot API Integration (FR-2)

**Story Goal:** Players can view active jackpots from MongoDB via GET /api/jackpots
**Independent Test:** `curl http://localhost:5000/api/jackpots?userId=user123` returns jackpots from MongoDB

### Repository Implementation

- [x] T012 [US1] Implement JackpotReadRepository.GetActiveJackpotsAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/JackpotReadRepository.cs`
- [x] T013 [US1] Implement JackpotReadRepository.GetByIdAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/JackpotReadRepository.cs`
- [x] T014 [US1] Register IJackpotReadRepository in DI container in `backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs`

### Mapper Implementation

- [x] T015 [US1] Create JackpotMapper.ToDto static method in `backend/src/Smartico.Missions.Application/Features/Jackpots/Mappers/JackpotMapper.cs`
- [x] T016 [US1] Create CalculateTemperature helper in `backend/src/Smartico.Missions.Application/Features/Jackpots/Mappers/JackpotMapper.cs`

### Query Handler Update

- [x] T017 [US1] Update GetJackpotsQueryHandler to inject IJackpotReadRepository in `backend/src/Smartico.Missions.Application/Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryHandler.cs`
- [x] T018 [US1] Replace ISmarticoJackpotApiClient call with repository call in `backend/src/Smartico.Missions.Application/Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryHandler.cs`
- [x] T019 [US1] Add operator ID resolution from configuration in `backend/src/Smartico.Missions.Application/Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryHandler.cs`

---

## Phase 4: User Story 2 - Mission API Integration (FR-3)

**Story Goal:** Players can view active missions from MongoDB via GET /api/missions
**Independent Test:** `curl http://localhost:5000/api/missions?userId=user123` returns missions from MongoDB

### Repository Implementation

- [x] T020 [US2] Implement MissionReadRepository.GetActiveMissionsAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/MissionReadRepository.cs`
- [x] T021 [US2] Implement MissionReadRepository.GetByIdAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/MissionReadRepository.cs`
- [x] T022 [US2] Register IMissionReadRepository in DI container in `backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs`

### Mapper Implementation

- [x] T023 [US2] Create MissionMapper.ToDto static method in `backend/src/Smartico.Missions.Application/Features/Missions/Mappers/MissionMapper.cs`
- [x] T024 [US2] Create CalculateProgress helper (currentValue/targetValue * 100) in `backend/src/Smartico.Missions.Application/Features/Missions/Mappers/MissionMapper.cs`

### Controller Update

- [x] T025 [US2] Update MissionsController to inject IMissionReadRepository in `backend/src/Smartico.Missions.Api/Controllers/MissionsController.cs`
- [x] T026 [US2] Replace ISmarticoApiClient.GetMissionsAsync with repository call in `backend/src/Smartico.Missions.Api/Controllers/MissionsController.cs`
- [x] T027 [US2] Add operator ID resolution from configuration in `backend/src/Smartico.Missions.Api/Controllers/MissionsController.cs`
- [x] T028 [US2] Update GetMissionById to use repository in `backend/src/Smartico.Missions.Api/Controllers/MissionsController.cs`

---

## Phase 5: User Story 3 - Badge API Integration (FR-4)

**Story Goal:** Players can view badges from MongoDB via GET /api/badges
**Independent Test:** `curl http://localhost:5000/api/badges?userId=user123` returns badges from MongoDB

### Repository Implementation

- [x] T029 [US3] Implement BadgeReadRepository.GetActiveBadgesAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/BadgeReadRepository.cs`
- [x] T030 [US3] Implement BadgeReadRepository.GetByIdAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/BadgeReadRepository.cs`
- [x] T031 [US3] Register IBadgeReadRepository in DI container in `backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs`

### Mapper Implementation

- [x] T032 [US3] Create BadgeMapper.ToDto static method in `backend/src/Smartico.Missions.Application/Features/Badges/Mappers/BadgeMapper.cs`
- [x] T033 [US3] Map Rarity enum to Category string in `backend/src/Smartico.Missions.Application/Features/Badges/Mappers/BadgeMapper.cs`

### Controller Update

- [x] T034 [US3] Update BadgesController to inject IBadgeReadRepository in `backend/src/Smartico.Missions.Api/Controllers/BadgesController.cs`
- [x] T035 [US3] Replace ISmarticoApiClient.GetBadgesAsync with repository call in `backend/src/Smartico.Missions.Api/Controllers/BadgesController.cs`
- [x] T036 [US3] Add operator ID resolution from configuration in `backend/src/Smartico.Missions.Api/Controllers/BadgesController.cs`
- [x] T037 [US3] Update GetBadgeById to use repository in `backend/src/Smartico.Missions.Api/Controllers/BadgesController.cs`

---

## Phase 6: User Story 4 - Player Progress Tracking (FR-5)

**Story Goal:** Track player progress for missions, badges, and jackpot opt-ins
**Independent Test:** Player opt-in/opt-out persists to MongoDB and affects API responses

### Entity Implementation

- [ ] T038 [US4] Create PlayerProgress entity class in `backend/src/Smartico.Missions.Domain/Entities/PlayerProgress.cs`
- [ ] T039 [US4] Create MissionProgressData value object in `backend/src/Smartico.Missions.Domain/Entities/PlayerProgress.cs`
- [ ] T040 [US4] Create EarnedBadge value object in `backend/src/Smartico.Missions.Domain/Entities/PlayerProgress.cs`

### Repository Implementation

- [ ] T041 [US4] Implement PlayerProgressRepository.GetByPlayerIdAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/PlayerProgressRepository.cs`
- [ ] T042 [US4] Implement PlayerProgressRepository.UpsertAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/PlayerProgressRepository.cs`
- [ ] T043 [US4] Implement PlayerProgressRepository.AddJackpotOptInAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/PlayerProgressRepository.cs`
- [ ] T044 [US4] Implement PlayerProgressRepository.RemoveJackpotOptInAsync in `backend/src/Smartico.Missions.Infrastructure/Repositories/PlayerProgressRepository.cs`
- [ ] T045 [US4] Register IPlayerProgressRepository in DI container in `backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs`

### API Response Updates

- [ ] T046 [US4] Update JackpotMapper to include IsOptedIn from PlayerProgress in `backend/src/Smartico.Missions.Application/Features/Jackpots/Mappers/JackpotMapper.cs`
- [ ] T047 [US4] Update MissionMapper to include progress from PlayerProgress in `backend/src/Smartico.Missions.Application/Features/Missions/Mappers/MissionMapper.cs`
- [ ] T048 [US4] Update BadgeMapper to include IsEarned from PlayerProgress in `backend/src/Smartico.Missions.Application/Features/Badges/Mappers/BadgeMapper.cs`

### Opt-In/Opt-Out Handler Updates

- [ ] T049 [US4] Update OptInJackpotCommand to use IPlayerProgressRepository in `backend/src/Smartico.Missions.Application/Features/Jackpots/Commands/OptIn/OptInJackpotCommandHandler.cs`
- [ ] T050 [US4] Update OptOutJackpotCommand to use IPlayerProgressRepository in `backend/src/Smartico.Missions.Application/Features/Jackpots/Commands/OptOut/OptOutJackpotCommandHandler.cs`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal:** Documentation, cleanup, and verification

- [ ] T051 Remove unused ISmarticoApiClient dependency from MissionsController in `backend/src/Smartico.Missions.Api/Controllers/MissionsController.cs`
- [ ] T052 Remove unused ISmarticoApiClient dependency from BadgesController in `backend/src/Smartico.Missions.Api/Controllers/BadgesController.cs`
- [ ] T053 Remove unused ISmarticoJackpotApiClient dependency from GetJackpotsQueryHandler in `backend/src/Smartico.Missions.Application/Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryHandler.cs`
- [ ] T054 Update README with MongoDB configuration instructions in `backend/README.md`
- [ ] T055 Verify multi-tenant data isolation by testing with different operator IDs

---

## Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational - Interfaces)
    │
    ├──────────────────┬──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼
Phase 3 (US1)     Phase 4 (US2)     Phase 5 (US3)     Phase 6 (US4)
Jackpots          Missions          Badges            PlayerProgress
    │                  │                  │                  │
    └──────────────────┴──────────────────┴──────────────────┘
                                │
                                ▼
                        Phase 7 (Polish)
```

**Note:** US1, US2, US3 can be implemented in parallel after Phase 2 completes. US4 can also start in parallel but T046-T050 depend on US1-US3 being complete.

---

## Parallel Execution Examples

### Example 1: Repository Implementation (within Phase 2)
```
T008 (IJackpotReadRepository) ──┐
T009 (IMissionReadRepository) ──┼── All can run in parallel
T010 (IBadgeReadRepository) ────┤
T011 (IPlayerProgressRepository)┘
```

### Example 2: User Story Implementation (after Phase 2)
```
Phase 3 (US1: Jackpots)  ──┐
Phase 4 (US2: Missions)  ──┼── Can run in parallel
Phase 5 (US3: Badges)    ──┘
```

### Example 3: Within US1 (Jackpots)
```
T012 (Repository.GetActive) ──┐
T013 (Repository.GetById)   ──┼── Sequential (same file)
T014 (DI Registration)      ──┘

T015 (Mapper.ToDto)         ──┬── Sequential (same file)
T016 (CalculateTemperature) ──┘
```

---

## Implementation Strategy

### MVP Scope (Phase 1-3)
Implement only Jackpot API integration first:
1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1: Jackpots)
4. Verify with: `curl http://localhost:5000/api/jackpots?userId=user123`

### Incremental Delivery
- **Milestone 1:** Jackpots from MongoDB (T001-T019)
- **Milestone 2:** Missions from MongoDB (T020-T028)
- **Milestone 3:** Badges from MongoDB (T029-T037)
- **Milestone 4:** Player Progress (T038-T050)
- **Milestone 5:** Cleanup & Documentation (T051-T055)

---

## Summary

**Total Tasks:** 55

**Tasks per User Story:**
| User Story | Description | Task Count |
|------------|-------------|------------|
| Setup | Phase 1 | 7 |
| Foundational | Phase 2 | 4 |
| US1 | Jackpot API | 8 |
| US2 | Mission API | 9 |
| US3 | Badge API | 9 |
| US4 | Player Progress | 13 |
| Polish | Phase 7 | 5 |

**Parallel Opportunities:**
- T002-T003, T004-T005 (config files)
- T008-T011 (interfaces)
- Phase 3-5 (US1, US2, US3)

**MVP Scope:** 19 tasks (T001-T019) for Jackpot API only

---

**Last Updated:** 2025-12-01
**Status:** Ready for Implementation

*Generated with [Claude Code](https://claude.com/claude-code)*
