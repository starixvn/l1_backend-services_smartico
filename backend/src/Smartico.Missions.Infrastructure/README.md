# Smartico.Missions.Infrastructure

**Layer:** Infrastructure (External Service Implementations)  
**Dependencies:** Domain

## Purpose

The Infrastructure layer contains implementations of external services, data persistence, caching, and third-party integrations. It implements interfaces defined in the Domain layer.

## Structure

```
Infrastructure/
├── SmarticoApi/              # Smartico API client implementation
│   ├── SmarticoApiClient.cs  # HTTP client for Smartico API
│   ├── Mappers/              # DTO to Domain entity mappers
│   └── Configuration/        # API configuration and options
├── Caching/                  # Caching implementations
│   ├── MemoryCacheService.cs # In-memory caching (IMemoryCache)
│   └── RedisCacheService.cs  # Redis caching (optional)
├── Storage/                  # Data storage implementations
│   ├── JsonFileStorage.cs    # JSON file-based storage for MVP
│   └── Models/               # Storage-specific models
├── SignalR/                  # Real-time communication
│   └── ProgressBroadcaster.cs # SignalR-based progress updates
└── Authentication/           # Authentication services
    └── JwtService.cs         # JWT token generation and validation
```

## Principles

- **Implements Domain Interfaces**: All services implement contracts from Domain layer
- **External Dependencies**: Contains all external library references
- **Adapters**: Adapts external APIs to internal domain models
- **Resilience**: Uses Polly for retry logic and circuit breakers
- **Configuration-Driven**: Uses Options pattern for configuration

## Key Components

### SmarticoApiClient
HTTP client wrapper for the Smartico Public API using HttpClient and Polly for resilience.

**Features:**
- Automatic retry on transient failures
- Circuit breaker pattern
- Request/response logging
- Type-safe API calls

### Caching Services
Multiple caching strategies for different scenarios:
- **MemoryCacheService**: Fast in-memory cache for single-instance deployments
- **RedisCacheService**: Distributed cache for multi-instance deployments

### JSON File Storage
Lightweight file-based storage for MVP without database complexity.

**Use Cases:**
- Session storage
- Rate limit counters
- Audit logs
- User preferences

**Migration Path:** Easy to swap with database implementations (same interface)

### SignalR Components
Real-time progress updates using ASP.NET Core SignalR.

**Features:**
- Automatic WebSocket fallback
- Strongly-typed hubs
- Connection management
- Authentication integration

---

**Architecture Pattern:** Clean Architecture (Infrastructure Layer)  
**Created:** 2024-10-29

