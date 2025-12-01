# Dashboard API Integration - Implementation Plan

**Version:** 1.0.0
**Created:** 2025-12-01
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

This plan details the implementation of the Dashboard API Integration feature, which enables the player dashboard frontend to display gamification data (jackpots, missions, badges) by having the backend API read directly from the MongoDB database populated by the backoffice-api.

The integration eliminates the dependency on external Smartico APIs by reading campaign data directly from the shared MongoDB database. This allows operators to configure campaigns in the back office (via Demo Starter Pack) and have players immediately see them in their dashboard.

## Goals & Objectives

### Primary Goals
- Enable backend API to read jackpots, missions, badges from MongoDB
- Replace external API calls with direct database reads
- Support multi-tenant data isolation by operatorId
- Ensure API responses match dashboard widget data structures

### Success Metrics
- API response time: < 200ms (p95) for GET endpoints
- Data consistency: 100% match between backoffice writes and backend reads
- Test coverage: > 80% for new repository and service code
- Dashboard displays demo content within 1 second of page load

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                               │
├─────────────────────────┬───────────────────────────────────────────┤
│  backoffice-frontend    │           player-dashboard (frontend)     │
│  (React + Vite)         │           (React + Vite)                  │
│  Port: 5173             │           Port: 5174                      │
└───────────┬─────────────┴───────────────────┬───────────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────────┐   ┌─────────────────────────────────────┐
│     backoffice-api        │   │         backend                      │
│   (ASP.NET Core)          │   │   (Smartico.Missions.Api)           │
│   Port: 5001              │   │   Port: 5000                        │
│   [WRITE OPERATIONS]      │   │   [READ OPERATIONS]                 │
│                           │   │                                     │
│   - Create Jackpots       │   │   - GET /api/jackpots               │
│   - Create Missions       │   │   - GET /api/missions               │
│   - Create Badges         │   │   - GET /api/badges                 │
│   - Demo API Setup        │   │   - SignalR: ProgressHub            │
└───────────┬───────────────┘   └───────────────┬─────────────────────┘
            │                                   │
            │         SHARED DATABASE           │
            └──────────────┬────────────────────┘
                           ▼
            ┌─────────────────────────────────┐
            │           MongoDB               │
            │   smartico_backoffice_dev       │
            │                                 │
            │   Collections:                  │
            │   - jackpots                    │
            │   - missions                    │
            │   - badges                      │
            │   - playerProgress (NEW)        │
            └─────────────────────────────────┘
```

### Technology Stack

**Backend (Smartico.Missions.Api):**
- Runtime: .NET 9.0
- Framework: ASP.NET Core Web API
- Language: C# 13
- Database: MongoDB 2.23.0 (Driver)
- Real-time: SignalR
- CQRS: MediatR

**Frontend (player-dashboard):**
- Library: React 19
- Language: TypeScript 5+ (strict mode)
- Build: Vite 7.1
- Styling: TailwindCSS 3.4
- Animations: Framer Motion 11

**Shared:**
- Database: MongoDB (smartico_backoffice_dev)
- Entity Serialization: BSON

### Key Design Decisions

1. **Shared MongoDB Database**: Both backoffice-api and backend read/write to the same MongoDB database to ensure data consistency without synchronization overhead.

2. **Read-Only Repositories in Backend**: Backend uses separate read-only repository interfaces to enforce separation of concerns (backoffice writes, backend reads).

3. **Reference BackOffice Domain**: Backend references the BackOffice.Domain project to reuse entity classes, ensuring schema consistency.

4. **Default Operator for Demo**: Use a configurable default operatorId for demo purposes until full authentication is implemented.

## Implementation Phases

### Phase 1: Infrastructure Setup
**Dependencies:** None

**Tasks:**
- [ ] Add MongoDB.Driver NuGet package to Infrastructure project
- [ ] Create MongoDbSettings configuration class
- [ ] Register MongoDB services in DI container
- [ ] Add connection string to appsettings.json and appsettings.Development.json
- [ ] Add project reference to BackOffice.Domain

**Deliverables:**
- MongoDbSettings.cs configuration class
- Updated Program.cs with MongoDB DI registration
- Updated appsettings.json files

**Constitution Compliance:**
- Testing: Unit tests for configuration loading
- Performance: Connection pooling enabled by default
- Types: All configuration strongly typed

### Phase 2: Repository Layer
**Dependencies:** Phase 1

**Tasks:**
- [ ] Create IJackpotReadRepository interface in Domain
- [ ] Create IMissionReadRepository interface in Domain
- [ ] Create IBadgeReadRepository interface in Domain
- [ ] Create IPlayerProgressRepository interface in Domain
- [ ] Implement JackpotReadRepository in Infrastructure
- [ ] Implement MissionReadRepository in Infrastructure
- [ ] Implement BadgeReadRepository in Infrastructure
- [ ] Implement PlayerProgressRepository in Infrastructure
- [ ] Register repositories in DI

**Deliverables:**
- 4 repository interfaces in Domain/Interfaces
- 4 repository implementations in Infrastructure/Repositories
- Updated DependencyInjection.cs

**Constitution Compliance:**
- Testing: 100% coverage for repository methods (AAA pattern)
- Performance: All queries use operatorId filter with index
- Types: Strongly typed return values, no `any` or `dynamic`

### Phase 3: Service Layer Updates
**Dependencies:** Phase 2

**Tasks:**
- [ ] Update GetJackpotsQueryHandler to use IJackpotReadRepository
- [ ] Update MissionsController to use IMissionReadRepository
- [ ] Update BadgesController to use IBadgeReadRepository
- [ ] Create DTO mappers for entity → response transformation
- [ ] Add operator ID resolution from configuration

**Deliverables:**
- Updated query handlers and controllers
- JackpotMapper, MissionMapper, BadgeMapper classes
- OperatorIdResolver service

**Constitution Compliance:**
- Testing: Unit tests for all mappers and handlers
- Performance: Async/await throughout, no blocking calls
- Types: Explicit DTO types for all responses

### Phase 4: Player Progress Tracking
**Dependencies:** Phase 3

**Tasks:**
- [ ] Create PlayerProgress entity class
- [ ] Implement player progress read/write operations
- [ ] Update API responses to include player-specific data
- [ ] Add opt-in/opt-out functionality for jackpots
- [ ] Add mission progress tracking

**Deliverables:**
- PlayerProgress entity
- Updated API responses with player state
- Opt-in/opt-out endpoints using MongoDB

**Constitution Compliance:**
- Testing: Integration tests for player state persistence
- Performance: Indexed queries on playerId + operatorId
- Types: Strongly typed progress tracking

### Phase 5: Integration Testing
**Dependencies:** Phase 4

**Tasks:**
- [ ] Create integration tests for MongoDB repositories
- [ ] Test end-to-end flow: backoffice creates → backend reads
- [ ] Test multi-tenant data isolation
- [ ] Performance test API endpoints
- [ ] Update frontend useDashboardData hook (optional)

**Deliverables:**
- Integration test suite
- Performance benchmark results
- Updated documentation

**Constitution Compliance:**
- Testing: Full integration test coverage
- Performance: All endpoints < 200ms p95
- Types: TypeScript types for frontend (if updated)

## Testing Strategy

### Unit Testing
- **Coverage Target:** 80% minimum, 100% for repositories and mappers
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `should_ExpectedBehavior_When_StateUnderTest`
- **Tools:** xUnit, Moq, FluentAssertions
- **Mocking:** Mock IMongoCollection for repository tests

### Integration Testing
- **Scope:** Repository operations with real MongoDB
- **Tools:** TestContainers for MongoDB, WebApplicationFactory
- **Coverage:** All repository methods, cross-project data flow

### End-to-End Testing
- **Scope:** Demo setup → Dashboard display flow
- **Tools:** Manual testing initially, Playwright for automation
- **Coverage:** Complete user journey

### Performance Testing
- **API Load Testing:** k6 or Artillery, target 100 RPS
- **Database Query Profiling:** MongoDB explain() for all queries
- **Response Time Targets:** < 200ms for GET endpoints

## Performance Requirements

### Backend
- GET endpoints: < 200ms (p95)
- Database queries: All use indexes on operatorId
- Connection pooling: Default MongoDB driver pooling
- Caching: In-memory cache for 30 seconds (existing)

### Monitoring
- APM tool: Application Insights (existing)
- Metrics tracked: Response time, error rate, query duration
- Alerting thresholds: > 500ms response time, > 1% error rate

## Security Considerations

- [x] Input validation on all user inputs (operatorId, userId)
- [x] SQL injection N/A (MongoDB with typed queries)
- [x] XSS prevention (API-only, no HTML rendering)
- [ ] Authentication/Authorization checks (future enhancement)
- [x] Rate limiting on APIs (existing middleware)
- [x] Multi-tenant data isolation by operatorId

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Schema mismatch between projects | Medium | High | Reference BackOffice.Domain project |
| Performance degradation | Low | Medium | Index all queries, use connection pooling |
| Multi-tenant data leak | Low | High | Mandatory operatorId filter in all queries |
| MongoDB connection issues | Low | High | Retry policy, connection pool settings |

## Documentation Requirements

- [x] API documentation (existing Swagger)
- [ ] Architecture Decision Record for shared database
- [ ] README updates for backend project
- [ ] Configuration guide for MongoDB connection

## Dependencies

### External Dependencies
- MongoDB.Driver: 2.23.0 (NuGet)
- Smartico.BackOffice.Domain: Project reference

### Internal Dependencies
- backoffice-api: Must be running to create demo data
- MongoDB: Must be running locally

## File Changes Summary

### New Files
```
backend/src/Smartico.Missions.Infrastructure/
├── Configuration/
│   └── MongoDbSettings.cs
├── Repositories/
│   ├── JackpotReadRepository.cs
│   ├── MissionReadRepository.cs
│   ├── BadgeReadRepository.cs
│   └── PlayerProgressRepository.cs

backend/src/Smartico.Missions.Domain/
├── Interfaces/
│   ├── IJackpotReadRepository.cs
│   ├── IMissionReadRepository.cs
│   ├── IBadgeReadRepository.cs
│   └── IPlayerProgressRepository.cs
├── Entities/
│   └── PlayerProgress.cs
```

### Modified Files
```
backend/src/Smartico.Missions.Api/
├── appsettings.json
├── appsettings.Development.json
├── Program.cs

backend/src/Smartico.Missions.Infrastructure/
├── Smartico.Missions.Infrastructure.csproj
├── DependencyInjection.cs

backend/src/Smartico.Missions.Application/
├── Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryHandler.cs
```

## Success Criteria

The implementation is considered successful when:

1. All phases completed and tests passing
2. `GET /api/jackpots` returns data from MongoDB
3. `GET /api/missions` returns data from MongoDB
4. `GET /api/badges` returns data from MongoDB
5. Demo Starter Pack content visible in dashboard
6. Multi-tenant isolation verified
7. Performance benchmarks met (< 200ms p95)
8. Code review approved

---

**Last Updated:** 2025-12-01
**Next Review:** After Phase 1 completion
