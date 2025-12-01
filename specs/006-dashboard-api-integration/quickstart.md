# Dashboard API Integration - Quickstart Guide

**Version:** 1.0.0
**Created:** 2025-12-01

## Prerequisites

Before starting implementation, ensure you have:

- [ ] .NET 9.0 SDK installed
- [ ] MongoDB running locally on port 27017
- [ ] backoffice-api project accessible
- [ ] Demo data created via backoffice-api Demo API

## Quick Setup

### 1. Verify MongoDB is Running

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Should return: { ok: 1 }
```

### 2. Create Demo Data (if not exists)

```bash
# Start backoffice-api
cd backoffice-api
dotnet run --project src/Smartico.BackOffice.Api

# In another terminal, create demo data
curl -X POST http://localhost:5001/api/demo/setup/complete-starter-pack
```

### 3. Add MongoDB Package

```bash
cd backend/src/Smartico.Missions.Infrastructure
dotnet add package MongoDB.Driver --version 2.23.0
```

### 4. Add Project Reference

Edit `Smartico.Missions.Infrastructure.csproj`:

```xml
<ItemGroup>
  <ProjectReference Include="..\..\..\..\backoffice-api\src\Smartico.BackOffice.Domain\Smartico.BackOffice.Domain.csproj" />
</ItemGroup>
```

### 5. Add Configuration

Edit `backend/src/Smartico.Missions.Api/appsettings.Development.json`:

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

### 6. Register MongoDB Services

In `Program.cs`, add:

```csharp
using MongoDB.Driver;
using Microsoft.Extensions.Options;

// After builder creation
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

### 7. Create Repository Interface

Create `backend/src/Smartico.Missions.Domain/Interfaces/IJackpotReadRepository.cs`:

```csharp
using MongoDB.Bson;
using Smartico.BackOffice.Domain.Entities;

namespace Smartico.Missions.Domain.Interfaces;

public interface IJackpotReadRepository
{
    Task<List<Jackpot>> GetActiveJackpotsAsync(ObjectId operatorId, CancellationToken ct = default);
    Task<Jackpot?> GetByIdAsync(ObjectId operatorId, ObjectId jackpotId, CancellationToken ct = default);
}
```

### 8. Implement Repository

Create `backend/src/Smartico.Missions.Infrastructure/Repositories/JackpotReadRepository.cs`:

```csharp
using MongoDB.Bson;
using MongoDB.Driver;
using Smartico.BackOffice.Domain.Entities;
using Smartico.BackOffice.Domain.ValueObjects;
using Smartico.Missions.Domain.Interfaces;

namespace Smartico.Missions.Infrastructure.Repositories;

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

    public async Task<Jackpot?> GetByIdAsync(ObjectId operatorId, ObjectId jackpotId, CancellationToken ct)
    {
        var filter = Builders<Jackpot>.Filter.And(
            Builders<Jackpot>.Filter.Eq(j => j.Id, jackpotId),
            Builders<Jackpot>.Filter.Eq(j => j.OperatorId, operatorId)
        );

        return await _collection.Find(filter).FirstOrDefaultAsync(ct);
    }
}
```

### 9. Register Repository

In DI setup:

```csharp
builder.Services.AddScoped<IJackpotReadRepository, JackpotReadRepository>();
```

### 10. Update Query Handler

Modify `GetJackpotsQueryHandler.cs` to use the repository:

```csharp
public class GetJackpotsQueryHandler : IRequestHandler<GetJackpotsQuery, GetJackpotsResponse>
{
    private readonly IJackpotReadRepository _jackpotRepository;
    private readonly IConfiguration _configuration;

    public GetJackpotsQueryHandler(
        IJackpotReadRepository jackpotRepository,
        IConfiguration configuration)
    {
        _jackpotRepository = jackpotRepository;
        _configuration = configuration;
    }

    public async Task<GetJackpotsResponse> Handle(GetJackpotsQuery request, CancellationToken ct)
    {
        var operatorId = ObjectId.Parse(_configuration["Demo:DefaultOperatorId"]);
        var jackpots = await _jackpotRepository.GetActiveJackpotsAsync(operatorId, ct);

        return new GetJackpotsResponse
        {
            Jackpots = jackpots.Select(j => MapToDto(j)).ToList()
        };
    }

    private JackpotDto MapToDto(Jackpot jackpot)
    {
        return new JackpotDto
        {
            TemplateId = jackpot.Id.GetHashCode(),
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
            IsOptedIn = false,
            Temperature = "Warm"
        };
    }
}
```

### 11. Test the Integration

```bash
# Start backend
cd backend
dotnet run --project src/Smartico.Missions.Api

# Test endpoint
curl http://localhost:5000/api/jackpots?userId=user123
```

Expected response:
```json
{
  "jackpots": [
    {
      "templateId": 12345,
      "publicMeta": {
        "name": "Daily Must-Drop",
        "description": "Drops every day before midnight",
        "imageUrl": null
      },
      "pots": [
        { "name": "Grand", "currentValue": 10000 },
        { "name": "Major", "currentValue": 2500 },
        { "name": "Mini", "currentValue": 500 }
      ],
      "isOptedIn": false,
      "temperature": "Warm"
    }
  ]
}
```

## Troubleshooting

### MongoDB Connection Error

```
MongoConnectionException: Unable to connect to server
```

**Solution:** Ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### No Data Returned

**Solution:** Verify demo data exists:
```bash
mongosh smartico_backoffice_dev --eval "db.jackpots.countDocuments()"
```

If 0, run the demo setup:
```bash
curl -X POST http://localhost:5001/api/demo/setup/complete-starter-pack
```

### Project Reference Error

```
error CS0234: The type or namespace name 'BackOffice' does not exist
```

**Solution:** Verify the project reference path is correct:
```bash
# From backend/src/Smartico.Missions.Infrastructure
ls ../../../../backoffice-api/src/Smartico.BackOffice.Domain/
```

### OperatorId Filter Returns Empty

**Solution:** Check the operator ID matches:
```bash
mongosh smartico_backoffice_dev --eval "db.jackpots.find({}, {operatorId: 1})"
```

Update `appsettings.Development.json` with the correct operator ID.

## Next Steps

After completing the quickstart:

1. Implement `IMissionReadRepository` and `IBadgeReadRepository`
2. Add `PlayerProgress` entity and repository
3. Update `MissionsController` and `BadgesController`
4. Add unit tests for repositories
5. Test end-to-end with dashboard frontend

---

*Generated with [Claude Code](https://claude.com/claude-code)*
