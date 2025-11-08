# Player Level Feature - Task Breakdown

**Epic:** Player Level Progression System
**Sprint:** 004-player-level
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

**Goal:** Enable users to view their level progression, track progress toward next level, and receive real-time level-up notifications

**Business Value:**
- Increase user engagement through visible achievement progression
- Motivate continued platform usage with clear advancement goals
- Enhance user retention through milestone-based motivation

**Success Criteria:**
- Performance: Level data loads <500ms (p95), UI renders <2s
- Engagement: 80% of users view level status within first session
- Accuracy: 100% accuracy in level calculations
- Accessibility: WCAG 2.1 AA compliance (Lighthouse 100 score)

## MVP Scope

**MVP = User Story 1 Only:** View Current Level Status
- Backend: Domain entities, API client, CQRS queries, REST endpoints
- Frontend: Level types, service, hooks, LevelCard component
- Goal: Users can see their current level and progress toward next level

**Post-MVP:**
- US2: Complete level progression path display
- US3: Real-time level-up notifications via SignalR

## Task List

### Phase 1: Setup & Foundation

**Goal:** Initialize project structure and shared infrastructure

- [x] T001 [DV] Review implementation plan and verify branch 004-player-level exists
- [x] T002 [DV] Verify .NET 9 SDK and React 19 development environment setup
- [x] T003 [TY] Review Smartico TLevel API documentation at smartico-api/docs/interfaces/TLevel.md

**Deliverables:** Development environment ready, plan understood

---

### Phase 2: Foundational Infrastructure (Blocking Prerequisites)

**Goal:** Create shared domain entities and interfaces needed by all user stories

- [x] T004 [P] [CQ][TY] Create Level entity in backend/src/Smartico.Missions.Domain/Entities/Level.cs
  - Map all TLevel properties (id, name, description, image, required_points, visibility_points, counters, custom_data)
  - Use required/init properties with XML documentation
  - Follow existing entity patterns (Tournament.cs, Bonus.cs)

- [x] T005 [P] [CQ][TY] Create UserLevelProgress entity in backend/src/Smartico.Missions.Domain/Entities/UserLevelProgress.cs
  - Properties: currentLevelId, totalPointsEarned, nextLevelId, progressPercentage, pointsToNextLevel
  - Include progress calculation business logic
  - XML documentation with usage examples

- [x] T006 [P] [TY] Create ISmarticoLevelApiClient interface in backend/src/Smartico.Missions.Domain/Interfaces/ISmarticoLevelApiClient.cs
  - Method: Task<List<Level>> GetLevelsAsync(string userId, CancellationToken)
  - Method: Task<UserLevelProgress?> GetUserLevelProgressAsync(string userId, CancellationToken)
  - Method: Task<Level?> GetLevelByIdAsync(string userId, int levelId, CancellationToken)
  - XML documentation for all methods

- [x] T007 [CQ][TY] Implement SmarticoLevelApiClient in backend/src/Smartico.Missions.Infrastructure/SmarticoApi/SmarticoLevelApiClient.cs
  - Implement ISmarticoLevelApiClient with demo data (5+ levels)
  - Include visibility filtering logic
  - Progress calculation logic (percentage = (current - current_level_req) / (next - current_level_req))
  - Thread-safe demo data structure
  - Follow existing pattern (SmarticoTournamentApiClient.cs)

- [x] T008 [CQ] Register ISmarticoLevelApiClient in backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs
  - Add singleton registration: services.AddSingleton<ISmarticoLevelApiClient, SmarticoLevelApiClient>()
  - Follow existing pattern for other API clients

- [x] T009 [P] [CQ] Add level-related methods to IProgressBroadcaster in backend/src/Smartico.Missions.Domain/Interfaces/IProgressBroadcaster.cs
  - Method: Task BroadcastLevelProgressUpdatedAsync(string userId, UserLevelProgress progress, CancellationToken)
  - Method: Task BroadcastLevelUpAchievedAsync(string userId, Level newLevel, Level? previousLevel, CancellationToken)
  - XML documentation

- [x] T010 [P] [CQ] Implement level broadcast methods in backend/src/Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs
  - Implement BroadcastLevelProgressUpdatedAsync (send to user group)
  - Implement BroadcastLevelUpAchievedAsync (send to user group)
  - Follow existing pattern (tournament/bonus broadcasts)

**Deliverables:** Core domain entities, API client with demo data, SignalR broadcaster ready

**Acceptance Criteria:**
- [ ] All entities fully typed with required/init properties
- [ ] Demo data provides 5+ levels with progressive required_points
- [ ] Progress calculation handles edge cases (max level, level 0, overflow)
- [ ] SignalR methods follow existing naming conventions

---

### Phase 3: US1 - View Current Level Status (MVP - Critical)

**User Story:** As an active player, I want to check my current level and progress toward next level so I can see my achievement status

**Goal:** Backend endpoints + Frontend UI to display current level card with progress bar

**Independent Test Criteria:**
- API GET /api/levels/progress?userId=user123 returns UserLevelProgress with correct percentage
- Frontend LevelCard component renders level name, description, image, progress bar
- Progress bar shows correct percentage (visual + aria-valuenow)
- Loads within 2 seconds, accessible (keyboard + screen reader)

#### Backend - Application Layer (CQRS)

- [x] T011 [P] [US1] [CQ][TY] Create GetUserLevelProgressQuery in backend/src/Smartico.Missions.Application/Features/Levels/Queries/GetUserLevelProgress/GetUserLevelProgressQuery.cs
  - Record: GetUserLevelProgressQuery(string UserId) : IRequest<GetUserLevelProgressResponse>
  - Record: GetUserLevelProgressResponse(UserLevelProgress Progress)

- [x] T012 [US1] [CQ] Create GetUserLevelProgressQueryHandler in backend/src/Smartico.Missions.Application/Features/Levels/Queries/GetUserLevelProgress/GetUserLevelProgressQueryHandler.cs
  - Implement IRequestHandler<GetUserLevelProgressQuery, GetUserLevelProgressResponse>
  - Check cache first (key: "level:progress:{userId}", TTL: 30s)
  - Call ISmarticoLevelApiClient.GetUserLevelProgressAsync
  - Cache result before returning
  - Handle null/not found cases
  - Follow existing pattern (GetTournamentsQueryHandler.cs)

- [x] T013 [P] [US1] [CQ][TY] Create GetUserLevelProgressQueryValidator in backend/src/Smartico.Missions.Application/Features/Levels/Queries/GetUserLevelProgress/GetUserLevelProgressQueryValidator.cs
  - Validate UserId is not empty
  - Use FluentValidation
  - Follow existing validator patterns

#### Backend - API Layer

- [x] T014 [US1] [CQ][SC][TY] Create LevelsController in backend/src/Smartico.Missions.Api/Controllers/LevelsController.cs
  - Endpoint: GET /api/levels/progress?userId={userId}
  - Inject IMediator
  - Send GetUserLevelProgressQuery
  - Return 200 OK with GetUserLevelProgressResponse
  - Return 400 Bad Request if userId empty
  - Return 404 Not Found if user has no level data
  - Add XML comments for Swagger documentation
  - Add ProducesResponseType attributes
  - Add logging (entry, exit, errors)

- [x] T015 [US1] [DV] Test backend API endpoint manually via Swagger
  - Start backend: dotnet run in backend/src/Smartico.Missions.Api
  - Navigate to https://localhost:5001/swagger
  - Test GET /api/levels/progress?userId=user123
  - Verify response contains progress percentage
  - Test error cases (empty userId)

#### Frontend - Services Layer

- [x] T016 [P] [US1] [TY] Create Level TypeScript types in frontend/src/types/level.ts
  - Interface Level (matches backend Level entity)
  - Interface UserLevelProgress (matches backend UserLevelProgress)
  - Export all types from index

- [x] T017 [P] [US1] [CQ][TY] Create LevelService in frontend/src/services/levelService.ts
  - Method: getUserLevelProgress(userId: string): Promise<UserLevelProgress>
  - Use Fetch API (instead of Axios)
  - Error handling (401, 403, 404, 500)
  - TypeScript strict mode compliant
  - Follow existing service patterns (tournamentService.ts)

- [x] T018 [US1] [CQ][TY] Create useLevelProgress hook in frontend/src/hooks/useLevelProgress.ts
  - Uses plain React hooks (useState, useEffect) - React Query not in project
  - Auto-fetches on mount with userId dependency
  - Return { data, isLoading, error, refetch }
  - Follow existing hook patterns

#### Frontend - UI Components

- [x] T019 [P] [US1] [UX][TY] Create LevelProgressBar component in frontend/src/components/LevelProgressBar.tsx
  - Props: currentPoints, requiredPoints, percentage
  - Visual: Gradient fill (purple-600 → blue-500), percentage label, shimmer animation
  - Animation: Smooth transition (300ms ease-out)
  - Accessibility: role="progressbar", aria-valuenow, aria-valuemin=0, aria-valuemax=100, aria-label
  - Responsive: Works on 320px+ screens
  - Follow existing component patterns (TournamentCard.tsx)

- [x] T020 [US1] [UX][TY] Create LevelCard component in frontend/src/components/LevelCard.tsx
  - Props: userId
  - Use useLevelProgress hook
  - Display: Level name (text-xl font-bold), description (text-sm text-gray-600), badge image
  - Include LevelProgressBar showing progress to next level
  - States: Loading (spinner), error (retry button), success
  - Accessibility: role="region", aria-label="Current Level", keyboard focus visible
  - Responsive: Mobile (1 col), Tablet (1 col), Desktop (1 col within grid)
  - Follow TailwindCSS design tokens (purple-600, gray-600, shadow-md)

- [x] T021 [US1] [UX] Integrate LevelCard into Levels page/tab in App.tsx
  - Created new "Levels" tab in main navigation
  - Added LevelCard component with userId prop (TEST_USER_ID)
  - Centered on page with max-width container (max-w-3xl)
  - Added page title "Your Level Progression"

- [x] T022 [US1] [RV] Manual testing of US1 end-to-end
  - ✅ Frontend build: SUCCESS (0 errors, TypeScript strict mode)
  - ✅ Backend build: SUCCESS (0 errors, 0 warnings)
  - ✅ Backend started: http://localhost:5227
  - ✅ Frontend started: http://localhost:3000
  - ✅ API endpoint tested with curl (user123, elite, newbie)
  - ✅ All responses valid with correct progress percentages
  - Ready for manual UI testing in browser

**Phase 3 Deliverables:**
- GET /api/levels/progress endpoint working
- LevelCard component displaying current level + progress
- End-to-end flow: Frontend → API → CQRS → API Client → Response

**Acceptance Criteria:**
- [ ] API responds in <500ms (p95)
- [ ] Frontend LCP <2.5s
- [ ] Progress bar percentage matches API response
- [ ] Component is keyboard accessible (Tab to focus)
- [ ] Screen reader announces "Current Level: [name], [percentage]% progress to next level"
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Works on 320px mobile screens

---

### Phase 4: US2 - Explore Level Progression Path (Post-MVP - High Priority)

**User Story:** As a new player, I want to understand the complete leveling system and plan my progression by seeing all visible levels

**Goal:** Display grid of all levels with visual status indicators (achieved, current, next, locked)

**Independent Test Criteria:**
- API GET /api/levels?userId=user123 returns list of levels sorted by required_points
- Only levels where user_points >= visibility_points are returned
- Frontend LevelList component renders grid with status colors
- Achieved levels (green), current level (blue), next level (yellow), locked levels (gray)

#### Backend - Application Layer

- [ ] T023 [P] [US2] [CQ][TY] Create GetLevelsQuery in backend/src/Smartico.Missions.Application/Features/Levels/Queries/GetLevels/GetLevelsQuery.cs
  - Record: GetLevelsQuery(string UserId) : IRequest<GetLevelsResponse>
  - Record: GetLevelsResponse(List<Level> Levels, int UserCurrentLevelId)

- [ ] T024 [US2] [CQ] Create GetLevelsQueryHandler in backend/src/Smartico.Missions.Application/Features/Levels/Queries/GetLevels/GetLevelsQueryHandler.cs
  - Implement IRequestHandler<GetLevelsQuery, GetLevelsResponse>
  - Check cache (key: "levels:{userId}", TTL: 30s)
  - Call ISmarticoLevelApiClient.GetLevelsAsync
  - Filter by visibility_points (only return levels where user meets threshold)
  - Sort by required_points ascending
  - Cache and return
  - Follow existing CQRS patterns

- [ ] T025 [P] [US2] [CQ][TY] Create GetLevelsQueryValidator in backend/src/Smartico.Missions.Application/Features/Levels/Queries/GetLevels/GetLevelsQueryValidator.cs
  - Validate UserId not empty
  - FluentValidation

#### Backend - API Layer

- [ ] T026 [US2] [CQ][TY] Add GET /api/levels endpoint to LevelsController
  - Endpoint: GET /api/levels?userId={userId}
  - Send GetLevelsQuery
  - Return 200 OK with list of levels
  - Return 400 if userId empty
  - XML comments + ProducesResponseType
  - Logging

- [ ] T027 [US2] [DV] Test GET /api/levels via Swagger
  - Verify levels returned in ascending order by required_points
  - Verify only visible levels included
  - Verify response includes userCurrentLevelId

#### Frontend - Services Layer

- [ ] T028 [P] [US2] [CQ][TY] Add getLevels method to LevelService in frontend/src/services/levelService.ts
  - Method: getLevels(userId: string): Promise<{ levels: Level[], userCurrentLevelId: number }>
  - Call GET /api/levels
  - Error handling

- [ ] T029 [US2] [CQ][TY] Create useLevels hook in frontend/src/hooks/useLevels.ts
  - Use React Query
  - Query key: ['levels', userId]
  - Stale time: 30s
  - Return { levels, userCurrentLevelId, isLoading, error }

#### Frontend - UI Components

- [ ] T030 [P] [US2] [UX][TY] Create LevelBadge component in frontend/src/components/LevelBadge.tsx
  - Props: level: Level, status: 'achieved' | 'current' | 'next' | 'locked'
  - Display: Badge image, level name, required points
  - Visual status: Border color + background color based on status
  - Accessibility: alt text for image, status announced by screen reader
  - Responsive design

- [ ] T031 [US2] [UX][TY] Create LevelList component in frontend/src/components/LevelList.tsx
  - Props: userId
  - Use useLevels hook
  - Layout: Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - For each level: Determine status (achieved, current, next, locked) based on user progress
  - Render LevelBadge for each level with appropriate status
  - Loading state: Skeleton grid
  - Error state: Error message + retry button
  - Accessibility: Keyboard navigation (Tab through grid), focus indicators

- [ ] T032 [US2] [UX] Integrate LevelList into LevelsPage below LevelCard
  - Add section header "All Levels"
  - Render LevelList component
  - Spacing between LevelCard and LevelList

- [ ] T033 [US2] [RV] Manual testing of US2 end-to-end
  - Verify grid displays all visible levels
  - Verify levels sorted by required_points
  - Verify status colors correct (achieved=green, current=blue, next=yellow, locked=gray)
  - Verify locked levels not shown (visibility threshold respected)
  - Test responsive layout (mobile, tablet, desktop)
  - Test keyboard navigation through grid

**Phase 4 Deliverables:**
- GET /api/levels endpoint
- LevelList grid component with status indicators
- Complete levels page with current level card + all levels grid

**Acceptance Criteria:**
- [ ] API returns levels sorted by required_points
- [ ] Visibility filtering works (only eligible levels shown)
- [ ] Grid responsive on all screen sizes
- [ ] Status colors match design system
- [ ] Keyboard navigable (Tab through cards)
- [ ] Loads in <2 seconds for 100 levels

---

### Phase 5: US3 - Real-Time Level-Up Notifications (Post-MVP - High Priority)

**User Story:** As an active player, I want to be immediately notified when I reach a new level so I feel a sense of achievement

**Goal:** SignalR real-time notifications when user levels up, with celebratory UI

**Independent Test Criteria:**
- SignalR connection established to /hubs/progress
- When BroadcastLevelUpAchievedAsync called, frontend receives event within 1 second
- LevelUpNotification modal appears with new level details
- Modal auto-dismisses after 5 seconds
- Modal accessible (focus trap, Escape to close)

#### Frontend - SignalR Integration

- [ ] T034 [P] [US3] [CQ][TY] Create level SignalR subscriptions in frontend/src/services/signalr/levelSubscriptions.ts
  - Subscribe to "LevelProgressUpdated" event
  - Subscribe to "LevelUpAchieved" event
  - Parse event payloads (userId, newLevel, previousLevel, etc.)
  - Invoke callbacks for each event type
  - Auto-reconnect on disconnect
  - Follow existing SignalR patterns

- [ ] T035 [US3] [CQ][TY] Create useLevelSignalR hook in frontend/src/hooks/useLevelSignalR.ts
  - Connect to /hubs/progress on mount
  - Subscribe to level events
  - Invalidate React Query cache on LevelProgressUpdated
  - Trigger level-up notification on LevelUpAchieved
  - Cleanup on unmount

#### Frontend - UI Components

- [ ] T036 [P] [US3] [UX][TY] Create LevelUpNotification component in frontend/src/components/LevelUpNotification.tsx
  - Props: newLevel: Level, previousLevel: Level, onClose: () => void
  - Animation: Fade in + scale, confetti effect (optional), auto-dismiss after 5s
  - Display: "Level Up! You've reached [newLevel.name]", new level image, description
  - Button: "Close" (or auto-close)
  - Accessibility: Focus trap, Escape to close, aria-live="assertive", role="dialog"
  - Z-index overlay with backdrop

- [ ] T037 [US3] [UX] Integrate SignalR and notification into LevelsPage
  - Use useLevelSignalR hook
  - Show LevelUpNotification modal when level-up event received
  - State management for modal visibility
  - Prevent duplicate notifications (track last shown level)

- [ ] T038 [US3] [DV] Test SignalR level-up flow manually
  - Simulate level-up event from backend (call BroadcastLevelUpAchievedAsync in test endpoint)
  - Verify notification appears within 1 second
  - Verify modal displays new level details
  - Verify auto-dismiss after 5 seconds
  - Test Escape key closes modal
  - Test focus trap (Tab cycles within modal)

**Phase 5 Deliverables:**
- SignalR subscriptions for level events
- LevelUpNotification modal component
- Real-time level-up notifications working end-to-end

**Acceptance Criteria:**
- [ ] SignalR events received within 1 second of broadcast
- [ ] Notification is visually prominent and celebratory
- [ ] Modal auto-dismisses after 5 seconds
- [ ] Accessible (keyboard, screen reader, focus trap)
- [ ] No duplicate notifications for same level-up

---

### Phase 6: Testing & Quality Assurance

**Goal:** Comprehensive testing to ensure quality, performance, and accessibility

- [ ] T039 [TS] Write unit tests for Level entity in backend/tests/Domain/Entities/LevelTests.cs
  - Test progress calculation edge cases (max level, 0 points, overflow)
  - Test visibility threshold logic
  - AAA pattern, single assertions
  - Follow existing test patterns

- [ ] T040 [TS] Write unit tests for GetUserLevelProgressQueryHandler in backend/tests/Application/Features/Levels/Queries/GetUserLevelProgressQueryHandlerTests.cs
  - Test cache hit scenario
  - Test cache miss scenario
  - Test null/not found scenario
  - Mock ISmarticoLevelApiClient and ICacheService
  - AAA pattern, single assertions
  - Target >90% coverage

- [ ] T041 [TS] Write unit tests for GetLevelsQueryHandler in backend/tests/Application/Features/Levels/Queries/GetLevelsQueryHandlerTests.cs
  - Test visibility filtering
  - Test sorting by required_points
  - Test cache behavior
  - AAA pattern, single assertions

- [ ] T042 [TS] Write API integration tests in backend/tests/Api/Controllers/LevelsControllerTests.cs
  - Test GET /api/levels/progress (200 OK, 400 Bad Request, 404 Not Found)
  - Test GET /api/levels (200 OK, 400 Bad Request)
  - Use WebApplicationFactory
  - Verify response status codes and payloads

- [ ] T043 [P] [TS] Write component tests for LevelProgressBar in frontend/src/components/__tests__/LevelProgressBar.test.tsx
  - Test percentage display (aria-valuenow attribute)
  - Test visual rendering (progress fill width)
  - Test accessibility (aria-label, role)
  - Use React Testing Library + Vitest

- [ ] T044 [P] [TS] Write component tests for LevelCard in frontend/src/components/__tests__/LevelCard.test.tsx
  - Test loading state
  - Test error state (retry button)
  - Test success state (displays level name, description, image, progress bar)
  - Test accessibility (keyboard focus, screen reader labels)
  - Mock useLevelProgress hook

- [ ] T045 [P] [TS] Write component tests for LevelList in frontend/src/components/__tests__/LevelList.test.tsx
  - Test grid rendering
  - Test status color logic (achieved, current, next, locked)
  - Test keyboard navigation
  - Mock useLevels hook

- [ ] T046 [P] [TS] Write component tests for LevelUpNotification in frontend/src/components/__tests__/LevelUpNotification.test.tsx
  - Test modal appearance
  - Test Escape key closes modal
  - Test auto-dismiss after 5 seconds (jest.useFakeTimers)
  - Test focus trap
  - Test accessibility (aria-live, role)

- [ ] T047 [TS] Write E2E tests for critical user journeys in frontend/e2e/levels.spec.ts (Playwright)
  - US1: Navigate to Levels page → See current level card → Verify progress bar
  - US2: See all levels grid → Verify sorting → Verify status colors
  - US3: Simulate level-up → Notification appears → Auto-dismisses

- [ ] T048 [UX] Run automated accessibility audit with axe DevTools
  - Run axe on Levels page
  - Fix any violations (target: 0 violations)
  - Verify color contrast (minimum 4.5:1)
  - Verify all interactive elements keyboard accessible

- [ ] T049 [UX] Manual accessibility testing
  - Keyboard-only navigation (Tab, Enter, Space, Escape)
  - Screen reader testing (NVDA or JAWS)
  - Verify focus indicators visible
  - Verify all content announced correctly

- [ ] T050 [PF] Performance testing and optimization
  - Run Lighthouse audit (target: LCP <2.5s, FCP <1.5s, TI <3.5s, CLS <0.1)
  - Load test API with k6 (target: 100 RPS, p95 <200ms)
  - Verify cache hit rate >70%
  - Optimize if targets not met (lazy loading, code splitting, image optimization)

**Phase 6 Deliverables:**
- Comprehensive test suite (unit, integration, E2E)
- Accessibility compliance verified
- Performance targets met

**Acceptance Criteria:**
- [ ] Backend test coverage >90%
- [ ] Frontend test coverage >80%
- [ ] All E2E tests pass
- [ ] Lighthouse score >90
- [ ] axe violations = 0
- [ ] API p95 response time <200ms
- [ ] Frontend LCP <2.5s

---

### Phase 7: Documentation & Polish

**Goal:** Complete documentation and final quality review

- [ ] T051 [TY] Generate Swagger/OpenAPI documentation
  - Verify all endpoints documented with XML comments
  - Verify request/response schemas
  - Verify example values
  - Test Swagger UI at https://localhost:5001/swagger

- [ ] T052 [P] [TY] Create user guide documentation in docs/user-guide/player-levels.md
  - How to view your current level
  - How to understand level progression
  - How level-up notifications work
  - FAQ section

- [ ] T053 [P] [TY] Update main README.md with Levels feature section
  - Add "Player Levels" section
  - Link to user guide
  - Link to API documentation

- [ ] T054 [TY] Create ADR for read-only MVP decision in docs/architecture/adr-004-player-level-read-only.md
  - Document why MVP is read-only (Smartico platform manages level progression)
  - Document future enhancements (write operations if needed)

- [ ] T055 [TY] Update CHANGELOG.md with version 1.1.0 entry
  - Add "Player Level Feature" entry
  - List major changes (new endpoints, components)
  - Credit contributors

- [ ] T056 [RV] Final code review against constitution
  - Verify SOLID principles (SRP, OCP, DIP)
  - Verify Clean Code standards (function length, naming, DRY)
  - Verify AAA test pattern with single assertions
  - Verify TypeScript strict mode compliance (no `any` types)
  - Verify accessibility compliance
  - Verify security checklist (input validation, XSS prevention, rate limiting)

- [ ] T057 [RV] Pre-deployment checklist
  - All tests passing (unit, integration, E2E)
  - Performance benchmarks met
  - Accessibility audit passed
  - Code review approved (2+ approvals)
  - Documentation complete
  - Monitoring configured (Application Insights dashboards)

**Phase 7 Deliverables:**
- Complete documentation (API docs, user guide, ADR, changelog)
- Final quality review completed
- Ready for deployment

**Acceptance Criteria:**
- [ ] Swagger documentation complete and accurate
- [ ] User guide clear and actionable
- [ ] Code review approved by 2+ reviewers
- [ ] All constitutional principles verified
- [ ] Deployment checklist complete

---

## Dependency Graph

```
Setup (T001-T003)
  ↓
Foundation (T004-T010)
  ↓
  ├─→ US1: Current Level (T011-T022) [MVP - Can deploy independently]
  │
  ├─→ US2: Level List (T023-T033) [Post-MVP - Depends on Foundation]
  │
  └─→ US3: SignalR Notifications (T034-T038) [Post-MVP - Depends on Foundation]
       ↓
Testing & QA (T039-T050) [Covers all user stories]
       ↓
Documentation & Polish (T051-T057)
```

**Parallelization Opportunities:**

**Foundation Phase (T004-T010):**
- T004 (Level entity) || T005 (UserLevelProgress entity) || T006 (Interface)
- T007 (API Client impl) depends on T004-T006
- T008 (DI registration) depends on T007
- T009 (Broadcaster interface) || T010 (Broadcaster impl) can run in parallel with T004-T008

**US1 Phase (T011-T022):**
- Backend queries (T011-T013) can run in parallel with frontend types (T016)
- T014 (Controller) depends on T011-T013
- T015 (API test) depends on T014
- Frontend service (T017) depends on T016
- Frontend hook (T018) depends on T017
- Frontend components (T019-T020) can run in parallel after T018
- T021 (Integration) depends on T019-T020
- T022 (E2E test) depends on T021

**Testing Phase (T039-T050):**
- All unit tests (T039-T046) can run in parallel
- Integration tests (T042, T047) can run after unit tests
- Accessibility (T048-T049) and performance (T050) can run in parallel

**Documentation Phase (T051-T057):**
- T051 (Swagger) || T052 (User guide) || T053 (README) || T054 (ADR) || T055 (Changelog) all parallel
- T056-T057 (Review) depend on all documentation tasks

---

## Task Summary

**Total Tasks:** 57

**By Phase:**
- Phase 1 (Setup): 3 tasks (~1 hour)
- Phase 2 (Foundation): 7 tasks (~8 hours)
- Phase 3 (US1 - MVP): 12 tasks (~16 hours)
- Phase 4 (US2): 11 tasks (~12 hours)
- Phase 5 (US3): 5 tasks (~6 hours)
- Phase 6 (Testing): 12 tasks (~16 hours)
- Phase 7 (Documentation): 7 tasks (~6 hours)

**Total Estimated Effort:** ~65 hours (~8 working days for 1 full-stack developer)

**By Category:**
- Code Quality [CQ]: 18 tasks
- Testing [TS]: 12 tasks
- User Experience [UX]: 10 tasks
- Type Safety [TY]: 12 tasks
- Performance [PF]: 1 task
- Security [SC]: 1 task (embedded in T014)
- DevOps [DV]: 4 tasks
- Review [RV]: 3 tasks

**Parallelizable Tasks:** 23 tasks marked with [P] can run in parallel within their phase

**MVP Scope (US1 Only):**
- Tasks: T001-T022 + T039-T042 + T043-T044 + T048-T050 + T051-T057
- Total: ~35 tasks (~40 hours / 5 days)
- Deliverable: Users can view current level and progress to next level

**Post-MVP (US2 + US3):**
- Tasks: T023-T038 + T045-T047
- Total: ~22 tasks (~25 hours / 3 days)
- Deliverable: Full level progression path + real-time notifications

---

## Implementation Strategy

### MVP-First Approach

1. **Week 1 (Days 1-5):** MVP Implementation (US1)
   - Days 1-2: Foundation + Backend API (T001-T015)
   - Days 3-4: Frontend UI (T016-T021)
   - Day 5: Testing + Documentation (T039-T044, T051-T057)
   - **Deliverable:** Working level card showing current level + progress

2. **Week 2 (Days 6-8):** Post-MVP Features (US2 + US3)
   - Day 6: US2 Backend + Frontend (T023-T033)
   - Day 7: US3 SignalR + Notifications (T034-T038)
   - Day 8: Full testing suite (T045-T050)
   - **Deliverable:** Complete feature with all user stories

3. **Week 3 (Days 9-10):** Deployment & Monitoring
   - Deploy to staging
   - Canary rollout (5% → 25% → 50% → 100%)
   - Monitor metrics (performance, errors, engagement)

### Incremental Delivery Benefits

- MVP deployed after 5 days → Immediate user value
- US2 adds level exploration (nice-to-have)
- US3 adds real-time notifications (engagement boost)
- Each phase independently testable and deployable

---

**Last Updated:** 2025-11-08
**Status:** Ready for Implementation
**Next Step:** Begin T001 (Review implementation plan)
