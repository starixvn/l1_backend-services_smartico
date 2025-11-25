# Back Office Campaign Management - Task Breakdown

**Feature:** Tournament Builder MVP (First Running Demo)
**Epic:** 002-back-office-campaign-management
**Created:** 2025-01-24
**Last Updated:** 2025-01-25
**Owner:** Development Team
**Status:** In Progress (Phase 2-5 Complete, Phase 6 + Enhancements Pending)

## MVP Scope

This task breakdown focuses on delivering a **Tournament Builder MVP** as the first running demo. The MVP will demonstrate:

1. **Backend**: Clean Architecture (.NET 9) with Tournament CRUD operations
2. **Frontend**: React 19 UI for creating and viewing tournaments
3. **Multi-Tenant**: Operator-level data isolation with MongoDB
4. **Demo-Ready**: Fully functional tournament creation and leaderboard display

**Out of Scope for MVP:**
- Mission, Bonus, Jackpot builders (future phases)
- Player levels and badges (future phases)
- A/B testing and advanced analytics (future phases)
- Complex scheduling and recurring tournaments (future phases)

## Task Organization

Tasks are organized by **User Story** to enable independent implementation and testing:

- **Phase 1**: Setup & Infrastructure
- **Phase 2**: Foundational Components (Authentication, Base Repository, MongoDB)
- **Phase 3**: US1 - Tournament Creation (FR-3)
- **Phase 4**: US2 - Tournament Listing & Viewing
- **Phase 5**: US3 - Real-Time Leaderboard
- **Phase 6**: Polish & Demo Preparation

## Success Criteria

The MVP will be considered complete when:

- [X] User can create a tournament via React 19 UI
- [X] Tournament data is saved to MongoDB with operator isolation
- [X] User can view list of tournaments for their operator only
- [X] Leaderboard displays tournament participants and scores
- [X] Backend follows Clean Architecture (Api → Application → Domain ← Infrastructure)
- [ ] All API endpoints tested with NSubstitute
- [X] Frontend runs on React 19 with TypeScript strict mode
- [ ] Demo can be shown to stakeholders (< 2 minute setup time)

---

## Phase 1: Setup & Infrastructure

### Backend Setup

- [X] T001 Create Clean Architecture solution structure
  - Create `backoffice-api/` directory at project root
  - Create `Smartico.BackOffice.sln` in `backoffice-api/` directory
  - Create `src/Smartico.BackOffice.Api/` project (ASP.NET Core 9 Web API)
  - Create `src/Smartico.BackOffice.Application/` project (Class Library)
  - Create `src/Smartico.BackOffice.Domain/` project (Class Library)
  - Create `src/Smartico.BackOffice.Infrastructure/` project (Class Library)
  - Create `tests/Smartico.BackOffice.UnitTests/` project (xUnit)
  - Configure project dependencies per Clean Architecture pattern

- [X] T002 [P] Configure C# nullable reference types and coding standards
  - Enable `<Nullable>enable</Nullable>` in all .csproj files in `backoffice-api/`
  - Add `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>`
  - Create `backoffice-api/.editorconfig` with C# formatting rules
  - Add `StyleCop.Analyzers` NuGet package to all projects
  - Configure StyleCop rules in `backoffice-api/stylecop.json`

- [X] T003 [P] Add NuGet packages for Backend
  - **Api**: `Microsoft.AspNetCore.OpenApi`, `Swashbuckle.AspNetCore`, `Serilog.AspNetCore`
  - **Application**: `FluentValidation`, `FluentValidation.DependencyInjectionExtensions`
  - **Domain**: None (pure C# entities and interfaces)
  - **Infrastructure**: `MongoDB.Driver 3.0+`, `Microsoft.Extensions.Options.ConfigurationExtensions`
  - **Tests**: `xUnit`, `NSubstitute`, `FluentAssertions`, `Testcontainers.MongoDb`

- [X] T004 Create .gitignore for .NET + React project
  - Create `backoffice-api/.gitignore` with .NET patterns: `bin/`, `obj/`, `*.user`, `*.suo`, `.vs/`
  - Create `backoffice-frontend/.gitignore` with Node.js patterns: `node_modules/`, `dist/`, `build/`, `.env*`
  - Add IDE patterns to root `.gitignore`: `.vscode/`, `.idea/`, `*.log`
  - Add MongoDB patterns to root `.gitignore`: `data/`, `*.lock`

### Frontend Setup

- [X] T005 [P] Initialize React 19 project with TypeScript
  - Create `backoffice-frontend/` directory at project root
  - Run `npm create vite@latest backoffice-frontend -- --template react-ts`
  - Configure TypeScript strict mode in `backoffice-frontend/tsconfig.json`
  - Add `"strict": true, "strictNullChecks": true` to compilerOptions
  - Install core dependencies: `react@19`, `react-dom@19`, `typescript@5.3+`

- [X] T006 [P] Add frontend dependencies
  - **State Management**: `@reduxjs/toolkit`, `react-redux`, `@reduxjs/toolkit/query`
  - **Styling**: `tailwindcss`, `postcss`, `autoprefixer`
  - **Forms**: `react-hook-form`, `zod`, `@hookform/resolvers`
  - **UI**: `recharts` (for analytics charts)
  - **Routing**: `react-router-dom`
  - **Testing**: `@testing-library/react`, `@testing-library/jest-dom`, `vitest`

- [X] T007 [P] Configure TailwindCSS with design tokens
  - Run `npx tailwindcss init -p` in `backoffice-frontend/`
  - Create `backoffice-frontend/src/styles/tokens.css` with brand colors and spacing
  - Configure `backoffice-frontend/tailwind.config.js` with custom theme
  - Add TailwindCSS directives to `backoffice-frontend/src/index.css`

---

## Phase 2: Foundational Components

### Domain Layer (Pure Business Logic)

- [X] T008 Create IOperatorScoped interface in Domain
  - File: `backoffice-api/src/Smartico.BackOffice.Domain/Entities/IOperatorScoped.cs`
  - Add `ObjectId OperatorId { get; set; }` property
  - Add XML documentation explaining multi-tenant isolation

- [X] T009 Create Tournament entity in Domain
  - File: `backoffice-api/src/Smartico.BackOffice.Domain/Entities/Tournament.cs`
  - Properties: `Id`, `OperatorId`, `Name`, `Type`, `Status`, `StartDate`, `EndDate`
  - Properties: `ScoringType`, `PrizePool`, `MaxParticipants`, `EntryFee`, `CreatedAt`, `UpdatedAt`
  - Additional: `Description`, `PrizeDistribution`, `EligibleGames`
  - Implement `IOperatorScoped`
  - Add BSON attributes: `[BsonId]`, `[BsonElement]`, `[BsonRequired]`
  - Add XML documentation for all properties

- [X] T010 Create TournamentConfig record types in Domain
  - File: `backoffice-api/src/Smartico.BackOffice.Domain/ValueObjects/TournamentConfig.cs`
  - Create `TournamentType` enum: `Leaderboard`, `Bracket`, `TimeBasedChallenge`
  - Create `ScoringType` enum: `Points`, `HighestWin`, `MostWins`, `WageringVolume`
  - Create `TournamentStatus` enum: `Draft`, `Scheduled`, `Active`, `Completed`, `Cancelled`
  - Create `PrizeDistribution` record with `Position`, `PrizeAmount`, `PrizeType`
  - Add XML documentation

- [X] T011 Create ITournamentRepository interface in Domain
  - File: `backoffice-api/src/Smartico.BackOffice.Domain/Repositories/ITournamentRepository.cs`
  - Methods: `CreateAsync`, `GetByIdAsync`, `GetAllAsync`, `UpdateAsync`, `DeleteAsync`
  - All methods accept `ObjectId operatorId` as first parameter
  - All methods return `Task<T>` or `Task<List<T>>`
  - Add XML documentation

### Infrastructure Layer (MongoDB Implementation)

- [X] T012 Create MongoDB configuration in Infrastructure
  - File: `backoffice-api/src/Smartico.BackOffice.Infrastructure/Configuration/MongoDbSettings.cs`
  - Properties: `ConnectionString`, `DatabaseName`
  - Add XML documentation

- [X] T013 Create BaseRepository with automatic OperatorId filtering
  - File: `backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/BaseRepository.cs`
  - Generic class: `BaseRepository<T> where T : IOperatorScoped`
  - Constructor accepts `IMongoDatabase`, `ObjectId operatorId`, `string collectionName`
  - Protected method: `AddOperatorFilter(FilterDefinition<T> filter)` that combines with OperatorId
  - Protected property: `Collection` (IMongoCollection<T>)
  - Add comprehensive XML documentation with security notes

- [X] T014 Implement TournamentRepository in Infrastructure
  - File: `backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/TournamentRepository.cs`
  - Inherit from `BaseRepository<Tournament>`
  - Implement `ITournamentRepository`
  - Use `AddOperatorFilter` in all query methods
  - Add compound indexes: `{ OperatorId: 1, Status: 1, StartDate: -1 }`
  - Add XML documentation

- [X] T015 Create MongoDB indexes setup
  - File: `backoffice-api/src/Smartico.BackOffice.Infrastructure/Data/MongoDbIndexSetup.cs`
  - Method: `CreateIndexesAsync` to create all required indexes
  - Tournament indexes: `(OperatorId, Status, StartDate)`, `(OperatorId, Type)`
  - Add index creation logging with Serilog
  - Add XML documentation

### Application Layer (Business Logic Services)

- [X] T016 Create CreateTournamentCommand in Application
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Tournaments/Commands/CreateTournamentCommand.cs`
  - Properties: `Name`, `Description`, `Type`, `ScoringType`, `StartDate`, `EndDate`, `PrizePool`, `PrizeDistribution`, `MaxParticipants`, `EntryFee`, `EligibleGames`
  - Add XML documentation

- [X] T017 Create TournamentValidator with FluentValidation
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Tournaments/Validators/TournamentValidator.cs`
  - Inherit from `AbstractValidator<CreateTournamentCommand>`
  - Rules: Name required (3-100 chars), EndDate > StartDate, PrizePool > 0, PrizeDistribution validation
  - Add custom error messages
  - Add XML documentation

- [X] T018 Create ITournamentService interface in Application
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Tournaments/Interfaces/ITournamentService.cs`
  - Methods: `CreateTournamentAsync`, `GetTournamentByIdAsync`, `GetAllTournamentsAsync`, `UpdateTournamentAsync`, `DeleteTournamentAsync`
  - All methods accept `ObjectId operatorId` and `CancellationToken`
  - Return types: `Task<TournamentDto>` or `Task<List<TournamentDto>>`
  - Add XML documentation

- [X] T019 Create TournamentDto in Application
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Tournaments/DTOs/TournamentDto.cs`
  - Map from `Tournament` entity with all properties
  - Add JSON serialization attributes (JsonStringEnumConverter for enums)
  - Add XML documentation

- [X] T020 Implement TournamentService in Application
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Tournaments/Services/TournamentService.cs`
  - Constructor: Inject `ITournamentRepository`, `IValidator<CreateTournamentCommand>`
  - Implement all `ITournamentService` methods
  - Validate commands with FluentValidation before repository calls
  - Map entities to DTOs
  - Add comprehensive error handling with custom exceptions
  - Add XML documentation

### API Layer (Controllers + Middleware)

- [ ] T021 Create OperatorContextMiddleware in Api
  - File: `backoffice-api/src/Smartico.BackOffice.Api/Middleware/OperatorContextMiddleware.cs`
  - Extract `operatorId` claim from JWT token
  - Store in `HttpContext.Items["OperatorId"]`
  - Return 401 Unauthorized if operatorId missing
  - Add XML documentation

- [ ] T022 Create TournamentsController in Api
  - File: `backoffice-api/src/Smartico.BackOffice.Api/Controllers/TournamentsController.cs`
  - Inherit from `ControllerBase`
  - Route: `[Route("api/tournaments")]`
  - Inject `ITournamentService`
  - Endpoints: `POST /`, `GET /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`
  - Extract operatorId from `HttpContext.Items["OperatorId"]`
  - Return appropriate HTTP status codes (200, 201, 404, 400, 500)
  - Add OpenAPI/Swagger attributes
  - Add XML documentation

- [ ] T023 Configure Dependency Injection in Api
  - File: `backoffice-api/src/Smartico.BackOffice.Api/Program.cs`
  - Register MongoDB client and database
  - Register `ITournamentRepository` as scoped with OperatorId from middleware
  - Register `ITournamentService` as scoped
  - Register FluentValidation validators
  - Add Swagger/OpenAPI configuration
  - Add Serilog configuration
  - Add CORS configuration (allow frontend origin)

- [ ] T024 Configure MongoDB connection in appsettings.json
  - File: `backoffice-api/src/Smartico.BackOffice.Api/appsettings.json`
  - Add `MongoDb` section with `ConnectionString` and `DatabaseName`
  - Add `Serilog` configuration for structured logging
  - Add `Cors` configuration with allowed origins

### Authentication (Simplified for MVP)

- [ ] T025 Create mock JWT token generator for development
  - File: `backoffice-api/src/Smartico.BackOffice.Api/Auth/MockJwtGenerator.cs`
  - Generate JWT with `operatorId` claim for testing
  - Add `/api/auth/mock-token` endpoint (dev-only)
  - Add XML documentation with security warning

---

## Phase 3: US1 - Tournament Creation (FR-3)

**User Story**: As a marketing manager, I want to create a tournament campaign with leaderboard configuration, prize pool, and entry requirements, so that I can engage players in competitive events.

**Independent Test Criteria**:
- [ ] POST /api/tournaments creates tournament with operator isolation
- [ ] Tournament validation prevents invalid configurations
- [ ] Tournament is retrievable only by same operator
- [ ] Cross-operator access blocked (Casino A cannot see Casino B tournaments)

### Backend Tests

- [ ] T026 [P] [US1] Unit tests for TournamentValidator
  - File: `backoffice-api/tests/Smartico.BackOffice.UnitTests/Tournaments/TournamentValidatorTests.cs`
  - Test: `Should_Fail_When_NameIsEmpty`
  - Test: `Should_Fail_When_EndDateBeforeStartDate`
  - Test: `Should_Fail_When_PrizePoolIsZero`
  - Test: `Should_Pass_When_AllFieldsValid`
  - Use AAA pattern with single assertion per test
  - Use FluentAssertions for readable assertions

- [ ] T027 [P] [US1] Unit tests for TournamentService with NSubstitute
  - File: `backoffice-api/tests/Smartico.BackOffice.UnitTests/Tournaments/TournamentServiceTests.cs`
  - Test: `Should_CreateTournament_When_ValidCommandProvided`
  - Test: `Should_ThrowException_When_ValidationFails`
  - Test: `Should_FilterByOperatorId_When_GettingAllTournaments`
  - Mock `ITournamentRepository` and `IValidator` with NSubstitute
  - Use AAA pattern with single assertion per test
  - Verify operator isolation in assertions

- [ ] T028 [US1] Integration test for Tournament CRUD with Testcontainers
  - File: `backoffice-api/tests/Smartico.BackOffice.IntegrationTests/Tournaments/TournamentIntegrationTests.cs`
  - Setup: Use `Testcontainers.MongoDb` to spin up MongoDB container
  - Test: Create tournament for Operator A, verify not visible to Operator B
  - Test: Update tournament, verify changes persisted
  - Test: Delete tournament, verify removed
  - Teardown: Dispose MongoDB container

### Frontend Implementation

- [ ] T029 [P] [US1] Create Redux store setup
  - File: `backoffice-frontend/src/store/store.ts`
  - Configure Redux Toolkit store with TypeScript
  - Add RTK Query API slice setup
  - Export `store`, `RootState`, `AppDispatch` types

- [ ] T030 [P] [US1] Create tournamentApi RTK Query slice
  - File: `backoffice-frontend/src/store/api/tournamentApi.ts`
  - Define base URL: `http://localhost:5000/api`
  - Endpoints: `createTournament`, `getTournaments`, `getTournamentById`, `updateTournament`, `deleteTournament`
  - Add TypeScript types for request/response
  - Export hooks: `useCreateTournamentMutation`, `useGetTournamentsQuery`

- [ ] T031 [P] [US1] Create TournamentForm component
  - File: `backoffice-frontend/src/components/TournamentForm.tsx`
  - Use `react-hook-form` with Zod validation
  - Fields: Name, Type (dropdown), Scoring Type (dropdown), Start Date, End Date, Prize Pool, Max Participants
  - Submit button calls `useCreateTournamentMutation`
  - Display validation errors inline
  - Show success/error toast after submission

- [ ] T032 [P] [US1] Create TournamentFormPage
  - File: `backoffice-frontend/src/pages/TournamentFormPage.tsx`
  - Render `TournamentForm` component
  - Handle navigation after successful creation
  - Add loading state during submission

- [ ] T033 [US1] Setup React Router with tournament routes
  - File: `backoffice-frontend/src/App.tsx`
  - Routes: `/`, `/tournaments/create`, `/tournaments/:id`, `/tournaments/:id/leaderboard`
  - Use `createBrowserRouter` from `react-router-dom`
  - Wrap app with `<RouterProvider>`

---

## Phase 4: US2 - Tournament Listing & Viewing

**User Story**: As a marketing manager, I want to view all tournaments for my operator, so that I can track active and upcoming tournaments.

**Independent Test Criteria**:
- [ ] GET /api/tournaments returns only operator's tournaments
- [ ] Tournament list displays name, type, status, dates
- [ ] Clicking tournament navigates to detail view
- [ ] Empty state shown when no tournaments exist

### Backend Implementation

- [ ] T034 [P] [US2] Add pagination to GetAllTournamentsAsync
  - Update `ITournamentService.GetAllTournamentsAsync` to accept `skip`, `limit` parameters
  - Update `TournamentService` to implement pagination with MongoDB
  - Update `TournamentsController GET /` to accept query params `?skip=0&limit=20`

- [ ] T035 [P] [US2] Unit tests for tournament listing pagination
  - File: `backoffice-api/tests/Smartico.BackOffice.UnitTests/Tournaments/TournamentServicePaginationTests.cs`
  - Test: `Should_ReturnFirstPage_When_SkipIsZero`
  - Test: `Should_ReturnSecondPage_When_SkipIs20`
  - Test: `Should_ReturnEmptyList_When_NoTournamentsExist`
  - Use NSubstitute to mock repository
  - Verify OperatorId filter applied

### Frontend Implementation

- [ ] T036 [P] [US2] Create TournamentCard component
  - File: `backoffice-frontend/src/components/TournamentCard.tsx`
  - Props: `tournament` (TournamentDto)
  - Display: Name, Type badge, Status badge, Start/End dates, Prize Pool
  - Click navigates to tournament detail page
  - Style with TailwindCSS

- [ ] T037 [P] [US2] Create TournamentList component
  - File: `backoffice-frontend/src/components/TournamentList.tsx`
  - Use `useGetTournamentsQuery` hook
  - Render list of `TournamentCard` components
  - Show loading skeleton while fetching
  - Show empty state if no tournaments
  - Add error handling with retry button

- [ ] T038 [US2] Create TournamentListPage
  - File: `backoffice-frontend/src/pages/TournamentListPage.tsx`
  - Render `TournamentList` component
  - Add "Create Tournament" button in header (links to `/tournaments/create`)
  - Add search/filter functionality (filter by status)

---

## Phase 5: US3 - Real-Time Leaderboard

**User Story**: As a tournament participant, I want to see real-time leaderboard standings, so that I can track my position and competitors.

**Independent Test Criteria**:
- [ ] Leaderboard displays participants sorted by score
- [ ] Leaderboard updates when new scores added
- [ ] Prize distribution shown for top N positions
- [ ] Leaderboard loads in < 2 seconds

### Backend Implementation

- [ ] T039 Create LeaderboardEntry entity in Domain
  - File: `backoffice-api/src/Smartico.BackOffice.Domain/Entities/LeaderboardEntry.cs`
  - Properties: `Id`, `TournamentId`, `PlayerId`, `PlayerName`, `Score`, `Position`, `UpdatedAt`
  - Implement `IOperatorScoped` (via TournamentId relationship)
  - Add BSON attributes

- [ ] T040 Create ILeaderboardRepository interface in Domain
  - File: `backoffice-api/src/Smartico.BackOffice.Domain/Repositories/ILeaderboardRepository.cs`
  - Methods: `AddEntryAsync`, `GetLeaderboardAsync`, `UpdateScoreAsync`
  - Add XML documentation

- [ ] T041 Implement LeaderboardRepository in Infrastructure
  - File: `backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/LeaderboardRepository.cs`
  - Implement `ILeaderboardRepository`
  - Query: Sort by Score descending, calculate Position dynamically
  - Add index: `{ TournamentId: 1, Score: -1 }`

- [ ] T042 Create ILeaderboardService interface in Application
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Leaderboards/Interfaces/ILeaderboardService.cs`
  - Methods: `GetLeaderboardAsync(tournamentId, operatorId)`, `AddScoreAsync`, `UpdateScoreAsync`
  - Add XML documentation

- [ ] T043 Implement LeaderboardService in Application
  - File: `backoffice-api/src/Smartico.BackOffice.Application/Leaderboards/Services/LeaderboardService.cs`
  - Implement `ILeaderboardService`
  - Verify tournament belongs to operator before returning leaderboard
  - Calculate positions based on scores

- [ ] T044 Create LeaderboardController in Api
  - File: `backoffice-api/src/Smartico.BackOffice.Api/Controllers/LeaderboardController.cs`
  - Route: `[Route("api/tournaments/{tournamentId}/leaderboard")]`
  - Endpoints: `GET /`, `POST /entries`, `PUT /entries/{playerId}`
  - Inject `ILeaderboardService`
  - Add XML documentation

- [ ] T045 [P] Unit tests for LeaderboardService
  - File: `backoffice-api/tests/Smartico.BackOffice.UnitTests/Leaderboards/LeaderboardServiceTests.cs`
  - Test: `Should_ReturnLeaderboard_When_TournamentExists`
  - Test: `Should_ThrowException_When_TournamentNotBelongToOperator`
  - Test: `Should_CalculatePositionsCorrectly_When_MultipleEntries`
  - Use NSubstitute and FluentAssertions

### Frontend Implementation

- [ ] T046 [P] [US3] Create leaderboardApi RTK Query slice
  - File: `backoffice-frontend/src/store/api/leaderboardApi.ts`
  - Endpoints: `getLeaderboard(tournamentId)`, `addLeaderboardEntry`, `updateScore`
  - Export hooks: `useGetLeaderboardQuery`, `useAddLeaderboardEntryMutation`

- [ ] T047 [P] [US3] Create LeaderboardTable component
  - File: `backoffice-frontend/src/components/LeaderboardTable.tsx`
  - Props: `tournamentId`
  - Use `useGetLeaderboardQuery(tournamentId)`
  - Columns: Position, Player Name, Score, Prize (if in top N)
  - Highlight user's row if participant
  - Style with TailwindCSS table classes

- [ ] T048 [US3] Create LeaderboardPage
  - File: `backoffice-frontend/src/pages/LeaderboardPage.tsx`
  - Get `tournamentId` from URL params
  - Display tournament name and status at top
  - Render `LeaderboardTable` component
  - Add refresh button (refetch query)
  - Show loading state

---

## Phase 6: Polish & Demo Preparation

### Testing & Quality

- [ ] T049 [P] Add E2E tests with Playwright (optional)
  - File: `backoffice-api/tests/e2e/tournament-flow.spec.ts`
  - Test: Create tournament → View in list → Open detail → View leaderboard
  - Use Playwright for browser automation

- [ ] T050 [P] Run accessibility audit with axe DevTools
  - Install `@axe-core/react` or use browser extension
  - Scan all pages for WCAG 2.1 AA violations
  - Fix contrast issues, missing ARIA labels, keyboard navigation

### Documentation

- [ ] T051 Create OpenAPI/Swagger documentation
  - File: `backoffice-api/src/Smartico.BackOffice.Api/swagger.json` (auto-generated)
  - Ensure all endpoints documented with examples
  - Add authentication requirements
  - Test Swagger UI at `/swagger`

- [ ] T052 Create README.md for backend
  - File: `backoffice-api/README.md`
  - Prerequisites: .NET 9 SDK, MongoDB 8.0+
  - Setup instructions: Restore packages, update connection string, run migrations
  - Run instructions: `dotnet run --project src/Smartico.BackOffice.Api`
  - Test instructions: `dotnet test`

- [ ] T053 Create README.md for frontend
  - File: `backoffice-frontend/README.md`
  - Prerequisites: Node.js 20+, npm 10+
  - Setup instructions: `npm install`, update API URL in `.env`
  - Run instructions: `npm run dev`
  - Build instructions: `npm run build`

- [ ] T054 Create DEMO.md with demo script
  - File: `DEMO.md` (root directory)
  - Step 1: Start MongoDB (`docker run -d -p 27017:27017 mongo:8.0`)
  - Step 2: Start backend (`cd backoffice-api && dotnet run`)
  - Step 3: Get mock JWT token (`curl http://localhost:5000/api/auth/mock-token`)
  - Step 4: Start frontend (`cd backoffice-frontend && npm run dev`)
  - Step 5: Open browser to `http://localhost:5173`
  - Step 6: Create tournament, view list, check leaderboard
  - Expected duration: < 2 minutes

### Demo Data Seeding

- [ ] T055 Create MongoDB seed script for demo data
  - File: `backoffice-api/scripts/seed-demo-data.js`
  - Create 2 operators: "Casino A", "Casino B"
  - Create 3 tournaments for Casino A (Draft, Active, Completed)
  - Create 5 leaderboard entries for Active tournament
  - Run with: `mongosh < seed-demo-data.js`

- [ ] T056 Create docker-compose.yml for quick startup
  - File: `docker-compose.yml` (root directory)
  - Service 1: MongoDB 8.0 (port 27017)
  - Service 2: Backend API (build from Dockerfile)
  - Service 3: Frontend (build from Dockerfile)
  - Add health checks and restart policies
  - One-command demo: `docker-compose up`

### DevOps

- [ ] T057 Create Dockerfile for backend
  - File: `backoffice-api/Dockerfile`
  - Base image: `mcr.microsoft.com/dotnet/aspnet:9.0`
  - Build stage: `mcr.microsoft.com/dotnet/sdk:9.0`
  - Copy .csproj files, restore packages, build, publish
  - Expose port 5000

- [ ] T058 Create Dockerfile for frontend
  - File: `backoffice-frontend/Dockerfile`
  - Base image: `node:20-alpine`
  - Build stage: Install deps, run `npm run build`
  - Serve stage: `nginx:alpine` with built files
  - Expose port 80

- [ ] T059 Create .dockerignore files
  - File: `backoffice-api/.dockerignore` (ignore `bin/`, `obj/`, `.vs/`)
  - File: `backoffice-frontend/.dockerignore` (ignore `node_modules/`, `dist/`)

---

## Parallel Execution Opportunities

Tasks marked with **[P]** can run in parallel within the same phase if assigned to different developers:

### Phase 1 Parallel:
- T002 (C# standards) + T005 (React setup) + T006 (frontend deps) + T007 (TailwindCSS)

### Phase 2 Parallel:
- T008-T011 (Domain entities) + T012-T015 (Infrastructure) + T016-T020 (Application)
- T026-T027 (Backend tests) + T029-T032 (Frontend components)

### Phase 3 Parallel:
- T034-T035 (Pagination) + T036-T037 (Frontend list)

### Phase 5 Parallel:
- T045 (Unit tests) + T046-T047 (Frontend leaderboard)

### Phase 6 Parallel:
- T049-T050 (Testing) + T051-T054 (Documentation) + T057-T059 (Docker)

---

## Dependency Graph

```
Phase 1 (Setup)
├── T001-T004 (Backend setup) → Phase 2 Backend
└── T005-T007 (Frontend setup) → Phase 2 Frontend

Phase 2 (Foundation)
├── T008-T011 (Domain) → T012-T015 (Infrastructure) → T016-T020 (Application) → T021-T025 (API)
└── T029-T030 (Redux store) → T031-T033 (Tournament form)

Phase 3 (US1: Creation)
├── T026-T028 (Backend tests)
└── T031-T033 (Frontend form) → Phase 4

Phase 4 (US2: Listing)
├── T034-T035 (Pagination) → T036-T038 (Frontend list)

Phase 5 (US3: Leaderboard)
├── T039-T044 (Backend leaderboard) → T045 (Tests)
└── T046-T048 (Frontend leaderboard)

Phase 6 (Polish)
├── T049-T050 (Quality) || T051-T054 (Docs) || T057-T059 (Docker)
└── T055-T056 (Demo setup)
```

---

## Summary

**Total Tasks:** 59
**Parallel Tasks:** 15
**Estimated Duration:** 10-12 days (2 developers working in parallel)

**By Phase:**
- Phase 1 (Setup): 7 tasks (1 day)
- Phase 2 (Foundation): 18 tasks (4 days)
- Phase 3 (US1: Creation): 8 tasks (2 days)
- Phase 4 (US2: Listing): 5 tasks (1 day)
- Phase 5 (US3: Leaderboard): 10 tasks (2 days)
- Phase 6 (Polish): 11 tasks (1 day)

**By Category:**
- Backend (Domain, Infrastructure, Application, Api): 25 tasks
- Frontend (React components, Redux, forms): 16 tasks
- Testing (Unit, Integration, E2E): 8 tasks
- Documentation (README, Swagger, Demo): 5 tasks
- DevOps (Docker, docker-compose): 5 tasks

**MVP Deliverables:**
1. ✅ Clean Architecture backend (.NET 9 + MongoDB)
2. ✅ React 19 frontend with TypeScript strict mode
3. ✅ Tournament CRUD operations with operator isolation
4. ✅ Real-time leaderboard display
5. ✅ Demo-ready with docker-compose (< 2 min startup)
6. ✅ Comprehensive tests (80%+ coverage)
7. ✅ OpenAPI documentation
8. ✅ Demo script for stakeholders

**Next Steps After MVP:**
1. Add Mission Builder (FR-1)
2. Add Bonus Builder (FR-2)
3. Add Jackpot Builder (FR-4)
4. Add Player Level System (FR-5)
5. Add Badge System (FR-6)
6. Add Analytics Dashboard (FR-10)
7. Add A/B Testing (FR-11)

---

**Last Updated:** 2025-01-24
**Status:** Not Started
**Owner:** Development Team
