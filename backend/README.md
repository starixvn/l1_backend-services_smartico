# Smartico Missions & Badges - .NET 9 Backend

**Version:** 1.0.0  
**Framework:** .NET 9 / ASP.NET Core 9.0  
**Architecture:** Clean Architecture with Vertical Slices

---

## 🏗️ Project Structure

```
backend/
├── Smartico.Missions.sln                    # Solution file
├── global.json                              # .NET SDK version lock (9.0.102)
├── Directory.Build.props                    # Shared MSBuild properties
├── NuGet.config                             # NuGet package sources
├── .editorconfig                            # Code style rules
├── .gitignore                               # Git ignore patterns
│
└── src/
    ├── Smartico.Missions.Api/               # API Layer (Controllers + SignalR Hubs)
    ├── Smartico.Missions.Application/       # Application Layer (Services + Use Cases)
    ├── Smartico.Missions.Domain/            # Domain Layer (Entities + Interfaces)
    └── Smartico.Missions.Infrastructure/    # Infrastructure Layer (External Services)
```

---

## ✅ Clean Architecture Dependency Flow

```
Api → Application → Domain ← Infrastructure
```

- **Api** depends on Application & Infrastructure
- **Application** depends on Domain
- **Infrastructure** depends on Domain
- **Domain** has no dependencies (pure business logic)

---

## 🚀 Quick Start

### Prerequisites

- .NET 9 SDK ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- Visual Studio 2022 (17.8+) or Visual Studio Code with C# extension
- Docker Desktop (optional, for containerization)

### Build & Run

```bash
# Restore NuGet packages
dotnet restore

# Build solution
dotnet build

# Run API project
dotnet run --project src/Smartico.Missions.Api

# API will start at:
# - HTTPS: https://localhost:5001
# - HTTP: http://localhost:5000
# - Swagger UI: https://localhost:5001/swagger
```

### Development with Hot Reload

```bash
# Watch mode (auto-reloads on file changes)
dotnet watch run --project src/Smartico.Missions.Api
```

---

## 🧪 Testing

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true /p:CoverageThreshold=90
```

---

## 🔧 Configuration

### appsettings.Development.json

Located in `src/Smartico.Missions.Api/appsettings.Development.json`:

```json
{
  "Jwt": {
    "Issuer": "https://yourapp.com",
    "Audience": "smartico-missions-api",
    "SecretKey": "your-secret-key-256-bit",
    "ExpirationMinutes": 60
  },
  "Smartico": {
    "ApiKey": "your_smartico_api_key",
    "BrandKey": "your_brand_key",
    "Environment": "development",
    "BaseUrl": "https://api.smartico.ai"
  },
  "Cache": {
    "DefaultTtlSeconds": 30
  },
  "Cors": {
    "Origins": "http://localhost:3000"
  }
}
```

---

## 📦 Technology Stack

- **Runtime:** .NET 9
- **Framework:** ASP.NET Core 9.0 (Web API + SignalR)
- **Language:** C# 12 with nullable reference types
- **HTTP Client:** HttpClient with Polly (resilience)
- **Caching:** IMemoryCache + StackExchange.Redis (optional)
- **Real-time:** SignalR (WebSocket with automatic fallback)
- **Authentication:** JWT Bearer tokens
- **Validation:** FluentValidation
- **Logging:** Serilog
- **Testing:** xUnit + FluentAssertions + Moq
- **API Docs:** Swagger/OpenAPI (Swashbuckle)

---

## 📋 Next Steps

Follow the implementation plan in `.specify/specs/1-missions-badges/tasks.md`:

1. ✅ **TASK-007:** Backend Project Initialization (COMPLETED)
2. **TASK-008:** Define Clean Architecture folder structure
3. **TASK-009:** Configure ASP.NET Core middleware (Security, CORS, Rate Limiting)
4. **TASK-010:** Implement JWT Authentication middleware
5. **TASK-011:** Create Domain layer (Entities + Interfaces)
6. Continue through TASK-020...

---

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t smartico-missions-api -f Dockerfile .

# Run container
docker run -p 5000:8080 -p 5001:8081 smartico-missions-api

# Or use docker-compose
docker-compose up
```

---

## 📚 Resources

- [Architecture Design Document](../.specify/specs/1-missions-badges/architecture.md)
- [Task Breakdown](../.specify/specs/1-missions-badges/tasks.md)
- [Backend Tasks Addendum](../.specify/specs/1-missions-badges/BACKEND_TASKS_ADDENDUM.md)

---

**Status:** ✅ Foundation Complete - Ready for Implementation  
**Created:** 2024-10-29  
**Last Updated:** 2024-10-29

