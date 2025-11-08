# Mini Games - Implementation Plan

**Version:** 1.0.0
**Created:** 2025-11-08
**Status:** Draft
**Owner:** Development Team

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [x] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards (CQRS, DIP, SRP via MediatR handlers)
- [x] **Testing Strategy:** AAA pattern with single assertions specified for all components
- [x] **UX Consistency:** Design system usage and accessibility requirements documented (following Bonus UI patterns)
- [x] **Performance:** Performance budgets and monitoring strategy defined (30s cache TTL, <200ms API responses)
- [x] **Type Safety:** TypeScript strict mode compliance plan included (all interfaces from Smartico API docs)

## Executive Summary

The Mini Games feature enables users to play interactive games (Spin the Wheel, Gift Box, Scratch Card, MatchX) and win prizes, increasing engagement and retention through gamified experiences. This feature integrates into the existing **Smartico.Missions.*** backend infrastructure using Clean Architecture + CQRS pattern, following the exact patterns established by the Missions and Bonuses features.

Users can browse available games, check buy-in requirements (points/gems/diamonds/spins), play games with real-time feedback, and win various prize types (points, bonuses, jackpots, spins, etc.). The system enforces game limits, cooldowns, and prize pool management while broadcasting real-time updates via the existing SignalR hub (`/hubs/progress`).

**Business Value**: Increased user engagement through interactive gameplay, additional monetization opportunities via buy-in costs, and enhanced retention through jackpot mechanics and daily game cycles.

## Goals & Objectives

### Primary Goals
- **G1**: Integrate Mini Games feature into existing Smartico.Missions.* projects without creating new projects
- **G2**: Support all 11 prize types with appropriate award logic and real-time notifications
- **G3**: Enforce game limits (attempt counts, cooldowns, time windows, prize pools) to prevent abuse
- **G4**: Provide real-time jackpot updates and game availability changes via SignalR
- **G5**: Maintain performance standards (<200ms API responses, <100ms SignalR latency)

### Success Metrics
- **API Performance**: GET /api/mini-games response time < 200ms (p95)
- **Play Latency**: POST /api/mini-games/{id}/play execution < 500ms (p95)
- **Prize Award Success**: 99.5%+ of prize awards complete successfully
- **Cache Hit Rate**: 80%+ for game list queries (30s TTL)
- **Real-time Latency**: SignalR events delivered within 100ms to 95%+ of clients
- **Test Coverage**: 80%+ code coverage for all business logic
- **Zero Critical Bugs**: No P0/P1 bugs in first week post-launch

## Technical Context

### Existing Infrastructure

**Backend Stack (.NET 9)**:
```
Smartico.Missions.sln
├── Smartico.Missions.Domain/         ← Add: MiniGame entities, enums, interfaces
├── Smartico.Missions.Application/    ← Add: MiniGames/ feature folder (CQRS)
├── Smartico.Missions.Infrastructure/ ← Add: SmarticoMiniGameApiClient
└── Smartico.Missions.Api/            ← Add: MiniGamesController
```

**Real-time System**:
- SignalR Hub: `/hubs/progress` (existing)
- Broadcaster: `IProgressBroadcaster` interface (existing - will extend with 5 mini game events)
- Connection: User-specific groups via `user:{userId}` pattern

**Caching Layer**:
- `IMemoryCacheService` (existing - 30s TTL pattern)
- Cache keys: `minigames:{userId}`, `minigame:{gameId}:{userId}`
- Invalidation: On play, on prize award

**Resilience**:
- Polly policies already configured for HTTP clients (3 retries, exponential backoff, 30s timeout)

**Frontend Stack (React 19 + TypeScript)**:
```
frontend/src/
├── types/minigame.ts           ← NEW: MiniGame, Prize, PlayResult types
├── services/miniGameService.ts ← NEW: API client
├── services/signalr.ts         ← UPDATE: Add mini game event handlers
├── components/MiniGameCard.tsx ← NEW: Game display component
└── components/MiniGameList.tsx ← NEW: Game list with filters
```

### Smartico API Integration

**API Reference Files**:
- `smartico-api/docs/interfaces/TMiniGameTemplate.md` (247 lines)
- `smartico-api/docs/interfaces/TMiniGamePrize.md` (245 lines)
- `smartico-api/docs/interfaces/TMiniGamePlayResult.md` (30 lines)
- `smartico-api/docs/enums/MiniGamePrizeTypeName.md` (11 prize types)

**Demo Data Approach**:
Follow same pattern as `SmarticoBonusApiClient.cs` - implement demo data with 5 sample mini games for MVP testing before integrating real Smartico API.

### Architecture Pattern

**CQRS via MediatR** (same as Bonuses):
```csharp
// Query: Get available mini games for user
GetMiniGamesQuery → GetMiniGamesQueryHandler → Cache check → API call → Cache set → Response

// Command: Play mini game
PlayMiniGameCommand → Validation → Handler → API call → Prize award → Cache invalidate → SignalR broadcast → Response
```

**Clean Architecture Layers**:
1. **Domain**: Entities (MiniGame, MiniGamePrize, PlayResult), Enums (PrizeType, GameType), Interfaces (ISmarticoMiniGameApiClient)
2. **Application**: CQRS handlers (GetMiniGamesQuery, PlayMiniGameCommand) with FluentValidation
3. **Infrastructure**: API client implementation, caching, SignalR broadcaster (extend existing)
4. **API**: MiniGamesController with endpoints

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                FRONTEND (React 19 + TypeScript)                 │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │ MissionList  │  │  BonusList    │  │  MiniGameList      │   │
│  │   (Axios)    │  │  (Fetch API)  │  │   (Fetch API)      │   │
│  └──────────────┘  └───────────────┘  └────────────────────┘   │
└───────────┬─────────────┬────────────────────┬───────────────────┘
            │             │                    │
            │ HTTP/REST   │ SignalR WebSocket  │ HTTP/REST
            │             │                    │
┌───────────▼─────────────▼────────────────────▼───────────────────┐
│          BACKEND (.NET 9 / ASP.NET Core 9)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  API Layer                                                │  │
│  │  - MissionsController (existing)                          │  │
│  │  - BonusesController (existing, CQRS)                     │  │
│  │  - MiniGamesController (NEW, CQRS via MediatR)           │  │
│  │  - ProgressHub (existing, /hubs/progress)                │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Application Layer (CQRS Handlers)                        │  │
│  │  - GetMiniGamesQueryHandler (NEW, with caching)          │  │
│  │  - PlayMiniGameCommandHandler (NEW, with validation)     │  │
│  │  - GetPrizeHistoryQueryHandler (NEW)                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Domain Layer (Entities & Interfaces)                     │  │
│  │  - MiniGame, MiniGamePrize, PlayResult (NEW entities)    │  │
│  │  - MiniGamePrizeType, GameType enums (NEW)               │  │
│  │  - IProgressBroadcaster (EXTEND with 5 mini game events) │  │
│  │  - ISmarticoMiniGameApiClient (NEW interface)            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Infrastructure Layer                                      │  │
│  │  - SignalRProgressBroadcaster (EXTEND with 5 events)     │  │
│  │  - SmarticoMiniGameApiClient (NEW, demo data)            │  │
│  │  - MemoryCacheService (existing, reuse)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 9
- Framework: ASP.NET Core 9
- Language: C# 13 (nullable reference types enabled)
- Database: N/A (API-driven, no local storage for MVP)
- Caching: In-memory (MemoryCacheService)

**Frontend:**
- Library: React 19
- Language: TypeScript 5+ (strict mode)
- State: React hooks (useState, useEffect)
- HTTP: Fetch API (same as BonusService)
- Real-time: @microsoft/signalr

**DevOps:**
- Testing: xUnit (backend), Jest + React Testing Library (frontend)
- Linting: dotnet format, ESLint
- CI/CD: GitHub Actions (if configured)
- Hosting: Local development (localhost:5227 backend, localhost:5173 frontend)

### Key Design Decisions

1. **Integration into Existing Projects**: Follow Bonuses pattern - add new feature folders under `Smartico.Missions.*` projects instead of creating separate solution. Rationale: Reduce duplication, share SignalR/caching/JWT infrastructure, maintain single API surface.

2. **CQRS via MediatR**: Use Command Query Responsibility Segregation for all mini game operations. Queries handle read operations with caching, Commands handle mutations with validation and broadcasting. Rationale: Clear separation of concerns, consistent with Bonuses implementation, better testability.

3. **Demo Data for MVP**: Implement `SmarticoMiniGameApiClient` with 5 hardcoded mini games (similar to bonus demo data) before integrating real Smartico API. Rationale: Faster MVP delivery, easier testing, no external API dependency for initial demo.

4. **Prize Award Strategy**: Each prize type (NO_PRIZE, POINTS, BONUS, etc.) handled by dedicated award logic in command handler. Bonus/Mission prizes trigger existing CQRS commands. Rationale: Type-safe handling, clear responsibility, reuse existing bonus/mission logic.

5. **Real-time Events**: Extend existing `IProgressBroadcaster` interface with 5 mini game events instead of creating new broadcaster. Rationale: Single SignalR hub for all gamification features, consistent event naming, easier client-side integration.

## Implementation Phases

### Phase 0: Research & Design (1 week)

**Duration:** 1 week
**Dependencies:** None

**Tasks:**
- [ ] Analyze Smartico API documentation for mini game data structures
- [ ] Review existing Bonuses implementation patterns (CQRS, caching, SignalR)
- [ ] Design data model for MiniGame entities
- [ ] Define API contracts (GET /api/mini-games, POST /api/mini-games/{id}/play)
- [ ] Document 11 prize types and their award logic
- [ ] Create research.md with technology decisions

**Deliverables:**
- `specs/003-mini-games/research/research.md` (technology decisions)
- `specs/003-mini-games/design/data-model.md` (entity definitions)
- `specs/003-mini-games/contracts/minigames-api.yaml` (OpenAPI spec)
- `specs/003-mini-games/quickstart.md` (developer guide)

**Constitution Compliance:**
- **Code Quality**: CQRS pattern ensures SRP, DIP via interfaces
- **Performance**: Document caching strategy (30s TTL)
- **Types**: All entities/DTOs defined with C# nullable reference types

### Phase 1: Backend Domain Layer (1 week)

**Duration:** 1 week
**Dependencies:** Phase 0

**Tasks:**
- [ ] Create `MiniGame.cs` entity (maps TMiniGameTemplate)
- [ ] Create `MiniGamePrize.cs` entity (maps TMiniGamePrize)
- [ ] Create `PlayMiniGameResult.cs` entity (maps TMiniGamePlayResult)
- [ ] Create `MiniGamePrizeType` enum (11 types)
- [ ] Create `GameType` enum (Spin/GiftBox/Scratch/MatchX)
- [ ] Create `BuyInType` enum (Free/Points/Gems/Diamonds/Spin)
- [ ] Define `ISmarticoMiniGameApiClient` interface
- [ ] Extend `IProgressBroadcaster` with 5 mini game events

**Deliverables:**
- `backend/src/Smartico.Missions.Domain/Entities/MiniGame.cs`
- `backend/src/Smartico.Missions.Domain/Entities/MiniGamePrize.cs`
- `backend/src/Smartico.Missions.Domain/Entities/PlayMiniGameResult.cs`
- `backend/src/Smartico.Missions.Domain/Enums/MiniGamePrizeType.cs`
- `backend/src/Smartico.Missions.Domain/Enums/GameType.cs`
- `backend/src/Smartico.Missions.Domain/Enums/BuyInType.cs`
- `backend/src/Smartico.Missions.Domain/Interfaces/ISmarticoMiniGameApiClient.cs`
- Updated `IProgressBroadcaster.cs` (add 5 methods)

**Constitution Compliance:**
- **Type Safety**: All entities use C# nullable reference types, XML documentation
- **Testing**: Unit tests for entity validation logic (if any)
- **Code Quality**: Clear naming, single responsibility per entity

### Phase 2: Backend Application Layer (CQRS) (1.5 weeks)

**Duration:** 1.5 weeks
**Dependencies:** Phase 1

**Tasks:**
- [ ] Create `GetMiniGamesQuery.cs` and handler with caching logic
- [ ] Create `PlayMiniGameCommand.cs` and handler with validation
- [ ] Create `GetPrizeHistoryQuery.cs` and handler (optional for MVP)
- [ ] Implement FluentValidation for `PlayMiniGameCommand`
- [ ] Implement 11 prize type award strategies in command handler
- [ ] Add cache invalidation logic on game play
- [ ] Add SignalR broadcast calls for game events
- [ ] Register MediatR handlers in Application DI

**Deliverables:**
- `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/GetMiniGames.cs`
- `backend/src/Smartico.Missions.Application/Features/MiniGames/Commands/PlayMiniGame.cs`
- `backend/src/Smartico.Missions.Application/Features/MiniGames/Validators/PlayMiniGameCommandValidator.cs`
- Unit tests for all handlers (AAA pattern, single assertions)

**Constitution Compliance:**
- **Testing**: 80%+ coverage, AAA pattern, single assert per test
- **Code Quality**: CQRS handlers follow SRP, clean function sizes (<20 lines)
- **Performance**: Caching implemented with 30s TTL

### Phase 3: Backend Infrastructure Layer (1 week)

**Duration:** 1 week
**Dependencies:** Phase 1

**Tasks:**
- [ ] Create `SmarticoMiniGameApiClient.cs` with demo data (5 games)
- [ ] Implement demo prize pool management (in-memory deduction)
- [ ] Implement demo jackpot system (increment on play)
- [ ] Extend `SignalRProgressBroadcaster.cs` with 5 mini game methods
- [ ] Register `ISmarticoMiniGameApiClient` in Infrastructure DI
- [ ] Configure Polly retry policies for HTTP client
- [ ] Add appsettings configuration for mini game API

**Deliverables:**
- `backend/src/Smartico.Missions.Infrastructure/SmarticoApi/SmarticoMiniGameApiClient.cs`
- Updated `SignalRProgressBroadcaster.cs`
- Updated `DependencyInjection.cs` (Infrastructure)
- Updated `appsettings.json` (API configuration)

**Constitution Compliance:**
- **Code Quality**: DIP via interface, factory pattern if needed
- **Performance**: Polly resilience (3 retries, exponential backoff)
- **Testing**: Integration tests for API client with mock HTTP responses

### Phase 4: Backend API Layer (Controller) (1 week)

**Duration:** 1 week
**Dependencies:** Phase 2, Phase 3

**Tasks:**
- [ ] Create `MiniGamesController.cs` with 2 endpoints
- [ ] Implement `GET /api/mini-games?userId={userId}` (dispatches query)
- [ ] Implement `POST /api/mini-games/{id}/play?userId={userId}` (dispatches command)
- [ ] Add XML documentation for Swagger
- [ ] Add rate limiting considerations (if needed)
- [ ] Update Swagger configuration to include mini games endpoints
- [ ] Update Program.cs if needed (should auto-discover controller)

**Deliverables:**
- `backend/src/Smartico.Missions.Api/Controllers/MiniGamesController.cs`
- Integration tests for endpoints (WebApplicationFactory pattern)
- Updated Swagger docs

**Constitution Compliance:**
- **Testing**: Integration tests covering all endpoints, error cases
- **Performance**: <200ms GET, <500ms POST (verified via tests)
- **Code Quality**: Controller only dispatches to MediatR, no business logic

### Phase 5: Frontend Types & Services (1 week)

**Duration:** 1 week
**Dependencies:** Phase 4

**Tasks:**
- [ ] Create `types/minigame.ts` with TypeScript interfaces
- [ ] Create `MiniGameService.ts` with API methods
- [ ] Extend `signalr.ts` with 5 mini game event handlers
- [ ] Implement error handling and retry logic
- [ ] Add TypeScript strict mode compliance
- [ ] Write unit tests for service methods

**Deliverables:**
- `frontend/src/types/minigame.ts`
- `frontend/src/services/miniGameService.ts`
- Updated `frontend/src/services/signalr.ts`
- Unit tests for services

**Constitution Compliance:**
- **Type Safety**: TypeScript strict mode, no `any` types
- **Testing**: Jest tests with AAA pattern
- **Code Quality**: Clear naming, single responsibility per service method

### Phase 6: Frontend UI Components (1.5 weeks)

**Duration:** 1.5 weeks
**Dependencies:** Phase 5

**Tasks:**
- [ ] Create `MiniGameCard.tsx` component (game display)
- [ ] Create `MiniGameList.tsx` component with filters
- [ ] Add real-time event listeners (SignalR integration)
- [ ] Implement loading states for async operations
- [ ] Add error handling UI (toasts or alerts)
- [ ] Add game play animation/feedback
- [ ] Update `App.tsx` with Mini Games tab
- [ ] Style components following design system
- [ ] Test responsive layouts (mobile, tablet, desktop)

**Deliverables:**
- `frontend/src/components/MiniGameCard.tsx`
- `frontend/src/components/MiniGameList.tsx`
- `frontend/src/components/GamePlayModal.tsx` (optional)
- Updated `App.tsx`
- React Testing Library tests for components

**Constitution Compliance:**
- **UX Consistency**: Follow existing Bonus card design patterns
- **Accessibility**: WCAG AA, keyboard navigation, ARIA labels
- **Testing**: Component tests with user event simulation
- **Performance**: Lazy loading, optimized re-renders

### Phase 7: Integration Testing & Demo (1 week)

**Duration:** 1 week
**Dependencies:** Phase 6

**Tasks:**
- [ ] End-to-end test: Browse games, play game, win prize
- [ ] Test all 11 prize types award correctly
- [ ] Test game limits (cooldowns, attempt counts, prize pool depletion)
- [ ] Test real-time updates across multiple browser tabs
- [ ] Performance testing (API response times, SignalR latency)
- [ ] Accessibility audit (Lighthouse, axe)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Create demo video showing all features
- [ ] Update documentation (README, API docs)

**Deliverables:**
- E2E test suite (Playwright or Cypress)
- Performance test results
- Accessibility audit report
- Demo video
- Updated documentation

**Constitution Compliance:**
- **Testing**: E2E coverage for critical user journeys
- **Performance**: Verify <200ms API, <100ms SignalR metrics
- **Accessibility**: WCAG AA compliance verified
- **Documentation**: Complete API docs, user guide

## Testing Strategy

### Unit Testing

**Backend (xUnit + FluentAssertions):**
- **Coverage Target:** 80% minimum, 100% for prize award logic
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `MethodName_Should_ExpectedBehavior_When_StateUnderTest`
- **Tools:** xUnit, FluentAssertions, Moq (for mocking dependencies)
- **Focus Areas:**
  - CQRS handler logic (query caching, command validation)
  - Prize award strategies (all 11 types)
  - Game limit enforcement (cooldowns, attempt counts)
  - Cache invalidation logic

**Example:**
```csharp
[Fact]
public async Task Handle_Should_ReturnCachedMiniGames_When_CacheHit()
{
    // Arrange
    var cachedGames = new List<MiniGame> { CreateMockGame() };
    _mockCache.Setup(x => x.GetAsync<List<MiniGame>>("minigames:user1", default))
               .ReturnsAsync(cachedGames);
    var query = new GetMiniGamesQuery("user1");

    // Act
    var result = await _handler.Handle(query, default);

    // Assert
    result.MiniGames.Should().BeEquivalentTo(cachedGames);
}
```

**Frontend (Jest + React Testing Library):**
- **Coverage Target:** 80% minimum
- **Pattern:** AAA with single assertion
- **Focus Areas:**
  - Service method error handling
  - Component rendering with different game states
  - Real-time event handling

### Integration Testing

**Backend (WebApplicationFactory):**
- **Scope:** API endpoints, MediatR pipeline, caching, SignalR
- **Tools:** xUnit, WebApplicationFactory, FluentAssertions
- **Coverage:**
  - `GET /api/mini-games` returns 200 with game list
  - `POST /api/mini-games/{id}/play` returns 200 with prize
  - Error cases (invalid userId, insufficient balance, game not found)
  - Cache behavior (hit/miss scenarios)

**Frontend:**
- **Scope:** API service integration, SignalR connection
- **Tools:** Jest, MSW (Mock Service Worker)
- **Coverage:**
  - Fetch game list from API
  - Play game and handle response
  - SignalR reconnection logic

### End-to-End Testing

**Scope:** Critical user journeys only
- **Tools:** Playwright (preferred) or Cypress
- **Coverage:**
  1. User browses mini games → sees 5 games with details
  2. User plays free game → wins NO_PRIZE → sees "Better luck next time"
  3. User plays points game → wins POINTS prize → balance updates
  4. User plays jackpot game → wins JACKPOT → jackpot resets
  5. User exceeds attempt limit → sees "over limit" message
  6. Real-time update: User plays in tab 1 → jackpot updates in tab 2

### Performance Testing

**Backend Load Testing:**
- **Tool:** k6 or Apache JMeter
- **Scenarios:**
  - 100 concurrent users fetching game list (target: <200ms p95)
  - 50 concurrent users playing games (target: <500ms p95)
  - Sustained load for 5 minutes to test cache efficiency

**Frontend Performance:**
- **Tool:** Lighthouse CI
- **Targets:**
  - FCP: < 1.5s
  - LCP: < 2.5s
  - TTI: < 3.5s
  - Bundle size: < 250KB gzipped

## Performance Requirements

### Backend

- **GET /api/mini-games**: < 200ms (p95)
  - Cache hit: < 10ms
  - Cache miss + API call: < 200ms
- **POST /api/mini-games/{id}/play**: < 500ms (p95)
  - Play execution: < 300ms
  - Prize award + broadcast: < 200ms
- **SignalR event latency**: < 100ms from server broadcast to client receipt
- **Database queries**: N/A for MVP (no local DB)
- **Cache strategy**: 30s TTL for game list, invalidate on play

### Frontend

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Bundle size**: < 250KB gzipped per route (shared chunks OK)
- **SignalR connection**: < 2s to establish, auto-reconnect on failure

### Monitoring

- **APM Tool**: Use existing logging infrastructure (Serilog)
- **Metrics Tracked:**
  - API endpoint response times (p50, p95, p99)
  - Cache hit rate (target: 80%+)
  - SignalR connection count and latency
  - Error rates by endpoint
  - Prize award success rate (target: 99.5%+)
- **Alerting Thresholds:**
  - API p95 > 500ms → Warning
  - Error rate > 1% → Critical
  - Prize award failures → Critical (immediate investigation)

## UX/UI Specifications

### Design System Compliance

**Components Used (from existing patterns):**
- Card component (follow `BonusCard.tsx` pattern)
- Button component (primary, secondary, disabled states)
- Badge component (status indicators, prize types)
- Loading spinner (during async operations)
- Tab navigation (Missions | Bonuses | Mini Games)

**Custom Components:**
- `MiniGameCard`: Game display with thumbnail, buy-in, jackpot, cooldown timer
- `MiniGameList`: Grid layout with filters and stats
- `GamePlayModal`: Animated play result (optional for MVP)

**Design Tokens:**
- Colors: Use existing color palette (green for success, red for errors, blue for info)
- Typography: Font family, sizes, weights from existing design system
- Spacing: 4px grid system (margin, padding)
- Border radius: 8px for cards, 4px for buttons

### Accessibility Requirements

- **WCAG Level**: AA compliance
- **Keyboard Navigation:**
  - Tab order: Filters → Game cards → Play buttons
  - Enter/Space to activate buttons
  - Escape to close modals
- **Screen Reader:**
  - ARIA labels for all interactive elements
  - Live regions for real-time updates (`aria-live="polite"`)
  - Descriptive alt text for game thumbnails
- **Color Contrast:**
  - Text on backgrounds: 4.5:1 minimum
  - Button text: 4.5:1 minimum
  - Icons: 3:1 minimum
- **ARIA Attributes:**
  - `role="button"` for clickable cards
  - `aria-disabled="true"` for unavailable games
  - `aria-label` for icon-only buttons (e.g., "Refresh games")

### Responsive Breakpoints

- **Mobile (320px - 767px):**
  - Single column grid
  - Full-width cards
  - Stacked filters (vertical)
  - Touch-friendly button sizes (min 44x44px)
- **Tablet (768px - 1023px):**
  - Two-column grid
  - Horizontal filter row
- **Desktop (1024px+):**
  - Three-column grid
  - Horizontal filter row with stats
  - Hover states for cards

### Loading States

- **Game List Loading:**
  - Show skeleton cards (3 placeholders)
  - Duration: Until API response or 3s timeout
- **Play Button Loading:**
  - Disable button, show spinner icon
  - Prevent double-clicks
  - Duration: Until API response or error
- **Real-time Updates:**
  - Fade-in animation for new games
  - Pulse animation for jackpot updates

### Error Handling UX

- **API Errors:**
  - Display user-friendly message (no stack traces)
  - Provide retry button
  - Example: "Unable to load games. Please try again."
- **Play Errors:**
  - Insufficient balance: "You need 100 more points to play this game"
  - Cooldown active: "Next play available in 2 hours 15 minutes"
  - Prize pool depleted: "This prize is currently out of stock"
  - Over limit: "You've reached the maximum attempts for today"

## Security Considerations

- [x] **Input Validation:** All user inputs validated (userId, gameId) in FluentValidation rules
- [x] **SQL Injection Prevention:** N/A (no SQL database for MVP)
- [x] **XSS Prevention:** React auto-escapes outputs, sanitize any HTML from API
- [x] **Authentication/Authorization:** Reuse existing JWT middleware (if implemented)
- [x] **Rate Limiting:** Leverage existing rate limiting configuration in Program.cs
- [x] **Sensitive Data:** No passwords or PII stored; game play logs sanitized
- [x] **Security Audit:** Code review focusing on prize award logic integrity

**Additional Checks:**
- Validate gameId exists before processing play
- Prevent negative balance after buy-in deduction
- Atomic prize pool updates (in-memory locking for demo data)
- Prevent prize duplication (idempotency via game play tracking)

## Deployment Strategy

### Pre-Deployment Checklist

- [ ] All unit tests passing (backend + frontend)
- [ ] All integration tests passing
- [ ] E2E critical path tests passing
- [ ] Performance benchmarks met (<200ms API, <100ms SignalR)
- [ ] Accessibility audit passed (Lighthouse score ≥90)
- [ ] Code review completed (2 approvers minimum)
- [ ] Documentation updated (README, API docs, quickstart guide)
- [ ] Monitoring configured (Serilog logs, performance metrics)
- [ ] Rollback plan documented (revert Git commit, clear cache)

### Rollout Plan

1. **Step 1: Deploy to Local Development**
   - Build backend: `dotnet build backend/Smartico.Missions.sln`
   - Build frontend: `npm run build` (frontend/)
   - Verify no warnings/errors

2. **Step 2: Smoke Testing**
   - Start backend: `dotnet run --project backend/src/Smartico.Missions.Api`
   - Start frontend: `npm run dev` (frontend/)
   - Manual testing of critical flows (view games, play game, win prize)

3. **Step 3: Performance Validation**
   - Run k6 load tests (if configured)
   - Verify p95 response times
   - Check cache hit rates in logs

4. **Step 4: Production Deployment** (Future)
   - Deploy backend to Azure App Service / AWS / Kubernetes
   - Deploy frontend to Vercel / Netlify / CDN
   - Monitor error rates and performance metrics

5. **Step 5: Post-Deployment Monitoring**
   - Watch logs for errors (first 24 hours)
   - Monitor prize award success rate
   - Check user engagement metrics (games played per session)

### Rollback Plan

**Triggers for Rollback:**
- Error rate > 5% within 1 hour of deployment
- Prize award failures > 0.5%
- API p95 response time > 1000ms
- Critical bug discovered (data loss, security vulnerability)

**Rollback Steps:**
1. Revert Git branch to previous commit
2. Rebuild and redeploy backend
3. Redeploy frontend
4. Clear cache (`IMemoryCacheService.RemoveAsync` for all mini game keys)
5. Verify rollback success via smoke tests
6. Communicate rollback to team and stakeholders

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Prize pool over-allocation (race condition) | Medium | High | Use in-memory locking in demo client; document need for distributed lock in production |
| SignalR connection failures | Medium | Medium | Auto-reconnect with exponential backoff; graceful degradation (poll API if WS fails) |
| Demo data insufficient for testing | Low | Low | Create 5 diverse games covering all prize types and scenarios |
| Performance degradation under load | Low | High | Implement caching (30s TTL), load test before launch, monitor p95 metrics |
| API dependency unavailable | Low | High | Demo data allows MVP without Smartico API; implement circuit breaker pattern |
| Jackpot calculation errors | Medium | High | Unit test jackpot logic thoroughly; add integration tests for concurrent plays |
| User exploiting game limits | Medium | Medium | Enforce limits server-side; log suspicious activity; add admin monitoring dashboard (future) |
| Real Smartico API differs from docs | High | Medium | Phase 0 research validates API contracts; implement adapter pattern for flexibility |

## Documentation Requirements

- [x] **API Documentation:** OpenAPI/Swagger auto-generated from XML comments
- [x] **Component Documentation:** JSDoc for React components, prop interfaces documented
- [x] **User Guide:** Not required for MVP (internal demo only)
- [x] **Architecture Decision Records (ADRs):** Documented in `specs/003-mini-games/research/research.md`
- [x] **README Updates:** Add Mini Games section to root README.md
- [x] **Changelog Entry:** Add entry for Mini Games MVP release
- [x] **Developer Quickstart:** `specs/003-mini-games/quickstart.md` with setup instructions

**Documentation Deliverables:**
1. `specs/003-mini-games/research/research.md` - Technology decisions and rationale
2. `specs/003-mini-games/design/data-model.md` - Entity relationships and validation rules
3. `specs/003-mini-games/contracts/minigames-api.yaml` - OpenAPI specification
4. `specs/003-mini-games/quickstart.md` - Developer setup and testing guide
5. Updated `README.md` - Add Mini Games feature to project overview
6. XML documentation in C# code for Swagger
7. JSDoc comments in TypeScript code

## Dependencies

### External Dependencies

**Backend:**
- `MediatR` v12.0+ - CQRS implementation
- `FluentValidation` v11.0+ - Command validation
- `Polly` v8.0+ - Resilience policies (already configured)
- `Microsoft.AspNetCore.SignalR` - Real-time updates (existing)
- `Serilog` - Logging (existing)

**Frontend:**
- `@microsoft/signalr` v8.0+ - Real-time client (existing)
- React 19 (existing)
- TypeScript 5+ (existing)
- TailwindCSS (if used for styling)

### Internal Dependencies

**Backend:**
- `Smartico.Missions.Domain` - Shared interfaces (IProgressBroadcaster, IMemoryCacheService)
- `Smartico.Missions.Infrastructure` - SignalR broadcaster, cache service (existing)
- `Smartico.Missions.Application` - MediatR registration (existing)

**Frontend:**
- `src/services/signalr.ts` - SignalR service (extend with mini game events)
- `src/types/` - TypeScript type definitions
- Design system components (if formalized)

### Team Dependencies

- **Design Team:** Not required (follow existing Bonus UI patterns)
- **Backend Team:** Self-contained within .NET 9 codebase
- **DevOps Team:** Not required for local MVP; needed for production deployment
- **QA Team:** Manual testing support for E2E scenarios

## Timeline

| Phase | Start Date | End Date | Duration | Owner |
|-------|-----------|----------|----------|-------|
| Phase 0: Research & Design | Week 1 | Week 1 | 1 week | Backend + Frontend Dev |
| Phase 1: Backend Domain Layer | Week 2 | Week 2 | 1 week | Backend Dev |
| Phase 2: Backend Application Layer (CQRS) | Week 3 | Week 4 (mid) | 1.5 weeks | Backend Dev |
| Phase 3: Backend Infrastructure Layer | Week 3 | Week 3 | 1 week | Backend Dev (parallel) |
| Phase 4: Backend API Layer | Week 4 (mid) | Week 5 (mid) | 1 week | Backend Dev |
| Phase 5: Frontend Types & Services | Week 5 (mid) | Week 6 (mid) | 1 week | Frontend Dev |
| Phase 6: Frontend UI Components | Week 6 (mid) | Week 8 | 1.5 weeks | Frontend Dev |
| Phase 7: Integration Testing & Demo | Week 8 | Week 9 | 1 week | Full Team |

**Total Estimated Duration:** 9 weeks (can be parallelized to ~6 weeks with dedicated backend + frontend resources)

**Milestones:**
- **Week 2:** Domain entities complete, unit tests passing
- **Week 4:** Backend API functional, integration tests passing
- **Week 6:** Frontend service layer complete
- **Week 8:** UI components complete, E2E tests passing
- **Week 9:** MVP ready for demo

## Success Criteria

The implementation is considered successful when:

1. ✅ All phases completed and all tests passing (unit, integration, E2E)
2. ✅ Performance benchmarks met:
   - GET /api/mini-games: <200ms p95
   - POST /api/mini-games/{id}/play: <500ms p95
   - SignalR events: <100ms latency
3. ✅ Accessibility audit passed (Lighthouse score ≥90, WCAG AA compliance)
4. ✅ Code review approved by 2 senior developers
5. ✅ Documentation complete (API docs, quickstart guide, README updated)
6. ✅ Demo data tested for all 11 prize types
7. ✅ Build succeeds with 0 warnings/errors (backend + frontend)
8. ✅ Real-time updates working across browser tabs (SignalR events verified)
9. ✅ Game limits enforced correctly (cooldowns, attempts, prize pool depletion)
10. ✅ No critical bugs in smoke testing phase

**MVP Definition:**
- 5 demo mini games available (covering all game types)
- All 11 prize types award correctly
- Real-time jackpot updates visible
- Game cooldowns and limits enforced
- UI matches existing Bonus design patterns
- Accessible via keyboard and screen reader

## Approval

- [ ] Technical Lead: __________ - Date: __________
- [ ] Product Owner: __________ - Date: __________
- [ ] Security Review: __________ - Date: __________ (if required)

---

**Last Updated:** 2025-11-08
**Next Review:** After Phase 0 completion (1 week)
