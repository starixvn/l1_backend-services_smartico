# Feature Specification: Dashboard API Integration

## Overview

Enable the player dashboard frontend to display gamification data (jackpots, missions, badges) by having the backend API (`backend/src/Smartico.Missions.Api`) read directly from the MongoDB database that is populated by the backoffice-api. This integration allows operators to configure campaigns in the back office and have players immediately see them in their dashboard.

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Backoffice Admin   │     │   Player Dashboard  │     │                     │
│  (React Frontend)   │     │  (React Frontend)   │     │                     │
└─────────┬───────────┘     └─────────┬───────────┘     │                     │
          │                           │                 │                     │
          ▼                           ▼                 │                     │
┌─────────────────────┐     ┌─────────────────────┐     │                     │
│  backoffice-api     │     │  backend            │     │     MongoDB         │
│  (Write Operations) │────▶│  Smartico.Missions  │◀────│  smartico_backoffice│
│  Port: 5001         │     │  .Api (Read)        │     │                     │
└─────────────────────┘     │  Port: 5000         │     │  Collections:       │
          │                 └─────────────────────┘     │  - jackpots         │
          │                           │                 │  - missions         │
          └───────────────────────────┴────────────────▶│  - badges           │
                        Write/Read                      │  - playerProgress   │
                                                        └─────────────────────┘
```

## Goals

1. Backend API reads jackpots, missions, badges from MongoDB (populated by backoffice-api)
2. Player dashboard displays data created via Demo Starter Pack
3. Ensure API responses match dashboard widget data structures in DASHBOARD.md
4. Provide real-time updates via existing SignalR ProgressHub
5. Support multi-tenant data isolation by operatorId

## Non-Goals

1. Modifying backoffice-api (it already writes to MongoDB correctly)
2. Creating new database - use existing `smartico_backoffice` database
3. Authentication changes (use existing userId query parameter pattern)
4. Mobile native application support

## Success Criteria

- `GET /api/jackpots` returns jackpots created via backoffice Demo API
- `GET /api/missions` returns missions created via backoffice Demo API
- `GET /api/badges` returns badges created via backoffice Demo API
- Dashboard widgets display the demo content correctly
- Data is isolated per operator (multi-tenancy)

---

## Functional Requirements

### FR-1: Backend MongoDB Integration

#### FR-1.1: Database Connection

Backend API connects to the same MongoDB database as backoffice-api.

**Database**: `smartico_backoffice` (or `smartico_backoffice_dev` for development)
**Connection**: `mongodb://localhost:27017`

**Collections to Read**:
| Collection | Entity | Description |
|------------|--------|-------------|
| `jackpots` | Jackpot | Progressive/fixed jackpots with tiers |
| `missions` | Mission | Campaign missions with tasks |
| `badges` | Badge | Achievement badges with unlock criteria |
| `playerProgress` | PlayerProgress | Player state (NEW - for tracking) |

#### FR-1.2: Multi-Tenant Data Access

All queries must filter by `operatorId` to ensure data isolation:

```csharp
// All repository methods must include operator filter
var filter = Builders<Jackpot>.Filter.And(
    Builders<Jackpot>.Filter.Eq(j => j.OperatorId, operatorId),
    Builders<Jackpot>.Filter.Eq(j => j.Status, JackpotStatus.Active)
);
```

### FR-2: Jackpot API Enhancement

#### FR-2.1: Read Jackpots from MongoDB

Replace current mock/external API with MongoDB read.

**Endpoint**: `GET /api/jackpots?userId={userId}`

**Current Implementation**: Uses `ISmarticoJackpotApiClient` (external HTTP)
**New Implementation**: Read from `jackpots` collection in MongoDB

**Response Mapping** (BackOffice → Dashboard):
| MongoDB Field | API Response Field |
|---------------|-------------------|
| `_id` | `templateId` |
| `Name` | `publicMeta.name` |
| `Description` | `publicMeta.description` |
| `IconUrl` | `publicMeta.imageUrl` |
| `Tiers[].Name` | `pots[].name` |
| `Tiers[].CurrentValue` | `pots[].currentValue` |
| `Status` | Filter: only return `Active` |

#### FR-2.2: Jackpot Response Format

Match existing `GetJackpotsResponse` structure:

```json
{
  "jackpots": [
    {
      "templateId": 1,
      "publicMeta": {
        "name": "Daily Must-Drop",
        "description": "Drops every day before midnight",
        "imageUrl": "/jackpots/daily.png"
      },
      "pots": [
        { "name": "Grand", "currentValue": 100000 },
        { "name": "Major", "currentValue": 20000 },
        { "name": "Mini", "currentValue": 5000 }
      ],
      "isOptedIn": false,
      "temperature": "Hot"
    }
  ]
}
```

### FR-3: Mission API Enhancement

#### FR-3.1: Read Missions from MongoDB

Replace current `ISmarticoApiClient.GetMissionsAsync` with MongoDB read.

**Endpoint**: `GET /api/missions?userId={userId}`

**Response Mapping** (BackOffice → Dashboard):
| MongoDB Field | API Response Field |
|---------------|-------------------|
| `_id` | `id` |
| `Name` | `name` |
| `Description` | `description` |
| `Tasks[0].Goal.TargetCount` | `targetValue` |
| `CompletionXp` | `rewardAmount` |
| `EndDate` | `expiresAt` |
| `Status` | Filter: only return `Active` |

Player progress comes from `playerProgress` collection:
| PlayerProgress Field | API Response Field |
|---------------------|-------------------|
| `missionProgress[missionId].currentValue` | `progress` (calculated %) |
| `missionProgress[missionId].completedAt` | `isCompleted` |

### FR-4: Badge API Enhancement

#### FR-4.1: Read Badges from MongoDB

Replace current `ISmarticoApiClient.GetBadgesAsync` with MongoDB read.

**Endpoint**: `GET /api/badges?userId={userId}`

**Response Mapping** (BackOffice → Dashboard):
| MongoDB Field | API Response Field |
|---------------|-------------------|
| `_id` | `id` |
| `Name` | `name` |
| `Description` | `description` |
| `IconUrl` | `imageUrl` |
| `Rarity` | `category` (Common/Rare/Epic/Legendary) |
| `Status` | Filter: only return `Active` |

Player earned status from `playerProgress` collection:
| PlayerProgress Field | API Response Field |
|---------------------|-------------------|
| `badgesEarned` contains badge id | `isEarned: true` |
| `badgesEarned[].earnedAt` | `earnedAt` |

### FR-5: Player Progress Tracking

#### FR-5.1: PlayerProgress Collection

New collection to track player state per operator:

**Collection**: `playerProgress`

```json
{
  "_id": ObjectId,
  "operatorId": ObjectId,
  "playerId": "user123",
  "missionProgress": {
    "mission-object-id": {
      "taskProgress": { "task-1": 14, "task-2": 5 },
      "currentValue": 14,
      "completedAt": null
    }
  },
  "badgesEarned": [
    { "badgeId": "badge-object-id", "earnedAt": "2025-12-01T10:30:00Z" }
  ],
  "jackpotOptIns": ["jackpot-object-id"],
  "jackpotContributions": {
    "jackpot-object-id": 250.00
  },
  "level": 12,
  "xp": 7500,
  "createdAt": "2025-12-01T00:00:00Z",
  "updatedAt": "2025-12-01T12:00:00Z"
}
```

#### FR-5.2: Demo Mode - Auto-Create Player Progress

When Demo Starter Pack is set up, optionally create sample player progress:

```csharp
// POST /api/demo/setup/complete-starter-pack creates:
// 1. Missions, Jackpots, Badges (existing)
// 2. Sample PlayerProgress with partial completion (new)
```

---

## Technical Requirements

### TR-1: Backend Infrastructure Layer

#### TR-1.1: MongoDB Configuration

Add MongoDB settings to `backend/src/Smartico.Missions.Api/appsettings.json`:

```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "smartico_backoffice_dev"
  }
}
```

#### TR-1.2: MongoDB Settings Class

Create configuration class:

```
backend/src/Smartico.Missions.Infrastructure/Configuration/MongoDbSettings.cs
```

```csharp
public class MongoDbSettings
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string DatabaseName { get; set; } = "smartico_backoffice_dev";
}
```

#### TR-1.3: DI Registration

Update `Program.cs` to register MongoDB:

```csharp
// Add MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDb"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return client.GetDatabase(settings.DatabaseName);
});
```

### TR-2: Shared Domain Entities

#### TR-2.1: Reference BackOffice Domain

Option A: **Project Reference** (recommended for monorepo)
```xml
<!-- backend/src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj -->
<ItemGroup>
  <ProjectReference Include="..\..\..\..\backoffice-api\src\Smartico.BackOffice.Domain\Smartico.BackOffice.Domain.csproj" />
</ItemGroup>
```

Option B: **Duplicate Entities** (if projects must be independent)
Create read-only entity classes in backend that match backoffice schema.

#### TR-2.2: Entity Classes Needed

From `backoffice-api/src/Smartico.BackOffice.Domain/Entities/`:
- `Jackpot.cs` - with `JackpotTier`, `JackpotStatus`
- `Mission.cs` - with `MissionTask`, `MissionStatus`
- `Badge.cs` - with `BadgeRarity`, `BadgeStatus`

### TR-3: Repository Layer

#### TR-3.1: Repository Interfaces

```
backend/src/Smartico.Missions.Domain/Interfaces/
├── IJackpotReadRepository.cs
├── IMissionReadRepository.cs
├── IBadgeReadRepository.cs
└── IPlayerProgressRepository.cs
```

```csharp
// IJackpotReadRepository.cs
public interface IJackpotReadRepository
{
    Task<List<Jackpot>> GetActiveJackpotsAsync(ObjectId operatorId, CancellationToken ct = default);
    Task<Jackpot?> GetByIdAsync(ObjectId operatorId, ObjectId jackpotId, CancellationToken ct = default);
}
```

#### TR-3.2: Repository Implementations

```
backend/src/Smartico.Missions.Infrastructure/Repositories/
├── JackpotReadRepository.cs
├── MissionReadRepository.cs
├── BadgeReadRepository.cs
└── PlayerProgressRepository.cs
```

```csharp
// JackpotReadRepository.cs
public class JackpotReadRepository : IJackpotReadRepository
{
    private readonly IMongoCollection<Jackpot> _collection;

    public JackpotReadRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<Jackpot>("jackpots");
    }

    public async Task<List<Jackpot>> GetActiveJackpotsAsync(ObjectId operatorId, CancellationToken ct)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(j => j.OperatorId, operatorId),
            Builders<Jackpot>.Filter.Eq(j => j.Status, JackpotStatus.Active)
        );

        return await _collection.Find(filter).ToListAsync(ct);
    }
}
```

### TR-4: Query Handlers Update

#### TR-4.1: Update GetJackpotsQueryHandler

Replace external API call with repository:

```csharp
// Before (external API)
var jackpots = await _smarticoJackpotApiClient.GetJackpotsAsync(query.UserId);

// After (MongoDB)
var jackpots = await _jackpotReadRepository.GetActiveJackpotsAsync(operatorId, ct);
var playerProgress = await _playerProgressRepository.GetByPlayerIdAsync(operatorId, query.UserId, ct);

return new GetJackpotsResponse
{
    Jackpots = jackpots.Select(j => MapToDto(j, playerProgress)).ToList()
};
```

#### TR-4.2: Update MissionsController

Replace `ISmarticoApiClient` with repository:

```csharp
// Before
var missions = await _smarticoClient.GetMissionsAsync(userId, cancellationToken);

// After
var missions = await _missionReadRepository.GetActiveMissionsAsync(operatorId, cancellationToken);
var playerProgress = await _playerProgressRepository.GetByPlayerIdAsync(operatorId, userId, cancellationToken);

return Ok(ApiResponse<IEnumerable<MissionDto>>.Ok(
    missions.Select(m => MapToDto(m, playerProgress))
));
```

### TR-5: Operator ID Resolution

#### TR-5.1: Default Operator for Demo

For demo purposes, use a default operator ID:

```csharp
// In appsettings.json
{
  "Demo": {
    "DefaultOperatorId": "000000000000000000000001"
  }
}

// In controllers/handlers
var operatorId = ObjectId.Parse(_configuration["Demo:DefaultOperatorId"]);
```

#### TR-5.2: Future: JWT-based Operator Resolution

When auth is implemented, extract from JWT claims:

```csharp
var operatorId = ObjectId.Parse(User.FindFirst("operator_id")?.Value);
```

---

## API Endpoints Summary

### Existing Endpoints (to be updated)

| Method | Endpoint | Current Source | New Source |
|--------|----------|----------------|------------|
| `GET` | `/api/jackpots?userId=` | External API | MongoDB `jackpots` |
| `GET` | `/api/jackpots/winners?userId=` | External API | MongoDB (future) |
| `POST` | `/api/jackpots/{id}/opt-in` | External API | MongoDB `playerProgress` |
| `POST` | `/api/jackpots/{id}/opt-out` | External API | MongoDB `playerProgress` |
| `GET` | `/api/missions?userId=` | External API | MongoDB `missions` |
| `GET` | `/api/missions/{id}?userId=` | External API | MongoDB `missions` |
| `POST` | `/api/missions/{id}/opt-in?userId=` | External API | MongoDB `playerProgress` |
| `POST` | `/api/missions/{id}/claim?userId=` | External API | MongoDB `playerProgress` |
| `GET` | `/api/badges?userId=` | External API | MongoDB `badges` |
| `GET` | `/api/badges/{id}?userId=` | External API | MongoDB `badges` |

---

## Data Flow

### Demo Setup Flow

```
1. Operator opens Backoffice Admin UI
2. Operator triggers Demo API: POST /api/demo/setup/complete-starter-pack
3. backoffice-api creates:
   - 3 Missions in `missions` collection
   - 2 Jackpots in `jackpots` collection
   - 3 Badges in `badges` collection
4. Player opens Dashboard
5. Dashboard calls: GET /api/jackpots?userId=user123
6. backend reads from `jackpots` collection
7. Dashboard displays jackpot widgets with demo data
```

### Real-Time Updates Flow

```
1. Jackpot value changes (via backoffice or game event)
2. Update written to MongoDB `jackpots` collection
3. SignalR hub broadcasts: jackpot-value-updated
4. Dashboard receives event, updates widget
```

---

## Migration Steps

### Phase 1: Infrastructure Setup
1. Add MongoDB.Driver package to backend Infrastructure project
2. Create MongoDbSettings configuration class
3. Register MongoDB services in DI container
4. Add connection string to appsettings.json

### Phase 2: Repository Implementation
1. Create read-only repository interfaces in Domain
2. Implement repositories in Infrastructure
3. Reference or duplicate BackOffice domain entities
4. Register repositories in DI

### Phase 3: Controller Updates
1. Update JackpotsController to use repository
2. Update MissionsController to use repository
3. Update BadgesController to use repository
4. Add PlayerProgress repository for tracking

### Phase 4: Testing
1. Run backoffice Demo API to create test data
2. Verify backend API returns demo data
3. Test dashboard displays correct widgets
4. Verify multi-tenant isolation

---

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
```

### Modified Files
```
backend/src/Smartico.Missions.Api/
├── appsettings.json (add MongoDB config)
├── appsettings.Development.json (add MongoDB config)
├── Program.cs (register MongoDB services)

backend/src/Smartico.Missions.Infrastructure/
├── Smartico.Missions.Infrastructure.csproj (add MongoDB.Driver, project reference)
├── DependencyInjection.cs (register repositories)

backend/src/Smartico.Missions.Application/
├── Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryHandler.cs
├── Features/Missions/... (if using CQRS)
├── Features/Badges/... (if using CQRS)
```

---

## Dependencies

### NuGet Packages
```xml
<!-- backend/src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj -->
<PackageReference Include="MongoDB.Driver" Version="2.23.0" />
```

### Project References
```xml
<!-- Option A: Reference backoffice domain -->
<ProjectReference Include="..\..\..\..\backoffice-api\src\Smartico.BackOffice.Domain\Smartico.BackOffice.Domain.csproj" />
```

---

## Configuration

### appsettings.Development.json
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "smartico_backoffice_dev"
  },
  "Demo": {
    "DefaultOperatorId": "000000000000000000000001"
  }
}
```

### appsettings.json (Production)
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://mongo-server:27017",
    "DatabaseName": "smartico_backoffice"
  }
}
```

---

*Generated with [Claude Code](https://claude.com/claude-code)*
