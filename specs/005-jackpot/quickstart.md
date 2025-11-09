# Jackpot System - Developer Quickstart Guide

**Version:** 1.0
**Last Updated:** 2025-11-09
**Target Audience:** Full-stack developers implementing the Jackpot feature

---

## Overview

The **Jackpot System** is a gamification feature that allows users to opt-in to jackpots and compete for growing prize pools. The system supports two jackpot types:

- **MultiUser**: Shared pool among all opted-in users (e.g., "Mega Jackpot" with 50,000 points)
- **Personal**: Individual pool per user (e.g., "Personal Vault" with user-specific balance)

Users opt-in for **free** (no upfront cost). During gameplay, when users place bets, a portion is automatically deducted and added to the jackpot pool based on the contribution type:

- **Fixed**: Exact amount per bet (e.g., 10 points per bet)
- **Percentage**: Percentage of bet amount (e.g., 5% of a 100-point bet = 5 points contribution)

Jackpots "explode" (draw winners) when the pool reaches thresholds (min_amount to max_amount). Real-time updates via SignalR show pool growth, temperature changes, and winner announcements.

**Key Benefits:**
- Free opt-in removes participation friction
- Automatic contributions during normal gameplay
- Real-time pool updates create excitement
- Temperature indicators (COLD/WARM/HOT/BURNING) provide visual feedback
- Multi-currency support for global audiences

---

## Architecture Overview

The Jackpot feature follows **Clean Architecture with CQRS pattern**:

```
FRONTEND (React 19)
  ├── Types (interfaces, enums)
  ├── Services (HTTP API client, SignalR hub)
  └── Components (JackpotList, JackpotCard, WinnerHistory, etc.)

API Layer (.NET 9)
  ├── Controllers (JackpotsController)
  └── Request/Response DTOs

Application Layer (CQRS + MediatR)
  ├── Queries (GetJackpots, GetJackpotWinners)
  ├── Commands (OptInJackpot, OptOutJackpot)
  └── Validators (FluentValidation)

Domain Layer
  ├── Entities (JackpotDetails, JackpotPot, JackpotWinner)
  ├── Enums (JackpotType, JackpotContributionType, JackPotTemperature)
  └── Interfaces (ISmarticoJackpotApiClient, IProgressBroadcaster)

Infrastructure Layer
  ├── SmarticoJackpotApiClient (HTTP client)
  ├── MemoryCache (30s TTL)
  └── SignalR Broadcaster (4 new events)

Smartico Jackpot API (External)
  ├── GET /jackpots
  ├── POST /jackpots/optin
  ├── POST /jackpots/optout
  └── GET /jackpots/winners
```

**Key Design Principles:**
1. **Opt-In Model**: Free registration, no upfront cost
2. **Automatic Contribution**: Deducted during gameplay (handled by existing bet system)
3. **Real-Time Updates**: SignalR for instant pool/temperature/winner updates
4. **Read-Only MVP**: Display data and manage opt-in/out (contribution processing is external)
5. **Multi-Currency**: Display in both jackpot currency and user wallet currency
6. **Caching**: 30-second TTL on queries to reduce API load
7. **Resilience**: Polly retry policies with circuit breaker pattern

---

## Getting Started

### Prerequisites

**Backend:**
- .NET 9 / ASP.NET Core 9
- C# 13 with nullable reference types
- Existing projects: `Smartico.Missions.Application`, `Smartico.Missions.Domain`, `Smartico.Missions.Infrastructure`
- NuGet packages: MediatR, FluentValidation, Polly

**Frontend:**
- Node.js 18+
- React 19 with TypeScript 5+
- Existing dependencies: react, react-dom, tailwindcss, @microsoft/signalr

### Setup Steps

**1. Backend: Create Domain Entities**

```csharp
// Smartico.Missions.Domain/Entities/JackpotDetails.cs
public record JackpotDetails(
    int TemplateId,
    JackpotType JackpotType,
    string Name,
    string Description,
    string ThumbnailUrl,
    string JpCurrency,              // Base currency (e.g., "Points", "USD")
    string UserCurrency,            // User wallet currency
    JackpotContributionType ContributionType,
    decimal ContributionValue,      // Fixed amount or percentage
    decimal CurrentPotJpCurrency,   // Pool amount in base currency
    decimal CurrentPotUserCurrency, // Pool amount in user currency
    JackPotTemperature Temperature, // COLD/WARM/HOT/BURNING
    decimal MinAmount,              // Explosion threshold start
    decimal MaxAmount,              // Explosion threshold guaranteed
    decimal SeedAmount,             // Initial pool value
    long ExplodeDateTs,             // Unix timestamp when pot exploded
    int RegistrationCount,          // Opted-in user count (MultiUser only)
    bool UserOptedIn,               // Is current user opted in?
    bool AllowAllGames,
    bool ExposeWinners
);
```

**2. Backend: Create Domain Enums**

```csharp
// Smartico.Missions.Domain/Enums/JackpotType.cs
public enum JackpotType
{
    MultiUser = 1,  // Shared pool
    Personal = 2    // Individual pool
}

// Smartico.Missions.Domain/Enums/JackpotContributionType.cs
public enum JackpotContributionType
{
    Fixed = 1,      // Fixed amount per bet
    Percentage = 2  // Percentage of bet
}

// Smartico.Missions.Domain/Enums/JackPotTemperature.cs
public enum JackPotTemperature
{
    COLD = 0,      // Pool < (min - seed) / 2
    WARM = 1,      // Pool between 50% of min threshold
    HOT = 2,       // Pool between min and 50% to max
    BURNING = 3    // Pool >= 50% between min and max
}
```

**3. Frontend: Create TypeScript Types**

```typescript
// frontend/src/types/jackpot.ts
export enum JackpotType {
  MultiUser = 1,
  Personal = 2
}

export enum JackpotContributionType {
  Fixed = 1,
  Percentage = 2
}

export enum JackPotTemperature {
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
  jpCurrency: string;
  userCurrency: string;
  contributionType: JackpotContributionType;
  contributionValue: number;
  currentPotJpCurrency: number;
  currentPotUserCurrency: number;
  temperature: JackPotTemperature;
  minAmount: number;
  maxAmount: number;
  seedAmount: number;
  explodeDateTs: number;
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
  winningPosition: number; // 1st, 2nd, 3rd
  winDate: number;
  isMe: boolean;
}
```

---

## Key Concepts

### 1. Opt-In Model

Users opt-in to jackpots **for free** with a single click. Once opted-in:
- Their opt-in status is registered in the system
- During gameplay, automatic contributions are deducted from their bets
- Registration count increases (for MultiUser jackpots)
- They can opt-out at any time

**API Calls:**
```bash
# Opt-in to a jackpot
POST /api/jackpots/{id}/opt-in
Body: { "userId": "user123" }
Response: { "success": true, "jackpot": JackpotDetails, "message": "You're in!" }

# Opt-out from a jackpot
POST /api/jackpots/{id}/opt-out
Body: { "userId": "user123" }
Response: { "success": true, "message": "You've opted out." }
```

### 2. Contribution Types

**Fixed Contribution:**
- User opts in to "Lucky Draw" (Fixed 10 points per bet)
- Places a 100-point bet
- 10 points are automatically deducted as jackpot contribution
- Pool increases by 10 points

**Percentage Contribution:**
- User opts in to "Mega Jackpot" (Percentage 5% of bet)
- Places a 100-point bet
- 5 points are deducted (5% of 100)
- Pool increases by 5 points

Contribution calculations are **server-enforced** during bet processing (handled by existing bet system, out of scope).

### 3. Temperature Indicator

Pool temperature provides immediate visual feedback:

| Temperature | Emoji | Color | Condition |
|---|---|---|---|
| **COLD** | 🧊 | Blue | Pool < (min_amount - seed) / 2 |
| **WARM** | ☀️ | Yellow | Pool between thresholds |
| **HOT** | 🔥 | Orange | Pool approaching max |
| **BURNING** | 🌋 | Red | Pool near/at max (imminent explosion) |

**Calculation Formula:**
```
COLD:    current_pot < (min_amount - seed_amount) / 2
WARM:    (min_amount - seed_amount) / 2 ≤ current_pot < min_amount
HOT:     min_amount ≤ current_pot < min_amount + 0.5 * (max_amount - min_amount)
BURNING: current_pot ≥ min_amount + 0.5 * (max_amount - min_amount)
```

**Example:**
- Jackpot: min_amount = 5,000, max_amount = 10,000, seed = 1,000
- COLD threshold: (5,000 - 1,000) / 2 = 2,000
  - If pool = 1,500 → COLD
  - If pool = 3,000 → WARM
  - If pool = 6,000 → HOT
  - If pool = 8,000 → BURNING

### 4. Explosion Model

Jackpots "explode" (draw winners) when the pool reaches thresholds:

- **Can Explode:** When `current_pot >= min_amount`
- **Will Explode:** When `current_pot >= max_amount` (guaranteed)
- **Status:** During explosion, opt-in button is disabled with message "Jackpot draw in progress. New pot will be available soon."
- **Winner Announcement:** Recent winners appear in the "Recent Winners" section with anonymized usernames

**Explosion Estimate Display:**
```
If explodeDateTs is available:
  → Show countdown (e.g., "Exploding in 2 hours 30 minutes")

Else, estimate based on contribution rate:
  → hours_to_max = (max_amount - current_pot) / average_contribution_per_hour
  → Display as "In X days, Y hours"

When pool near max (>95%):
  → Display "Exploding soon!"
```

### 5. Real-Time Updates via SignalR

Four new events broadcast pool/winner changes to all connected clients:

```typescript
// 1. JackpotPoolUpdated - Broadcast when user contributes
{
  templateId: 1,
  currentPotJpCurrency: 50000,
  currentPotUserCurrency: 5000,
  registrationCount: 312
}

// 2. JackpotTemperatureChanged - Broadcast when pool crosses threshold
{
  templateId: 1,
  temperature: JackPotTemperature.HOT,
  currentPot: 6000
}

// 3. JackpotExploded - Broadcast when jackpot draws winner
{
  templateId: 1,
  jackpotName: "Mega Jackpot",
  finalPot: 10000,
  winnerCount: 3
}

// 4. JackpotWinnerAnnounced - Broadcast for each winner
{
  templateId: 1,
  jackpotName: "Mega Jackpot",
  winner: {
    potId: 100,
    userId: "user456",
    publicUsername: "J***n",
    avatarId: 5,
    winningAmountJpCurrency: 10000,
    winningAmountUserCurrency: 1000,
    winningPosition: 1,
    winDate: 1699545600,
    isMe: false
  }
}
```

**Client-Side Handling:**
- Pool updates trigger count-up animation (1-2s)
- Temperature changes animate color transition (300ms)
- Explosion notifications show modal with winner details
- Winner announcements prepend to winner list with highlight
- Current user's wins show full name (isMe: true)

---

## Implementation Guide

### Backend: Domain → Application → API

**Phase 1: Domain Layer**

1. Create entities (JackpotDetails, JackpotPot, JackpotWinner)
2. Create enums (JackpotType, JackpotContributionType, JackPotTemperature)
3. Create interfaces (ISmarticoJackpotApiClient)
4. Add validation logic:
   ```csharp
   // Example: Temperature calculation
   public static JackPotTemperature CalculateTemperature(
       decimal currentPot, decimal minAmount, decimal maxAmount, decimal seedAmount)
   {
       var coldThreshold = (minAmount - seedAmount) / 2;
       var hotThreshold = minAmount + 0.5m * (maxAmount - minAmount);

       return currentPot < coldThreshold ? JackPotTemperature.COLD :
              currentPot < minAmount ? JackPotTemperature.WARM :
              currentPot < hotThreshold ? JackPotTemperature.HOT :
              JackPotTemperature.BURNING;
   }
   ```

**Phase 2: Application Layer (CQRS)**

1. Create queries with 30-second caching:
   ```csharp
   // GetJackpotsQuery.cs
   public record GetJackpotsQuery(string UserId, JackpotType? Type = null)
       : IRequest<List<JackpotDetails>>;

   // GetJackpotsQueryHandler.cs
   public class GetJackpotsQueryHandler : IRequestHandler<GetJackpotsQuery, List<JackpotDetails>>
   {
       private readonly ISmarticoJackpotApiClient _apiClient;
       private readonly IMemoryCache _cache;

       public async Task<List<JackpotDetails>> Handle(GetJackpotsQuery request, CancellationToken ct)
       {
           var cacheKey = $"jackpots_{request.UserId}";
           if (_cache.TryGetValue(cacheKey, out List<JackpotDetails>? cached))
               return cached!;

           var jackpots = await _apiClient.GetJackpotsAsync(request.UserId, ct);
           var filtered = request.Type.HasValue
               ? jackpots.Where(j => j.JackpotType == request.Type).ToList()
               : jackpots;

           _cache.Set(cacheKey, filtered, TimeSpan.FromSeconds(30));
           return filtered;
       }
   }
   ```

2. Create commands with validation:
   ```csharp
   // OptInJackpotCommand.cs
   public record OptInJackpotCommand(string UserId, int JackpotId)
       : IRequest<OptInJackpotResponse>;

   // OptInJackpotCommandValidator.cs
   public class OptInJackpotCommandValidator : AbstractValidator<OptInJackpotCommand>
   {
       public OptInJackpotCommandValidator()
       {
           RuleFor(x => x.UserId)
               .NotEmpty().WithMessage("User ID is required");

           RuleFor(x => x.JackpotId)
               .GreaterThan(0).WithMessage("Invalid jackpot ID");
       }
   }

   // OptInJackpotCommandHandler.cs
   public class OptInJackpotCommandHandler : IRequestHandler<OptInJackpotCommand, OptInJackpotResponse>
   {
       private readonly ISmarticoJackpotApiClient _apiClient;
       private readonly IMemoryCache _cache;
       private readonly IProgressBroadcaster _broadcaster;

       public async Task<OptInJackpotResponse> Handle(OptInJackpotCommand request, CancellationToken ct)
       {
           var jackpot = await _apiClient.OptInAsync(request.UserId, request.JackpotId, ct);

           // Invalidate cache for this user
           _cache.Remove($"jackpots_{request.UserId}");

           // Broadcast to all clients
           await _broadcaster.BroadcastAsync("JackpotPoolUpdated", new
           {
               jackpot.TemplateId,
               jackpot.CurrentPotJpCurrency,
               jackpot.CurrentPotUserCurrency,
               jackpot.RegistrationCount
           }, ct);

           return new OptInJackpotResponse
           {
               Success = true,
               Jackpot = jackpot,
               Message = $"You're in! Your bets will contribute {FormatContribution(jackpot)} to this jackpot."
           };
       }
   }
   ```

**Phase 3: API Layer**

```csharp
// JackpotsController.cs
[ApiController]
[Route("api/[controller]")]
public class JackpotsController : ControllerBase
{
    private readonly IMediator _mediator;

    /// <summary>
    /// Get all active jackpots with user opt-in status
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<GetJackpotsResponse>> GetJackpots(
        [FromQuery] string userId,
        [FromQuery] JackpotType? type = null)
    {
        if (string.IsNullOrEmpty(userId))
            return BadRequest("User ID is required");

        var jackpots = await _mediator.Send(new GetJackpotsQuery(userId, type));
        return Ok(new GetJackpotsResponse { Jackpots = jackpots });
    }

    /// <summary>
    /// Opt-in user to a jackpot
    /// </summary>
    [HttpPost("{id}/opt-in")]
    public async Task<ActionResult<OptInJackpotResponse>> OptInJackpot(
        int id,
        [FromBody] OptInJackpotRequest request)
    {
        var response = await _mediator.Send(new OptInJackpotCommand(request.UserId, id));
        return Ok(response);
    }

    /// <summary>
    /// Opt-out user from a jackpot
    /// </summary>
    [HttpPost("{id}/opt-out")]
    public async Task<ActionResult<OptOutJackpotResponse>> OptOutJackpot(
        int id,
        [FromBody] OptOutJackpotRequest request)
    {
        var response = await _mediator.Send(new OptOutJackpotCommand(request.UserId, id));
        return Ok(response);
    }

    /// <summary>
    /// Get recent winners (last 30 days)
    /// </summary>
    [HttpGet("winners")]
    public async Task<ActionResult<GetJackpotWinnersResponse>> GetWinners(
        [FromQuery] string userId,
        [FromQuery] JackpotType? type = null)
    {
        var winners = await _mediator.Send(new GetJackpotWinnersQuery(userId, type));
        return Ok(new GetJackpotWinnersResponse { Winners = winners });
    }
}
```

### Frontend: Types → Services → Components

**Phase 1: Types & Services**

```typescript
// frontend/src/services/jackpotService.ts
class JackpotService {
    private baseUrl = '/api/jackpots';

    async getJackpots(userId: string, type?: JackpotType): Promise<JackpotDetails[]> {
        const params = new URLSearchParams({ userId });
        if (type !== undefined) params.append('type', type.toString());

        const response = await fetch(`${this.baseUrl}?${params}`);
        if (!response.ok) throw new Error(`Failed to fetch jackpots: ${response.statusText}`);

        const data = await response.json();
        return data.jackpots;
    }

    async optInJackpot(userId: string, jackpotId: number): Promise<OptInResponse> {
        const response = await fetch(`${this.baseUrl}/${jackpotId}/opt-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) throw new Error('Opt-in failed');
        return response.json();
    }

    async optOutJackpot(userId: string, jackpotId: number): Promise<OptOutResponse> {
        const response = await fetch(`${this.baseUrl}/${jackpotId}/opt-out`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) throw new Error('Opt-out failed');
        return response.json();
    }

    async getWinners(userId: string, type?: JackpotType): Promise<JackpotWinner[]> {
        const params = new URLSearchParams({ userId });
        if (type !== undefined) params.append('type', type.toString());

        const response = await fetch(`${this.baseUrl}/winners?${params}`);
        if (!response.ok) throw new Error('Failed to fetch winners');

        const data = await response.json();
        return data.winners;
    }
}

export const jackpotService = new JackpotService();
```

**Phase 2: Components**

```typescript
// frontend/src/components/jackpot/JackpotCard.tsx
export function JackpotCard({
    jackpot,
    onOptIn,
    onOptOut
}: {
    jackpot: JackpotDetails;
    onOptIn: (id: number) => Promise<void>;
    onOptOut: (id: number) => Promise<void>;
}) {
    return (
        <div className="rounded-lg shadow-md p-4 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold">{jackpot.name}</h2>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {jackpot.jackpotType === JackpotType.MultiUser ? 'Multi-User' : 'Personal'}
                    </span>
                </div>
                <TemperatureIndicator temperature={jackpot.temperature} showLabel />
            </div>

            {/* Pool Display */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">Current Pool</p>
                <p className="text-3xl font-semibold">
                    {jackpot.currentPotJpCurrency.toLocaleString()} {jackpot.jpCurrency}
                </p>
                <p className="text-xs text-gray-500">
                    ≈ {jackpot.currentPotUserCurrency.toLocaleString()} {jackpot.userCurrency}
                </p>
            </div>

            {/* Contribution Info */}
            <div className="mb-4">
                <p className="text-sm text-gray-600">Contribution</p>
                <p className="font-medium">
                    {jackpot.contributionType === JackpotContributionType.Fixed
                        ? `${jackpot.contributionValue} ${jackpot.jpCurrency} per bet`
                        : `${jackpot.contributionValue}% of each bet`}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-600">Players</p>
                    <p className="text-lg font-semibold">{jackpot.registrationCount}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Explosion</p>
                    <p className="text-lg font-semibold">In 2 days</p>
                </div>
            </div>

            {/* Action Button */}
            {jackpot.userOptedIn ? (
                <button
                    onClick={() => onOptOut(jackpot.templateId)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Opt Out
                </button>
            ) : (
                <button
                    onClick={() => onOptIn(jackpot.templateId)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Opt In
                </button>
            )}
        </div>
    );
}

// frontend/src/components/jackpot/TemperatureIndicator.tsx
export function TemperatureIndicator({
    temperature,
    showLabel
}: {
    temperature: JackPotTemperature;
    showLabel?: boolean;
}) {
    const config = {
        [JackPotTemperature.COLD]: { emoji: '🧊', label: 'Cold', color: 'text-blue-600' },
        [JackPotTemperature.WARM]: { emoji: '☀️', label: 'Warm', color: 'text-yellow-500' },
        [JackPotTemperature.HOT]: { emoji: '🔥', label: 'Hot', color: 'text-orange-600' },
        [JackPotTemperature.BURNING]: { emoji: '🌋', label: 'Burning', color: 'text-red-600' }
    };

    const { emoji, label, color } = config[temperature];

    return (
        <span className={`inline-flex items-center gap-1 ${color}`}>
            <span className="text-2xl">{emoji}</span>
            {showLabel && <span className="font-medium">{label}</span>}
        </span>
    );
}
```

---

## Testing

### Run Backend Tests

```bash
# Run all unit tests
cd backend
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true

# Run specific test class
dotnet test --filter "FullyQualifiedName~OptInJackpotCommandHandlerTests"
```

### Run Frontend Tests

```bash
# Run all tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage

# Run specific component tests
npm test -- TemperatureIndicator.test.tsx
```

### Test Checklist

- [ ] **Backend Unit Tests**: Domain entities, CQRS handlers, validators (target: 80%+ coverage)
- [ ] **Frontend Unit Tests**: Components, services, hooks (target: 80%+ coverage)
- [ ] **Integration Tests**: API endpoints with WebApplicationFactory
- [ ] **E2E Tests**: Opt-in/opt-out flow, real-time updates
- [ ] **Accessibility Tests**: Lighthouse audit, axe DevTools, keyboard navigation
- [ ] **Performance Tests**: API p95 <500ms POST, <200ms GET

---

## Demo Data

Demo data is embedded in the `SmarticoJackpotApiClient` to enable testing without external API:

### Demo Users

- **User A** (id: "user-demo-a"): Opted in to 2 MultiUser, 1 Personal jackpot
- **User B** (id: "user-demo-b"): Opted in to 1 MultiUser jackpot only
- **User C** (id: "user-demo-c"): Not opted in to any jackpots
- **User D** (id: "user-demo-d"): Opted in to all jackpots

### Demo Jackpots

| Name | Type | Contribution | Pool | Temp | Players |
|---|---|---|---|---|---|
| Mega Jackpot | MultiUser | 5% | 50,000 pts | HOT | 312 |
| Community Pot | MultiUser | Fixed 10 | 4,950 pts | WARM | 125 |
| Grand Prize | MultiUser | 3% | 95,000 pts | BURNING | 587 |
| Personal Vault | Personal | Fixed 5 | 120 pts* | COLD | N/A |
| Lucky Draw | Personal | 2% | 980 pts* | WARM | N/A |

*Personal jackpots show per-user pools

### Demo Winners (Last 30 Days)

```
J***n won Community Jackpot: 10,000 points (Nov 8)
S***h won Mega Jackpot: 50,000 points (Nov 5)
M***e won Grand Prize: 95,000 points (Nov 3)
T***y won Personal Vault: 500 points (Nov 1)
```

**To Test with Demo Data:**
1. Use demo user IDs: `user-demo-a`, `user-demo-b`, `user-demo-c`, `user-demo-d`
2. No external API calls made (all data mocked)
3. Switch user ID to see different opt-in statuses

---

## API Examples

### 1. Get All Jackpots

```bash
curl -X GET "http://localhost:5000/api/jackpots?userId=user-demo-a" \
  -H "Content-Type: application/json"

# Response:
{
  "jackpots": [
    {
      "templateId": 1,
      "jackpotType": 1,
      "name": "Mega Jackpot",
      "description": "Shared jackpot for all players",
      "thumbnailUrl": "https://...",
      "jpCurrency": "Points",
      "userCurrency": "USD",
      "contributionType": 2,
      "contributionValue": 5.0,
      "currentPotJpCurrency": 50000,
      "currentPotUserCurrency": 5000,
      "temperature": 2,
      "minAmount": 5000,
      "maxAmount": 10000,
      "seedAmount": 1000,
      "explodeDateTs": 1699632000,
      "registrationCount": 312,
      "userOptedIn": true,
      "allowAllGames": true,
      "exposeWinners": true
    }
  ]
}
```

### 2. Get Single Jackpot

```bash
curl -X GET "http://localhost:5000/api/jackpots/1?userId=user-demo-a" \
  -H "Content-Type: application/json"

# Response:
{
  "templateId": 1,
  "jackpotType": 1,
  "name": "Mega Jackpot",
  ...
}
```

### 3. Opt-In to Jackpot

```bash
curl -X POST "http://localhost:5000/api/jackpots/1/opt-in" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-demo-c"}'

# Response:
{
  "success": true,
  "jackpot": {
    "templateId": 1,
    "userOptedIn": true,
    "registrationCount": 313,
    ...
  },
  "message": "You're in! Your bets will now contribute 5% to this jackpot."
}
```

### 4. Opt-Out from Jackpot

```bash
curl -X POST "http://localhost:5000/api/jackpots/1/opt-out" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-demo-a"}'

# Response:
{
  "success": true,
  "message": "You've opted out. Your bets will no longer contribute to this jackpot."
}
```

### 5. Get Recent Winners

```bash
curl -X GET "http://localhost:5000/api/jackpots/winners?userId=user-demo-a&type=1" \
  -H "Content-Type: application/json"

# Response:
{
  "winners": [
    {
      "potId": 100,
      "userId": "user456",
      "publicUsername": "J***n",
      "avatarId": 5,
      "winningAmountJpCurrency": 10000,
      "winningAmountUserCurrency": 1000,
      "winningPosition": 1,
      "winDate": 1699545600,
      "isMe": false
    },
    {
      "potId": 100,
      "userId": "user-demo-a",
      "publicUsername": "You",
      "avatarId": 2,
      "winningAmountJpCurrency": 50000,
      "winningAmountUserCurrency": 5000,
      "winningPosition": 1,
      "winDate": 1699632000,
      "isMe": true
    }
  ]
}
```

### 6. Filter Jackpots by Type

```bash
# MultiUser jackpots only
curl -X GET "http://localhost:5000/api/jackpots?userId=user-demo-a&type=1"

# Personal jackpots only
curl -X GET "http://localhost:5000/api/jackpots?userId=user-demo-a&type=2"
```

---

## Troubleshooting

### Backend Issues

**Problem: "Jackpot entities not found"**
- Ensure `JackpotDetails`, enums, and interfaces are created in `Smartico.Missions.Domain`
- Verify project compilation: `dotnet build`

**Problem: "API client throws timeout error"**
- Check Smartico API is running: `curl http://smartico-api:5000/health`
- Verify Polly retry policies are configured correctly
- Check network connectivity and firewall rules

**Problem: "Cache invalidation not working"**
- Ensure `IMemoryCache` is registered in DI container
- Verify cache key matches between Get and Set operations
- Check cache TTL is 30 seconds (not 0)

**Problem: "SignalR events not broadcasting"**
- Verify `IProgressBroadcaster` implementation extends with new event methods
- Check SignalR hub is connected: `GET /hubs/progress/connect`
- Ensure user groups are set up correctly for filtering

### Frontend Issues

**Problem: "Types don't match backend"**
- Regenerate types from API schema if available
- Compare `JackpotDetails` properties with backend entity
- Check enum values match (e.g., JackpotType.MultiUser = 1)

**Problem: "Real-time updates not arriving"**
- Check SignalR connection status in browser DevTools: `Network` tab
- Verify SignalR event handler is subscribed: `useEffect(() => { hub.on('JackpotPoolUpdated', ...) })`
- Check browser console for connection errors
- Verify user group subscription: `await hub.invoke('JoinUserGroup', userId)`

**Problem: "Opt-in button not responding"**
- Check API endpoint is accessible: `curl http://localhost:5000/api/jackpots`
- Verify request/response format matches API expectations
- Check browser Network tab for 400/500 errors
- Ensure userId is valid and non-empty

**Problem: "Temperature colors not showing"**
- Verify Tailwind CSS is configured: Check `tailwind.config.js`
- Use correct color classes: `text-blue-600`, `text-yellow-500`, `text-orange-600`, `text-red-600`
- Check component props match enum values (0-3)

### Common Validation Errors

| Error | Cause | Solution |
|---|---|---|
| "User ID is required" | Empty or null userId | Ensure userId is passed to API calls and component props |
| "Invalid jackpot ID" | Non-positive integer | Verify jackpotId > 0, check API response |
| "User already opted in" | User attempting duplicate opt-in | Check `userOptedIn` flag before showing opt-in button |
| "User not opted in" | User attempting to opt-out without opting in | Disable opt-out button if `userOptedIn` is false |
| "Jackpot in explosion state" | Attempting opt-in/out during draw | Disable buttons during explosion, show message |

### Performance Debugging

**API calls slow (>500ms):**
```bash
# Check API response time
curl -w "\nTime: %{time_total}s\n" -X GET "http://localhost:5000/api/jackpots?userId=user-demo-a"

# Check cache hit rate (should be >70%)
# Monitor IMemoryCache in application logs
```

**Frontend rendering slow:**
```typescript
// Add performance markers
performance.mark('jackpot-render-start');
// ... render code ...
performance.mark('jackpot-render-end');
performance.measure('jackpot-render', 'jackpot-render-start', 'jackpot-render-end');
console.log(performance.getEntriesByName('jackpot-render')[0].duration, 'ms');
```

**SignalR updates delayed (>2s):**
- Reduce event broadcast frequency (throttle to 1 update per 2 seconds)
- Check network latency: `connection.latency` in client library
- Monitor WebSocket frame size (compress if >10KB)

---

## Resources

- **Specification:** `specs/005-jackpot/spec.md` - Complete feature requirements
- **Implementation Plan:** `specs/005-jackpot/plan.md` - Detailed phased approach
- **Smartico API Docs:** `smartico-api/docs/` - API reference and examples
- **Architecture:** `ARCHITECTURE_IMPLEMENTATION.md` - System design principles
- **Code Examples:** Check existing implementations:
  - Missions feature: `backend/src/Smartico.Missions.Application/Features/`
  - Bonus feature: `backend/src/Smartico.Bonus.Domain/`
  - Frontend components: `frontend/src/components/`

---

## Next Steps

1. **Setup Phase 1 (Backend)**: Create domain entities and enums
2. **Setup Phase 2**: Implement API client and CQRS handlers
3. **Setup Phase 3**: Create API controllers and endpoints
4. **Setup Phase 4**: Define TypeScript types and services
5. **Setup Phase 5**: Build React components
6. **Integration**: Connect frontend to backend, test real-time updates
7. **Testing**: Run full test suite, verify all acceptance criteria
8. **Deployment**: Deploy to staging, then production

**Questions? Check:**
- `specs/005-jackpot/plan.md` for detailed implementation steps
- `specs/005-jackpot/spec.md` for acceptance criteria and edge cases
- Project team members in `CODEOWNERS` file

---

**Happy coding! 🚀**
