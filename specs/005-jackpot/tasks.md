# Jackpot System - Implementation Tasks

**Total Tasks:** 74
**Estimated Duration:** 16-18 working days (from plan.md)
**Branch:** 005-jackpot

## Task Format

- [ ] [T###] [P] [US#] Description with file path

- T### = Task ID (sequential)
- [P] = Parallelizable (can run concurrently)
- [US#] = User Story (US1-US7)

## Implementation Strategy

Follow Clean Architecture + CQRS pattern (reuse Levels/Bonuses patterns):
- Backend: Domain → Application (CQRS) → Infrastructure (API Client) → API (Controllers)
- Frontend: Types → Services → Components
- Demo data for MVP (same pattern as Levels feature)

## Phase 1: Setup & Prerequisites (Days 1-2)

**Goal:** Prepare project structure and shared infrastructure

### Backend Setup

- [X] **T001** Review existing codebase patterns (Levels, Bonuses implementations)
  - Review F:\Projects\smartico\backend\src\Smartico.Missions.Domain\Entities\ for entity patterns
  - Review F:\Projects\smartico\backend\src\Smartico.Missions.Application\Features\ for CQRS patterns
  - Review F:\Projects\smartico\backend\src\Smartico.Missions.Infrastructure\ExternalServices\ for API client patterns

- [X] **T002** Create Jackpot domain entities in backend\src\Smartico.Missions.Domain\Entities\
  - Create JackpotDetails.cs (main entity with 17 properties)
  - Create JackpotPot.cs (pot instance with 6 properties)
  - Create JackpotWinner.cs (winner record with 9 properties)
  - Create JackpotOptInRecord.cs (opt-in tracking with 4 properties)
  - Add XML documentation for all public properties
  - Use init-only properties and required modifiers

- [X] **T003** Create JackpotType enum in backend\src\Smartico.Missions.Domain\Enums\JackpotType.cs
  - MultiUser = 1 (shared pool among all users)
  - Personal = 2 (individual pool per user)

- [X] **T004** Create JackpotContributionType enum in backend\src\Smartico.Missions.Domain\Enums\JackpotContributionType.cs
  - Fixed = 1 (fixed amount per bet, e.g., 10 points)
  - Percentage = 2 (percentage of bet, e.g., 5%)

- [X] **T005** Create JackPotTemperature enum in backend\src\Smartico.Missions.Domain\Enums\JackPotTemperature.cs
  - COLD = 0 (pool < (min - seed) / 2)
  - WARM = 1 ((min - seed) / 2 ≤ pool < min)
  - HOT = 2 (min ≤ pool < min + 0.5 * (max - min))
  - BURNING = 3 (pool ≥ min + 0.5 * (max - min))

### Frontend Setup

- [X] **T006** [P] Create TypeScript types in frontend\src\types\jackpot.ts
  - Export JackpotType enum (MultiUser=1, Personal=2)
  - Export JackpotContributionType enum (Fixed=1, Percentage=2)
  - Export JackPotTemperature enum (COLD=0, WARM=1, HOT=2, BURNING=3)
  - Export JackpotDetails interface (17 properties matching backend)
  - Export JackpotPot interface (6 properties)
  - Export JackpotWinner interface (9 properties)
  - Export JackpotPublicMeta interface (nested metadata)
  - Add JSDoc comments for all types

- [X] **T007** [P] Create JackpotService in frontend\src\services\jackpotService.ts
  - Create base service class with error handling
  - Add fetch wrapper with retry logic (3 attempts, exponential backoff)
  - Add placeholder methods (will implement in later phases)
  - Export singleton instance

## Phase 2: US1 - View Available Jackpots (Days 3-5)

**Acceptance Criteria:** AC1 - Display all jackpots with temperature, contribution rate, opt-in status
**Independent Test:** Navigate to Jackpots tab → See 5 demo jackpots → Each shows pool, temperature indicator, contribution rate

### Backend

- [X] **T008** [US1] Create GetJackpotsQuery in Application\Features\Jackpots\Queries\GetJackpots\GetJackpotsQuery.cs
  - Define record with UserId (string, required)
  - Implement IRequest&lt;GetJackpotsResponse&gt;
  - Add XML documentation

- [X] **T009** [US1] Implement GetJackpotsQueryHandler in Application\Features\Jackpots\Queries\GetJackpots\GetJackpotsQueryHandler.cs
  - Inject ISmarticoJackpotApiClient, ICacheService, ILogger
  - Implement 30-second caching strategy with cache key "jackpots:{userId}"
  - Call API client GetJackpotsAsync method
  - Return GetJackpotsResponse with list of jackpots
  - Handle errors gracefully with fallback empty list

- [X] **T010** [US1] Create GetJackpotsQueryValidator in Application\Features\Jackpots\Queries\GetJackpots\GetJackpotsQueryValidator.cs
  - Validate UserId is not null or empty
  - Validate UserId matches pattern (alphanumeric, 1-255 chars)
  - Use FluentValidation AbstractValidator base class

- [X] **T011** [US1] Add GET /api/jackpots endpoint in Api\Controllers\JackpotsController.cs
  - Create new JackpotsController : ControllerBase
  - Add HttpGet route with userId query parameter
  - Inject IMediator
  - Send GetJackpotsQuery via MediatR
  - Return 200 OK with jackpots list
  - Handle validation errors (400 Bad Request)
  - Add Swagger documentation with ProducesResponseType attributes

- [X] **T012** [US1] Create ISmarticoJackpotApiClient interface in Domain\Interfaces\ISmarticoJackpotApiClient.cs
  - Task&lt;List&lt;JackpotDetails&gt;&gt; GetJackpotsAsync(string userId, CancellationToken ct)
  - Task&lt;JackpotDetails&gt; GetJackpotByIdAsync(int templateId, string userId, CancellationToken ct)
  - Task&lt;JackpotDetails&gt; OptInAsync(string userId, int templateId, CancellationToken ct)
  - Task&lt;JackpotDetails&gt; OptOutAsync(string userId, int templateId, CancellationToken ct)
  - Task&lt;List&lt;JackpotWinner&gt;&gt; GetWinnersAsync(string userId, JackpotType? filterType, CancellationToken ct)
  - Add XML documentation for all methods

- [X] **T013** [US1] Implement SmarticoJackpotApiClient in Infrastructure\ExternalServices\SmarticoJackpotApiClient.cs
  - Implement ISmarticoJackpotApiClient interface
  - Create static ConcurrentDictionary for demo data (5 jackpots)
  - Initialize demo data in static constructor
  - Implement GetJackpotsAsync with simulated 50ms delay
  - Return jackpots with user-specific opt-in status
  - Thread-safe operations using lock or concurrent collections

### Frontend

- [X] **T014** [P] [US1] Implement JackpotService.getJackpots() method in frontend\src\services\jackpotService.ts
  - Add getJackpots(userId: string): Promise&lt;JackpotDetails[]&gt;
  - Implement fetch to GET /api/jackpots?userId={userId}
  - Parse JSON response
  - Handle 400, 401, 404, 500 errors with user-friendly messages
  - Add retry logic (3 attempts with exponential backoff)

- [X] **T015** [P] [US1] Create useJackpots hook in frontend\src\hooks\useJackpots.ts
  - Create custom React hook with useState and useEffect
  - Return { jackpots, loading, error, refetch }
  - Call JackpotService.getJackpots on mount
  - Handle loading and error states
  - Provide refetch function to manually reload data

- [X] **T016** [US1] Create JackpotCard component in frontend\src\components\JackpotCard.tsx
  - Props: jackpot (JackpotDetails), onOptIn, onOptOut
  - Display: name, description, thumbnail, pool (both currencies), temperature, contribution rate, registration count, opt-in status
  - Show Opt In/Opt Out button based on userOptedIn status
  - Disable button during explosion state
  - Card with shadow, hover effect, responsive design
  - Add ARIA labels for accessibility

- [X] **T017** [US1] Create JackpotList component in frontend\src\components\JackpotList.tsx
  - Props: jackpots (JackpotDetails[]), loading, error, onRefresh, onOptIn, onOptOut
  - Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
  - Filter by jackpot type (MultiUser/Personal) with pill buttons
  - Show loading skeleton while fetching
  - Show error state with retry button
  - Show empty state if no jackpots
  - Map jackpots to JackpotCard components

- [X] **T018** [US1] Create TemperatureIndicator component in frontend\src\components\TemperatureIndicator.tsx
  - Props: temperature (JackPotTemperature), showLabel (boolean)
  - Visual colors: COLD=blue, WARM=yellow, HOT=orange, BURNING=red
  - Icons: COLD=🧊, WARM=☀️, HOT=🔥, BURNING=🌋
  - Pulse animation for HOT and BURNING
  - aria-label for screen readers ("Pool temperature: {label}")

- [X] **T019** [US1] Add Jackpots tab to App.tsx navigation
  - Import JackpotList component
  - Add "Jackpots" tab to main navigation
  - Create route for /jackpots path
  - Render JackpotList with useJackpots hook

- [X] **T020** [US1] Test demo jackpots display in browser
  - Verify 5 jackpots render correctly
  - Check temperature indicators show correct colors
  - Verify multi-currency display works (Points/Gems + USD)
  - Test filter by type (MultiUser/Personal)
  - Verify loading and error states

## Phase 3: US2 - Opt-In to Jackpot (Days 6-7)

**Acceptance Criteria:** AC2 - Free opt-in, registration count increases, button changes
**Independent Test:** Click "Opt In" → See confirmation → Button changes to "Opt Out" → Registration count +1

### Backend

- [X] **T021** [US2] Create OptInJackpotCommand in Application\Features\Jackpots\Commands\OptIn\OptInJackpotCommand.cs
  - Define record with UserId (string), JackpotTemplateId (int)
  - Implement IRequest&lt;OptInJackpotResponse&gt;
  - Add XML documentation

- [X] **T022** [US2] Implement OptInJackpotCommandHandler in Application\Features\Jackpots\Commands\OptIn\OptInJackpotCommandHandler.cs
  - Inject ISmarticoJackpotApiClient, ICacheService, IProgressBroadcaster, ILogger
  - Validate user not already opted in (check API client)
  - Call API client OptInAsync method
  - Invalidate cache for affected user ("jackpots:{userId}")
  - Broadcast JackpotPoolUpdated event via SignalR (registration count changed)
  - Return OptInJackpotResponse with updated jackpot details
  - Handle duplicate opt-in gracefully (return 409 Conflict)

- [X] **T023** [US2] Create OptInJackpotCommandValidator in Application\Features\Jackpots\Commands\OptIn\OptInJackpotCommandValidator.cs
  - Validate UserId not null or empty (pattern: alphanumeric 1-255)
  - Validate JackpotTemplateId is positive integer
  - Use FluentValidation AbstractValidator

- [X] **T024** [US2] Add POST /api/jackpots/{templateId}/opt-in endpoint in Api\Controllers\JackpotsController.cs
  - HttpPost route with templateId path parameter
  - Request body: { userId: string }
  - Send OptInJackpotCommand via MediatR
  - Return 200 OK with success message and updated jackpot
  - Return 400 if validation fails
  - Return 409 if user already opted in
  - Add Swagger documentation

### Frontend

- [X] **T025** [P] [US2] Implement JackpotService.optIn() method in frontend\src\services\jackpotService.ts
  - Add optIn(userId: string, templateId: number): Promise&lt;JackpotDetails&gt;
  - POST to /api/jackpots/{templateId}/opt-in with body { userId }
  - Parse response
  - Handle 400 (validation), 409 (already opted in), 500 errors
  - Return updated jackpot details

- [X] **T026** [US2] Add opt-in button logic to JackpotCard component
  - Import toast library for notifications
  - Add handleOptIn async function
  - Show loading spinner during API call
  - Update local state optimistically (userOptedIn = true, registrationCount++)
  - Revert optimistic update on error
  - Show success toast notification
  - Disable button during loading

- [X] **T027** [US2] Add confirmation toast notification
  - Install/import toast library (e.g., react-toastify)
  - Show success toast: "You're in! Your bets will now contribute {contributionInfo} to {jackpotName}."
  - Auto-dismiss after 5 seconds
  - aria-live="assertive" for screen readers

- [X] **T028** [US2] Test opt-in flow with demo user
  - Click "Opt In" on MultiUser jackpot
  - Verify button changes to "Opt Out"
  - Verify registration count increments by 1
  - Verify toast notification appears
  - Click "Opt In" again (should show 409 error)
  - Test with Personal jackpot (registration count stays 1)

## Phase 4: US4 - Opt-Out from Jackpot (Day 8)

**Acceptance Criteria:** AC5 - Opt-out succeeds, registration count decreases, button changes
**Independent Test:** Click "Opt Out" → Confirm → Button changes to "Opt In" → Registration count -1

### Backend

- [X] **T029** [US4] Create OptOutJackpotCommand in Application\Features\Jackpots\Commands\OptOut\OptOutJackpotCommand.cs
  - Define record with UserId (string), JackpotTemplateId (int)
  - Implement IRequest&lt;OptOutJackpotResponse&gt;
  - Add XML documentation

- [X] **T030** [US4] Implement OptOutJackpotCommandHandler in Application\Features\Jackpots\Commands\OptOut\OptOutJackpotCommandHandler.cs
  - Inject ISmarticoJackpotApiClient, ICacheService, IProgressBroadcaster, ILogger
  - Validate user is currently opted in (check API client)
  - Call API client OptOutAsync method
  - Invalidate cache for affected user ("jackpots:{userId}")
  - Broadcast JackpotPoolUpdated event via SignalR (registration count changed)
  - Return OptOutJackpotResponse with updated jackpot details
  - Handle not-opted-in error (return 409 Conflict)

- [X] **T031** [US4] Create OptOutJackpotCommandValidator in Application\Features\Jackpots\Commands\OptOut\OptOutJackpotCommandValidator.cs
  - Validate UserId not null or empty (pattern: alphanumeric 1-255)
  - Validate JackpotTemplateId is positive integer
  - Use FluentValidation AbstractValidator

- [X] **T032** [US4] Add POST /api/jackpots/{templateId}/opt-out endpoint in Api\Controllers\JackpotsController.cs
  - HttpPost route with templateId path parameter
  - Request body: { userId: string }
  - Send OptOutJackpotCommand via MediatR
  - Return 200 OK with success message
  - Return 400 if validation fails
  - Return 409 if user not opted in
  - Add Swagger documentation

### Frontend

- [X] **T033** [P] [US4] Implement JackpotService.optOut() method in frontend\src\services\jackpotService.ts
  - Add optOut(userId: string, templateId: number): Promise&lt;void&gt;
  - POST to /api/jackpots/{templateId}/opt-out with body { userId }
  - Handle 400 (validation), 409 (not opted in), 500 errors
  - Return void on success

- [X] **T034** [US4] Add opt-out button logic to JackpotCard component
  - Add handleOptOut async function
  - Show loading spinner during API call
  - Update local state optimistically (userOptedIn = false, registrationCount--)
  - Revert optimistic update on error
  - Show confirmation message
  - Disable button during loading

- [X] **T035** [US4] Add confirmation dialog for opt-out
  - Create ConfirmDialog component or use existing modal
  - Show dialog: "Are you sure? You'll stop contributing to this jackpot."
  - Buttons: "Cancel" (close dialog) and "Opt Out" (proceed)
  - Call JackpotService.optOut on confirm
  - Focus management (trap focus in dialog, return to button on close)

- [X] **T036** [US4] Test opt-out flow
  - Click "Opt Out" on opted-in jackpot
  - Verify confirmation dialog appears
  - Cancel and verify no change
  - Opt out and verify button changes to "Opt In"
  - Verify registration count decrements by 1
  - Click "Opt Out" again (should show 409 error)

## Phase 5: US6 - View Winners (Days 9-10)

**Acceptance Criteria:** AC7 - Display recent winners with positions, masked usernames, avatars
**Independent Test:** Click Winners tab → See winner list → Filter by type → See masked usernames

### Backend

- [ ] **T037** [US6] Create GetJackpotWinnersQuery in Application\Features\Jackpots\Queries\GetWinners\GetJackpotWinnersQuery.cs
  - Define record with UserId (string), FilterType (JackpotType?, optional)
  - Implement IRequest&lt;GetJackpotWinnersResponse&gt;
  - Add XML documentation

- [ ] **T038** [US6] Implement GetJackpotWinnersQueryHandler in Application\Features\Jackpots\Queries\GetWinners\GetJackpotWinnersQueryHandler.cs
  - Inject ISmarticoJackpotApiClient, ICacheService, ILogger
  - Implement 30-second caching strategy with cache key "jackpot-winners:{userId}:{filterType}"
  - Call API client GetWinnersAsync method
  - Filter by JackpotType if provided
  - Return GetJackpotWinnersResponse with list of winners
  - Handle errors gracefully

- [ ] **T039** [US6] Create GetJackpotWinnersQueryValidator in Application\Features\Jackpots\Queries\GetWinners\GetJackpotWinnersQueryValidator.cs
  - Validate UserId is not null or empty
  - Validate FilterType is valid enum value if provided
  - Use FluentValidation AbstractValidator

- [ ] **T040** [US6] Add GET /api/jackpots/winners endpoint in Api\Controllers\JackpotsController.cs
  - HttpGet route with userId and type query parameters
  - Send GetJackpotWinnersQuery via MediatR
  - Return 200 OK with winners list
  - Handle validation errors (400 Bad Request)
  - Add Swagger documentation

### Frontend

- [ ] **T041** [P] [US6] Implement JackpotService.getWinners() method in frontend\src\services\jackpotService.ts
  - Add getWinners(userId: string, filterType?: JackpotType): Promise&lt;JackpotWinner[]&gt;
  - GET from /api/jackpots/winners?userId={userId}&type={filterType}
  - Parse JSON response
  - Handle 400, 401, 500 errors

- [ ] **T042** [P] [US6] Create useJackpotWinners hook in frontend\src\hooks\useJackpotWinners.ts
  - Create custom React hook with useState and useEffect
  - Accept filterType parameter
  - Return { winners, loading, error, refetch }
  - Call JackpotService.getWinners on mount
  - Re-fetch when filterType changes

- [ ] **T043** [US6] Create WinnerCard component in frontend\src\components\WinnerCard.tsx
  - Props: winner (JackpotWinner)
  - Display: avatar, publicUsername (masked unless isMe=true), jackpotName, prizeAmount (both currencies), winningPosition, winDate
  - Position badges: 🥇 1st, 🥈 2nd, 🥉 3rd
  - Highlight current user's wins with special border/background
  - Format dates (e.g., "Nov 8, 2025")
  - Mobile-friendly card layout

- [ ] **T044** [US6] Create WinnerList component in frontend\src\components\WinnerList.tsx
  - Props: winners (JackpotWinner[]), loading, error, filterType, onFilterChange
  - Responsive layout: table on desktop, card list on mobile
  - Show loading skeleton
  - Show error state with retry button
  - Show empty state if no winners
  - Map winners to WinnerCard components

- [ ] **T045** [US6] Add Winners tab to Jackpots section
  - Create WinnerFilter component (pill buttons: "All", "MultiUser", "Personal")
  - Integrate WinnerList component
  - Connect to useJackpotWinners hook
  - Add tab navigation (Jackpots | Winners)
  - Persist filter selection in URL query params

- [ ] **T046** [US6] Test winner display with demo data
  - Navigate to Winners tab
  - Verify 10+ demo winners display
  - Verify usernames are masked (e.g., "J***n") except for current user
  - Test filter by MultiUser/Personal
  - Verify position badges (1st/2nd/3rd)
  - Verify highlighted wins (isMe=true)
  - Test responsive design

## Phase 6: US5 - Real-Time Updates (Days 11-12)

**Acceptance Criteria:** AC6 - Pool, temperature, registration count update within 2 seconds
**Independent Test:** Open two browser tabs → Opt-in in tab 1 → See registration count update in tab 2

### Backend

- [ ] **T047** [US5] Add jackpot events to IProgressBroadcaster interface in Domain\Interfaces\IProgressBroadcaster.cs
  - Add BroadcastJackpotPoolUpdatedAsync(int templateId, decimal currentPotJp, decimal currentPotUser, int registrationCount, CancellationToken ct)
  - Add BroadcastJackpotTemperatureChangedAsync(int templateId, JackPotTemperature temperature, decimal currentPot, CancellationToken ct)
  - Add BroadcastJackpotExplodedAsync(int templateId, string jackpotName, decimal finalPot, int winnerCount, CancellationToken ct)
  - Add BroadcastJackpotWinnerAnnouncedAsync(int templateId, string jackpotName, JackpotWinner winner, CancellationToken ct)

- [ ] **T048** [US5] Update ProgressHub to broadcast jackpot events in Infrastructure\SignalR\ProgressHub.cs or Infrastructure\Broadcasters\ProgressBroadcaster.cs
  - Implement new methods from IProgressBroadcaster
  - Broadcast to all clients using Clients.All.SendAsync
  - Include timestamp in all events (Unix milliseconds)
  - Throttle pool updates (max 1 per 2 seconds per jackpot)

- [ ] **T049** [US5] Broadcast pool updates from opt-in/opt-out handlers
  - In OptInJackpotCommandHandler: call BroadcastJackpotPoolUpdatedAsync after successful opt-in
  - In OptOutJackpotCommandHandler: call BroadcastJackpotPoolUpdatedAsync after successful opt-out
  - Include updated registration count in broadcast

- [ ] **T050** [US5] Implement temperature change detection and broadcast
  - Add CalculateTemperature helper method in Domain or Infrastructure
  - After pool updates, check if temperature changed
  - If temperature changed, call BroadcastJackpotTemperatureChangedAsync
  - Use threshold formula from spec (COLD/WARM/HOT/BURNING)

### Frontend

- [ ] **T051** [P] [US5] Add SignalR event handlers for jackpot updates in frontend\src\services\signalr\jackpotHub.ts
  - Extend existing SignalR service or create new JackpotSignalRService
  - Add onJackpotPoolUpdated(handler) subscription method
  - Add onJackpotTemperatureChanged(handler) subscription method
  - Add onJackpotExploded(handler) subscription method
  - Add onJackpotWinnerAnnounced(handler) subscription method
  - Auto-reconnect on disconnect with exponential backoff

- [ ] **T052** [US5] Update JackpotCard to listen for pool updates
  - In JackpotList or JackpotCard, subscribe to onJackpotPoolUpdated
  - When event received, update jackpot state (currentPotJpCurrency, currentPotUserCurrency, registrationCount)
  - Trigger count-up animation for pool amount (use react-countup library)
  - Throttle updates (max 1 per 2 seconds)

- [ ] **T053** [US5] Update TemperatureIndicator to listen for temperature changes
  - Subscribe to onJackpotTemperatureChanged
  - When event received, update temperature state
  - Add CSS transition for color change (300ms ease-out)
  - Add pulse animation for HOT/BURNING states

- [ ] **T054** [US5] Test real-time updates with multiple browser tabs
  - Open two browser tabs with Jackpots page
  - In tab 1, opt-in to MultiUser jackpot
  - Verify tab 2 sees registration count increment within 2 seconds
  - In tab 1, opt-out from jackpot
  - Verify tab 2 sees registration count decrement within 2 seconds
  - Test temperature change (simulate pool crossing threshold)
  - Verify smooth animations

## Phase 7: Demo Data & Testing (Days 13-14)

**Goal:** Comprehensive demo data covering all scenarios

- [ ] **T055** Create 5 demo jackpots in SmarticoJackpotApiClient
  - **Mega Jackpot** (MultiUser, Percentage 5%, HOT): pool=50,000, min=5,000, max=10,000, registrations=312
  - **Community Pot** (MultiUser, Fixed 10pts, WARM): pool=4,950, min=5,000, max=10,000, registrations=125
  - **Grand Prize** (MultiUser, Percentage 3%, BURNING): pool=95,000, min=50,000, max=100,000, registrations=587
  - **Personal Vault** (Personal, Fixed 5pts, COLD): pool=120, min=1,000, max=5,000, registrations=1
  - **Lucky Draw** (Personal, Percentage 2%, WARM): pool=980, min=500, max=2,000, registrations=1
  - All with realistic names, descriptions, thumbnail URLs
  - Multi-currency support (Points/Gems + USD)

- [ ] **T056** [P] Create demo opt-in records for 4 demo users
  - User A: opted in to 2 MultiUser jackpots, 1 Personal jackpot
  - User B: opted in to 1 MultiUser jackpot
  - User C: not opted in to any jackpots (new user experience)
  - User D: opted in to all jackpots
  - Store in ConcurrentDictionary&lt;string, HashSet&lt;int&gt;&gt; (userId → templateIds)

- [ ] **T057** [P] Create 10+ demo winner records with various positions (1st, 2nd, 3rd)
  - MultiUser winners from "Mega Jackpot" and "Community Pot"
  - Personal winners from "Personal Vault" and "Lucky Draw"
  - Mix of positions: 1st (🥇), 2nd (🥈), 3rd (🥉)
  - Masked usernames for non-current user (e.g., "J***n", "M***e")
  - Realistic win dates (last 30 days)
  - Various prize amounts

- [ ] **T058** Test temperature indicator colors (blue/yellow/orange/red)
  - Verify COLD jackpots show blue 🧊
  - Verify WARM jackpots show yellow ☀️
  - Verify HOT jackpots show orange 🔥
  - Verify BURNING jackpots show red 🌋
  - Check color contrast meets WCAG AA (4.5:1 minimum)

- [ ] **T059** Test contribution rate display (Fixed vs Percentage)
  - Fixed: "10 Points per bet" with 💰 icon
  - Percentage: "5% of each bet" with 📊 icon
  - Verify tooltips explain contribution clearly
  - Test with different currencies (Points, Gems)

- [ ] **T060** Test multi-currency display (base + user currency)
  - Verify pool shows: "50,000 Points" (large) and "≈ $500.00 USD" (small)
  - Test conversion ratios are realistic (0.001 to 100)
  - Verify locale formatting (commas, decimal points)
  - Test with various user currencies

- [ ] **T061** Test filter by jackpot type (MultiUser/Personal)
  - Click "MultiUser" filter → only see 3 MultiUser jackpots
  - Click "Personal" filter → only see 2 Personal jackpots
  - Click "All" filter → see all 5 jackpots
  - Verify URL updates with filter param

- [ ] **T062** Test opt-in/opt-out flows for all demo jackpots
  - Opt in to each jackpot type (MultiUser, Personal)
  - Verify registration count changes correctly
  - Opt out from each jackpot
  - Verify button states (Opt In ↔ Opt Out)
  - Test error cases (double opt-in, double opt-out)

- [ ] **T063** Verify real-time updates work across multiple tabs
  - Open 3 browser tabs
  - Opt-in in tab 1 → verify tabs 2 & 3 update
  - Opt-out in tab 2 → verify tabs 1 & 3 update
  - Check pool amount updates propagate
  - Verify temperature changes propagate
  - Test SignalR reconnection (disable network, re-enable)

## Phase 8: Polish & Documentation (Days 15-16)

**Goal:** Production-ready quality and documentation

- [ ] **T064** Add loading states to all async operations
  - Show skeleton loaders for jackpot cards during initial load
  - Show spinner on opt-in/opt-out buttons during API calls
  - Show loading overlay on winner list
  - Disable buttons during loading (prevent double-click)
  - Add aria-busy="true" for screen readers

- [ ] **T065** Add error handling with user-friendly messages
  - Network errors: "Connection lost. Retrying..." with retry button
  - Validation errors: Display specific field errors from API
  - 409 Conflict: "You're already opted in to this jackpot"
  - 404 Not Found: "Jackpot not found. It may have ended."
  - 500 Server Error: "Something went wrong. Please try again later."
  - Add error boundaries for component crashes

- [ ] **T066** Implement accessibility features (keyboard navigation, ARIA labels)
  - All buttons keyboard accessible (Tab, Enter, Space)
  - Jackpot cards navigable with arrow keys
  - Modal dialogs trap focus (Escape to close)
  - Skip links for screen readers
  - aria-label on all interactive elements
  - aria-live for dynamic updates (pool changes, notifications)
  - Proper heading hierarchy (h1 → h2 → h3)

- [ ] **T067** Test responsive design (mobile, tablet, desktop)
  - Mobile (320px-767px): 1 column, stacked layout, bottom sheet modals
  - Tablet (768px-1023px): 2 columns, larger cards
  - Desktop (1024px+): 3 columns, sidebar navigation
  - Test touch targets (min 44x44px)
  - Test horizontal scroll on tables (winner list)
  - Verify no layout shift (CLS < 0.1)

- [ ] **T068** Run Lighthouse audit (target: LCP <2.5s, FCP <1.5s)
  - Performance score > 90
  - Accessibility score = 100
  - Best Practices score > 90
  - SEO score > 90
  - Fix any issues identified
  - Optimize images (WebP, lazy loading)
  - Minimize JavaScript bundle size

- [ ] **T069** Verify WCAG 2.1 AA compliance (contrast, alt text)
  - Color contrast: 4.5:1 for normal text, 3:1 for large text
  - All images have alt text
  - Form inputs have labels
  - Error messages associated with fields
  - Run axe DevTools audit (0 violations)

- [ ] **T070** [P] Add JSDoc comments to all public APIs
  - Backend: XML documentation on all public classes, methods, properties
  - Frontend: JSDoc on all exported functions, types, components
  - Include @param, @returns, @throws annotations
  - Add examples where helpful

- [ ] **T071** [P] Update ARCHITECTURE_IMPLEMENTATION.md with Jackpot feature
  - Add new section: "Jackpot System Implementation"
  - Document entity structure (4 entities)
  - Document CQRS handlers (5 queries/commands)
  - Document API endpoints (5 endpoints)
  - Document SignalR events (4 events)
  - Add diagrams (component hierarchy, data flow)

- [ ] **T072** [P] Update IMPLEMENTATION_SUMMARY.md with completion status
  - Mark Jackpot feature as "Completed"
  - Add completion date
  - Document key achievements (74 tasks, 16-18 days)
  - List known limitations (demo data only for MVP)

- [ ] **T073** Run full test suite (dotnet test && npm test)
  - Backend: Run all unit tests, integration tests
  - Frontend: Run all component tests, hook tests
  - Target: 80%+ code coverage
  - Fix any failing tests
  - Verify 0 warnings in test output

- [ ] **T074** Verify build succeeds with 0 warnings/errors
  - Backend: dotnet build (release configuration)
  - Frontend: npm run build
  - Check bundle size (should be < 75KB gzipped for jackpot feature)
  - Verify no console errors/warnings
  - Test production build locally

## Dependencies Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (US1: View Jackpots)
    ↓
Phase 3 (US2: Opt-In) ← Can run in parallel with Phase 4
    ↓
Phase 4 (US4: Opt-Out)
    ↓
Phase 5 (US6: Winners) ← Independent, can run after Phase 2
    ↓
Phase 6 (US5: Real-Time) ← Depends on Phases 2-4
    ↓
Phase 7 (Demo Data)
    ↓
Phase 8 (Polish)
```

## Parallel Execution Opportunities

**Within US1 (View Jackpots):**
- T014-T015 (Frontend service + hook) can run in parallel with T008-T013 (Backend)

**Within US2 (Opt-In):**
- T025 (Frontend service) can run in parallel with T021-T024 (Backend)

**Within US4 (Opt-Out):**
- T033 (Frontend service) can run in parallel with T029-T032 (Backend)

**Within US6 (Winners):**
- T041-T042 (Frontend service + hook) can run in parallel with T037-T040 (Backend)

**Within US5 (Real-Time):**
- T051 (Event handlers) can run in parallel with T047-T050 (Backend events)

**Polish Phase:**
- T070-T072 (Documentation) can run in parallel with T064-T069 (Testing)

## MVP Scope (Minimum Viable Product)

**Recommended MVP:** US1 + US2 + US4 (View + Opt-In + Opt-Out)

This provides:
- ✅ View all jackpots with details
- ✅ Opt-in functionality
- ✅ Opt-out functionality
- ✅ Demo data for testing
- ✅ Complete opt-in/opt-out workflow

**Deferred for v2:**
- US6: Winner history (nice-to-have)
- US5: Real-time updates (can work with page refresh initially)
- US3, US7: Contribution/explosion handling (out of scope - handled by Smartico API)

## Task Completion Tracking

**Total Tasks: 74**
- Phase 1 (Setup): 7 tasks
- Phase 2 (US1): 13 tasks
- Phase 3 (US2): 8 tasks
- Phase 4 (US4): 8 tasks
- Phase 5 (US6): 10 tasks
- Phase 6 (US5): 8 tasks
- Phase 7 (Demo Data): 9 tasks
- Phase 8 (Polish): 11 tasks

**Parallelizable Tasks:** 16 tasks marked with [P]
**Estimated Time Savings with Parallelization:** 3-4 days

## Notes

- All backend tasks follow Clean Architecture + CQRS pattern
- All frontend tasks use TypeScript strict mode
- Demo data uses same in-memory pattern as Levels feature
- Real-time updates reuse existing SignalR infrastructure
- No new infrastructure projects required
- Build must succeed with 0 warnings/errors

---

**Ready to implement!** Run `/speckit.implement` to execute these tasks.
