# Smartico Gamification Platform - Architecture Implementation

> **Concise technical architecture overview without code details**

---

## 🏗️ System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│                  (React 19 + TypeScript)                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐│
│  │  Missions  │ │  Bonuses   │ │ Mini Games │ │Tournmts││
│  │    Tab     │ │    Tab     │ │    Tab     │ │  Tab   ││
│  └────────────┘ └────────────┘ └────────────┘ └────────┘│
└────────────┬──────────────────────┬────────────────────────┘
             │                      │
             │ HTTP REST API        │ WebSocket (SignalR)
             │ (JSON)               │ (Real-time Events)
             │                      │
┌────────────▼──────────────────────▼────────────────────────┐
│                      API LAYER                             │
│              (.NET 9 / ASP.NET Core 9)                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         RESTful Controllers + SignalR Hub           │  │
│  │  [Missions] [Bonuses] [MiniGames] [Tournaments]    │  │
│  │              [ProgressHub - SignalR]                │  │
│  └──────────────┬──────────────────────────────────────┘  │
│                 │                                          │
│                 │ MediatR (CQRS)                          │
│                 │                                          │
│  ┌──────────────▼──────────────────────────────────────┐  │
│  │            APPLICATION LAYER                        │  │
│  │         (Business Logic - CQRS Handlers)           │  │
│  │  ┌──────────────┐        ┌──────────────────────┐  │  │
│  │  │   Queries    │        │      Commands        │  │  │
│  │  │  (Read ops)  │        │   (Write ops)        │  │  │
│  │  │  + Caching   │        │ + Validation         │  │  │
│  │  └──────────────┘        │ + Cache Invalidation │  │  │
│  │                          │ + SignalR Broadcast  │  │  │
│  │                          └──────────────────────┘  │  │
│  └──────────────┬──────────────────────────────────────┘  │
│                 │                                          │
│  ┌──────────────▼──────────────────────────────────────┐  │
│  │              DOMAIN LAYER                           │  │
│  │         (Entities, Enums, Interfaces)              │  │
│  │  - Mission, Bonus, MiniGame, Tournament            │  │
│  │  - IProgressBroadcaster (Unified Interface)        │  │
│  │  - ISmartico*ApiClient (Repository Pattern)        │  │
│  └──────────────┬──────────────────────────────────────┘  │
│                 │                                          │
│  ┌──────────────▼──────────────────────────────────────┐  │
│  │          INFRASTRUCTURE LAYER                       │  │
│  │  ┌──────────────────┐  ┌──────────────────────────┐│  │
│  │  │ SignalR Service  │  │  Smartico API Clients    ││  │
│  │  │ (Broadcaster)    │  │  (Demo Data + Future)    ││  │
│  │  └──────────────────┘  └──────────────────────────┘│  │
│  │  ┌──────────────────┐  ┌──────────────────────────┐│  │
│  │  │  Cache Service   │  │  Dependency Injection    ││  │
│  │  │  (Memory 30s)    │  │  Configuration           ││  │
│  │  └──────────────────┘  └──────────────────────────┘│  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 📐 Clean Architecture Layers

### 1. Domain Layer (Core Business Logic)
**Location**: `Smartico.Missions.Domain/`

**Entities**:
- Mission, Badge
- Bonus, ClaimBonusResult
- MiniGame, MiniGamePrize, PlayMiniGameResult
- Tournament, TournamentPrize, TournamentParticipant, RegisterTournamentResult

**Enums**: 15+ enums for status, types, and classifications

**Interfaces**:
- `IProgressBroadcaster` - Unified SignalR event broadcaster (12 events)
- `ISmartico*ApiClient` - Repository abstractions for each feature

**Principles**:
- No dependencies on external layers
- Pure business logic
- Framework-agnostic

### 2. Application Layer (Use Cases)
**Location**: `Smartico.Missions.Application/`

**Pattern**: CQRS (Command Query Responsibility Segregation) via MediatR

**Queries** (Read Operations):
- `GetMissionsQuery` → Handler → Response
- `GetBonusesQuery` → Handler (30s cache) → Response
- `GetMiniGamesQuery` → Handler (30s cache) → Response
- `GetTournamentsQuery` → Handler (30s cache) → Response
- `GetLeaderboardQuery` → Handler (30s cache) → Response

**Commands** (Write Operations):
- `OptInMissionCommand` → Validator → Handler → Response
- `ClaimRewardCommand` → Validator → Handler → Response
- `ClaimBonusCommand` → Validator → Handler (cache invalidation + broadcast) → Response
- `PlayMiniGameCommand` → Validator → Handler (cache invalidation + broadcast) → Response
- `RegisterTournamentCommand` → Validator → Handler (cache invalidation) → Response

**Features**:
- FluentValidation for all commands
- Cache invalidation on state changes
- SignalR broadcasting for real-time updates
- Logging at all levels

### 3. Infrastructure Layer (Technical Concerns)
**Location**: `Smartico.Missions.Infrastructure/`

**Components**:

**Caching**:
- `MemoryCacheService` (IMemoryCache wrapper)
- 30-second TTL for all queries
- Key pattern: `{feature}:{userId}`

**SignalR Broadcasting**:
- `SignalRProgressBroadcaster` implements `IProgressBroadcaster`
- 12 real-time events across 4 features
- User-scoped groups: `user:{userId}`

**API Clients** (Demo Implementations):
- `SmarticoMissionApiClient` - Legacy direct service
- `SmarticoBonusApiClient` - Demo: 5 bonuses
- `SmarticoMiniGameApiClient` - Demo: 5 games with prize distribution
- `SmarticoTournamentApiClient` - Demo: 3 tournaments with leaderboards

**Dependency Injection**:
- `DependencyInjection.cs` - Service registration
- Singleton for stateful services
- Scoped for HTTP clients

### 4. API Layer (External Interface)
**Location**: `Smartico.Missions.Api/`

**Controllers**:
- `MissionsController` - Direct service injection (legacy pattern)
- `BonusesController` - CQRS via MediatR
- `MiniGamesController` - CQRS via MediatR
- `TournamentsController` - CQRS via MediatR

**SignalR Hub**:
- `ProgressHub` at `/hubs/progress`
- Connection with `?userId={userId}`
- 12 client event methods

**Features**:
- OpenAPI/Swagger documentation
- CORS configuration
- Logging middleware
- Exception handling

---

## 🔄 CQRS Pattern Implementation

### Query Flow (Read Operations)

```
Client Request
    ↓
Controller receives GET request
    ↓
Create Query object (userId, params)
    ↓
Send via MediatR.Send(query)
    ↓
QueryHandler.Handle():
    1. Check cache (CacheService.GetAsync)
    2. If cached → return immediately
    3. If not cached:
       - Fetch from API client
       - Store in cache (30s TTL)
       - Return response
    ↓
Controller returns 200 OK + data
```

**Caching Strategy**:
- Cache Key: `{feature}:{userId}`
- TTL: 30 seconds
- Invalidation: On command execution

### Command Flow (Write Operations)

```
Client Request
    ↓
Controller receives POST request
    ↓
Create Command object (userId, params)
    ↓
FluentValidation validates command
    ↓ (if invalid → 400 BadRequest)
Send via MediatR.Send(command)
    ↓
CommandHandler.Handle():
    1. Execute business logic via API client
    2. If failed → return error response
    3. If success:
       - Invalidate cache (CacheService.RemoveAsync)
       - Broadcast SignalR event (IProgressBroadcaster)
       - Return success response
    ↓
Controller returns appropriate status code
```

**Side Effects**:
- Cache invalidation (immediate)
- SignalR broadcasting (async fire-and-forget)
- Logging (structured)

---

## 🔌 SignalR Real-time Architecture

### Connection Flow

```
Frontend App Loads
    ↓
SignalR.connect(userId)
    ↓
HubConnectionBuilder
    .withUrl(`/hubs/progress?userId=${userId}`)
    .withAutomaticReconnect()
    .build()
    ↓
Connection established
    ↓
User added to group: `user:{userId}`
    ↓
Event subscriptions registered:
    - onMissionProgressUpdated
    - onMissionCompleted
    - onBadgeEarned
    - onBonusIssued
    - onBonusClaimed
    - onBonusExpired
    - onMiniGamePlayed
    - onMiniGamePrizeWon
    - onMiniGameJackpotWon
    - onTournamentRegistered (future)
    - onLeaderboardUpdated (future)
    - onTournamentStatusChanged (future)
```

### Broadcasting Pattern

**Server-side** (`SignalRProgressBroadcaster`):
```
Command executed successfully
    ↓
_progressBroadcaster.BroadcastEventAsync(userId, data)
    ↓
_hubContext.Clients.Group($"user:{userId}")
    .SendAsync("EventName", data)
    ↓
SignalR delivers to all connected clients in group
```

**Client-side** (React):
```
signalRService.onEventName((data) => {
    // Update local state
    setState(prev => updateLogic(prev, data));
});
```

---

## 💾 Caching Strategy

### Cache Hierarchy

**Level 1: Memory Cache (Current)**
- `IMemoryCache` (.NET built-in)
- 30-second TTL for all entities
- In-process, non-distributed
- Cache key pattern: `{feature}:{userId}`

**Level 2: Distributed Cache (Future)**
- Redis for multi-instance deployment
- Session-based invalidation
- Shared across API instances

### Cache Invalidation

**Triggers**:
1. **Command Execution**: Any write operation invalidates related cache
2. **TTL Expiration**: 30 seconds after initial cache
3. **Manual Refresh**: User-initiated refresh button

**Pattern**:
```
Write Operation → Cache.RemoveAsync(key) → Next read fetches fresh data
```

---

## 🎨 Frontend Architecture

### Component Hierarchy

```
App.tsx (Root)
├── Header
│   ├── Title
│   └── SignalR Status Indicator
├── Tab Navigation
│   ├── Missions Tab
│   ├── Bonuses Tab
│   ├── Mini Games Tab
│   └── Tournaments Tab
└── Tab Content
    ├── MissionList → MissionCard[]
    ├── BonusList → BonusCard[]
    ├── MiniGameList → MiniGameCard[]
    └── TournamentList → TournamentCard[]
                      └── TournamentLeaderboard (Modal)
```

### State Management

**Pattern**: Local React State (useState, useEffect)

**No global state library** - Each feature manages its own state:
```typescript
const [items, setItems] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**Real-time Updates**:
```typescript
useEffect(() => {
  signalRService.onEventName((data) => {
    setItems(prev => updateWithNewData(prev, data));
  });
}, [userId]);
```

### Service Layer

**API Services** (Fetch API pattern):
- `missionService.ts` - Axios (legacy)
- `bonusService.ts` - Fetch API
- `miniGameService.ts` - Fetch API
- `tournamentService.ts` - Fetch API

**SignalR Service** (Singleton):
- `signalr.ts` - Connection management + event subscriptions
- Auto-reconnect with exponential backoff
- Typed event handlers

---

## 📊 Data Flow Patterns

### Read Pattern (Query)

```
User clicks "Missions" tab
    ↓
React: useEffect → loadMissions()
    ↓
API: GET /api/missions?userId=xxx
    ↓
Backend: GetMissionsQuery → Handler
    ↓
Handler: Check cache → If miss, fetch from API client → Cache result
    ↓
Response: JSON with missions[]
    ↓
React: setMissions(data) → UI renders
```

### Write Pattern (Command)

```
User clicks "Claim Bonus"
    ↓
React: handleClaim(bonusId)
    ↓
API: POST /api/bonuses/{id}/claim { userId }
    ↓
Backend: ClaimBonusCommand → Validator → Handler
    ↓
Handler:
  1. Execute claim via API client
  2. Invalidate cache
  3. Broadcast SignalR event
    ↓
Response: JSON with updated bonus
    ↓
React: Update local state
    ↓
SignalR: Receive "BonusClaimed" event → Update UI in real-time
```

---

## 🔐 Cross-Cutting Concerns

### Logging

**Backend**:
- `ILogger<T>` injected into all handlers
- Structured logging with context
- Log levels: Information, Warning, Error

**Frontend**:
- Console logging for development
- Event tracking for user actions

### Error Handling

**Backend**:
- FluentValidation for command validation
- Try-catch in handlers
- Typed error responses

**Frontend**:
- Error state management
- User-friendly error messages
- Retry mechanisms

### Validation

**Backend**:
- FluentValidation for all commands
- Rules: NotEmpty, GreaterThan, Custom validators

**Frontend**:
- TypeScript type checking
- Runtime validation before API calls

---

## 🚀 Deployment Architecture (Future)

### Production Topology

```
Internet
    ↓
Load Balancer (Azure/AWS)
    ↓
┌─────────────────────────────────────┐
│  Frontend (Static Site)             │
│  - Vite Build                       │
│  - Vercel / Netlify / Azure Static  │
│  - CDN Cached                       │
└─────────────────────────────────────┘
    ↓ (API Calls)
┌─────────────────────────────────────┐
│  Backend API (Kubernetes / App Svc) │
│  - .NET 9 Runtime                   │
│  - Multiple Instances (Scalable)    │
│  - SignalR with Redis Backplane     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Redis (Distributed Cache + SignalR)│
│  - Cache Layer                      │
│  - SignalR Message Bus              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Smartico API (External)            │
│  - papi.smartico.ai                 │
└─────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current (MVP)
- Single instance .NET API
- In-memory caching
- SignalR in-process

### Future (Production)
- Multi-instance API (horizontal scaling)
- Redis distributed cache
- SignalR Redis backplane for multi-instance broadcasting
- Database for audit logs
- Message queue for background jobs

---

## 🧪 Testing Strategy

### Backend
- **Unit Tests**: CQRS handlers, validators, domain logic
- **Integration Tests**: API endpoints, database interactions
- **E2E Tests**: Full user flows

### Frontend
- **Component Tests**: React Testing Library
- **Integration Tests**: API service mocking
- **E2E Tests**: Playwright for user scenarios

---

## 📚 Technology Stack Summary

### Backend
- **.NET 9** - Latest LTS runtime
- **ASP.NET Core 9** - Web framework
- **MediatR** - CQRS pattern implementation
- **FluentValidation** - Command validation
- **SignalR** - Real-time WebSocket communication
- **IMemoryCache** - In-memory caching

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **SignalR Client** - Real-time communication

### Infrastructure
- **Docker** - Containerization (future)
- **Redis** - Distributed cache + SignalR backplane (future)
- **Azure/AWS** - Cloud hosting (future)

---

*For implementation details and code examples, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)*

*Last Updated: November 8, 2025*
*Version: 1.0*
