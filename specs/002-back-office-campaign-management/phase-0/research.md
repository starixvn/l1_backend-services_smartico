# Phase 0: Research & Architecture - Back Office Campaign Management

**Version:** 1.3.0
**Created:** 2025-01-24
**Last Updated:** 2025-01-24
**Status:** Complete
**Phase Duration:** 1 week

**IMPORTANT UPDATE (v1.1.0)**: Updated to use .NET 9 backend and MongoDB database per technical requirements.
**IMPORTANT UPDATE (v1.2.0)**: Updated to use NSubstitute for testing, self-hosted MongoDB, Kubernetes hosting.
**IMPORTANT UPDATE (v1.3.0)**: Updated to use React 19 and aligned API structure with existing Clean Architecture pattern (Api, Application, Domain, Infrastructure layers).

## Purpose

This document captures the research findings, architecture decisions, and resolution of unknowns required before implementation of the Back Office Campaign Management system using **.NET 9** and **MongoDB**. It serves as the foundation for all subsequent phases.

## Executive Summary

The Back Office Campaign Management system will be built as a **multi-tenant SaaS platform** with strict operator-level data isolation enforced at the **application layer** using MongoDB with automatic `OperatorId` filtering. The architecture follows **Clean Architecture** principles (Api → Application → Domain ← Infrastructure) built on **ASP.NET Core 9** with separate services for campaigns, player progression, and analytics, all using MongoDB.Driver for data access.

**Key Decision**: Multi-tenant architecture with operator isolation is critical. Every MongoDB document includes an `OperatorId` field, and all queries are automatically filtered by the authenticated user's operator context via a custom base repository pattern.

## Unknowns Resolved

### 1. Multi-Tenant Architecture Strategy

**Question**: How do we ensure Casino A cannot access Casino B's data? Should we use separate databases per operator or single database with isolation?

**Resolution**: **Single MongoDB database with application-level `OperatorId` filtering via base repository pattern**

**Rationale**:
- **Cost-effective**: Single MongoDB cluster reduces infrastructure costs
- **Maintenance**: Single schema (MongoDB collections) for all operators
- **Flexibility**: MongoDB's document model handles varying campaign configurations naturally
- **Scalability**: MongoDB Atlas horizontal scaling with sharding by OperatorId
- **Security**: Application-layer filtering enforced via base repository pattern with comprehensive unit tests
- **Trade-off**: Requires strict discipline in repository implementation (all queries MUST filter by OperatorId)

**Implementation**:
```csharp
// Base repository with automatic OperatorId filtering
public abstract class BaseRepository<T> where T : IOperatorScoped
{
    private readonly IMongoCollection<T> _collection;
    private readonly ObjectId _operatorId;

    protected BaseRepository(IMongoDatabase database, ObjectId operatorId, string collectionName)
    {
        _collection = database.GetCollection<T>(collectionName);
        _operatorId = operatorId;
    }

    public async Task<List<T>> FindAsync(FilterDefinition<T> filter, CancellationToken ct = default)
    {
        // Automatically add OperatorId filter to all queries
        var operatorFilter = Builders<T>.Filter.Eq(x => x.OperatorId, _operatorId);
        var combinedFilter = Builders<T>.Filter.And(filter, operatorFilter);

        return await _collection.Find(combinedFilter).ToListAsync(ct);
    }
}

// All documents implement IOperatorScoped
public interface IOperatorScoped
{
    ObjectId OperatorId { get; set; }
}
```

### 2. Campaign Configuration Storage

**Question**: Should campaign configurations (trigger rules, goals, rewards) be stored as structured fields or embedded documents?

**Resolution**: **MongoDB embedded documents with C# record types and FluentValidation**

**Rationale**:
- **Natural Fit**: MongoDB's document model perfectly suited for varying campaign configurations
- **Type Safety**: C# record types with nullable reference types ensure compile-time validation
- **Flexibility**: Different campaign types (missions, bonuses, tournaments) have different schemas
- **Query Performance**: MongoDB supports indexing on embedded document fields
- **Schema Evolution**: Adding new campaign types doesn't require migrations
- **No ORM Impedance**: Direct mapping between C# objects and BSON documents

**Example**:
```csharp
// C# record types for type-safe configuration
public record MissionConfig
{
    public required TriggerType TriggerType { get; init; }
    public required TriggerCondition TriggerCondition { get; init; }
    public required List<Goal> Goals { get; init; }
    public required List<Reward> Rewards { get; init; }
}

// MongoDB document
public class Campaign : IOperatorScoped
{
    [BsonId]
    public ObjectId Id { get; set; }
    public ObjectId OperatorId { get; set; }
    public string Name { get; set; } = string.Empty;
    public CampaignType Type { get; set; }

    // Embedded document - stored as BSON
    public MissionConfig? MissionConfig { get; set; }
    public BonusConfig? BonusConfig { get; set; }
}
```

### 3. Real-Time Analytics Performance

**Question**: How do we load analytics dashboards in < 5 seconds with millions of events?

**Resolution**: **MongoDB aggregation pipeline with pre-aggregated collections updated every 5 minutes via Hangfire jobs**

**Rationale**:
- **Performance**: Dashboard queries pre-aggregated collections (not raw events)
- **MongoDB Aggregation**: Powerful $group, $match, $project operators for complex analytics
- **Time-Series Collections**: MongoDB 5.0+ time-series collections optimized for event data
- **Scalability**: Aggregation offloaded to Hangfire background jobs
- **Real-Time**: 5-minute delay acceptable for analytics (not player-facing)
- **Trade-off**: Slightly stale data (max 5 minutes behind)

**Architecture**:
```
Raw Events Collection (CampaignEvents - time-series collection)
    ↓
Hangfire Job (every 5 minutes)
    ↓
MongoDB Aggregation Pipeline ($group by campaign, hour)
    ↓
Pre-Aggregated Collection (CampaignMetricsHourly)
    ↓
.NET API (queries aggregated data via LINQ)
    ↓
Dashboard (SignalR real-time updates)
```

### 4. Player Segmentation Engine

**Question**: How do we efficiently query player segments (tier, level, badge, activity, geography)?

**Resolution**: **Materialized player profile table updated on player events**

**Rationale**:
- **Performance**: Segment queries hit single denormalized table
- **Freshness**: Updated on relevant events (level-up, badge unlock, deposit)
- **Complexity**: Segment builder generates SQL WHERE clauses
- **Trade-off**: Eventual consistency (profile updated async)

**Schema**:
```sql
CREATE TABLE player_profiles (
  player_id INTEGER PRIMARY KEY,
  operator_id INTEGER NOT NULL,
  current_level INTEGER,
  current_tier VARCHAR(50),
  badge_count INTEGER,
  total_deposits DECIMAL,
  last_activity_at TIMESTAMP,
  country_code VARCHAR(2),
  -- ... other denormalized fields
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_player_profiles_operator_level
ON player_profiles(operator_id, current_level);
```

### 5. XP Calculation Performance

**Question**: Should XP calculations happen synchronously (on player action) or asynchronously (batch processing)?

**Resolution**: **Synchronous calculation with optimistic locking and caching**

**Rationale**:
- **User Experience**: Players expect immediate XP feedback
- **Accuracy**: Synchronous ensures no missed actions
- **Performance**: Redis cache for XP rules (< 10ms lookup)
- **Concurrency**: Optimistic locking prevents race conditions
- **Trade-off**: Requires high-availability Redis

**Flow**:
```
Player Action (bet $10)
    ↓
XP Engine (cache XP rules)
    ↓
Calculate XP (10 XP = $1 bet)
    ↓
Update Player Level (optimistic lock)
    ↓
Check Level-Up (trigger rewards)
    ↓
Return Response (new XP, level, rewards)
```

### 6. Badge Unlock Tracking

**Question**: How do we efficiently check badge unlock criteria for millions of players?

**Resolution**: **Event-driven badge checks triggered only on relevant actions**

**Rationale**:
- **Efficiency**: Only check badges related to action (bet → wager badges)
- **Scalability**: Avoid full badge scan per player action
- **Real-Time**: Unlock immediately when criteria met
- **Trade-off**: Requires badge metadata (trigger types)

**Example**:
```typescript
// Badge metadata
Badge: "High Roller"
  triggerType: "wager_total"
  criteria: { amount: 10000 }

// On player bet event
if (action.type === 'bet') {
  const relevantBadges = badges.filter(b => b.triggerType === 'wager_total');
  for (const badge of relevantBadges) {
    if (player.totalWagers >= badge.criteria.amount) {
      unlockBadge(player, badge);
    }
  }
}
```

### 7. Campaign Scheduling Accuracy

**Question**: How do we ensure campaigns start/end at exact times across timezones?

**Resolution**: **BullMQ delayed jobs scheduled in UTC with timezone-aware UI**

**Rationale**:
- **Consistency**: All internal times in UTC
- **Accuracy**: BullMQ delayed jobs (sub-second precision)
- **UX**: UI shows operator's timezone (converted from UTC)
- **Reliability**: Redis persistence ensures jobs survive restarts
- **Trade-off**: Requires timezone conversion logic in UI

**Implementation**:
```typescript
// User selects: "2025-02-01 10:00 AM PST"
// UI converts to UTC: "2025-02-01 18:00:00 UTC"
// Backend schedules job:
await campaignQueue.add('start-campaign',
  { campaignId: 123 },
  { delay: calculateDelay('2025-02-01T18:00:00Z') }
);
```

### 8. Approval Workflow Complexity

**Question**: Should approval workflow support multi-level approvals or single-level?

**Resolution**: **Single-level operator-scoped approval (per user clarification)**

**Rationale**:
- **Simplicity**: Single approver role per operator
- **Flexibility**: Can assign multiple users to approver role
- **Performance**: No workflow state machine required
- **Trade-off**: Cannot model complex multi-level approvals (acceptable per spec)

**States**:
```
Draft → [Publish Request] → Pending Approval
Pending Approval → [Approve] → Active
Pending Approval → [Reject] → Draft
```

### 9. Data Retention and Archival

**Question**: How do we archive campaigns after 90 days without losing historical data?

**Resolution**: **Partition campaigns table by created_at, move to archive table with summary metrics**

**Rationale**:
- **Performance**: Active campaigns table stays small
- **Compliance**: Detailed data archived after 90 days
- **Analytics**: Summary metrics retained indefinitely
- **Cost**: Archive table can use cheaper storage tier
- **Trade-off**: Requires BullMQ archival jobs

**Schema**:
```sql
-- Active campaigns (< 90 days)
CREATE TABLE campaigns (...) PARTITION BY RANGE (created_at);

-- Archived campaigns (> 90 days, summary only)
CREATE TABLE campaigns_archive (
  id INTEGER PRIMARY KEY,
  operator_id INTEGER,
  name VARCHAR(255),
  type VARCHAR(50),
  total_participants INTEGER,
  total_cost DECIMAL,
  total_revenue DECIMAL,
  roi DECIMAL,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### 10. Budget Management Enforcement

**Question**: Should budget limits block campaign creation or just warn?

**Resolution**: **Warning thresholds (80%, 90%, 100%) with UI alerts, no hard blocking**

**Rationale**:
- **Flexibility**: Operators can choose to override (per spec: "warnings")
- **UX**: Alerts notify budget issues without blocking critical campaigns
- **Audit**: All overrides logged for compliance
- **Trade-off**: Risk of over-spending (mitigated by alerts)

**Implementation**:
```typescript
// Check budget before publish
const budget = await budgetService.checkBudget(operatorId, campaignCost);

if (budget.percentageUsed >= 100) {
  return { warning: 'Budget limit reached (100%)', allowOverride: true };
} else if (budget.percentageUsed >= 90) {
  return { warning: 'Budget limit nearly reached (90%)', allowOverride: true };
} else if (budget.percentageUsed >= 80) {
  return { info: 'Budget warning (80% used)', allowOverride: true };
}
```

## Architecture Decisions

### AD-1: Clean Architecture with Service-Oriented Application Layer

**Decision**: Follow Clean Architecture pattern with separate services for Campaign, Player Progression, and Analytics in Application layer

**Context**: System has 3 distinct domains with different scaling characteristics, and must align with existing Smartico backend architecture

**Solution Structure**:
```
Smartico.BackOffice.sln
├── src/
    ├── Smartico.BackOffice.Api/               # API Layer (Controllers + SignalR Hubs)
    ├── Smartico.BackOffice.Application/       # Application Layer (Services + Use Cases)
    ├── Smartico.BackOffice.Domain/            # Domain Layer (Entities + Interfaces)
    └── Smartico.BackOffice.Infrastructure/    # Infrastructure Layer (MongoDB + External Services)
```

**Clean Architecture Dependency Flow**:
```
Api → Application → Domain ← Infrastructure
```
- **Api** depends on Application & Infrastructure (for DI registration)
- **Application** depends on Domain (contains interfaces)
- **Infrastructure** depends on Domain (implements interfaces)
- **Domain** has no dependencies (pure business logic)

**Decision Rationale**:
- **Pros**: Clear separation of concerns, testable in isolation, matches existing Smartico.Missions architecture
- **Cons**: More project structure than monolith, requires proper dependency management
- **Trade-off**: More complex project structure for long-term maintainability and testability

**Implementation**:
```csharp
// Domain Layer - Interfaces (Smartico.BackOffice.Domain/Services/)
public interface ICampaignService
{
    Task<Campaign> CreateCampaignAsync(ObjectId operatorId, CampaignConfig config, CancellationToken ct = default);
    Task PublishCampaignAsync(ObjectId operatorId, ObjectId campaignId, CancellationToken ct = default);
}

public interface IPlayerProgressionService
{
    Task<LevelUpdate> AwardXPAsync(ObjectId operatorId, ObjectId playerId, int amount, CancellationToken ct = default);
    Task<Badge> UnlockBadgeAsync(ObjectId operatorId, ObjectId playerId, ObjectId badgeId, CancellationToken ct = default);
}

// Application Layer - Implementation (Smartico.BackOffice.Application/Services/)
public class CampaignService : ICampaignService
{
    private readonly ICampaignRepository _repository;
    private readonly IValidator<CampaignConfig> _validator;

    public CampaignService(ICampaignRepository repository, IValidator<CampaignConfig> validator)
    {
        _repository = repository;
        _validator = validator;
    }

    // Implementation...
}

// Infrastructure Layer - Repositories (Smartico.BackOffice.Infrastructure/Repositories/)
public class CampaignRepository : BaseRepository<Campaign>, ICampaignRepository
{
    public CampaignRepository(IMongoDatabase database, ObjectId operatorId)
        : base(database, operatorId, "campaigns") { }
}

// Api Layer - Controllers (Smartico.BackOffice.Api/Controllers/)
[ApiController]
[Route("api/campaigns")]
public class CampaignsController : ControllerBase
{
    private readonly ICampaignService _campaignService;

    public CampaignsController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
    }

    // Endpoints...
}
```

### AD-2: MongoDB Application-Level Operator Isolation

**Decision**: Use MongoDB with application-level filtering via BaseRepository pattern

**Context**: Multi-tenant architecture requires zero cross-operator data access

**Alternatives Considered**:
1. Application-level filtering via BaseRepository (WHERE operator_id = ?)
2. Separate MongoDB database per operator
3. PostgreSQL with Row-Level Security (RLS) policies

**Decision Rationale**:
- **Option 1 selected**: Application-level filtering with BaseRepository pattern
- **Pros**: Works with MongoDB document model, flexible schema evolution, comprehensive testing possible
- **Cons**: Requires strict discipline in repository implementation, security enforced at application layer
- **Trade-off**: Flexibility and MongoDB benefits over database-enforced isolation

**Implementation**: See "Unknown #1" above (BaseRepository pattern with automatic OperatorId filtering)

### AD-3: C# Nullable Reference Types and TypeScript Strict Mode

**Decision**: Enable C# nullable reference types for backend and TypeScript strict mode for frontend

**Context**: Type safety is critical for complex campaign configurations

**Backend Configuration (C# Nullable Reference Types)**:
```xml
<!-- In all .csproj files -->
<PropertyGroup>
  <Nullable>enable</Nullable>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
</PropertyGroup>
```

**Frontend Configuration (TypeScript Strict Mode)**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Rationale**:
- **Pros**: Catch errors at compile-time, self-documenting code, null safety in both backend and frontend
- **Cons**: Slower development initially (more explicit types and null handling)
- **Trade-off**: Short-term friction for long-term stability

### AD-4: Redux Toolkit for State Management

**Decision**: Use Redux Toolkit + RTK Query for frontend state

**Context**: Complex campaign builders require centralized state and data fetching

**Alternatives Considered**:
1. React Context + useReducer
2. Zustand
3. Redux Toolkit
4. Jotai

**Decision Rationale**:
- **Option 3 selected**: Redux Toolkit
- **Pros**: Mature, RTK Query handles caching/invalidation, DevTools
- **Cons**: More boilerplate than alternatives
- **Trade-off**: Maturity over simplicity (critical for complex UI)

### AD-5: MongoDB.Driver for Type-Safe Database Access

**Decision**: Use MongoDB.Driver (official C# driver) with LINQ support

**Context**: Need type-safe database layer with operator filtering and MongoDB document model

**Alternatives Considered**:
1. Raw MongoDB queries (BsonDocument)
2. Entity Framework Core MongoDB provider
3. MongoDB.Driver with LINQ
4. Third-party ODM (e.g., MongoFramework)

**Decision Rationale**:
- **Option 3 selected**: MongoDB.Driver with LINQ
- **Pros**: Official driver, LINQ support, strongly-typed queries, no ORM impedance mismatch
- **Cons**: Less abstraction than full ODM
- **Trade-off**: Direct MongoDB access with type safety over ORM abstraction

**Example**:
```csharp
// Domain entity
public class Campaign : IOperatorScoped
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("operatorId")]
    [BsonRequired]
    public ObjectId OperatorId { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("config")]
    public MissionConfig? MissionConfig { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// Type-safe query with LINQ
var campaigns = await _collection
    .Find(c => c.OperatorId == operatorId && c.Status == CampaignStatus.Active)
    .SortByDescending(c => c.CreatedAt)
    .ToListAsync();

// Or using Builders pattern
var filter = Builders<Campaign>.Filter.And(
    Builders<Campaign>.Filter.Eq(c => c.OperatorId, operatorId),
    Builders<Campaign>.Filter.Eq(c => c.Status, CampaignStatus.Active)
);
var campaigns = await _collection.Find(filter).ToListAsync();
```

## Technical Stack Finalization

### Backend
- **Framework**: ASP.NET Core 9.0 (.NET 9 LTS until November 2026)
- **Language**: C# 13 (nullable reference types, records, pattern matching)
- **Database**: MongoDB 8.0+ (self-hosted, document-oriented, horizontal scaling)
- **ODM**: MongoDB.Driver 3.0+ (official C# driver, LINQ support)
- **Queue**: Hangfire 1.8+ (background jobs, MongoDB storage)
- **Auth**: ASP.NET Core Identity + JWT (OAuth2/SAML integration)
- **Validation**: FluentValidation 11+ (strongly-typed validation rules)
- **Testing**: xUnit 2.6+, NSubstitute 5.1+, FluentAssertions 6.12+, Testcontainers.MongoDB

### Frontend
- **Library**: React 19 (latest stable release with concurrent features)
- **Language**: TypeScript 5.3+ (strict mode)
- **State**: Redux Toolkit 2+ + RTK Query (data fetching)
- **Styling**: TailwindCSS 3.4+ (utility-first)
- **Forms**: React Hook Form 7+ + Zod validation
- **Charts**: Recharts 2+ (composable charts)
- **Router**: React Router 6+ (nested routes)
- **Testing**: Jest 29+, React Testing Library, Playwright

### DevOps
- **CI/CD**: GitHub Actions (automated testing, Docker builds, deployment to K8s)
- **Hosting**: Self-hosted Kubernetes cluster (K8s deployments for .NET API and frontend)
- **Database**: Self-hosted MongoDB replica set (3+ nodes for high availability)
- **Container Registry**: Docker Hub or private registry
- **Logging**: Structured JSON logs (Serilog), centralized logging solution TBD

## Database Design Principles

### 1. Every MongoDB Document Has OperatorId

**Principle**: All MongoDB documents must include `OperatorId` field (ObjectId type)

**Example**:
```csharp
public class Campaign : IOperatorScoped
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("operatorId")]
    [BsonRequired]
    public ObjectId OperatorId { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    // ... other fields
}

// MongoDB index creation
var indexKeysDefinition = Builders<Campaign>.IndexKeys
    .Ascending(c => c.OperatorId)
    .Ascending(c => c.Status)
    .Descending(c => c.CreatedAt);

await collection.Indexes.CreateOneAsync(
    new CreateIndexModel<Campaign>(indexKeysDefinition,
        new CreateIndexOptions { Name = "idx_operator_status_created" })
);
```

### 2. Base Repository Pattern for Automatic Filtering

**Principle**: All data access goes through base repository that automatically adds OperatorId filter

**Template**:
```csharp
public abstract class BaseRepository<T> where T : IOperatorScoped
{
    protected readonly IMongoCollection<T> Collection;
    protected readonly ObjectId OperatorId;

    protected BaseRepository(IMongoDatabase database, ObjectId operatorId, string collectionName)
    {
        Collection = database.GetCollection<T>(collectionName);
        OperatorId = operatorId;
    }

    // All queries automatically filtered by OperatorId
    protected FilterDefinition<T> AddOperatorFilter(FilterDefinition<T> filter)
    {
        var operatorFilter = Builders<T>.Filter.Eq(x => x.OperatorId, OperatorId);
        return Builders<T>.Filter.And(filter, operatorFilter);
    }
}
```

### 3. Audit Logging for All Mutations

**Principle**: All INSERT/UPDATE/DELETE operations logged

**Schema**:
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  operator_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  before_data JSONB, -- NULL for INSERT
  after_data JSONB,  -- NULL for DELETE
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_operator_table
ON audit_logs(operator_id, table_name, created_at DESC);
```

### 4. Indexes for Performance

**Principle**: Index all foreign keys and frequent query filters

**Required Indexes**:
```sql
-- Foreign keys
CREATE INDEX idx_{table}_operator ON {table}(operator_id);

-- Status + timestamp queries
CREATE INDEX idx_campaigns_status_created
ON campaigns(operator_id, status, created_at DESC);

-- Segmentation queries
CREATE INDEX idx_player_profiles_operator_level
ON player_profiles(operator_id, current_level);

-- Analytics queries
CREATE INDEX idx_campaign_events_campaign_time
ON campaign_events(campaign_id, created_at DESC);
```

## API Design Principles

### 1. RESTful Endpoints with Operator Context

**Principle**: All endpoints require authentication, operatorId extracted from JWT

**Pattern**:
```
GET    /api/campaigns              - List campaigns (for authenticated operator)
POST   /api/campaigns              - Create campaign
GET    /api/campaigns/:id          - Get campaign details
PUT    /api/campaigns/:id          - Update campaign
DELETE /api/campaigns/:id          - Delete campaign
POST   /api/campaigns/:id/publish  - Publish campaign
```

**Request Flow**:
```typescript
// 1. Extract operatorId from JWT
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, SECRET);
const operatorId = decoded.operatorId;

// 2. Set PostgreSQL context
await prisma.$executeRaw`SET LOCAL app.current_operator_id = ${operatorId}`;

// 3. Query with operator filtering (automatic via RLS)
const campaigns = await prisma.campaign.findMany({
  where: { status: 'active' } // RLS adds: AND operator_id = 123
});
```

### 2. Consistent Error Responses

**Principle**: All errors follow RFC 7807 Problem Details format

**Structure**:
```typescript
interface ErrorResponse {
  type: string;       // e.g., "validation_error", "permission_denied"
  title: string;      // Human-readable title
  status: number;     // HTTP status code
  detail?: string;    // Detailed error message
  instance?: string;  // Request ID for tracking
  errors?: Array<{    // Validation errors
    field: string;
    message: string;
  }>;
}

// Example
{
  "type": "validation_error",
  "title": "Invalid campaign configuration",
  "status": 400,
  "detail": "Mission trigger type must be one of: deposit, bet, win, login",
  "instance": "/api/campaigns",
  "errors": [
    { "field": "config.triggerType", "message": "Invalid trigger type 'invalid'" }
  ]
}
```

### 3. Pagination for List Endpoints

**Principle**: All list endpoints support cursor-based pagination

**Query Parameters**:
```
?limit=20           - Items per page (max 100, default 20)
?cursor=eyJpZCI6MTIzfQ==  - Cursor for next page (base64-encoded)
?sort=createdAt     - Sort field (default: createdAt)
?order=desc         - Sort order (asc/desc, default: desc)
```

**Response**:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    total?: number; // Optional (expensive to compute)
  };
}
```

## Security Implementation Details

### 1. JWT Token Structure

**Claims**:
```typescript
interface JWTPayload {
  sub: number;          // User ID
  operatorId: number;   // Operator ID (critical for isolation)
  permissions: string[]; // User permissions (cached)
  iat: number;          // Issued at
  exp: number;          // Expiry (30 minutes)
}
```

### 2. Permission Checks

**Middleware**:
```typescript
function requirePermission(permission: string) {
  return (req, res, next) => {
    const token = extractToken(req);
    if (!token.permissions.includes(permission)) {
      return res.status(403).json({
        type: 'permission_denied',
        title: 'Insufficient permissions',
        status: 403,
        detail: `Required permission: ${permission}`
      });
    }
    next();
  };
}

// Usage
app.post('/api/campaigns',
  requirePermission('campaigns.create'),
  createCampaignHandler
);
```

### 3. Rate Limiting

**Configuration**:
```typescript
import rateLimit from 'express-rate-limit';

// Per-user rate limit
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => req.user.id.toString(),
  handler: (req, res) => {
    res.status(429).json({
      type: 'rate_limit_exceeded',
      title: 'Too many requests',
      status: 429,
      detail: 'You have exceeded the rate limit of 100 requests per minute'
    });
  }
});

// Per-operator rate limit (higher)
const operatorLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.user.operatorId.toString()
});

app.use('/api', userLimiter, operatorLimiter);
```

## Performance Optimization Strategy

### 1. Database Query Optimization

**Guidelines**:
- Index all foreign keys
- Use EXPLAIN ANALYZE for complex queries
- Avoid N+1 queries (use Prisma's include)
- Partition large tables (events, audit_logs)
- Use materialized views for complex aggregations

**Example**:
```sql
-- Before (N+1 query)
campaigns.forEach(campaign => {
  const participants = await getParticipants(campaign.id);
});

-- After (single query with join)
const campaigns = await prisma.campaign.findMany({
  include: {
    _count: {
      select: { participants: true }
    }
  }
});
```

### 2. Redis Caching Strategy

**What to Cache**:
```typescript
// Campaign configurations (rarely change)
cache.set(`campaign:${id}:config`, config, { ttl: 300 }); // 5 minutes

// XP rules (rarely change)
cache.set(`xp-rules:${operatorId}`, rules, { ttl: 600 }); // 10 minutes

// Player profiles (updated on events)
cache.set(`player:${id}:profile`, profile, { ttl: 60 }); // 1 minute

// Permissions (change on role update)
cache.set(`user:${id}:permissions`, permissions, { ttl: 300 }); // 5 minutes
```

### 3. Frontend Performance

**Code Splitting**:
```typescript
// Route-based splitting
const CampaignBuilder = lazy(() => import('./pages/CampaignBuilder'));
const Analytics = lazy(() => import('./pages/Analytics'));

// Campaign type splitting
const MissionBuilder = lazy(() => import('./components/MissionBuilder'));
const BonusBuilder = lazy(() => import('./components/BonusBuilder'));
```

**Optimistic Updates**:
```typescript
// Update UI immediately, rollback on error
const mutation = useMutation({
  mutationFn: updateCampaign,
  onMutate: async (newData) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries(['campaigns', id]);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['campaigns', id]);

    // Optimistically update
    queryClient.setQueryData(['campaigns', id], newData);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['campaigns', id], context.previous);
  }
});
```

## Testing Strategy

### 1. Unit Test Coverage Requirements

**Targets**:
- Services: 90%+ coverage
- Utilities: 100% coverage
- React components: 80%+ coverage
- Hooks: 90%+ coverage

**Critical Paths (100% coverage)**:
- Authentication and authorization
- Operator isolation logic
- XP calculation
- Badge unlock logic
- Budget validation

### 2. Integration Test Focus

**Must Test**:
- Operator isolation (Casino A cannot access Casino B data)
- RLS policy enforcement
- JWT authentication flow
- Campaign lifecycle (draft → publish → active)
- XP award and level-up
- Badge unlock and notification

### 3. E2E Test Scope

**Critical Journeys**:
1. Login → Create Mission → Publish → Monitor Analytics
2. Login → Configure Level System → Preview Player Journey
3. Login → Create Badge → Verify Unlock Criteria
4. Login as Casino A → Verify Cannot See Casino B Data

## Next Steps

### Phase 1 Preparation

**Immediate Actions**:
1. Set up Clean Architecture solution structure following existing Smartico.Missions pattern:
   - Create `Smartico.BackOffice.sln` solution file
   - Create `src/Smartico.BackOffice.Api/` (API Layer: Controllers + SignalR Hubs)
   - Create `src/Smartico.BackOffice.Application/` (Application Layer: Services + Use Cases)
   - Create `src/Smartico.BackOffice.Domain/` (Domain Layer: Entities + Interfaces)
   - Create `src/Smartico.BackOffice.Infrastructure/` (Infrastructure Layer: MongoDB + External Services)
2. Configure C# nullable reference types + StyleCop + EditorConfig
3. Initialize MongoDB connection with MongoDB.Driver
4. Create base ASP.NET Core app with auth middleware
5. Set up React 19 app with Redux Toolkit
6. Configure CI/CD pipeline (GitHub Actions)

**Required Deliverables for Phase 1**:
- [ ] Clean Architecture solution structure created
- [ ] C# nullable reference types + TypeScript strict mode configured
- [ ] MongoDB connection initialized with BaseRepository pattern
- [ ] Base ASP.NET Core API with health checks
- [ ] React 19 app with auth scaffolding
- [ ] CI/CD pipeline running tests (xUnit + NSubstitute)

## Conclusion

All critical unknowns have been resolved, and architecture decisions have been documented. The system will be built as a **multi-tenant SaaS platform** with **MongoDB application-level operator isolation** via base repository pattern, **.NET 9 Clean Architecture** (Api → Application → Domain ← Infrastructure), **React 19 frontend**, and **MongoDB aggregation pipeline for pre-aggregated analytics**.

**Ready to Proceed**: Phase 1 (Foundation & Multi-Tenant Architecture) can begin immediately after Phase 0 approval.

---

**Document Status**: Complete
**Reviewed By**: [Pending]
**Approved By**: [Pending]
**Approval Date**: [Pending]

## Change Log

| Version | Date       | Changes                                                                                          |
| ------- | ---------- | ------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2025-01-24 | Initial research with Node.js + PostgreSQL architecture                                          |
| 1.1.0   | 2025-01-24 | **MAJOR UPDATE**: Switched to .NET 9 + MongoDB architecture, updated all unknowns and decisions |
| 1.2.0   | 2025-01-24 | Updated to NSubstitute for testing, self-hosted MongoDB + K8s hosting, removed monitoring       |
| 1.3.0   | 2025-01-24 | Updated to React 19, aligned with Clean Architecture pattern (Api, Application, Domain, Infrastructure) |
