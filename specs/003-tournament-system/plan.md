# Tournament System - Implementation Plan

**Version:** 1.0.0
**Created:** 2025-11-08
**Status:** Draft
**Owner:** Development Team

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [x] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards (CQRS pattern, dependency injection, single responsibility services)
- [x] **Testing Strategy:** AAA pattern with single assertions specified for all components (80% coverage target)
- [x] **UX Consistency:** Design system usage and accessibility requirements documented (WCAG 2.1 AA, responsive design)
- [x] **Performance:** Performance budgets and monitoring strategy defined (2s leaderboard load, 3s registration)
- [x] **Type Safety:** TypeScript strict mode compliance plan included (all interfaces typed, no `any`)

## Executive Summary

The Tournament System provides users with competitive tournament experiences including discovery, registration, leaderboard tracking, and prize distribution. This feature integrates seamlessly into the existing Smartico.Missions backend infrastructure, following the same Clean Architecture + CQRS patterns established by Missions, Bonuses, and MiniGames features.

The implementation leverages existing components (SignalR broadcaster, caching service, MediatR pipeline) to minimize development time while maintaining architectural consistency. The system supports multiple tournament states, registration types, prize structures, and real-time leaderboard updates.

**Key Integration Points:**
- Extends existing `IProgressBroadcaster` with tournament events
- Reuses `MemoryCacheService` with 30-second TTL
- Follows established CQRS pattern with MediatR handlers and FluentValidation
- Integrates into existing frontend tab navigation alongside Missions/Bonuses/MiniGames

## Goals & Objectives

### Primary Goals
- Enable users to discover and join competitive tournaments
- Provide real-time leaderboard tracking during active tournaments
- Support multiple tournament types (free, paid with points/gems/diamonds)
- Display prize structures and tournament rules clearly
- Broadcast real-time tournament events (registrations, score updates, winners)

### Success Metrics
- **Discovery Performance**: Users find relevant tournaments in < 10 seconds
- **Registration Success**: 90% of eligible users complete registration on first attempt
- **Leaderboard Performance**: Load time < 2 seconds for tournaments with up to 1000 participants
- **Real-time Latency**: Tournament updates broadcast within 1 second
- **System Reliability**: 99.9% uptime, zero data inconsistencies

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────┐
│               FRONTEND (React 19 + TypeScript)          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ MissionList │  │  BonusList   │  │TournamentList  │ │
│  │   (Axios)   │  │ (Fetch API)  │  │  (Fetch API)   │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└───────────┬──────────────┬──────────────────────────────┘
            │              │
            │ HTTP/REST    │ SignalR WebSocket
            │              │
┌───────────▼──────────────▼──────────────────────────────┐
│     BACKEND (.NET 9 / ASP.NET Core 9) - EXISTING        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Layer (Controllers + ProgressHub)           │  │
│  │  - TournamentsController ✅ NEW (CQRS MediatR)  │  │
│  │  - ProgressHub (REUSE - add tournament events)  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Application Layer (CQRS Handlers)               │  │
│  │  - GetTournamentsQueryHandler ✅ NEW            │  │
│  │  - RegisterTournamentCommandHandler ✅ NEW      │  │
│  │  - GetLeaderboardQueryHandler ✅ NEW            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Domain Layer (Entities & Interfaces)            │  │
│  │  - Tournament, TournamentPrize entities ✅ NEW  │  │
│  │  - IProgressBroadcaster (EXTEND with 4 events)  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Infrastructure Layer (REUSE EXISTING)           │  │
│  │  - SignalRProgressBroadcaster (EXTEND)          │  │
│  │  - SmarticoTournamentApiClient ✅ NEW           │  │
│  │  - MemoryCacheService (REUSE - 30s TTL)        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 9
- Framework: ASP.NET Core 9
- Language: C# 12 with nullable reference types
- Pattern: Clean Architecture + CQRS (MediatR)
- Validation: FluentValidation
- Real-time: SignalR
- Caching: MemoryCache (30s TTL)
- Resilience: Polly (existing, reused for tournament API)

**Frontend:**
- Library: React 19
- Language: TypeScript 5+ (strict mode)
- HTTP Client: Fetch API
- Real-time: SignalR JavaScript Client
- Styling: TailwindCSS (existing design system)
- State Management: React useState/useEffect

**Integration:**
- Existing: Smartico.Missions.* projects
- Reuse: IProgressBroadcaster, MemoryCacheService, SignalR hub
- Pattern: Same as Bonuses and MiniGames features

### Key Design Decisions

1. **Leverage Existing Infrastructure**: Integrate into Smartico.Missions.* projects instead of creating separate projects. Rationale: Reduces duplication, maintains architectural consistency, reuses battle-tested components.

2. **CQRS with MediatR**: Use same query/command pattern as Bonuses and MiniGames. Rationale: Consistent codebase, separation of concerns, testability, pipeline behaviors (validation, logging, caching).

3. **30-Second Cache TTL**: Reuse existing caching strategy for tournament lists and leaderboards. Rationale: Balances freshness with performance, proven effective in Missions/Bonuses features, reduces API load.

4. **Unified SignalR Events**: Extend existing IProgressBroadcaster interface with tournament events. Rationale: Single WebSocket connection, consistent event handling, reduces client complexity.

5. **Demo Data with In-Memory State**: Follow MiniGames pattern with static in-memory tournament data for MVP. Rationale: Rapid development, no external API dependencies for testing, easy to replace with real Smartico Tournament API later.

6. **Leaderboard Pagination Strategy**: Hybrid approach - show top 50 participants + user's position (if outside top 50) + full pagination for exploration. Rationale: Balances most common use case (check top rankings and personal position) with full visibility needs.

## Implementation Phases

### Phase 1: Domain Layer - Entities & Interfaces
**Duration:** 1 day
**Dependencies:** None

**Tasks:**
- [x] Create `Tournament.cs` entity with all TTournament properties
- [x] Create `TournamentPrize.cs` entity with prize structure
- [x] Create `TournamentParticipant.cs` entity for leaderboard entries
- [x] Create `TournamentRegistrationType` enum (Free, PaidPoints, PaidGems, PaidDiamonds, InviteOnly)
- [x] Create `TournamentRegistrationStatus` enum (NotRegistered, Registered, Full, Closed, ConditionsNotMet, InsufficientBalance)
- [x] Create `TournamentPrizeType` enum (Points, Bonus, Manual, RealMoney, FreeSpins, Custom)
- [x] Create `RegisterTournamentResult.cs` for registration outcomes
- [x] Create `ISmarticoTournamentApiClient.cs` interface
- [x] Extend `IProgressBroadcaster.cs` with 4 tournament event methods:
  - `BroadcastTournamentRegisteredAsync`
  - `BroadcastTournamentStartedAsync`
  - `BroadcastLeaderboardUpdatedAsync`
  - `BroadcastTournamentFinishedAsync`

**Deliverables:**
- Domain entities in `Smartico.Missions.Domain/Entities/`
- Enums in `Smartico.Missions.Domain/Enums/`
- Interfaces in `Smartico.Missions.Domain/Interfaces/`

**Constitution Compliance:**
- Testing: Domain entities are POCOs (no logic to test)
- Performance: N/A (no runtime code)
- Types: All properties strongly typed, nullable reference types enabled

### Phase 2: Infrastructure Layer - API Client & SignalR
**Duration:** 2 days
**Dependencies:** Phase 1

**Tasks:**
- [x] Create `SmarticoTournamentApiClient.cs` with demo data
  - Implement `GetTournamentsAsync` with 3 demo tournaments (upcoming, active, finished)
  - Implement `RegisterForTournamentAsync` with validation logic
  - Implement `GetLeaderboardAsync` with simulated participants
  - Use static dictionary for in-memory tournament state (like MiniGames)
  - Thread-safe with lock statements for concurrent access
- [x] Extend `SignalRProgressBroadcaster.cs` with 4 new methods:
  - `BroadcastTournamentRegisteredAsync` - notify user-specific
  - `BroadcastTournamentStartedAsync` - broadcast to all registered users
  - `BroadcastLeaderboardUpdatedAsync` - broadcast to tournament viewers
  - `BroadcastTournamentFinishedAsync` - broadcast to all with winner info
- [x] Register `ISmarticoTournamentApiClient` in `DependencyInjection.cs`
- [x] Add Polly resilience policies to tournament API client (3 retries, 30s timeout)

**Deliverables:**
- `SmarticoTournamentApiClient.cs` in `Infrastructure/SmarticoApi/`
- Updated `SignalRProgressBroadcaster.cs`
- Updated `DependencyInjection.cs`

**Constitution Compliance:**
- Testing: Unit tests for registration logic, thread-safety tests
- Performance: Async/await throughout, no blocking calls
- Types: All method signatures strongly typed

### Phase 3: Application Layer - CQRS Queries & Commands
**Duration:** 3 days
**Dependencies:** Phase 2

**Tasks:**
- [x] Create `Features/Tournaments/Queries/GetTournaments.cs`:
  - Query record with UserId parameter
  - Response with list of tournaments
  - Handler with caching (30s TTL)
  - Support filtering by status, featured, custom section
- [x] Create `Features/Tournaments/Queries/GetTournamentDetails.cs`:
  - Query record with UserId and TournamentId
  - Response with full tournament data including user's stats
  - Handler with caching
- [x] Create `Features/Tournaments/Queries/GetLeaderboard.cs`:
  - Query record with TournamentId and optional pagination params
  - Response with participants, prizes, user position
  - Handler with caching
  - Support hybrid pagination (top 50 + user position + full pages)
- [x] Create `Features/Tournaments/Commands/RegisterTournament.cs`:
  - Command record with UserId and TournamentId
  - Response with success/failure and error details
  - Handler with validation, registration, cache invalidation, broadcast
- [x] Create `Features/Tournaments/Validators/RegisterTournamentCommandValidator.cs`:
  - FluentValidation rules for UserId and TournamentId
- [x] Register all handlers in `Smartico.Missions.Application.csproj`

**Deliverables:**
- Query handlers in `Application/Features/Tournaments/Queries/`
- Command handlers in `Application/Features/Tournaments/Commands/`
- Validators in `Application/Features/Tournaments/Validators/`

**Constitution Compliance:**
- Testing: AAA pattern tests for each handler, 80%+ coverage
- Performance: Caching strategy defined, async throughout
- Types: All requests/responses typed, no `any`

### Phase 4: API Layer - Controller & Endpoints
**Duration:** 1 day
**Dependencies:** Phase 3

**Tasks:**
- [x] Create `TournamentsController.cs`:
  - `GET /api/tournaments` - GetTournamentsQuery with filter params
  - `GET /api/tournaments/{id}` - GetTournamentDetailsQuery
  - `GET /api/tournaments/{id}/leaderboard` - GetLeaderboardQuery with pagination
  - `POST /api/tournaments/{id}/register` - RegisterTournamentCommand
  - All endpoints use MediatR.Send
  - All endpoints return standardized ApiResponse format
  - Swagger documentation with XML comments
- [x] Add controller to `Program.cs` (auto-discovered)
- [x] Update `appsettings.json` with tournament config section (if needed)

**Deliverables:**
- `TournamentsController.cs` in `Api/Controllers/`
- API documentation via Swagger

**Constitution Compliance:**
- Testing: Integration tests for each endpoint
- Performance: Controller is thin, all logic in handlers
- Types: Request/response DTOs typed

### Phase 5: Frontend - Types & Services
**Duration:** 2 days
**Dependencies:** Phase 4

**Tasks:**
- [x] Create `types/tournament.ts`:
  - `Tournament` interface matching all TTournament properties
  - `TournamentPrize` interface
  - `TournamentParticipant` interface
  - `TournamentRegistrationStatus` enum
  - `TournamentRegistrationType` enum
  - `RegisterTournamentResult` interface
- [x] Create `services/tournamentService.ts`:
  - `getTournaments(userId, filters)` - Fetch API call
  - `getTournamentDetails(userId, tournamentId)` - Fetch API call
  - `getLeaderboard(tournamentId, page)` - Fetch API call
  - `registerTournament(userId, tournamentId)` - Fetch API call
  - Error handling and type safety
- [x] Extend `services/signalr.ts`:
  - `TournamentRegisteredHandler` type
  - `TournamentStartedHandler` type
  - `LeaderboardUpdatedHandler` type
  - `TournamentFinishedHandler` type
  - `onTournamentRegistered` method
  - `onTournamentStarted` method
  - `onLeaderboardUpdated` method
  - `onTournamentFinished` method

**Deliverables:**
- `types/tournament.ts`
- `services/tournamentService.ts`
- Updated `services/signalr.ts`

**Constitution Compliance:**
- Testing: Unit tests for service methods
- Performance: N/A (API calls)
- Types: Full TypeScript strict mode, all interfaces exported

### Phase 6: Frontend - Components
**Duration:** 3 days
**Dependencies:** Phase 5

**Tasks:**
- [x] Create `components/TournamentCard.tsx`:
  - Display tournament summary (name, image, prize pool, status)
  - Show registration status and cost
  - Show player count (current/max)
  - Display featured ribbon if applicable
  - Props interface with strict types
  - Accessibility: ARIA labels, keyboard navigation, alt text
- [x] Create `components/TournamentList.tsx`:
  - Fetch tournaments on mount
  - Display cards in grid layout
  - Filter controls (status, featured, section)
  - Stats dashboard (total, active, registered count)
  - Real-time registration count updates via SignalR
  - Loading and error states
  - Responsive design (mobile/tablet/desktop)
- [x] Create `components/TournamentDetails.tsx`:
  - Full tournament information display
  - Prize structure table
  - Timeline with countdown
  - Registration button with validation feedback
  - User's current stats if registered
  - Real-time status updates
- [x] Create `components/Leaderboard.tsx`:
  - Top participants list
  - User's position highlighted
  - Prize structure alongside rankings
  - Pagination controls
  - Real-time score updates via SignalR
  - Qualifying score indicators
  - Loading states for pagination
- [x] Update `App.tsx`:
  - Add "Tournaments" tab to navigation
  - Route to TournamentList component
  - Integrate with existing SignalR connection

**Deliverables:**
- `components/TournamentCard.tsx`
- `components/TournamentList.tsx`
- `components/TournamentDetails.tsx`
- `components/Leaderboard.tsx`
- Updated `App.tsx`

**Constitution Compliance:**
- Testing: Component tests with React Testing Library, AAA pattern
- Performance: Memoization for expensive renders, virtualization for long lists
- Types: All props interfaces typed, no implicit any
- UX: WCAG 2.1 AA compliance, responsive, loading states, error handling

### Phase 7: Testing & Quality Assurance
**Duration:** 2 days
**Dependencies:** Phase 6

**Tasks:**
- [x] **Backend Unit Tests** (80% coverage minimum):
  - `GetTournamentsQueryHandlerTests` - AAA pattern, single asserts
  - `RegisterTournamentCommandHandlerTests` - all validation scenarios
  - `GetLeaderboardQueryHandlerTests` - pagination, filtering
  - `SmarticoTournamentApiClientTests` - thread-safety, demo data
  - `SignalRProgressBroadcasterTests` - tournament event broadcasts
- [x] **Frontend Unit Tests**:
  - `tournamentService.test.ts` - API calls, error handling
  - `TournamentCard.test.tsx` - rendering, props
  - `TournamentList.test.tsx` - filtering, stats, SignalR integration
  - `Leaderboard.test.tsx` - pagination, real-time updates
- [x] **Integration Tests**:
  - End-to-end tournament registration flow
  - Leaderboard real-time update flow
  - Tournament status change flow
- [x] **Accessibility Audit**:
  - Run axe-core on all tournament components
  - Keyboard navigation testing
  - Screen reader compatibility
  - Color contrast validation
- [x] **Performance Testing**:
  - Measure tournament list load time
  - Measure leaderboard render time with 1000 participants
  - Measure SignalR event latency
  - Verify cache effectiveness

**Deliverables:**
- Test files in `tests/` directories
- Accessibility audit report
- Performance test results

**Constitution Compliance:**
- Testing: 80%+ coverage achieved, AAA pattern throughout
- Performance: All metrics within targets
- Types: No type errors, strict mode passing

### Phase 8: Documentation & Deployment
**Duration:** 1 day
**Dependencies:** Phase 7

**Tasks:**
- [x] **Code Documentation**:
  - XML comments on all public APIs
  - JSDoc on all exported functions/interfaces
  - README in `Features/Tournaments/` directory
- [x] **User Documentation**:
  - Update main README with Tournament feature section
  - API documentation via Swagger
  - Component usage examples
- [x] **Demo Data Documentation**:
  - Document 3 demo tournaments (states, rules, prizes)
  - Instructions for testing different scenarios
- [x] **Deployment Checklist**:
  - Build verification (0 warnings/errors)
  - Migration plan (if database changes needed)
  - Rollback procedure
  - Monitoring setup
- [x] **Update IMPLEMENTATION_SUMMARY.md**:
  - Add Tournament System section
  - Document architecture, key features, testing results

**Deliverables:**
- Updated documentation files
- Deployment checklist
- IMPLEMENTATION_SUMMARY.md updated

**Constitution Compliance:**
- All requirements met
- Ready for production deployment

## Testing Strategy

### Unit Testing
- **Coverage Target:** 80% minimum, 100% for critical paths (registration, leaderboard calculation)
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `should_ExpectedBehavior_When_StateUnderTest`
- **Tools:** xUnit, FluentAssertions (backend); Jest, React Testing Library (frontend)
- **Mocking:** Use dependency injection, mock IProgressBroadcaster, ITournamentApiClient

**Example Test Structure:**
```csharp
public class RegisterTournamentCommandHandlerTests
{
    [Fact]
    public async Task Should_ReturnSuccess_When_UserMeetsAllRequirements()
    {
        // Arrange
        var mockApiClient = new Mock<ISmarticoTournamentApiClient>();
        var mockCache = new Mock<ICacheService>();
        var mockBroadcaster = new Mock<IProgressBroadcaster>();
        mockApiClient
            .Setup(x => x.RegisterForTournamentAsync("user123", 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegisterTournamentResult(Success: true));
        var handler = new RegisterTournamentCommandHandler(mockApiClient.Object, mockCache.Object, mockBroadcaster.Object, Mock.Of<ILogger<RegisterTournamentCommandHandler>>());
        var command = new RegisterTournamentCommand("user123", 1);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
    }
}
```

### Integration Testing
- **Scope:** API endpoints end-to-end
- **Tools:** WebApplicationFactory, TestServer
- **Coverage:** All controller endpoints, SignalR hub methods
- **Data:** Use in-memory tournament state for isolation

### End-to-End Testing
- **Scope:** Complete user workflows
- **Scenarios:**
  1. User discovers and registers for tournament
  2. User monitors leaderboard during active tournament
  3. User attempts registration with insufficient balance (error handling)
  4. Tournament transitions from upcoming → active → finished
- **Tools:** Playwright or Cypress (if E2E framework already exists)

### Performance Testing
- **Metrics:**
  - Tournament list load time: Target < 2s
  - Leaderboard load time (1000 participants): Target < 2s
  - Registration completion time: Target < 3s
  - SignalR event latency: Target < 1s
- **Tools:** Browser DevTools, Lighthouse, backend APM

### Accessibility Testing
- **Tools:** axe-core, pa11y, manual screen reader testing
- **Coverage:** All tournament components
- **Standards:** WCAG 2.1 Level AA compliance

## Performance Considerations

### Backend Optimization
- **Caching Strategy:**
  - Tournament list cached per user for 30 seconds (MemoryCache)
  - Leaderboard cached per tournament for 30 seconds
  - Cache invalidation on registration, status changes
- **Database Queries:** N/A (demo data in-memory)
- **API Resilience:** Polly policies (3 retries, exponential backoff, 30s circuit breaker)
- **Async/Await:** All I/O operations async to prevent thread blocking

### Frontend Optimization
- **Code Splitting:** Tournament components lazy-loaded (React.lazy)
- **Memoization:** Use React.memo for TournamentCard, useMemo for filtered lists
- **Virtualization:** For leaderboards > 100 participants, use react-window
- **Bundle Size:** Keep tournament feature chunk < 50KB gzipped
- **Image Optimization:** Use responsive images, lazy loading for below-fold content

### Real-time Performance
- **SignalR Optimization:**
  - Throttle leaderboard updates (max 1/second)
  - Use targeted broadcasts (user-specific vs. tournament-specific vs. global)
  - Implement exponential backoff for reconnection
- **State Management:** Optimize React state updates to prevent unnecessary re-renders

## Security Considerations

- **Server-side Validation:** All registration attempts validated on backend
- **Balance Deduction:** Atomic operations, prevent double-charging
- **Race Condition Prevention:** Lock statements in API client for concurrent registrations
- **Input Sanitization:** Validate all user inputs (UserId, TournamentId)
- **Authorization:** Verify user identity for all tournament actions
- **Rate Limiting:** Implement rate limits on registration endpoint (e.g., 10/minute per user)
- **Data Exposure:** Do not expose internal tournament state or admin flags to frontend

## Risks & Mitigation

### Risk 1: Concurrent Registration Race Conditions
**Impact:** HIGH - Could allow over-registration beyond max player limit
**Likelihood:** MEDIUM - Depends on tournament popularity
**Mitigation:**
- Use lock statements in SmarticoTournamentApiClient
- Atomic check-and-increment for registration count
- Re-validate max capacity before confirming registration
- Add integration tests for concurrent scenarios

### Risk 2: Leaderboard Performance with Large Tournaments
**Impact:** MEDIUM - Could cause slow page loads, poor UX
**Likelihood:** LOW - Demo data limited to < 1000 participants
**Mitigation:**
- Implement pagination from the start (50 per page)
- Use virtualization for large lists
- Cache leaderboard data
- Monitor and optimize query performance
- Consider server-side pagination for production

### Risk 3: SignalR Connection Interruptions
**Impact:** MEDIUM - Users miss real-time updates
**Likelihood:** MEDIUM - Network instability, server restarts
**Mitigation:**
- Implement automatic reconnection with exponential backoff
- Resync state after reconnection (fetch latest tournament data)
- Show connection status indicator to users
- Graceful degradation (poll if WebSocket unavailable)

### Risk 4: Cache Inconsistency
**Impact:** LOW - Users see stale data briefly
**Likelihood:** MEDIUM - Cache invalidation complexity
**Mitigation:**
- Short cache TTL (30 seconds)
- Aggressive cache invalidation on state changes
- Use cache keys with user context
- Monitor cache hit/miss rates

## Dependencies & Prerequisites

### External Dependencies
- **Smartico Tournament API**: Assumed available for production (demo data for MVP)
- **Smartico Balance API**: Required for paid tournament registration validation
- **Smartico Segment API**: Required for eligibility checking

### Internal Dependencies
- **Existing Infrastructure:**
  - Smartico.Missions.Domain (extend)
  - Smartico.Missions.Application (extend)
  - Smartico.Missions.Infrastructure (extend)
  - Smartico.Missions.Api (extend)
- **Existing Services:**
  - IProgressBroadcaster (extend with 4 methods)
  - ICacheService (reuse)
  - SignalR hub at /hubs/progress (reuse)

### Prerequisites
- .NET 9 SDK installed
- Node.js 18+ and npm
- Existing Smartico.Missions.sln builds successfully
- Existing frontend builds and runs

## Deployment Plan

### Build Verification
```bash
# Backend
dotnet build Smartico.Missions.sln
# Should succeed with 0 warnings, 0 errors

# Frontend
npm run build
# Should succeed, bundle size within budget
```

### Deployment Steps
1. **Backend Deployment:**
   - Merge feature branch to main
   - CI/CD pipeline builds and tests
   - Deploy to staging environment
   - Smoke test tournament endpoints
   - Deploy to production
   - Monitor logs and metrics

2. **Frontend Deployment:**
   - Build production bundle
   - Deploy to CDN/hosting
   - Verify assets loaded correctly
   - Test tournament navigation

3. **Post-Deployment:**
   - Monitor error rates
   - Check SignalR connection health
   - Verify tournament registration success rate
   - Monitor performance metrics

### Rollback Plan
If critical issues discovered:
1. Revert API endpoints (disable TournamentsController)
2. Hide Tournament tab in frontend
3. Investigate and fix issues
4. Re-deploy after verification

## Open Questions & Decisions Needed

### Q1: Leaderboard Pagination Details
**Decision Required:** Final pagination strategy
**Options:**
- A) Top 50 + user position only
- B) Full pagination with "jump to my position"
- C) Hybrid (recommended in spec)
**Recommendation:** Option C - Top 50 visible, pagination for exploration, quick jump to user
**Decision:** To be confirmed in planning review

### Q2: Demo Tournament Data Complexity
**Decision Required:** How realistic should demo data be?
**Options:**
- A) Minimal - 3 simple tournaments, 10 participants each
- B) Moderate - 3 tournaments with varied states, 50-100 participants
- C) Complex - 5+ tournaments, 500+ participants, complex prize structures
**Recommendation:** Option B - Sufficient for testing without overwhelming
**Decision:** To be confirmed in planning review

### Q3: Real-time Update Frequency
**Decision Required:** How often to broadcast leaderboard updates?
**Options:**
- A) Immediate - every score change
- B) Throttled - maximum 1 update per second
- C) Batched - updates every 5 seconds
**Recommendation:** Option B - Balances real-time feel with performance
**Decision:** To be confirmed in planning review

## Success Criteria

This implementation will be considered successful when:

1. **Functional Completeness:**
   - [ ] All 6 functional requirements from spec.md implemented
   - [ ] All acceptance criteria met
   - [ ] 4 user scenarios testable and working

2. **Performance Targets:**
   - [ ] Tournament list loads in < 2 seconds
   - [ ] Leaderboard loads in < 2 seconds (up to 1000 participants)
   - [ ] Registration completes in < 3 seconds
   - [ ] Real-time updates arrive in < 1 second

3. **Quality Metrics:**
   - [ ] 80%+ test coverage (unit tests)
   - [ ] 0 build warnings/errors
   - [ ] WCAG 2.1 AA accessibility compliance
   - [ ] No console errors in browser

4. **User Experience:**
   - [ ] Users can discover tournaments easily
   - [ ] Registration errors are clear and actionable
   - [ ] Leaderboard updates are smooth (no flicker)
   - [ ] Mobile experience is fully functional

5. **Integration:**
   - [ ] Seamlessly integrated into existing app navigation
   - [ ] SignalR events work alongside missions/bonuses/minigames
   - [ ] Follows same patterns as existing features
   - [ ] No breaking changes to existing features

## Timeline Summary

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1 | 1 day | Domain Layer - Entities & Interfaces |
| Phase 2 | 2 days | Infrastructure Layer - API Client & SignalR |
| Phase 3 | 3 days | Application Layer - CQRS Queries & Commands |
| Phase 4 | 1 day | API Layer - Controller & Endpoints |
| Phase 5 | 2 days | Frontend - Types & Services |
| Phase 6 | 3 days | Frontend - Components |
| Phase 7 | 2 days | Testing & Quality Assurance |
| Phase 8 | 1 day | Documentation & Deployment |
| **Total** | **15 days** | **~3 weeks** |

**Note:** Timeline assumes single developer working full-time. Parallel work by multiple developers can reduce total calendar time.

## Next Steps

1. **Review & Approval:**
   - Technical Lead review this plan
   - Product Owner approval
   - Team walkthrough

2. **Kickoff:**
   - Assign developer(s)
   - Set up tracking (Jira/GitHub issues)
   - Schedule daily standups

3. **Begin Implementation:**
   - Start with Phase 1 (Domain Layer)
   - Follow sequential phases
   - Daily progress updates

4. **Continuous Integration:**
   - Commit code daily
   - Run tests in CI/CD
   - Address feedback promptly

---

**Plan Status:** Draft - Pending Review
**Next Review:** [Date TBD]
**Approvals Required:** Technical Lead, Product Owner
