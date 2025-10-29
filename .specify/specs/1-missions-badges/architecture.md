# Missions & Badges - Architecture Design Document (.NET 9)

**Version:** 2.0.0
**Created:** 2024-10-29
**Last Updated:** 2024-10-29
**Status:** Draft - .NET 9 Migration
**Owner:** Backend Team

## Constitution Compliance Checklist

✅ **Code Quality:** Clean Architecture with Vertical Slices enforces SOLID principles
✅ **Testing Strategy:** xUnit with AAA pattern and single assertions specified
✅ **UX Consistency:** Frontend maintains React design system and WCAG 2.1 AA compliance
✅ **Performance:** Performance budgets defined for API (<200ms GET, <500ms POST), frontend (LCP <2.5s)
✅ **Type Safety:** C# 12 with nullable reference types enabled + TypeScript strict mode for frontend

## Executive Summary

This document outlines the full-stack architecture for the Missions & Badges gamification feature, implementing a **Backend for Frontend (BFF) pattern** with a **.NET 9 backend** serving a **React/TypeScript frontend**. The architecture adopts **Clean Architecture with Vertical Slices** for the backend, ensuring maintainability, testability, and adherence to SOLID principles.

The backend acts as an intermediary layer between the frontend and the Smartico API, providing:
- **Security**: Centralized API key management and JWT authentication
- **Performance**: Server-side caching (IMemoryCache + optional Redis) and request aggregation
- **Real-time Updates**: SignalR with automatic fallback (WebSocket → SSE → Long Polling)
- **Resilience**: Smart error handling with retry logic and graceful degradation

## Goals & Objectives

### Primary Goals
- Implement a secure, high-performance BFF layer in .NET 9 between React frontend and Smartico API
- Enable real-time mission progress updates via SignalR with graceful degradation
- Ensure 99.9% uptime with smart caching and error handling
- Maintain constitutional compliance (SOLID, Clean Code, AAA testing, performance, accessibility)

### Success Metrics
- **API Performance**: GET < 200ms (p95), POST < 500ms (p95)
- **Frontend Performance**: LCP < 2.5s, FCP < 1.5s, TTI < 3.5s
- **Test Coverage**: > 90% for backend, > 85% for frontend
- **Accessibility**: WCAG 2.1 AA compliance, 100% keyboard navigation
- **Reliability**: 99.9% uptime, < 2s for real-time updates

## Architecture Overview

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│                     (React + TypeScript)                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Mission    │  │    Badge     │  │   Progress   │        │
│  │     UI       │  │     UI       │  │   Tracking   │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                           │                                    │
│                  ┌────────▼────────┐                          │
│                  │  Redux Store    │                          │
│                  │  (State Mgmt)   │                          │
│                  └────────┬────────┘                          │
│                           │                                    │
│         ┌─────────────────┴─────────────────┐                │
│         │                                     │                │
│  ┌──────▼──────┐                      ┌──────▼──────┐        │
│  │  HTTP Client│                      │SignalR Client│       │
│  │  (Fetch API)│                      │  (real-time)│        │
│  └──────┬──────┘                      └──────┬───────┘        │
└─────────┼─────────────────────────────────────┼───────────────┘
          │                                     │
          │ REST API                            │ WebSocket/SSE
          │                                     │
┌─────────▼─────────────────────────────────────▼───────────────┐
│                    BACKEND LAYER (.NET 9)                      │
│                  ASP.NET Core Web API + SignalR                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │              API LAYER (Controllers + Hubs)           │     │
│  │                                                        │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐   │     │
│  │  │   Missions   │  │    Badges    │  │ Progress │   │     │
│  │  │  Controller  │  │  Controller  │  │   Hub    │   │     │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬────┘   │     │
│  └─────────┼──────────────────┼────────────────┼────────┘     │
│            │                  │                 │              │
│  ┌─────────▼──────────────────▼─────────────────▼────────┐   │
│  │         APPLICATION LAYER (Services + Use Cases)       │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│   │
│  │  │   Mission    │  │    Badge     │  │   Progress   ││   │
│  │  │   Service    │  │   Service    │  │   Service    ││   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘│   │
│  └─────────┼──────────────────┼────────────────┼────────┘    │
│            │                  │                 │              │
│  ┌─────────▼──────────────────▼─────────────────▼────────┐   │
│  │    INFRASTRUCTURE LAYER (External + Data Access)       │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│   │
│  │  │   Smartico   │  │    Cache     │  │  JSON File   ││   │
│  │  │  API Client  │  │   Adapter    │  │   Storage    ││   │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘│   │
│  └─────────┼─────────────────────────────────────────────┘   │
│            │                                                   │
│  ┌─────────▼────────────────────────────────────────────┐    │
│  │           DOMAIN LAYER (Entities + Interfaces)        │    │
│  │                                                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │ Mission  │  │  Badge   │  │  IMissionRepo    │   │    │
│  │  │  Model   │  │  Model   │  │  ICacheService   │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                          │ HTTP + WS
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│                   SMARTICO API BACKEND                         │
│          (External Service - Accessed via @smartico/api)      │
│                                                                 │
│     Missions Data  •  Badge Data  •  Progress Tracking        │
│     Opt-in Logic   •  Reward Claiming  •  Real-time Events    │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend (.NET 9)
- **Runtime**: .NET 9 SDK and Runtime
- **Framework**: ASP.NET Core 9.0 (Web API + SignalR)
- **Language**: C# 12 with nullable reference types enabled
- **Architecture**: Clean Architecture with Vertical Slices
- **API Client**: HttpClient with Polly for resilience (wraps Smartico API)
- **WebSocket**: SignalR with automatic fallback (WebSocket → Server-Sent Events → Long Polling)
- **Caching**: IMemoryCache (built-in) + StackExchange.Redis (optional for distributed)
- **Persistence**: JSON File Storage for MVP (sessions, rate limits, audit logs)
- **Authentication**: JWT Bearer tokens (Microsoft.AspNetCore.Authentication.JwtBearer)
- **Validation**: FluentValidation
- **Logging**: Serilog with structured logging
- **Testing**: xUnit + FluentAssertions + Moq + WebApplicationFactory
- **API Documentation**: Swagger/OpenAPI (Swashbuckle)
- **Deployment**: Docker multi-stage builds

#### Frontend (React + TypeScript)
- **Library**: React 18+
- **Language**: TypeScript 5+ (strict mode)
- **State Management**: Redux Toolkit with RTK Query
- **Real-time**: SignalR JavaScript Client (@microsoft/signalr)
- **UI Components**: Design system components (to be specified)
- **Styling**: CSS Modules / TailwindCSS (to be determined)
- **Forms**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library + MSW (Mock Service Worker)
- **Build**: Vite / Webpack

#### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions / Azure DevOps
- **Hosting**: Azure App Service / AWS ECS / Self-hosted Kubernetes
- **Monitoring**: Application Insights / Prometheus + Grafana
- **Logging**: Serilog → ELK Stack / Azure Log Analytics

## Clean Architecture with Vertical Slices

### Architecture Principles

1. **Dependency Rule**: Dependencies point inward. Domain layer has no dependencies. Infrastructure depends on Domain. Application depends on Domain. API depends on Application and Infrastructure.

2. **Vertical Slices**: Features organized by use case (Missions, Badges, Progress) rather than technical layers, improving cohesion and reducing coupling.

3. **Interface Segregation**: Small, focused interfaces in Domain layer, implemented in Infrastructure layer.

4. **Dependency Injection**: All dependencies injected via constructors, registered in Program.cs.

### Folder Structure

```
backend/
├── src/
│   ├── Smartico.Missions.Api/              # API Layer (Controllers, Hubs, Middleware)
│   │   ├── Controllers/
│   │   │   ├── MissionsController.cs
│   │   │   ├── BadgesController.cs
│   │   │   └── HealthController.cs
│   │   ├── Hubs/
│   │   │   └── ProgressHub.cs              # SignalR hub for real-time updates
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   ├── RequestLoggingMiddleware.cs
│   │   │   └── RateLimitingMiddleware.cs
│   │   ├── Filters/
│   │   │   └── ValidateModelAttribute.cs
│   │   ├── Program.cs                      # Application entry point
│   │   ├── appsettings.json
│   │   └── Dockerfile
│   │
│   ├── Smartico.Missions.Application/      # Application Layer (Services, Use Cases)
│   │   ├── Features/
│   │   │   ├── Missions/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── OptInMissionCommand.cs
│   │   │   │   │   ├── OptInMissionHandler.cs
│   │   │   │   │   ├── ClaimRewardCommand.cs
│   │   │   │   │   └── ClaimRewardHandler.cs
│   │   │   │   ├── Queries/
│   │   │   │   │   ├── GetMissionsQuery.cs
│   │   │   │   │   ├── GetMissionsHandler.cs
│   │   │   │   │   ├── GetMissionByIdQuery.cs
│   │   │   │   │   └── GetMissionByIdHandler.cs
│   │   │   │   └── MissionService.cs
│   │   │   ├── Badges/
│   │   │   │   ├── Queries/
│   │   │   │   │   ├── GetBadgesQuery.cs
│   │   │   │   │   ├── GetBadgesHandler.cs
│   │   │   │   │   ├── GetBadgeByIdQuery.cs
│   │   │   │   │   └── GetBadgeByIdHandler.cs
│   │   │   │   └── BadgeService.cs
│   │   │   └── Progress/
│   │   │       └── ProgressService.cs      # Real-time progress broadcast
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   │   ├── ICurrentUserService.cs
│   │   │   │   └── IDateTimeProvider.cs
│   │   │   ├── Behaviors/
│   │   │   │   ├── ValidationBehavior.cs
│   │   │   │   └── LoggingBehavior.cs
│   │   │   └── Exceptions/
│   │   │       ├── NotFoundException.cs
│   │   │       ├── ValidationException.cs
│   │   │       └── UnauthorizedException.cs
│   │   └── DependencyInjection.cs
│   │
│   ├── Smartico.Missions.Domain/           # Domain Layer (Entities, Interfaces, Value Objects)
│   │   ├── Entities/
│   │   │   ├── Mission.cs                  # C# model (mapped from TMissionOrBadge)
│   │   │   ├── MissionTask.cs              # C# model (mapped from TMissionOrBadgeTask)
│   │   │   ├── Badge.cs
│   │   │   ├── Category.cs                 # C# model (mapped from TAchCategory)
│   │   │   └── User.cs
│   │   ├── ValueObjects/
│   │   │   ├── MissionId.cs
│   │   │   ├── UserId.cs
│   │   │   └── Progress.cs
│   │   ├── Enums/
│   │   │   ├── MissionStatus.cs
│   │   │   ├── AchievementType.cs
│   │   │   └── ScheduledMissionType.cs
│   │   ├── Interfaces/
│   │   │   ├── ISmarticoApiClient.cs       # Repository-like interface for Smartico API
│   │   │   ├── ICacheService.cs
│   │   │   ├── IProgressBroadcaster.cs
│   │   │   └── IJsonStorageService.cs
│   │   └── DependencyInjection.cs
│   │
│   └── Smartico.Missions.Infrastructure/   # Infrastructure Layer (External Services, Data)
│       ├── SmarticoApi/
│       │   ├── SmarticoApiClient.cs        # HttpClient wrapper for Smartico API
│       │   ├── SmarticoApiSettings.cs
│       │   ├── Mappers/
│       │   │   ├── MissionMapper.cs        # Maps Smartico JSON → Domain entities
│       │   │   ├── BadgeMapper.cs
│       │   │   └── CategoryMapper.cs
│       │   └── Models/                     # DTOs matching @smartico/public-api types
│       │       ├── SmarticoMissionDto.cs   # Matches TMissionOrBadge
│       │       ├── SmarticoTaskDto.cs      # Matches TMissionOrBadgeTask
│       │       ├── SmarticoOptInResultDto.cs
│       │       ├── SmarticoClaimRewardResultDto.cs
│       │       └── SmarticoCategoryDto.cs
│       ├── Caching/
│       │   ├── MemoryCacheService.cs       # IMemoryCache wrapper
│       │   ├── RedisCacheService.cs        # Optional Redis implementation
│       │   └── CacheKeyGenerator.cs
│       ├── Storage/
│       │   ├── JsonFileStorageService.cs   # MVP persistence for sessions, rate limits
│       │   ├── Models/
│       │   │   ├── SessionData.cs
│       │   │   ├── RateLimitData.cs
│       │   │   └── AuditLogEntry.cs
│       │   └── BackupService.cs
│       ├── SignalR/
│       │   └── ProgressBroadcaster.cs      # SignalR IHubContext wrapper
│       ├── Authentication/
│       │   └── CurrentUserService.cs       # Extracts user from JWT claims
│       └── DependencyInjection.cs
│
├── tests/
│   ├── Smartico.Missions.UnitTests/        # Unit tests (xUnit + AAA pattern)
│   │   ├── Application/
│   │   │   ├── Missions/
│   │   │   │   ├── GetMissionsHandlerTests.cs
│   │   │   │   ├── OptInMissionHandlerTests.cs
│   │   │   │   └── ClaimRewardHandlerTests.cs
│   │   │   └── Badges/
│   │   │       └── GetBadgesHandlerTests.cs
│   │   ├── Domain/
│   │   │   └── Entities/
│   │   │       ├── MissionTests.cs
│   │   │       └── BadgeTests.cs
│   │   └── Infrastructure/
│   │       ├── SmarticoApiClientTests.cs
│   │       └── CacheServiceTests.cs
│   │
│   ├── Smartico.Missions.IntegrationTests/  # Integration tests (WebApplicationFactory)
│   │   ├── Controllers/
│   │   │   ├── MissionsControllerTests.cs
│   │   │   └── BadgesControllerTests.cs
│   │   ├── Hubs/
│   │   │   └── ProgressHubTests.cs
│   │   └── TestHelpers/
│   │       ├── CustomWebApplicationFactory.cs
│   │       └── MockSmarticoApiServer.cs
│   │
│   └── Smartico.Missions.E2ETests/          # End-to-end tests (optional)
│       └── MissionFlowTests.cs
│
├── docs/
│   ├── api/
│   │   └── swagger.json                     # OpenAPI specification
│   ├── adr/                                 # Architecture Decision Records
│   │   ├── 0001-clean-architecture.md
│   │   ├── 0002-signalr-for-realtime.md
│   │   ├── 0003-json-file-storage-mvp.md
│   │   └── 0004-docker-deployment.md
│   └── README.md
│
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── Directory.Build.props                   # Shared MSBuild properties
├── global.json                             # .NET SDK version lock
└── Smartico.Missions.sln                   # Solution file
```

### Layer Responsibilities

#### 1. API Layer (Smartico.Missions.Api)
**Purpose**: HTTP/SignalR entry points, authentication, request/response handling

**Responsibilities**:
- ASP.NET Core controllers for REST endpoints
- SignalR hubs for real-time communication
- Request validation using FluentValidation
- JWT authentication middleware
- Rate limiting middleware
- Exception handling middleware (convert exceptions to HTTP responses)
- Swagger/OpenAPI documentation

**Key Files**:
- `MissionsController.cs`: GET /api/missions, /api/missions/{id}, POST /api/missions/{id}/opt-in, /api/missions/{id}/claim
- `BadgesController.cs`: GET /api/badges, /api/badges/{id}
- `ProgressHub.cs`: SignalR hub broadcasting mission progress updates
- `ExceptionHandlingMiddleware.cs`: Global exception handling

**Dependencies**: Application Layer (Services, Handlers)

#### 2. Application Layer (Smartico.Missions.Application)
**Purpose**: Business logic, use cases, orchestration

**Responsibilities**:
- Command/Query handlers (CQRS-lite pattern)
- Service classes orchestrating domain logic
- Input validation
- Data transformation (DTOs ↔ Domain entities)
- Transaction coordination
- Caching strategy decisions

**Key Files**:
- `MissionService.cs`: Orchestrates mission retrieval, caching, transformation
- `GetMissionsHandler.cs`: Query handler for fetching missions
- `OptInMissionHandler.cs`: Command handler for opt-in logic
- `ClaimRewardHandler.cs`: Command handler for reward claiming

**Dependencies**: Domain Layer (Interfaces, Entities)

#### 3. Domain Layer (Smartico.Missions.Domain)
**Purpose**: Core business entities and contracts

**Responsibilities**:
- Entity definitions (Mission, Badge, MissionTask, Category)
- Value objects (MissionId, UserId, Progress)
- Enums (MissionStatus, AchievementType)
- Domain interfaces (no implementations)
- Business rules and invariants

**Key Files**:
- `Mission.cs`: Mission entity with validation logic
- `Badge.cs`: Badge entity
- `ISmarticoApiClient.cs`: Interface for Smartico API access
- `ICacheService.cs`: Interface for caching
- `IProgressBroadcaster.cs`: Interface for SignalR broadcasting

**Dependencies**: None (pure domain logic)

#### 4. Infrastructure Layer (Smartico.Missions.Infrastructure)
**Purpose**: External concerns, I/O, data access

**Responsibilities**:
- Smartico API HTTP client implementation
- Caching (IMemoryCache, Redis)
- JSON file storage (sessions, rate limits, audit logs)
- SignalR progress broadcaster implementation
- Mapping external DTOs to domain entities
- Authentication/authorization helpers

**Key Files**:
- `SmarticoApiClient.cs`: HttpClient wrapper with Polly retry policies
- `MissionMapper.cs`: Maps SmarticoMissionDto (from API) → Mission (domain)
- `MemoryCacheService.cs`: IMemoryCache implementation
- `JsonFileStorageService.cs`: File-based persistence for MVP
- `ProgressBroadcaster.cs`: SignalR IHubContext wrapper

**Dependencies**: Domain Layer (Interfaces, Entities)

## Data Flow

### Read Flow (Get Missions)

```
┌────────────┐         ┌────────────────┐         ┌─────────────────┐
│  Frontend  │         │  GET /api/     │         │    Mission      │
│  (React)   │─────1──>│   missions     │─────2──>│    Handler      │
│            │         │  (Controller)  │         │  (Application)  │
└────────────┘         └────────────────┘         └────────┬────────┘
                                                            │ 3. Check Cache
                                                            ▼
       ┌────────────────────────────────────────────┬──────────────┐
       │                                            │              │
       │ Cache Hit?                                 │  Cache       │
       │  ├─ Yes: Return cached data                │  Service     │
       │  └─ No: Continue to API                    │              │
       └────────────────────────────────────────────┴──────────────┘
                                                            │ 4. (Cache Miss)
                                                            ▼
                                                   ┌─────────────────┐
                                                   │   Smartico API  │
                                                   │     Client      │
                                                   │ (Infrastructure)│
                                                   └────────┬────────┘
                                                            │ 5. HTTP GET
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  Smartico API   │
                                                   │    Backend      │
                                                   │   (External)    │
                                                   └────────┬────────┘
                                                            │ 6. JSON Response
                                                            ▼
┌────────────┐         ┌────────────────┐         ┌─────────────────┐
│  Frontend  │<────10──│  200 OK        │<────9───│   Mission       │
│  Updates   │         │  JSON Response │         │   Mapper        │
│   State    │         │  (Controller)  │         │ (Infrastructure)│
└────────────┘         └────────────────┘         └────────┬────────┘
                                                            │ 7. Map DTO → Domain
                                                            │ 8. Cache + Return
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  Cache Service  │
                                                   │  (30s TTL)      │
                                                   └─────────────────┘
```

### Write Flow (Opt-In Mission)

```
┌────────────┐         ┌────────────────┐         ┌─────────────────┐
│  Frontend  │         │ POST /api/     │         │   OptInMission  │
│  (React)   │─────1──>│ missions/{id}/ │─────2──>│     Handler     │
│            │         │    opt-in      │         │  (Application)  │
└────────────┘         └────────────────┘         └────────┬────────┘
                                                            │ 3. Validate
                                                            │ 4. Call API
                                                            ▼
                                                   ┌─────────────────┐
                                                   │   Smartico API  │
                                                   │     Client      │
                                                   └────────┬────────┘
                                                            │ 5. HTTP POST
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  Smartico API   │
                                                   │    Backend      │
                                                   └────────┬────────┘
                                                            │ 6. Success/Error
                                                            ▼
┌────────────┐         ┌────────────────┐         ┌─────────────────┐
│  Frontend  │<───10───│  200 OK /      │<────9───│     Handler     │
│  Updates   │         │  400 Error     │         │  (Application)  │
│   State    │         │  (Controller)  │         └────────┬────────┘
└────────────┘         └────────────────┘                  │ 7. Invalidate Cache
                                                            │ 8. Return Result
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  Cache Service  │
                                                   │ (Clear mission) │
                                                   └─────────────────┘
```

### Real-Time Update Flow (Progress)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Smartico API Backend                          │
│               (Detects mission progress change)                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ 1. WebSocket Event / Polling
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              .NET Backend (Smartico.Missions.Api)                │
│                                                                   │
│  ┌───────────────────┐         ┌─────────────────────┐          │
│  │  Background       │─────2──>│   Progress          │          │
│  │  Service          │         │   Service           │          │
│  │  (Polling/WS)     │         │  (Application)      │          │
│  └───────────────────┘         └──────────┬──────────┘          │
│                                            │ 3. Notify SignalR   │
│                                            ▼                      │
│                                   ┌─────────────────┐            │
│                                   │  Progress Hub   │            │
│                                   │    (SignalR)    │            │
│                                   └────────┬────────┘            │
└────────────────────────────────────────────┼─────────────────────┘
                                             │ 4. Broadcast to Clients
                                             │    (WebSocket/SSE/LP)
                        ┌────────────────────┼────────────────────┐
                        │                    │                    │
                        ▼                    ▼                    ▼
               ┌────────────┐      ┌────────────┐      ┌────────────┐
               │  Frontend  │      │  Frontend  │      │  Frontend  │
               │  Client 1  │      │  Client 2  │      │  Client 3  │
               └────────────┘      └────────────┘      └────────────┘
                     │                    │                    │
                     │ 5. Update Redux State                  │
                     │                    │                    │
                     ▼                    ▼                    ▼
               ┌────────────┐      ┌────────────┐      ┌────────────┐
               │  UI Auto-  │      │  UI Auto-  │      │  UI Auto-  │
               │  Refresh   │      │  Refresh   │      │  Refresh   │
               └────────────┘      └────────────┘      └────────────┘
```

## API Endpoints

### REST API Endpoints

#### Missions

| Method | Endpoint | Description | Auth | Response |
|--------|----------|-------------|------|----------|
| GET | `/api/missions` | List all missions for authenticated user | JWT | `Mission[]` |
| GET | `/api/missions/{id}` | Get single mission by ID | JWT | `Mission` |
| POST | `/api/missions/{id}/opt-in` | Opt into a mission | JWT | `OptInResult` |
| POST | `/api/missions/{id}/claim` | Claim mission reward | JWT | `ClaimResult` |

#### Badges

| Method | Endpoint | Description | Auth | Response |
|--------|----------|-------------|------|----------|
| GET | `/api/badges` | List all badges for authenticated user | JWT | `Badge[]` |
| GET | `/api/badges/{id}` | Get single badge by ID | JWT | `Badge` |

#### Health

| Method | Endpoint | Description | Auth | Response |
|--------|----------|-------------|------|----------|
| GET | `/health` | Health check | None | `HealthStatus` |
| GET | `/health/ready` | Readiness probe (K8s) | None | `200 OK / 503` |
| GET | `/health/live` | Liveness probe (K8s) | None | `200 OK / 503` |

### SignalR Hubs

#### Progress Hub

**Hub URL**: `/hubs/progress`

**Connection**: Requires JWT token in query string or header

**Events (Server → Client)**:

| Event | Payload | Description |
|-------|---------|-------------|
| `MissionProgressUpdated` | `{ missionId: string, progress: number, tasks: Task[] }` | Mission progress changed |
| `MissionCompleted` | `{ missionId: string, reward: Reward }` | Mission completed |
| `BadgeEarned` | `{ badgeId: string, badge: Badge }` | New badge earned |

**Methods (Client → Server)**:

| Method | Parameters | Description |
|--------|------------|-------------|
| `SubscribeToMissions` | `missionIds: string[]` | Subscribe to progress updates for specific missions |
| `UnsubscribeFromMissions` | `missionIds: string[]` | Unsubscribe from mission updates |

## Data Models

### C# Models (Mapped from TypeScript Interfaces)

All C# models are mapped from the `@smartico/public-api` TypeScript interfaces. The mapping ensures type safety and consistency between frontend and backend.

#### Mission.cs (Domain Entity)

```csharp
namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a mission or badge in the gamification system.
/// Mapped from TMissionOrBadge TypeScript interface.
/// </summary>
public sealed class Mission
{
    public required string Id { get; init; }
    public required AchievementType Type { get; init; } // 'mission' | 'badge'
    public required string Name { get; init; }
    public required string Description { get; init; }
    public Progress Progress { get; private set; } = Progress.NotStarted();
    public bool IsCompleted { get; private set; }
    public bool IsLocked { get; init; }
    public bool RequiresOptIn { get; init; }
    public bool IsOptedIn { get; private set; }
    public DateTime? ExpiresAt { get; init; }
    public DateTime? AvailableAt { get; init; }
    public List<MissionTask> Tasks { get; init; } = new();
    public List<string> CategoryIds { get; init; } = new();
    public List<RelatedGame> RelatedGames { get; init; } = new();
    public Reward? Reward { get; init; }

    /// <summary>
    /// Domain logic: Update progress with validation
    /// </summary>
    public void UpdateProgress(int newProgress)
    {
        if (newProgress < 0 || newProgress > 100)
            throw new ArgumentOutOfRangeException(nameof(newProgress), "Progress must be 0-100");

        Progress = Progress.FromPercentage(newProgress);
        
        if (newProgress >= 100 && !IsCompleted)
        {
            MarkAsCompleted();
        }
    }

    /// <summary>
    /// Domain logic: Opt-in validation
    /// </summary>
    public void OptIn()
    {
        if (!RequiresOptIn)
            throw new InvalidOperationException("Mission does not require opt-in");
        
        if (IsOptedIn)
            throw new InvalidOperationException("Already opted in");

        if (IsLocked)
            throw new InvalidOperationException("Cannot opt-in to locked mission");

        IsOptedIn = true;
    }

    private void MarkAsCompleted()
    {
        IsCompleted = true;
        Progress = Progress.Completed();
    }
}
```

#### MissionTask.cs

```csharp
namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a task within a mission.
/// Mapped from TMissionOrBadgeTask TypeScript interface.
/// </summary>
public sealed class MissionTask
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public bool IsCompleted { get; init; }
    public int CurrentProgress { get; init; }
    public int RequiredProgress { get; init; }
    public int ExecutionCount { get; init; }
    public int? PointsReward { get; init; }

    public int ProgressPercentage => RequiredProgress > 0
        ? Math.Min(100, (CurrentProgress * 100) / RequiredProgress)
        : 0;
}
```

### DTOs (Infrastructure Layer)

#### SmarticoMissionDto.cs

```csharp
namespace Smartico.Missions.Infrastructure.SmarticoApi.Models;

/// <summary>
/// DTO matching TMissionOrBadge from @smartico/public-api
/// Used for JSON deserialization from Smartico API
/// </summary>
public sealed record SmarticoMissionDto
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("type")]
    public required string Type { get; init; } // "mission" | "badge"

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("description")]
    public required string Description { get; init; }

    [JsonPropertyName("progress")]
    public int Progress { get; init; }

    [JsonPropertyName("is_completed")]
    public bool IsCompleted { get; init; }

    [JsonPropertyName("is_locked")]
    public bool IsLocked { get; init; }

    [JsonPropertyName("is_requires_optin")]
    public bool IsRequiresOptIn { get; init; }

    [JsonPropertyName("is_opted_in")]
    public bool IsOptedIn { get; init; }

    [JsonPropertyName("tasks")]
    public List<SmarticoTaskDto>? Tasks { get; init; }

    [JsonPropertyName("category_ids")]
    public List<string>? CategoryIds { get; init; }

    [JsonPropertyName("related_games")]
    public List<RelatedGameDto>? RelatedGames { get; init; }

    // ... additional properties matching TMissionOrBadge
}
```

## Caching Strategy

### Cache Layers

1. **In-Memory Cache (IMemoryCache)**
   - **Scope**: Single backend instance
   - **TTL**: 30 seconds for mission/badge data
   - **Use Case**: Development, single-instance deployments
   - **Invalidation**: On write operations (opt-in, claim)

2. **Distributed Cache (Redis) - Optional**
   - **Scope**: Shared across multiple backend instances
   - **TTL**: 30 seconds
   - **Use Case**: Production, scaled deployments
   - **Invalidation**: On write operations, pub/sub for cross-instance invalidation

### Cache Keys

```csharp
// Cache key format: {prefix}:{userId}:{entityType}:{entityId?}
missions:user123:all                    // All missions for user123
missions:user123:mission:abc123         // Single mission
badges:user123:all                      // All badges for user123
categories:all                          // All categories (user-independent)
```

### Cache Invalidation Rules

| Operation | Cache Keys to Invalidate |
|-----------|--------------------------|
| Opt-In Mission | `missions:{userId}:all`, `missions:{userId}:mission:{missionId}` |
| Claim Reward | `missions:{userId}:all`, `missions:{userId}:mission:{missionId}` |
| Progress Update (SignalR) | `missions:{userId}:all`, `missions:{userId}:mission:{missionId}` |

### Cache Service Interface

```csharp
public interface ICacheService
{
    /// <summary>
    /// Get cached value or execute factory if not found
    /// </summary>
    Task<T?> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? expiration = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidate cache entries by pattern
    /// </summary>
    Task InvalidateAsync(string pattern, CancellationToken cancellationToken = default);

    /// <summary>
    /// Remove specific cache entry
    /// </summary>
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
}
```

## SignalR Real-Time Updates

### Connection Flow

```
┌────────────┐                    ┌────────────────┐
│  Frontend  │                    │  .NET Backend  │
│   Client   │                    │  (SignalR Hub) │
└─────┬──────┘                    └────────┬───────┘
      │                                    │
      │ 1. Connect with JWT                │
      ├───────────────────────────────────>│
      │                                    │ 2. Validate JWT
      │                                    │ 3. Create Connection ID
      │                                    │
      │ 4. Connection Established          │
      │<───────────────────────────────────┤
      │                                    │
      │ 5. SubscribeToMissions([id1,id2])  │
      ├───────────────────────────────────>│
      │                                    │ 6. Add to Group(s)
      │                                    │
      │ 7. Subscription Confirmed          │
      │<───────────────────────────────────┤
      │                                    │
      │                  ┌─────────────────┤ 8. Progress Update
      │                  │  Background     │    (from Smartico)
      │                  │   Service       │
      │                  └─────────┬───────┘
      │                            │
      │ 9. MissionProgressUpdated  │
      │<───────────────────────────┤
      │                            │
      │ 10. Update UI              │
      │                            │
```

### Hub Implementation

```csharp
/// <summary>
/// SignalR hub for real-time mission progress updates
/// </summary>
[Authorize]
public sealed class ProgressHub : Hub
{
    private readonly IProgressService _progressService;
    private readonly ILogger<ProgressHub> _logger;

    public ProgressHub(IProgressService progressService, ILogger<ProgressHub> logger)
    {
        _progressService = progressService;
        _logger = logger;
    }

    /// <summary>
    /// Subscribe to progress updates for specific missions
    /// </summary>
    public async Task SubscribeToMissions(string[] missionIds)
    {
        var userId = Context.UserIdentifier 
            ?? throw new HubException("User not authenticated");

        foreach (var missionId in missionIds)
        {
            var groupName = GetMissionGroupName(userId, missionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            
            _logger.LogInformation(
                "User {UserId} subscribed to mission {MissionId}",
                userId, missionId);
        }
    }

    /// <summary>
    /// Unsubscribe from mission progress updates
    /// </summary>
    public async Task UnsubscribeFromMissions(string[] missionIds)
    {
        var userId = Context.UserIdentifier!;

        foreach (var missionId in missionIds)
        {
            var groupName = GetMissionGroupName(userId, missionId);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }

    private static string GetMissionGroupName(string userId, string missionId) 
        => $"mission:{userId}:{missionId}";
}
```

### Progress Broadcaster (Infrastructure)

```csharp
/// <summary>
/// Broadcasts mission progress updates to subscribed clients
/// </summary>
public sealed class ProgressBroadcaster : IProgressBroadcaster
{
    private readonly IHubContext<ProgressHub> _hubContext;
    private readonly ILogger<ProgressBroadcaster> _logger;

    public ProgressBroadcaster(
        IHubContext<ProgressHub> hubContext,
        ILogger<ProgressBroadcaster> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task BroadcastMissionProgress(
        string userId,
        string missionId,
        MissionProgressUpdate update)
    {
        var groupName = $"mission:{userId}:{missionId}";

        await _hubContext.Clients.Group(groupName)
            .SendAsync("MissionProgressUpdated", new
            {
                missionId,
                progress = update.Progress,
                tasks = update.Tasks
            });

        _logger.LogDebug(
            "Broadcasted progress update for mission {MissionId} to user {UserId}",
            missionId, userId);
    }

    public async Task BroadcastMissionCompleted(
        string userId,
        string missionId,
        Reward reward)
    {
        var groupName = $"mission:{userId}:{missionId}";

        await _hubContext.Clients.Group(groupName)
            .SendAsync("MissionCompleted", new
            {
                missionId,
                reward
            });
    }

    public async Task BroadcastBadgeEarned(string userId, Badge badge)
    {
        // Broadcast to user-specific group (all connections)
        await _hubContext.Clients.User(userId)
            .SendAsync("BadgeEarned", badge);
    }
}
```

### Automatic Fallback

SignalR automatically handles fallback:
1. **WebSocket** (preferred, lowest latency ~10ms)
2. **Server-Sent Events** (HTTP/2, unidirectional, ~50ms latency)
3. **Long Polling** (HTTP/1.1, highest latency ~200ms)

No additional code required—SignalR negotiates the best available transport automatically.

## JSON File Storage (MVP)

### Purpose

For MVP, lightweight file-based persistence for:
- **Session data**: User sessions (if not using distributed cache)
- **Rate limit tracking**: Per-user API rate limits
- **Audit logs**: Mission opt-ins, reward claims for compliance

### Implementation

```csharp
public interface IJsonStorageService
{
    Task<T?> ReadAsync<T>(string key, CancellationToken cancellationToken = default);
    Task WriteAsync<T>(string key, T data, CancellationToken cancellationToken = default);
    Task DeleteAsync(string key, CancellationToken cancellationToken = default);
}

public sealed class JsonFileStorageService : IJsonStorageService
{
    private readonly string _storagePath;
    private readonly ILogger<JsonFileStorageService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;
    private readonly SemaphoreSlim _fileLock = new(1, 1);

    public JsonFileStorageService(
        IConfiguration configuration,
        ILogger<JsonFileStorageService> logger)
    {
        _storagePath = configuration["Storage:Path"] ?? "./data";
        _logger = logger;
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        Directory.CreateDirectory(_storagePath);
    }

    public async Task<T?> ReadAsync<T>(string key, CancellationToken cancellationToken)
    {
        var filePath = GetFilePath(key);
        
        if (!File.Exists(filePath))
            return default;

        await _fileLock.WaitAsync(cancellationToken);
        try
        {
            var json = await File.ReadAllTextAsync(filePath, cancellationToken);
            return JsonSerializer.Deserialize<T>(json, _jsonOptions);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    public async Task WriteAsync<T>(string key, T data, CancellationToken cancellationToken)
    {
        var filePath = GetFilePath(key);
        var tempPath = $"{filePath}.tmp";

        await _fileLock.WaitAsync(cancellationToken);
        try
        {
            // Atomic write: write to temp file, then rename
            var json = JsonSerializer.Serialize(data, _jsonOptions);
            await File.WriteAllTextAsync(tempPath, json, cancellationToken);
            
            if (File.Exists(filePath))
            {
                // Create backup before overwriting
                File.Copy(filePath, $"{filePath}.bak", overwrite: true);
            }

            File.Move(tempPath, filePath, overwrite: true);
        }
        finally
        {
            _fileLock.Release();
        }
    }

    private string GetFilePath(string key) => Path.Combine(_storagePath, $"{key}.json");
}
```

### Storage Structure

```
./data/
├── sessions/
│   ├── user123_session.json
│   └── user456_session.json
├── rate-limits/
│   ├── user123_limits.json
│   └── user456_limits.json
└── audit-logs/
    ├── 2024-10-29.json
    └── 2024-10-30.json
```

### Migration Path

When ready to migrate from JSON to database:
1. Implement `IJsonStorageService` with Entity Framework Core
2. No application code changes required (Dependency Injection)
3. Run migration script to transfer JSON files to database

## Authentication & Authorization

### JWT Bearer Tokens

**Configuration (appsettings.json)**:
```json
{
  "Jwt": {
    "Issuer": "https://yourapp.com",
    "Audience": "smartico-missions-api",
    "SecretKey": "{secret-key-from-env}",
    "ExpirationMinutes": 60
  }
}
```

**Program.cs Registration**:
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
        };

        // SignalR: Allow JWT in query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
```

### Current User Service

```csharp
public interface ICurrentUserService
{
    string UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string UserId =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedException("User not authenticated");

    public string? Email =>
        _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email);

    public bool IsAuthenticated =>
        _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
}
```

## Error Handling

### Global Exception Middleware

```csharp
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, errorResponse) = exception switch
        {
            ValidationException validationEx => (
                StatusCodes.Status400BadRequest,
                new ErrorResponse("Validation failed", validationEx.Errors)
            ),
            NotFoundException notFoundEx => (
                StatusCodes.Status404NotFound,
                new ErrorResponse(notFoundEx.Message)
            ),
            UnauthorizedException unauthorizedEx => (
                StatusCodes.Status401Unauthorized,
                new ErrorResponse(unauthorizedEx.Message)
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                new ErrorResponse("An unexpected error occurred")
            )
        };

        _logger.LogError(exception, "Exception occurred: {Message}", exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        return context.Response.WriteAsJsonAsync(errorResponse);
    }
}

public sealed record ErrorResponse(
    string Message,
    Dictionary<string, string[]>? Errors = null);
```

### Smart Fallback Strategy

**Read Operations** (GET missions/badges):
1. Auto-retry once silently (with loading indicator)
2. If retry fails, return cached data (if available) with warning
3. Show "Refresh" button for manual retry

**Write Operations** (POST opt-in, claim):
1. Auto-retry once silently
2. If fails, show error immediately with "Retry" button
3. Prevent duplicate submissions during retry

**Implementation in Frontend**:
```typescript
// Redux RTK Query with retry
export const missionsApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getMissions: builder.query<Mission[], void>({
      query: () => 'missions',
      // Auto-retry for GET
      extraOptions: { maxRetries: 1 },
      // Serve stale data while revalidating
      keepUnusedDataFor: 30,
    }),
    optInMission: builder.mutation<OptInResult, string>({
      query: (missionId) => ({
        url: `missions/${missionId}/opt-in`,
        method: 'POST',
      }),
      // No auto-retry for mutations (user must explicitly retry)
      extraOptions: { maxRetries: 0 },
    }),
  }),
});
```

## Performance Optimizations

### Backend Optimizations

1. **Response Compression**: Gzip/Brotli compression for API responses
2. **Output Caching**: `[ResponseCache]` attributes for cacheable endpoints
3. **Connection Pooling**: HttpClient reuse with `IHttpClientFactory`
4. **Async/Await**: All I/O operations are async
5. **Structured Logging**: Serilog with JSON formatting (fast serialization)
6. **Health Checks**: `/health` endpoint for load balancer readiness

### Frontend Optimizations

1. **Code Splitting**: Route-based chunks
2. **Lazy Loading**: Load mission details on demand
3. **Virtualization**: React Window for large mission/badge lists
4. **Memoization**: `useMemo`, `React.memo` for expensive computations
5. **Bundle Analysis**: Webpack Bundle Analyzer to identify bloat
6. **Service Worker**: Cache static assets and API responses

## Testing Strategy

### Unit Testing (xUnit + AAA Pattern)

**Example: MissionService Unit Test**

```csharp
public sealed class GetMissionsHandlerTests
{
    [Fact]
    public async Task should_return_missions_when_user_has_active_missions()
    {
        // Arrange
        var mockApiClient = new Mock<ISmarticoApiClient>();
        var mockCache = new Mock<ICacheService>();
        var mockLogger = new Mock<ILogger<GetMissionsHandler>>();
        
        var expectedMissions = new List<Mission>
        {
            new Mission { Id = "1", Name = "Daily Login", Progress = 50 }
        };

        mockApiClient
            .Setup(x => x.GetMissionsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedMissions);

        var handler = new GetMissionsHandler(
            mockApiClient.Object,
            mockCache.Object,
            mockLogger.Object);

        var query = new GetMissionsQuery(userId: "user123");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEquivalentTo(expectedMissions);
    }

    [Fact]
    public async Task should_return_cached_missions_when_cache_hit()
    {
        // Arrange
        var mockApiClient = new Mock<ISmarticoApiClient>();
        var mockCache = new Mock<ICacheService>();
        var mockLogger = new Mock<ILogger<GetMissionsHandler>>();

        var cachedMissions = new List<Mission>
        {
            new Mission { Id = "1", Name = "Cached Mission" }
        };

        mockCache
            .Setup(x => x.GetOrSetAsync(
                It.IsAny<string>(),
                It.IsAny<Func<Task<List<Mission>>>>(),
                It.IsAny<TimeSpan?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(cachedMissions);

        var handler = new GetMissionsHandler(
            mockApiClient.Object,
            mockCache.Object,
            mockLogger.Object);

        var query = new GetMissionsQuery(userId: "user123");

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        mockApiClient.Verify(
            x => x.GetMissionsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
```

### Integration Testing (WebApplicationFactory)

```csharp
public sealed class MissionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public MissionsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GET_missions_should_return_200_with_missions_array()
    {
        // Arrange
        var token = GenerateJwtToken(userId: "test-user");
        _client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _client.GetAsync("/api/missions");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var missions = await response.Content.ReadFromJsonAsync<Mission[]>();
        missions.Should().NotBeNull();
    }
}
```

### Test Coverage Targets

- **Backend Unit Tests**: > 90% coverage
- **Backend Integration Tests**: All controllers and hubs
- **Frontend Unit Tests**: > 85% coverage (components, hooks, state)
- **Frontend Integration Tests**: Critical user flows (opt-in, claim, progress tracking)
- **E2E Tests**: Smoke tests only (login → view mission → opt-in → complete → claim)

## Deployment

### Docker Configuration

**Dockerfile (Multi-Stage)**:
```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["src/Smartico.Missions.Api/Smartico.Missions.Api.csproj", "src/Smartico.Missions.Api/"]
COPY ["src/Smartico.Missions.Application/Smartico.Missions.Application.csproj", "src/Smartico.Missions.Application/"]
COPY ["src/Smartico.Missions.Domain/Smartico.Missions.Domain.csproj", "src/Smartico.Missions.Domain/"]
COPY ["src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj", "src/Smartico.Missions.Infrastructure/"]

RUN dotnet restore "src/Smartico.Missions.Api/Smartico.Missions.Api.csproj"

COPY . .
WORKDIR "/src/src/Smartico.Missions.Api"
RUN dotnet build "Smartico.Missions.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "Smartico.Missions.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Smartico.Missions.Api.dll"]
```

**docker-compose.yml** (Development):
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:8080"
      - "5001:8081"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - Jwt__SecretKey=${JWT_SECRET}
      - Smartico__ApiKey=${SMARTICO_API_KEY}
      - Smartico__BrandKey=${SMARTICO_BRAND_KEY}
      - Redis__ConnectionString=redis:6379
    volumes:
      - ./data:/app/data
    depends_on:
      - redis
    networks:
      - smartico-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - smartico-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    networks:
      - smartico-network

networks:
  smartico-network:
    driver: bridge
```

### Environment Variables

**Backend (.NET)**:
```bash
# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080;https://+:8081

# JWT Authentication
JWT__ISSUER=https://yourapp.com
JWT__AUDIENCE=smartico-missions-api
JWT__SECRETKEY={strong-secret-key-256-bit}
JWT__EXPIRATIONMINUTES=60

# Smartico API
SMARTICO__APIKEY={your-api-key}
SMARTICO__BRANDKEY={your-brand-key}
SMARTICO__ENVIRONMENT=production
SMARTICO__BASEURL=https://api.smartico.ai

# Caching
REDIS__CONNECTIONSTRING=redis:6379
CACHE__DEFAULTTTLSECONDS=30

# Storage
STORAGE__PATH=/app/data

# Logging
SERILOG__MINIMUMLEVEL=Information
SERILOG__WRITETOCONSOLE=true
```

**Frontend (React)**:
```bash
REACT_APP_API_URL=https://api.yourapp.com
REACT_APP_WS_URL=https://api.yourapp.com/hubs/progress
REACT_APP_ENVIRONMENT=production
```

## Security Considerations

### Security Checklist

- [x] **Authentication**: JWT Bearer tokens with HTTPS-only
- [x] **Authorization**: Role-based access control (RBAC)
- [x] **Input Validation**: FluentValidation on all inputs
- [x] **SQL Injection**: N/A (no direct database, uses Smartico API)
- [x] **XSS Prevention**: React auto-escapes, CSP headers
- [x] **CSRF Protection**: SameSite cookies, CSRF tokens
- [x] **Rate Limiting**: ASP.NET Core Rate Limiter middleware
- [x] **CORS**: Strict origin validation
- [x] **Secrets Management**: Environment variables, Azure Key Vault
- [x] **HTTPS Enforced**: UseHttpsRedirection middleware
- [x] **Security Headers**: Helmet-equivalent for .NET (NWebsec)
- [x] **Audit Logging**: All write operations logged to JSON storage

### Rate Limiting

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        return RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: userId ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 100,
                ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                TokensPerPeriod = 20
            });
    });
});

app.UseRateLimiter();
```

## Architecture Decision Records (ADRs)

### ADR-001: Clean Architecture with Vertical Slices

**Status**: Accepted

**Context**: Need maintainable, testable backend architecture aligned with SOLID principles.

**Decision**: Adopt Clean Architecture with feature-based vertical slices (Missions, Badges, Progress).

**Consequences**:
- ✅ Clear separation of concerns
- ✅ Easy to test (dependency injection)
- ✅ Maintainable as features grow
- ⚠️ More initial boilerplate than simple layered architecture

**Alternatives Considered**:
- Traditional N-Layer (rejected: tight coupling)
- CQRS + MediatR (rejected: overkill for BFF layer)

### ADR-002: SignalR for Real-Time Updates

**Status**: Accepted

**Context**: Need real-time mission progress updates with graceful degradation.

**Decision**: Use ASP.NET Core SignalR with automatic fallback (WebSocket → SSE → Long Polling).

**Consequences**:
- ✅ Built-in fallback mechanism
- ✅ Strongly-typed hubs
- ✅ Native .NET integration
- ✅ Authentication support
- ⚠️ Requires understanding of SignalR client library

**Alternatives Considered**:
- Raw WebSockets (rejected: no automatic fallback)
- Socket.IO for .NET (rejected: external dependency)
- Polling only (rejected: higher latency, more server load)

### ADR-003: JSON File Storage for MVP

**Status**: Accepted

**Context**: Need lightweight persistence for sessions, rate limits, audit logs for MVP.

**Decision**: Use JSON file storage with atomic writes and backup mechanism.

**Consequences**:
- ✅ No database setup required for MVP
- ✅ Easy to inspect/debug (plain JSON files)
- ✅ Simple migration path to database later
- ⚠️ Not suitable for high-concurrency writes
- ⚠️ Requires file system access (stateful container)

**Alternatives Considered**:
- SQLite (rejected: adds dependency, less readable for debugging)
- Redis only (rejected: requires Redis infrastructure)
- No persistence (rejected: loses rate limits on restart)

**Migration Plan**: Implement `IJsonStorageService` with EF Core when ready.

### ADR-004: Docker Containerization

**Status**: Accepted

**Context**: Need consistent deployment across dev/staging/production environments.

**Decision**: Use Docker multi-stage builds with Alpine-based runtime images.

**Consequences**:
- ✅ Consistent environments (dev = prod)
- ✅ Easy CI/CD pipeline
- ✅ Platform-agnostic deployment
- ✅ Optimized image size with multi-stage builds
- ⚠️ Requires Docker knowledge
- ⚠️ Stateful containers (JSON storage) need volume mounts

**Alternatives Considered**:
- Direct deployment to VMs (rejected: environment drift)
- Azure App Service only (rejected: vendor lock-in)

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Smartico API Downtime** | Medium | High | Implement circuit breaker (Polly), serve cached data, show user-friendly error |
| **SignalR Connection Drop** | Medium | Medium | Automatic reconnection (SignalR built-in), fallback to polling, connection status indicator |
| **JSON File Storage Corruption** | Low | Medium | Atomic writes, backup files (.bak), validation on read |
| **JWT Secret Leak** | Low | Critical | Store in Azure Key Vault, rotate keys quarterly, audit access logs |
| **Rate Limit Bypass** | Low | Medium | Distributed rate limiting (Redis), IP + User ID tracking, alert on anomalies |
| **Cache Stampede** | Low | Medium | Cache warm-up on startup, staggered expiration, lock-based refresh |
| **.NET 9 Breaking Changes** | Low | Low | Pin to specific SDK version (global.json), test before upgrading |

## Success Criteria

The implementation is considered successful when:

1. ✅ All constitutional principles met (SOLID, AAA testing, UX, performance, type safety)
2. ✅ All API endpoints respond within performance budgets (GET <200ms, POST <500ms)
3. ✅ SignalR real-time updates deliver within 2 seconds of backend changes
4. ✅ Frontend meets Web Vitals targets (LCP <2.5s, FCP <1.5s, TTI <3.5s)
5. ✅ Test coverage exceeds targets (>90% backend, >85% frontend)
6. ✅ Accessibility audit passes WCAG 2.1 AA
7. ✅ Zero critical security vulnerabilities
8. ✅ Docker containers build and deploy successfully
9. ✅ All functional requirements from spec.md implemented
10. ✅ Monitoring and alerting operational

## Next Steps

After architecture approval:

1. **Phase 1**: Backend Foundation (Week 1-2)
   - Initialize .NET 9 project structure
   - Implement Clean Architecture layers
   - Setup Docker containerization
   - Configure CI/CD pipeline

2. **Phase 2**: Core Features (Week 3-4)
   - Implement Smartico API client
   - Develop Mission/Badge controllers
   - Setup SignalR hub
   - Implement caching layer

3. **Phase 3**: Integration & Testing (Week 5-6)
   - Integration tests for all endpoints
   - Frontend integration with backend API
   - Performance testing and optimization
   - Security audit

4. **Phase 4**: Polish & Deploy (Week 7-8)
   - Documentation (OpenAPI, README)
   - Monitoring and logging setup
   - Staging deployment
   - Production deployment

## Approval

- [ ] **Technical Lead**: [Name] - [Date]
- [ ] **Backend Lead**: [Name] - [Date]
- [ ] **Frontend Lead**: [Name] - [Date]
- [ ] **Security Review**: [Name] - [Date]
- [ ] **DevOps Lead**: [Name] - [Date]

---

**Document Status**: Draft - .NET 9 Migration
**Last Updated**: 2024-10-29
**Next Review**: After stakeholder approval

