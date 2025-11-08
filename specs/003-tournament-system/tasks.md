# Tournament System - Task Breakdown

**Epic:** Tournament System MVP
**Sprint:** Sprint 1 (MVP Demo)
**Created:** 2025-11-08
**Owner:** Development Team

## Task Categorization

Tasks are organized according to constitutional principles:

- **[CQ]** Code Quality (SOLID & Clean Code)
- **[TS]** Testing (AAA Pattern)
- **[UX]** User Experience
- **[PF]** Performance
- **[TY]** Type Safety & Documentation
- **[SC]** Security
- **[DV]** DevOps
- **[RV]** Review/Validation

## Epic Overview

**Goal:** Implement Tournament System with viewing, registration, and real-time leaderboards

**Business Value:** Enable competitive tournament experiences with prize structures and real-time engagement

**Success Criteria:**
- Users can discover and register for tournaments in < 10 seconds
- Leaderboards load in < 2 seconds for tournaments with 1000 participants
- Real-time updates broadcast within 1 second
- 90% of eligible users successfully register on first attempt

**MVP Scope (User Stories):**
- **US1 (Critical):** View Available Tournaments - FR-1
- **US2 (Critical):** Register for Tournament - FR-2
- **US3 (Critical):** View Tournament Leaderboard - FR-3
- **US4 (High):** Real-time Tournament Updates - FR-5

**Post-MVP:**
- US5: Tournament Details View - FR-4
- US6: Tournament Stats and Filtering - FR-6

## Implementation Strategy

This task breakdown follows the **incremental delivery approach** established by the Missions, Bonuses, and MiniGames features:

1. **Reuse Existing Infrastructure**: Extend Smartico.Missions.* projects (NO new projects)
2. **Follow CQRS Pattern**: MediatR queries/commands with FluentValidation
3. **30-Second Caching**: Reuse MemoryCacheService pattern
4. **SignalR Real-time**: Extend IProgressBroadcaster with tournament events
5. **Demo Data**: In-memory state like MiniGames feature
6. **Hybrid Leaderboard**: Top 50 + user position + full pagination

## User Story Dependencies

```
┌─────────────────────────────────────────┐
│         Phase 1: Setup                  │
│  (Foundational - blocks all stories)    │
└──────────────┬──────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────────┐
│                    Phase 2: Foundational                     │
│  Domain entities, IProgressBroadcaster extension (blocking)  │
└──────────────┬───────────────────────────────────────────────┘
               │
               ↓
    ┌──────────┴──────────┐
    │                     │
    ↓                     ↓
┌─────────────┐    ┌─────────────┐
│   US1       │    │   US2       │
│  (View)     │    │ (Register)  │
│ Independent │    │ Independent │
└──────┬──────┘    └──────┬──────┘
       │                  │
       └─────────┬────────┘
                 ↓
          ┌─────────────┐
          │   US3       │
          │(Leaderboard)│
          │  Depends:   │
          │  US1, US2   │
          └──────┬──────┘
                 ↓
          ┌─────────────┐
          │   US4       │
          │ (Real-time) │
          │  Depends:   │
          │  All above  │
          └─────────────┘
```

**Parallel Execution Opportunities:**
- **Setup Phase**: All tasks sequential (foundational)
- **US1 + US2**: Can be developed in parallel (different endpoints, independent)
- **US3**: Requires US1 + US2 completion (needs tournament + registration data)
- **US4**: Final integration layer (requires all user stories)

---

## Task List

### Phase 1: Setup & Configuration

**Goal:** Initialize tournament infrastructure in existing Smartico.Missions projects

**Duration:** 1 day

**Independent Test Criteria:**
- ✅ Solution builds with 0 warnings/errors
- ✅ All new projects reference existing infrastructure
- ✅ NuGet packages installed successfully

#### Checklist

- [X] T001 Create Tournament domain entities in Smartico.Missions.Domain/Entities/Tournament.cs
- [X] T002 Create TournamentPrize domain entity in Smartico.Missions.Domain/Entities/TournamentPrize.cs
- [X] T003 Create TournamentParticipant domain entity in Smartico.Missions.Domain/Entities/TournamentParticipant.cs
- [X] T004 Create RegisterTournamentResult domain entity in Smartico.Missions.Domain/Entities/RegisterTournamentResult.cs
- [X] T005 Create TournamentRegistrationType enum in Smartico.Missions.Domain/Enums/TournamentRegistrationType.cs
- [X] T006 Create TournamentRegistrationStatus enum in Smartico.Missions.Domain/Enums/TournamentRegistrationStatus.cs
- [X] T007 Create TournamentPrizeType enum in Smartico.Missions.Domain/Enums/TournamentPrizeType.cs
- [X] T008 Create TournamentStatus enum in Smartico.Missions.Domain/Enums/TournamentStatus.cs
- [X] T009 Create TournamentRibbonType enum in Smartico.Missions.Domain/Enums/TournamentRibbonType.cs
- [X] T010 Create ISmarticoTournamentApiClient interface in Smartico.Missions.Domain/Interfaces/ISmarticoTournamentApiClient.cs
- [X] T011 Verify solution builds successfully with dotnet build

---

### Phase 2: Foundational Layer (Blocking Prerequisites)

**Goal:** Extend IProgressBroadcaster and implement API client with demo data

**Duration:** 2 days

**Dependencies:** Phase 1 complete

**Independent Test Criteria:**
- ✅ IProgressBroadcaster has 4 new tournament methods
- ✅ SignalRProgressBroadcaster implements all tournament events
- ✅ API client returns demo data with 3 tournaments (upcoming, active, finished)
- ✅ All services registered in DI container
- ✅ Solution builds with 0 warnings/errors

#### Checklist

- [X] T012 Extend IProgressBroadcaster interface in Smartico.Missions.Domain/Interfaces/IProgressBroadcaster.cs with 4 tournament event methods
- [X] T013 Implement BroadcastTournamentRegisteredAsync in Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs
- [X] T014 [P] Implement BroadcastTournamentLeaderboardUpdatedAsync in Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs
- [X] T015 [P] Implement BroadcastTournamentStatusChangedAsync in Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs
- [X] T016 [P] Implement BroadcastTournamentPrizeWonAsync in Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs
- [X] T017 Create SmarticoTournamentApiClient in Smartico.Missions.Infrastructure/SmarticoApi/SmarticoTournamentApiClient.cs
- [X] T018 Implement GetTournamentsAsync with demo data (3 tournaments: upcoming, active, finished) in SmarticoTournamentApiClient.cs
- [X] T019 Implement GetTournamentDetailsAsync with demo data in SmarticoTournamentApiClient.cs
- [X] T020 Implement GetLeaderboardAsync with demo participants (50 users) in SmarticoTournamentApiClient.cs
- [X] T021 Implement RegisterTournamentAsync with in-memory state management in SmarticoTournamentApiClient.cs
- [X] T022 Register ISmarticoTournamentApiClient and implementation in Smartico.Missions.Infrastructure/DependencyInjection.cs
- [X] T023 Verify all services registered in DI container with dotnet build

---

### Phase 3: User Story 1 - View Available Tournaments (FR-1)

**Goal:** Display tournament list with filtering and sorting

**Duration:** 3 days

**Dependencies:** Phase 2 complete

**Independent Test Criteria:**
- ✅ GET /api/tournaments returns tournament list
- ✅ Response cached for 30 seconds
- ✅ Frontend displays tournament cards with all required fields
- ✅ Filter buttons work (all, upcoming, active, finished)
- ✅ Tournament stats display correctly (total, active, registered)
- ✅ Loading states and error handling implemented
- ✅ Page loads in < 2 seconds

#### Backend Tasks

- [ ] T024 [US1] Create GetTournamentsQuery in Smartico.Missions.Application/Features/Tournaments/Queries/GetTournaments/GetTournamentsQuery.cs
- [ ] T025 [US1] Create GetTournamentsResponse in Smartico.Missions.Application/Features/Tournaments/Queries/GetTournaments/GetTournamentsResponse.cs
- [ ] T026 [US1] Implement GetTournamentsQueryHandler with 30s caching in Smartico.Missions.Application/Features/Tournaments/Queries/GetTournaments/GetTournamentsQueryHandler.cs
- [ ] T027 [US1] Create TournamentsController in Smartico.Missions.Api/Controllers/TournamentsController.cs
- [ ] T028 [US1] Implement GET /api/tournaments endpoint in TournamentsController.cs
- [ ] T029 [US1] Test GET /api/tournaments with Swagger UI (verify 3 tournaments returned)

#### Frontend Tasks

- [ ] T030 [P] [US1] Create Tournament TypeScript interface in frontend/src/types/tournament.ts
- [ ] T031 [P] [US1] Create TournamentPrize interface in frontend/src/types/tournament.ts
- [ ] T032 [P] [US1] Create TournamentParticipant interface in frontend/src/types/tournament.ts
- [ ] T033 [P] [US1] Create TournamentRegistrationType enum in frontend/src/types/tournament.ts
- [ ] T034 [P] [US1] Create TournamentStatus enum in frontend/src/types/tournament.ts
- [ ] T035 [US1] Create tournamentService.ts in frontend/src/services/tournamentService.ts
- [ ] T036 [US1] Implement getTournaments API call in tournamentService.ts
- [ ] T037 [US1] Create TournamentCard component in frontend/src/components/TournamentCard.tsx
- [ ] T038 [US1] Create TournamentList component with filtering in frontend/src/components/TournamentList.tsx
- [ ] T039 [US1] Add Tournaments tab to App.tsx in frontend/src/App.tsx
- [ ] T040 [US1] Test tournament list display with all 3 tournaments visible

---

### Phase 4: User Story 2 - Register for Tournament (FR-2)

**Goal:** Enable tournament registration with validation

**Duration:** 3 days

**Dependencies:** Phase 2 complete (can run in parallel with US1)

**Independent Test Criteria:**
- ✅ POST /api/tournaments/{id}/register validates eligibility
- ✅ Registration validates balance for paid tournaments
- ✅ Registration prevents duplicates
- ✅ Registration count updates correctly
- ✅ Frontend shows "Registered" state after successful registration
- ✅ Error messages display for all failure conditions
- ✅ Registration completes in < 3 seconds

#### Backend Tasks

- [ ] T041 [US2] Create RegisterTournamentCommand in Smartico.Missions.Application/Features/Tournaments/Commands/RegisterTournament/RegisterTournamentCommand.cs
- [ ] T042 [US2] Create RegisterTournamentResponse in Smartico.Missions.Application/Features/Tournaments/Commands/RegisterTournament/RegisterTournamentResponse.cs
- [ ] T043 [US2] Create RegisterTournamentCommandValidator with FluentValidation in Smartico.Missions.Application/Features/Tournaments/Commands/RegisterTournament/RegisterTournamentCommandValidator.cs
- [ ] T044 [US2] Implement RegisterTournamentCommandHandler with validation in Smartico.Missions.Application/Features/Tournaments/Commands/RegisterTournament/RegisterTournamentCommandHandler.cs
- [ ] T045 [US2] Add cache invalidation after registration in RegisterTournamentCommandHandler.cs
- [ ] T046 [US2] Implement POST /api/tournaments/{id}/register endpoint in TournamentsController.cs
- [ ] T047 [US2] Test registration endpoint with Swagger UI (free and paid tournaments)

#### Frontend Tasks

- [ ] T048 [P] [US2] Implement registerTournament API call in tournamentService.ts
- [ ] T049 [US2] Add registration button to TournamentCard.tsx with loading state
- [ ] T050 [US2] Implement registration handler in TournamentList.tsx
- [ ] T051 [US2] Add error message display for failed registrations
- [ ] T052 [US2] Update card state to "Registered" after successful registration
- [ ] T053 [US2] Test registration flow (free tournament, paid tournament, insufficient balance)

---

### Phase 5: User Story 3 - View Tournament Leaderboard (FR-3)

**Goal:** Display tournament rankings with participant information

**Duration:** 3 days

**Dependencies:** US1 + US2 complete (needs tournament + registration data)

**Independent Test Criteria:**
- ✅ GET /api/tournaments/{id}/leaderboard returns ranked participants
- ✅ Leaderboard shows top 50 + user position
- ✅ Participants ranked by score (highest to lowest)
- ✅ Prize structure displays with place ranges
- ✅ User's position highlighted if registered
- ✅ Minimum qualifying score filter applied
- ✅ Leaderboard loads in < 2 seconds

#### Backend Tasks

- [ ] T054 [US3] Create GetLeaderboardQuery in Smartico.Missions.Application/Features/Tournaments/Queries/GetLeaderboard/GetLeaderboardQuery.cs
- [ ] T055 [US3] Create GetLeaderboardResponse in Smartico.Missions.Application/Features/Tournaments/Queries/GetLeaderboard/GetLeaderboardResponse.cs
- [ ] T056 [US3] Implement GetLeaderboardQueryHandler with caching in Smartico.Missions.Application/Features/Tournaments/Queries/GetLeaderboard/GetLeaderboardQueryHandler.cs
- [ ] T057 [US3] Implement GET /api/tournaments/{id}/leaderboard endpoint in TournamentsController.cs
- [ ] T058 [US3] Test leaderboard endpoint with Swagger UI (verify top 50 + user position)

#### Frontend Tasks

- [ ] T059 [P] [US3] Implement getLeaderboard API call in tournamentService.ts
- [ ] T060 [US3] Create Leaderboard component in frontend/src/components/Leaderboard.tsx
- [ ] T061 [US3] Create LeaderboardRow component in frontend/src/components/LeaderboardRow.tsx
- [ ] T062 [US3] Add prize structure display to Leaderboard.tsx
- [ ] T063 [US3] Highlight current user's position in leaderboard
- [ ] T064 [US3] Add leaderboard view to TournamentList.tsx (click tournament to view leaderboard)
- [ ] T065 [US3] Test leaderboard display with 50 participants

---

### Phase 6: User Story 4 - Real-time Tournament Updates (FR-5)

**Goal:** Broadcast tournament events via SignalR

**Duration:** 2 days

**Dependencies:** US1 + US2 + US3 complete (final integration layer)

**Independent Test Criteria:**
- ✅ TournamentRegistered event broadcasts when user registers
- ✅ TournamentLeaderboardUpdated event broadcasts on score changes
- ✅ TournamentStatusChanged event broadcasts when tournament starts/ends
- ✅ TournamentPrizeWon event broadcasts when tournament finishes
- ✅ Frontend receives and handles all 4 event types
- ✅ Tournament list updates in real-time without refresh
- ✅ Leaderboard updates in real-time without refresh
- ✅ Events broadcast within 1 second

#### Backend Tasks

- [ ] T066 [US4] Add BroadcastTournamentRegisteredAsync call after registration in RegisterTournamentCommandHandler.cs
- [ ] T067 [US4] Test TournamentRegistered SignalR broadcast (register user, verify event in browser console)

#### Frontend Tasks

- [ ] T068 [P] [US4] Add TournamentRegisteredHandler type to signalr.ts
- [ ] T069 [P] [US4] Add TournamentLeaderboardUpdatedHandler type to signalr.ts
- [ ] T070 [P] [US4] Add TournamentStatusChangedHandler type to signalr.ts
- [ ] T071 [P] [US4] Add TournamentPrizeWonHandler type to signalr.ts
- [ ] T072 [US4] Implement onTournamentRegistered in signalr.ts
- [ ] T073 [P] [US4] Implement onTournamentLeaderboardUpdated in signalr.ts
- [ ] T074 [P] [US4] Implement onTournamentStatusChanged in signalr.ts
- [ ] T075 [P] [US4] Implement onTournamentPrizeWon in signalr.ts
- [ ] T076 [US4] Subscribe to TournamentRegistered event in TournamentList.tsx
- [ ] T077 [US4] Update registration count on TournamentRegistered event
- [ ] T078 [US4] Subscribe to TournamentLeaderboardUpdated event in Leaderboard.tsx
- [ ] T079 [US4] Update participant scores on TournamentLeaderboardUpdated event
- [ ] T080 [US4] Test real-time registration updates (open 2 browser tabs, register in one, verify count updates in other)
- [ ] T081 [US4] Add win notification toast in TournamentList.tsx (show when TournamentPrizeWon event received)

---

### Phase 7: Testing & Quality Assurance

**Goal:** Verify MVP functionality and quality standards

**Duration:** 2 days

**Dependencies:** All user stories complete

**Independent Test Criteria:**
- ✅ All acceptance criteria from FR-1, FR-2, FR-3, FR-5 pass
- ✅ Build succeeds with 0 warnings/errors
- ✅ Performance targets met (< 2s loads, < 3s registration, < 1s real-time)
- ✅ Accessibility audit passes (keyboard navigation, screen reader)
- ✅ Error handling verified for all failure scenarios

#### Testing Tasks

- [ ] T082 [TS] Manual test: View tournament list (verify all 3 tournaments display)
- [ ] T083 [TS] Manual test: Filter tournaments by status (upcoming, active, finished)
- [ ] T084 [TS] Manual test: Register for free tournament (verify success message)
- [ ] T085 [TS] Manual test: Register for paid tournament with sufficient balance (verify points deducted)
- [ ] T086 [TS] Manual test: Register for paid tournament with insufficient balance (verify error message)
- [ ] T087 [TS] Manual test: Attempt duplicate registration (verify error message)
- [ ] T088 [TS] Manual test: View leaderboard with 50 participants (verify sorting by score)
- [ ] T089 [TS] Manual test: Verify user position highlighted in leaderboard
- [ ] T090 [TS] Manual test: Real-time registration updates (2 browser tabs, verify count updates)
- [ ] T091 [TS] Performance test: Measure tournament list load time (target < 2s)
- [ ] T092 [TS] Performance test: Measure registration response time (target < 3s)
- [ ] T093 [TS] Performance test: Measure leaderboard load time (target < 2s)
- [ ] T094 [TS] Accessibility test: Keyboard navigation through tournament list
- [ ] T095 [TS] Accessibility test: Screen reader announces tournament details
- [ ] T096 [TS] Build verification: dotnet build backend/Smartico.Missions.sln (0 warnings/errors)
- [ ] T097 [TS] Build verification: npm run build in frontend/ (0 errors)

---

### Phase 8: Documentation & Deployment

**Goal:** Document implementation and prepare for deployment

**Duration:** 1 day

**Dependencies:** Testing complete

**Independent Test Criteria:**
- ✅ IMPLEMENTATION_SUMMARY.md updated with tournament feature
- ✅ API endpoints documented in Swagger
- ✅ Frontend components documented
- ✅ README updated with tournament testing instructions

#### Documentation Tasks

- [ ] T098 [TY] Update IMPLEMENTATION_SUMMARY.md with tournament feature overview
- [ ] T099 [TY] Document tournament demo data (3 tournaments with details)
- [ ] T100 [TY] Document tournament API endpoints in IMPLEMENTATION_SUMMARY.md
- [ ] T101 [TY] Document tournament SignalR events (4 event types)
- [ ] T102 [TY] Add tournament testing instructions to IMPLEMENTATION_SUMMARY.md
- [ ] T103 [TY] Document known limitations (demo data only, no prize fulfillment)
- [ ] T104 [RV] Final code review: Verify SOLID principles, Clean Code, CQRS pattern
- [ ] T105 [RV] Final review: Verify constitutional compliance (performance, accessibility, type safety)

---

## Summary

### MVP Scope

**Total Tasks:** 105
**Total Estimate:** 15 days (~3 weeks for 1 developer)

**By Phase:**
- Phase 1 (Setup): 11 tasks (1 day)
- Phase 2 (Foundational): 12 tasks (2 days)
- Phase 3 (US1 - View): 17 tasks (3 days)
- Phase 4 (US2 - Register): 13 tasks (3 days)
- Phase 5 (US3 - Leaderboard): 12 tasks (3 days)
- Phase 6 (US4 - Real-time): 16 tasks (2 days)
- Phase 7 (Testing): 16 tasks (2 days)
- Phase 8 (Documentation): 8 tasks (1 day)

**By User Story:**
- US1 (View Tournaments): 17 tasks
- US2 (Register): 13 tasks
- US3 (Leaderboard): 12 tasks
- US4 (Real-time): 16 tasks
- Setup + Foundational: 23 tasks
- Testing + Documentation: 24 tasks

**Parallel Execution Opportunities:**
- Phase 2: Tasks T013-T016 (4 SignalR broadcast methods) - can parallelize
- Phase 3 Frontend: Tasks T030-T034 (TypeScript types) - can parallelize
- Phase 4: US2 backend can run parallel with US1 frontend
- Phase 6 Frontend: Tasks T068-T075 (SignalR handlers) - can parallelize

**Critical Path:**
```
T001-T011 (Setup) → T012-T023 (Foundational) → T024-T029 (US1 Backend) →
T030-T040 (US1 Frontend) → T054-T065 (US3) → T066-T081 (US4) →
T082-T097 (Testing) → T098-T105 (Documentation)
```

### Post-MVP Tasks (Deferred)

The following user stories are deferred post-MVP:

**US5: View Tournament Details (FR-4)**
- GET /api/tournaments/{id}/details endpoint
- TournamentDetails component
- Comprehensive tournament information view
- Timeline visualization
- Custom data display

**US6: Tournament Stats and Filtering (FR-6)**
- Advanced filtering (featured, section)
- Sorting (priority, start time, prize pool)
- Stats dashboard (total, active, registered)
- Filter persistence

**Infrastructure Improvements:**
- Unit tests for query/command handlers
- Integration tests for API endpoints
- E2E tests for user flows
- Replace demo data with real Smartico Tournament API
- Pagination for leaderboards (currently top 50 only)
- Prize pool depletion tracking

---

## Execution Guide

### Day 1: Setup
- Complete Phase 1 (T001-T011)
- Verify solution builds

### Day 2-3: Foundational
- Complete Phase 2 (T012-T023)
- Verify SignalR broadcaster, API client, DI registration

### Day 4-6: View Tournaments (US1)
- Backend: T024-T029
- Frontend: T030-T040
- Test: View 3 tournaments, filter by status

### Day 7-9: Register for Tournaments (US2)
- Backend: T041-T047
- Frontend: T048-T053
- Test: Free registration, paid registration, insufficient balance

### Day 10-12: Leaderboard (US3)
- Backend: T054-T058
- Frontend: T059-T065
- Test: View top 50, user position, prize structure

### Day 13-14: Real-time Updates (US4)
- Backend: T066-T067
- Frontend: T068-T081
- Test: Registration broadcasts, leaderboard updates

### Day 15: Testing & Documentation
- Testing: T082-T097
- Documentation: T098-T105
- Final review and deployment preparation

---

**Last Updated:** 2025-11-08
**Status:** Ready for Implementation
**MVP Target:** 3 weeks (15 days)
