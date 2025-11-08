# Player Level Feature - Implementation Plan

**Version:** 1.0.0
**Created:** 2025-11-08
**Status:** Draft
**Owner:** Development Team

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [x] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards
- [x] **Testing Strategy:** AAA pattern with single assertions specified for all components
- [x] **UX Consistency:** Design system usage and accessibility requirements documented
- [x] **Performance:** Performance budgets and monitoring strategy defined
- [x] **Type Safety:** TypeScript strict mode compliance plan included

## Executive Summary

The Player Level feature provides users with a visual progression system that displays their current level, progress toward the next level, and the complete level hierarchy. This feature integrates with the existing Smartico Gamification Platform API to retrieve level definitions and user progression data, following the established Clean Architecture + CQRS pattern used by Tournaments, Bonuses, and Mini Games features.

**Business Value:**
- Increases user engagement through visible achievement progression
- Motivates continued platform usage with clear advancement goals
- Provides gamification foundation for other features (badges, missions, tournaments)
- Enhances user retention through milestone-based motivation

**Technical Approach:**
- Integrate with existing Smartico Level API (TLevel interface)
- Follow established backend patterns: Domain → Application (CQRS) → Infrastructure → API
- Reuse existing infrastructure: 30s caching, SignalR real-time events, Polly resilience
- Implement responsive React UI components with accessibility (WCAG 2.1 AA)

## Goals & Objectives

### Primary Goals
- Enable users to view their current level and progression status
- Display complete level hierarchy with visual status indicators (achieved, current, next, locked)
- Provide real-time level-up notifications when users cross level thresholds
- Support advanced leveling mechanics (level counters 1 and 2) when configured
- Ensure 100% accessibility compliance (WCAG 2.1 AA)

### Success Metrics
- **Performance**: Level data loads within 500ms (p95), UI renders within 2 seconds
- **Engagement**: 80% of users view their level status within first session
- **Accuracy**: 100% accuracy in level calculations and progress display
- **Reliability**: 99.9% uptime for level data retrieval
- **Adoption**: 70% of active users engage with level feature weekly

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  LevelCard       │  │ LevelProgress    │  │ LevelList    │  │
│  │  (Current Level) │  │ (Progress Bar)   │  │ (All Levels) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└────────────┬─────────────────────────┬──────────────────────────┘
             │ HTTP REST API           │ WebSocket (SignalR)
             │ GET /api/levels         │ LevelProgressUpdated
             │                         │ LevelUpAchieved
┌────────────▼─────────────────────────▼──────────────────────────┐
│                  API LAYER (.NET 9 API)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ LevelsController                                          │  │
│  │ - GET /api/levels?userId=xxx                             │  │
│  │ - GET /api/levels/{levelId}                              │  │
│  │ - GET /api/levels/progress?userId=xxx                    │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │ MediatR
┌─────────────────────────▼──────────────────────────────────────┐
│             APPLICATION LAYER (CQRS with MediatR)               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Queries (Read Operations)                               │  │
│  │ - GetLevelsQuery → GetLevelsQueryHandler                │  │
│  │ - GetUserLevelProgressQuery → Handler                   │  │
│  │ - GetLevelByIdQuery → Handler                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Commands (Write Operations - Future)                    │  │
│  │ - (None for MVP - read-only feature)                    │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│              INFRASTRUCTURE LAYER                                │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ SmarticoLevelApi │  │ MemoryCache    │  │ SignalR        │ │
│  │ Client (HTTP)    │  │ Service        │  │ Broadcaster    │ │
│  │ - GetLevels()    │  │ - 30s TTL      │  │ - Level events │ │
│  │ - GetUserLevel() │  │ - Pattern inv. │  │ - Real-time    │ │
│  └──────────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────┬──────────────────────────────────────┘
                          │ HTTP + Polly Retry
┌─────────────────────────▼──────────────────────────────────────┐
│                   SMARTICO LEVEL API                             │
│  - GET /level/all (get all level definitions)                   │
│  - GET /user/{userId} (get user properties with current level)  │
│  - User properties: ach_level_current_id, ach_points_ever       │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 9 / ASP.NET Core 9
- Language: C# 13 with nullable reference types enabled
- Architecture: Clean Architecture + CQRS (MediatR)
- Validation: FluentValidation
- Caching: IMemoryCache (30-second TTL)
- Real-time: SignalR (reuse /hubs/progress)
- Resilience: Polly (retry + circuit breaker + timeout)
- Logging: ILogger with structured logging

**Frontend:**
- Library: React 19 with TypeScript 5+ (strict mode)
- State Management: React Query for server state, Context API for UI state
- HTTP Client: Axios with interceptors
- Real-time: SignalR client (@microsoft/signalr)
- Styling: TailwindCSS (design system tokens)
- Accessibility: React ARIA components, axe-core testing

**DevOps:**
- Testing: xUnit (backend), Vitest + React Testing Library (frontend)
- Code Quality: ESLint, Prettier, SonarQube
- CI/CD: GitHub Actions (build, test, deploy)
- Monitoring: Application Insights, Sentry

### Key Design Decisions

1. **Read-Only MVP**: Level progression is calculated and managed by Smartico platform. Our system is read-only, displaying data from the API. No write operations (level up commands) needed initially.

2. **Derived Data Pattern**: User's current level is derived from `ach_level_current_id` user property. Progress is calculated using `ach_points_ever` vs. `required_points` of next level.

3. **Client-Side Progress Calculation**: To reduce API calls, client calculates progress percentage locally using cached level definitions and user points. Server validates on level-up events.

4. **Visibility-Based Filtering**: Levels respect `visibility_points` threshold. Users only see levels they've "unlocked" for viewing (not necessarily achieved).

5. **Optimistic UI Updates**: Real-time SignalR events (LevelProgressUpdated, LevelUpAchieved) trigger immediate UI updates without full data refetch.

## Implementation Phases

### Phase 1: Backend Foundation (Domain + Infrastructure)
**Duration:** 2 days
**Dependencies:** None

**Tasks:**
- [x] Create Domain entities (Level, UserLevelProgress, LevelCounter)
- [x] Create Domain interfaces (ISmarticoLevelApiClient, ILevelService)
- [x] Create Domain enums (LevelStatus, CounterType)
- [x] Implement Infrastructure API client (SmarticoLevelApiClient with demo data)
- [x] Add Polly resilience policies (retry, circuit breaker, timeout)
- [x] Register services in Infrastructure DI container
- [x] Unit tests for domain models (business rule validation)

**Deliverables:**
- `Domain/Entities/Level.cs` - TLevel mapping with required/optional properties
- `Domain/Entities/UserLevelProgress.cs` - User progression state
- `Domain/Interfaces/ISmarticoLevelApiClient.cs` - API contract
- `Infrastructure/SmarticoApi/SmarticoLevelApiClient.cs` - HTTP client implementation
- `Infrastructure/DependencyInjection.cs` - Service registration

**Constitution Compliance:**
- Testing: Unit tests with AAA pattern, 100% coverage for business rules
- Performance: HTTP client configured with 10s timeout, 3 retry attempts
- Types: All entities fully typed with required/init properties, XML documentation

**Acceptance Criteria:**
- [ ] Level entity matches TLevel API interface (9 properties)
- [ ] UserLevelProgress calculates progress percentage correctly
- [ ] API client handles missing/malformed data gracefully
- [ ] All business rules tested (visibility, ordering, max level)
- [ ] Demo data provides 5+ levels for testing

### Phase 2: Backend Application Layer (CQRS)
**Duration:** 2 days
**Dependencies:** Phase 1 complete

**Tasks:**
- [x] Create GetLevelsQuery + Handler (all levels with visibility filtering)
- [x] Create GetUserLevelProgressQuery + Handler (current level + progress)
- [x] Create GetLevelByIdQuery + Handler (single level details)
- [x] Implement 30-second caching in query handlers
- [x] Add FluentValidation validators for queries
- [x] Implement SignalR events (LevelProgressUpdated, LevelUpAchieved)
- [x] Integration tests for query handlers (with mock API client)

**Deliverables:**
- `Application/Features/Levels/Queries/GetLevels/` - Get all levels query
- `Application/Features/Levels/Queries/GetUserLevelProgress/` - Get user progress query
- `Application/Features/Levels/Queries/GetLevelById/` - Get single level query
- `Application/Features/Levels/Queries/GetLevels/GetLevelsQueryValidator.cs`
- `Application/DependencyInjection.cs` - MediatR registration

**Constitution Compliance:**
- Testing: Integration tests with AAA pattern, mock API client, verify caching
- Performance: Cache hit rate >70%, query response <100ms (in-memory)
- Types: Query/Response records with explicit types

**Acceptance Criteria:**
- [ ] GetLevelsQuery returns levels sorted by required_points
- [ ] Visibility filtering works (user sees only eligible levels)
- [ ] GetUserLevelProgressQuery calculates progress percentage accurately
- [ ] Cache invalidation works on user point changes
- [ ] Validators reject invalid user IDs and level IDs
- [ ] All queries have >80% test coverage

### Phase 3: Backend API Layer (Controllers)
**Duration:** 1 day
**Dependencies:** Phase 2 complete

**Tasks:**
- [x] Create LevelsController with GET endpoints
- [x] Add Swagger documentation (XML comments, ProducesResponseType)
- [x] Implement error handling middleware
- [x] Add request/response logging
- [x] API integration tests (end-to-end with TestServer)

**Deliverables:**
- `Api/Controllers/LevelsController.cs` - REST endpoints
- `Api/Models/GetLevelsRequest.cs` - Request DTOs (if needed)
- Swagger documentation at `/swagger`

**Constitution Compliance:**
- Testing: API integration tests with AAA pattern, test all status codes
- Performance: API response time <200ms (p95) for GET endpoints
- Types: DTOs with validation attributes

**API Endpoints:**

1. **GET /api/levels?userId={userId}**
   - Description: Get all levels with visibility filtering
   - Response: `{ levels: Level[], userCurrentLevel: number }`
   - Status Codes: 200 OK, 400 Bad Request, 500 Internal Server Error

2. **GET /api/levels/progress?userId={userId}**
   - Description: Get user's current level progress
   - Response: `UserLevelProgress` object
   - Status Codes: 200 OK, 400 Bad Request, 404 Not Found

3. **GET /api/levels/{levelId}?userId={userId}**
   - Description: Get single level details
   - Response: `Level` object
   - Status Codes: 200 OK, 404 Not Found

**Acceptance Criteria:**
- [ ] All endpoints documented in Swagger
- [ ] Endpoints return proper status codes on error
- [ ] Request validation errors return 400 with clear messages
- [ ] Logging includes correlation IDs for tracing
- [ ] API tests cover happy path and error scenarios

### Phase 4: Frontend Services Layer
**Duration:** 2 days
**Dependencies:** Phase 3 complete (API available)

**Tasks:**
- [x] Create TypeScript types matching backend entities
- [x] Implement LevelService (API client with Axios)
- [x] Implement SignalR connection manager (reuse existing)
- [x] Add React Query hooks (useLevel, useLevelProgress, useLevels)
- [x] Implement error handling and retry logic
- [x] Unit tests for services and hooks

**Deliverables:**
- `frontend/src/types/level.ts` - TypeScript interfaces
- `frontend/src/services/levelService.ts` - HTTP API client
- `frontend/src/hooks/useLevel.ts` - React Query hooks
- `frontend/src/hooks/useLevelProgress.ts` - Real-time progress hook
- `frontend/src/services/signalr/levelHub.ts` - SignalR subscriptions

**Constitution Compliance:**
- Testing: Unit tests with Vitest, mock API responses, test error states
- Performance: React Query caching (30s stale time), optimistic updates
- Types: Strict TypeScript, no `any` types, full interface definitions

**Acceptance Criteria:**
- [ ] TypeScript types match backend entities exactly
- [ ] LevelService handles 401, 403, 500 errors gracefully
- [ ] React Query hooks provide loading, error, and data states
- [ ] SignalR subscriptions auto-reconnect on disconnect
- [ ] All services have >80% test coverage

### Phase 5: Frontend UI Components
**Duration:** 3 days
**Dependencies:** Phase 4 complete

**Tasks:**
- [x] Create LevelCard component (current level display)
- [x] Create LevelProgressBar component (progress visualization)
- [x] Create LevelList component (all levels grid)
- [x] Create LevelUpNotification component (celebratory modal)
- [x] Implement responsive design (mobile, tablet, desktop)
- [x] Add accessibility features (ARIA, keyboard navigation)
- [x] Component tests with React Testing Library

**Deliverables:**
- `frontend/src/components/LevelCard.tsx` - Current level card
- `frontend/src/components/LevelProgressBar.tsx` - Progress bar
- `frontend/src/components/LevelList.tsx` - Level grid
- `frontend/src/components/LevelUpNotification.tsx` - Level-up modal
- `frontend/src/components/LevelBadge.tsx` - Level badge icon
- Storybook stories for all components

**Constitution Compliance:**
- Testing: Component tests with AAA pattern, test accessibility, user interactions
- Performance: Lazy load images, virtualize long lists (if >50 levels)
- Types: Strongly typed props with JSDoc
- UX: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

**Component Specifications:**

1. **LevelCard**
   - Props: `currentLevel: Level, progress: UserLevelProgress`
   - Displays: Level name, description, badge image, progress bar
   - States: Loading, error, success
   - Accessibility: Role="region", aria-label, focus management

2. **LevelProgressBar**
   - Props: `currentPoints: number, requiredPoints: number, percentage: number`
   - Visual: Gradient fill, percentage label, tooltip on hover
   - Animation: Smooth progress transition (300ms ease-out)
   - Accessibility: aria-valuenow, aria-valuemin, aria-valuemax

3. **LevelList**
   - Props: `levels: Level[], currentLevelId: number, userPoints: number`
   - Layout: Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
   - Visual states: Achieved (green), current (blue), next (yellow), locked (gray)
   - Accessibility: Keyboard navigation, focus indicators

4. **LevelUpNotification**
   - Props: `newLevel: Level, onClose: () => void`
   - Animation: Fade in + scale, confetti effect, auto-dismiss after 5s
   - Accessibility: Focus trap, Escape to close, aria-live="assertive"

**Acceptance Criteria:**
- [ ] All components render correctly on 320px, 768px, 1024px viewports
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space, Escape)
- [ ] Screen reader announces level changes and progress updates
- [ ] Loading states show within 200ms of data fetch
- [ ] Error states provide actionable retry options
- [ ] All components have >80% test coverage

### Phase 6: Integration & Real-Time Updates
**Duration:** 2 days
**Dependencies:** Phase 5 complete

**Tasks:**
- [x] Integrate components into main Levels tab
- [x] Implement SignalR event handlers (level progress, level up)
- [x] Add optimistic UI updates on SignalR events
- [x] Implement toast notifications for level-up events
- [x] Add browser tab title updates on level-up
- [x] E2E tests with Playwright (user journey)

**Deliverables:**
- `frontend/src/pages/LevelsPage.tsx` - Main levels view
- `frontend/src/services/signalr/levelSubscriptions.ts` - Event subscriptions
- E2E tests for critical user journeys

**Constitution Compliance:**
- Testing: E2E tests for key flows (view levels, see progress, level up)
- Performance: SignalR updates <100ms latency, no UI jank on updates
- UX: Smooth animations, no layout shift (CLS <0.1)

**SignalR Events:**

1. **LevelProgressUpdated**
   - Payload: `{ userId, currentPoints, currentLevelId, progressPercentage }`
   - Action: Update progress bar, refresh progress hook cache
   - Throttle: Max 1 update per 2 seconds (prevent spam)

2. **LevelUpAchieved**
   - Payload: `{ userId, newLevel, previousLevel, rewardsEarned }`
   - Action: Show celebration modal, update current level, play sound
   - Priority: High (immediate processing)

**Acceptance Criteria:**
- [ ] SignalR events trigger UI updates within 1 second
- [ ] No duplicate notifications on same level-up event
- [ ] Offline/online transitions handled gracefully (auto-reconnect)
- [ ] Browser tab title updates to show level-up (e.g., "🎉 Level 5!")
- [ ] E2E tests pass on Chrome, Firefox, Safari

## Testing Strategy

### Unit Testing
- **Coverage Target:** 90% for business logic, 80% overall
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `should_ExpectedBehavior_When_StateUnderTest`
- **Tools:** xUnit (backend), Vitest (frontend)
- **Mocking:** Use interfaces (ISmarticoLevelApiClient, ICacheService)

**Backend Unit Tests:**
```csharp
// Example test
public class GetUserLevelProgressQueryHandlerTests
{
    [Fact]
    public async Task should_return_correct_progress_percentage_when_user_has_points()
    {
        // Arrange
        var mockApiClient = Substitute.For<ISmarticoLevelApiClient>();
        var mockCache = Substitute.For<ICacheService>();
        var mockLogger = Substitute.For<ILogger<GetUserLevelProgressQueryHandler>>();

        var userLevel = CreateUserLevelProgress(currentPoints: 150, requiredPoints: 200);
        mockApiClient.GetUserLevelProgressAsync("user123", Arg.Any<CancellationToken>())
            .Returns(userLevel);

        var handler = new GetUserLevelProgressQueryHandler(mockApiClient, mockCache, mockLogger);
        var query = new GetUserLevelProgressQuery("user123");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal(75.0, result.Progress.ProgressPercentage);
    }
}
```

**Frontend Unit Tests:**
```typescript
// Example test
describe('LevelProgressBar', () => {
  it('should_display_correct_percentage_when_props_provided', () => {
    // Arrange
    const currentPoints = 150;
    const requiredPoints = 200;
    const expectedPercentage = 75;

    // Act
    render(
      <LevelProgressBar
        currentPoints={currentPoints}
        requiredPoints={requiredPoints}
        percentage={expectedPercentage}
      />
    );

    // Assert
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
  });
});
```

### Integration Testing
- **Scope:** API endpoints, CQRS handlers with real cache, SignalR hub connections
- **Tools:** WebApplicationFactory (backend), MSW (frontend API mocking)
- **Coverage:** All API endpoints, all query/command handlers

**Example Integration Test:**
```csharp
[Fact]
public async Task GetLevels_should_return_200_with_levels_when_valid_userId()
{
    // Arrange
    var client = _factory.CreateClient();
    var userId = "user123";

    // Act
    var response = await client.GetAsync($"/api/levels?userId={userId}");
    var content = await response.Content.ReadFromJsonAsync<GetLevelsResponse>();

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    content.Should().NotBeNull();
    content!.Levels.Should().NotBeEmpty();
    content.Levels.Should().BeInAscendingOrder(l => l.RequiredPoints);
}
```

### End-to-End Testing
- **Scope:** Critical user journeys (view levels, check progress, receive level-up)
- **Tools:** Playwright
- **Coverage:** Happy path for main user scenarios

**User Journeys:**
1. User navigates to Levels tab → Sees current level and progress
2. User earns points (simulated) → Progress bar updates in real-time
3. User crosses level threshold → Level-up notification appears
4. User views all levels → Sees achieved, current, and locked levels

### Performance Testing
- **API Load Testing:** k6, target 100 RPS with p95 <200ms
- **Frontend Performance:** Lighthouse CI, target LCP <2.5s, FCP <1.5s
- **Database Query Profiling:** Not applicable (no database, API-backed)

**Performance Budgets:**
- Backend GET /api/levels: <200ms (p95)
- Backend GET /api/levels/progress: <200ms (p95)
- Frontend initial render: <2s (FCP)
- Frontend level list render: <1s (100 levels)
- SignalR event processing: <100ms
- JavaScript bundle size: <50KB gzipped (level feature only)

## Performance Requirements

### Backend
- GET /api/levels: <200ms (p95), <100ms (p50)
- GET /api/levels/progress: <200ms (p95), <100ms (p50)
- Cache hit rate: >70%
- Smartico API calls: <500ms (p95) with 3 retries
- SignalR broadcast latency: <50ms

### Frontend
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms
- JavaScript bundle size: <50KB gzipped (feature-specific)
- Image optimization: WebP with lazy loading, max 50KB per badge

### Monitoring
- APM tool: Application Insights
- Metrics tracked:
  - API response times (p50, p95, p99)
  - Cache hit/miss ratio
  - SignalR connection count and latency
  - Frontend Core Web Vitals
  - Error rate (4xx, 5xx)
  - User engagement (level views per session)
- Alerting thresholds:
  - API p95 >500ms → Warning
  - Error rate >5% → Critical
  - SignalR disconnections >10% → Warning

## UX/UI Specifications

### Design System Compliance
- **Colors:** Use Tailwind color palette
  - Primary: `purple-600` (brand color)
  - Success: `green-600` (achieved levels)
  - Warning: `yellow-500` (next level)
  - Info: `blue-600` (current level)
  - Muted: `gray-400` (locked levels)
- **Typography:**
  - Level names: `text-xl font-bold` (Headings)
  - Descriptions: `text-sm text-gray-600` (Body)
  - Progress numbers: `text-2xl font-semibold`
- **Spacing:** Use Tailwind spacing scale (4px base grid)
- **Shadows:** `shadow-md` for cards, `shadow-lg` on hover

### Accessibility Requirements
- **WCAG Level:** AA compliance mandatory
- **Keyboard Navigation:**
  - Tab: Navigate between level cards
  - Enter/Space: Open level details modal
  - Escape: Close modals
  - Arrow keys: Navigate within level list
- **Screen Reader:**
  - Announce current level on page load
  - Announce progress percentage on update
  - Announce level-up events with aria-live="assertive"
  - Label all progress bars with aria-label
- **Color Contrast:** Verified with axe DevTools, minimum 4.5:1 for text
- **ARIA Attributes:**
  - `role="progressbar"` on progress bars
  - `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on progress
  - `role="region"` with `aria-label` on level sections
  - `aria-live="polite"` for progress updates
  - `aria-live="assertive"` for level-up notifications

### Responsive Breakpoints
- **Mobile:** 320px - 767px (1 column, stacked layout)
- **Tablet:** 768px - 1023px (2 columns)
- **Desktop:** 1024px+ (3 columns, sidebar navigation)

**Mobile Optimizations:**
- Larger touch targets (min 44x44px)
- Simplified level cards (hide advanced counters)
- Bottom sheet for level details (instead of modal)

## Security Considerations

- [x] Input validation on all user IDs (alphanumeric, max 50 chars)
- [x] Level IDs validated as positive integers
- [x] No SQL injection risk (API-backed, no database)
- [x] XSS prevention: Sanitize level descriptions and custom data (DOMPurify)
- [x] Authentication: Validate user ID ownership (future: JWT tokens)
- [x] Authorization: Users can only view their own level data
- [x] Rate limiting: 60 requests/minute per user on API endpoints
- [x] HTTPS only: All API calls over TLS 1.2+
- [x] No sensitive data in logs (no PII, only user IDs)
- [x] CORS: Whitelist frontend origin only

**Security Audit Checklist:**
- [ ] All endpoints require authentication (future enhancement)
- [ ] User ID validated against authenticated session
- [ ] No level manipulation possible from client side
- [ ] Custom data JSON validated and sanitized
- [ ] Level images served from trusted CDN only

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, E2E) - 90%+ coverage
- [ ] Performance benchmarks met (p95 <200ms API, LCP <2.5s)
- [ ] Accessibility audit passed (axe, Lighthouse) - 100 score
- [ ] Code review completed (2 approvals required)
- [ ] Swagger documentation generated and reviewed
- [ ] Storybook published for component library
- [ ] Monitoring configured (Application Insights dashboards)
- [ ] Rollback plan documented (feature flag ready)

### Rollout Plan
1. **Deploy to Staging** (Day 1)
   - Deploy backend API to staging environment
   - Deploy frontend to staging CDN
   - Run smoke tests (API health check, UI loads)
   - QA validation (manual testing of user journeys)

2. **Canary Deployment** (Day 2)
   - Enable feature flag for 5% of users
   - Monitor error rates, API latency, user engagement
   - Gather early feedback via in-app surveys

3. **Gradual Rollout** (Day 3-5)
   - 5% → 25% → 50% → 100%
   - Monitor metrics at each stage (30-minute observation window)
   - Rollback if error rate >5% or p95 latency >500ms

4. **Full Rollout** (Day 6)
   - Enable feature for all users
   - Monitor for 24 hours (weekend if possible)
   - Publish announcement (changelog, social media)

5. **Post-Launch Review** (Day 7)
   - Review metrics: engagement, performance, errors
   - Gather user feedback (support tickets, NPS)
   - Plan iterations based on learnings

### Rollback Plan
- **Feature Flag:** Instant disable via configuration (no redeployment)
- **Database:** Not applicable (API-backed, stateless)
- **Frontend:** Revert to previous CDN version (instant)
- **Backend:** Revert to previous Docker image (5-minute rollback)
- **Communication:** Notify users via banner if rollback occurs

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Smartico API downtime | Medium | High | Implement circuit breaker (Polly), fallback to cached data, show stale data with warning banner |
| Performance degradation (>500ms p95) | Low | Medium | Load testing before launch, auto-scaling on API, CDN for static assets, query optimization |
| Accessibility non-compliance | Low | High | Automated axe tests in CI/CD, manual screen reader testing, accessibility checklist in PR template |
| SignalR connection issues | Medium | Medium | Auto-reconnect logic (exponential backoff), fallback to polling if WebSocket fails, connection status indicator |
| Incorrect progress calculation | Low | High | Unit tests for all calculation paths, integration tests with edge cases (max level, 0 points, overflow), client-server validation |
| Browser compatibility issues | Low | Low | Cross-browser testing (Chrome, Firefox, Safari, Edge), Babel polyfills for older browsers, progressive enhancement |
| High cache miss rate (<50%) | Medium | Low | Monitor cache hit rate, tune TTL (30s default), implement stale-while-revalidate pattern |

## Documentation Requirements

- [x] API documentation (OpenAPI/Swagger) - Generated from XML comments
- [x] Component documentation (Storybook) - Interactive component explorer
- [x] User guide (Help Center article) - "Understanding Your Level"
- [x] Architecture Decision Records (ADRs) - Why read-only MVP, why SignalR
- [x] README updates - Add Levels section to main README
- [x] Changelog entry - v1.1.0: Add Player Level feature

**Documentation Deliverables:**
- `docs/api/levels-api.md` - API endpoint documentation
- `docs/architecture/adr-004-player-level-read-only.md` - ADR for read-only design
- `docs/user-guide/player-levels.md` - End-user documentation
- `frontend/src/components/README.md` - Component usage guide
- `CHANGELOG.md` - Version 1.1.0 entry

## Dependencies

### External Dependencies
- **@microsoft/signalr** (^8.0.0): Real-time SignalR client
- **axios** (^1.6.0): HTTP client for API calls
- **@tanstack/react-query** (^5.0.0): Server state management
- **tailwindcss** (^3.4.0): Styling framework
- **react-aria** (^3.30.0): Accessible UI primitives

### Internal Dependencies
- **Smartico Level API**: Requires access to GET /level/all and GET /user/{userId}
- **User Authentication**: Requires valid user ID (future: JWT tokens)
- **SignalR Hub**: Reuses existing /hubs/progress endpoint

### Team Dependencies
- **Design Team**: Level badge images, progress bar designs, level-up animation
- **Backend Team**: None (self-sufficient)
- **DevOps Team**: Application Insights setup, CDN configuration, feature flag infrastructure

## Timeline

| Phase | Start Date | End Date | Owner | Status |
|-------|-----------|----------|-------|--------|
| Phase 1: Backend Foundation | 2025-11-08 | 2025-11-09 | Backend Dev | Not Started |
| Phase 2: Backend CQRS | 2025-11-10 | 2025-11-11 | Backend Dev | Not Started |
| Phase 3: Backend API | 2025-11-12 | 2025-11-12 | Backend Dev | Not Started |
| Phase 4: Frontend Services | 2025-11-13 | 2025-11-14 | Frontend Dev | Not Started |
| Phase 5: Frontend UI | 2025-11-15 | 2025-11-17 | Frontend Dev + Designer | Not Started |
| Phase 6: Integration | 2025-11-18 | 2025-11-19 | Full Stack Dev | Not Started |
| Testing & QA | 2025-11-20 | 2025-11-21 | QA Team | Not Started |
| Deployment | 2025-11-22 | 2025-11-24 | DevOps + Full Team | Not Started |

**Total Estimated Duration:** 12 working days (2.5 weeks)

**Milestones:**
- ✅ **M1:** Backend API complete and tested (Day 5)
- ✅ **M2:** Frontend components complete and tested (Day 10)
- ✅ **M3:** Integration complete, E2E tests pass (Day 12)
- ✅ **M4:** Deployed to production (Day 15)

## Success Criteria

The implementation is considered successful when:

1. ✅ All phases completed and tests passing (90%+ coverage)
2. ✅ Performance benchmarks met (API p95 <200ms, LCP <2.5s)
3. ✅ Accessibility audit passed (Lighthouse 100 score, axe 0 violations)
4. ✅ Code review approved (2+ approvals, no blocking comments)
5. ✅ Documentation complete (API docs, Storybook, ADRs, user guide)
6. ✅ Deployed to production with feature flag enabled
7. ✅ Monitoring shows stable metrics (error rate <1%, no performance degradation)
8. ✅ No critical issues in first week post-launch (P0/P1 bugs)
9. ✅ User engagement metrics met (70% of users view level within 7 days)
10. ✅ Positive user feedback (NPS >8, <5% negative support tickets)

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] Security Review: [Name] - [Date]

---

**Last Updated:** 2025-11-08
**Next Review:** 2025-11-15 (mid-implementation checkpoint)
