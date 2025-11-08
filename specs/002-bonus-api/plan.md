# Bonus Management - Implementation Plan

**Version:** 1.0.0
**Created:** 2024-11-08
**Status:** Draft
**Owner:** Development Team

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [x] **Code Quality:** Plan incorporates SOLID principles (SRP, DIP, ISP in all layers) and Clean Code standards (small functions, meaningful names, no magic numbers)
- [x] **Testing Strategy:** AAA pattern with single assertions specified in all test sections (unit, integration, E2E), 80%+ coverage target
- [x] **UX Consistency:** Tailwind CSS design system documented, WCAG 2.1 AA accessibility requirements defined, responsive breakpoints specified
- [x] **Performance:** Performance budgets defined (API < 500ms p95, LCP < 2.5s, FCP < 1.5s), monitoring strategy with Application Insights and alerts
- [x] **Type Safety:** TypeScript strict mode compliance required for frontend, C# nullable reference types enabled for backend, all public APIs documented

## Executive Summary

The Bonus Management feature enables users to view and claim bonuses issued by the Smartico platform. This implementation follows the established Clean Architecture + Vertical Slices pattern used in the Missions & Badges feature, ensuring consistency across the codebase.

The backend will be built with .NET 9 using ASP.NET Core, implementing REST API endpoints for bonus operations and SignalR for real-time updates. The frontend will use React 18+ with TypeScript in strict mode, Axios for HTTP communication, and Microsoft SignalR for WebSocket connectivity. All components will adhere to the project constitution's SOLID principles, AAA testing pattern, and performance standards.

This feature delivers immediate business value by reducing support overhead (70% reduction target), increasing user engagement (15% increase target), and improving bonus claim rates to 85%+ through a seamless self-service experience.

## Goals & Objectives

### Primary Goals
- **Self-Service Bonus Claiming:** Enable users to view and claim bonuses without support intervention
- **Real-Time Bonus Updates:** Provide immediate feedback when bonuses are issued, claimed, or expire
- **Performance Excellence:** Deliver bonus list within 1.5 seconds and complete claims within 3 seconds
- **Accessibility Compliance:** Achieve WCAG 2.1 Level AA for all bonus interfaces
- **Code Quality:** Maintain 80%+ test coverage with AAA pattern and single assertions

### Success Metrics
- **Bonus List Load Time:** < 1.5 seconds (p95) on 4G connection
- **Claim Success Rate:** 95% of claims complete successfully on first attempt
- **Support Ticket Reduction:** 70% decrease in bonus-related support requests
- **User Engagement:** 15% increase in return visits among users with unclaimed bonuses
- **Claim Rate:** 85%+ of users claim bonuses within 24 hours of issuance
- **Real-Time Latency:** Status updates appear within 2 seconds
- **Test Coverage:** 80%+ code coverage with AAA pattern compliance

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18+)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ BonusList    │  │ BonusCard    │  │ Services                  │ │
│  │ Component    │──│ Component    │  │ ├─ BonusService (Axios)   │ │
│  └──────────────┘  └──────────────┘  │ └─ SignalRService         │ │
│                                       └───────────────────────────┘ │
└────────────┬────────────────────────────────────┬───────────────────┘
             │ HTTP (REST)                        │ WebSocket (SignalR)
             ↓                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (.NET 9 API)                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Presentation Layer (Smartico.Bonus.Api)                      │  │
│  │ ├─ BonusController (REST endpoints)                          │  │
│  │ ├─ BonusHub (SignalR hub for real-time updates)              │  │
│  │ ├─ Middleware (Exception, Logging, Rate Limiting)            │  │
│  │ └─ Filters (Validation, Authorization)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Application Layer (Smartico.Bonus.Application)               │  │
│  │ ├─ Commands (ClaimBonusCommand, RetryClaimCommand)           │  │
│  │ ├─ Queries (GetBonusesQuery, GetBonusByIdQuery)              │  │
│  │ └─ Handlers (CQRS pattern implementation)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Domain Layer (Smartico.Bonus.Domain)                         │  │
│  │ ├─ Entities (Bonus, ClaimResult)                             │  │
│  │ ├─ Enums (BonusStatus, BonusType)                            │  │
│  │ └─ Interfaces (IBonusService, IBonusRepository)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Infrastructure Layer (Smartico.Bonus.Infrastructure)         │  │
│  │ ├─ BonusService (Smartico API client integration)            │  │
│  │ ├─ CacheService (IMemoryCache with 30s TTL)                  │  │
│  │ ├─ BonusProgressBroadcaster (SignalR broadcasting)           │  │
│  │ └─ DependencyInjection (Service registration)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SMARTICO API                            │
│  ├─ GET /api/bonuses (List bonuses)                                 │
│  ├─ POST /api/bonuses/{id}/claim (Claim bonus)                      │
│  └─ WebSocket events (Bonus issued, expired)                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 9.0
- Framework: ASP.NET Core 9.0
- Language: C# 13 with nullable reference types enabled
- Caching: IMemoryCache (single-instance) / Redis (distributed - future)
- Real-time: SignalR 9.0
- Logging: Serilog with structured logging
- Resilience: Polly (retry, timeout, circuit breaker policies)
- Authentication: JWT Bearer tokens

**Frontend:**
- Library: React 19.2.0
- Language: TypeScript 5.9.3 (strict mode enabled)
- Build Tool: Vite 7.1.7
- HTTP Client: Axios 1.13.1
- Real-time: @microsoft/signalr 9.0.6
- Styling: Tailwind CSS 3.4.18
- State Management: React hooks (useState, useEffect)

**DevOps:**
- Backend Testing: xUnit + Moq + FluentAssertions
- Frontend Testing: Vitest + React Testing Library (to be added)
- CI/CD: GitHub Actions (to be configured)
- API Docs: Swagger/OpenAPI
- Code Quality: SonarQube (optional), ESLint, Prettier

### Key Design Decisions

1. **Clean Architecture + Vertical Slices + CQRS**: Following the established pattern from Missions & Badges feature to ensure consistency. Each layer has clear responsibilities, with CQRS separating read and write operations for better scalability.

2. **SignalR for Real-Time Updates**: Using SignalR instead of polling for real-time bonus notifications ensures sub-2-second latency and reduces server load. User-specific groups (`user:{userId}`) enable targeted broadcasting.

3. **30-Second Cache TTL with Pattern-Based Invalidation**: Balances performance (reduced API calls) with data freshness. Cache invalidation on mutations (claim, retry) ensures users see accurate bonus states.

4. **Idempotency for Claim Operations**: Duplicate claim requests (double-click, network retry) are detected server-side to prevent double-crediting bonuses. Uses request IDs or claim status checks.

5. **Frontend Direct API Calls (No BFF)**: Following existing pattern where frontend calls backend API directly. Suitable for current scale; can introduce BFF layer later if needed.

6. **JWT Authentication with WebSocket Support**: Implements bearer token authentication for both HTTP and SignalR, with custom middleware to extract tokens from query strings for WebSocket handshake.

7. **Polly Resilience Policies**: 3-retry exponential backoff for transient failures, 30-second timeout for HTTP calls, ensuring graceful degradation when Smartico API is slow or unavailable.

## Implementation Phases

### Phase 1: Domain Layer (Bonus-Specific)
**Duration:** 1 day
**Dependencies:** Existing Missions & Badges backend infrastructure

**Tasks:**
- [ ] Add Bonus-specific projects to existing solution (Smartico.Bonus.Domain, .Application, .Infrastructure - reuse existing Smartico.Gamification.Api)
- [ ] Define domain entities (Bonus, ClaimResult) with proper C# nullable reference types
- [ ] Define domain enums (BonusStatus: New/Issued/Claimed/RedeemFailed/IssueFailed/Expired, BonusType)
- [ ] Create domain interfaces (ISmarticoBonusApiClient, IBonusProgressBroadcaster - reuse existing ICacheService)
- [ ] Implement TypeScript equivalent types for frontend (Bonus interface, BonusStatus enum)
- [ ] Update existing appsettings.json with Smartico Bonus API configuration (reuse logging, CORS, JWT from Missions)

**Deliverables:**
- Complete Bonus domain layer with all entities, enums, and interfaces
- TypeScript types ready for frontend integration

**Infrastructure Reused from Missions:**
- Serilog logging (already configured)
- CORS middleware (already configured)
- JWT authentication (already configured)
- MemoryCacheService pattern (already implemented)
- SignalR infrastructure (already configured)

**Constitution Compliance:**
- **Code Quality:** All domain entities follow SRP (single responsibility per class), interfaces follow ISP (role-specific), DIP (depend on abstractions)
- **Type Safety:** Nullable reference types enabled, all public APIs documented with XML comments
- **Testing:** Unit tests for domain entity validation logic (80% coverage target)

### Phase 2: Infrastructure Layer - Smartico API Client & Caching
**Duration:** 4 days
**Dependencies:** Phase 1

**Tasks:**
- [ ] Implement SmarticoBonusApiClient with HttpClient for GET /bonuses and POST /bonuses/{id}/claim
- [ ] Configure HttpClient with Polly retry policy (3 retries, exponential backoff)
- [ ] Configure HttpClient timeout policy (30 seconds)
- [ ] Add Smartico API authentication headers (X-API-Key, X-Brand-Key)
- [ ] Implement MemoryCacheService with pattern-based invalidation (reuse from Missions if possible)
- [ ] Define cache keys: `bonus:{userId}`, `bonus:{userId}:{id}`
- [ ] Implement cache invalidation on claim operations: RemoveByPatternAsync($"bonus:{userId}*")
- [ ] Add comprehensive error handling with custom exceptions (BonusNotFoundException, ClaimFailedException)
- [ ] Write unit tests for API client (mock HttpClient responses)
- [ ] Write unit tests for cache service (TTL expiration, pattern matching)

**Deliverables:**
- Fully functional SmarticoBonusApiClient with resilience policies
- MemoryCacheService with 30-second TTL and pattern-based invalidation
- 80%+ test coverage for infrastructure services

**Constitution Compliance:**
- **Code Quality:** HttpClient registered as typed client with DI, cache service follows single responsibility
- **Performance:** Polly retry policies prevent cascading failures, cache reduces API calls by ~90%
- **Testing:** AAA pattern with single assertions, mock HttpMessageHandler for predictable tests

### Phase 3: Application Layer - CQRS Queries & Commands
**Duration:** 3 days
**Dependencies:** Phase 2

**Tasks:**
- [ ] Create GetBonusesQuery with handler (returns IEnumerable<Bonus>)
- [ ] Create GetBonusByIdQuery with handler (returns Bonus or null)
- [ ] Create ClaimBonusCommand with handler (returns ClaimResult)
- [ ] Create RetryClaimCommand with handler (returns ClaimResult)
- [ ] Implement query handlers with caching (GetOrSetAsync pattern)
- [ ] Implement command handlers with cache invalidation after mutations
- [ ] Add FluentValidation validators for commands (BonusId > 0, UserId not empty)
- [ ] Implement idempotency check in ClaimBonusHandler (check status before claiming)
- [ ] Write unit tests for all query/command handlers (mock dependencies)
- [ ] Add integration tests for CQRS pipeline (in-memory setup)

**Deliverables:**
- Complete CQRS implementation with queries and commands
- FluentValidation rules for all commands
- 80%+ test coverage for application layer

**Constitution Compliance:**
- **Code Quality:** Each handler has single responsibility (SRP), handlers depend on abstractions (DIP)
- **Testing:** AAA pattern strictly enforced, one assertion per test (separate tests for success, failure, validation)
- **Type Safety:** All query/command DTOs fully typed with XML documentation

### Phase 4: API Layer - Controllers & SignalR Hub
**Duration:** 4 days
**Dependencies:** Phase 3

**Tasks:**
- [ ] Create BonusController with [ApiController] and [Route("api/[controller]")] attributes
- [ ] Implement GET /api/bonus endpoint (userId query param, returns ApiResponse<IEnumerable<Bonus>>)
- [ ] Implement GET /api/bonus/{id} endpoint (userId query param, returns ApiResponse<Bonus>)
- [ ] Implement POST /api/bonus/{id}/claim endpoint (userId query param, returns ApiResponse<ClaimResult>)
- [ ] Add ProducesResponseType attributes for Swagger documentation (200, 400, 401, 404, 500)
- [ ] Implement BonusHub : Hub with OnConnectedAsync adding user to group `user:{userId}`
- [ ] Add hub methods: SubscribeToBonusUpdates, UnsubscribeFromBonusUpdates
- [ ] Implement SignalRBonusProgressBroadcaster with events: BonusIssued, BonusClaimed, BonusExpired
- [ ] Configure Program.cs: AddControllers, AddSignalR, MapControllers, MapHub<BonusHub>("/hubs/bonus")
- [ ] Add exception handling middleware (reuse from Missions)
- [ ] Add request logging middleware (reuse from Missions)
- [ ] Configure JWT authentication with WebSocket support (OnMessageReceived event)
- [ ] Configure rate limiting (5 claims per minute per user using FixedWindowRateLimiter)
- [ ] Configure CORS for frontend origins
- [ ] Write integration tests for controllers (WebApplicationFactory)
- [ ] Write SignalR hub tests (HubConnection client)

**Deliverables:**
- Fully functional REST API with 3 endpoints
- SignalR hub for real-time bonus updates
- Complete middleware pipeline with auth, logging, rate limiting, CORS
- Integration tests for all endpoints

**Constitution Compliance:**
- **Code Quality:** Controller methods are thin (orchestration only), business logic in handlers
- **Security:** JWT auth, rate limiting (5/min), input validation, error messages hide internals
- **Performance:** Rate limiting prevents abuse, caching reduces DB load
- **Testing:** Integration tests verify HTTP status codes, response shapes, auth flows

### Phase 5: Frontend - React Components & Services
**Duration:** 5 days
**Dependencies:** Phase 4

**Tasks:**
- [ ] Create TypeScript types in types.ts (Bonus, BonusStatus, ClaimResult, ApiResponse)
- [ ] Create BonusService class with getBonuses, getBonusById, claimBonus methods (Axios)
- [ ] Configure Axios base URL, timeout (30s), response interceptor for errors
- [ ] Extend SignalRService with connectBonus, disconnectBonus, onBonusIssued, onBonusClaimed, onBonusExpired
- [ ] Configure SignalR HubConnection with URL `/hubs/bonus?userId={userId}`
- [ ] Configure automatic reconnection with exponential backoff (2s, 4s, 8s, 16s, max 30s)
- [ ] Create BonusList component (maps bonuses to BonusCard components)
- [ ] Create BonusCard component (displays bonus info, claim button, status badge, progress bar)
- [ ] Add loading states (isLoading, loadingBonusId) for claim operations
- [ ] Add error state management with user-friendly messages
- [ ] Implement real-time subscription handlers (update bonuses state on events)
- [ ] Add empty state component ("No bonuses available yet" with CTA)
- [ ] Apply Tailwind CSS styling (consistent with Missions/Badges design)
- [ ] Ensure responsive design (mobile 320px+, tablet 768px+, desktop 1024px+)
- [ ] Add ARIA attributes for accessibility (role, aria-label, aria-live for updates)
- [ ] Ensure keyboard navigation (Tab, Enter, Escape)
- [ ] Add focus indicators with visible outlines
- [ ] Test with screen reader (verify announcements for claim success/failure)
- [ ] Write component tests with Vitest and React Testing Library
- [ ] Write service tests with mocked Axios

**Deliverables:**
- Complete React bonus management UI with list and card components
- Fully functional API service layer with error handling
- SignalR service with real-time event subscriptions
- WCAG 2.1 AA compliant components
- Component and service tests

**Constitution Compliance:**
- **UX Consistency:** Tailwind CSS utility classes, design tokens match Missions/Badges
- **Accessibility:** WCAG AA (4.5:1 contrast, keyboard nav, screen reader, focus indicators)
- **Performance:** Code splitting, lazy loading, bundle < 250KB gzipped
- **Type Safety:** TypeScript strict mode, all props interfaces documented
- **Testing:** Component snapshot tests, interaction tests, service mocking

### Phase 6: Integration, Testing & Performance Optimization
**Duration:** 3 days
**Dependencies:** Phase 5

**Tasks:**
- [ ] End-to-end testing: User views bonuses → Claims bonus → Sees success message → Bonus status updates
- [ ] End-to-end testing: Failed claim → Retry button appears → Retry succeeds
- [ ] End-to-end testing: Real-time update arrives → UI updates without refresh
- [ ] Performance testing: Measure bonus list load time (target < 1.5s on 4G)
- [ ] Performance testing: Measure claim operation time (target < 3s on p95)
- [ ] Performance testing: Measure SignalR latency (target < 2s for updates)
- [ ] Load testing: 100 concurrent claim requests (verify no double-crediting)
- [ ] Cache hit rate analysis (target 80%+ cache hits after warmup)
- [ ] Frontend bundle size check (ensure < 250KB gzipped per route)
- [ ] Lighthouse audit (LCP < 2.5s, FCP < 1.5s, TTI < 3.5s, CLS < 0.1, FID < 100ms)
- [ ] Accessibility audit with axe DevTools (0 violations)
- [ ] Security audit: SQL injection (N/A, no DB), XSS (verify output encoding), CSRF (verify token)
- [ ] Fix any performance bottlenecks identified
- [ ] Optimize bundle size if needed (code splitting, lazy loading)
- [ ] Add monitoring: Application Insights or custom metrics for API response times

**Deliverables:**
- E2E test suite covering critical user journeys
- Performance benchmarks meeting all targets
- Security audit report with no critical issues
- Monitoring dashboard for key metrics

**Constitution Compliance:**
- **Performance:** All targets met (list < 1.5s, claim < 3s, real-time < 2s)
- **Accessibility:** WCAG AA with 0 axe violations
- **Security:** Input validation, output encoding, rate limiting, no sensitive data in errors

### Phase 7: Documentation & Deployment Preparation
**Duration:** 2 days
**Dependencies:** Phase 6

**Tasks:**
- [ ] Generate OpenAPI/Swagger documentation for all endpoints
- [ ] Add XML comments to all public APIs (controllers, services, domain)
- [ ] Create API usage examples (curl, Postman collection)
- [ ] Document SignalR events and subscription patterns
- [ ] Update README with setup instructions, environment variables, running locally
- [ ] Create ADR (Architecture Decision Record) for key design choices
- [ ] Document cache strategy and invalidation patterns
- [ ] Create deployment checklist (environment vars, CORS, JWT secret, rate limits)
- [ ] Configure CI/CD pipeline (GitHub Actions): build, test, lint, security scan
- [ ] Configure production appsettings.json (placeholder secrets)
- [ ] Create health check endpoint (verify Smartico API connectivity, cache availability)
- [ ] Create rollback plan documentation

**Deliverables:**
- Complete API documentation (Swagger UI)
- README with setup and deployment instructions
- ADR documenting architectural choices
- CI/CD pipeline configured and tested
- Health check endpoint functional

**Constitution Compliance:**
- **Type Safety:** All public APIs documented with XML comments and JSDoc
- **Testing:** CI pipeline enforces 80% coverage minimum
- **Code Quality:** CI pipeline runs linting, security scans, format checks

## Testing Strategy

### Unit Testing
- **Coverage Target:** 80% minimum, 100% for critical paths (claim operations, cache invalidation)
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming Convention:** `should_ExpectedBehavior_When_StateUnderTest`
  - Example: `should_return_bonuses_when_user_has_active_bonuses`
  - Example: `should_throw_ClaimFailedException_when_bonus_already_claimed`
- **Backend Tools:** xUnit 2.6+, Moq 4.20+, FluentAssertions 6.12+
- **Frontend Tools:** Vitest 2.0+, React Testing Library 16.0+, @testing-library/jest-dom
- **Mocking Strategy:** Use dependency injection with constructor injection, create mock factories for common dependencies

**Backend Unit Test Examples:**
```csharp
[Fact]
public async Task should_return_bonuses_when_user_has_active_bonuses()
{
    // Arrange
    var mockApiClient = new Mock<ISmarticoBonusApiClient>();
    var expectedBonuses = new List<Bonus> { CreateTestBonus(id: 1) };
    mockApiClient.Setup(x => x.GetBonusesAsync("user123")).ReturnsAsync(expectedBonuses);
    var handler = new GetBonusesQueryHandler(mockApiClient.Object, _mockCache.Object);

    // Act
    var result = await handler.Handle(new GetBonusesQuery("user123"), CancellationToken.None);

    // Assert
    result.Should().BeEquivalentTo(expectedBonuses);
}
```

**Frontend Unit Test Examples:**
```typescript
describe('BonusService', () => {
  it('should_return_bonuses_when_api_call_succeeds', async () => {
    // Arrange
    const mockBonuses = [createMockBonus({ id: 1 })];
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: mockBonuses } });
    const bonusService = new BonusService();

    // Act
    const result = await bonusService.getBonuses('user123');

    // Assert
    expect(result).toEqual(mockBonuses);
  });
});
```

### Integration Testing
- **Scope:** API endpoints with in-memory dependencies, SignalR hub connections, cache integration
- **Backend Tools:** WebApplicationFactory (ASP.NET Core), Microsoft.AspNetCore.TestHost
- **Frontend Tools:** MSW (Mock Service Worker) for API mocking
- **Coverage:** All API endpoints (GET /bonuses, GET /bonuses/{id}, POST /bonuses/{id}/claim), SignalR connection/disconnect flows

**Integration Test Examples:**
```csharp
public class BonusControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task GET_bonuses_should_return_200_with_bonus_list()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/bonus?userId=user123");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ApiResponse<IEnumerable<Bonus>>>(content);
        apiResponse.Success.Should().BeTrue();
    }
}
```

### End-to-End Testing
- **Scope:** Critical user journeys: view bonuses, claim bonus (success), claim bonus (failure + retry), real-time updates
- **Tools:** Playwright 1.45+ (preferred) or Cypress 13+
- **Coverage:**
  1. User navigates to bonuses → List loads within 1.5s → User clicks claim → Success message appears → Bonus status updates to "Claimed"
  2. User clicks claim → Error occurs → Retry button appears → User clicks retry → Claim succeeds
  3. New bonus issued via admin → Real-time event fires → New bonus appears in user's list without refresh

**E2E Test Example:**
```typescript
test('user should claim bonus successfully', async ({ page }) => {
  // Arrange
  await page.goto('/bonuses');
  await expect(page.locator('[data-testid="bonus-list"]')).toBeVisible();

  // Act
  await page.locator('[data-testid="claim-button-1"]').click();

  // Assert
  await expect(page.locator('[data-testid="success-message"]')).toContainText('Bonus claimed successfully');
  await expect(page.locator('[data-testid="bonus-status-1"]')).toContainText('Claimed');
});
```

### Performance Testing
- **API Load Testing:** k6 or Apache JMeter, target 100 requests/second sustained, verify < 200ms p95 for GET, < 500ms p95 for POST
- **Concurrent Claim Testing:** 100 simultaneous claim requests for same bonus, verify only one succeeds (idempotency check)
- **Frontend Performance:** Lighthouse CI in GitHub Actions, enforce budgets (LCP < 2.5s, FCP < 1.5s, TTI < 3.5s)
- **Cache Performance:** Measure cache hit rate after warmup period (target 80%+ hits), verify < 10ms cache retrieval time
- **SignalR Latency Testing:** Measure time from server broadcast to client event handler execution (target < 2s)

**Performance Test Script (k6):**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100, // 100 virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests must complete below 200ms
  },
};

export default function () {
  let res = http.get('http://localhost:5227/api/bonus?userId=user123');
  check(res, { 'status was 200': (r) => r.status == 200 });
}

## Performance Requirements

### Backend Performance Targets
- **GET /api/bonus (list):** < 200ms (p95), < 100ms (p50)
- **GET /api/bonus/{id} (single):** < 150ms (p95), < 75ms (p50)
- **POST /api/bonus/{id}/claim:** < 500ms (p95), < 300ms (p50)
- **SignalR latency:** < 100ms from server broadcast to client receive
- **Cache operations:** < 10ms for get/set operations
- **Smartico API calls:** < 300ms (p95) with 3-retry fallback
- **Concurrent claim handling:** Support 100 simultaneous claims without race conditions

### Frontend Performance Targets
- **First Contentful Paint (FCP):** < 1.5s on 4G (10 Mbps, 50ms latency)
- **Largest Contentful Paint (LCP):** < 2.5s (bonus list appears)
- **Time to Interactive (TTI):** < 3.5s (claim button functional)
- **Cumulative Layout Shift (CLS):** < 0.1 (no bonus card jumping)
- **First Input Delay (FID):** < 100ms (claim button responsive)
- **Bundle Size:** < 250KB gzipped per route, < 100KB for bonus components
- **Image Optimization:** Bonus images lazy loaded, WebP format with JPEG fallback

### Caching Strategy Performance
- **Cache Hit Rate:** 80%+ after 5-minute warmup period
- **Cache Invalidation Latency:** < 50ms for pattern-based removal
- **TTL Configuration:**
  - Bonus list: 30 seconds
  - Single bonus: 30 seconds
  - User claims: Invalidate immediately on mutation
- **Memory Usage:** < 100MB for cache storage (assuming 10,000 active users)

### Monitoring & Observability
- **APM Tool:** Application Insights (Azure) or Datadog
- **Metrics Tracked:**
  - API response times (p50, p95, p99) per endpoint
  - Cache hit/miss ratio
  - SignalR connection count and latency
  - Bonus claim success/failure rate
  - Error rates by exception type
  - HTTP status code distribution (2xx, 4xx, 5xx)
- **Alerting Thresholds:**
  - API p95 > 500ms for 5 minutes → Warning
  - API p95 > 1000ms for 5 minutes → Critical
  - Error rate > 5% for 2 minutes → Warning
  - Error rate > 10% for 2 minutes → Critical
  - Cache hit rate < 50% for 10 minutes → Warning
  - SignalR disconnection rate > 10% → Warning
- **Custom Events:**
  - Bonus claimed (with userId, bonusId, claim time)
  - Claim failed (with reason, retry count)
  - Cache invalidation triggered (with pattern, affected keys count)
  - Real-time update delivered (with latency measurement)

## UX/UI Specifications

### Design System Compliance
**Following Tailwind CSS utility-first approach consistent with Missions & Badges:**
- **Components Used from Existing Pattern:**
  - Card layout (border, rounded corners, shadow on hover)
  - Status badges (color-coded: green for claimed, blue for available, red for failed)
  - Progress bars (gray background with blue fill)
  - Buttons (primary blue, disabled gray, loading spinner)
  - Empty state (centered text with call-to-action links)
- **Custom Components for Bonus Feature:**
  - BonusCard: Extends MissionCard pattern with bonus-specific fields (amount, expiration, promotional image)
  - BonusList: Grid layout (1 column mobile, 2 tablet, 3 desktop)
  - ClaimButton: Primary button with loading state and disabled state
  - RetryButton: Secondary button for failed claims
- **Design Tokens (Tailwind CSS):**
  - Colors: `gray-50` to `gray-900` (neutral), `blue-600` (primary), `green-600` (success), `red-600` (error), `yellow-600` (warning)
  - Spacing: `gap-4`, `px-4`, `py-6`, `mb-3`, `mt-2`
  - Typography: `text-lg font-semibold`, `text-sm text-gray-600`, `text-xs`
  - Border Radius: `rounded-lg` (8px)
  - Shadows: `shadow-sm`, `hover:shadow-lg`

### Accessibility Requirements
- **WCAG Level:** AA (4.5:1 contrast ratio for normal text, 3:1 for large text)
- **Keyboard Navigation:**
  - Tab: Navigate through bonus cards, claim buttons, retry buttons
  - Enter/Space: Activate claim button
  - Escape: Close bonus detail modal (if implemented)
  - Arrow keys: Navigate grid (optional enhancement)
- **Screen Reader Testing:**
  - NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
  - Bonus status announcements: "Bonus available to claim", "Bonus claimed successfully", "Bonus claim failed, retry available"
  - Loading state announcements: "Claiming bonus, please wait"
  - Real-time update announcements: "New bonus available" (aria-live="polite")
- **Color Contrast Verification:**
  - Use WebAIM Contrast Checker or axe DevTools
  - Status badges meet 4.5:1 minimum
  - Button text meets 4.5:1 minimum
- **ARIA Attributes:**
  - `role="region"` for bonus list container with `aria-label="Your Bonuses"`
  - `role="button"` for claim buttons (if not using `<button>`)
  - `aria-label="Claim {bonusName}"` for claim buttons
  - `aria-live="polite"` for success/error messages
  - `aria-busy="true"` during claim operations
  - `aria-disabled="true"` for already-claimed bonuses
- **Focus Management:**
  - Visible focus indicators with 2px blue outline
  - Focus returns to claim button after modal closes
  - Focus moves to success message after claim completes

### Responsive Breakpoints
- **Mobile (320px - 767px):**
  - Single column grid layout
  - Full-width bonus cards
  - Stacked bonus information (image on top, details below)
  - Minimum touch target 44x44px for buttons
- **Tablet (768px - 1023px):**
  - Two-column grid layout
  - Bonus cards with image on left, details on right
  - Horizontal button layout
- **Desktop (1024px+):**
  - Three-column grid layout
  - Maximum container width 1280px with auto margins
  - Hover states (shadow elevation, button color change)

### Component-Specific UX Patterns
**BonusCard Component:**
- **Status Badge (top-right corner):**
  - Green badge with checkmark icon: "Claimed"
  - Blue badge: "Available"
  - Red badge with warning icon: "Claim Failed"
- **Promotional Image:**
  - Lazy loaded with `loading="lazy"`
  - Alt text: "{bonusName} promotional image"
  - Fallback gray placeholder if image fails to load
- **Bonus Information Display:**
  - Bonus name (text-lg, font-semibold)
  - Bonus description (text-sm, text-gray-600, max 2 lines with ellipsis)
  - Bonus amount (text-2xl, font-bold, colored based on type)
  - Expiration date (text-xs, text-gray-500, "Expires in 3 days" format)
- **Call-to-Action:**
  - Available bonuses: "Claim Bonus" button (blue, full width)
  - Claimed bonuses: "Claimed" button (gray, disabled, with checkmark)
  - Failed bonuses: "Retry Claim" button (yellow, full width)
- **Loading State:**
  - Button shows spinner icon and text "Claiming..."
  - Bonus card slightly dimmed (opacity-75)
  - Cursor changes to wait cursor

**Empty State:**
- Centered icon (gift box or star icon, gray-400, size 64px)
- Heading: "No bonuses available yet" (text-xl, gray-700)
- Subtext: "Complete missions, participate in tournaments, or check promotional offers to earn bonuses"
- Call-to-Action Links:
  - "Explore Missions" (blue link, routes to /missions)
  - "View Promotions" (blue link, routes to /promotions)

## Security Considerations

### Authentication & Authorization
- [ ] **JWT Bearer Token Authentication:** All API endpoints require valid JWT token in Authorization header
- [ ] **UserId Claim Extraction:** Extract userId from JWT claims (ClaimTypes.NameIdentifier) instead of query parameters (temporary solution for development)
- [ ] **Authorization Checks:** Users can only access their own bonuses (verify userId from token matches requested userId)
- [ ] **SignalR Authentication:** WebSocket handshake validates JWT token from query string or cookie
- [ ] **Token Expiration Handling:** Frontend refreshes token before expiration (60-minute TTL configured)

### Input Validation & Sanitization
- [ ] **BonusId Validation:** Verify bonusId is positive integer, reject invalid IDs with 400 Bad Request
- [ ] **UserId Validation:** Verify userId format matches expected pattern (GUID or alphanumeric)
- [ ] **FluentValidation Rules:** All command objects (ClaimBonusCommand) have validation rules enforced before handler execution
- [ ] **Query Parameter Sanitization:** Remove special characters from query params to prevent injection
- [ ] **Output Encoding:** All user-facing error messages are HTML-encoded (prevent XSS)

### Injection Prevention
- [ ] **SQL Injection:** N/A (no direct database access, using Smartico API)
- [ ] **XSS Prevention:** React automatically escapes JSX content, verify no `dangerouslySetInnerHTML` usage
- [ ] **Command Injection:** N/A (no shell commands executed)
- [ ] **LDAP Injection:** N/A (no LDAP queries)
- [ ] **JSON Injection:** Verify JSON serialization settings prevent injection (use System.Text.Json with default settings)

### Rate Limiting & Abuse Prevention
- [ ] **Global Rate Limit:** 100 requests per minute per IP (FixedWindowRateLimiter)
- [ ] **Claim-Specific Rate Limit:** 5 bonus claims per minute per userId (prevent rapid-fire claims)
- [ ] **Idempotency Check:** Duplicate claim requests within 10 seconds return cached result (prevent double-crediting)
- [ ] **Retry Limit:** Maximum 3 retry attempts for failed claims, then require support intervention
- [ ] **CAPTCHA (Future):** Add reCAPTCHA for claim operations if abuse detected

### Sensitive Data Protection
- [ ] **No Sensitive Data in Logs:** Error logs do not include JWT tokens, user passwords, or payment details
- [ ] **No Sensitive Data in Error Messages:** Client-facing errors hide internal implementation details (no stack traces, database names, API keys)
- [ ] **HTTPS Only:** All API communication over TLS 1.2+ (enforced by UseHttpsRedirection middleware)
- [ ] **Secure Headers:** Add security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Content-Security-Policy)
- [ ] **CORS Configuration:** Restrict allowed origins to specific frontend domains (no wildcard * in production)

### CSRF Protection
- [ ] **API Token-Based:** Using JWT bearer tokens (not cookies), so CSRF not applicable for API calls
- [ ] **SignalR CSRF:** SignalR connections use bearer tokens, verify no cookie-based auth
- [ ] **Future Enhancement:** If adding cookie-based auth, implement anti-forgery tokens

### Security Audit Checklist
- [ ] OWASP Top 10 Review: A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable Components, A07 Auth Failures, A08 Data Integrity Failures, A09 Logging Failures, A10 SSRF
- [ ] Dependency Vulnerability Scan: Use `dotnet list package --vulnerable` and `npm audit`
- [ ] Secrets Management: No hardcoded API keys, use Azure Key Vault or environment variables
- [ ] Penetration Testing: Optional but recommended before production release

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] **All Tests Passing:** Unit tests (80%+ coverage), integration tests (all endpoints), E2E tests (critical user journeys)
- [ ] **Performance Benchmarks Met:** API p95 < 500ms, frontend LCP < 2.5s, cache hit rate > 80%
- [ ] **Accessibility Audit Passed:** axe DevTools shows 0 violations, manual keyboard nav tested, screen reader verified
- [ ] **Code Review Completed:** All PRs approved by senior developer, constitution compliance verified
- [ ] **Documentation Updated:** OpenAPI/Swagger docs, README, ADRs, deployment guide
- [ ] **Monitoring Configured:** Application Insights dashboards, alerts for p95 > 500ms and error rate > 5%
- [ ] **Environment Variables Set:** JWT secret, Smartico API key, CORS origins, cache TTL
- [ ] **Database Migrations Applied:** N/A (no database for bonus feature)
- [ ] **Rollback Plan Documented:** Steps to revert deployment, feature flag to disable bonus feature if needed

### Environment Configuration

**Development (localhost):**
```json
{
  "Jwt": { "SecretKey": "dev-secret-min-256-bits", "ExpirationMinutes": 60 },
  "Smartico": { "ApiKey": "dev-api-key", "BrandKey": "dev-brand", "BaseUrl": "https://api-dev.smartico.ai" },
  "Cache": { "DefaultTtlSeconds": 30 },
  "Cors": { "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"] }
}
```

**Staging:**
```json
{
  "Jwt": { "SecretKey": "staging-secret-from-keyvault", "ExpirationMinutes": 60 },
  "Smartico": { "ApiKey": "staging-api-key-from-keyvault", "BrandKey": "staging-brand", "BaseUrl": "https://api-staging.smartico.ai" },
  "Cache": { "DefaultTtlSeconds": 30 },
  "Cors": { "AllowedOrigins": ["https://staging.smartico-gamification.com"] }
}
```

**Production:**
```json
{
  "Jwt": { "SecretKey": "prod-secret-from-keyvault", "ExpirationMinutes": 60 },
  "Smartico": { "ApiKey": "prod-api-key-from-keyvault", "BrandKey": "prod-brand", "BaseUrl": "https://api.smartico.ai" },
  "Cache": { "DefaultTtlSeconds": 30 },
  "Cors": { "AllowedOrigins": ["https://www.smartico-gamification.com", "https://app.smartico-gamification.com"] }
}
```

### Rollout Plan

**Phase 1: Deploy to Staging (Day 1)**
1. **Deploy Backend:** Build .NET 9 solution, publish to staging environment (Azure App Service or self-hosted)
2. **Deploy Frontend:** Build Vite production bundle, publish to staging CDN/static host (Vercel, Netlify, or Azure Static Web Apps)
3. **Smoke Testing:** Verify health check endpoint, test GET /api/bonus with test user, verify SignalR connection
4. **QA Validation:**
   - Functional testing: View bonuses, claim bonus (success), claim bonus (failure + retry)
   - Real-time testing: Trigger bonus issued event from admin, verify appears in user UI
   - Accessibility testing: Keyboard navigation, screen reader announcements
   - Performance testing: Run Lighthouse audit, verify LCP < 2.5s
5. **Stakeholder Demo:** Product owner, UX designer review staging deployment

**Phase 2: Production Deployment (Day 2)**
1. **Canary Deployment (10% traffic):**
   - Deploy backend to production environment
   - Route 10% of traffic to new bonus API endpoints
   - Monitor Application Insights for errors, p95 latency, SignalR connection count
   - Wait 1 hour, verify no critical issues
2. **Incremental Rollout (50% traffic):**
   - If canary successful, increase to 50% traffic
   - Monitor for 2 hours, verify cache hit rate > 80%, error rate < 1%
3. **Full Rollout (100% traffic):**
   - If 50% rollout successful, route 100% traffic to new endpoints
   - Monitor for 24 hours, verify all success metrics met

**Phase 3: Post-Deployment Monitoring (Day 3-7)**
1. **Monitor Dashboards:** Check Application Insights every 4 hours for first 3 days
2. **Alert Response:** Respond to alerts within 15 minutes (critical) or 1 hour (warning)
3. **User Feedback:** Monitor support tickets related to bonuses, track claim success rate
4. **Performance Analysis:** Analyze cache hit rate, API response times, bundle size
5. **Optimization:** If cache hit rate < 80%, investigate and adjust TTL; if p95 > 500ms, investigate slow queries

### Rollback Plan

**Trigger Conditions for Rollback:**
- Error rate > 10% for 5 minutes
- API p95 > 1000ms for 10 minutes
- SignalR disconnection rate > 25%
- Critical security vulnerability discovered
- Data integrity issue (duplicate bonus credits)

**Rollback Steps:**
1. **Immediate (< 5 minutes):**
   - Feature flag: Set `BonusFeatureEnabled=false` in configuration (disables bonus endpoints, hides frontend UI)
   - Traffic routing: Route 100% traffic back to previous deployment (if using canary)
2. **Backend Rollback (< 15 minutes):**
   - Revert to previous Git commit/tag
   - Redeploy previous version to production
   - Verify health check endpoint returns 200 OK
3. **Frontend Rollback (< 10 minutes):**
   - Revert frontend build to previous version
   - Purge CDN cache
   - Verify Missions & Badges still functional
4. **Communication:**
   - Notify development team via Slack/email
   - Post status update to users (if user-facing issue)
   - Document rollback reason in incident report

**Post-Rollback Actions:**
1. Root cause analysis within 24 hours
2. Fix issue in development environment
3. Re-test in staging before attempting production deployment again
4. Update deployment checklist with lessons learned

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Smartico API Downtime or Slow Response** | Medium | High | Implement Polly retry policies (3 attempts, exponential backoff). Cache bonus data with 30s TTL to serve stale data if API unavailable. Show cached data with warning message to users. |
| **Double-Crediting Bonuses Due to Idempotency Failure** | Low | Critical | Implement idempotency check in ClaimBonusHandler: verify bonus status before claiming. Use cache to store recent claim requests with 10s TTL. Add integration tests for concurrent claim scenarios. |
| **SignalR Connection Failures** | Medium | Medium | Implement automatic reconnection with exponential backoff (2s, 4s, 8s, max 30s). Fallback to 15-second polling if WebSocket fails. Display connection status indicator to users. |
| **Frontend Bundle Size Exceeds 250KB** | Low | Medium | Use code splitting for bonus routes. Lazy load bonus images. Analyze bundle with webpack-bundle-analyzer. Optimize Tailwind CSS with purge configuration. |
| **Cache Invalidation Not Working (Stale Data Shown)** | Low | Medium | Add comprehensive unit tests for pattern-based cache invalidation. Implement monitoring for cache hit rate. Add manual "Refresh" button for users if needed. |
| **JWT Token Expiration During Bonus Claim** | Medium | Low | Implement token refresh logic in frontend (refresh 5 minutes before expiration). Retry claim request with new token if 401 Unauthorized received. |
| **CORS Issues in Production** | Low | Medium | Test CORS configuration in staging with production-like domains. Add multiple allowed origins for load balancer scenarios. Document CORS setup in deployment guide. |
| **Performance Degradation with 10,000+ Concurrent Users** | Low | Medium | Implement load testing with k6 (simulate 10,000 users). Use Redis for distributed caching if single-instance cache insufficient. Enable response compression (Gzip). |
| **Accessibility Violations Discovered Post-Launch** | Low | High | Conduct axe DevTools audit before deployment. Manual keyboard nav testing. Screen reader testing with NVDA/JAWS/VoiceOver. Include accessibility in QA checklist. |
| **Security Vulnerability in Dependencies** | Medium | High | Run `dotnet list package --vulnerable` and `npm audit` in CI/CD pipeline. Set up Dependabot for automatic PR creation. Review and update dependencies monthly. |

## Documentation Requirements

### API Documentation
- [ ] **OpenAPI/Swagger Specification:** Auto-generated from controller attributes, accessible at `/swagger` endpoint
- [ ] **Endpoint Documentation:**
  - GET /api/bonus: List all bonuses for authenticated user
  - GET /api/bonus/{id}: Get single bonus by ID
  - POST /api/bonus/{id}/claim: Claim a bonus
- [ ] **Request/Response Examples:** Include curl commands and Postman collection
- [ ] **Error Codes Reference:** Document all HTTP status codes (200, 400, 401, 404, 500) with example responses
- [ ] **Authentication Guide:** Explain JWT token acquisition and usage in Authorization header

### SignalR Documentation
- [ ] **Hub URL:** `/hubs/bonus?userId={userId}`
- [ ] **Events:**
  - `BonusIssued`: Fired when new bonus issued to user (payload: Bonus object)
  - `BonusClaimed`: Fired when user claims bonus (payload: Bonus object with updated status)
  - `BonusExpired`: Fired when bonus expires (payload: Bonus ID)
- [ ] **Connection Guide:** Example code for connecting from JavaScript client
- [ ] **Reconnection Strategy:** Explain automatic reconnection with exponential backoff

### Frontend Component Documentation
- [ ] **Component Library (Storybook - Optional):** Interactive component explorer for BonusCard, BonusList
- [ ] **Props Documentation:** Document all component props with TypeScript interfaces
- [ ] **Usage Examples:** Show how to integrate bonus components into existing application

### Architecture Decision Records (ADRs)
- [ ] **ADR-001: Clean Architecture + CQRS for Bonus API**
  - Context: Need consistent architecture with Missions & Badges
  - Decision: Use Clean Architecture with CQRS pattern
  - Consequences: Better separation of concerns, more boilerplate code
- [ ] **ADR-002: SignalR for Real-Time Updates**
  - Context: Need sub-2-second latency for bonus notifications
  - Decision: Use SignalR instead of polling
  - Consequences: Better performance, requires WebSocket support
- [ ] **ADR-003: IMemoryCache for Caching Layer**
  - Context: Need 30-second caching to reduce API calls
  - Decision: Use IMemoryCache for single-instance deployment
  - Consequences: Fast cache access, limited to single server (future: Redis for multi-server)

### README Updates
- [ ] **Project Overview:** Add Bonus Management to feature list
- [ ] **Setup Instructions:**
  - Environment variables required (SMARTICO_API_KEY, JWT_SECRET, CORS_ORIGINS)
  - Running backend: `cd backend && dotnet run`
  - Running frontend: `cd frontend && npm run dev`
  - Running tests: `dotnet test` and `npm test`
- [ ] **API Endpoints:** Link to Swagger docs
- [ ] **Contributing Guide:** Update with bonus-specific conventions

### Deployment Guide
- [ ] **Environment Setup:** Document staging and production configuration
- [ ] **Secrets Management:** Explain Azure Key Vault usage for API keys
- [ ] **Health Checks:** Document `/health` endpoint usage
- [ ] **Monitoring Setup:** Explain Application Insights configuration
- [ ] **Rollback Procedures:** Step-by-step rollback instructions

### User-Facing Documentation
- [ ] **Help Center Article:** "How to View and Claim Your Bonuses"
- [ ] **FAQ Section:**
  - "Why can't I claim my bonus?" (check status, expiration, retry)
  - "How long do I have to claim a bonus?" (check expiration date)
  - "What happens if my claim fails?" (retry button, support contact)
- [ ] **Accessibility Guide:** Keyboard shortcuts, screen reader instructions

### Changelog
- [ ] **Version 2.0.0 Entry:**
  ```
  ## [2.0.0] - 2024-11-XX
  ### Added
  - Bonus Management feature with view and claim functionality
  - Real-time bonus notifications via SignalR
  - BonusCard and BonusList React components
  - Bonus API endpoints (GET /api/bonus, GET /api/bonus/{id}, POST /api/bonus/{id}/claim)
  - 30-second caching for bonus data with pattern-based invalidation
  - Retry mechanism for failed bonus claims
  - WCAG 2.1 AA compliant bonus UI
  ### Changed
  - Updated constitution compliance checklist for new feature
  ### Fixed
  - N/A (new feature)
  ```

## Dependencies

### External Dependencies (NuGet Packages - Backend)
- **Microsoft.AspNetCore.SignalR.Client** (9.0.0): SignalR server-side hub implementation
- **Microsoft.Extensions.Caching.Memory** (9.0.0): In-memory caching with TTL support
- **Serilog.AspNetCore** (8.0.1): Structured logging framework
- **Polly** (8.3.1): Resilience policies (retry, timeout, circuit breaker)
- **Swashbuckle.AspNetCore** (6.5.0): OpenAPI/Swagger documentation generation
- **xUnit** (2.6.6): Unit testing framework
- **Moq** (4.20.70): Mocking library for unit tests
- **FluentAssertions** (6.12.0): Fluent assertion library for tests
- **FluentValidation.AspNetCore** (11.3.0): Input validation framework
- **Microsoft.AspNetCore.Authentication.JwtBearer** (9.0.0): JWT authentication

### External Dependencies (npm Packages - Frontend)
- **react** (19.2.0): UI library
- **react-dom** (19.2.0): React DOM renderer
- **typescript** (5.9.3): TypeScript compiler
- **axios** (1.13.1): HTTP client for API calls
- **@microsoft/signalr** (9.0.6): SignalR client library
- **tailwindcss** (3.4.18): Utility-first CSS framework
- **vite** (7.1.7): Build tool and dev server
- **vitest** (2.0.5 - to be added): Unit testing framework
- **@testing-library/react** (16.0.0 - to be added): React component testing utilities
- **@testing-library/jest-dom** (6.4.2 - to be added): Custom matchers for DOM testing

### Internal Dependencies
- **Smartico External API:**
  - Status: External service (existing)
  - Dependency: GET /api/bonuses endpoint must return bonus data
  - Dependency: POST /api/bonuses/{id}/claim endpoint must process claims
  - Risk: API downtime or slow responses (mitigated by caching and Polly policies)
- **Authentication Service:**
  - Status: Existing (JWT infrastructure from Missions & Badges)
  - Dependency: Valid JWT tokens must be issued for users
  - Dependency: JWT middleware must extract userId from claims
- **Missions & Badges Infrastructure:**
  - Status: Existing (reusable components)
  - Dependency: MemoryCacheService from Missions.Infrastructure (can reuse or copy pattern)
  - Dependency: SignalR hub pattern from ProgressHub (extend with bonus events)
  - Dependency: Exception handling middleware (reuse ExceptionHandlingMiddleware)
  - Dependency: Request logging middleware (reuse RequestLoggingMiddleware)

### Team Dependencies
- **Design Team:**
  - Required: Confirmation that BonusCard design follows Missions/Badges pattern
  - Required: Bonus promotional image specifications (dimensions, formats)
  - Required: Empty state icon asset (gift box or star icon)
  - Optional: Review of Tailwind CSS styling for consistency
- **Backend Team:**
  - Required: None (self-contained implementation)
  - Coordination: Ensure bonus endpoints don't conflict with existing routes
- **DevOps Team:**
  - Required: Azure App Service or hosting environment for .NET 9 backend
  - Required: Static web hosting for frontend (Vercel, Netlify, or Azure Static Web Apps)
  - Required: Environment variable configuration (JWT secret, Smartico API key)
  - Required: Application Insights or monitoring tool setup
  - Optional: Redis cache setup (if scaling beyond single instance)
  - Optional: CDN configuration for frontend bundle delivery
- **QA Team:**
  - Required: Functional testing in staging environment
  - Required: Accessibility audit with axe DevTools
  - Required: Performance testing with Lighthouse
  - Required: Manual keyboard navigation testing
  - Required: Screen reader testing (NVDA, JAWS, or VoiceOver)

## Timeline

| Phase | Duration | Start Date | End Date | Owner | Deliverables |
|-------|----------|-----------|----------|-------|--------------|
| **Phase 1:** Domain Layer (Bonus-Specific) | 1 day | Day 1 | Day 1 | Backend Dev | Domain entities, interfaces, TypeScript types |
| **Phase 2:** Infrastructure Layer - API Client & Caching | 3 days | Day 2 | Day 4 | Backend Dev | Smartico API client, cache service, Polly policies, unit tests |
| **Phase 3:** Application Layer - CQRS Queries & Commands | 3 days | Day 5 | Day 7 | Backend Dev | Query/command handlers, FluentValidation, unit tests |
| **Phase 4:** API Layer - Controllers & SignalR Hub | 3 days | Day 8 | Day 10 | Backend Dev | REST endpoints, SignalR hub, integration tests |
| **Phase 5:** Frontend - React Components & Services | 5 days | Day 8 | Day 12 | Frontend Dev | BonusCard, BonusList, services, Tailwind styling, accessibility |
| **Phase 6:** Integration, Testing & Performance | 3 days | Day 13 | Day 15 | Full Stack Dev + QA | E2E tests, performance benchmarks, security audit |
| **Phase 7:** Documentation & Deployment Prep | 2 days | Day 16 | Day 17 | Full Stack Dev | API docs, README, ADRs, CI/CD, deployment guide |
| **Deployment:** Staging & Production Rollout | 1 day | Day 18 | Day 18 | DevOps + Dev Team | Staging deployment, production rollout, monitoring |

**Total Estimated Duration:** 18 business days (approximately 3.5 weeks)**

**Time Saved:** 6 days compared to building from scratch, thanks to reusing Missions & Badges infrastructure

**Milestones:**
- **Day 7 (Week 1 End):** Backend application layer complete with CQRS handlers and 80%+ test coverage
- **Day 10:** Backend API fully functional with all endpoints and SignalR hub operational
- **Day 12:** Frontend UI complete with WCAG AA compliance and all components tested
- **Day 15 (Week 3 End):** All testing complete, documentation finalized, ready for deployment
- **Day 18:** Production deployment complete, monitoring confirmed, success metrics tracked

**Critical Path:**
Phase 1 → Phase 2 → Phase 3 → Phase 4 (backend) must complete before Phase 6 integration testing. Phase 5 (frontend) can run in parallel with Phase 4 starting Day 8 after API contracts are defined.

**Assumptions:**
- 1 backend developer dedicated full-time
- 1 frontend developer dedicated full-time
- QA support available in Week 4
- DevOps support available in Week 5
- No major blockers from Smartico API or infrastructure

## Success Criteria

The implementation is considered successful when the following criteria are met:

### Technical Success Criteria
1. **All Tests Passing:**
   - [ ] Unit tests: 80%+ coverage for backend and frontend
   - [ ] Integration tests: All API endpoints return correct responses
   - [ ] E2E tests: Critical user journeys complete without errors
   - [ ] Performance tests: k6 load test with 100 concurrent users passes
2. **Performance Benchmarks Met:**
   - [ ] Bonus list loads in < 1.5 seconds (p95) on 4G connection
   - [ ] Bonus claim completes in < 3 seconds (p95)
   - [ ] Real-time updates appear within 2 seconds
   - [ ] Frontend LCP < 2.5s, FCP < 1.5s, TTI < 3.5s
   - [ ] Cache hit rate > 80% after 5-minute warmup
3. **Accessibility Audit Passed:**
   - [ ] axe DevTools shows 0 violations
   - [ ] Manual keyboard navigation verified (Tab, Enter, Escape)
   - [ ] Screen reader tested with NVDA, JAWS, or VoiceOver
   - [ ] Color contrast meets WCAG AA (4.5:1 minimum)
   - [ ] Focus indicators visible on all interactive elements
4. **Code Review Approved:**
   - [ ] Senior developer reviewed and approved all PRs
   - [ ] Constitution compliance verified (SOLID, AAA testing, type safety)
   - [ ] No security vulnerabilities identified
   - [ ] Code follows project conventions and naming standards
5. **Documentation Complete:**
   - [ ] OpenAPI/Swagger docs generated and accessible
   - [ ] README updated with setup instructions
   - [ ] ADRs created for key architectural decisions
   - [ ] Deployment guide finalized with rollback procedures
6. **Deployed to Production:**
   - [ ] Staging deployment successful with QA validation
   - [ ] Production canary deployment (10% traffic) successful
   - [ ] Full production rollout (100% traffic) complete
   - [ ] Health check endpoint returns 200 OK
7. **Monitoring Configured:**
   - [ ] Application Insights dashboards created
   - [ ] Alerts configured (p95 > 500ms, error rate > 5%)
   - [ ] Custom events tracked (bonus claimed, claim failed, cache invalidation)
   - [ ] First 24 hours show stable metrics
8. **No Critical Issues Post-Launch:**
   - [ ] No critical bugs in first week
   - [ ] Error rate < 1% in production
   - [ ] Zero data integrity issues (no double-crediting)
   - [ ] No security incidents

### Business Success Criteria (Measured Post-Launch)
1. **User Engagement:**
   - [ ] 85%+ of users claim bonuses within 24 hours of issuance
   - [ ] 15% increase in return visits among users with unclaimed bonuses (measured at 2 weeks)
2. **Performance:**
   - [ ] 95% of bonus claims complete successfully on first attempt
   - [ ] Users complete bonus claiming task within 10 seconds of viewing list
3. **Support Impact:**
   - [ ] 70% reduction in bonus-related support tickets (measured at 1 month)
   - [ ] 90%+ task completion rate (users who view bonuses successfully claim at least one)
4. **System Reliability:**
   - [ ] 99.9% uptime during first month
   - [ ] Zero incidents of double-crediting bonuses
   - [ ] Real-time updates work for 90%+ of users

### Constitution Compliance Criteria
1. **Code Quality (SOLID & Clean Code):**
   - [ ] All classes follow Single Responsibility Principle
   - [ ] Interfaces segregated by role (ISP)
   - [ ] Dependencies injected via abstractions (DIP)
   - [ ] Functions < 20 lines, meaningful names, no magic numbers
2. **Testing Excellence (AAA Pattern):**
   - [ ] All tests follow Arrange-Act-Assert structure
   - [ ] One assertion per test
   - [ ] Test names follow `should_ExpectedBehavior_When_StateUnderTest` convention
   - [ ] No logic in tests (no conditionals, loops, complex setup)
3. **UX Consistency:**
   - [ ] Tailwind CSS utility classes consistent with Missions & Badges
   - [ ] Responsive design verified on mobile (320px+), tablet (768px+), desktop (1024px+)
   - [ ] WCAG 2.1 AA compliance verified
4. **Performance Standards:**
   - [ ] API response times meet targets (GET < 200ms, POST < 500ms p95)
   - [ ] Frontend Core Web Vitals meet targets (LCP, FCP, TTI, CLS, FID)
   - [ ] Bundle size < 250KB gzipped per route
5. **Type Safety & Documentation:**
   - [ ] TypeScript strict mode enabled with no `any` types (except justified)
   - [ ] All public APIs documented with XML comments (C#) and JSDoc (TS)
   - [ ] All interfaces and types fully documented

**Final Approval:**
- [ ] Technical Lead sign-off
- [ ] Product Owner sign-off
- [ ] Security Review sign-off

## Approval

- [ ] Technical Lead: _________________ - Date: _____________
- [ ] Product Owner: _________________ - Date: _____________
- [ ] UX Designer: ___________________ - Date: _____________
- [ ] Security Review: _______________ - Date: _____________

---

**Document Status:** Draft
**Last Updated:** 2024-11-08
**Next Review:** After Phase 1 completion (Week 1, Day 3)
**Implementation Start:** TBD (pending approval)
**Target Completion:** 4 weeks from start date

---

## Appendix A: Key File Paths (Reference for Implementation)

### Backend Reference Files (Missions & Badges - Patterns to Follow)
- [Program.cs](../../backend/src/Smartico.Missions.Api/Program.cs) - Middleware pipeline, DI setup, SignalR configuration
- [MissionsController.cs](../../backend/src/Smartico.Missions.Api/Controllers/MissionsController.cs) - Controller pattern, endpoint structure
- [ProgressHub.cs](../../backend/src/Smartico.Missions.Api/Hubs/ProgressHub.cs) - SignalR hub pattern
- [MemoryCacheService.cs](../../backend/src/Smartico.Missions.Infrastructure/Caching/MemoryCacheService.cs) - Cache implementation
- [SmarticoApiClient.cs](../../backend/src/Smartico.Missions.Infrastructure/SmarticoApi/SmarticoApiClient.cs) - HTTP client with Polly
- [DependencyInjection.cs](../../backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs) - Service registration pattern
- [Mission.cs](../../backend/src/Smartico.Missions.Domain/Entities/Mission.cs) - Entity pattern
- [ISmarticoApiClient.cs](../../backend/src/Smartico.Missions.Domain/Interfaces/ISmarticoApiClient.cs) - Interface pattern

### Frontend Reference Files (Missions & Badges - Patterns to Follow)
- [App.tsx](../../frontend/src/App.tsx) - State management, real-time subscription pattern
- [types.ts](../../frontend/src/types.ts) - TypeScript interface definitions
- [api.ts](../../frontend/src/services/api.ts) - Axios HTTP client pattern
- [signalr.ts](../../frontend/src/services/signalr.ts) - SignalR client with reconnection
- [MissionCard.tsx](../../frontend/src/components/MissionCard.tsx) - Card component pattern
- [MissionList.tsx](../../frontend/src/components/MissionList.tsx) - List component pattern
- [tailwind.config.js](../../frontend/tailwind.config.js) - Tailwind configuration
- [vite.config.ts](../../frontend/vite.config.ts) - Build configuration

### Configuration Files
- [appsettings.json](../../backend/src/Smartico.Missions.Api/appsettings.json) - Backend configuration template
- [package.json](../../frontend/package.json) - Frontend dependencies

### Documentation Templates
- [spec.md](./spec.md) - Feature specification (source of requirements)
- [requirements.md](./checklists/requirements.md) - Specification validation checklist
- [constitution.md](../../.specify/memory/constitution.md) - Project constitution (coding standards)

---

**End of Implementation Plan**

