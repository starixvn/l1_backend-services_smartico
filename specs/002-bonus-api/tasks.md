# Bonus Management - Task Breakdown

**Epic:** Bonus Management Feature
**Sprint:** Sprint 1-2 (4 weeks)
**Created:** 2024-11-08
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

**Goal:** Enable users to view and claim bonuses issued by Smartico platform with real-time updates and self-service claiming.

**Business Value:**
- 70% reduction in support overhead
- 15% increase in user engagement
- 85%+ bonus claim rate within 24 hours
- Improved user trust through transparency

**Success Criteria:**
- Bonus list loads < 1.5s (p95)
- Claim completes < 3s (p95)
- 95% claim success rate on first attempt
- WCAG 2.1 AA compliance
- 80%+ test coverage

## User Stories

From spec.md, organized by priority:

- **[US1]** View Available Bonuses (Critical, FR-1)
- **[US2]** Claim Redeemable Bonuses (Critical, FR-2)
- **[US3]** Handle Failed Claims with Retry (High, FR-3)
- **[US4]** Real-Time Bonus Updates (High, FR-4)
- **[US5]** Bonus Filtering and Display Rules (Medium, FR-5)

## Implementation Strategy

**MVP Scope (Week 1-2):** US1 + US2 + US5 (View, Claim, Filter)
**Phase 2 (Week 3):** US3 + US4 (Retry, Real-time)
**Phase 3 (Week 4):** Testing, Documentation, Deployment

**Parallel Execution:**
- Backend (Phase 2-5) and Frontend (Phase 6) can overlap after API contracts defined
- Multiple [P] tasks within same phase can run concurrently

---

## Task List

### Phase 1: Domain Layer (Bonus-Specific) (Day 1) [US5]

**Note:** Building on existing Missions & Badges infrastructure - reusing Serilog, JWT, CORS, SignalR, MemoryCacheService patterns

- [ ] T001 [CQ] Add Bonus-specific projects to existing solution: Create `Smartico.Bonus.Domain`, `Smartico.Bonus.Application`, `Smartico.Bonus.Infrastructure` at `F:\Projects\smartico\backend\src\` (reuse existing Smartico.Gamification.Api)
- [ ] T002 [P] [CQ] Configure .NET 9, C# 13, nullable reference types in Bonus project .csproj files (copy settings from Smartico.Missions.* projects)
- [ ] T003 [P] [DV] Update existing `backend/src/Smartico.Gamification.Api/appsettings.json` with Smartico Bonus API section: BonusApiKey, BonusBaseUrl (reuse logging, JWT, CORS, cache from Missions)
- [ ] T004 [P] [DV] Update `appsettings.Development.json` with localhost Bonus API configuration

---

### Phase 2: Domain Layer - Entities & Interfaces (Day 1 continued) [US5]

**User Story US5:** Bonus Filtering and Display Rules

- [ ] T005 [CQ] [US5] Create BonusStatus enum in `Smartico.Bonus.Domain/Enums/BonusStatus.cs` with values: New=1, Issued=2, Claimed=3, RedeemFailed=4, IssueFailed=5, Expired=6
- [ ] T006 [P] [CQ] [US5] Create BonusType enum in `Smartico.Bonus.Domain/Enums/BonusType.cs` with WelcomeBonus, DepositBonus, FreeSpins, CashBack, Reload, VIPBonus
- [ ] T007 [CQ] [US1] [US5] Create Bonus entity in `Smartico.Bonus.Domain/Entities/Bonus.cs` with properties: Id, Name, Description, ImageUrl, Status, Amount, Currency, ExpiresAt, IsRedeemable, CreatedAt, RedeemedAt, TemplateMetadata
- [ ] T008 [P] [CQ] [US2] Create ClaimResult entity in `Smartico.Bonus.Domain/Entities/ClaimResult.cs` with Success, ErrorCode, ErrorMessage, BonusId
- [ ] T009 [CQ] Create ISmarticoBonusApiClient interface in `Smartico.Bonus.Domain/Interfaces/ISmarticoBonusApiClient.cs` with GetBonusesAsync, ClaimBonusAsync methods
- [ ] T010 [P] [CQ] [US4] Create IBonusProgressBroadcaster interface in `Smartico.Bonus.Domain/Interfaces/IBonusProgressBroadcaster.cs` with BroadcastBonusIssuedAsync, BroadcastBonusClaimedAsync, BroadcastBonusExpiredAsync
- [ ] T011 [TY] [US1] Create TypeScript types in `frontend/src/types/bonus.ts`: Bonus interface, BonusStatus enum, BonusType enum, ClaimResult interface (mirror C# types)
- [ ] T012 [TS] [US5] Write unit tests for Bonus entity validation in `Smartico.Bonus.Domain.Tests/Entities/BonusTests.cs` (AAA pattern, single assertions)
- [ ] T013 [P] [TS] [US2] Write unit tests for ClaimResult entity in `Smartico.Bonus.Domain.Tests/Entities/ClaimResultTests.cs`

---

### Phase 3: Infrastructure Layer - API Client & Caching (Day 2-4) [US1] [US2]

**Note:** Most infrastructure already exists from Missions & Badges - only creating Bonus-specific implementations

**User Story US1:** View Available Bonuses
**User Story US2:** Claim Redeemable Bonuses

**Infrastructure Components (Reused from Missions - Already Done):**
- [x] Polly retry/timeout policies pattern (copy from `Smartico.Missions.Infrastructure`)
- [x] MemoryCacheService pattern with TTL support (copy from `Smartico.Missions.Infrastructure/Caching`)
- [x] Typed HttpClient registration pattern (copy from `Smartico.Missions.Infrastructure/DependencyInjection.cs`)
- [x] SignalR infrastructure and hub pattern (copy from `Smartico.Missions.Api/Hubs/ProgressHub.cs`)

**New Bonus-Specific Tasks:**
- [ ] T014 [CQ] [US1] Create SmarticoBonusApiClient in `Smartico.Bonus.Infrastructure/SmarticoApi/SmarticoBonusApiClient.cs` implementing ISmarticoBonusApiClient (adapt from MissionsApiClient pattern)
- [ ] T015 [CQ] [US1] Configure Bonus-specific HttpClient with base URL, headers (X-API-Key, X-Brand-Key)
- [ ] T016 [CQ] [US1] [US5] Implement GetBonusesAsync method with JSON deserialization and status filtering (only return statuses 2, 3, 4)
- [ ] T017 [CQ] [US2] Implement ClaimBonusAsync method with POST request and error handling
- [ ] T018 [CQ] Create SmarticoBonusApiOptions in `Smartico.Bonus.Infrastructure/Configuration/SmarticoBonusApiOptions.cs` with ApiKey, BrandKey, BaseUrl, TimeoutSeconds
- [ ] T019 [CQ] [US4] Create SignalRBonusProgressBroadcaster in `Smartico.Bonus.Infrastructure/SignalR/SignalRBonusProgressBroadcaster.cs` implementing IBonusProgressBroadcaster (adapt from ProgressBroadcaster pattern)
- [ ] T020 [CQ] [US4] Implement BroadcastBonusIssuedAsync using IHubContext<BonusHub>.Clients.Group($"user:{userId}").SendAsync("BonusIssued", bonus)
- [ ] T021 [P] [CQ] [US4] Implement BroadcastBonusClaimedAsync with event name "BonusClaimed"
- [ ] T022 [P] [CQ] [US4] Implement BroadcastBonusExpiredAsync with event name "BonusExpired"
- [ ] T023 [CQ] Create DependencyInjection.cs in `Smartico.Bonus.Infrastructure/DependencyInjection.cs` with AddBonusInfrastructure extension method (copy pattern from Missions)
- [ ] T024 [CQ] Register ISmarticoBonusApiClient as typed HttpClient with Polly policies in DependencyInjection (reuse existing Polly setup)
- [ ] T025 [P] [CQ] Reference shared MemoryCacheService from Missions.Infrastructure (or copy if needed for isolation)
- [ ] T026 [P] [CQ] [US4] Register IBonusProgressBroadcaster as singleton with SignalRBonusProgressBroadcaster in DependencyInjection
- [ ] T027 [P] [CQ] Configure IOptions<SmarticoBonusApiOptions> in DependencyInjection
- [ ] T028 [TS] [US1] Write unit tests for SmarticoBonusApiClient.GetBonusesAsync in `Smartico.Bonus.Infrastructure.Tests/SmarticoApi/SmarticoBonusApiClientTests.cs` (copy test pattern from Missions)
- [ ] T029 [P] [TS] [US2] Write unit tests for SmarticoBonusApiClient.ClaimBonusAsync (verify retry policy, error handling)
- [ ] T030 [P] [TS] [US4] Write unit tests for SignalRBonusProgressBroadcaster (mock IHubContext, verify SendAsync called with correct group)

---

### Phase 4: Application Layer - CQRS (Day 5-7) [US1] [US2] [US3]

**User Story US1:** View Available Bonuses
**User Story US2:** Claim Redeemable Bonuses
**User Story US3:** Handle Failed Claims with Retry

- [ ] T034 [CQ] [US1] Create GetBonusesQuery in `Smartico.Bonus.Application/Queries/GetBonusesQuery.cs` with UserId property
- [ ] T035 [CQ] [US1] Create GetBonusesQueryHandler in `Smartico.Bonus.Application/Queries/GetBonusesQueryHandler.cs` implementing IRequestHandler<GetBonusesQuery, IEnumerable<Bonus>>
- [ ] T036 [CQ] [US1] Implement Handle method with caching: check cache → call API if miss → store with 30s TTL → return bonuses
- [ ] T037 [CQ] [US1] Inject ISmarticoBonusApiClient and ICacheService via constructor in GetBonusesQueryHandler
- [ ] T038 [P] [CQ] [US1] Create GetBonusByIdQuery in `Smartico.Bonus.Application/Queries/GetBonusByIdQuery.cs` with UserId and BonusId properties
- [ ] T039 [P] [CQ] [US1] Create GetBonusByIdQueryHandler in `Smartico.Bonus.Application/Queries/GetBonusByIdQueryHandler.cs` with caching logic
- [ ] T040 [CQ] [US2] Create ClaimBonusCommand in `Smartico.Bonus.Application/Commands/ClaimBonusCommand.cs` with UserId and BonusId properties
- [ ] T041 [CQ] [US2] Create ClaimBonusCommandHandler in `Smartico.Bonus.Application/Commands/ClaimBonusCommandHandler.cs` implementing IRequestHandler<ClaimBonusCommand, ClaimResult>
- [ ] T042 [CQ] [US2] Implement Handle method: check bonus status (idempotency) → call API → invalidate cache pattern "bonus:{userId}*" → broadcast BonusClaimed event → return ClaimResult
- [ ] T043 [CQ] [US2] Inject ISmarticoBonusApiClient, ICacheService, IBonusProgressBroadcaster via constructor in ClaimBonusCommandHandler
- [ ] T044 [CQ] [US3] Create RetryClaimCommand in `Smartico.Bonus.Application/Commands/RetryClaimCommand.cs` (identical to ClaimBonusCommand)
- [ ] T178 [CQ] [US3] Create RetryClaimCommandHandler in `Smartico.Bonus.Application/Commands/RetryClaimCommandHandler.cs` (reuse ClaimBonusCommand logic)
- [ ] T035 [SC] [US2] Create ClaimBonusCommandValidator in `Smartico.Bonus.Application/Validators/ClaimBonusCommandValidator.cs` using FluentValidation (BonusId > 0, UserId not empty)
- [ ] T036 [P] [SC] [US3] Create RetryClaimCommandValidator (same rules as ClaimBonusCommandValidator)
- [ ] T037 [TS] [US1] Write unit tests for GetBonusesQueryHandler in `Smartico.Bonus.Application.Tests/Queries/GetBonusesQueryHandlerTests.cs` (mock ISmarticoBonusApiClient, verify cache hit/miss, AAA pattern)
- [ ] T038 [P] [TS] [US1] Write unit test: should_return_cached_bonuses_when_cache_hit (verify API not called)
- [ ] T039 [P] [TS] [US1] Write unit test: should_call_api_and_cache_when_cache_miss (verify SetAsync called with 30s TTL)
- [ ] T040 [TS] [US2] Write unit tests for ClaimBonusCommandHandler in `Smartico.Bonus.Application.Tests/Commands/ClaimBonusCommandHandlerTests.cs`
- [ ] T041 [P] [TS] [US2] Write unit test: should_claim_bonus_successfully_when_bonus_available (verify cache invalidation, broadcast)
- [ ] T042 [P] [TS] [US2] Write unit test: should_return_error_when_bonus_already_claimed (idempotency check)
- [ ] T043 [P] [TS] [US2] Write unit test: should_invalidate_cache_pattern_when_claim_succeeds (verify RemoveByPatternAsync called)
- [ ] T044 [P] [TS] [US3] Write unit tests for RetryClaimCommandHandler (verify retry logic identical to claim)

---

### Phase 5: API Layer - Controllers & SignalR (Day 11-14) [US1] [US2] [US3] [US4]

**User Story US1-4:** All API endpoints and real-time hub

- [ ] T178 [CQ] [US1] [US2] Create BonusController in `Smartico.Bonus.Api/Controllers/BonusController.cs` with [ApiController] and [Route("api/[controller]")] attributes
- [ ] T035 [CQ] [US1] [US2] Inject IMediator (MediatR) via constructor in BonusController
- [ ] T036 [CQ] [US1] Implement GET /api/bonus endpoint with userId query param, send GetBonusesQuery, return ApiResponse<IEnumerable<Bonus>>
- [ ] T037 [P] [CQ] [US1] Add [ProducesResponseType(200)], [ProducesResponseType(400)], [ProducesResponseType(401)] attributes to GET /api/bonus
- [ ] T038 [CQ] [US1] Implement GET /api/bonus/{id} endpoint with userId query param, send GetBonusByIdQuery, return ApiResponse<Bonus>
- [ ] T039 [P] [CQ] [US1] Add ProducesResponseType attributes to GET /api/bonus/{id}
- [ ] T040 [CQ] [US2] Implement POST /api/bonus/{id}/claim endpoint with userId query param, send ClaimBonusCommand, return ApiResponse<ClaimResult>
- [ ] T041 [P] [CQ] [US2] [US3] Add [ProducesResponseType(200)], [ProducesResponseType(400)], [ProducesResponseType(404)], [ProducesResponseType(500)] to POST /api/bonus/{id}/claim
- [ ] T042 [CQ] Create ApiResponse<T> model in `Smartico.Bonus.Api/Models/ApiResponse.cs` with Success, Data, Error, Timestamp properties
- [ ] T043 [P] [CQ] Add static factory methods: ApiResponse<T>.Ok(T data) and ApiResponse<T>.Fail(string error)
- [ ] T044 [CQ] [US4] Create BonusHub in `Smartico.Bonus.Api/Hubs/BonusHub.cs` extending Hub
- [ ] T178 [CQ] [US4] Override OnConnectedAsync in BonusHub to add connection to group "user:{userId}" from query string
- [ ] T035 [P] [CQ] [US4] Add SubscribeToBonusUpdates and UnsubscribeFromBonusUpdates methods in BonusHub
- [ ] T036 [CQ] Configure Program.cs: Add builder.Services.AddControllers(), builder.Services.AddSignalR(), app.MapControllers(), app.MapHub<BonusHub>("/hubs/bonus")
- [ ] T037 [CQ] Add Exception Handling Middleware in `Smartico.Bonus.Api/Middleware/ExceptionHandlingMiddleware.cs` (copy from Missions feature)
- [ ] T038 [P] [CQ] Add Request Logging Middleware in `Smartico.Bonus.Api/Middleware/RequestLoggingMiddleware.cs` (copy from Missions feature)
- [ ] T039 [SC] Configure JWT authentication in Program.cs: builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options => {...})
- [ ] T040 [SC] Add JWT OnMessageReceived event handler for SignalR WebSocket auth (extract token from query string "access_token")
- [ ] T041 [SC] Configure rate limiting in Program.cs: builder.Services.AddRateLimiter with FixedWindowRateLimiter (5 claims per minute per user)
- [ ] T042 [P] [SC] Configure CORS in Program.cs: builder.Services.AddCors with AllowedOrigins from configuration
- [ ] T043 [SC] Add authorization checks: Users can only access their own bonuses (extract userId from JWT ClaimTypes.NameIdentifier)
- [ ] T044 [TS] Write integration tests for BonusController in `Smartico.Bonus.Api.Tests/Controllers/BonusControllerIntegrationTests.cs` using WebApplicationFactory
- [ ] T178 [P] [TS] [US1] Write integration test: GET_bonuses_should_return_200_with_bonus_list (verify response structure)
- [ ] T035 [P] [TS] [US1] Write integration test: GET_bonus_by_id_should_return_404_when_not_found
- [ ] T036 [P] [TS] [US2] Write integration test: POST_claim_should_return_200_when_bonus_available
- [ ] T037 [P] [TS] [US2] Write integration test: POST_claim_should_return_400_when_bonus_already_claimed
- [ ] T038 [P] [TS] [US4] Write SignalR hub tests in `Smartico.Bonus.Api.Tests/Hubs/BonusHubTests.cs` (verify group subscription)

---

### Phase 6: Frontend - React Components (Day 15-19) [US1] [US2] [US3] [US4] [US5]

**User Story US1-5:** All frontend components and services

- [ ] T039 [TY] [US1] Create TypeScript types in `frontend/src/types.ts`: Bonus interface, BonusStatus enum, BonusType enum, ClaimResult interface, ApiResponse<T> interface
- [ ] T040 [P] [TY] [US1] Add TypeScript strict mode validation: no `any` types, all properties typed, enums with explicit values
- [ ] T041 [CQ] [US1] [US2] Create BonusService class in `frontend/src/services/api.ts` with singleton pattern
- [ ] T042 [CQ] [US1] Implement getBonuses(userId: string): Promise<Bonus[]> in BonusService using Axios
- [ ] T043 [P] [CQ] [US1] Configure Axios base URL (http://localhost:5227/api), timeout (30s), response interceptor
- [ ] T044 [CQ] [US1] Implement getBonusById(userId: string, bonusId: number): Promise<Bonus | null> in BonusService
- [ ] T178 [CQ] [US2] Implement claimBonus(userId: string, bonusId: number): Promise<ClaimResult> in BonusService
- [ ] T035 [P] [CQ] [US3] Implement retryClaimBonus method (identical to claimBonus)
- [ ] T036 [CQ] [US4] Create SignalRService in `frontend/src/services/signalr.ts` with singleton pattern
- [ ] T037 [CQ] [US4] Implement connect(userId: string): Promise<void> in SignalRService with HubConnectionBuilder
- [ ] T038 [CQ] [US4] Configure SignalR URL `/hubs/bonus?userId={userId}`, automatic reconnection (exponential backoff 2s, 4s, 8s, 16s, max 30s)
- [ ] T039 [P] [CQ] [US4] Implement onBonusIssued(handler: (bonus: Bonus) => void): void in SignalRService
- [ ] T040 [P] [CQ] [US4] Implement onBonusClaimed(handler: (bonus: Bonus) => void): void in SignalRService
- [ ] T041 [P] [CQ] [US4] Implement onBonusExpired(handler: (bonusId: number) => void): void in SignalRService
- [ ] T042 [P] [CQ] [US4] Implement disconnect(): Promise<void> in SignalRService
- [ ] T043 [UX] [US1] Create BonusCard component in `frontend/src/components/BonusCard.tsx` with TypeScript interface for props
- [ ] T044 [UX] [US1] Implement bonus information display: name (text-lg, font-semibold), description (text-sm, max 2 lines), amount (text-2xl, font-bold), expiration date
- [ ] T178 [UX] [US1] [US5] Add status badge rendering: Green "Claimed" (status 3), Blue "Available" (status 2), Red "Claim Failed" (status 4)
- [ ] T035 [P] [UX] [US1] Add promotional image with lazy loading (loading="lazy"), alt text, fallback placeholder
- [ ] T036 [UX] [US2] Add "Claim Bonus" button (blue, full width) for status 2, onClick calls onClaim prop
- [ ] T037 [P] [UX] [US2] Add "Claimed" button (gray, disabled) for status 3
- [ ] T038 [UX] [US3] Add "Retry Claim" button (yellow, full width) for status 4, onClick calls onRetry prop
- [ ] T039 [UX] [US2] [US3] Add loading state: button shows spinner and text "Claiming...", card dimmed (opacity-75), cursor wait
- [ ] T040 [UX] Apply Tailwind CSS styling: gray-50 to gray-900, blue-600, green-600, red-600, yellow-600, rounded-lg, shadow-sm, hover:shadow-lg
- [ ] T041 [UX] Ensure responsive design: mobile (320px-767px single column), tablet (768px-1023px two columns), desktop (1024px+ three columns)
- [ ] T042 [UX] [US1] Create BonusList component in `frontend/src/components/BonusList.tsx` with grid layout
- [ ] T043 [UX] [US1] Map bonuses array to BonusCard components with key={bonus.id}
- [ ] T044 [UX] [US1] Pass onClaim and onRetry handlers as props to BonusCard
- [ ] T178 [UX] [US5] Create EmptyState component in `frontend/src/components/EmptyState.tsx`
- [ ] T035 [UX] [US5] Display centered icon (gift box, gray-400, 64px), heading "No bonuses available yet", subtext with CTA links
- [ ] T036 [UX] [US1] Update App.tsx: Add bonuses state (useState<Bonus[]>), isLoading state, loadingBonusId state, error state
- [ ] T037 [UX] [US1] Add loadBonuses function in useEffect (call api.getBonuses, setBonuses, handle errors)
- [ ] T038 [UX] [US4] Add connectSignalR function in useEffect (call signalRService.connect, subscribe to events)
- [ ] T039 [UX] [US2] Add handleClaimBonus function (call api.claimBonus, update bonuses state, handle errors)
- [ ] T040 [P] [UX] [US3] Add handleRetryClaimBonus function (call api.retryClaimBonus)
- [ ] T041 [UX] [US4] Add SignalR event handlers: onBonusIssued → add to bonuses array, onBonusClaimed → update status, onBonusExpired → remove from array
- [ ] T042 [UX] [US1] Render BonusList with bonuses prop, or EmptyState if bonuses.length === 0
- [ ] T043 [UX] [US2] [US3] Pass isLoading and loadingBonusId props to BonusList → BonusCard
- [ ] T044 [UX] Add accessibility: role="region" with aria-label="Your Bonuses", aria-label for claim buttons, aria-live="polite" for success/error messages
- [ ] T178 [P] [UX] Add keyboard navigation: Tab to navigate, Enter/Space to activate claim button, Escape to close modals
- [ ] T035 [P] [UX] Add focus indicators: 2px blue outline, visible focus on all interactive elements
- [ ] T036 [TS] [US1] Write component tests for BonusCard in `frontend/src/components/__tests__/BonusCard.test.tsx` using Vitest + React Testing Library
- [ ] T037 [P] [TS] [US1] Write test: should_render_bonus_information_correctly
- [ ] T038 [P] [TS] [US2] Write test: should_call_onClaim_when_claim_button_clicked
- [ ] T039 [P] [TS] [US2] Write test: should_show_loading_state_when_isLoading_true
- [ ] T040 [P] [TS] [US1] Write component tests for BonusList
- [ ] T041 [P] [TS] [US5] Write component tests for EmptyState
- [ ] T042 [TS] [US1] Write service tests for BonusService in `frontend/src/services/__tests__/api.test.ts` (mock Axios)
- [ ] T043 [P] [TS] [US1] Write test: should_return_bonuses_when_api_call_succeeds (mock Axios.get)
- [ ] T044 [P] [TS] [US2] Write test: should_return_claim_result_when_claim_succeeds (mock Axios.post)
- [ ] T178 [P] [TS] [US4] Write service tests for SignalRService (mock HubConnection)

---

### Phase 7: Integration, Performance & E2E Testing (Day 20-22) [ALL STORIES]

- [ ] T035 [TS] Write E2E test in `frontend/e2e/bonus.spec.ts` using Playwright: User views bonuses → Clicks claim → Sees success → Status updates to "Claimed"
- [ ] T036 [P] [TS] [US3] Write E2E test: Failed claim → Retry button appears → User clicks retry → Claim succeeds
- [ ] T037 [P] [TS] [US4] Write E2E test: New bonus issued → Real-time update → Bonus appears without refresh
- [ ] T038 [PF] [US1] Measure bonus list load time with Lighthouse (target < 1.5s p95, 4G network throttling)
- [ ] T039 [P] [PF] [US2] Measure claim operation time (target < 3s p95)
- [ ] T040 [P] [PF] [US4] Measure SignalR latency from server broadcast to client event handler (target < 2s)
- [ ] T041 [PF] [US2] Load testing with k6: 100 concurrent claim requests for same bonus, verify only one succeeds (idempotency)
- [ ] T042 [P] [PF] [US1] Measure cache hit rate after 5-minute warmup (target 80%+)
- [ ] T043 [PF] Frontend bundle size check: Ensure < 250KB gzipped per route (analyze with Vite build, rollup-plugin-visualizer)
- [ ] T044 [PF] Lighthouse audit: LCP < 2.5s, FCP < 1.5s, TTI < 3.5s, CLS < 0.1, FID < 100ms
- [ ] T178 [UX] Accessibility audit with axe DevTools: 0 violations for WCAG 2.1 AA
- [ ] T035 [P] [UX] Manual keyboard navigation testing: Verify Tab, Enter, Escape work correctly
- [ ] T036 [P] [UX] Screen reader testing with NVDA: Verify bonus status announcements, loading states, success/error messages
- [ ] T037 [UX] Color contrast verification: Status badges and button text meet 4.5:1 minimum
- [ ] T038 [SC] Security audit: Verify no XSS (dangerouslySetInnerHTML not used), CSRF (JWT bearer tokens), rate limiting (5 claims/min)
- [ ] T039 [P] [SC] Dependency vulnerability scan: Run `dotnet list package --vulnerable` and `npm audit`
- [ ] T040 [PF] Fix performance bottlenecks if any found (code splitting, lazy loading, cache optimization)
- [ ] T041 [P] [PF] Optimize bundle size if > 250KB (tree-shaking, Tailwind purge)

---

### Phase 8: Documentation & Deployment (Day 23-24)

- [ ] T042 [TY] Generate OpenAPI/Swagger documentation from controller attributes (accessible at /swagger endpoint)
- [ ] T043 [P] [TY] Add XML comments to all public APIs in BonusController, BonusService, ClaimBonusCommand, GetBonusesQuery
- [ ] T044 [TY] Create API usage examples in `docs/api/bonus-api-examples.md` with curl commands
- [ ] T178 [P] [TY] Document SignalR events in `docs/signalr/bonus-hub.md`: URL, events (BonusIssued, BonusClaimed, BonusExpired), connection guide
- [ ] T035 [TY] Update README.md with Bonus Management feature description, setup instructions, environment variables
- [ ] T036 [P] [TY] Create ADR-001 in `docs/adr/001-clean-architecture-cqrs-bonus.md`: Context, Decision, Consequences
- [ ] T037 [P] [TY] Create ADR-002 in `docs/adr/002-signalr-real-time-updates.md`
- [ ] T038 [P] [TY] Create ADR-003 in `docs/adr/003-imemorycache-caching-layer.md`
- [ ] T039 [TY] Document cache strategy in `docs/caching/bonus-cache-strategy.md`: Keys, TTL, invalidation patterns
- [ ] T040 [DV] Create deployment checklist in `docs/deployment/bonus-deployment-checklist.md`: Environment vars, CORS, JWT secret, rate limits
- [ ] T041 [DV] Configure GitHub Actions CI/CD in `.github/workflows/bonus-ci.yml`: build, test, lint, security scan
- [ ] T042 [P] [DV] Add test coverage reporting to CI/CD (enforce 80% minimum)
- [ ] T043 [P] [DV] Add Lighthouse performance budgets to CI/CD
- [ ] T044 [P] [DV] Add axe accessibility audit to CI/CD
- [ ] T178 [DV] Create health check endpoint in BonusController: GET /api/bonus/health (verify Smartico API connectivity, cache availability)
- [ ] T035 [DV] Configure staging deployment: Create appsettings.Staging.json, deploy to Azure App Service or self-hosted
- [ ] T036 [P] [DV] Configure production deployment: Create appsettings.Production.json with placeholder secrets
- [ ] T037 [DV] Create rollback plan documentation in `docs/deployment/rollback-procedures.md`: Trigger conditions, rollback steps, communication
- [ ] T038 [RV] Final code review: Verify SOLID principles (SRP, DIP, ISP), AAA test pattern, single assertions, no `any` types
- [ ] T039 [P] [RV] Final constitution compliance check: Code Quality, Testing, UX, Performance, Type Safety, Security
- [ ] T040 [RV] Deployment to staging: Deploy backend and frontend, run smoke tests (health check, GET /api/bonus, SignalR connection)
- [ ] T041 [RV] QA validation in staging: Functional testing (view, claim, retry), real-time testing, accessibility testing, performance testing
- [ ] T042 [RV] Stakeholder demo: Product owner and UX designer review staging deployment
- [ ] T043 [DV] Production canary deployment: Route 10% traffic, monitor for 1 hour, verify no critical issues
- [ ] T044 [P] [DV] Production incremental rollout: Increase to 50% traffic, monitor for 2 hours
- [ ] T178 [DV] Production full rollout: Route 100% traffic, monitor for 24 hours

---

## Summary

**Total Tasks:** ~180 (reduced from 188 due to infrastructure reuse)
**Total Estimate:** 18 working days (3.5 weeks)
**Time Saved:** 6 days by reusing Missions & Badges infrastructure

**By Phase:**
- Phase 1: Domain Layer (4 tasks, 1 day) - *Reduced from 8 tasks*
- Phase 2: Domain Entities & Interfaces (9 tasks, 1 day)
- Phase 3: Infrastructure (17 tasks, 3 days) - *Reduced from 27 tasks, reusing Polly/Cache/SignalR patterns*
- Phase 4: Application Layer (22 tasks, 3 days)
- Phase 5: API Layer (27 tasks, 3 days) - *Middleware already exists, just configure*
- Phase 6: Frontend (51 tasks, 5 days)
- Phase 7: Testing & Performance (18 tasks, 3 days)
- Phase 8: Documentation & Deployment (26 tasks, 2 days)

**Infrastructure Reused (Already Done from Missions & Badges):**
- ✅ Serilog logging configuration
- ✅ JWT authentication middleware
- ✅ CORS configuration
- ✅ SignalR hub infrastructure
- ✅ Polly retry/timeout policies pattern
- ✅ MemoryCacheService with TTL support
- ✅ Exception handling middleware
- ✅ Request logging middleware

**By User Story:**
- [US1] View Available Bonuses: 45 tasks (Critical)
- [US2] Claim Redeemable Bonuses: 38 tasks (Critical)
- [US3] Handle Failed Claims with Retry: 12 tasks (High)
- [US4] Real-Time Bonus Updates: 18 tasks (High)
- [US5] Bonus Filtering and Display Rules: 8 tasks (Medium)
- No Story Label (Setup, Infrastructure, Deployment): 67 tasks

**By Constitutional Principle:**
- [CQ] Code Quality: 68 tasks
- [TS] Testing: 42 tasks
- [UX] User Experience: 24 tasks
- [PF] Performance: 12 tasks
- [TY] Type Safety & Documentation: 18 tasks
- [SC] Security: 11 tasks
- [DV] DevOps: 10 tasks
- [RV] Review/Validation: 6 tasks

**Parallel Opportunities:**
- 78 tasks marked with [P] can run in parallel with other tasks in same phase
- Backend (T001-T038) and Frontend (T039-T178) can overlap after T178 (API contracts defined)
- Multiple developers can work on different user stories simultaneously

**Critical Path:**
T001 → T009 → T018 → T178 → T178 → T039 → T035 → T042 → T040 → T043

**MVP Scope (Week 1-2):**
Focus on US1 + US2 + US5 for minimum viable product:
- View bonuses with filtering (US1, US5)
- Claim bonuses (US2)
- Skip retry logic and real-time updates for MVP
- Reduced scope: ~100 tasks, 2 weeks

**Independent Test Criteria:**
- US1: User can see list of bonuses with correct filtering (statuses 2, 3, 4 only), loads < 1.5s
- US2: User can claim bonus, success message appears, status updates to "Claimed"
- US3: User can retry failed claim, retry succeeds on second attempt
- US4: New bonus appears in list within 2 seconds without manual refresh
- US5: Bonuses with status New/IssueFailed/Expired are hidden from users

**Dependencies:**
- US2 depends on US1 (need bonus list to claim)
- US3 depends on US2 (retry is a variant of claim)
- US4 is independent (real-time updates can be added anytime)
- US5 is independent (filtering can be implemented in backend first)

---

**Last Updated:** 2024-11-08
**Status:** Not Started
