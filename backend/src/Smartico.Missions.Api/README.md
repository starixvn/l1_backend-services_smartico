# Smartico.Missions.Api

**Layer:** API / Presentation (HTTP Entry Point)  
**Dependencies:** Application, Infrastructure

## Purpose

The API layer is the entry point for HTTP requests and WebSocket connections. It handles HTTP routing, request validation, authentication, and response formatting using ASP.NET Core.

## Structure

```
Api/
├── Controllers/              # REST API controllers
│   ├── MissionsController.cs # Mission endpoints
│   ├── BadgesController.cs   # Badge endpoints
│   └── HealthController.cs   # Health check endpoint
├── Hubs/                     # SignalR hubs
│   └── ProgressHub.cs        # Real-time progress updates hub
├── Middleware/               # Custom middleware
│   ├── ExceptionHandlingMiddleware.cs  # Global error handler
│   └── RequestLoggingMiddleware.cs     # Request/response logging
├── Filters/                  # Action filters
│   └── ValidateModelFilter.cs          # Model validation filter
├── Program.cs                # Application entry point
└── appsettings.json          # Configuration
```

## Principles

- **Thin Controllers**: Controllers delegate to Application layer
- **RESTful Design**: Follows REST conventions
- **Model Validation**: Automatic validation using FluentValidation
- **Swagger/OpenAPI**: Auto-generated API documentation
- **Authentication**: JWT Bearer token authentication
- **CORS**: Configured for frontend origins

## API Endpoints

### Missions
- `GET /api/missions` - List all missions
- `GET /api/missions/{id}` - Get mission by ID
- `POST /api/missions/{id}/opt-in` - Opt into a mission
- `POST /api/missions/{id}/claim` - Claim mission reward

### Badges
- `GET /api/badges` - List all badges
- `GET /api/badges/{id}` - Get badge by ID

### Health
- `GET /health` - Health check endpoint

## SignalR Hubs

### ProgressHub
Real-time connection for mission progress updates.

**Methods:**
- `SubscribeToMissionUpdates()` - Subscribe to mission progress
- `UnsubscribeFromMissionUpdates()` - Unsubscribe

**Events:**
- `MissionProgressUpdated` - Sent when progress changes
- `MissionCompleted` - Sent when mission is completed

## Middleware Pipeline

```
Request → CORS → Authentication → Exception Handling → 
Request Logging → Rate Limiting → Controller → Response
```

## Configuration

### appsettings.json
```json
{
  "Jwt": {
    "Issuer": "smartico-missions",
    "Audience": "smartico-frontend",
    "SecretKey": "your-secret-key-here",
    "ExpirationMinutes": 60
  },
  "Smartico": {
    "ApiKey": "your-api-key",
    "BrandKey": "your-brand-key",
    "Environment": "development",
    "BaseUrl": "https://api.smartico.ai"
  },
  "Cache": {
    "DefaultTtlSeconds": 30
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

## Running the API

```bash
# Development
dotnet run

# Production
dotnet run --configuration Release

# With hot reload
dotnet watch run
```

API will be available at:
- HTTPS: https://localhost:5001
- HTTP: http://localhost:5000
- Swagger: https://localhost:5001/swagger

---

**Architecture Pattern:** Clean Architecture (Presentation Layer)  
**Created:** 2024-10-29

