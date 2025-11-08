# Mini Games - Task Breakdown

**Epic:** Mini Games MVP
**Sprint:** Sprint 1-3 (9 weeks)
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

**Goal:** Implement Mini Games feature enabling users to play interactive games (Spin the Wheel, Gift Box, Scratch Card, MatchX) and win prizes with real-time updates.

**Business Value:** Increase user engagement through gamified experiences, provide additional monetization via buy-in costs, enhance retention through jackpot mechanics.

**Success Criteria:**
- GET /api/mini-games response time < 200ms (p95)
- POST /api/mini-games/{id}/play execution < 500ms (p95)
- 99.5%+ prize award success rate
- 80%+ cache hit rate
- SignalR events delivered within 100ms
- 80%+ test coverage
- Zero critical bugs in first week post-launch

---

## Task List

### Phase 1: Setup & Foundational Infrastructure

#### Foundation Tasks (No Story Label)

- [ ] T001 [DV] Create branch `003-mini-games` and verify project structure exists at `backend/Smartico.Missions.sln`
- [ ] T002 [DV] Verify existing dependencies (MediatR, FluentValidation, Polly, SignalR, Serilog) in `backend/src/Smartico.Missions.Application/Smartico.Missions.Application.csproj`
- [ ] T003 [TY] Review Smartico API documentation in `smartico-api/docs/interfaces/TMiniGameTemplate.md` and `TMiniGamePrize.md`
- [ ] T004 [TY] Review existing Bonuses implementation patterns in `backend/src/Smartico.Missions.Application/Features/Bonuses/`
- [ ] T005 [P] [TY] Create directory structure `backend/src/Smartico.Missions.Domain/Enums/` if not exists
- [ ] T006 [P] [TY] Create directory structure `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/`
- [ ] T007 [P] [TY] Create directory structure `backend/src/Smartico.Missions.Application/Features/MiniGames/Commands/`
- [ ] T008 [P] [TY] Create directory structure `backend/src/Smartico.Missions.Application/Features/MiniGames/Validators/`
- [ ] T009 [P] [TY] Create directory structure `frontend/src/types/` if not exists
- [ ] T010 [P] [TY] Create directory structure `frontend/src/services/` if not exists
- [ ] T011 [P] [TY] Create directory structure `frontend/src/components/` if not exists

---

### Phase 2: Domain Layer Entities & Enums (Foundational - Blocks All User Stories)

#### Domain Entities (Required for all stories)

- [ ] T012 [CQ] [TY] Create `MiniGamePrizeType` enum in `backend/src/Smartico.Missions.Domain/Enums/MiniGamePrizeType.cs` with 11 types (NoPrize, Points, Bonus, Manual, Spin, Jackpot, ChangeLevel, Mission, RaffleTicket, GemsAndDiamonds, Unknown) per data-model.md
- [ ] T013 [P] [CQ] [TY] Create `GameType` enum in `backend/src/Smartico.Missions.Domain/Enums/GameType.cs` with 4 types (Spin, GiftBox, Scratch, MatchX)
- [ ] T014 [P] [CQ] [TY] Create `BuyInType` enum in `backend/src/Smartico.Missions.Domain/Enums/BuyInType.cs` with 5 types (Free, Points, Gems, Diamonds, Spin)
- [ ] T015 [CQ] [TY] Create `MiniGamePrize` entity in `backend/src/Smartico.Missions.Domain/Entities/MiniGamePrize.cs` with all properties from data-model.md including `IsAvailable()` method
- [ ] T016 [CQ] [TY] Create `MiniGame` entity in `backend/src/Smartico.Missions.Domain/Entities/MiniGame.cs` with all properties, navigation to Prizes, and methods `IsActive()`, `IsOnCooldown()`, `HasAttemptsRemaining()`
- [ ] T017 [CQ] [TY] Create `PlayMiniGameResult` record in `backend/src/Smartico.Missions.Domain/Entities/PlayMiniGameResult.cs` with success/error properties
- [ ] T018 [TY] Create `ISmarticoMiniGameApiClient` interface in `backend/src/Smartico.Missions.Domain/Interfaces/ISmarticoMiniGameApiClient.cs` with `GetMiniGamesAsync()` and `PlayMiniGameAsync()` methods
- [ ] T019 [CQ] [TY] Extend `IProgressBroadcaster` interface in `backend/src/Smartico.Missions.Domain/Interfaces/IProgressBroadcaster.cs` with 5 mini game methods: `BroadcastMiniGamePlayedAsync()`, `BroadcastMiniGamePrizeWonAsync()`, `BroadcastMiniGameJackpotWonAsync()`, `BroadcastMiniGamePoolUpdatedAsync()`, `BroadcastMiniGameAvailableAsync()`
- [ ] T020 [DV] Build Domain project with `dotnet build backend/src/Smartico.Missions.Domain/Smartico.Missions.Domain.csproj` and verify 0 warnings/errors

---

### Phase 3: User Story 1 - View Available Mini Games [US1]

**Story Goal:** As a user, I want to see a list of all available mini games so I can choose which game to play.

**Independent Test Criteria:**
- GET /api/mini-games returns 200 with array of mini games
- Response includes game name, description, thumbnail, game type, buy-in cost, jackpot amount (if enabled), next available play time (if cooldown active)
- Games can be filtered by type in UI
- Response time < 200ms (p95)
- Cache hit rate 80%+ for repeated requests

#### Backend Implementation [US1]

- [ ] T021 [US1] [CQ] [TY] Create `GetMiniGamesQuery` record and `GetMiniGamesResponse` record in `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/GetMiniGames.cs`
- [ ] T022 [US1] [CQ] [PF] Create `GetMiniGamesQueryHandler` in same file with caching logic (30s TTL), cache key pattern `minigames:{userId}`, inject `ISmarticoMiniGameApiClient`, `IMemoryCacheService`, `ILogger<GetMiniGamesQueryHandler>`
- [ ] T023 [US1] [CQ] [TY] Create demo API client `SmarticoMiniGameApiClient` in `backend/src/Smartico.Missions.Infrastructure/SmarticoApi/SmarticoMiniGameApiClient.cs` implementing `ISmarticoMiniGameApiClient` with 5 hardcoded demo games (Daily Lucky Spin, Gems Treasure Box, Scratch & Win, Match 3 Challenge, VIP Mega Wheel) per research.md
- [ ] T024 [US1] [P] [CQ] Implement demo prize pool management in `SmarticoMiniGameApiClient` using in-memory dictionary with lock-based atomic updates
- [ ] T025 [US1] [P] [CQ] Implement demo jackpot system in `SmarticoMiniGameApiClient` with in-memory increments on play
- [ ] T026 [US1] [DV] Register `ISmarticoMiniGameApiClient` as singleton in `backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs`
- [ ] T027 [US1] [CQ] [TY] Create `MiniGamesController` in `backend/src/Smartico.Missions.Api/Controllers/MiniGamesController.cs` with GET endpoint `/api/mini-games?userId={userId}` dispatching to `GetMiniGamesQuery` via MediatR
- [ ] T028 [US1] [TY] Add XML documentation comments to controller endpoint for Swagger
- [ ] T029 [US1] [DV] Build Application and Infrastructure projects: `dotnet build backend/src/Smartico.Missions.Application` and verify 0 warnings/errors
- [ ] T030 [US1] [DV] Build API project: `dotnet build backend/src/Smartico.Missions.Api` and verify 0 warnings/errors

#### Frontend Implementation [US1]

- [ ] T031 [P] [US1] [TY] Create TypeScript types in `frontend/src/types/minigame.ts`: `MiniGame` interface, `MiniGamePrize` interface, `GameType` enum, `BuyInType` enum, `MiniGamePrizeType` enum, `PlayResult` interface
- [ ] T032 [US1] [CQ] [TY] Create `MiniGameService` class in `frontend/src/services/miniGameService.ts` with static method `getMiniGames(userId: string): Promise<MiniGame[]>` using Fetch API pattern from BonusService
- [ ] T033 [US1] [UX] [TY] Create `MiniGameCard` component in `frontend/src/components/MiniGameCard.tsx` displaying game thumbnail, name, description, buy-in cost, jackpot amount (if applicable), cooldown timer (if active), Play button (disabled if cooldown/no attempts)
- [ ] T034 [US1] [UX] [TY] Create `MiniGameList` component in `frontend/src/components/MiniGameList.tsx` with useState for games array, useEffect to load games on mount, loading state (skeleton cards), error handling with retry button, filter controls (All/Spin/GiftBox/Scratch/MatchX)
- [ ] T035 [US1] [UX] Add tab navigation in `frontend/src/App.tsx` with "Mini Games" tab alongside Missions and Bonuses tabs
- [ ] T036 [US1] [DV] Test frontend builds with `npm run build` in `frontend/` and verify 0 errors

#### Testing [US1]

- [ ] T037 [P] [US1] [TS] Write unit test for `GetMiniGamesQueryHandler` in `backend/tests/Smartico.Missions.Application.Tests/Features/MiniGames/GetMiniGamesQueryHandlerTests.cs`: `Handle_Should_ReturnCachedMiniGames_When_CacheHit()` (AAA pattern, single assertion)
- [ ] T038 [P] [US1] [TS] Write unit test: `Handle_Should_CallApiClient_When_CacheMiss()` (verify API client called once)
- [ ] T039 [P] [US1] [TS] Write unit test: `Handle_Should_SetCache_When_ApiReturnsGames()` (verify cache set with 30s TTL)
- [ ] T040 [P] [US1] [TS] Write integration test in `backend/tests/Smartico.Missions.Api.IntegrationTests/MiniGamesControllerTests.cs`: `GetMiniGames_Should_Return200_When_ValidUserId()` using WebApplicationFactory
- [ ] T041 [P] [US1] [TS] Write integration test: `GetMiniGames_Should_Return400_When_UserIdMissing()`
- [ ] T042 [P] [US1] [TS] Write frontend service test in `frontend/src/services/__tests__/miniGameService.test.ts`: `getMiniGames_should_return_array_of_games_when_api_call_succeeds()` with MSW mocking
- [ ] T043 [P] [US1] [TS] Write component test in `frontend/src/components/__tests__/MiniGameCard.test.tsx`: `should_render_game_name_and_description()` using React Testing Library
- [ ] T044 [P] [US1] [TS] Write component test: `should_disable_play_button_when_cooldown_active()` (verify disabled attribute)
- [ ] T045 [US1] [RV] Run all tests for US1 with `dotnet test backend/` and `npm test` in `frontend/` and verify 100% pass

#### Manual Testing [US1]

- [ ] T046 [US1] [RV] Start backend with `dotnet run --project backend/src/Smartico.Missions.Api` and verify listening on http://localhost:5227
- [ ] T047 [US1] [RV] Test GET /api/mini-games?userId=user123 with curl/Postman and verify returns 5 demo games with correct structure
- [ ] T048 [US1] [RV] Start frontend with `npm run dev` in `frontend/` and navigate to Mini Games tab
- [ ] T049 [US1] [RV] Verify 5 games displayed with thumbnails, names, buy-in costs, jackpot amounts
- [ ] T050 [US1] [RV] Test filter controls (All/Spin/GiftBox/Scratch/MatchX) and verify games filtered correctly
- [ ] T051 [US1] [PF] Verify cache hit time < 10ms in backend logs for repeated GET requests
- [ ] T052 [US1] [PF] Run Lighthouse audit on Mini Games page and verify Performance score ≥ 90

---

### Phase 4: User Story 2 - Play Mini Game [US2]

**Story Goal:** As a user, I want to play a mini game and win prizes.

**Independent Test Criteria:**
- POST /api/mini-games/{id}/play validates buy-in requirements
- Validates attempt limits and cooldowns
- Executes game and determines prize
- Awards prize immediately (points/spins/bonus/etc.)
- Shows win animation and acknowledgment message
- Prize pool decrements after win
- Jackpot increments on play, resets on jackpot win
- SignalR events broadcast (MiniGamePlayed, MiniGamePrizeWon)
- Response time < 500ms (p95)

#### Backend Implementation [US2]

- [ ] T053 [US2] [CQ] [TY] Create `PlayMiniGameCommand` record with `UserId` and `GameId` properties in `backend/src/Smartico.Missions.Application/Features/MiniGames/Commands/PlayMiniGame.cs`
- [ ] T054 [US2] [CQ] [TY] Create `PlayMiniGameResponse` record with success/error properties matching `PlayMiniGameResult` entity
- [ ] T055 [US2] [TS] [SC] Create `PlayMiniGameCommandValidator` in `backend/src/Smartico.Missions.Application/Features/MiniGames/Validators/PlayMiniGameCommandValidator.cs` using FluentValidation with rules: `UserId` not empty, `GameId` > 0
- [ ] T056 [US2] [CQ] Create `PlayMiniGameCommandHandler` in `Commands/PlayMiniGame.cs` with injected dependencies (`ISmarticoMiniGameApiClient`, `IMemoryCacheService`, `IProgressBroadcaster`, `ILogger<PlayMiniGameCommandHandler>`)
- [ ] T057 [US2] [CQ] Implement handler logic: Call `_miniGameApiClient.PlayMiniGameAsync()`, check result success, invalidate cache `minigames:{userId}`, broadcast `BroadcastMiniGamePlayedAsync()`, if prize won broadcast `BroadcastMiniGamePrizeWonAsync()`, if jackpot won broadcast `BroadcastMiniGameJackpotWonAsync()`, return response
- [ ] T058 [US2] [CQ] Implement prize selection logic in `SmarticoMiniGameApiClient.PlayMiniGameAsync()`: filter available prizes (pool > 0 or IsSurcharge = true), weighted random selection, return selected prize
- [ ] T059 [US2] [CQ] Implement prize pool deduction logic in `SmarticoMiniGameApiClient`: decrement `prize.Pool` by 1 after win, use lock to prevent race conditions
- [ ] T060 [US2] [CQ] Implement jackpot increment logic: add `jackpotAddOnAttempt` to `jackpotCurrent` on each play
- [ ] T061 [US2] [CQ] Implement jackpot reset logic: set `jackpotCurrent` to seed value (10) when jackpot prize won
- [ ] T062 [US2] [CQ] Implement game state updates: decrement `spinCount`, set `nextAvailableSpinTs` to current time + cooldown period
- [ ] T063 [US2] [SC] Implement buy-in validation: check user has sufficient points/gems/diamonds based on `buyInType` and `buyInCost*` fields (demo: always pass for MVP)
- [ ] T064 [US2] [SC] Implement cooldown validation: check `nextAvailableSpinTs` < current time
- [ ] T065 [US2] [SC] Implement attempt limit validation: check `spinCount` > 0
- [ ] T066 [US2] [CQ] [TY] Add POST endpoint `/api/mini-games/{gameId}/play?userId={userId}` to `MiniGamesController` dispatching `PlayMiniGameCommand` via MediatR, return 200 on success, 400 on validation error, 404 if game not found
- [ ] T067 [US2] [TY] Add XML documentation to play endpoint for Swagger
- [ ] T068 [US2] [CQ] Extend `SignalRProgressBroadcaster` in `backend/src/Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs` with implementations of 5 mini game broadcast methods from `IProgressBroadcaster`
- [ ] T069 [US2] [DV] Build all projects with `dotnet build backend/Smartico.Missions.sln` and verify 0 warnings/errors

#### Frontend Implementation [US2]

- [ ] T070 [US2] [CQ] [TY] Add static method `playMiniGame(userId: string, gameId: number): Promise<PlayResult>` to `MiniGameService` in `frontend/src/services/miniGameService.ts` with POST to `/api/mini-games/${gameId}/play?userId=${userId}`
- [ ] T071 [US2] [CQ] [TY] Extend `SignalRService` in `frontend/src/services/signalr.ts` with event handlers: `onMiniGamePlayed(handler)`, `onMiniGamePrizeWon(handler)`, `onMiniGameJackpotWon(handler)`
- [ ] T072 [US2] [UX] Add `handlePlay` function to `MiniGameList` component: set loading state, call `MiniGameService.playMiniGame()`, on success show alert with prize name, refresh games list, on error show alert with error message
- [ ] T073 [US2] [UX] Add SignalR event listeners in `MiniGameList` useEffect: `onMiniGamePlayed` updates game in state with new cooldown/attempts, `onMiniGamePrizeWon` shows toast notification with prize details, `onMiniGameJackpotWon` shows celebration animation and updates jackpot globally
- [ ] T074 [US2] [UX] Add loading state to `MiniGameCard`: disable Play button and show spinner when `isLoading` prop is true
- [ ] T075 [US2] [UX] Add win animation modal/toast in `MiniGameList` showing prize icon, name, value, and acknowledgment message
- [ ] T076 [US2] [DV] Build frontend with `npm run build` in `frontend/` and verify 0 errors

#### Testing [US2]

- [ ] T077 [P] [US2] [TS] Write unit test for `PlayMiniGameCommandHandler`: `Handle_Should_ReturnSuccess_When_PrizeWon()` (AAA pattern, verify success true, prizeId populated)
- [ ] T078 [P] [US2] [TS] Write unit test: `Handle_Should_InvalidateCache_When_GamePlayed()` (verify `_cacheService.RemoveAsync` called with correct key)
- [ ] T079 [P] [US2] [TS] Write unit test: `Handle_Should_BroadcastMiniGamePlayed_When_GamePlayed()` (verify `_progressBroadcaster.BroadcastMiniGamePlayedAsync` called once)
- [ ] T080 [P] [US2] [TS] Write unit test: `Handle_Should_BroadcastMiniGamePrizeWon_When_PrizeTypeNotNoPrize()` (verify prize won event broadcast)
- [ ] T081 [P] [US2] [TS] Write unit test: `Handle_Should_ReturnError_When_InsufficientBalance()` (verify errorCode = "INSUFFICIENT_BALANCE")
- [ ] T082 [P] [US2] [TS] Write unit test: `Handle_Should_ReturnError_When_CooldownActive()` (verify errorCode = "COOLDOWN_ACTIVE")
- [ ] T083 [P] [US2] [TS] Write unit test: `Handle_Should_ReturnError_When_MaxAttemptsExceeded()` (verify errorCode = "MAX_ATTEMPTS_EXCEEDED")
- [ ] T084 [P] [US2] [TS] Write unit test for `SmarticoMiniGameApiClient.PlayMiniGameAsync()`: `Should_DecrementPrizePool_When_PrizeWon()` (verify pool reduced by 1)
- [ ] T085 [P] [US2] [TS] Write unit test: `Should_IncrementJackpot_When_NonJackpotPrizeWon()` (verify jackpot increased by jackpotAddOnAttempt)
- [ ] T086 [P] [US2] [TS] Write unit test: `Should_ResetJackpot_When_JackpotPrizeWon()` (verify jackpot reset to seed value)
- [ ] T087 [P] [US2] [TS] Write integration test: `PlayMiniGame_Should_Return200_When_ValidGameIdAndUserId()` using WebApplicationFactory
- [ ] T088 [P] [US2] [TS] Write integration test: `PlayMiniGame_Should_Return400_When_GameIdInvalid()`
- [ ] T089 [P] [US2] [TS] Write integration test: `PlayMiniGame_Should_Return404_When_GameNotFound()`
- [ ] T090 [P] [US2] [TS] Write frontend service test: `playMiniGame_should_return_play_result_when_api_call_succeeds()` with MSW
- [ ] T091 [P] [US2] [TS] Write component test: `should_call_onPlay_when_play_button_clicked()` (verify handler called with gameId)
- [ ] T092 [P] [US2] [TS] Write component test: `should_show_loading_spinner_when_isLoading_true()` (verify button disabled and spinner shown)
- [ ] T093 [US2] [RV] Run all tests with `dotnet test backend/` and `npm test` in `frontend/` and verify 100% pass

#### Manual Testing [US2]

- [ ] T094 [US2] [RV] Test POST /api/mini-games/1/play?userId=user123 with curl/Postman and verify returns 200 with prize result
- [ ] T095 [US2] [RV] Verify prize pool decrements in demo data after winning prize (call GET /api/mini-games again)
- [ ] T096 [US2] [RV] Verify jackpot increments after non-jackpot play (check jackpotCurrent in response)
- [ ] T097 [US2] [RV] Play game until jackpot won and verify jackpot resets to seed value
- [ ] T098 [US2] [RV] Play game until attempts exhausted and verify error "MAX_ATTEMPTS_EXCEEDED"
- [ ] T099 [US2] [RV] Play game with cooldown active (within 6 hours of last play) and verify error "COOLDOWN_ACTIVE"
- [ ] T100 [US2] [RV] Open two browser tabs, play game in tab 1, verify SignalR event received in tab 2 (jackpot updates in console)
- [ ] T101 [US2] [RV] In frontend UI, click Play button on a game, verify loading state shown, verify win notification displayed
- [ ] T102 [US2] [PF] Measure play API response time with multiple requests and verify p95 < 500ms

---

### Phase 5: User Story 3 - View Prize History [US3]

**Story Goal:** As a user, I want to see my prize history so I can track my wins.

**Independent Test Criteria:**
- GET /api/mini-games/history?userId={userId} returns prize history
- Response includes prize type, value, timestamp, game name
- Can filter by date range and prize type
- Prizes with `hidePrizeFromHistory=true` excluded
- Response time < 300ms (p95)

**Note:** This user story is marked as **Optional for MVP** in plan.md. Can be implemented post-MVP.

#### Backend Implementation [US3] - OPTIONAL

- [ ] T103 [P] [US3] [CQ] [TY] Create `GetPrizeHistoryQuery` record and `GetPrizeHistoryResponse` record in `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/GetPrizeHistory.cs`
- [ ] T104 [US3] [CQ] Create `GetPrizeHistoryQueryHandler` with in-memory storage of play history (list of `MiniGamePlayHistory` records)
- [ ] T105 [US3] [CQ] Update `PlayMiniGameCommandHandler` to record play history after successful play (if prize not hidden)
- [ ] T106 [US3] [CQ] [TY] Add GET endpoint `/api/mini-games/history?userId={userId}` to `MiniGamesController`
- [ ] T107 [US3] [DV] Build projects with `dotnet build backend/Smartico.Missions.sln`

#### Frontend Implementation [US3] - OPTIONAL

- [ ] T108 [P] [US3] [CQ] [TY] Add static method `getPrizeHistory(userId: string): Promise<PrizeHistory[]>` to `MiniGameService`
- [ ] T109 [US3] [UX] Create `PrizeHistoryList` component in `frontend/src/components/PrizeHistoryList.tsx` displaying prize list with filters
- [ ] T110 [US3] [UX] Add "Prize History" tab to Mini Games page in `frontend/src/App.tsx`

#### Testing [US3] - OPTIONAL

- [ ] T111 [P] [US3] [TS] Write unit test: `GetPrizeHistoryQueryHandler_Should_ReturnHistory_When_HistoryExists()`
- [ ] T112 [P] [US3] [TS] Write unit test: `Should_ExcludeHiddenPrizes_When_HidePrizeFromHistoryTrue()`
- [ ] T113 [US3] [TS] Run all tests with `dotnet test backend/` and `npm test`

---

### Phase 6: User Story 4 - Real-time Updates [US4]

**Story Goal:** As a player, I want to receive live updates for game changes so I see current jackpots and prize pools.

**Independent Test Criteria:**
- SignalR connection established on page load
- `MiniGamePlayed` event updates attempt counters in UI
- `MiniGamePrizeWon` event shows toast notification
- `MiniGameJackpotWon` event updates jackpot display globally
- `MiniGamePoolUpdated` event updates prize availability indicators
- Events delivered within 100ms (95%+)
- Auto-reconnect on connection failure

**Note:** Most of this functionality already implemented in US2 (SignalR event handlers). This phase adds edge case handling and monitoring.

#### Backend Enhancements [US4]

- [ ] T114 [US4] [PF] Add SignalR event logging in `SignalRProgressBroadcaster`: log event name, userId, timestamp for all 5 mini game events
- [ ] T115 [US4] [PF] Verify SignalR hub connection limit configuration in `backend/src/Smartico.Missions.Api/Program.cs` (target: 1000 connections per instance)

#### Frontend Enhancements [US4]

- [ ] T116 [US4] [CQ] Add SignalR connection retry logic in `frontend/src/services/signalr.ts`: exponential backoff with max 30s delay (already exists from Bonuses pattern, verify implementation)
- [ ] T117 [US4] [UX] Add connection status indicator in Mini Games UI (green dot when connected, red when disconnected, yellow when reconnecting)
- [ ] T118 [US4] [UX] Add graceful degradation: if SignalR disconnected > 1 minute, show "Live updates unavailable" banner and enable manual refresh button
- [ ] T119 [US4] [UX] Implement `MiniGamePoolUpdated` event handler: find game by gameId, find prize by prizeId, update `prize.pool` in state, show "Out of stock" badge if pool = 0
- [ ] T120 [US4] [UX] Implement `MiniGameAvailable` event handler: add new game to games array with fade-in animation

#### Testing [US4]

- [ ] T121 [P] [US4] [TS] Write integration test: `SignalR_Should_BroadcastMiniGamePlayed_When_GamePlayed()` (verify event received by test client)
- [ ] T122 [P] [US4] [TS] Write integration test: `SignalR_Should_BroadcastMiniGameJackpotWon_When_JackpotWon()` (verify all clients receive event)
- [ ] T123 [P] [US4] [TS] Write E2E test with Playwright: open two tabs, play game in tab 1, verify jackpot updates in tab 2 within 200ms
- [ ] T124 [US4] [TS] Run all tests with `dotnet test backend/` and `npx playwright test`

#### Manual Testing [US4]

- [ ] T125 [US4] [RV] Open browser DevTools Network tab, verify SignalR connection established (Status 101 Switching Protocols)
- [ ] T126 [US4] [RV] Open two browser tabs side-by-side, play game in tab 1, verify jackpot updates in tab 2 within 1 second
- [ ] T127 [US4] [RV] Stop backend server while frontend connected, verify "Live updates unavailable" banner shown after 1 minute
- [ ] T128 [US4] [RV] Restart backend, verify frontend auto-reconnects within 30 seconds
- [ ] T129 [US4] [PF] Monitor SignalR event latency in browser console timestamps and verify < 100ms for 95%+ of events

---

### Phase 7: User Story 5 - Game Stats and Leaderboards [US5]

**Story Goal:** As a player, I want to view game statistics so I can track my performance and compare with others.

**Independent Test Criteria:**
- GET /api/mini-games/stats?userId={userId} returns personal stats
- Response includes total games played, total prizes won, total value won, biggest jackpot win
- GET /api/mini-games/leaderboard?type={type} returns leaderboard (most games played, most prizes won, highest jackpot)
- Response time < 300ms (p95)

**Note:** This user story is marked as **Medium priority** in plan.md. Can be implemented post-MVP.

#### Backend Implementation [US5] - OPTIONAL

- [ ] T130 [P] [US5] [CQ] [TY] Create `GetStatsQuery` and `GetStatsResponse` in `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/GetStats.cs`
- [ ] T131 [US5] [CQ] Create `GetStatsQueryHandler` with in-memory aggregation of play history (total games, total prizes, total value, biggest jackpot)
- [ ] T132 [P] [US5] [CQ] [TY] Create `GetLeaderboardQuery` and `GetLeaderboardResponse` in `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/GetLeaderboard.cs`
- [ ] T133 [US5] [CQ] Create `GetLeaderboardQueryHandler` with in-memory leaderboard calculation (top 10 players by metric)
- [ ] T134 [US5] [CQ] [TY] Add GET endpoint `/api/mini-games/stats?userId={userId}` to `MiniGamesController`
- [ ] T135 [US5] [CQ] [TY] Add GET endpoint `/api/mini-games/leaderboard?type={type}` to `MiniGamesController`
- [ ] T136 [US5] [DV] Build projects with `dotnet build backend/Smartico.Missions.sln`

#### Frontend Implementation [US5] - OPTIONAL

- [ ] T137 [P] [US5] [CQ] [TY] Add static method `getStats(userId: string): Promise<GameStats>` to `MiniGameService`
- [ ] T138 [P] [US5] [CQ] [TY] Add static method `getLeaderboard(type: string): Promise<LeaderboardEntry[]>` to `MiniGameService`
- [ ] T139 [US5] [UX] Create `GameStatsCard` component displaying personal statistics in `frontend/src/components/GameStatsCard.tsx`
- [ ] T140 [US5] [UX] Create `Leaderboard` component displaying top players in `frontend/src/components/Leaderboard.tsx`
- [ ] T141 [US5] [UX] Add "Stats" tab to Mini Games page

#### Testing [US5] - OPTIONAL

- [ ] T142 [P] [US5] [TS] Write unit test: `GetStatsQueryHandler_Should_ReturnStats_When_HistoryExists()`
- [ ] T143 [P] [US5] [TS] Write unit test: `GetLeaderboardQueryHandler_Should_ReturnTop10_When_PlayersExist()`
- [ ] T144 [US5] [TS] Run all tests with `dotnet test backend/` and `npm test`

---

### Phase 8: Polish & Cross-Cutting Concerns

#### Performance Optimization

- [ ] T145 [PF] Run load test with k6 targeting 100 concurrent GET /api/mini-games requests and verify p95 < 200ms (use `specs/003-mini-games/tests/load-test.js` if created)
- [ ] T146 [PF] Run load test with 50 concurrent POST /api/mini-games/*/play requests and verify p95 < 500ms
- [ ] T147 [PF] Monitor cache hit rate in backend logs for 5 minutes of repeated GET requests and verify 80%+ hit rate
- [ ] T148 [PF] Run Lighthouse audit on Mini Games page and verify Performance score ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90
- [ ] T149 [PF] Measure frontend bundle size with `npm run build` and verify main bundle < 250KB gzipped

#### Accessibility Audit

- [ ] T150 [UX] Run axe DevTools automated scan on Mini Games page and verify 0 critical violations
- [ ] T151 [UX] Test keyboard navigation: Tab through all game cards, filters, Play buttons; Enter/Space to activate; Escape to close modals
- [ ] T152 [UX] Test screen reader (NVDA on Windows or VoiceOver on Mac): verify all game names, buy-in costs, jackpots announced correctly
- [ ] T153 [UX] Verify color contrast with WebAIM contrast checker: all text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- [ ] T154 [UX] Verify focus indicators visible for all interactive elements (outline or custom focus ring)
- [ ] T155 [UX] Add ARIA labels to all icon-only buttons (e.g., "Refresh games" for refresh button)
- [ ] T156 [UX] Add `aria-live="polite"` to win notification area for screen reader announcements

#### Security Hardening

- [ ] T157 [SC] Review all user inputs (userId, gameId) for validation: verify FluentValidation rules prevent empty/negative values
- [ ] T158 [SC] Verify React auto-escapes all game names, descriptions, prize names in JSX (no `dangerouslySetInnerHTML` used)
- [ ] T159 [SC] Verify JWT authentication middleware applied to all `/api/mini-games/*` endpoints in `Program.cs` (if JWT configured)
- [ ] T160 [SC] Verify rate limiting configured for play endpoint to prevent abuse (e.g., max 10 plays per minute per user)

#### Documentation

- [ ] T161 [TY] Review OpenAPI spec generated at `http://localhost:5227/swagger` and verify all endpoints documented with descriptions, request/response schemas, examples
- [ ] T162 [TY] Update root `README.md` with Mini Games feature overview, API endpoints, demo data description
- [ ] T163 [TY] Add XML documentation comments to all public methods in `MiniGamesController`, CQRS handlers, domain entities
- [ ] T164 [TY] Review `specs/003-mini-games/quickstart.md` and verify all code examples match actual implementation

#### Integration Testing

- [ ] T165 [TS] Write E2E test with Playwright: Browse mini games → sees 5 games → filters by Spin type → sees 2 games
- [ ] T166 [TS] Write E2E test: User plays free game → wins NO_PRIZE → sees "Better luck next time" message
- [ ] T167 [TS] Write E2E test: User plays points game → wins POINTS prize → balance updates (mock balance service for demo)
- [ ] T168 [TS] Write E2E test: User exceeds attempt limit → sees "over limit" message
- [ ] T169 [TS] Write E2E test: Real-time update - play in tab 1 → jackpot updates in tab 2 within 2 seconds
- [ ] T170 [TS] Run all E2E tests with `npx playwright test` and verify 100% pass

#### Build & Deployment Verification

- [ ] T171 [DV] Run full backend build with `dotnet build backend/Smartico.Missions.sln --configuration Release` and verify 0 warnings/errors
- [ ] T172 [DV] Run full frontend build with `npm run build` in `frontend/` and verify 0 errors, bundle size < 250KB gzipped
- [ ] T173 [DV] Run all backend tests with `dotnet test backend/ --configuration Release` and verify 80%+ coverage (use `dotnet test --collect:"XPlat Code Coverage"` and review coverage reports)
- [ ] T174 [DV] Run all frontend tests with `npm test -- --coverage` in `frontend/` and verify 80%+ coverage
- [ ] T175 [DV] Smoke test: Start backend, start frontend, navigate to Mini Games tab, verify games load, play a game, verify win notification

#### Code Review & Constitution Validation

- [ ] T176 [RV] Review all CQRS handlers for SOLID compliance: SRP (one responsibility), OCP (extensible), LSP (substitutable), ISP (focused interfaces), DIP (depend on abstractions)
- [ ] T177 [RV] Review all tests for AAA pattern: every test has Arrange/Act/Assert sections clearly marked with comments
- [ ] T178 [RV] Review all tests for single assertion: each test has exactly one `Assert.*/expect()` call (except guard assertions on setup)
- [ ] T179 [RV] Review all tests for naming convention: `MethodName_Should_ExpectedBehavior_When_StateUnderTest()` or `should_ExpectedBehavior_When_StateUnderTest()`
- [ ] T180 [RV] Review all C# code for nullable reference types: no nullable warnings in `dotnet build` output
- [ ] T181 [RV] Review all TypeScript code for strict mode: no `any` types, all function parameters and return values typed
- [ ] T182 [RV] Review all functions for size: no functions > 20 lines (extract helper methods if needed)
- [ ] T183 [RV] Review all magic numbers replaced with named constants (e.g., `const CACHE_TTL_SECONDS = 30`)
- [ ] T184 [RV] Review performance metrics: GET < 200ms, POST < 500ms, SignalR < 100ms, cache hit rate 80%+, all verified in tests or logs
- [ ] T185 [RV] Review accessibility compliance: WCAG AA checklist complete (keyboard nav, screen reader, color contrast, ARIA, focus indicators)

---

## Task Summary

**Total Tasks:** 185
**Total Estimate:** ~9 weeks (can be parallelized to ~6 weeks with dedicated backend + frontend resources)

### By Phase

- **Phase 1: Setup & Foundation** - 11 tasks (1 week)
- **Phase 2: Domain Layer** - 9 tasks (1 week)
- **Phase 3: US1 - View Available Mini Games** - 32 tasks (2 weeks)
- **Phase 4: US2 - Play Mini Game** - 50 tasks (2.5 weeks)
- **Phase 5: US3 - Prize History** - 11 tasks (OPTIONAL - 1 week)
- **Phase 6: US4 - Real-time Updates** - 16 tasks (1 week)
- **Phase 7: US5 - Game Stats** - 15 tasks (OPTIONAL - 1 week)
- **Phase 8: Polish & Cross-Cutting** - 41 tasks (1 week)

### By Category

- **Code Quality [CQ]**: 35 tasks
- **Testing [TS]**: 45 tasks
- **User Experience [UX]**: 22 tasks
- **Performance [PF]**: 12 tasks
- **Type Safety [TY]**: 32 tasks
- **Security [SC]**: 9 tasks
- **DevOps [DV]**: 18 tasks
- **Review/Validation [RV]**: 12 tasks

### By User Story

- **Setup/Foundation (No Story)**: 20 tasks
- **[US1] View Available Mini Games**: 32 tasks
- **[US2] Play Mini Game**: 50 tasks
- **[US3] Prize History**: 11 tasks (OPTIONAL)
- **[US4] Real-time Updates**: 16 tasks
- **[US5] Game Stats**: 15 tasks (OPTIONAL)
- **Polish**: 41 tasks

### MVP Scope (Phases 1-4 + Phase 8)

**Recommended MVP:** Implement US1 + US2 + US4 + Polish = **154 tasks** (~6 weeks)

**MVP Success Criteria:**
- Users can browse 5 demo mini games with filters
- Users can play games and win prizes (11 prize types supported)
- Real-time jackpot updates work across browser tabs
- All performance targets met (< 200ms GET, < 500ms POST, < 100ms SignalR)
- 80%+ test coverage
- WCAG AA accessibility compliance
- 0 critical bugs in smoke testing

**Post-MVP Enhancements:**
- US3: Prize History (11 tasks, 1 week)
- US5: Game Stats & Leaderboards (15 tasks, 1 week)
- Integration with real Smartico API (replace demo data client)
- Admin panel for game configuration

---

## Dependencies & Parallel Execution

### Critical Path (Must Execute Sequentially)

```
T001 → T002-T011 (parallel) → T012 → T015 → T016 → T020 → T021 → T022 → T027 → T053 → T056 → T066
```

**Estimated Critical Path Duration:** 4 weeks

### Parallel Opportunities

**Phase 1-2 (Foundation):** Tasks T002-T011 can run in parallel (directory setup)

**Phase 2 (Domain):** Tasks T013-T014 can run in parallel (enums)

**Phase 3 (US1 Backend):** Tasks T024-T025 can run in parallel (demo data logic)

**Phase 3 (US1 Frontend):** Tasks T031-T033 can run in parallel after T030 complete

**Phase 3 (US1 Tests):** Tasks T037-T044 can all run in parallel after implementation complete

**Phase 4 (US2 Tests):** Tasks T077-T092 can all run in parallel after implementation complete

**Phase 8 (Polish):** Many tasks can run in parallel:
- Performance tests (T145-T149) parallel
- Accessibility audit (T150-T156) parallel
- Security review (T157-T160) parallel
- Documentation (T161-T164) parallel
- E2E tests (T165-T169) parallel
- Code review (T176-T185) can start early, run throughout implementation

### User Story Independence

**US1 → US2 Dependency:** US2 depends on US1 (needs game list + play endpoint needs game entity)

**US3 Independence:** US3 (Prize History) can be implemented independently after US2, uses same entities

**US4 Independence:** US4 (Real-time Updates) mostly implemented in US2, just adds edge cases

**US5 Independence:** US5 (Stats & Leaderboards) depends on US2/US3 (needs play history data)

---

## Implementation Strategy

### Week 1: Foundation

- Complete T001-T020 (Setup + Domain Layer)
- Verify all entities, enums, interfaces compile with 0 warnings
- **Deliverable:** Domain layer complete, ready for application layer

### Week 2-3: US1 (View Mini Games)

- Complete T021-T052 (Backend + Frontend + Tests)
- **Deliverable:** Users can view 5 demo games, filter by type, see buy-in costs/jackpots

### Week 4-5: US2 (Play Mini Game)

- Complete T053-T102 (Backend + Frontend + Tests)
- **Deliverable:** Users can play games, win prizes, see real-time updates

### Week 6: US4 (Real-time Polish) + Start US3/US5 (Optional)

- Complete T114-T129 (Real-time edge cases)
- Optionally start T103-T113 (US3) or T130-T144 (US5)
- **Deliverable:** Real-time updates robust with auto-reconnect

### Week 7: US3 + US5 (Optional) or Polish

- Complete US3 + US5 if time allows
- Otherwise proceed to Phase 8 (Polish)

### Week 8-9: Polish & Launch

- Complete T145-T185 (Performance, Accessibility, Security, Documentation, Testing, Review)
- **Deliverable:** Production-ready MVP with 80%+ test coverage, WCAG AA compliance, all performance targets met

---

## Format Validation

✅ **All tasks follow checklist format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ **Task IDs sequential**: T001 through T185
✅ **[P] markers** on parallelizable tasks (different files, no dependencies)
✅ **[Story] labels** on all user story tasks ([US1], [US2], [US3], [US4], [US5])
✅ **File paths** specified for all implementation tasks
✅ **Category labels** on all tasks ([CQ], [TS], [UX], [PF], [TY], [SC], [DV], [RV])

---

**Last Updated:** 2025-11-08
**Status:** Ready for Implementation
**Next Step:** Begin Phase 1 (T001-T020) - Setup & Domain Layer