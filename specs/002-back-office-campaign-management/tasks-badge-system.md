# Badge System Implementation Tasks

**Feature:** FR-6 Badge and Achievement System
**Priority:** High
**Spec Version:** 1.6.0
**Generated:** 2025-11-30

## Overview

Implementation tasks for the Badge and Achievement System, enabling operators to create badges with unlock criteria, rewards, and integration with the Level System.

## User Stories

| ID | Story | Priority |
|----|-------|----------|
| US1 | Create and manage badges with unlock criteria | P1 |
| US2 | Configure badge rewards (XP boost, free spins, cash) | P1 |
| US3 | Organize badges into series/collections | P2 |
| US4 | View badge list and details | P1 |
| US5 | Level System integration (badge unlock → XP, level-up → badge grant) | P2 |

---

## Phase 1: Setup

- [x] T001 Verify existing project structure and dependencies in backoffice-api/
- [x] T002 Verify existing frontend structure in backoffice-frontend/src/features/

---

## Phase 2: Foundational - Domain Layer

### Badge Entity and Value Objects

- [x] T003 [P] Create BadgeUnlockCriteriaType enum in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/BadgeUnlockCriteria.cs
- [x] T004 [P] Create BadgeRewardType enum in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/BadgeReward.cs
- [x] T005 [P] Create BadgeRarity enum in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Badge.cs
- [x] T006 [P] Create BadgeStatus enum in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Badge.cs
- [x] T007 Create BadgeUnlockCriteria value object with all 14 criteria types in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/BadgeUnlockCriteria.cs
- [x] T008 Create BadgeReward value object with all 5 reward types in backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/BadgeReward.cs
- [x] T009 Create Badge entity with all attributes per spec in backoffice-api/src/Smartico.BackOffice.Domain/Entities/Badge.cs
- [x] T010 [P] Create BadgeSeries entity in backoffice-api/src/Smartico.BackOffice.Domain/Entities/BadgeSeries.cs

### Repository Interfaces

- [x] T011 [P] Create IBadgeRepository interface in backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IBadgeRepository.cs
- [x] T012 [P] Create IBadgeSeriesRepository interface in backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IBadgeSeriesRepository.cs

---

## Phase 3: Infrastructure Layer

### MongoDB Repositories

- [x] T013 [P] Implement BadgeRepository in backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/BadgeRepository.cs
- [x] T014 [P] Implement BadgeSeriesRepository in backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/BadgeSeriesRepository.cs
- [x] T015 Register Badge repositories in DI container in backoffice-api/src/Smartico.BackOffice.Api/Program.cs

---

## Phase 4: Application Layer - Badge CRUD (US1, US4)

### DTOs

- [x] T016 [P] [US1] Create BadgeDto in backoffice-api/src/Smartico.BackOffice.Application/Badges/DTOs/BadgeDto.cs
- [x] T017 [P] [US1] Create BadgeUnlockCriteriaDto in backoffice-api/src/Smartico.BackOffice.Application/Badges/DTOs/BadgeUnlockCriteriaDto.cs
- [x] T018 [P] [US1] Create BadgeRewardDto in backoffice-api/src/Smartico.BackOffice.Application/Badges/DTOs/BadgeRewardDto.cs
- [x] T019 [P] [US1] Create BadgeSeriesDto in backoffice-api/src/Smartico.BackOffice.Application/Badges/DTOs/BadgeSeriesDto.cs

### Commands

- [x] T020 [US1] Create CreateBadgeCommand in backoffice-api/src/Smartico.BackOffice.Application/Badges/Commands/CreateBadgeCommand.cs
- [x] T021 [US1] Create UpdateBadgeCommand in backoffice-api/src/Smartico.BackOffice.Application/Badges/Commands/UpdateBadgeCommand.cs
- [x] T022 [US1] Create PublishBadgeCommand in backoffice-api/src/Smartico.BackOffice.Application/Badges/Commands/PublishBadgeCommand.cs
- [x] T023 [US1] Create ArchiveBadgeCommand in backoffice-api/src/Smartico.BackOffice.Application/Badges/Commands/ArchiveBadgeCommand.cs

### Validators

- [x] T024 [US1] Create CreateBadgeCommandValidator with unlock criteria validation in backoffice-api/src/Smartico.BackOffice.Application/Badges/Validators/CreateBadgeCommandValidator.cs
- [x] T025 [US1] Create UpdateBadgeCommandValidator in backoffice-api/src/Smartico.BackOffice.Application/Badges/Validators/UpdateBadgeCommandValidator.cs

### Service Interface and Implementation

- [x] T026 [US1] Create IBadgeService interface in backoffice-api/src/Smartico.BackOffice.Application/Badges/Interfaces/IBadgeService.cs
- [x] T027 [US1] Implement BadgeService with CRUD operations in backoffice-api/src/Smartico.BackOffice.Application/Badges/Services/BadgeService.cs
- [x] T028 [US1] Register BadgeService in DI container in backoffice-api/src/Smartico.BackOffice.Api/Program.cs

---

## Phase 5: Application Layer - Badge Rewards (US2)

- [x] T029 [US2] Add reward validation logic to CreateBadgeCommandValidator (XpBoost multiplier 1.1-3.0, duration 1-168 hours) in backoffice-api/src/Smartico.BackOffice.Application/Badges/Validators/CreateBadgeCommandValidator.cs
- [x] T030 [US2] Add BonusTemplate reference validation in BadgeService in backoffice-api/src/Smartico.BackOffice.Application/Badges/Services/BadgeService.cs

---

## Phase 6: Application Layer - Badge Series (US3)

### Commands and Service

- [x] T031 [P] [US3] Create CreateBadgeSeriesCommand in backoffice-api/src/Smartico.BackOffice.Application/BadgeSeries/Commands/CreateBadgeSeriesCommand.cs
- [x] T032 [P] [US3] Create UpdateBadgeSeriesCommand in backoffice-api/src/Smartico.BackOffice.Application/BadgeSeries/Commands/UpdateBadgeSeriesCommand.cs
- [x] T033 [US3] Create IBadgeSeriesService interface in backoffice-api/src/Smartico.BackOffice.Application/BadgeSeries/Interfaces/IBadgeSeriesService.cs
- [x] T034 [US3] Implement BadgeSeriesService in backoffice-api/src/Smartico.BackOffice.Application/BadgeSeries/Services/BadgeSeriesService.cs
- [x] T035 [US3] Register BadgeSeriesService in DI container in backoffice-api/src/Smartico.BackOffice.Api/Program.cs

---

## Phase 7: API Layer - Controllers

- [x] T036 [US1] Create BadgesController with CRUD endpoints in backoffice-api/src/Smartico.BackOffice.Api/Controllers/BadgesController.cs
- [x] T037 [US3] Create BadgeSeriesController in backoffice-api/src/Smartico.BackOffice.Api/Controllers/BadgeSeriesController.cs
- [x] T038 Add Badge permissions to seed-permissions.json in backoffice-api/scripts/seed-permissions.json

---

## Phase 8: Level System Integration (US5)

- [x] T039 [US5] Add BadgeId field to LevelReward for LevelRewardType.Badge in backoffice-api/src/Smartico.BackOffice.Domain/Entities/LevelSystem.cs
- [x] T040 [US5] Update LevelSystemDto to include badgeId in level rewards in backoffice-api/src/Smartico.BackOffice.Application/LevelSystems/DTOs/LevelSystemDto.cs
- [x] T041 [US5] Update LevelSystemService to validate badge references in backoffice-api/src/Smartico.BackOffice.Application/LevelSystems/Services/LevelSystemService.cs
- [x] T042 [US5] Update CreateLevelSystemCommandValidator to validate badge IDs exist in backoffice-api/src/Smartico.BackOffice.Application/LevelSystems/Validators/CreateLevelSystemCommandValidator.cs

---

## Phase 9: Frontend - Types and API

- [x] T043 [P] [US1] Add Badge types to api.types.ts in backoffice-frontend/src/services/api.types.ts
- [x] T044 [P] [US1] Add BadgeSeries types to api.types.ts in backoffice-frontend/src/services/api.types.ts
- [x] T045 [US1] Create badgeApi.ts with API client functions in backoffice-frontend/src/services/badgeApi.ts
- [x] T046 [US3] Create badgeSeriesApi.ts in backoffice-frontend/src/services/badgeSeriesApi.ts

---

## Phase 10: Frontend - Badge Feature Module (US1, US4)

### Schema and Components

- [x] T047 [US1] Create badgeSchema.ts with Zod validation in backoffice-frontend/src/features/badges/schemas/badgeSchema.ts
- [x] T048 [P] [US4] Create BadgeCard.tsx component in backoffice-frontend/src/features/badges/components/BadgeCard.tsx
- [x] T049 [P] [US4] Create BadgeList.tsx component in backoffice-frontend/src/features/badges/components/BadgeList.tsx
- [x] T050 [US1] Create UnlockCriteriaBuilder.tsx component in backoffice-frontend/src/features/badges/components/UnlockCriteriaBuilder.tsx
- [x] T051 [US2] Create BadgeRewardConfig.tsx component in backoffice-frontend/src/features/badges/components/BadgeRewardConfig.tsx
- [x] T052 [US1] Create BadgeForm.tsx component in backoffice-frontend/src/features/badges/components/BadgeForm.tsx

### Pages

- [x] T053 [US4] Create BadgesPage.tsx (list view) in backoffice-frontend/src/features/badges/pages/BadgesPage.tsx
- [x] T054 [US1] Create CreateBadgePage.tsx in backoffice-frontend/src/features/badges/pages/CreateBadgePage.tsx
- [x] T055 [US4] Create BadgeDetailsPage.tsx in backoffice-frontend/src/features/badges/pages/BadgeDetailsPage.tsx
- [x] T056 [US1] Create EditBadgePage.tsx in backoffice-frontend/src/features/badges/pages/EditBadgePage.tsx

---

## Phase 11: Frontend - Badge Series (US3)

- [x] T057 [P] [US3] Create BadgeSeriesCard.tsx in backoffice-frontend/src/features/badges/components/BadgeSeriesCard.tsx
- [x] T058 [P] [US3] Create BadgeSeriesList.tsx in backoffice-frontend/src/features/badges/components/BadgeSeriesList.tsx
- [x] T059 [US3] Create BadgeSeriesPage.tsx in backoffice-frontend/src/features/badges/pages/BadgeSeriesPage.tsx
- [x] T060 [US3] Create CreateBadgeSeriesPage.tsx in backoffice-frontend/src/features/badges/pages/CreateBadgeSeriesPage.tsx

---

## Phase 12: Frontend - Routing and Navigation

- [x] T061 Add badge routes to App.tsx in backoffice-frontend/src/App.tsx
- [x] T062 Add Badges navigation item to Layout.tsx in backoffice-frontend/src/components/Layout.tsx

---

## Phase 13: Frontend - Level System Integration (US5)

- [x] T063 [US5] Update level system types to include badgeId in rewards in backoffice-frontend/src/services/api.types.ts
- [x] T064 [US5] Update CreateLevelSystemPage to support Badge reward type with badge selector in backoffice-frontend/src/features/levels/pages/CreateLevelSystemPage.tsx

---

## Phase 14: Polish & Cross-Cutting

- [x] T065 Add badge icon display with rarity styling (color borders for common/rare/epic/legendary)
- [x] T066 Add hidden badge indicator (lock icon, hidden criteria text)
- [x] T067 Add progress tracking display for badges (e.g., "32/50 tournaments won")
- [x] T068 Verify operator isolation - all badge queries filter by operatorId
- [x] T069 Build and verify no compilation errors

---

## Dependencies

```
Phase 1 (Setup) → Phase 2 (Domain)
Phase 2 (Domain) → Phase 3 (Infrastructure)
Phase 3 (Infrastructure) → Phase 4 (Application - Badge CRUD)
Phase 4 → Phase 5 (Rewards) [can run in parallel]
Phase 4 → Phase 6 (Series) [can run in parallel]
Phase 4, 5, 6 → Phase 7 (API Controllers)
Phase 7 → Phase 8 (Level System Integration)
Phase 7 → Phase 9 (Frontend Types)
Phase 9 → Phase 10 (Frontend Badge Module)
Phase 10 → Phase 11 (Frontend Series)
Phase 10, 11 → Phase 12 (Routing)
Phase 12 → Phase 13 (Frontend Level Integration)
Phase 13 → Phase 14 (Polish)
```

## Parallel Execution Opportunities

### Backend Parallel Group 1 (Phase 2)
```
T003, T004, T005, T006, T010 - All enums and BadgeSeries entity
```

### Backend Parallel Group 2 (Phase 3)
```
T013, T014 - Both repository implementations
```

### Backend Parallel Group 3 (Phase 4)
```
T016, T017, T018, T019 - All DTOs
```

### Frontend Parallel Group 1 (Phase 9)
```
T043, T044 - Type definitions
```

### Frontend Parallel Group 2 (Phase 10)
```
T048, T049 - BadgeCard and BadgeList components
```

### Frontend Parallel Group 3 (Phase 11)
```
T057, T058 - BadgeSeriesCard and BadgeSeriesList components
```

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 69 |
| Phase 1 (Setup) | 2 |
| Phase 2 (Domain) | 10 |
| Phase 3 (Infrastructure) | 3 |
| Phase 4 (Badge CRUD - US1) | 13 |
| Phase 5 (Rewards - US2) | 2 |
| Phase 6 (Series - US3) | 5 |
| Phase 7 (API) | 3 |
| Phase 8 (Level Integration - US5) | 4 |
| Phase 9 (Frontend Types) | 4 |
| Phase 10 (Frontend Badge - US1, US4) | 10 |
| Phase 11 (Frontend Series - US3) | 4 |
| Phase 12 (Routing) | 2 |
| Phase 13 (Frontend Level - US5) | 2 |
| Phase 14 (Polish) | 5 |
| Parallel Opportunities | 6 groups |

### MVP Scope (Recommended)

**Phase 1-4, 7, 9-10, 12**: Core badge CRUD with frontend
- Badge entity, repository, service, controller
- Frontend list, create, detail pages
- Basic unlock criteria (MissionCompleted, WagerAmount, BetCount)
- No rewards, no series, no level integration

**Full Implementation**: All 69 tasks for complete FR-6 feature.
