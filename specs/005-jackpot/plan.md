# Jackpot System - Implementation Plan

**Version:** 1.0
**Created:** 2025-11-09
**Status:** Draft
**Owner:** Development Team

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [ ] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards
- [ ] **Testing Strategy:** AAA pattern with single assertions specified for all components
- [ ] **UX Consistency:** Design system usage and accessibility requirements documented
- [ ] **Performance:** Performance budgets and monitoring strategy defined
- [ ] **Type Safety:** TypeScript strict mode compliance plan included

## Executive Summary

The Jackpot System provides users with an engaging lottery-style gamification mechanic that creates excitement through the possibility of winning significant prizes. Users can opt-in to jackpots for free, then contributions are automatically deducted during gameplay based on the jackpot's contribution type (Fixed amount or Percentage of bet). The system supports two jackpot types: **MultiUser** (shared pool among all participants) and **Personal** (individual pool per user).

**Business Value:**
- Increases user engagement through high-value prize opportunities and aspirational goals
- Creates anticipation through visible pool growth, temperature indicators (COLD/WARM/HOT/BURNING), and explosion countdowns
- Provides flexible contribution models (Fixed or Percentage) to suit different game types
- Enhances retention through community-based (MultiUser) and personalized (Personal) experiences
- Maintains transparency by displaying recent winners, contribution rates, and pool temperatures

**Technical Approach:**
- Integrate with existing Smartico Jackpot API (opt-in/opt-out, pool data, winner history)
- Follow established backend patterns: Domain → Application (CQRS) → Infrastructure → API
- Reuse existing infrastructure: 30s caching, SignalR real-time events (/hubs/progress), Polly resilience
- Implement responsive React UI with real-time pool updates and temperature visualization
- Support multi-currency display (jackpot currency + user wallet currency conversion)

**Key Features:**
- Free opt-in/opt-out model (no upfront cost to participate)
- Automatic contribution during gameplay (Fixed amount or Percentage of bet)
- Real-time pool updates and temperature indicators via SignalR
- Explosion model: jackpots "explode" (draw winners) when pool reaches min/max thresholds
- Winner history with partial anonymization and multi-winner positions (1st, 2nd, 3rd)
- Multi-currency support for global audiences

## Goals & Objectives

### Primary Goals
- Enable users to opt-in to jackpots for free and automatically contribute during gameplay
- Display all active jackpots with complete information (pool, temperature, contribution rate, opt-in status)
- Provide real-time pool/temperature/registration count updates via SignalR
- Show winner history with filtering, anonymization, and winning positions
- Support both MultiUser (shared pool) and Personal (individual pool) jackpot types
- Visualize pool temperature (COLD/WARM/HOT/BURNING) with distinct indicators
- Ensure 100% accessibility compliance (WCAG 2.1 AA)

### Success Metrics
- **Engagement**: 40% of active users opt-in to at least one jackpot within first week
- **Performance**: Jackpot list loads within 2 seconds, opt-in/opt-out completes within 500ms
- **Real-time**: Pool updates appear within 2 seconds of contribution
- **Accuracy**: 100% accuracy in contribution calculations, pool amounts, and temperature calculations
- **Reliability**: 99.9% uptime for opt-in/opt-out operations, zero duplicate opt-in records
- **User Satisfaction**: 95% of users successfully opt-in on first attempt, winner announcements within 5 seconds

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React 19)                         │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ JackpotList  │  │  JackpotCard    │  │  WinnerHistory   │  │
│  │ (All active) │  │  (Opt-in/out,   │  │  (Recent winners)│  │
│  │              │  │   Pool, Temp)   │  │                  │  │
│  └──────────────┘  └─────────────────┘  └──────────────────┘  │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ PoolProgress │  │ TemperatureGauge│  │ ExplosionTimer   │  │
│  │ (Real-time)  │  │ (COLD/HOT/etc)  │  │ (Countdown)      │  │
│  └──────────────┘  └─────────────────┘  └──────────────────┘  │
└────────────┬─────────────────────────┬──────────────────────────┘
             │ HTTP REST API           │ WebSocket (SignalR)
             │ GET /api/jackpots       │ JackpotPoolUpdated
             │ POST /api/jackpots      │ JackpotTemperatureChanged
             │   /{id}/opt-in          │ JackpotExploded
             │ POST /api/jackpots      │ JackpotWinnerAnnounced
             │   /{id}/opt-out         │
┌────────────▼─────────────────────────▼──────────────────────────┐
│                  API LAYER (.NET 9 API)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ JackpotsController                                       │  │
│  │ - GET /api/jackpots?userId=xxx                          │  │
│  │ - GET /api/jackpots/{id}?userId=xxx                     │  │
│  │ - POST /api/jackpots/{id}/opt-in { userId }            │  │
│  │ - POST /api/jackpots/{id}/opt-out { userId }           │  │
│  │ - GET /api/jackpots/winners?userId=xxx                 │  │
│  └────────────────────┬─────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │ MediatR (CQRS)
┌─────────────────────────▼──────────────────────────────────────┐
│             APPLICATION LAYER (CQRS with MediatR)               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Queries (Read Operations)                               │  │
│  │ - GetJackpotsQuery → Handler (30s cache)               │  │
│  │ - GetJackpotByIdQuery → Handler (30s cache)           │  │
│  │ - GetJackpotWinnersQuery → Handler (30s cache)        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Commands (Write Operations)                             │  │
│  │ - OptInJackpotCommand → Validator → Handler            │  │
│  │   → Cache Invalidation → SignalR Broadcast             │  │
│  │ - OptOutJackpotCommand → Validator → Handler           │  │
│  │   → Cache Invalidation → SignalR Broadcast             │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│              DOMAIN LAYER                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Entities                                                 │  │
│  │ - JackpotDetails (template with current pot info)      │  │
│  │ - JackpotPot (specific pot instance)                   │  │
│  │ - JackpotWinner (explosion winners)                    │  │
│  │ - JackpotOptInRecord (user registration)               │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Enums                                                    │  │
│  │ - JackpotType (MultiUser=1, Personal=2)                │  │
│  │ - JackpotContributionType (Fixed=1, Percentage=2)      │  │
│  │ - JackPotTemparature (COLD=0, WARM=1, HOT=2, BURNING=3)│  │
│  │ - JackpotOptInStatus (Active, OptedOut)                │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Interfaces                                               │  │
│  │ - ISmarticoJackpotApiClient (repository abstraction)   │  │
│  │ - IProgressBroadcaster (extended with jackpot events)  │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────┬──────────────────────────────────────┘
                          │
┌─────────────────────────▼──────────────────────────────────────┐
│          INFRASTRUCTURE LAYER                                    │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ SmarticoJackpot  │  │ MemoryCache    │  │ SignalR        │ │
│  │ ApiClient (HTTP) │  │ Service        │  │ Broadcaster    │ │
│  │ - GetJackpots()  │  │ - 30s TTL      │  │ - 4 new events │ │
│  │ - OptIn/OptOut() │  │ - Cache inv.   │  │ - Real-time    │ │
│  │ - GetWinners()   │  │                │  │ - User groups  │ │
│  └──────────────────┘  └────────────────┘  └────────────────┘ │
└─────────────────────────┬──────────────────────────────────────┘
                          │ HTTP + Polly Retry
┌─────────────────────────▼──────────────────────────────────────┐
│                   SMARTICO JACKPOT API                           │
│  - GET /jackpots (get all jackpot details with user status)    │
│  - POST /jackpots/optin (register user for jackpot)            │
│  - POST /jackpots/optout (deregister user from jackpot)        │
│  - GET /jackpots/winners (get recent winner history)           │
│  - Contribution processing handled externally during gameplay   │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 9 / ASP.NET Core 9
- Language: C# 13 with nullable reference types enabled
- Architecture: Clean Architecture + CQRS (MediatR)
- Validation: FluentValidation
- Caching: IMemoryCache (30-second TTL)
- Real-time: SignalR (reuse /hubs/progress)
- Resilience: Polly (retry + circuit breaker + timeout)
- Logging: ILogger with structured logging

**Frontend:**
- Library: React 19 with TypeScript 5+ (strict mode)
- State Management: Local React state (useState, useEffect)
- HTTP Client: Fetch API with error handling
- Real-time: SignalR client (@microsoft/signalr)
- Styling: TailwindCSS (design system tokens)
- Accessibility: ARIA attributes, semantic HTML, keyboard navigation
- Icons: Lucide React for temperature indicators

**DevOps:**
- Testing: xUnit (backend), Vitest + React Testing Library (frontend)
- Code Quality: ESLint, Prettier, EditorConfig
- CI/CD: GitHub Actions (build, test, deploy)
- Monitoring: Application Insights (future)

### Key Design Decisions

1. **Opt-In Model (Not Entry Purchase)**: Users register for jackpots for free, then contributions are automatically deducted during gameplay. This differs from a direct "buy entries" model and reduces friction to participation.

2. **Automatic Contribution During Gameplay**: Contributions happen transparently when users place bets. For Fixed contribution type, a fixed amount is deducted per bet (e.g., 10 points). For Percentage type, a percentage of the bet is deducted (e.g., 5% of 100 = 5 points). This is handled by the existing bet system (out of scope).

3. **Pool Temperature as Visual Indicator**: Temperature (COLD/WARM/HOT/BURNING) provides immediate visual feedback on pool status. Calculated based on current_pot vs min_amount/max_amount thresholds using server-side formula. Client displays with distinct colors and animations.

4. **Explosion Model with Thresholds**: Jackpots "explode" (draw winners) when pool reaches explosion thresholds. Explosion can occur anytime pool ≥ min_amount, guaranteed when pool ≥ max_amount. This creates anticipation and urgency.

5. **Multi-Currency Display**: Jackpots store amounts in base currency (jp_currency) but display converted amounts in user's wallet currency (user_currency). This supports international users and different currency types (points, gems, USD, etc.).

6. **Real-Time Updates via SignalR**: Pool amounts, temperature, registration counts, and winner announcements update in real-time via SignalR. This creates a live, engaging experience without manual refreshes.

7. **Read-Only MVP**: Actual contribution processing during bets and winner selection are handled externally by Smartico platform. Our system displays data and manages opt-in/opt-out only.

8. **Visibility-Based Filtering**: Future enhancement to filter jackpots based on user eligibility (game types, user segments). MVP shows all active jackpots.

## Implementation Phases

### Phase 1: Backend Foundation (Domain + Infrastructure)
**Duration:** 2 days
**Dependencies:** None

**Tasks:**
- [ ] Create Domain entities (JackpotDetails, JackpotPot, JackpotWinner, JackpotOptInRecord)
- [ ] Create Domain enums (JackpotType, JackpotContributionType, JackPotTemparature, JackpotOptInStatus)
- [ ] Create Domain interfaces (ISmarticoJackpotApiClient)
- [ ] Extend IProgressBroadcaster with 4 new jackpot events
- [ ] Implement Infrastructure API client (SmarticoJackpotApiClient with demo data)
- [ ] Add Polly resilience policies (retry, circuit breaker, timeout)
- [ ] Create demo data: 5 jackpots (3 MultiUser, 2 Personal), both contribution types, all temperatures
- [ ] Register services in Infrastructure DI container
- [ ] Unit tests for domain models (temperature calculation, progress calculation)

**Deliverables:**
- `Domain/Entities/JackpotDetails.cs` - Main jackpot entity with all API fields
- `Domain/Entities/JackpotPot.cs` - Pot instance entity
- `Domain/Entities/JackpotWinner.cs` - Winner record entity
- `Domain/Entities/JackpotOptInRecord.cs` - Opt-in record entity
- `Domain/Enums/JackpotType.cs` - MultiUser/Personal enum
- `Domain/Enums/JackpotContributionType.cs` - Fixed/Percentage enum
- `Domain/Enums/JackPotTemparature.cs` - COLD/WARM/HOT/BURNING enum
- `Domain/Interfaces/ISmarticoJackpotApiClient.cs` - API contract
- `Domain/Interfaces/IProgressBroadcaster.cs` - Extended with jackpot events
- `Infrastructure/SmarticoApi/SmarticoJackpotApiClient.cs` - HTTP client implementation
- `Infrastructure/DependencyInjection.cs` - Service registration

**Constitution Compliance:**
- Testing: Unit tests with AAA pattern, single assertions, 80% coverage minimum
- Performance: HTTP client configured with 10s timeout, 3 retry attempts
- Types: All entities fully typed with required/init properties, XML documentation
- Code Quality: SOLID principles, meaningful names, no magic numbers

**Demo Data Requirements:**
- **Jackpot 1**: "Mega Jackpot" (MultiUser, Percentage 5%, HOT temperature, 312 registrations, pool at 50,000 points)
- **Jackpot 2**: "Community Pot" (MultiUser, Fixed 10 points, WARM temperature, 125 registrations, pool at 4,950 points)
- **Jackpot 3**: "Grand Prize" (MultiUser, Percentage 3%, BURNING temperature, 587 registrations, pool at 95,000 points near max)
- **Jackpot 4**: "Personal Vault" (Personal, Fixed 5 points, COLD temperature, user-specific pool at 120 points)
- **Jackpot 5**: "Lucky Draw" (Personal, Percentage 2%, WARM temperature, user-specific pool at 980 points)
- **Winners**: 10+ recent winners with anonymized usernames, various positions (1st/2nd/3rd), different jackpots

**Acceptance Criteria:**
- [ ] JackpotDetails entity has all 17 API properties correctly typed
- [ ] Temperature calculation logic matches spec formula (COLD/WARM/HOT/BURNING thresholds)
- [ ] Demo data includes all jackpot types, contribution types, and temperatures
- [ ] API client handles missing/malformed data gracefully with fallbacks
- [ ] All business rules tested (opt-in validation, temperature calculation)

### Phase 2: Backend Application Layer (CQRS)
**Duration:** 3 days
**Dependencies:** Phase 1 complete

**Tasks:**
- [ ] Create GetJackpotsQuery + Handler (all jackpots with user opt-in status)
- [ ] Create GetJackpotByIdQuery + Handler (single jackpot details)
- [ ] Create GetJackpotWinnersQuery + Handler (recent winners with filtering)
- [ ] Create OptInJackpotCommand + Validator + Handler
- [ ] Create OptOutJackpotCommand + Validator + Handler
- [ ] Implement 30-second caching in query handlers
- [ ] Add FluentValidation validators for all commands
- [ ] Implement cache invalidation on opt-in/opt-out
- [ ] Implement SignalR broadcasting (JackpotPoolUpdated, JackpotTemperatureChanged, etc.)
- [ ] Integration tests for query/command handlers (with mock API client)

**Deliverables:**
- `Application/Features/Jackpots/Queries/GetJackpots/` - Get all jackpots query
- `Application/Features/Jackpots/Queries/GetJackpotById/` - Get single jackpot query
- `Application/Features/Jackpots/Queries/GetJackpotWinners/` - Get winners query
- `Application/Features/Jackpots/Commands/OptInJackpot/` - Opt-in command
- `Application/Features/Jackpots/Commands/OptOutJackpot/` - Opt-out command
- `Application/Features/Jackpots/Queries/GetJackpots/GetJackpotsQueryValidator.cs`
- `Application/Features/Jackpots/Commands/OptInJackpot/OptInJackpotCommandValidator.cs`
- `Application/DependencyInjection.cs` - MediatR registration

**Constitution Compliance:**
- Testing: Integration tests with AAA pattern, single assertions, mock API client, verify caching and broadcasting
- Performance: Cache hit rate >70%, query response <100ms (in-memory), command response <200ms
- Types: Query/Command/Response records with explicit types and XML docs
- Code Quality: Single Responsibility (separate query/command handlers), DRY principles

**Validation Rules:**
- **OptInJackpotCommand**: userId not empty, jackpotId positive integer, user not already opted in, jackpot not in explosion state
- **OptOutJackpotCommand**: userId not empty, jackpotId positive integer, user currently opted in
- **GetJackpotsQuery**: userId not empty (for personalization)
- **GetJackpotWinnersQuery**: optional jackpot type filter (MultiUser/Personal)

**Acceptance Criteria:**
- [ ] GetJackpotsQuery returns jackpots with correct user opt-in status
- [ ] GetJackpotWinnersQuery filters by jackpot type and anonymizes usernames (except current user)
- [ ] OptInJackpotCommand increments registration count for MultiUser jackpots
- [ ] OptOutJackpotCommand decrements registration count and invalidates cache
- [ ] Cache invalidation triggers on opt-in/opt-out commands
- [ ] SignalR broadcasts correct events with accurate payloads
- [ ] Validators reject invalid inputs (empty userId, negative jackpotId, duplicate opt-in)
- [ ] All queries/commands have >80% test coverage

### Phase 3: Backend API Layer (Controllers)
**Duration:** 1 day
**Dependencies:** Phase 2 complete

**Tasks:**
- [ ] Create JackpotsController with GET/POST endpoints
- [ ] Add Swagger documentation (XML comments, ProducesResponseType)
- [ ] Implement error handling middleware
- [ ] Add request/response logging with correlation IDs
- [ ] API integration tests (end-to-end with TestServer)

**Deliverables:**
- `Api/Controllers/JackpotsController.cs` - REST endpoints
- `Api/Models/OptInJackpotRequest.cs` - Request DTOs
- `Api/Models/OptOutJackpotRequest.cs` - Request DTOs
- Swagger documentation at `/swagger`

**Constitution Compliance:**
- Testing: API integration tests with AAA pattern, test all status codes (200, 400, 404, 500)
- Performance: API response time <500ms (p95) for POST endpoints, <200ms for GET endpoints
- Types: DTOs with validation attributes, XML documentation
- Code Quality: RESTful conventions, proper HTTP verbs, consistent error responses

**API Endpoints:**

1. **GET /api/jackpots?userId={userId}&type={type?}**
   - Description: Get all active jackpots with user opt-in status
   - Query Params: userId (required), type (optional: MultiUser/Personal filter)
   - Response: `{ jackpots: JackpotDetails[] }`
   - Status Codes: 200 OK, 400 Bad Request (invalid userId), 500 Internal Server Error

2. **GET /api/jackpots/{id}?userId={userId}**
   - Description: Get single jackpot details
   - Path Params: id (jackpot template ID)
   - Query Params: userId (required for opt-in status)
   - Response: `JackpotDetails` object
   - Status Codes: 200 OK, 404 Not Found, 400 Bad Request

3. **POST /api/jackpots/{id}/opt-in**
   - Description: Opt-in user to jackpot
   - Path Params: id (jackpot template ID)
   - Body: `{ "userId": "string" }`
   - Response: `{ "success": true, "jackpot": JackpotDetails, "message": "You're in! Your bets will contribute..." }`
   - Status Codes: 200 OK, 400 Bad Request (already opted in, jackpot exploding), 404 Not Found

4. **POST /api/jackpots/{id}/opt-out**
   - Description: Opt-out user from jackpot
   - Path Params: id (jackpot template ID)
   - Body: `{ "userId": "string" }`
   - Response: `{ "success": true, "message": "You've opted out. Your bets will no longer contribute..." }`
   - Status Codes: 200 OK, 400 Bad Request (not opted in), 404 Not Found

5. **GET /api/jackpots/winners?userId={userId}&type={type?}**
   - Description: Get recent winners (last 30 days)
   - Query Params: userId (required for "is_me" flag), type (optional filter)
   - Response: `{ winners: JackpotWinner[] }`
   - Status Codes: 200 OK, 400 Bad Request

**Acceptance Criteria:**
- [ ] All endpoints documented in Swagger with examples
- [ ] Endpoints return proper status codes on error
- [ ] Request validation errors return 400 with clear, actionable messages
- [ ] Logging includes correlation IDs for distributed tracing
- [ ] API tests cover happy path and all error scenarios
- [ ] CORS configured for frontend origin

### Phase 4: Frontend Types & Services
**Duration:** 2 days
**Dependencies:** Phase 3 complete (API available)

**Tasks:**
- [ ] Create TypeScript interfaces matching backend entities
- [ ] Implement JackpotService (API client with Fetch API)
- [ ] Add error handling and retry logic with exponential backoff
- [ ] Implement SignalR connection manager (extend existing)
- [ ] Add SignalR event subscriptions for 4 jackpot events
- [ ] Unit tests for services (mock fetch, test error states)

**Deliverables:**
- `frontend/src/types/jackpot.ts` - TypeScript interfaces
- `frontend/src/services/jackpotService.ts` - HTTP API client
- `frontend/src/services/signalr/jackpotHub.ts` - SignalR subscriptions
- `frontend/src/hooks/useJackpots.ts` - Data fetching hook
- `frontend/src/hooks/useJackpotWinners.ts` - Winners hook
- `frontend/src/utils/jackpotHelpers.ts` - Temperature colors, currency formatting

**Constitution Compliance:**
- Testing: Unit tests with Vitest, mock API responses, test all error states
- Performance: Request deduplication, cache responses locally, optimistic updates
- Types: Strict TypeScript, no `any` types, full interface definitions with JSDoc
- Code Quality: Single Responsibility (separate services), DRY (shared fetch wrapper)

**TypeScript Interfaces:**

```typescript
export enum JackpotType {
  MultiUser = 1,
  Personal = 2
}

export enum JackpotContributionType {
  Fixed = 1,
  Percentage = 2
}

export enum JackPotTemparature {
  COLD = 0,
  WARM = 1,
  HOT = 2,
  BURNING = 3
}

export interface JackpotDetails {
  templateId: number;
  jackpotType: JackpotType;
  name: string;
  description: string;
  thumbnailUrl: string;
  jpCurrency: string; // Base currency (e.g., "Points", "USD")
  userCurrency: string; // User wallet currency
  contributionType: JackpotContributionType;
  contributionValue: number; // Fixed amount or percentage
  currentPotJpCurrency: number;
  currentPotUserCurrency: number;
  temperature: JackPotTemparature;
  minAmount: number;
  maxAmount: number;
  seedAmount: number;
  explodeDateTs: number; // Unix timestamp
  registrationCount: number;
  userOptedIn: boolean;
  allowAllGames: boolean;
  exposeWinners: boolean;
}

export interface JackpotWinner {
  potId: number;
  userId: string;
  publicUsername: string; // Anonymized (e.g., "J***n")
  avatarId: number;
  winningAmountJpCurrency: number;
  winningAmountUserCurrency: number;
  winningPosition: number; // 1, 2, 3, etc.
  winDate: number; // Unix timestamp
  isMe: boolean;
}
```

**Helper Functions:**
- `getTemperatureColor(temp: JackPotTemparature): string` - Returns Tailwind color class
- `getTemperatureIcon(temp: JackPotTemparature): string` - Returns emoji/icon
- `formatCurrency(amount: number, currency: string): string` - Formats with locale
- `calculateExplosionEstimate(currentPot, maxAmount, avgContributionRate): string` - Calculates time estimate
- `anonymizeUsername(username: string): string` - Client-side fallback for anonymization

**Acceptance Criteria:**
- [ ] TypeScript interfaces match backend entities exactly (all 17 JackpotDetails properties)
- [ ] JackpotService handles 400, 401, 404, 500 errors gracefully with user-friendly messages
- [ ] SignalR subscriptions auto-reconnect on disconnect with exponential backoff
- [ ] All services have >80% test coverage
- [ ] Error states provide retry mechanisms

### Phase 5: Frontend Components - Jackpot Display
**Duration:** 3 days
**Dependencies:** Phase 4 complete

**Tasks:**
- [ ] Create JackpotList component (grid of all jackpots)
- [ ] Create JackpotCard component (individual jackpot display)
- [ ] Create TemperatureIndicator component (visual gauge)
- [ ] Create PoolDisplay component (current pot with currencies)
- [ ] Create ContributionInfo component (contribution type/value display)
- [ ] Create ExplosionTimer component (countdown or estimate)
- [ ] Implement responsive design (mobile, tablet, desktop)
- [ ] Add accessibility features (ARIA, keyboard navigation, screen reader support)
- [ ] Component tests with React Testing Library

**Deliverables:**
- `frontend/src/components/jackpot/JackpotList.tsx` - Jackpot grid
- `frontend/src/components/jackpot/JackpotCard.tsx` - Jackpot card
- `frontend/src/components/jackpot/TemperatureIndicator.tsx` - Temperature gauge
- `frontend/src/components/jackpot/PoolDisplay.tsx` - Pool amount display
- `frontend/src/components/jackpot/ContributionInfo.tsx` - Contribution display
- `frontend/src/components/jackpot/ExplosionTimer.tsx` - Timer component

**Constitution Compliance:**
- Testing: Component tests with AAA pattern, test accessibility, user interactions, all states
- Performance: Lazy load images, optimize re-renders with React.memo, virtualize if >50 jackpots
- Types: Strongly typed props with JSDoc, prop validation
- UX: WCAG 2.1 AA compliance, keyboard navigation, focus management, responsive design

**Component Specifications:**

1. **JackpotList**
   - Props: `jackpots: JackpotDetails[], loading: boolean, error: string | null, onRefresh: () => void`
   - Layout: Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
   - Features: Filter by type (MultiUser/Personal), sort by pool amount or temperature
   - States: Loading skeleton, error with retry, empty state
   - Accessibility: Role="region", aria-label="Active Jackpots", keyboard navigation

2. **JackpotCard**
   - Props: `jackpot: JackpotDetails, onOptIn: (id: number) => void, onOptOut: (id: number) => void`
   - Displays: Name, description, thumbnail, pool (both currencies), temperature, contribution rate, registration count, opt-in status, explosion estimate
   - Visual: Card with shadow, hover elevation, jackpot type badge (MultiUser/Personal)
   - Actions: Opt In/Opt Out button (disabled during explosion)
   - Accessibility: Role="article", aria-label with jackpot name, button focus indicators

3. **TemperatureIndicator**
   - Props: `temperature: JackPotTemparature, showLabel?: boolean`
   - Visual: Colored icon/badge with label
     - COLD (0): 🧊 Blue (#3B82F6) "Cold"
     - WARM (1): ☀️ Yellow (#FBBF24) "Warm"
     - HOT (2): 🔥 Orange (#F97316) "Hot"
     - BURNING (3): 🌋 Red (#EF4444) "Burning"
   - Animation: Pulse animation for HOT/BURNING
   - Accessibility: aria-label="Pool temperature: {label}"

4. **PoolDisplay**
   - Props: `currentPotJpCurrency: number, currentPotUserCurrency: number, jpCurrency: string, userCurrency: string`
   - Visual: Large number for primary currency, smaller converted amount below
   - Example: "50,000 Points" (large), "≈ $500 USD" (small)
   - Animation: Count-up animation on pool updates (using react-countup)
   - Accessibility: aria-live="polite" for real-time updates

5. **ContributionInfo**
   - Props: `contributionType: JackpotContributionType, contributionValue: number, currency: string`
   - Visual: Badge with icon + text
     - Fixed: "💰 10 Points per bet"
     - Percentage: "📊 5% of each bet"
   - Tooltip: "You contribute this amount/percentage when placing bets while opted in"
   - Accessibility: aria-describedby for tooltip

6. **ExplosionTimer**
   - Props: `explodeDateTs: number, currentPot: number, maxAmount: number`
   - Visual: Countdown timer or estimate (e.g., "In 2 days, 5 hours" or "Exploding soon!")
   - Logic: If explodeDateTs available, show countdown; else calculate estimate based on growth rate
   - Animation: Blink/pulse when explosion imminent (pool near max)
   - Accessibility: aria-live="polite", time element with datetime attribute

**Acceptance Criteria:**
- [ ] All components render correctly on 320px, 768px, 1024px viewports
- [ ] Color contrast meets WCAG AA (4.5:1 minimum for text)
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Screen reader announces jackpot details, temperature, and pool updates
- [ ] Loading states show within 200ms of data fetch
- [ ] Error states provide actionable retry options
- [ ] All components have >80% test coverage
- [ ] Temperature colors match spec (COLD=blue, WARM=yellow, HOT=orange, BURNING=red)

### Phase 6: Frontend Components - Opt-In/Out & Winners
**Duration:** 2 days
**Dependencies:** Phase 5 complete

**Tasks:**
- [ ] Create OptInButton component (opt-in action)
- [ ] Create OptOutButton component (opt-out action with confirmation)
- [ ] Create OptInConfirmation component (success modal/toast)
- [ ] Create WinnerList component (recent winners table)
- [ ] Create WinnerCard component (individual winner entry)
- [ ] Create WinnerFilter component (filter by jackpot type)
- [ ] Implement optimistic UI updates (instant opt-in status change)
- [ ] Component tests with React Testing Library

**Deliverables:**
- `frontend/src/components/jackpot/OptInButton.tsx` - Opt-in button
- `frontend/src/components/jackpot/OptOutButton.tsx` - Opt-out button with confirmation
- `frontend/src/components/jackpot/OptInConfirmation.tsx` - Success feedback
- `frontend/src/components/jackpot/WinnerList.tsx` - Winners list
- `frontend/src/components/jackpot/WinnerCard.tsx` - Winner entry
- `frontend/src/components/jackpot/WinnerFilter.tsx` - Filter controls

**Constitution Compliance:**
- Testing: Component tests with AAA pattern, test user interactions, confirmation dialogs, optimistic updates
- Performance: Debounce opt-in/out button clicks, prevent double submissions
- Types: Strongly typed props and event handlers
- UX: Clear confirmation dialogs, success/error feedback, accessible modals

**Component Specifications:**

1. **OptInButton**
   - Props: `jackpotId: number, jackpotName: string, contributionInfo: string, onOptIn: (id: number) => Promise<void>, disabled: boolean`
   - Visual: Primary button "Opt In", disabled during explosion or loading
   - Action: Click → show confirmation → call onOptIn → update UI optimistically
   - States: Default, loading (spinner), disabled
   - Accessibility: aria-label="Opt in to {jackpotName}", disabled state announced

2. **OptOutButton**
   - Props: `jackpotId: number, jackpotName: string, onOptOut: (id: number) => Promise<void>`
   - Visual: Secondary button "Opt Out"
   - Action: Click → show confirmation dialog → call onOptOut → update UI optimistically
   - Confirmation: "Are you sure? You'll stop contributing to this jackpot."
   - Accessibility: aria-label="Opt out from {jackpotName}", focus trap in confirmation dialog

3. **OptInConfirmation**
   - Props: `jackpotName: string, contributionInfo: string, onClose: () => void`
   - Visual: Toast or small modal with success message
   - Message: "You're in! Your bets will now contribute {contributionInfo} to {jackpotName}."
   - Auto-dismiss: After 5 seconds
   - Accessibility: aria-live="assertive", role="alert"

4. **WinnerList**
   - Props: `winners: JackpotWinner[], loading: boolean, error: string | null, filter: JackpotType | null, onFilterChange: (type: JackpotType | null) => void`
   - Layout: Table (desktop) or card list (mobile)
   - Columns: Username, Jackpot Name, Prize Amount (both currencies), Position (1st/2nd/3rd), Win Date
   - Features: Sort by date, filter by jackpot type, highlight current user's wins
   - Accessibility: Role="table" with proper headers, sortable columns announced

5. **WinnerCard**
   - Props: `winner: JackpotWinner`
   - Visual: Row/card with avatar, anonymized username (unless is_me), prize amount, position badge, date
   - Position badges: 🥇 1st, 🥈 2nd, 🥉 3rd
   - Highlight: Current user's wins with special styling (border/background)
   - Accessibility: aria-label with full winner info

6. **WinnerFilter**
   - Props: `currentFilter: JackpotType | null, onFilterChange: (type: JackpotType | null) => void`
   - Visual: Pill buttons "All", "MultiUser", "Personal"
   - Action: Click to change filter
   - Accessibility: role="radiogroup", aria-label="Filter winners by jackpot type"

**Acceptance Criteria:**
- [ ] Opt-in/out buttons show loading state during API calls
- [ ] Confirmation dialogs prevent accidental opt-out
- [ ] Optimistic UI updates revert on error
- [ ] Winner list displays anonymized usernames (e.g., "J***n") except for current user
- [ ] Winner filter updates list without full page reload
- [ ] Position badges display correctly (1st/2nd/3rd with icons)
- [ ] Current user's wins are highlighted
- [ ] All components have >80% test coverage
- [ ] All interactive elements keyboard accessible

### Phase 7: Real-Time Integration & Polish
**Duration:** 2 days
**Dependencies:** Phase 6 complete

**Tasks:**
- [ ] Integrate components into main Jackpots tab/page
- [ ] Implement SignalR event handlers (4 events)
- [ ] Add real-time pool/temperature/registration count updates
- [ ] Implement winner announcement notifications (toast/modal)
- [ ] Add explosion alert (when jackpot explodes)
- [ ] Implement browser tab title updates on important events
- [ ] Add sound effects for winner announcements (optional, user preference)
- [ ] Polish animations and transitions
- [ ] E2E tests with Playwright (user journeys)

**Deliverables:**
- `frontend/src/pages/JackpotsPage.tsx` - Main jackpots view
- `frontend/src/services/signalr/jackpotSubscriptions.ts` - Event subscriptions
- `frontend/src/components/jackpot/ExplosionNotification.tsx` - Explosion alert modal
- `frontend/src/components/jackpot/WinnerAnnouncement.tsx` - Winner notification
- E2E tests for critical user journeys

**Constitution Compliance:**
- Testing: E2E tests for key flows (view jackpots, opt-in, see pool updates, receive notifications)
- Performance: SignalR updates <2s latency, no UI jank on updates, throttle rapid updates
- UX: Smooth animations, no layout shift (CLS <0.1), clear notifications
- Code Quality: Centralized event handling, proper error boundaries

**SignalR Events:**

1. **JackpotPoolUpdated**
   - Payload: `{ templateId: number, currentPotJpCurrency: number, currentPotUserCurrency: number, registrationCount: number }`
   - Action: Update pool display with count-up animation, update registration count
   - Throttle: Max 1 update per 2 seconds per jackpot (prevent spam)

2. **JackpotTemperatureChanged**
   - Payload: `{ templateId: number, temperature: JackPotTemparature, currentPot: number }`
   - Action: Update temperature indicator with transition animation
   - Priority: Medium (immediate but not critical)

3. **JackpotExploded**
   - Payload: `{ templateId: number, jackpotName: string, finalPot: number, winnerCount: number }`
   - Action: Show explosion notification modal, play sound effect, update tab title
   - Priority: High (immediate processing)

4. **JackpotWinnerAnnounced**
   - Payload: `{ templateId: number, jackpotName: string, winner: JackpotWinner }`
   - Action: Show winner announcement (toast), prepend to winner list, highlight if current user
   - Priority: High (immediate processing)

**User Journeys (E2E Tests):**
1. User navigates to Jackpots tab → Sees all active jackpots with details
2. User filters by MultiUser → Sees only MultiUser jackpots
3. User opts in to jackpot → Registration count increases, button changes to "Opt Out"
4. User views winners → Sees recent winners with anonymized names
5. Another user contributes → Pool updates in real-time, temperature may change
6. Jackpot explodes → User receives explosion notification

**Acceptance Criteria:**
- [ ] SignalR events trigger UI updates within 2 seconds
- [ ] No duplicate notifications on same event
- [ ] Offline/online transitions handled gracefully (auto-reconnect, queue events)
- [ ] Browser tab title updates on explosion (e.g., "💥 Mega Jackpot Exploded!")
- [ ] E2E tests pass on Chrome, Firefox, Safari
- [ ] Pool count-up animation is smooth (no jank)
- [ ] Temperature transitions use CSS transitions (300ms ease-out)
- [ ] Explosion notifications are dismissible and auto-dismiss after 10s

### Phase 8: Demo Data & Testing
**Duration:** 2 days
**Dependencies:** Phase 7 complete

**Tasks:**
- [ ] Refine demo data (varied jackpots, realistic pools, recent winners)
- [ ] Add user switcher for testing different opt-in statuses
- [ ] Implement comprehensive unit tests (backend + frontend)
- [ ] Implement integration tests (API endpoints, CQRS handlers)
- [ ] Implement E2E tests (critical user flows)
- [ ] Run accessibility audit (axe DevTools, Lighthouse)
- [ ] Performance testing (API load, frontend metrics)
- [ ] Fix any bugs or issues discovered during testing

**Deliverables:**
- Comprehensive test suite (80%+ coverage)
- Accessibility audit report (100 Lighthouse score)
- Performance test results (meet all benchmarks)
- Bug fixes and polish

**Constitution Compliance:**
- Testing: AAA pattern, single assertions, 80% coverage minimum, 100% for critical paths
- Performance: Meet all benchmarks (API <500ms, LCP <2.5s, etc.)
- UX: WCAG 2.1 AA compliance, 100 Lighthouse accessibility score
- Code Quality: All code reviewed, linting passes, no warnings

**Demo Data Scenarios:**
- User A: Opted in to 2 MultiUser jackpots, 1 Personal jackpot, has won 1 jackpot recently
- User B: Opted in to 1 MultiUser jackpot, not opted in to any Personal jackpots, no wins
- User C: Not opted in to any jackpots, new user experience
- User D: Opted in to all jackpots, has won multiple jackpots (test highlighting)

**Testing Checklist:**
- [ ] Unit tests: Domain entities, CQRS handlers, validators, services, components
- [ ] Integration tests: API endpoints, SignalR events, cache invalidation
- [ ] E2E tests: Opt-in flow, opt-out flow, real-time updates, winner display
- [ ] Accessibility: Keyboard navigation, screen reader, color contrast, ARIA
- [ ] Performance: API latency, cache hit rate, frontend Core Web Vitals, bundle size
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Responsive: 320px, 768px, 1024px, 1920px viewports
- [ ] Error handling: Network errors, API errors, validation errors, edge cases

**Acceptance Criteria:**
- [ ] All tests passing (unit, integration, E2E) with 80%+ coverage
- [ ] Lighthouse accessibility score 100
- [ ] Lighthouse performance score >90
- [ ] API p95 latency <500ms for POST, <200ms for GET
- [ ] Frontend LCP <2.5s, FCP <1.5s, CLS <0.1
- [ ] No console errors or warnings
- [ ] All acceptance criteria from spec.md validated

## Testing Strategy

### Unit Testing
- **Coverage Target:** 80% minimum, 100% for critical paths (contribution calculation, temperature calculation, opt-in validation)
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `should_ExpectedBehavior_When_StateUnderTest`
- **Tools:** xUnit + FluentAssertions (backend), Vitest + Testing Library (frontend)
- **Mocking:** Use interfaces (ISmarticoJackpotApiClient, ICacheService, IProgressBroadcaster)

**Backend Unit Test Example:**
```csharp
public class OptInJackpotCommandHandlerTests
{
    [Fact]
    public async Task should_increment_registration_count_when_user_opts_in_to_multiuser_jackpot()
    {
        // Arrange
        var mockApiClient = Substitute.For<ISmarticoJackpotApiClient>();
        var mockCache = Substitute.For<ICacheService>();
        var mockBroadcaster = Substitute.For<IProgressBroadcaster>();
        var mockLogger = Substitute.For<ILogger<OptInJackpotCommandHandler>>();

        var jackpot = CreateJackpot(type: JackpotType.MultiUser, registrationCount: 100);
        mockApiClient.OptInAsync(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(jackpot with { RegistrationCount = 101 });

        var handler = new OptInJackpotCommandHandler(mockApiClient, mockCache, mockBroadcaster, mockLogger);
        var command = new OptInJackpotCommand("user123", 1);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(101, result.Jackpot.RegistrationCount);
    }
}
```

**Frontend Unit Test Example:**
```typescript
describe('TemperatureIndicator', () => {
  it('should_display_red_color_when_temperature_is_burning', () => {
    // Arrange
    const temperature = JackPotTemparature.BURNING;

    // Act
    render(<TemperatureIndicator temperature={temperature} showLabel={true} />);

    // Assert
    expect(screen.getByText('Burning')).toHaveClass('text-red-600');
  });
});
```

### Integration Testing
- **Scope:** API endpoints, CQRS handlers with real cache, SignalR hub connections
- **Tools:** WebApplicationFactory (backend), MSW (frontend API mocking)
- **Coverage:** All API endpoints, all query/command handlers, SignalR event broadcasting

**Example Integration Test:**
```csharp
[Fact]
public async Task OptInJackpot_should_return_200_and_invalidate_cache_when_valid_request()
{
    // Arrange
    var client = _factory.CreateClient();
    var request = new OptInJackpotRequest { UserId = "user123" };

    // Act
    var response = await client.PostAsJsonAsync("/api/jackpots/1/opt-in", request);
    var content = await response.Content.ReadFromJsonAsync<OptInJackpotResponse>();

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    content.Should().NotBeNull();
    content!.Success.Should().BeTrue();
    content.Jackpot.UserOptedIn.Should().BeTrue();
}
```

### End-to-End Testing
- **Scope:** Critical user journeys (view jackpots, opt-in, real-time updates, view winners)
- **Tools:** Playwright
- **Coverage:** Happy path for main user scenarios

**User Journeys:**
1. User navigates to Jackpots tab → Sees all jackpots with details
2. User opts in to MultiUser jackpot → Registration count increases
3. User places bet (simulated) → Pool updates in real-time
4. User views winners → Sees recent winners with positions
5. Jackpot explodes → User receives notification

### Performance Testing
- **API Load Testing:** k6 or JMeter, target 100 RPS with p95 <500ms for POST, <200ms for GET
- **Frontend Performance:** Lighthouse CI, target LCP <2.5s, FCP <1.5s, TTI <3.5s
- **Cache Testing:** Verify cache hit rate >70%, measure latency improvement

**Performance Budgets:**
- Backend GET /api/jackpots: <200ms (p95), <100ms (p50)
- Backend POST /api/jackpots/{id}/opt-in: <500ms (p95), <200ms (p50)
- Backend GET /api/jackpots/winners: <200ms (p95)
- Frontend initial render: <2s (FCP)
- Frontend jackpot list render: <1s (50 jackpots)
- SignalR event processing: <100ms
- JavaScript bundle size: <75KB gzipped (jackpot feature only)

## Performance Requirements

### Backend
- GET /api/jackpots: <200ms (p95), <100ms (p50)
- POST /api/jackpots/{id}/opt-in: <500ms (p95), <200ms (p50)
- POST /api/jackpots/{id}/opt-out: <500ms (p95), <200ms (p50)
- GET /api/jackpots/winners: <200ms (p95)
- Cache hit rate: >70% for queries
- Smartico API calls: <500ms (p95) with 3 retries
- SignalR broadcast latency: <50ms

### Frontend
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms
- JavaScript bundle size: <75KB gzipped (feature-specific)
- Image optimization: WebP with lazy loading, max 100KB per jackpot thumbnail
- Real-time update latency: <2s from contribution to UI update

### Monitoring
- APM tool: Application Insights (future)
- Metrics tracked:
  - API response times (p50, p95, p99)
  - Cache hit/miss ratio
  - SignalR connection count and latency
  - Opt-in/opt-out success rate
  - Frontend Core Web Vitals
  - Error rate (4xx, 5xx)
  - User engagement (opt-ins per day, jackpot views per session)
- Alerting thresholds:
  - API p95 >500ms → Warning
  - Error rate >5% → Critical
  - SignalR disconnections >10% → Warning
  - Cache hit rate <50% → Warning

## UX/UI Specifications

### Design System Compliance
- **Colors:** Use Tailwind color palette
  - Primary: `purple-600` (brand color, opt-in buttons)
  - Success: `green-600` (opted-in status, winners)
  - Warning: `yellow-500` (WARM temperature, explosion warning)
  - Info: `blue-600` (COLD temperature, information)
  - Danger: `red-600` (BURNING temperature, opt-out)
  - Muted: `gray-400` (disabled states)
- **Typography:**
  - Jackpot names: `text-2xl font-bold` (Headings)
  - Pool amounts: `text-3xl font-semibold` (Large numbers)
  - Descriptions: `text-sm text-gray-600` (Body)
  - Contribution info: `text-xs font-medium` (Labels)
- **Spacing:** Use Tailwind spacing scale (4px base grid)
- **Shadows:** `shadow-md` for cards, `shadow-lg` on hover, `shadow-xl` for modals
- **Borders:** `rounded-lg` for cards, `rounded-full` for badges

### Accessibility Requirements
- **WCAG Level:** AA compliance mandatory
- **Keyboard Navigation:**
  - Tab: Navigate between jackpot cards and buttons
  - Enter/Space: Activate opt-in/opt-out buttons, open modals
  - Escape: Close modals and confirmations
  - Arrow keys: Navigate within winner list table
- **Screen Reader:**
  - Announce jackpot details on card focus
  - Announce pool updates with aria-live="polite"
  - Announce opt-in success with aria-live="assertive"
  - Announce explosion/winner events with aria-live="assertive"
  - Label all buttons with aria-label
  - Provide accessible names for all interactive elements
- **Color Contrast:** Verified with axe DevTools, minimum 4.5:1 for text, 3:1 for large text
- **ARIA Attributes:**
  - `role="region"` with `aria-label` on jackpot sections
  - `role="article"` on jackpot cards
  - `role="button"` on all buttons (with proper aria-labels)
  - `aria-live="polite"` for pool updates
  - `aria-live="assertive"` for explosions and winner announcements
  - `role="table"` with proper headers for winner list
  - `aria-describedby` for tooltips and help text

### Responsive Breakpoints
- **Mobile:** 320px - 767px (1 column, stacked layout, bottom sheet modals)
- **Tablet:** 768px - 1023px (2 columns, larger cards)
- **Desktop:** 1024px+ (3 columns, sidebar navigation)

**Mobile Optimizations:**
- Larger touch targets (min 44x44px)
- Simplified jackpot cards (hide less critical info like explosion estimate)
- Bottom sheet for confirmations (instead of modals)
- Sticky opt-in/out buttons at bottom of card
- Horizontal scroll for winner table (or switch to card layout)

## Security Considerations

- [x] Input validation on all user IDs (alphanumeric + hyphens, max 50 chars)
- [x] Jackpot IDs validated as positive integers
- [x] No SQL injection risk (API-backed, no direct database access)
- [x] XSS prevention: Sanitize jackpot descriptions and custom data (DOMPurify on frontend)
- [x] Authentication: Validate user ID ownership (future: JWT tokens)
- [x] Authorization: Users can only opt-in/out for themselves
- [x] Rate limiting: 60 requests/minute per user on API endpoints
- [x] HTTPS only: All API calls over TLS 1.2+
- [x] No sensitive data in logs (no PII, only user IDs)
- [x] CORS: Whitelist frontend origin only
- [x] Idempotent opt-in/opt-out: Prevent duplicate registrations via server-side validation
- [x] Pool amounts server-validated: Client cannot manipulate pool values
- [x] Contribution rates enforced server-side: Client displays but cannot change

**Security Audit Checklist:**
- [ ] All endpoints require authentication (future enhancement)
- [ ] User ID validated against authenticated session
- [ ] No jackpot manipulation possible from client side
- [ ] Custom data JSON validated and sanitized
- [ ] Jackpot images served from trusted CDN only
- [ ] Winner data anonymization enforced server-side
- [ ] No race conditions in opt-in/opt-out operations

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, E2E) - 80%+ coverage
- [ ] Performance benchmarks met (p95 <500ms API POST, <200ms GET, LCP <2.5s)
- [ ] Accessibility audit passed (axe, Lighthouse) - 100 score
- [ ] Code review completed (2 approvals required)
- [ ] Swagger documentation generated and reviewed
- [ ] Monitoring configured (Application Insights dashboards, alerts)
- [ ] Rollback plan documented (feature flag ready)
- [ ] Database migrations (if any) tested and scripted
- [ ] Security review completed (input validation, authorization)

### Rollout Plan
1. **Deploy to Staging** (Day 1)
   - Deploy backend API to staging environment
   - Deploy frontend to staging CDN
   - Run smoke tests (API health check, UI loads, SignalR connects)
   - QA validation (manual testing of user journeys, accessibility)
   - Verify demo data displays correctly

2. **Canary Deployment** (Day 2)
   - Enable feature flag for 5% of users
   - Monitor error rates, API latency, opt-in success rate, user engagement
   - Gather early feedback via in-app surveys or support tickets
   - Verify real-time updates work across multiple users

3. **Gradual Rollout** (Day 3-5)
   - 5% → 25% → 50% → 100%
   - Monitor metrics at each stage (30-minute observation window)
   - Rollback if error rate >5% or p95 latency >500ms or opt-in failure rate >5%
   - Check for performance degradation or cache issues

4. **Full Rollout** (Day 6)
   - Enable feature for all users
   - Monitor for 24 hours (weekend if possible to reduce impact)
   - Publish announcement (changelog, social media, in-app notification)
   - Prepare support team with FAQ and troubleshooting guide

5. **Post-Launch Review** (Day 7)
   - Review metrics: opt-in rate, engagement, performance, errors
   - Gather user feedback (support tickets, NPS, in-app surveys)
   - Identify top bugs or UX issues
   - Plan iterations based on learnings

### Rollback Plan
- **Feature Flag:** Instant disable via configuration (no redeployment)
- **Frontend:** Revert to previous CDN version (instant, cache bust required)
- **Backend:** Revert to previous Docker image or app service version (5-minute rollback)
- **Database:** Not applicable (API-backed, stateless)
- **Cache:** Clear cache to remove stale data (if needed)
- **Communication:** Notify users via banner if rollback occurs, explain issue transparently

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Smartico API downtime or slow response | Medium | High | Implement circuit breaker (Polly), fallback to cached data with warning banner, retry with exponential backoff, monitor API health |
| Performance degradation (>500ms p95) | Low | Medium | Load testing before launch, auto-scaling on API, CDN for static assets, optimize queries, monitor cache hit rate |
| Accessibility non-compliance | Low | High | Automated axe tests in CI/CD, manual screen reader testing (NVDA, JAWS), accessibility checklist in PR template, Lighthouse audits |
| SignalR connection issues | Medium | Medium | Auto-reconnect logic (exponential backoff), fallback to polling if WebSocket fails, connection status indicator, queue events during disconnect |
| Incorrect pool/temperature calculation | Low | High | Unit tests for all calculation paths, integration tests with edge cases (max pool, 0 points, overflow), client-server validation, formula review |
| Browser compatibility issues | Low | Low | Cross-browser testing (Chrome, Firefox, Safari, Edge), Babel polyfills for older browsers, progressive enhancement, feature detection |
| High cache miss rate (<50%) | Medium | Low | Monitor cache hit rate, tune TTL (30s default), implement stale-while-revalidate pattern, pre-warm cache on deployment |
| Duplicate opt-in records | Low | High | Idempotent API design, server-side duplicate check, unique constraint on userId+jackpotId, transaction isolation, comprehensive tests |
| Real-time update spam (too frequent) | Medium | Low | Throttle SignalR events (max 1 per 2s per jackpot), debounce UI updates, batch multiple updates, rate limit broadcasts |
| Explosion notification fatigue | Low | Low | User preference to disable sounds, dismiss notifications, limit notification frequency, show only relevant explosions |

## Documentation Requirements

- [ ] API documentation (OpenAPI/Swagger) - Generated from XML comments, examples for all endpoints
- [ ] Component documentation (Storybook or similar) - Interactive component explorer with all props and states
- [ ] User guide (Help Center article) - "Understanding Jackpots: How to Opt-In and Win"
- [ ] Architecture Decision Records (ADRs) - Why opt-in model, why read-only contribution, why SignalR for real-time
- [ ] README updates - Add Jackpots section to main README with feature overview
- [ ] Changelog entry - v1.2.0: Add Jackpot System feature

**Documentation Deliverables:**
- `docs/api/jackpots-api.md` - API endpoint documentation with examples
- `docs/architecture/adr-005-jackpot-opt-in-model.md` - ADR for opt-in design
- `docs/user-guide/jackpots.md` - End-user documentation with screenshots
- `frontend/src/components/jackpot/README.md` - Component usage guide
- `CHANGELOG.md` - Version 1.2.0 entry with feature description

## Dependencies

### External Dependencies
- **@microsoft/signalr** (^8.0.0): Real-time SignalR client for WebSocket communication
- **react** (^19.0.0): UI library
- **typescript** (^5.0.0): Type safety and developer experience
- **tailwindcss** (^3.4.0): Styling framework
- **lucide-react** (^0.300.0): Icon library for temperature indicators
- **react-countup** (^6.5.0): Count-up animation for pool amounts (optional)

### Internal Dependencies
- **Smartico Jackpot API**: Requires access to GET /jackpots, POST /jackpots/optin, POST /jackpots/optout, GET /jackpots/winners
- **User Authentication**: Requires valid user ID (future: JWT tokens)
- **SignalR Hub**: Reuses existing /hubs/progress endpoint with new event methods
- **Caching Service**: Reuses existing MemoryCacheService with 30s TTL
- **Progress Broadcaster**: Extends existing IProgressBroadcaster interface with 4 new events

### Team Dependencies
- **Design Team**: Jackpot card designs, temperature indicator icons/colors, explosion animation, winner list layout
- **Backend Team**: None (self-sufficient)
- **DevOps Team**: Application Insights setup, feature flag infrastructure, CDN configuration
- **QA Team**: Manual testing support, accessibility testing, cross-browser testing

## Timeline

| Phase | Start Date | End Date | Owner | Status |
|-------|-----------|----------|-------|--------|
| Phase 1: Backend Foundation | TBD | TBD | Backend Dev | Not Started |
| Phase 2: Backend CQRS | TBD | TBD | Backend Dev | Not Started |
| Phase 3: Backend API | TBD | TBD | Backend Dev | Not Started |
| Phase 4: Frontend Types & Services | TBD | TBD | Frontend Dev | Not Started |
| Phase 5: Frontend - Jackpot Display | TBD | TBD | Frontend Dev + Designer | Not Started |
| Phase 6: Frontend - Opt-In/Out & Winners | TBD | TBD | Frontend Dev | Not Started |
| Phase 7: Real-Time Integration | TBD | TBD | Full Stack Dev | Not Started |
| Phase 8: Demo Data & Testing | TBD | TBD | QA Team + Dev | Not Started |
| Deployment | TBD | TBD | DevOps + Full Team | Not Started |

**Total Estimated Duration:** 16-18 working days (3-4 weeks)

**Milestones:**
- **M1:** Backend API complete and tested (Day 6)
- **M2:** Frontend components complete and tested (Day 13)
- **M3:** Real-time integration complete, E2E tests pass (Day 15)
- **M4:** Deployed to production (Day 18)

## Success Criteria

The implementation is considered successful when:

1. All phases completed and tests passing (80%+ coverage, 100% for critical paths)
2. Performance benchmarks met (API p95 <500ms POST, <200ms GET, LCP <2.5s)
3. Accessibility audit passed (Lighthouse 100 score, axe 0 violations)
4. Code review approved (2+ approvals, no blocking comments)
5. Documentation complete (API docs, component docs, ADRs, user guide)
6. Deployed to production with feature flag enabled
7. Monitoring shows stable metrics (error rate <1%, opt-in success rate >95%)
8. No critical issues in first week post-launch (P0/P1 bugs)
9. User engagement metrics met (40% opt-in rate within first week)
10. Positive user feedback (NPS >8, <5% negative support tickets)
11. Real-time updates working (pool updates within 2s, explosion notifications within 5s)
12. All 9 acceptance criteria from spec.md validated in production

**Acceptance Criteria from Spec (Validation):**
- AC1: View jackpots with all details, temperature indicators, filters, <2s load time
- AC2: Opt-in to MultiUser jackpot, registration count increases, confirmation message
- AC3: Automatic contribution (Percentage) - 5% deducted, pool increases, balance correct
- AC4: Automatic contribution (Fixed) - 10 points deducted, pool increases, balance correct
- AC5: Opt-out from jackpot, registration count decreases, confirmation message
- AC6: Real-time pool/temperature updates, <2s latency, smooth transitions
- AC7: View recent winners with positions, anonymization, filtering, highlighting
- AC8: Explosion estimate display, countdown/estimate, "Exploding soon!" when imminent
- AC9: Prevent opt-in during explosion, disabled button, status message

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] Security Review: [Name] - [Date]

---

**Last Updated:** 2025-11-09
**Next Review:** TBD (mid-implementation checkpoint)
