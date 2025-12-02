# xSpeed Level Dashboard - Task Breakdown

**Generated:** 2025-12-02
**Feature:** 008-xspeed-level-dashboard
**Status:** Ready for Implementation

## Task Legend

- `[P]` = Parallel-safe (can run with other `[P]` tasks in same phase)
- `[S]` = Sequential (must complete before next task)
- `[B]` = Blocked by specific task ID
- Priority: Critical > High > Medium > Low

## User Stories Reference

| Story ID | Description | Priority |
|----------|-------------|----------|
| US-1 | Velocity Tier Status Display (FR-1) | Critical |
| US-2 | XP Progress Visualization (FR-2) | Critical |
| US-3 | Tier Benefits Showcase (FR-3) | High |
| US-4 | Mission Availability Matrix (FR-4) | High |
| US-5 | Level-Up Celebration (FR-5) | Medium |
| US-6 | Recent XP Activity Feed (FR-6) | Medium |
| US-7 | Next Tier Preview (FR-7) | Medium |

---

## Phase 1: Foundation (Types, Services, Hooks)

**Dependencies:** None
**Parallel with:** Phase 7 (Backend)

### [US-1, US-2] Core Type Definitions

- [x] T001 [P] [Story:US-1,US-2] Create `frontend/src/types/velocity.ts` with VelocityTier interface
- [x] T002 [P] [Story:US-1,US-2] Add PlayerVelocityProgress interface to `frontend/src/types/velocity.ts`
- [x] T003 [P] [Story:US-6] Add XpActivity and XpBreakdown interfaces to `frontend/src/types/velocity.ts`
- [x] T004 [P] [Story:US-4] Add TierMission and MissionReward interfaces to `frontend/src/types/velocity.ts`
- [x] T005 [P] [Story:US-5] Add LevelUpEvent interface to `frontend/src/types/velocity.ts`
- [x] T006 [S] [Story:US-1] Create tier rarity color mapping utility in `frontend/src/utils/tierColors.ts`

### [US-1, US-2] Velocity Service

- [x] T007 [B:T001-T005] [Story:US-1,US-2] Create `frontend/src/services/velocityService.ts` with getProgress method
- [x] T008 [B:T007] [Story:US-3] Add getTiers method to VelocityService
- [x] T009 [B:T007] [Story:US-4] Add getMissions method to VelocityService
- [x] T010 [B:T007] [Story:US-6] Add getXPActivity method to VelocityService
- [x] T011 [B:T007] [Story:US-5] Add getLevelUpEvents and acknowledgeLevelUp methods to VelocityService
- [ ] T012 [B:T007-T011] [Story:US-1] Write unit tests for VelocityService (`velocityService.test.ts`)

### [US-1, US-2] Custom Hooks

- [x] T013 [B:T007] [Story:US-1,US-2] Create `frontend/src/hooks/useVelocityProgress.ts` hook
- [ ] T014 [B:T013] [Story:US-1] Write unit tests for useVelocityProgress (`useVelocityProgress.test.ts`)
- [x] T015 [B:T008] [Story:US-3] Create `frontend/src/hooks/useVelocityTiers.ts` hook
- [ ] T016 [B:T015] [Story:US-3] Write unit tests for useVelocityTiers (`useVelocityTiers.test.ts`)
- [x] T017 [B:T010] [Story:US-6] Create `frontend/src/hooks/useXPActivity.ts` hook
- [ ] T018 [B:T017] [Story:US-6] Write unit tests for useXPActivity (`useXPActivity.test.ts`)

---

## Phase 2: Core Components (Hero Status Display)

**Dependencies:** Phase 1 (T001-T018)

### [US-1] Velocity Tier Card (Hero Component)

- [ ] T019 [B:T013] [Story:US-1] Create `frontend/src/components/velocity/TierBadge.tsx` component
- [ ] T020 [B:T019] [Story:US-1] Write unit tests for TierBadge (`TierBadge.test.tsx`)
- [ ] T021 [B:T006,T019] [Story:US-1] Create `frontend/src/components/velocity/VelocityTierCard.tsx` component shell
- [ ] T022 [B:T021] [Story:US-1] Add tier name/icon display with rarity styling to VelocityTierCard
- [ ] T023 [B:T021] [Story:US-1] Add tier achievement date display to VelocityTierCard
- [ ] T024 [B:T021-T023] [Story:US-1] Write unit tests for VelocityTierCard (`VelocityTierCard.test.tsx`)

### [US-2] XP Progress Visualization

- [ ] T025 [B:T013] [Story:US-2] Create `frontend/src/components/velocity/XPProgressRing.tsx` component
- [ ] T026 [B:T025] [Story:US-2] Add animated progress fill with Framer Motion
- [ ] T027 [B:T025] [Story:US-2] Add XP numeric display (current/next threshold)
- [ ] T028 [B:T025] [Story:US-2] Add max tier state handling (Supersonic "Max Level")
- [ ] T029 [B:T025-T028] [Story:US-2] Write unit tests for XPProgressRing (`XPProgressRing.test.tsx`)
- [ ] T030 [B:T021,T025] [Story:US-2] Integrate XPProgressRing into VelocityTierCard

### [US-3] Tier Benefits Display

- [ ] T031 [B:T015] [Story:US-3] Create `frontend/src/components/velocity/TierBenefitsList.tsx` component
- [ ] T032 [B:T031] [Story:US-3] Add unlocked vs locked benefit styling
- [ ] T033 [B:T031-T032] [Story:US-3] Write unit tests for TierBenefitsList (`TierBenefitsList.test.tsx`)
- [ ] T034 [B:T021,T031] [Story:US-3] Integrate TierBenefitsList into VelocityTierCard

---

## Phase 3: Progression Visualization

**Dependencies:** Phase 2 (T019-T034)

### [US-3, US-7] Tier Journey Timeline

- [ ] T035 [B:T015] [Story:US-3] Create `frontend/src/components/velocity/TierMilestone.tsx` component
- [ ] T036 [B:T035] [Story:US-3] Add milestone visual states (completed, current, locked)
- [ ] T037 [B:T035-T036] [Story:US-3] Write unit tests for TierMilestone (`TierMilestone.test.tsx`)
- [ ] T038 [B:T035] [Story:US-3] Create `frontend/src/components/velocity/TierJourneyProgress.tsx` component
- [ ] T039 [B:T038] [Story:US-3] Add connecting progress line between milestones
- [ ] T040 [B:T038] [Story:US-3] Add responsive layout (horizontal desktop, vertical mobile)
- [ ] T041 [B:T038-T040] [Story:US-3] Write unit tests for TierJourneyProgress (`TierJourneyProgress.test.tsx`)

### [US-7] Next Tier Preview Card

- [ ] T042 [B:T013,T015] [Story:US-7] Create `frontend/src/components/velocity/NextTierPreview.tsx` component
- [ ] T043 [B:T042] [Story:US-7] Add XP remaining display with call-to-action
- [ ] T044 [B:T042] [Story:US-7] Add next tier benefits preview
- [ ] T045 [B:T042] [Story:US-7] Handle max tier state (no preview needed)
- [ ] T046 [B:T042-T045] [Story:US-7] Write unit tests for NextTierPreview (`NextTierPreview.test.tsx`)

---

## Phase 4: Mission & Activity Features

**Dependencies:** Phase 1 (T001-T018)
**Parallel with:** Phase 2-3

### [US-4] Mission Availability Matrix

- [ ] T047 [B:T009] [Story:US-4] Create `frontend/src/components/velocity/MissionTierRow.tsx` component
- [ ] T048 [B:T047] [Story:US-4] Add available vs locked mission styling
- [ ] T049 [B:T047] [Story:US-4] Add mission completion status indicator
- [ ] T050 [B:T047-T049] [Story:US-4] Write unit tests for MissionTierRow (`MissionTierRow.test.tsx`)
- [ ] T051 [B:T047] [Story:US-4] Create `frontend/src/components/velocity/MissionAvailabilityCard.tsx` component
- [ ] T052 [B:T051] [Story:US-4] Add mission grouping by tier requirement
- [ ] T053 [B:T051] [Story:US-4] Add daily mission count display
- [ ] T054 [B:T051-T053] [Story:US-4] Write unit tests for MissionAvailabilityCard (`MissionAvailabilityCard.test.tsx`)

### [US-6] XP Activity Feed

- [ ] T055 [B:T017] [Story:US-6] Create `frontend/src/components/velocity/XPActivityItem.tsx` component
- [ ] T056 [B:T055] [Story:US-6] Add activity type icons (slots, table, mission, bonus)
- [ ] T057 [B:T055] [Story:US-6] Add relative timestamp display
- [ ] T058 [B:T055-T057] [Story:US-6] Write unit tests for XPActivityItem (`XPActivityItem.test.tsx`)
- [ ] T059 [B:T055] [Story:US-6] Create `frontend/src/components/velocity/XPActivityFeed.tsx` component
- [ ] T060 [B:T059] [Story:US-6] Add activity type filter controls
- [ ] T061 [B:T059] [Story:US-6] Add loading skeleton states
- [ ] T062 [B:T059-T061] [Story:US-6] Write unit tests for XPActivityFeed (`XPActivityFeed.test.tsx`)

---

## Phase 5: Level-Up Celebration

**Dependencies:** Phase 2 (T019-T034)

### [US-5] Celebration Modal

- [ ] T063 [B:T011] [Story:US-5] Create `frontend/src/hooks/useLevelUpEvents.ts` hook
- [ ] T064 [B:T063] [Story:US-5] Write unit tests for useLevelUpEvents (`useLevelUpEvents.test.ts`)
- [ ] T065 [B:T063] [Story:US-5] Create `frontend/src/components/velocity/LevelUpCelebration.tsx` modal component
- [ ] T066 [B:T065] [Story:US-5] Add tier transition animation (old → new)
- [ ] T067 [B:T065] [Story:US-5] Integrate ParticleEffect for confetti
- [ ] T068 [B:T065] [Story:US-5] Add new benefits announcement list
- [ ] T069 [B:T065] [Story:US-5] Add acknowledgement button with API call
- [ ] T070 [B:T065] [Story:US-5] Add keyboard accessibility (Escape to close, focus trap)
- [ ] T071 [B:T065-T070] [Story:US-5] Write unit tests for LevelUpCelebration (`LevelUpCelebration.test.tsx`)

### [US-5] Real-Time Integration

- [ ] T072 [B:T065] [Story:US-5] Add SignalR listener for level-up events
- [ ] T073 [B:T072] [Story:US-5] Add polling fallback for level-up events

---

## Phase 6: Page Integration

**Dependencies:** Phases 2-5 (T019-T073)

### Dashboard Page Assembly

- [ ] T074 [B:T034,T041,T046,T054,T062,T071] [Story:US-1,US-2,US-3] Create `frontend/src/pages/XSpeedDashboardPage.tsx` component shell
- [ ] T075 [B:T074] [Story:US-1] Integrate VelocityTierCard as hero (lg:col-span-2)
- [ ] T076 [B:T074] [Story:US-7] Integrate NextTierPreview in sidebar
- [ ] T077 [B:T074] [Story:US-3] Integrate TierJourneyProgress (full width)
- [ ] T078 [B:T074] [Story:US-4] Integrate MissionAvailabilityCard
- [ ] T079 [B:T074] [Story:US-6] Integrate XPActivityFeed
- [ ] T080 [B:T074] [Story:US-5] Integrate LevelUpCelebration modal
- [ ] T081 [B:T074-T080] [Story:US-1] Implement responsive grid layout (1-col mobile, 3-col desktop)
- [ ] T082 [B:T074-T081] Write unit tests for XSpeedDashboardPage (`XSpeedDashboardPage.test.tsx`)

### Navigation & Routing

- [ ] T083 [B:T074] Add route configuration for `/velocity` path
- [ ] T084 [B:T083] Add navigation link in sidebar/menu

### Integration Testing

- [ ] T085 [B:T074-T084] Create integration test: New player views dashboard
- [ ] T086 [B:T074-T084] Create integration test: Player tracks progress
- [ ] T087 [B:T074-T084] Create integration test: Level-up celebration flow
- [ ] T088 [B:T074-T084] Run Lighthouse accessibility audit
- [ ] T089 [B:T074-T084] Verify mobile responsive behavior

---

## Phase 7: Backend Velocity API

**Dependencies:** None
**Parallel with:** Phases 1-3

### Controller & DTOs

- [ ] T090 [P] [Story:US-1,US-2] Create `VelocityController.cs` in `backend/src/Smartico.Missions.Api/Controllers/`
- [ ] T091 [P] [Story:US-1,US-2] Create Velocity DTOs in `backend/src/Smartico.Missions.Application/Features/Velocity/`
- [ ] T092 [B:T090] [Story:US-1,US-2] Add GET `/velocity/progress` endpoint
- [ ] T093 [B:T090] [Story:US-3] Add GET `/velocity/tiers` endpoint
- [ ] T094 [B:T090] [Story:US-4] Add GET `/velocity/missions` endpoint
- [ ] T095 [B:T090] [Story:US-6] Add GET `/velocity/xp-activity` endpoint
- [ ] T096 [B:T090] [Story:US-5] Add GET `/velocity/level-up-events` endpoint
- [ ] T097 [B:T090] [Story:US-5] Add POST `/velocity/level-up-events/{id}/acknowledge` endpoint

### CQRS Query Handlers

- [ ] T098 [B:T091] [Story:US-1,US-2] Create `GetVelocityProgressQueryHandler.cs`
- [ ] T099 [B:T098] [Story:US-1,US-2] Write unit tests for GetVelocityProgressQueryHandler
- [ ] T100 [B:T091] [Story:US-3] Create `GetVelocityTiersQueryHandler.cs`
- [ ] T101 [B:T100] [Story:US-3] Write unit tests for GetVelocityTiersQueryHandler
- [ ] T102 [B:T091] [Story:US-4] Create `GetVelocityMissionsQueryHandler.cs`
- [ ] T103 [B:T102] [Story:US-4] Write unit tests for GetVelocityMissionsQueryHandler
- [ ] T104 [B:T091] [Story:US-6] Create `GetXPActivityQueryHandler.cs`
- [ ] T105 [B:T104] [Story:US-6] Write unit tests for GetXPActivityQueryHandler
- [ ] T106 [B:T091] [Story:US-5] Create `GetLevelUpEventsQueryHandler.cs`
- [ ] T107 [B:T106] [Story:US-5] Write unit tests for GetLevelUpEventsQueryHandler

### CQRS Command Handlers

- [ ] T108 [B:T091] [Story:US-5] Create `AcknowledgeLevelUpCommandHandler.cs`
- [ ] T109 [B:T108] [Story:US-5] Write unit tests for AcknowledgeLevelUpCommandHandler

### Caching & Performance

- [ ] T110 [B:T098,T100] Add 30-second caching to progress and tiers queries
- [ ] T111 [B:T090-T109] Run API performance tests (< 200ms p95)

---

## Task Summary

| Phase | Tasks | Critical Path |
|-------|-------|---------------|
| Phase 1: Foundation | T001-T018 (18 tasks) | T001 → T007 → T013 |
| Phase 2: Core Components | T019-T034 (16 tasks) | T019 → T021 → T030 |
| Phase 3: Progression | T035-T046 (12 tasks) | T035 → T038 → T042 |
| Phase 4: Mission & Activity | T047-T062 (16 tasks) | T047 → T051 → T055 → T059 |
| Phase 5: Level-Up | T063-T073 (11 tasks) | T063 → T065 → T072 |
| Phase 6: Page Integration | T074-T089 (16 tasks) | T074 → T081 → T088 |
| Phase 7: Backend API | T090-T111 (22 tasks) | T090 → T098 → T110 |

**Total Tasks:** 111

---

## Dependency Graph

```
Phase 1 (Foundation)           Phase 7 (Backend)
    │                              │
    ▼                              │ (parallel)
Phase 2 (Core Components)         │
    │                              │
    ├────────────────┬─────────────┤
    ▼                ▼             │
Phase 3          Phase 4          │
(Progression)   (Mission/Activity)│
    │                │             │
    ▼                ▼             │
Phase 5 (Level-Up Celebration)    │
    │                              │
    ▼                              ▼
Phase 6 (Page Integration) ←──── Backend Ready
```

---

## Parallel Execution Examples

### Maximum Parallelism for Phase 1

```bash
# Session 1: Types
T001, T002, T003, T004, T005 → T006

# Session 2: Service (after types)
T007 → T008, T009, T010, T011 → T012

# Session 3: Hooks (after service)
T013 → T014
T015 → T016
T017 → T018
```

### Frontend + Backend Parallel Work

```bash
# Developer 1: Frontend Phase 1-3
T001-T006 → T007-T018 → T019-T034 → T035-T046

# Developer 2: Backend Phase 7
T090-T097 → T098-T109 → T110-T111

# Both converge at Phase 6
```

---

**Document Status:** Ready for Implementation
**Generated by:** SpecKit Task Generator
**Next Steps:** Begin with Phase 1 (T001-T006) and Phase 7 (T090-T091) in parallel
