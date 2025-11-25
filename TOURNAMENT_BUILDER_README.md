# SabaONE Back Office - Tournament Builder MVP

A demo-ready Back Office Campaign Management system with tournament creation, leaderboard tracking, and real-time rankings.

## 🎯 Overview

This is a **full-stack Tournament Builder MVP** implementing Clean Architecture principles with complete tournament lifecycle management, from creation to leaderboard display.

**Demo Video**: [Coming Soon]

## ✨ Features Implemented (All 59 Tasks Completed!)

### Phase 1: Setup & Infrastructure ✅
- Backend solution with Clean Architecture (.NET 9)
- MongoDB integration with multi-tenant support
- React 19 frontend with TypeScript
- API client with retry logic and centralized error handling

### Phase 2: Foundational Components ✅
- Multi-tenant domain models with automatic OperatorId filtering
- Repository pattern with `BaseRepository<T>`
- FluentValidation for tournament commands
- Tournament CRUD services and REST controllers
- JWT-based operator context middleware

### Phase 3: Tournament Creation ✅
- Tournament form with Zod validation
- DateRangePicker component for scheduling
- PrizePoolConfig with dynamic prize distribution
- Full tournament creation flow with error handling

### Phase 4: Tournament Listing & Viewing ✅
- Tournament cards with status indicators
- Filterable tournament list (status, type, search)
- Detailed tournament view page
- Edit and delete functionality

### Phase 5: Real-Time Leaderboard ✅
- Leaderboard domain model and repository
- Mock data generator (50 fake players)
- Leaderboard table with rankings and player stats
- Search, filtering, and pagination
- Full leaderboard page with live rankings

### Phase 6: Polish & Demo Preparation ✅
- React Router navigation setup
- Root layout with header navigation
- Error boundaries for graceful error handling
- MongoDB performance indexes
- XML documentation for Swagger
- Comprehensive README documentation

## 🏗️ Architecture

### Backend (ASP.NET Core 9)

```
Api Layer
├── Controllers (REST endpoints)
├── Middleware (Operator context extraction)
└── Utils (Development helpers)

Application Layer
├── Commands & DTOs
├── Services (Business logic)
├── Validators (FluentValidation)
└── Interfaces

Domain Layer
├── Entities (Domain models)
├── Repositories (Abstractions)
└── ValueObjects (Enums, records)

Infrastructure Layer
├── Repositories (MongoDB implementations)
├── Configuration (Settings)
└── Data (Index setup)
```

### Frontend (React 19)

```
Components
├── Layout (Root layout with nav)
└── ErrorBoundary

Features
├── tournaments/
│   ├── components/ (Form, Card, List, Details)
│   ├── pages/ (Create, List, Details)
│   └── schemas/ (Zod validation)
└── leaderboard/
    ├── components/ (Table, Filters)
    └── pages/ (Leaderboard page)

Services
├── apiClient (Axios with retry)
├── tournamentApi
├── leaderboardApi
└── api.types (TypeScript definitions)
```

## 🚀 Quick Start

### Prerequisites

- **.NET 9 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/9.0))
- **MongoDB 7.0+** running on `mongodb://localhost:27017`
- **Node.js 20+** and npm

### 1. Start MongoDB

```bash
# Using MongoDB Community Edition
mongod --dbpath /path/to/data/db

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Backend Setup

```bash
cd backoffice-api

# Restore dependencies
dotnet restore

# Run the API
cd src/Smartico.BackOffice.Api
dotnet run
```

API URLs:
- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`
- Swagger: `https://localhost:5001/swagger`

### 3. Frontend Setup

```bash
cd backoffice-frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend URL: `http://localhost:5173`

## 🎬 Demo Flow

### 1. Create a Tournament

1. Navigate to `http://localhost:5173`
2. Click **"Create Tournament"**
3. Fill in tournament details:
   - Name: "Summer Championship 2025"
   - Type: **Leaderboard**
   - Scoring: **Points**
   - Start/End dates
   - Prize Pool: **$10,000**
   - Prize Distribution:
     - 1st Place: $5,000 (Cash)
     - 2nd Place: $3,000 (Cash)
     - 3rd Place: $2,000 (Bonus)
4. Click **"Create Tournament"**

### 2. Generate Mock Leaderboard

1. Click on your created tournament
2. Click **"View Full Leaderboard"**
3. Click **"Generate Mock Data"** (creates 50 fake players)
4. Explore the leaderboard:
   - 🥇 Gold, 🥈 Silver, 🥉 Bronze badges for top 3
   - Player avatars and stats
   - Real-time last update indicators
   - Search and filter capabilities

### 3. Explore Features

- ✅ **Filter tournaments** by status (Active/Scheduled/Completed) or type
- ✅ **Search** tournaments and players
- ✅ **Edit/Delete** tournaments
- ✅ **Adjust display limits** (10-500 entries)
- ✅ **Refresh** leaderboard data
- ✅ **View player metadata** (games played, wins, level)

## 📚 API Documentation

### Swagger UI

Interactive API docs: `https://localhost:5001/swagger`

### Key Endpoints

#### Tournaments
```
POST   /api/tournaments                          # Create tournament
GET    /api/tournaments                          # List all tournaments
GET    /api/tournaments/{id}                     # Get tournament details
PUT    /api/tournaments/{id}                     # Update tournament
DELETE /api/tournaments/{id}                     # Delete tournament
```

#### Leaderboard
```
GET    /api/tournaments/{id}/leaderboard         # Get leaderboard (limit=100)
GET    /api/tournaments/{id}/leaderboard/players/{playerId}  # Player position
POST   /api/tournaments/{id}/leaderboard/mock    # Generate mock data (demo)
```

## 🔒 Multi-Tenant Architecture

The system enforces **operator-level data isolation**:

### How It Works

1. **JWT Claims**: `OperatorContextMiddleware` extracts `operatorId` from JWT
2. **Automatic Filtering**: `BaseRepository<T>` adds `OperatorId` to all queries
3. **Data Isolation**: Casino A **cannot** access Casino B's data

### Development Mode

Without authentication:
- Default `OperatorId`: `000000000000000000000001`
- Production should return **401 Unauthorized** for missing authentication

## 📊 Database Schema

### Collections

#### `tournaments`
```javascript
{
  _id: ObjectId,
  operatorId: ObjectId,           // Multi-tenant key
  name: String,
  description: String,
  type: "Leaderboard" | "Knockout" | "MissionBased",
  scoringType: "Points" | "Wins" | "Wagering",
  status: "Draft" | "Scheduled" | "Active" | "Completed" | "Cancelled",
  startDate: ISODate,
  endDate: ISODate,
  prizePool: Decimal128,
  prizeDistribution: [{
    rank: Int32,
    prizeAmount: Decimal128,
    prizeType: "Cash" | "Bonus" | "FreeSpins"
  }],
  maxParticipants: Int32,
  entryFee: Decimal128,
  eligibleGames: [String],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### `leaderboardEntries`
```javascript
{
  _id: ObjectId,
  operatorId: ObjectId,           // Multi-tenant key
  tournamentId: ObjectId,
  playerId: String,
  playerName: String,
  rank: Int32,
  score: Decimal128,
  lastUpdated: ISODate,
  avatarUrl: String,
  metadata: {
    gamesPlayed: Int32,
    wins: Int32,
    level: Int32
  },
  createdAt: ISODate
}
```

### Indexes (for Performance)

#### tournaments
- `idx_operatorId_status_startDate` (compound)
- `idx_operatorId_type` (compound)

#### leaderboardEntries
- `idx_operatorId_tournamentId_rank` (compound)
- `idx_operatorId_tournamentId_playerId` (compound, **unique**)
- `idx_operatorId_tournamentId_score` (compound)

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| ASP.NET Core | 9.0 | Web framework |
| MongoDB.Driver | 3.5.1 | Database client |
| FluentValidation | 12.1.0 | Validation |
| Swashbuckle | 10.0.1 | OpenAPI/Swagger |
| Serilog | 9.0.0 | Logging |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.0 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 6.3.5 | Build tool |
| React Router | 7.9.6 | Routing |
| React Hook Form | 7.66.1 | Forms |
| Zod | 4.1.13 | Validation |
| Tailwind CSS | 4.1.17 | Styling |

## ⚙️ Configuration

### Backend (`appsettings.json`)

```json
{
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "sabaone_backoffice"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend

API base URL: `http://localhost:5000`
Update in `src/services/apiClient.ts` if needed.

## 🧪 Development Commands

### Backend

```bash
cd backoffice-api

# Watch mode (auto-reload on file changes)
dotnet watch --project src/Smartico.BackOffice.Api

# Build solution
dotnet build

# Clean build
dotnet clean && dotnet build
```

### Frontend

```bash
cd backoffice-frontend

# Development server (HMR enabled)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## ⚠️ Known Limitations (MVP Scope)

1. **No real authentication** - Uses mock operator context
2. **No WebSockets** - Manual refresh required for leaderboard updates
3. **Mock data only** - No real player integration
4. **Manual status transitions** - Tournament statuses not automated
5. **No file uploads** - No tournament banner images
6. **English only** - No i18n support
7. **No automated tests** - Testing not implemented

## 🔮 Next Steps (Post-MVP)

- [ ] JWT authentication integration
- [ ] WebSocket for real-time leaderboard
- [ ] Automated testing (unit, integration, E2E)
- [ ] Tournament lifecycle automation
- [ ] Real player/game integration
- [ ] Analytics dashboard
- [ ] CSV export functionality
- [ ] Notification system

## 📝 Implementation Timeline

**Total**: 59 tasks across 6 phases

| Phase | Tasks | Status | Highlights |
|-------|-------|--------|------------|
| Phase 1 | 7 | ✅ Complete | Infrastructure setup |
| Phase 2 | 18 | ✅ Complete | Backend foundation |
| Phase 3 | 8 | ✅ Complete | Tournament creation UI |
| Phase 4 | 5 | ✅ Complete | Tournament viewing |
| Phase 5 | 10 | ✅ Complete | Leaderboard system |
| Phase 6 | 11 | ✅ Complete | Polish & docs |

**All phases completed successfully!** 🎉

## 🤝 Contributing

See the [Main README](./README.md) for contribution guidelines.

## 📄 License

Proprietary - SabaONE

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**

**Co-Authored-By: Claude <noreply@anthropic.com>**
