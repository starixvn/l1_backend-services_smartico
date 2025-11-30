# Jackpot System Implementation Tasks

**Feature:** FR-4 Campaign Builder - Jackpot Configuration
**Priority:** High
**Spec Version:** 1.0.0
**Generated:** 2025-11-30

## Overview

Implementation tasks for the Jackpot System, enabling operators to create progressive and fixed jackpots with contribution rates, trigger conditions, and prize distribution rules.

## User Stories

| ID | Story | Priority |
|----|-------|----------|
| US1 | Create and manage progressive jackpots with contribution rates | P1 |
| US2 | Create and manage fixed jackpots with static amounts | P1 |
| US3 | Configure trigger conditions (random, value-based, time-based) | P1 |
| US4 | Configure multi-tier jackpots (mini, minor, major, grand) | P2 |
| US5 | Configure prize distribution and reset behavior | P1 |
| US6 | Select eligible games for jackpot contributions | P1 |
| US7 | View jackpot list and details with current values | P1 |

---

## Phase 1: Setup

- [ ] T001 Verify existing project structure and dependencies in backoffice-api/
- [ ] T002 Verify existing frontend structure in backoffice-frontend/src/features/

---

## Phase 2: Foundational - Domain Layer

### Jackpot Entity and Enums

- [ ] T003 [P] Create JackpotType enum (Progressive, Fixed) in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Jackpot.cs
- [ ] T004 [P] Create JackpotStatus enum (Draft, Active, Paused, Completed, Archived) in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Jackpot.cs
- [ ] T005 [P] Create JackpotTriggerType enum (Random, ValueBased, TimeBased) in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Jackpot.cs
- [ ] T006 [P] Create JackpotResetBehavior enum (ResetToSeed, ResetToZero, KeepRemainder) in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Jackpot.cs
- [ ] T007 [P] Create PrizeDistributionType enum (WinnerTakesAll, SplitAmongWinners) in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Jackpot.cs

### Jackpot Value Objects

- [ ] T008 Create JackpotTriggerCondition value object in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/JackpotTriggerCondition.cs
  - TriggerType (Random, ValueBased, TimeBased)
  - Probability (for Random - e.g., 0.0001 = 0.01%)
  - BetThreshold (for ValueBased - minimum bet amount to qualify)
  - TimeInterval (for TimeBased - hourly, daily drop schedule)
  - TimeOfDay (for TimeBased - specific time for drops)

- [ ] T009 Create JackpotTier value object in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/JackpotTier.cs
  - TierName (Mini, Minor, Major, Grand, or custom)
  - SeedAmount (initial value after reset)
  - ContributionRate (percentage of bet, e.g., 0.005 = 0.5%)
  - MaxValue (cap to prevent runaway growth)
  - CurrentValue (live jackpot amount)
  - TriggerCondition (tier-specific trigger)

- [ ] T010 Create JackpotPrizeDistribution value object in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/JackpotPrizeDistribution.cs
  - DistributionType (WinnerTakesAll, SplitAmongWinners)
  - MaxWinners (for split distribution)
  - WinnerPercentages (optional - custom split percentages)

### Jackpot Entity

- [ ] T011 Create Jackpot entity in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Jackpot.cs
  - Id, OperatorId, Name, Description
  - JackpotType (Progressive, Fixed)
  - Status (Draft, Active, Paused, Completed, Archived)
  - Tiers (List<JackpotTier>) - supports multi-tier
  - EligibleGames (List<string>) - game IDs that contribute
  - PrizeDistribution (value object)
  - ResetBehavior (enum)
  - Currency (string)
  - Schedule (StartDate, EndDate - optional)
  - TotalContributions (decimal - lifetime contributions)
  - TotalPayouts (decimal - lifetime payouts)
  - LastWonAt (DateTime?)
  - LastWinnerPlayerId (string?)
  - LastWinAmount (decimal?)
  - CreatedAt, UpdatedAt, CreatedBy

### Repository Interface

- [ ] T012 [P] Create IJackpotRepository interface in backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IJackpotRepository.cs

---

## Phase 3: Infrastructure Layer

### MongoDB Repository

- [ ] T013 [P] Implement JackpotRepository in backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/JackpotRepository.cs
- [ ] T014 Register Jackpot repository in DI container in backoffice-api/src/Smartico.BackOffice.Api/Program.cs

---

## Phase 4: Application Layer - Jackpot CRUD (US1, US2, US7)

### DTOs

- [ ] T015 [P] [US1] Create JackpotDto in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/DTOs/JackpotDto.cs
- [ ] T016 [P] [US1] Create JackpotTierDto in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/DTOs/JackpotTierDto.cs
- [ ] T017 [P] [US3] Create JackpotTriggerConditionDto in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/DTOs/JackpotTriggerConditionDto.cs
- [ ] T018 [P] [US5] Create JackpotPrizeDistributionDto in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/DTOs/JackpotPrizeDistributionDto.cs

### Commands

- [ ] T019 [US1] Create CreateJackpotCommand in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Commands/CreateJackpotCommand.cs
- [ ] T020 [US1] Create UpdateJackpotCommand in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Commands/UpdateJackpotCommand.cs
- [ ] T021 [US1] Create ActivateJackpotCommand in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Commands/ActivateJackpotCommand.cs
- [ ] T022 [US1] Create PauseJackpotCommand in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Commands/PauseJackpotCommand.cs
- [ ] T023 [US1] Create ArchiveJackpotCommand in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Commands/ArchiveJackpotCommand.cs

### Validators

- [ ] T024 [US1] Create CreateJackpotCommandValidator in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Validators/CreateJackpotCommandValidator.cs
  - Name required (1-100 chars)
  - At least one tier required
  - Tier validation (seed >= 0, contribution rate 0-1, max > seed)
  - Progressive requires contribution rate > 0
  - Fixed requires contribution rate = 0
  - Trigger condition validation per tier

- [ ] T025 [US1] Create UpdateJackpotCommandValidator in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Validators/UpdateJackpotCommandValidator.cs

### Service Interface and Implementation

- [ ] T026 [US1] Create IJackpotService interface in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Interfaces/IJackpotService.cs
- [ ] T027 [US1] Implement JackpotService with CRUD operations in backoffice-api/src/Smartico.BackOffice.Application/Jackpots/Services/JackpotService.cs
- [ ] T028 [US1] Register JackpotService in DI container in backoffice-api/src/Smartico.BackOffice.Api/Program.cs

---

## Phase 5: Application Layer - Trigger Configuration (US3)

- [ ] T029 [US3] Add trigger validation logic to CreateJackpotCommandValidator
  - Random: probability between 0.000001 and 0.1 (0.0001% to 10%)
  - ValueBased: betThreshold > 0
  - TimeBased: valid timeInterval and optional timeOfDay

- [ ] T030 [US3] Add trigger condition display formatting in JackpotService

---

## Phase 6: Application Layer - Multi-Tier Jackpots (US4)

- [ ] T031 [US4] Add multi-tier validation (tier names unique, ordered by value)
- [ ] T032 [US4] Add tier ordering logic (Mini < Minor < Major < Grand)
- [ ] T033 [US4] Support custom tier names beyond standard (Mini/Minor/Major/Grand)

---

## Phase 7: API Layer - Controllers

- [ ] T034 [US1] Create JackpotsController in backoffice-api/src/Smartico.BackOffice.Api/Controllers/JackpotsController.cs
  - GET /api/jackpots - list all jackpots for operator
  - GET /api/jackpots/active - list active jackpots
  - GET /api/jackpots/{id} - get jackpot details with current values
  - POST /api/jackpots - create jackpot
  - PUT /api/jackpots/{id} - update jackpot (draft only)
  - POST /api/jackpots/{id}/activate - activate jackpot
  - POST /api/jackpots/{id}/pause - pause jackpot
  - POST /api/jackpots/{id}/archive - archive jackpot
  - DELETE /api/jackpots/{id} - delete draft jackpot

- [ ] T035 Add Jackpot permissions to seed-permissions.json in backoffice-api/scripts/seed-permissions.json
  - jackpots.view, jackpots.create, jackpots.edit, jackpots.delete, jackpots.activate

- [ ] T036 Add Jackpot permissions to seed-roles.json in backoffice-api/scripts/seed-roles.json

---

## Phase 8: Frontend - Types and API

- [ ] T037 [P] [US1] Add Jackpot types to api.types.ts in backoffice-frontend/src/services/api.types.ts
  - JackpotType, JackpotStatus, JackpotTriggerType, JackpotResetBehavior, PrizeDistributionType enums
  - JackpotTriggerCondition, JackpotTier, JackpotPrizeDistribution, Jackpot interfaces
  - CreateJackpotCommand, UpdateJackpotCommand interfaces

- [ ] T038 [US1] Create jackpotApi.ts with API client functions in backoffice-frontend/src/services/jackpotApi.ts

---

## Phase 9: Frontend - Jackpot Feature Module (US1, US2, US7)

### Schema and Components

- [ ] T039 [US1] Create jackpotSchema.ts with Zod validation in backoffice-frontend/src/features/jackpots/schemas/jackpotSchema.ts
- [ ] T040 [P] [US7] Create JackpotCard.tsx component in backoffice-frontend/src/features/jackpots/components/JackpotCard.tsx
  - Display jackpot name, type, status
  - Show current value for each tier
  - Rarity-like styling for tiers (Mini=gray, Minor=blue, Major=purple, Grand=gold)

- [ ] T041 [P] [US7] Create JackpotList.tsx component in backoffice-frontend/src/features/jackpots/components/JackpotList.tsx
- [ ] T042 [US4] Create TierBuilder.tsx component in backoffice-frontend/src/features/jackpots/components/TierBuilder.tsx
  - Add/remove tiers
  - Configure per-tier: name, seed, contribution rate, max cap, trigger condition

- [ ] T043 [US3] Create TriggerConditionBuilder.tsx component in backoffice-frontend/src/features/jackpots/components/TriggerConditionBuilder.tsx
  - Random: probability input with % display
  - ValueBased: bet threshold input
  - TimeBased: interval selector + time picker

- [ ] T044 [US5] Create PrizeDistributionConfig.tsx component in backoffice-frontend/src/features/jackpots/components/PrizeDistributionConfig.tsx
- [ ] T045 [US6] Create EligibleGamesSelector.tsx component in backoffice-frontend/src/features/jackpots/components/EligibleGamesSelector.tsx
- [ ] T046 [US1] Create JackpotForm.tsx component in backoffice-frontend/src/features/jackpots/components/JackpotForm.tsx

### Pages

- [ ] T047 [US7] Create JackpotsPage.tsx (list view) in backoffice-frontend/src/features/jackpots/pages/JackpotsPage.tsx
- [ ] T048 [US1] Create CreateJackpotPage.tsx in backoffice-frontend/src/features/jackpots/pages/CreateJackpotPage.tsx
- [ ] T049 [US7] Create JackpotDetailsPage.tsx in backoffice-frontend/src/features/jackpots/pages/JackpotDetailsPage.tsx
  - Show current values for all tiers (live display)
  - Show recent winners
  - Show contribution/payout statistics

- [ ] T050 [US1] Create EditJackpotPage.tsx in backoffice-frontend/src/features/jackpots/pages/EditJackpotPage.tsx

---

## Phase 10: Frontend - Routing and Navigation

- [ ] T051 Add jackpot routes to App.tsx in backoffice-frontend/src/App.tsx
  - /jackpots - list
  - /jackpots/new - create
  - /jackpots/:id - details
  - /jackpots/:id/edit - edit

- [ ] T052 Add Jackpots navigation item to Layout.tsx in backoffice-frontend/src/components/Layout.tsx

---

## Phase 11: Polish & Cross-Cutting

- [ ] T053 Add jackpot tier value display with currency formatting
- [ ] T054 Add jackpot status badges with appropriate colors
- [ ] T055 Add live value refresh for active jackpots (polling or WebSocket future)
- [ ] T056 Add recent winner display on jackpot cards
- [ ] T057 Verify operator isolation - all jackpot queries filter by operatorId
- [ ] T058 Build and verify no compilation errors

---

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Domain)
Phase 2 (Domain) → Phase 3 (Infrastructure)
Phase 3 (Infrastructure) → Phase 4 (Application - Jackpot CRUD)
Phase 4 → Phase 5 (Triggers) [can run in parallel]
Phase 4 → Phase 6 (Multi-Tier) [can run in parallel]
Phase 4, 5, 6 → Phase 7 (API Controllers)
Phase 7 → Phase 8 (Frontend Types)
Phase 8 → Phase 9 (Frontend Jackpot Module)
Phase 9 → Phase 10 (Routing)
Phase 10 → Phase 11 (Polish)
```

## Parallel Execution Opportunities

### Backend Parallel Group 1 (Phase 2)
```
T003, T004, T005, T006, T007 - All enums
```

### Backend Parallel Group 2 (Phase 4)
```
T015, T016, T017, T018 - All DTOs
```

### Frontend Parallel Group 1 (Phase 9)
```
T040, T041 - JackpotCard and JackpotList components
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 58 |
| Phase 1 (Setup) | 2 |
| Phase 2 (Domain) | 10 |
| Phase 3 (Infrastructure) | 2 |
| Phase 4 (Jackpot CRUD - US1, US2) | 14 |
| Phase 5 (Triggers - US3) | 2 |
| Phase 6 (Multi-Tier - US4) | 3 |
| Phase 7 (API) | 3 |
| Phase 8 (Frontend Types) | 2 |
| Phase 9 (Frontend Module - US1, US7) | 12 |
| Phase 10 (Routing) | 2 |
| Phase 11 (Polish) | 6 |
| Parallel Opportunities | 3 groups |

### MVP Scope (Recommended)

**Phase 1-4, 7-10**: Core jackpot CRUD with single-tier support
- Jackpot entity, repository, service, controller
- Frontend list, create, detail pages
- Single tier (no multi-tier initially)
- Basic trigger (Random or ValueBased)
- Winner-takes-all distribution only

**Full Implementation**: All 58 tasks for complete FR-4 feature with multi-tier and all trigger types.
