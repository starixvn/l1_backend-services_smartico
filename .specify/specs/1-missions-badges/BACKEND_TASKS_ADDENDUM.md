# Backend Tasks Addendum (.NET 9)

**Date Updated:** 2024-10-29  
**Reason:** Stakeholder requested backend migration from Node.js/Express to .NET 9/ASP.NET Core  
**Impact:** +12 hours to backend estimate (from 48h Node.js → 60h .NET 9), +12 hours total project

---

## Summary of Changes

### Before (Node.js/Express)
- **Total Estimate:** 291 hours (7-8 weeks)
- **Backend:** Node.js 18+ with Express 4+, TypeScript, ws library for WebSocket
- **Architecture:** Clean Architecture (Node.js style)
- **Total Backend Tasks:** 12 tasks, 48 hours

### After (.NET 9/ASP.NET Core)
- **Total Estimate:** 303 hours (7-9 weeks)
- **Backend:** .NET 9 with ASP.NET Core 9.0, C# 12, SignalR for real-time
- **Architecture:** Clean Architecture with Vertical Slices (.NET best practices)
- **Total Backend Tasks:** 14 tasks, 60 hours

**Why +12 hours?**
- More robust project setup (4 projects in solution vs 1 Node.js project): +1h
- SignalR Hub implementation more complex than basic WebSocket: +2h
- C# model mapping from TypeScript interfaces requires more explicitness: +2h
- Docker multi-stage build for .NET more involved: +2h
- xUnit + FluentAssertions + Moq testing setup: +2h
- NuGet package management and DependencyInjection configuration: +3h

---

## New Phase: Phase 1B - Backend Setup (.NET 9) (60 hours, 14 tasks)

### Backend Tasks Overview

| Task # | Name | Hours | Priority | Focus |
|--------|------|-------|----------|-------|
| **TASK-007** | Backend Project Initialization (.NET 9) | 5h | Critical | Solution setup, global.json, Directory.Build.props |
| **TASK-008** | Define Clean Architecture Structure | 4h | Critical | 4-layer architecture, folder structure |
| **TASK-009** | Configure ASP.NET Core Middleware | 5h | Critical | Security, CORS, compression, rate limiting |
| **TASK-010** | Implement JWT Authentication Middleware | 5h | Critical | JWT validation, claims extraction |
| **TASK-011** | Create Domain Layer (Entities + Interfaces) | 6h | Critical | Mission, Badge, MissionTask models, interfaces |
| **TASK-012** | Implement Smartico API Client (Infrastructure) | 7h | Critical | HttpClient wrapper, Polly retry, DTOs |
| **TASK-013** | Implement Caching Service (IMemoryCache) | 5h | High | Memory cache with Redis adapter |
| **TASK-014** | Implement JSON File Storage Service | 4h | Medium | MVP persistence for sessions, rate limits, logs |
| **TASK-015** | Implement Mission Service & Handlers (Application) | 6h | Critical | CQRS-lite: Queries + Commands |
| **TASK-016** | Implement Mission Controller (API Layer) | 5h | Critical | REST endpoints with validation |
| **TASK-017** | Implement SignalR Hub for Real-Time Updates | 6h | High | ProgressHub, connection management |
| **TASK-018** | Backend Unit Tests (xUnit + AAA) | 8h | Critical | 90%+ coverage, FluentAssertions |
| **TASK-019** | Backend Integration Tests (WebApplicationFactory) | 6h | High | API endpoint testing |
| **TASK-020** | Docker Configuration & Documentation | 4h | Medium | Multi-stage Dockerfile, docker-compose, README |

**Phase 1B Total:** 60 hours (14 tasks)

---

## Backend Architecture Overview (.NET 9)

### Why .NET 9 Backend (BFF Pattern)?

The Backend for Frontend (BFF) pattern provides:

1. **Security**: Centralized API key management, JWT validation
2. **Performance**: Server-side caching (IMemoryCache + Redis), request aggregation
3. **Flexibility**: Transform/aggregate Smartico API data before sending to frontend
4. **Rate Limiting**: Protect against API abuse at application level
5. **SignalR Management**: Centralized real-time updates distribution with automatic fallback

### Backend Stack (.NET 9)

- **Runtime:** .NET 9 SDK and Runtime
- **Framework:** ASP.NET Core 9.0 (Web API + SignalR)
- **Language:** C# 12 with nullable reference types enabled
- **Architecture:** Clean Architecture with Vertical Slices
- **API Client:** HttpClient with Polly for resilience (wraps Smartico API)
- **WebSocket:** SignalR with automatic fallback (WebSocket → SSE → Long Polling)
- **Caching:** IMemoryCache (built-in) + StackExchange.Redis (optional)
- **Persistence:** JSON File Storage for MVP (sessions, rate limits, audit logs)
- **Authentication:** JWT Bearer tokens (Microsoft.AspNetCore.Authentication.JwtBearer)
- **Validation:** FluentValidation
- **Logging:** Serilog with structured logging
- **Testing:** xUnit + FluentAssertions + Moq + WebApplicationFactory
- **API Documentation:** Swagger/OpenAPI (Swashbuckle.AspNetCore)
- **Deployment:** Docker multi-stage builds

### Solution Structure

```
backend/
├── Smartico.Missions.sln
├── global.json                               # .NET SDK version lock
├── Directory.Build.props                     # Shared MSBuild properties
├── .editorconfig
├── Dockerfile
├── docker-compose.yml
│
├── src/
│   ├── Smartico.Missions.Api/               # API Layer (Controllers + Hubs)
│   │   ├── Controllers/
│   │   │   ├── MissionsController.cs
│   │   │   ├── BadgesController.cs
│   │   │   └── HealthController.cs
│   │   ├── Hubs/
│   │   │   └── ProgressHub.cs              # SignalR hub
│   │   ├── Middleware/
│   │   │   ├── ExceptionHandlingMiddleware.cs
│   │   │   ├── RequestLoggingMiddleware.cs
│   │   │   └── RateLimitingMiddleware.cs
│   │   ├── Filters/
│   │   │   └── ValidateModelAttribute.cs
│   │   ├── Program.cs                      # Application entry point
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   └── Dockerfile
│   │
│   ├── Smartico.Missions.Application/      # Application Layer (Services + Use Cases)
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
│   │   │   │   └── (similar structure)
│   │   │   └── Progress/
│   │   │       └── ProgressService.cs
│   │   ├── Common/
│   │   │   ├── Interfaces/
│   │   │   ├── Behaviors/
│   │   │   └── Exceptions/
│   │   └── DependencyInjection.cs
│   │
│   ├── Smartico.Missions.Domain/           # Domain Layer (Entities + Interfaces)
│   │   ├── Entities/
│   │   │   ├── Mission.cs                  # C# model (mapped from TMissionOrBadge)
│   │   │   ├── MissionTask.cs              # C# model (mapped from TMissionOrBadgeTask)
│   │   │   ├── Badge.cs
│   │   │   └── Category.cs
│   │   ├── ValueObjects/
│   │   │   ├── MissionId.cs
│   │   │   ├── UserId.cs
│   │   │   └── Progress.cs
│   │   ├── Enums/
│   │   │   ├── MissionStatus.cs
│   │   │   └── AchievementType.cs
│   │   ├── Interfaces/
│   │   │   ├── ISmarticoApiClient.cs
│   │   │   ├── ICacheService.cs
│   │   │   ├── IProgressBroadcaster.cs
│   │   │   └── IJsonStorageService.cs
│   │   └── DependencyInjection.cs
│   │
│   └── Smartico.Missions.Infrastructure/   # Infrastructure Layer (External + Data)
│       ├── SmarticoApi/
│       │   ├── SmarticoApiClient.cs        # HttpClient wrapper
│       │   ├── SmarticoApiSettings.cs
│       │   ├── Mappers/
│       │   │   ├── MissionMapper.cs        # Maps Smartico JSON → Domain
│       │   │   └── BadgeMapper.cs
│       │   └── Models/                     # DTOs matching @smartico/public-api
│       │       ├── SmarticoMissionDto.cs   # Matches TMissionOrBadge
│       │       ├── SmarticoTaskDto.cs      # Matches TMissionOrBadgeTask
│       │       └── SmarticoCategoryDto.cs
│       ├── Caching/
│       │   ├── MemoryCacheService.cs
│       │   └── RedisCacheService.cs (optional)
│       ├── Storage/
│       │   ├── JsonFileStorageService.cs
│       │   └── Models/
│       │       ├── SessionData.cs
│       │       └── RateLimitData.cs
│       ├── SignalR/
│       │   └── ProgressBroadcaster.cs
│       ├── Authentication/
│       │   └── CurrentUserService.cs
│       └── DependencyInjection.cs
│
└── tests/
    ├── Smartico.Missions.UnitTests/
    │   ├── Application/
    │   ├── Domain/
    │   └── Infrastructure/
    ├── Smartico.Missions.IntegrationTests/
    │   ├── Controllers/
    │   ├── Hubs/
    │   └── TestHelpers/
    └── Smartico.Missions.E2ETests/
```

---

## API Endpoints

### Missions

| Method | Endpoint | Description | Auth | Response |
|--------|----------|-------------|------|----------|
| GET | `/api/missions` | List all missions for authenticated user | JWT | `Mission[]` |
| GET | `/api/missions/{id}` | Get single mission by ID | JWT | `Mission` |
| POST | `/api/missions/{id}/opt-in` | Opt into a mission | JWT | `OptInResult` |
| POST | `/api/missions/{id}/claim` | Claim mission reward | JWT | `ClaimResult` |

### Badges

| Method | Endpoint | Description | Auth | Response |
|--------|----------|-------------|------|----------|
| GET | `/api/badges` | List all badges for authenticated user | JWT | `Badge[]` |
| GET | `/api/badges/{id}` | Get single badge by ID | JWT | `Badge` |

### SignalR Hub

**Hub URL**: `/hubs/progress`

**Connection**: Requires JWT token in query string or header

**Events (Server → Client)**:
- `MissionProgressUpdated`: `{ missionId, progress, tasks }`
- `MissionCompleted`: `{ missionId, reward }`
- `BadgeEarned`: `{ badgeId, badge }`

**Methods (Client → Server)**:
- `SubscribeToMissions(string[] missionIds)`
- `UnsubscribeFromMissions(string[] missionIds)`

---

## NuGet Packages

### Core Packages (Required)

```xml
<ItemGroup>
  <!-- ASP.NET Core -->
  <PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.1.0" />
  <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
  
  <!-- JSON Serialization -->
  <PackageReference Include="System.Text.Json" Version="9.0.0" />
  
  <!-- Logging -->
  <PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
  <PackageReference Include="Serilog.Sinks.Console" Version="5.0.1" />
  <PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
  
  <!-- Validation -->
  <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
  
  <!-- HTTP Client -->
  <PackageReference Include="Microsoft.Extensions.Http.Polly" Version="9.0.0" />
  <PackageReference Include="Polly" Version="8.2.0" />
  
  <!-- Caching -->
  <PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="9.0.0" />
  <PackageReference Include="StackExchange.Redis" Version="2.7.10" /> <!-- Optional -->
  
  <!-- API Documentation -->
  <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  
  <!-- Rate Limiting -->
  <PackageReference Include="Microsoft.AspNetCore.RateLimiting" Version="9.0.0" />
</ItemGroup>
```

### Testing Packages

```xml
<ItemGroup>
  <!-- Testing Framework -->
  <PackageReference Include="xUnit" Version="2.6.2" />
  <PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
  
  <!-- Assertions -->
  <PackageReference Include="FluentAssertions" Version="6.12.0" />
  
  <!-- Mocking -->
  <PackageReference Include="Moq" Version="4.20.70" />
  
  <!-- Integration Testing -->
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="9.0.0" />
  
  <!-- Code Coverage -->
  <PackageReference Include="coverlet.collector" Version="6.0.0" />
</ItemGroup>
```

---

## Key Implementation Details

### 1. Program.cs (Application Entry Point)

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddSignalR();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
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

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(builder.Configuration["Cors:Origins"]!.Split(','))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Rate Limiting
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

// Application Services (Dependency Injection)
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddDomainServices();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();
app.MapHub<ProgressHub>("/hubs/progress");

app.Run();
```

### 2. Missions Controller

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class MissionsController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ILogger<MissionsController> _logger;

    public MissionsController(ISender sender, ILogger<MissionsController> logger)
    {
        _sender = sender;
        _logger = logger;
    }

    /// <summary>
    /// Get all missions for the authenticated user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Mission[]), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMissions(CancellationToken cancellationToken)
    {
        var query = new GetMissionsQuery();
        var missions = await _sender.Send(query, cancellationToken);
        
        return Ok(missions);
    }

    /// <summary>
    /// Opt-in to a specific mission
    /// </summary>
    [HttpPost("{id}/opt-in")]
    [ProducesResponseType(typeof(OptInResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> OptIn(
        string id,
        CancellationToken cancellationToken)
    {
        var command = new OptInMissionCommand(id);
        var result = await _sender.Send(command, cancellationToken);
        
        return Ok(result);
    }

    /// <summary>
    /// Claim reward for a completed mission
    /// </summary>
    [HttpPost("{id}/claim")]
    [ProducesResponseType(typeof(ClaimResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ClaimReward(
        string id,
        CancellationToken cancellationToken)
    {
        var command = new ClaimRewardCommand(id);
        var result = await _sender.Send(command, cancellationToken);
        
        return Ok(result);
    }
}
```

### 3. SignalR ProgressHub

```csharp
[Authorize]
public sealed class ProgressHub : Hub
{
    private readonly ILogger<ProgressHub> _logger;

    public ProgressHub(ILogger<ProgressHub> logger)
    {
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

### 4. Domain Entity (Mission.cs)

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
    public List<MissionTask> Tasks { get; init; } = new();
    public List<string> CategoryIds { get; init; } = new();
    public Reward? Reward { get; init; }

    /// <summary>
    /// Domain logic: Update progress with validation
    /// </summary>
    public void UpdateProgress(int newProgress)
    {
        if (newProgress < 0 || newProgress > 100)
            throw new ArgumentOutOfRangeException(nameof(newProgress), 
                "Progress must be 0-100");

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

---

## Testing Strategy

### Unit Testing Example (xUnit + AAA Pattern)

```csharp
public sealed class GetMissionsHandlerTests
{
    [Fact]
    public async Task Should_ReturnMissions_When_UserHasActiveMissions()
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
}
```

### Integration Testing Example (WebApplicationFactory)

```csharp
public sealed class MissionsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public MissionsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GET_Missions_Should_Return200_When_Authenticated()
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

---

## Docker Configuration

### Dockerfile (Multi-Stage Build)

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY ["src/Smartico.Missions.Api/Smartico.Missions.Api.csproj", "src/Smartico.Missions.Api/"]
COPY ["src/Smartico.Missions.Application/Smartico.Missions.Application.csproj", "src/Smartico.Missions.Application/"]
COPY ["src/Smartico.Missions.Domain/Smartico.Missions.Domain.csproj", "src/Smartico.Missions.Domain/"]
COPY ["src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj", "src/Smartico.Missions.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "src/Smartico.Missions.Api/Smartico.Missions.Api.csproj"

# Copy source code
COPY . .

# Build
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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "Smartico.Missions.Api.dll"]
```

### docker-compose.yml

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
      - ASPNETCORE_URLS=http://+:8080;https://+:8081
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
      - REACT_APP_WS_URL=http://localhost:5000/hubs/progress
    networks:
      - smartico-network

networks:
  smartico-network:
    driver: bridge
```

---

## Environment Variables

### Backend (.NET)

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

# CORS
CORS__ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
```

---

## Updated Timeline

### With .NET 9 Backend (7-9 weeks, 2-person team)

```
Week 1-2: Foundation
├─ Frontend setup (Phase 1)
├─ .NET 9 backend setup (Phase 1B) ← UPDATED
└─ Redux state management (Phase 2)

Week 3: Infrastructure
├─ SignalR Hub & Progress Broadcaster ← NEW
├─ Caching services (IMemoryCache + Redis)
└─ Error handling

Week 4-5: UI Components
├─ Presentational components
├─ Container components
└─ Pages & routing

Week 6: Testing
├─ Backend tests (xUnit + FluentAssertions) ← UPDATED
├─ Frontend tests (Jest + RTL)
└─ Integration tests (WebApplicationFactory) ← NEW

Week 7-8: Polish & Launch
├─ Performance optimization
├─ Accessibility audit
├─ Docker deployment ← UPDATED
├─ CI/CD setup (GitHub Actions / Azure DevOps)
└─ Production deployment
```

---

## Constitutional Compliance (.NET 9)

All backend tasks follow constitutional principles:

### ✅ Code Quality (SOLID & Clean Code)
- **Single Responsibility**: Each controller/service/handler has one job
- **Dependency Inversion**: Interfaces in Domain, implementations in Infrastructure
- **Strategy Pattern**: Cache adapters (Memory, Redis)
- **Clean Architecture**: 4-layer structure (API, Application, Domain, Infrastructure)
- **Vertical Slices**: Feature folders (Missions, Badges, Progress)

### ✅ Testing Excellence (AAA Pattern + Single Assert)
- **TASK-018**: Backend unit tests with xUnit + AAA + single assert
- **TASK-019**: Integration tests with WebApplicationFactory
- **Coverage target:** >90% for backend

### ✅ Security
- **TASK-010**: JWT authentication middleware
- **TASK-009**: Helmet-equivalent (Security headers), CORS, rate limiting
- JWT validation, no sensitive data in logs
- Rate limiting (ASP.NET Core built-in)

### ✅ Performance
- **TASK-013**: Server-side caching (IMemoryCache + Redis)
- **TASK-017**: SignalR for real-time updates (automatic fallback)
- Request logging and monitoring (Serilog)
- Docker multi-stage builds (optimized image size)

### ✅ Type Safety & Documentation
- C# 12 with nullable reference types enabled (strict)
- Explicit return types
- No `var` for public APIs
- XML documentation comments (/// summary)
- Swagger/OpenAPI documentation

---

## Integration with Frontend

### Before (Frontend-only)
```
Frontend (React)
    ↓
@smartico/public-api (TypeScript)
    ↓
Smartico Backend
```

### After (Full-stack .NET 9)
```
Frontend (React + TypeScript)
    ↓ HTTP REST API
Backend (.NET 9 / ASP.NET Core)
    ↓ HttpClient + Polly
Smartico API Backend
```

### Frontend Changes Required

Update API calls to use backend endpoints:

```typescript
// Before
import { WSAPI } from '@smartico/public-api';
const wsApi = new WSAPI({ apiKey, brandKey });
const missions = await wsApi.getMissions();

// After
const response = await fetch('/api/missions', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const missions = await response.json();
```

### SignalR Client (Frontend)

```typescript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/progress', {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect()
  .build();

// Subscribe to events
connection.on('MissionProgressUpdated', (data) => {
  dispatch(updateMissionProgress(data));
});

connection.on('MissionCompleted', (data) => {
  dispatch(completeMission(data));
});

await connection.start();

// Subscribe to specific missions
await connection.invoke('SubscribeToMissions', ['mission1', 'mission2']);
```

---

## Deployment Notes (.NET 9)

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer / Nginx                    │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         ▼                ▼
┌─────────────┐   ┌─────────────┐
│  Frontend   │   │   Backend   │
│  (Static)   │   │  (.NET 9)   │
│  Vercel/    │   │   Docker    │
│  Netlify    │   │   Azure/AWS │
└─────────────┘   └──────┬──────┘
                         │
                         ▼
                 ┌───────────────┐
                 │  Smartico API │
                 │    Backend    │
                 └───────────────┘
```

### Cloud Deployment Options

1. **Azure App Service** (PaaS, easiest)
   - Supports .NET 9 natively
   - Built-in scaling
   - SignalR works out-of-the-box

2. **AWS ECS** (Container orchestration)
   - Deploy Docker containers
   - Auto-scaling groups
   - Application Load Balancer

3. **Self-hosted Kubernetes**
   - Maximum flexibility
   - Deploy anywhere
   - Horizontal pod autoscaling

---

## Migration from Node.js to .NET 9

### Why the Change?

Stakeholder requested .NET 9 backend due to:
- Better performance (compiled vs interpreted)
- Stronger typing (C# vs TypeScript)
- Enterprise support (Microsoft backing)
- Team expertise in .NET
- Better integration with existing .NET infrastructure

### What Changed?

| Aspect | Node.js/Express | .NET 9/ASP.NET Core |
|--------|----------------|---------------------|
| **Runtime** | Node.js 18+ | .NET 9 |
| **Language** | TypeScript 5+ | C# 12 |
| **Framework** | Express 4+ | ASP.NET Core 9.0 |
| **WebSocket** | `ws` library | SignalR (built-in) |
| **Caching** | node-cache | IMemoryCache (built-in) |
| **Testing** | Jest | xUnit + FluentAssertions + Moq |
| **Validation** | express-validator | FluentValidation |
| **Logging** | Winston/Pino | Serilog |
| **DI** | Manual/tsyringe | Built-in DI container |
| **API Docs** | Custom | Swagger (Swashbuckle) |
| **Deployment** | Docker (Node:18-alpine) | Docker (mcr.microsoft.com/dotnet/aspnet:9.0) |

### What Stayed the Same?

- Frontend (React + TypeScript) - unchanged
- @smartico/public-api TypeScript interfaces used as reference for C# models
- Clean Architecture pattern
- REST API contract (same endpoints)
- Docker containerization approach
- Constitutional principles compliance

---

## Next Steps

After architecture approval:

1. **Execute TASK-007**: Initialize .NET 9 solution
2. **Execute TASK-008-020**: Complete all backend tasks sequentially
3. **Parallel Development**: Frontend (TASK-001-006) can be done in parallel with backend
4. **Integration**: Connect frontend to .NET backend APIs (Week 5-6)
5. **Testing**: Comprehensive testing (Week 6-7)
6. **Deployment**: Docker + CI/CD (Week 7-8)

---

**Status:** ✅ Backend migration from Node.js to .NET 9 complete  
**Total Project Estimate:** 303 hours (7-9 weeks with 2-person team)  
**Backend Estimate:** 60 hours (14 tasks)  
**Frontend Estimate:** 243 hours (remaining tasks)

