# Dashboard API Integration - Research

**Version:** 1.0.0
**Created:** 2025-12-01
**Status:** Complete

## Research Tasks

### 1. MongoDB Driver Integration in .NET 9

**Question:** How to properly configure MongoDB.Driver in an ASP.NET Core application?

**Decision:** Use singleton IMongoClient with scoped IMongoDatabase

**Rationale:**
- MongoDB.Driver 2.23+ is fully compatible with .NET 9
- IMongoClient manages connection pooling internally and should be singleton
- IMongoDatabase can be scoped as it's lightweight
- Configuration via IOptions<MongoDbSettings> pattern

**Implementation:**
```csharp
// Program.cs
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

**Alternatives Considered:**
- Entity Framework Core MongoDB provider - Less mature, adds abstraction
- Direct MongoClient per request - Inefficient, no connection pooling

---

### 2. Cross-Project Entity Sharing

**Question:** How to share domain entities between backoffice-api and backend projects?

**Decision:** Project reference to BackOffice.Domain

**Rationale:**
- Ensures schema consistency between write and read sides
- Single source of truth for entity definitions
- BSON serialization attributes already configured
- Avoids duplication and potential drift

**Implementation:**
```xml
<!-- backend/src/Smartico.Missions.Infrastructure/Smartico.Missions.Infrastructure.csproj -->
<ItemGroup>
  <ProjectReference Include="..\..\..\..\backoffice-api\src\Smartico.BackOffice.Domain\Smartico.BackOffice.Domain.csproj" />
</ItemGroup>
```

**Alternatives Considered:**
- Duplicate entities - Risk of schema drift, double maintenance
- Shared NuGet package - Overhead for internal-only sharing
- OpenAPI code generation - Adds complexity, may miss internal fields

---

### 3. Multi-Tenant Query Pattern

**Question:** How to ensure data isolation per operator in all queries?

**Decision:** Mandatory operatorId filter in all repository methods

**Rationale:**
- OperatorId is part of all entity models (from BackOffice.Domain)
- Existing indexes include operatorId as first field
- Repository pattern enforces consistent filtering
- Prevents accidental cross-tenant data access

**Implementation:**
```csharp
public async Task<List<Jackpot>> GetActiveJackpotsAsync(ObjectId operatorId, CancellationToken ct)
{
    var filter = Builders<Jackpot>.Filter.And(
        Builders<Jackpot>.Filter.Eq(j => j.OperatorId, operatorId),
        Builders<Jackpot>.Filter.Eq(j => j.Status, JackpotStatus.Active)
    );
    return await _collection.Find(filter).ToListAsync(ct);
}
```

**Alternatives Considered:**
- Global query filter - Not available in MongoDB driver
- Base repository class - Good addition for DRY, implement in future

---

### 4. Operator ID Resolution Strategy

**Question:** How to determine the operator ID for API requests?

**Decision:** Configuration-based default operator for demo, JWT claims for production

**Rationale:**
- Demo mode needs to work without authentication
- Default operator ID can be configured per environment
- Future JWT auth can override with claim value
- Gradual path to full multi-tenant auth

**Implementation:**
```json
// appsettings.Development.json
{
  "Demo": {
    "DefaultOperatorId": "000000000000000000000001"
  }
}
```

```csharp
public class OperatorIdResolver
{
    private readonly IConfiguration _configuration;

    public ObjectId GetOperatorId(ClaimsPrincipal? user = null)
    {
        // Future: Check JWT claims first
        // var claim = user?.FindFirst("operator_id");
        // if (claim != null) return ObjectId.Parse(claim.Value);

        // Fallback to demo default
        var defaultId = _configuration["Demo:DefaultOperatorId"];
        return ObjectId.Parse(defaultId);
    }
}
```

**Alternatives Considered:**
- Hard-coded operator ID - Not configurable across environments
- Query parameter - Security risk, exposes tenant IDs
- Subdomain-based - Requires DNS setup, overkill for demo

---

### 5. Response DTO Mapping Strategy

**Question:** How to transform BackOffice entities to API response DTOs?

**Decision:** Static mapper classes with explicit mapping methods

**Rationale:**
- Existing API has established response formats (GetJackpotsResponse, etc.)
- Static mappers are testable and explicit
- No runtime reflection overhead
- Easy to maintain and extend

**Implementation:**
```csharp
public static class JackpotMapper
{
    public static JackpotDto ToDto(Jackpot jackpot, PlayerProgress? progress = null)
    {
        return new JackpotDto
        {
            TemplateId = jackpot.Id.GetHashCode(), // Convert ObjectId to int
            PublicMeta = new JackpotPublicMeta
            {
                Name = jackpot.Name,
                Description = jackpot.Description,
                ImageUrl = jackpot.IconUrl
            },
            Pots = jackpot.Tiers.Select(t => new JackpotPot
            {
                Name = t.Name,
                CurrentValue = t.CurrentValue
            }).ToList(),
            IsOptedIn = progress?.JackpotOptIns?.Contains(jackpot.Id.ToString()) ?? false,
            Temperature = CalculateTemperature(jackpot)
        };
    }
}
```

**Alternatives Considered:**
- AutoMapper - Magic mappings harder to debug
- Manual inline mapping - Code duplication
- Expression-based mappers - Overkill for this use case

---

### 6. Player Progress Storage Schema

**Question:** How to structure player progress data in MongoDB?

**Decision:** Single document per player per operator with nested progress data

**Rationale:**
- Atomic updates to player state
- Single query to get all player data
- Matches existing pattern in backoffice
- Efficient for read-heavy dashboard use case

**Implementation:**
```json
{
  "_id": ObjectId,
  "operatorId": ObjectId,
  "playerId": "user123",
  "missionProgress": {
    "missionObjectId": {
      "taskProgress": { "taskId": 14 },
      "currentValue": 14,
      "completedAt": null
    }
  },
  "badgesEarned": [
    { "badgeId": "objectId", "earnedAt": ISODate }
  ],
  "jackpotOptIns": ["objectId1", "objectId2"],
  "level": 12,
  "xp": 7500,
  "updatedAt": ISODate
}
```

**Alternatives Considered:**
- Separate collections per entity type - More queries needed
- Flat structure - Harder to update nested progress
- Redis for progress - Adds infrastructure, persistence concerns

---

### 7. Existing API Compatibility

**Question:** Should we maintain backward compatibility with existing API responses?

**Decision:** Yes, maintain exact response format

**Rationale:**
- Frontend dashboard already consumes these endpoints
- Existing types (GetJackpotsResponse, Mission, Badge) are well-defined
- Only data source changes, not contract
- Minimizes frontend changes

**API Response Compatibility:**
| Endpoint | Current Format | Keep Same? |
|----------|---------------|------------|
| GET /api/jackpots | GetJackpotsResponse | ✅ Yes |
| GET /api/missions | ApiResponse<IEnumerable<Mission>> | ✅ Yes |
| GET /api/badges | ApiResponse<IEnumerable<Badge>> | ✅ Yes |

**Alternatives Considered:**
- New v2 endpoints - Migration overhead
- Breaking changes - Would require frontend updates

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|------------|
| MongoDB configuration | Singleton client, scoped database |
| Entity sharing | Project reference to BackOffice.Domain |
| Multi-tenant isolation | Mandatory operatorId in all queries |
| Operator ID source | Config default, future JWT claims |
| DTO mapping | Static mapper classes |
| Player progress schema | Single document per player |
| API compatibility | Maintain existing response formats |

---

*Generated with [Claude Code](https://claude.com/claude-code)*
