# Back Office Campaign Management - Implementation Plan

**Version:** 1.3.0
**Created:** 2025-01-24
**Last Updated:** 2025-01-24
**Status:** Draft
**Owner:** Development Team

**IMPORTANT UPDATE (v1.1.0)**: Updated to use .NET 9 backend and MongoDB database (per technical requirements)
**IMPORTANT UPDATE (v1.2.0)**: Updated to use NSubstitute for testing, self-hosted MongoDB, Kubernetes hosting, removed monitoring (will be added later)
**IMPORTANT UPDATE (v1.3.0)**: Updated to use React 19 and aligned API structure with existing Clean Architecture pattern (Api, Application, Domain, Infrastructure layers)

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [ ] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards
- [ ] **Testing Strategy:** AAA pattern with single assertions specified for all components
- [ ] **UX Consistency:** Design system usage and accessibility requirements documented
- [ ] **Performance:** Performance budgets and monitoring strategy defined
- [ ] **Type Safety:** C# nullable reference types and strict typing compliance plan included

## Executive Summary

The Back Office Campaign Management system is the central management interface for Smartico's gamification platform, enabling casino operators, game providers, and platform operators to create, manage, and analyze gamification events (missions, bonuses, tournaments, jackpots) and player engagement systems (levels, badges) without technical expertise.

This implementation will deliver a multi-tenant, no-code platform with strict operator-level data isolation, comprehensive campaign builders, real-time analytics, A/B testing capabilities, and player progression systems. The system prioritizes performance (< 5s dashboard loads), self-service (90% success rate), and accuracy (99% preview-to-production match).

The implementation is structured in 5 phases: Foundation & Multi-Tenant Architecture, Campaign Management Core, Player Progression Systems, Analytics & Optimization, and Workflow & Administration.

## Goals & Objectives

### Primary Goals
- **Operator Empowerment**: Enable marketing/operations teams to independently create campaigns in under 10 minutes without developer support
- **Data Isolation**: Ensure zero cross-operator data access (Casino A cannot view/modify Casino B data)
- **Player Retention**: Provide level progression and badge systems to drive long-term engagement
- **Real-Time Visibility**: Deliver campaign performance analytics with < 5 second load times
- **Self-Service Success**: Achieve 80% user adoption and 90% self-service completion rates

### Success Metrics
- **Campaign Creation Time**: < 10 minutes (from start to scheduled)
- **Dashboard Performance**: < 5 seconds load time for real-time analytics
- **Campaign Accuracy**: 99% preview-to-production match (no unexpected behavior)
- **Concurrent Campaigns**: Support 5+ simultaneous campaigns per operator without performance degradation
- **User Adoption**: 80% of marketing teams actively using platform within 3 months
- **Self-Service Success**: 90% of campaigns created without technical support
- **Operator Isolation**: Zero cross-operator data leaks (100% isolation)

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Back Office UI                             │
│  (React + TypeScript + Redux Toolkit + TailwindCSS)                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Campaign     │  │ Player       │  │ Analytics    │            │
│  │ Management   │  │ Progression  │  │ Dashboard    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    HTTPS (TLS 1.3)
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                    .NET 9 Web API + Auth Layer                      │
│            (ASP.NET Core + JWT + Operator Context)                 │
│                                                                     │
│  Middleware: OperatorId validation, RBAC, rate limiting            │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│  Campaign     │    │  Player        │    │  Analytics   │
│  Service      │    │  Progression   │    │  Service     │
│  (.NET 9)     │    │  Service       │    │  (.NET 9)    │
│  - Mission    │    │  (.NET 9)      │    │  - Metrics   │
│  - Bonus      │    │  - Levels      │    │  - Reports   │
│  - Tournament │    │  - Badges      │    │  - A/B Tests │
│  - Jackpot    │    │  - XP Engine   │    │              │
└───────────────┘    └────────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────────┐
│              MongoDB Database with Application-Level Isolation      │
│                                                                     │
│  Collections (all documents have OperatorId field):                │
│  - Campaigns          - PlayerSegments     - ABTests               │
│  - PlayerLevels       - Badges             - UserRoles             │
│  - CampaignTemplates  - AnalyticsEvents    - AuditLogs             │
│                                                                     │
│  Indexes: { OperatorId: 1 } on all collections                     │
│  Queries: All filtered by OperatorId in application layer          │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│  External     │    │  Notification  │    │  Job Queue   │
│  Services     │    │  Service       │    │  (Hangfire)  │
│               │    │                │    │              │
│  - Payment    │    │  - Email       │    │  - Scheduled │
│  - Player API │    │  - In-App      │    │  - Campaigns │
│  - Wallet     │    │  - Push        │    │  - Reports   │
└───────────────┘    └────────────────┘    └──────────────┘
```

### Technology Stack

**Backend:**
- Framework: ASP.NET Core 9.0 (.NET 9)
- Language: C# 13 (nullable reference types enabled, strict null checking)
- Database: MongoDB 8.0+ (self-hosted, document-oriented, application-level operator isolation)
- ODM: MongoDB.Driver 3.0+ (official C# driver with LINQ support)
- Queue: Hangfire 1.8+ (background job scheduling with MongoDB storage)
- Auth: ASP.NET Core Identity + JWT + OAuth2/SAML integration
- Validation: FluentValidation 11+ (strongly-typed validation rules)

**Frontend:**
- Library: React 19
- Language: TypeScript 5+ (strict mode)
- State: Redux Toolkit + RTK Query (data fetching)
- Styling: TailwindCSS 3+ (design system tokens)
- Forms: React Hook Form + Zod validation
- Charts: Recharts (analytics dashboards)

**DevOps:**
- Testing: xUnit + NSubstitute + FluentAssertions (backend), Jest + React Testing Library (frontend)
- CI/CD: GitHub Actions
- Hosting: Self-hosted Kubernetes (K8s) for .NET API and frontend
- Database: Self-hosted MongoDB (replica set for high availability)
- Container Registry: Docker Hub or private registry

### Key Design Decisions

1. **Multi-Tenant Architecture with Application-Level Operator Isolation**: All MongoDB collections include `OperatorId` field. Custom base repository pattern automatically filters all queries by authenticated user's `OperatorId`. MongoDB indexes on `{ OperatorId: 1 }` ensure performant filtering. This ensures zero cross-operator data access enforced at application layer with comprehensive unit tests.

2. **Service-Oriented Architecture with .NET Dependency Injection**: Separate services for Campaign (mission/bonus/tournament/jackpot), Player Progression (levels/badges/XP), and Analytics. Each service follows SOLID principles with ASP.NET Core's built-in DI container. Services are registered as scoped lifetimes with interface-based contracts for testability.

3. **No-Code Campaign Builders**: React-based drag-and-drop builders with visual rule editors (trigger conditions, goals, rewards). Backend stores configuration as BSON documents in MongoDB validated against C# record types with FluentValidation. This enables marketing teams to create complex campaigns without code.

4. **Real-Time Analytics with Pre-Aggregation**: Campaign performance metrics pre-aggregated every 5 minutes via Hangfire scheduled jobs. Dashboard queries pre-aggregated collections (not raw events) to meet < 5s load time requirement. Real-time updates via SignalR hubs for active campaign monitoring.

5. **Operator Context at Auth Layer**: JWT tokens include `OperatorId` claim. ASP.NET Core middleware validates operator context on every request and injects into `HttpContext.Items`. All service methods receive `OperatorId` from middleware (never from user input to prevent spoofing).

## Implementation Phases

### Phase 0: Research & Architecture Setup
**Duration:** 1 week
**Dependencies:** None

**Tasks:**
- [ ] Review existing Smartico architecture documentation
- [ ] Define MongoDB data model schema (all collections with OperatorId)
- [ ] Design API contracts (OpenAPI/Swagger spec for all endpoints)
- [ ] Set up Clean Architecture solution structure following existing pattern:
  - [ ] Create `Smartico.BackOffice.sln` solution file
  - [ ] Create `src/Smartico.BackOffice.Api/` (API Layer: Controllers + SignalR Hubs)
  - [ ] Create `src/Smartico.BackOffice.Application/` (Application Layer: Services + Use Cases)
  - [ ] Create `src/Smartico.BackOffice.Domain/` (Domain Layer: Entities + Interfaces)
  - [ ] Create `src/Smartico.BackOffice.Infrastructure/` (Infrastructure Layer: MongoDB + External Services)
- [ ] Configure C# nullable reference types + StyleCop + EditorConfig
- [ ] Set up self-hosted MongoDB with replica set (3+ nodes)
- [ ] Implement authentication middleware with operator context extraction (in Api layer)
- [ ] Create base service interfaces in Application layer (ICampaignService, IPlayerProgressionService, IAnalyticsService)
- [ ] Create domain entities in Domain layer (Campaign, PlayerLevel, Badge, etc.)
- [ ] Create base repository pattern in Infrastructure layer with automatic OperatorId filtering

**Deliverables:**
- `research.md`: Architecture decisions and unknowns resolved (.NET 9 + MongoDB + Clean Architecture)
- `data-model.md`: MongoDB collections schema with indexes and validation rules
- `api-contracts.md`: OpenAPI 3.0 specification for all .NET endpoints
- `quickstart.md`: Developer setup guide (.NET 9 SDK, self-hosted MongoDB, Docker, Kubernetes)

**Constitution Compliance:**
- Testing: xUnit + NSubstitute + FluentAssertions configured with AAA pattern examples
- Performance: MongoDB indexes planned for OperatorId and all query patterns
- Types: C# nullable reference types enabled, all entities are strongly-typed records

**Clean Architecture Dependency Flow:**
```
Api → Application → Domain ← Infrastructure
```
- **Api** depends on Application & Infrastructure (for DI registration)
- **Application** depends on Domain (contains interfaces)
- **Infrastructure** depends on Domain (implements interfaces)
- **Domain** has no dependencies (pure business logic)

### Phase 1: Foundation & Multi-Tenant Architecture
**Duration:** 3 weeks
**Dependencies:** Phase 0

**Tasks:**
- [ ] Implement MongoDB collections with schema validation (using C# driver)
- [ ] Create MongoDB indexes for all collections ({ OperatorId: 1 } compound indexes)
- [ ] Build authentication service (ASP.NET Core Identity, JWT, OAuth2/SAML)
- [ ] Implement operator context middleware (extract OperatorId from JWT, inject into HttpContext)
- [ ] Create base repository pattern with IMongoCollection<T> and automatic OperatorId filtering
- [ ] Build audit logging service (MongoDB change streams for all mutations)
- [ ] Implement rate limiting (ASP.NET Core middleware, per operator + per user)
- [ ] Set up global exception handling middleware (structured logging with Serilog)
- [ ] Create health check endpoints (/health, /ready using ASP.NET Core Health Checks)
- [ ] Build React app scaffold with routing
- [ ] Implement authentication UI (login, operator selection if multi-operator user)
- [ ] Create base layout components (header, sidebar, navigation)

**Deliverables:**
- Backend: Auth service, MongoDB repository layer, middleware stack (.NET 9)
- Frontend: Authentication flow, base layout (React + TypeScript)
- Tests: 80%+ coverage for auth and middleware (xUnit)

**Constitution Compliance:**
- Testing: All auth flows tested with AAA pattern (Should_AuthenticateUser_When_ValidCredentialsProvided)
- Performance: Auth token validation < 10ms, MongoDB connection pooling configured
- Types: All API request/response types defined as C# records with nullable reference types

### Phase 2: Campaign Management Core
**Duration:** 5 weeks
**Dependencies:** Phase 1

**Tasks:**
- [ ] **Mission Builder (FR-1)**: React component for trigger rules, goal conditions, reward configuration
- [ ] **Bonus Builder (FR-2)**: Forms for deposit match, free spins, cashback, referral bonuses
- [ ] **Tournament Builder (FR-3)**: Leaderboard config, bracket setup, time-based rules
- [ ] **Jackpot Builder (FR-4)**: Progressive, fixed, multi-tier jackpot configuration
- [ ] **Player Segmentation (FR-7)**: Segment builder with tier, level, badge, activity, geography, behavior filters
- [ ] **Campaign Scheduling (FR-8)**: Start/end dates, recurring patterns (daily, weekly, monthly)
- [ ] **Active Campaign Monitoring (FR-9)**: Real-time dashboard with participant count, completion rate, cost, revenue
- [ ] **Draft & Publish Workflow (FR-14)**: Draft status, preview mode, publish confirmation
- [ ] **Campaign Templates (FR-12)**: Template library (welcome bonus, weekend tournament, loyalty mission)
- [ ] **Backend Services**: CampaignService, SegmentationService, SchedulerService
- [ ] **API Endpoints**: POST /campaigns, GET /campaigns, PUT /campaigns/:id, DELETE /campaigns/:id, POST /campaigns/:id/publish
- [ ] **Database Queries**: All filtered by operatorId, indexed for performance
- [ ] **Campaign Preview**: Simulate campaign for test player to validate rules

**Deliverables:**
- 4 campaign builders (mission, bonus, tournament, jackpot)
- Segmentation engine
- Scheduling service with BullMQ jobs
- Campaign monitoring dashboard

**Constitution Compliance:**
- Testing: Each builder component tested with AAA pattern (should_create_mission_when_valid_config_provided)
- Performance: Campaign list loads < 2s (pagination + filtering), builder saves < 500ms
- Types: All campaign configs type-safe (MissionConfig, BonusConfig, TournamentConfig, JackpotConfig)

### Phase 3: Player Progression Systems
**Duration:** 4 weeks
**Dependencies:** Phase 1

**Tasks:**
- [ ] **Player Level System (FR-5)**: Level configuration UI (1-100 levels, tier groupings)
- [ ] **Level Builder**: XP earning rules (bet $10 = 1 XP, mission = 100 XP), level thresholds (exponential/linear curves)
- [ ] **Tier Configuration**: Bronze/Silver/Gold/Platinum/Diamond tier setup with level ranges
- [ ] **Level Rewards**: Configure rewards per level (free spins, cash, mission access, cashback %)
- [ ] **Tier Benefits**: Ongoing perks per tier (VIP support, withdrawal limits, tournaments)
- [ ] **Demotion Rules**: Configure inactivity-based tier drops or permanent progression
- [ ] **XP Boost System**: Multipliers for special events (double XP weekends, 3x XP new games)
- [ ] **Level Preview**: Visualize player journey and rewards at each milestone
- [ ] **Badge System (FR-6)**: Badge builder (name, description, icon upload)
- [ ] **Badge Unlock Criteria**: Trigger types (complete 100 missions, wager $10K, win 50 tournaments, login 30 days)
- [ ] **Badge Rarity**: Common/Rare/Epic/Legendary levels
- [ ] **Badge Rewards**: Optional rewards (cash, free spins, XP boost)
- [ ] **Hidden Badges**: Criteria not revealed until unlocked
- [ ] **Badge Series**: Thematic collections (Slots Master: Beginner/Intermediate/Expert/Master)
- [ ] **Badge Showcase**: Player profile display settings
- [ ] **Backend Services**: PlayerProgressionService, XPEngine, BadgeEngine
- [ ] **API Endpoints**: POST /levels, GET /levels, POST /badges, GET /badges

**Deliverables:**
- Level system configuration UI
- Badge builder and management
- XP calculation engine
- Badge unlock tracking

**Constitution Compliance:**
- Testing: XP calculation logic tested with AAA pattern (should_award_correct_xp_when_action_performed)
- Performance: Level calculations < 50ms, badge unlock checks < 100ms
- Types: LevelSystemConfig, BadgeConfig, XPRule, TierDefinition interfaces

### Phase 4: Analytics & Optimization
**Duration:** 3 weeks
**Dependencies:** Phase 2, Phase 3

**Tasks:**
- [ ] **Campaign Analytics (FR-10)**: Dashboard with participant count, completion rate, cost, revenue, ROI
- [ ] **Player Analytics**: Level distribution, badge unlock rates, XP earning patterns
- [ ] **A/B Testing (FR-11)**: Create A/B test UI (variants, traffic split, success metric)
- [ ] **A/B Results**: Statistical significance calculation, winner selection, rollout recommendation
- [ ] **Analytics Service**: Pre-aggregate metrics every 5 minutes (aggregated tables)
- [ ] **Real-Time Events**: WebSocket updates for active campaigns
- [ ] **Report Generation**: Export analytics to CSV/PDF
- [ ] **Custom Dashboards**: Drag-and-drop widget configuration
- [ ] **API Endpoints**: GET /analytics/campaigns/:id, GET /analytics/players/levels, POST /ab-tests
- [ ] **Database Optimization**: Indexes on all analytics queries, partitioning for events table

**Deliverables:**
- Campaign analytics dashboard
- Player progression analytics
- A/B testing framework
- Report export functionality

**Constitution Compliance:**
- Testing: Analytics calculations tested with AAA pattern (should_calculate_roi_correctly_when_campaign_completed)
- Performance: Dashboard loads < 5s (pre-aggregated data), real-time updates < 100ms latency
- Types: AnalyticsMetrics, ABTestConfig, ReportData interfaces

### Phase 5: Workflow & Administration
**Duration:** 2 weeks
**Dependencies:** Phase 2, Phase 3, Phase 4

**Tasks:**
- [ ] **User Roles & Permissions (FR-13)**: Role builder with permission selection (create, edit, delete, publish, view analytics, manage users, approve)
- [ ] **Role Assignment**: Assign users to roles (operator-scoped only)
- [ ] **Permission Enforcement**: UI hides/disables actions based on permissions
- [ ] **Approval Workflow**: Designated approver role required to publish campaigns
- [ ] **Budget Management (FR-15)**: Global operator budgets (monthly/weekly spending limits)
- [ ] **Budget Alerts**: Warning thresholds (80%, 90%, 100%) with notifications
- [ ] **Data Retention (FR-16)**: 90-day detailed retention with summary archival
- [ ] **Archival Jobs**: BullMQ scheduled jobs to move old campaigns to archive tables
- [ ] **Audit Logging**: All role/permission changes logged with operator context
- [ ] **API Endpoints**: POST /roles, PUT /roles/:id, POST /budgets, GET /audit-logs

**Deliverables:**
- Role management UI
- Budget tracking and alerts
- Data retention automation
- Audit logging dashboard

**Constitution Compliance:**
- Testing: Permission checks tested with AAA pattern (should_block_action_when_user_lacks_permission)
- Performance: Permission checks < 5ms (cached in JWT claims)
- Types: UserRole, Permission, BudgetConfig, AuditLog interfaces

## Testing Strategy

### Unit Testing
- **Coverage Target:** 80% minimum, 100% for critical paths (auth, operator isolation, campaign logic)
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `Should_ExpectedBehavior_When_StateUnderTest` (PascalCase for C#)
- **Tools:** xUnit 2.6+, NSubstitute 5.1+, FluentAssertions 6.12+
- **Mocking:** Use constructor injection with NSubstitute, avoid test-specific code in production

**Example Test:**
```csharp
public class CampaignServiceTests
{
    [Fact]
    public async Task Should_CreateCampaign_When_ValidConfigProvided()
    {
        // Arrange
        var repository = Substitute.For<ICampaignRepository>();
        var validator = Substitute.For<IValidator<MissionConfig>>();
        validator.ValidateAsync(Arg.Any<MissionConfig>(), Arg.Any<CancellationToken>())
            .Returns(new ValidationResult());
        repository.CreateAsync(Arg.Any<Campaign>(), Arg.Any<CancellationToken>())
            .Returns(new Campaign { Id = ObjectId.GenerateNewId(), Name = "Test Campaign" });

        var service = new CampaignService(repository, validator);
        var operatorId = ObjectId.GenerateNewId();
        var config = CreateValidMissionConfig();

        // Act
        var result = await service.CreateCampaignAsync(operatorId, config);

        // Assert
        result.Id.Should().NotBe(ObjectId.Empty);
    }

    [Fact]
    public async Task Should_ThrowException_When_UserLacksPermission()
    {
        // Arrange
        var repository = Substitute.For<ICampaignRepository>();
        var permissionService = Substitute.For<IPermissionService>();
        permissionService.HasPermissionAsync(Arg.Any<ObjectId>(), "campaigns.create", Arg.Any<CancellationToken>())
            .Returns(false);

        var service = new CampaignService(repository, permissionService);
        var operatorId = ObjectId.GenerateNewId();
        var userId = ObjectId.GenerateNewId();

        // Act
        Func<Task> act = async () => await service.CreateCampaignAsync(operatorId, config, userId);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Insufficient permissions*");
    }
}
```

### Integration Testing
- **Scope:** API endpoints, database interactions, operator isolation, external service integrations
- **Tools:** WebApplicationFactory (ASP.NET Core), Testcontainers.MongoDB (Dockerized MongoDB)
- **Coverage:** All API endpoints, critical user flows (create campaign, publish, monitor analytics)

**Critical Tests:**
- Operator isolation: Casino A cannot access Casino B campaigns (should return 403 Forbidden)
- MongoDB filtering: All repository queries automatically include OperatorId filter
- Auth flow: JWT token includes OperatorId claim, middleware extracts and validates correctly

### End-to-End Testing
- **Scope:** Critical user journeys only (to avoid flakiness)
- **Tools:** Playwright
- **Coverage:**
  - Authentication flow (login, operator selection, session management)
  - Campaign creation (mission builder, publish, verify active)
  - Analytics dashboard (load metrics, verify data accuracy)
  - Cross-operator isolation (login as Casino A, verify cannot see Casino B data)

### Performance Testing
- **API Load Testing:** k6 or NBomber (.NET load testing), target 100 RPS per endpoint
- **Frontend Performance:** Lighthouse CI, targets: LCP < 2.5s, FCP < 1.5s, TTI < 3.5s
- **Database Query Profiling:** MongoDB `explain()` for all complex queries, verify indexes used
- **Operator Isolation Overhead:** Measure OperatorId filter overhead (should be < 2ms with proper indexing)

## Performance Requirements

### Backend
- GET endpoints: < 200ms (p95)
- POST/PUT endpoints: < 500ms (p95)
- WebSocket latency: < 100ms
- Database queries: All indexed, no N+1 queries, no full table scans
- Campaign list pagination: < 2s for 100 items
- Analytics dashboard: < 5s load (via pre-aggregation)
- Operator context validation: < 10ms

### Frontend
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Bundle size: < 250KB gzipped per route (code splitting by campaign type)
- Campaign builder interaction: < 100ms (optimistic updates)
- Dashboard refresh: < 500ms (incremental updates)

### Database
- Connection pool: MongoDB driver default (min: 10, max: 100 connections)
- Query timeout: 5s max
- Indexes: Compound indexes ({ OperatorId: 1, Status: 1, CreatedAt: -1 }) on all collections
- OperatorId filter overhead: < 2ms per query (with proper indexing)
- Time-series collections: AnalyticsEvents collection for efficient time-based queries

## UX/UI Specifications

### Design System Compliance
- Components used: Button, Input, Select, Dropdown, Modal, Table, Card, Tabs, DatePicker, Chart (from design system)
- Custom components: CampaignBuilder (drag-and-drop), SegmentationBuilder (rule editor), LevelProgressPreview (visual timeline)
- Tokens: TailwindCSS custom config with brand colors, spacing scale (4px base), typography (Inter font)

### Accessibility Requirements
- WCAG Level: AA
- Keyboard navigation: Full support (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- Screen reader: Tested with NVDA (Windows), VoiceOver (Mac)
- Color contrast: All text meets 4.5:1 minimum (verified with axe DevTools)
- ARIA attributes:
  - Campaign builders: `aria-label`, `role="region"` for sections
  - Modals: `role="dialog"`, `aria-modal="true"`, focus trap
  - Tables: `role="table"`, `aria-sort` for sortable columns
  - Forms: `aria-invalid`, `aria-describedby` for error messages
- Focus indicators: 2px solid ring on all interactive elements
- Skip links: "Skip to main content" at top of page

### Responsive Breakpoints
- Mobile: 320px - 767px (campaign list only, builders require tablet+)
- Tablet: 768px - 1023px (simplified builders)
- Desktop: 1024px+ (full-featured builders with drag-and-drop)

## Security Considerations

- [x] **Input validation**: All user inputs validated with Zod schemas (frontend + backend)
- [x] **SQL injection prevention**: Prisma ORM with parameterized queries (no raw SQL)
- [x] **XSS prevention**: React auto-escapes, CSP headers configured
- [x] **Authentication/Authorization checks**: JWT validation on all routes, RBAC enforcement
- [x] **Rate limiting**: 100 RPM per user, 1000 RPM per operator
- [x] **Sensitive data encryption**: Database encryption at rest (AWS RDS), TLS 1.3 in transit
- [x] **Operator isolation**: PostgreSQL RLS policies enforce operatorId filtering at database layer
- [x] **Audit logging**: All mutations logged (user, operator, timestamp, action, before/after values)
- [x] **Session timeout**: 30 minutes inactivity, refresh token rotation
- [x] **CSRF protection**: SameSite cookies, CSRF tokens on state-changing operations
- [ ] **Security audit**: Schedule penetration testing before production launch

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All tests passing (unit 80%+, integration 100%, E2E critical paths)
- [ ] Performance benchmarks met (Lighthouse score > 90, API p95 < 500ms)
- [ ] Accessibility audit passed (WCAG AA, axe DevTools scan clean)
- [ ] Code review completed (2 approvals minimum)
- [ ] Documentation updated (API docs, component docs, user guide)
- [ ] Kubernetes manifests tested (deployments, services, ingress)
- [ ] MongoDB replica set configured and tested
- [ ] Rollback plan documented (Kubernetes rollback, database backups, feature flags)

### Rollout Plan
1. **Deploy to Staging**: Full deployment to staging Kubernetes cluster, run smoke tests
2. **QA Validation**: Manual testing of critical flows (campaign creation, operator isolation, analytics)
3. **Production Deployment (Kubernetes Rolling Update)**:
   - Update Kubernetes deployments with new container images
   - Kubernetes performs rolling update (one pod at a time)
   - Run health checks on each new pod before proceeding
   - Monitor for 1 hour (error rate, latency, operator isolation violations)
4. **Rollout Decision**:
   - If stable → Complete rollout
   - If issues detected → Rollback using `kubectl rollout undo deployment/back-office-api`

### Feature Flags
- `campaign.builder.mission` (enable/disable mission builder)
- `campaign.builder.bonus` (enable/disable bonus builder)
- `player.levels.enabled` (enable/disable level system)
- `player.badges.enabled` (enable/disable badge system)
- `analytics.realtime` (enable/disable WebSocket updates)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Operator isolation violation** | Low | Critical | Base repository pattern + comprehensive unit/integration tests + audit logging for detection |
| **Performance degradation at scale** | Medium | High | Pre-aggregate analytics, MongoDB indexing, load testing before launch, horizontal scaling via K8s |
| **Complex campaign builder UX** | Medium | Medium | User testing with marketing teams, iterative design, comprehensive help docs |
| **Data retention compliance** | Low | High | Automated archival jobs, GDPR export/deletion endpoints, legal review |
| **Third-party service downtime** | Medium | Medium | Retry logic with exponential backoff, fallback mechanisms, circuit breakers |
| **MongoDB replica set failure** | Low | High | Self-hosted MongoDB with replica set (3+ nodes), automated failover, regular backups |
| **Kubernetes cluster issues** | Medium | High | Multi-node cluster, pod disruption budgets, resource limits, health checks, rollback capability |

## Documentation Requirements

- [ ] **API documentation**: OpenAPI 3.0 spec with examples (hosted on Swagger UI)
- [ ] **Component documentation**: Storybook for all React components (campaign builders, analytics)
- [ ] **User guide**: Step-by-step tutorials for creating campaigns, configuring levels/badges
- [ ] **Architecture Decision Records (ADRs)**: Document multi-tenant design, RLS strategy, service architecture
- [ ] **README updates**: Setup instructions, environment variables, common issues
- [ ] **Changelog entry**: Version 1.0.0 release notes

## Dependencies

### External Dependencies
- **Backend (.NET 9)**:
  - MongoDB.Driver: 3.0+, official C# MongoDB driver
  - Hangfire: 1.8+, background job scheduling
  - FluentValidation: 11+, validation framework
  - Serilog: 3+, structured logging
  - AutoMapper: 13+, object-to-object mapping
  - NSubstitute: 5.1+, mocking framework for tests
- **Frontend**:
  - react: 19, UI library
  - @reduxjs/toolkit: 2+, state management
  - react-hook-form: 7+, form handling
  - recharts: 2+, analytics charts
  - tailwindcss: 3+, styling
- **Infrastructure**:
  - Docker: Container runtime for building images
  - Kubernetes: Self-hosted K8s cluster for orchestration
  - MongoDB: Self-hosted replica set (3+ nodes recommended)

### Internal Dependencies
- **Player Widget**: Consumes campaign data via API to display missions/bonuses/tournaments to players
- **Payment Gateway**: Required for bonus payouts, deposit match bonuses, cashback
- **Player Profile Service**: Provides player data for segmentation (tier, activity, geography)
- **Wallet Service**: Balance checks for rewards, transaction history for analytics
- **Notification Service**: Email/push notifications for campaign launches, level-ups, badge unlocks
- **Authentication Service**: OAuth2/SAML provider for Back Office login

### Team Dependencies
- **Design team**: Campaign builder wireframes, analytics dashboard mockups
- **Backend team**: Player API contracts, wallet API contracts, notification API contracts
- **DevOps/Infrastructure team**: Kubernetes cluster setup, MongoDB replica set configuration, container registry, ingress controller

## Timeline

| Phase | Duration | Owner |
|-------|----------|-------|
| Phase 0: Research & Architecture Setup | 1 week | Tech Lead |
| Phase 1: Foundation & Multi-Tenant Architecture | 3 weeks | Backend Team |
| Phase 2: Campaign Management Core | 5 weeks | Full Stack Team |
| Phase 3: Player Progression Systems | 4 weeks | Full Stack Team |
| Phase 4: Analytics & Optimization | 3 weeks | Backend + Frontend |
| Phase 5: Workflow & Administration | 2 weeks | Full Stack Team |

**Total Estimated Duration:** 18 weeks (4.5 months)

**Note**: Phases 2 and 3 can be partially parallelized after Phase 1 completes (2 teams working simultaneously).

## Success Criteria

The implementation is considered successful when:

1. **All phases completed** and tests passing (80%+ unit, 100% integration, E2E critical paths)
2. **Performance benchmarks met**: Dashboard < 5s, API p95 < 500ms, campaign creation < 10 minutes
3. **Accessibility audit passed**: WCAG AA, axe DevTools clean scan
4. **Code review approved**: 2+ approvals, no critical issues
5. **Documentation complete**: API docs, user guide, ADRs, Kubernetes deployment guides
6. **Deployed to production**: Kubernetes rolling update successful, all pods healthy
7. **Operator isolation verified**: Zero cross-operator access violations in production
8. **No critical issues in first week**: Post-launch stability confirmed
9. **User acceptance**: 3 operators successfully create campaigns without support

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] Security Review: [Name] - [Date]

---

**Last Updated:** 2025-01-24
**Next Review:** After Phase 0 completion

## Change Log

| Version | Date       | Changes                                                                                                |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2025-01-24 | Initial implementation plan with Node.js + PostgreSQL architecture                                     |
| 1.1.0   | 2025-01-24 | **MAJOR UPDATE**: Switched to .NET 9 + MongoDB architecture per technical requirements                 |
| 1.2.0   | 2025-01-24 | Updated to use NSubstitute for testing, self-hosted MongoDB + K8s, removed monitoring (added later)   |
| 1.3.0   | 2025-01-24 | Updated to React 19, aligned API structure with Clean Architecture (Api, Application, Domain, Infrastructure) |
