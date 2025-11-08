# Mini Games - Developer Quickstart Guide

**Created:** 2025-11-08
**Last Updated:** 2025-11-08
**Target Audience:** Backend & Frontend Developers

## Overview

This guide provides step-by-step instructions for developing and testing the Mini Games feature. The feature integrates into the existing **Smartico.Missions.*** projects following the same CQRS + Clean Architecture patterns used by the Bonuses feature.

---

## Prerequisites

### Required Software

- **.NET 9 SDK** - [Download](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **IDE**: Visual Studio 2022 / VS Code / Rider

### Recommended Tools

- **Postman / Thunder Client** - API testing
- **Lighthouse** - Frontend performance testing
- **k6** - Load testing (optional)

### Verify Installation

```bash
# Check .NET version
dotnet --version
# Expected: 9.0.0 or higher

# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: 9.0.0 or higher
```

---

## Project Structure

```
f:\Projects\smartico\
├── backend/
│   └── src/
│       ├── Smartico.Missions.Domain/         ← Add: MiniGame entities
│       ├── Smartico.Missions.Application/    ← Add: CQRS handlers
│       ├── Smartico.Missions.Infrastructure/ ← Add: API client
│       └── Smartico.Missions.Api/            ← Add: Controller
├── frontend/
│   └── src/
│       ├── types/                            ← Add: minigame.ts
│       ├── services/                         ← Add: miniGameService.ts
│       └── components/                       ← Add: MiniGame components
└── specs/
    └── 003-mini-games/                       ← Design docs
        ├── spec.md                           ← Feature specification
        ├── plan.md                           ← Implementation plan
        ├── research/research.md              ← Technology decisions
        ├── design/data-model.md              ← Entity definitions
        ├── contracts/minigames-api.yaml      ← OpenAPI spec
        └── quickstart.md                     ← This file
```

---

## Development Workflow

### Phase 1: Backend Domain Layer (Week 1)

#### Step 1.1: Create Domain Entities

**File:** `backend/src/Smartico.Missions.Domain/Entities/MiniGame.cs`

```bash
# Navigate to Domain project
cd backend/src/Smartico.Missions.Domain

# Create entities (or use IDE)
# Copy templates from specs/003-mini-games/design/data-model.md
```

**Entities to Create:**
1. `Entities/MiniGame.cs` - Main game entity (50 lines)
2. `Entities/MiniGamePrize.cs` - Prize entity (30 lines)
3. `Entities/PlayMiniGameResult.cs` - Result record (20 lines)

**Enums to Create:**
1. `Enums/MiniGamePrizeType.cs` - 11 prize types
2. `Enums/GameType.cs` - 4 game types (Spin, GiftBox, Scratch, MatchX)
3. `Enums/BuyInType.cs` - 5 buy-in types (Free, Points, Gems, Diamonds, Spin)

**Interfaces to Create:**
1. `Interfaces/ISmarticoMiniGameApiClient.cs` - API client abstraction

**Interface to Extend:**
1. `Interfaces/IProgressBroadcaster.cs` - Add 5 mini game methods

#### Step 1.2: Write Unit Tests for Entities

**File:** `backend/tests/Smartico.Missions.Domain.Tests/Entities/MiniGameTests.cs`

```csharp
[Fact]
public void IsActive_Should_ReturnTrue_When_WithinActivePeriod()
{
    // Arrange
    var game = new MiniGame
    {
        Id = 1,
        Name = "Test Game",
        GameType = GameType.Spin,
        BuyInType = BuyInType.Free,
        ActiveFromDate = DateTimeOffset.UtcNow.AddDays(-1).ToUnixTimeMilliseconds(),
        ActiveTillDate = DateTimeOffset.UtcNow.AddDays(1).ToUnixTimeMilliseconds(),
        Prizes = new List<MiniGamePrize>()
    };

    // Act
    var result = game.IsActive();

    // Assert
    result.Should().BeTrue();
}
```

**Run Tests:**
```bash
cd backend/tests/Smartico.Missions.Domain.Tests
dotnet test
```

#### Step 1.3: Build Domain Project

```bash
cd backend/src/Smartico.Missions.Domain
dotnet build

# Expected output:
# Build succeeded.
#     0 Warning(s)
#     0 Error(s)
```

---

### Phase 2: Backend Application Layer (Week 2-3)

#### Step 2.1: Create CQRS Query Handler

**File:** `backend/src/Smartico.Missions.Application/Features/MiniGames/Queries/GetMiniGames.cs`

```csharp
namespace Smartico.Missions.Application.Features.MiniGames.Queries;

public record GetMiniGamesQuery(string UserId) : IRequest<GetMiniGamesResponse>;

public record GetMiniGamesResponse(List<MiniGame> MiniGames);

public class GetMiniGamesQueryHandler : IRequestHandler<GetMiniGamesQuery, GetMiniGamesResponse>
{
    private const string CacheKeyPrefix = "minigames";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    private readonly ISmarticoMiniGameApiClient _miniGameApiClient;
    private readonly IMemoryCacheService _cacheService;
    private readonly ILogger<GetMiniGamesQueryHandler> _logger;

    public GetMiniGamesQueryHandler(
        ISmarticoMiniGameApiClient miniGameApiClient,
        IMemoryCacheService cacheService,
        ILogger<GetMiniGamesQueryHandler> logger)
    {
        _miniGameApiClient = miniGameApiClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task<GetMiniGamesResponse> Handle(GetMiniGamesQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"{CacheKeyPrefix}:{request.UserId}";

        // Check cache
        var cachedGames = await _cacheService.GetAsync<List<MiniGame>>(cacheKey, cancellationToken);
        if (cachedGames != null)
        {
            _logger.LogDebug("Cache HIT for key: {CacheKey}", cacheKey);
            return new GetMiniGamesResponse(cachedGames);
        }

        // Cache miss - call API
        _logger.LogDebug("Cache MISS for key: {CacheKey}", cacheKey);
        var games = await _miniGameApiClient.GetMiniGamesAsync(request.UserId, cancellationToken);

        // Cache for 30s
        await _cacheService.SetAsync(cacheKey, games, CacheTtl, cancellationToken);

        return new GetMiniGamesResponse(games);
    }
}
```

#### Step 2.2: Create CQRS Command Handler

**File:** `backend/src/Smartico.Missions.Application/Features/MiniGames/Commands/PlayMiniGame.cs`

```csharp
public record PlayMiniGameCommand(string UserId, int GameId) : IRequest<PlayMiniGameResponse>;

public record PlayMiniGameResponse(
    bool Success,
    int? PrizeId = null,
    string? PrizeName = null,
    MiniGamePrizeType? PrizeType = null,
    decimal? PrizeValue = null,
    string? ErrorCode = null,
    string? ErrorMessage = null,
    MiniGame? UpdatedGame = null
);

public class PlayMiniGameCommandHandler : IRequestHandler<PlayMiniGameCommand, PlayMiniGameResponse>
{
    private readonly ISmarticoMiniGameApiClient _miniGameApiClient;
    private readonly IMemoryCacheService _cacheService;
    private readonly IProgressBroadcaster _progressBroadcaster;
    private readonly ILogger<PlayMiniGameCommandHandler> _logger;

    public async Task<PlayMiniGameResponse> Handle(PlayMiniGameCommand request, CancellationToken cancellationToken)
    {
        // Call API to play game
        var result = await _miniGameApiClient.PlayMiniGameAsync(request.UserId, request.GameId, cancellationToken);

        if (!result.Success)
        {
            return new PlayMiniGameResponse(
                Success: false,
                ErrorCode: result.ErrorCode,
                ErrorMessage: result.ErrorMessage
            );
        }

        // Invalidate cache
        var cacheKey = $"minigames:{request.UserId}";
        await _cacheService.RemoveAsync(cacheKey, cancellationToken);

        // Broadcast SignalR events
        await _progressBroadcaster.BroadcastMiniGamePlayedAsync(
            request.UserId,
            result.UpdatedGame!,
            cancellationToken
        );

        if (result.PrizeType != MiniGamePrizeType.NoPrize)
        {
            var prize = result.UpdatedGame!.Prizes.First(p => p.Id == result.PrizeId);
            await _progressBroadcaster.BroadcastMiniGamePrizeWonAsync(
                request.UserId,
                result.UpdatedGame!,
                prize,
                cancellationToken
            );
        }

        return new PlayMiniGameResponse(
            Success: true,
            PrizeId: result.PrizeId,
            PrizeName: result.PrizeName,
            PrizeType: result.PrizeType,
            PrizeValue: result.PrizeValue,
            UpdatedGame: result.UpdatedGame
        );
    }
}
```

#### Step 2.3: Add FluentValidation

**File:** `backend/src/Smartico.Missions.Application/Features/MiniGames/Validators/PlayMiniGameCommandValidator.cs`

```csharp
public class PlayMiniGameCommandValidator : AbstractValidator<PlayMiniGameCommand>
{
    public PlayMiniGameCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.GameId)
            .GreaterThan(0)
            .WithMessage("Game ID must be greater than 0");
    }
}
```

#### Step 2.4: Write Unit Tests for Handlers

**File:** `backend/tests/Smartico.Missions.Application.Tests/Features/MiniGames/GetMiniGamesQueryHandlerTests.cs`

```csharp
[Fact]
public async Task Handle_Should_ReturnCachedMiniGames_When_CacheHit()
{
    // Arrange
    var cachedGames = new List<MiniGame> { CreateMockGame() };
    _mockCache.Setup(x => x.GetAsync<List<MiniGame>>("minigames:user1", default))
               .ReturnsAsync(cachedGames);
    var query = new GetMiniGamesQuery("user1");

    // Act
    var result = await _handler.Handle(query, default);

    // Assert
    result.MiniGames.Should().BeEquivalentTo(cachedGames);
}
```

**Run Tests:**
```bash
cd backend/tests/Smartico.Missions.Application.Tests
dotnet test
```

---

### Phase 3: Backend Infrastructure Layer (Week 3)

#### Step 3.1: Create Demo API Client

**File:** `backend/src/Smartico.Missions.Infrastructure/SmarticoApi/SmarticoMiniGameApiClient.cs`

```csharp
public class SmarticoMiniGameApiClient : ISmarticoMiniGameApiClient
{
    // Demo data: 5 sample mini games
    private static readonly List<MiniGame> _demoGames = new()
    {
        new MiniGame
        {
            Id = 1,
            Name = "Daily Lucky Spin",
            Description = "Spin the wheel once per day for free prizes!",
            Thumbnail = "https://cdn.example.com/daily-spin.png",
            GameType = GameType.Spin,
            BuyInType = BuyInType.Free,
            SpinCount = 1,
            JackpotCurrent = 100m,
            JackpotAddOnAttempt = 5m,
            MaxNumberOfAttempts = 1,
            MaxSpinsPeriodMs = 86400000, // 24 hours
            Prizes = new List<MiniGamePrize>
            {
                new() { Id = 101, Name = "No Prize", PrizeType = MiniGamePrizeType.NoPrize, IsSurcharge = true, HidePrizeFromHistory = false },
                new() { Id = 102, Name = "100 Points", PrizeType = MiniGamePrizeType.Points, PrizeValue = 100, Pool = 50, IsSurcharge = false, HidePrizeFromHistory = false },
                // ... more prizes
            }
        },
        // ... more games
    };

    public Task<List<MiniGame>> GetMiniGamesAsync(string userId, CancellationToken cancellationToken = default)
    {
        // Return cloned demo games (to prevent mutation)
        return Task.FromResult(_demoGames.Select(CloneGame).ToList());
    }

    public Task<PlayMiniGameResult> PlayMiniGameAsync(string userId, int gameId, CancellationToken cancellationToken = default)
    {
        var game = _demoGames.FirstOrDefault(g => g.Id == gameId);
        if (game == null)
        {
            return Task.FromResult(new PlayMiniGameResult(
                Success: false,
                ErrorCode: "GAME_NOT_FOUND",
                ErrorMessage: "This game is no longer available"
            ));
        }

        // Validate cooldown, attempts, etc.
        // Select random prize
        // Update game state
        // Return result

        var prize = SelectRandomPrize(game.Prizes);

        return Task.FromResult(new PlayMiniGameResult(
            Success: true,
            PrizeId: prize.Id,
            PrizeName: prize.Name,
            PrizeType: prize.PrizeType,
            PrizeValue: prize.PrizeValue,
            UpdatedGame: game // (with updated cooldown, jackpot, etc.)
        ));
    }
}
```

#### Step 3.2: Extend SignalR Broadcaster

**File:** `backend/src/Smartico.Missions.Infrastructure/SignalR/SignalRProgressBroadcaster.cs`

```csharp
public async Task BroadcastMiniGamePlayedAsync(string userId, MiniGame game, CancellationToken cancellationToken = default)
{
    await _hubContext.Clients.Group($"user:{userId}").SendAsync("MiniGamePlayed", game, cancellationToken);
}

public async Task BroadcastMiniGamePrizeWonAsync(string userId, MiniGame game, MiniGamePrize prize, CancellationToken cancellationToken = default)
{
    await _hubContext.Clients.Group($"user:{userId}").SendAsync("MiniGamePrizeWon", new { game, prize }, cancellationToken);
}

public async Task BroadcastMiniGameJackpotWonAsync(string userId, MiniGame game, decimal jackpotAmount, CancellationToken cancellationToken = default)
{
    // Broadcast to ALL clients (global event)
    await _hubContext.Clients.All.SendAsync("MiniGameJackpotWon", new { gameId = game.Id, jackpotAmount }, cancellationToken);
}
```

#### Step 3.3: Register Services in DI

**File:** `backend/src/Smartico.Missions.Infrastructure/DependencyInjection.cs`

```csharp
public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
{
    // ... existing registrations ...

    // Mini Game API Client (demo data)
    services.AddSingleton<ISmarticoMiniGameApiClient, SmarticoMiniGameApiClient>();

    return services;
}
```

---

### Phase 4: Backend API Layer (Week 4)

#### Step 4.1: Create Controller

**File:** `backend/src/Smartico.Missions.Api/Controllers/MiniGamesController.cs`

```csharp
[ApiController]
[Route("api/mini-games")]
public class MiniGamesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<MiniGamesController> _logger;

    public MiniGamesController(IMediator mediator, ILogger<MiniGamesController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Gets all mini games available to the user.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(GetMiniGamesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMiniGames([FromQuery] string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { success = false, error = "User ID is required" });
        }

        var query = new GetMiniGamesQuery(userId);
        var result = await _mediator.Send(query, cancellationToken);

        return Ok(new { success = true, data = new { miniGames = result.MiniGames } });
    }

    /// <summary>
    /// Plays a mini game and returns the result.
    /// </summary>
    [HttpPost("{gameId}/play")]
    [ProducesResponseType(typeof(PlayMiniGameResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PlayMiniGame(
        [FromRoute] int gameId,
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        var command = new PlayMiniGameCommand(userId, gameId);
        var result = await _mediator.Send(command, cancellationToken);

        if (!result.Success)
        {
            if (result.ErrorCode == "GAME_NOT_FOUND")
            {
                return NotFound(new { success = false, data = result });
            }

            return BadRequest(new { success = false, data = result });
        }

        return Ok(new { success = true, data = result });
    }
}
```

#### Step 4.2: Run Backend

```bash
cd backend/src/Smartico.Missions.Api
dotnet run

# Expected output:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: http://localhost:5227
# info: Microsoft.Hosting.Lifetime[0]
#       Application started.
```

#### Step 4.3: Test with Postman/curl

```bash
# Get mini games
curl -X GET "http://localhost:5227/api/mini-games?userId=user123"

# Play mini game
curl -X POST "http://localhost:5227/api/mini-games/1/play?userId=user123"
```

---

### Phase 5: Frontend Types & Services (Week 5)

#### Step 5.1: Create TypeScript Types

**File:** `frontend/src/types/minigame.ts`

```typescript
export interface MiniGame {
  id: number;
  name: string;
  description?: string;
  thumbnail?: string;
  gameType: GameType;
  buyInType: BuyInType;
  buyInCostPoints?: number;
  buyInCostGems?: number;
  buyInCostDiamonds?: number;
  spinCount?: number;
  nextAvailableSpinTs?: number;
  jackpotCurrent?: number;
  prizes: MiniGamePrize[];
}

export enum GameType {
  Spin = 'SPIN',
  GiftBox = 'GIFTBOX',
  Scratch = 'SCRATCH',
  MatchX = 'MATCHX'
}

export enum MiniGamePrizeType {
  NoPrize = 'NO_PRIZE',
  Points = 'POINTS',
  Bonus = 'BONUS',
  // ... 8 more types
}

export interface PlayResult {
  success: boolean;
  prizeId?: number;
  prizeName?: string;
  prizeType?: MiniGamePrizeType;
  prizeValue?: number;
  errorCode?: string;
  errorMessage?: string;
  updatedGame?: MiniGame;
}
```

#### Step 5.2: Create Service

**File:** `frontend/src/services/miniGameService.ts`

```typescript
const API_BASE_URL = 'http://localhost:5227';

export class MiniGameService {
  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  static async getMiniGames(userId: string): Promise<MiniGame[]> {
    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/api/mini-games?userId=${userId}`
    );

    if (response.success && response.data && response.data.miniGames) {
      return response.data.miniGames;
    }

    throw new Error(response.error || 'Failed to fetch mini games');
  }

  static async playMiniGame(userId: string, gameId: number): Promise<PlayResult> {
    const response = await this.fetchWithAuth(
      `${API_BASE_URL}/api/mini-games/${gameId}/play?userId=${userId}`,
      { method: 'POST' }
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Failed to play mini game');
  }
}
```

#### Step 5.3: Extend SignalR Service

**File:** `frontend/src/services/signalr.ts`

```typescript
export class SignalRService {
  // ... existing methods ...

  onMiniGamePlayed(handler: (game: MiniGame) => void): void {
    if (!this.connection) return;
    this.connection.on('MiniGamePlayed', (game: MiniGame) => {
      console.log('🎮 Mini game played:', game);
      handler(game);
    });
  }

  onMiniGamePrizeWon(handler: (data: { game: MiniGame, prize: MiniGamePrize }) => void): void {
    if (!this.connection) return;
    this.connection.on('MiniGamePrizeWon', (data) => {
      console.log('🎁 Prize won:', data);
      handler(data);
    });
  }
}
```

---

### Phase 6: Frontend UI Components (Week 6-7)

#### Step 6.1: Create MiniGameCard Component

**File:** `frontend/src/components/MiniGameCard.tsx`

```typescript
interface MiniGameCardProps {
  game: MiniGame;
  onPlay: (gameId: number) => void;
  isLoading: boolean;
}

export function MiniGameCard({ game, onPlay, isLoading }: MiniGameCardProps) {
  const canPlay = game.spinCount && game.spinCount > 0;
  const onCooldown = game.nextAvailableSpinTs && game.nextAvailableSpinTs > Date.now();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <img src={game.thumbnail} alt={game.name} className="w-full h-40 object-cover rounded" />
      <h3 className="text-xl font-bold mt-4">{game.name}</h3>
      <p className="text-gray-600 text-sm mt-2">{game.description}</p>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Buy-in:</span>
          <span className="text-sm font-medium">{formatBuyIn(game)}</span>
        </div>

        {game.jackpotCurrent && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Jackpot:</span>
            <span className="text-sm font-bold text-yellow-600">${game.jackpotCurrent}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onPlay(game.id)}
        disabled={!canPlay || onCooldown || isLoading}
        className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Playing...' : onCooldown ? `Cooldown: ${formatCooldown(game.nextAvailableSpinTs)}` : 'Play Now'}
      </button>
    </div>
  );
}
```

#### Step 6.2: Create MiniGameList Component

**File:** `frontend/src/components/MiniGameList.tsx`

```typescript
export function MiniGameList({ userId }: { userId: string }) {
  const [games, setGames] = useState<MiniGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingGameId, setPlayingGameId] = useState<number | null>(null);

  useEffect(() => {
    loadGames();

    // Subscribe to SignalR events
    signalRService.onMiniGamePlayed((game) => {
      setGames((prev) => prev.map((g) => (g.id === game.id ? game : g)));
    });

    signalRService.onMiniGamePrizeWon(({ game, prize }) => {
      alert(`You won ${prize.name}!`);
      setGames((prev) => prev.map((g) => (g.id === game.id ? game : g)));
    });
  }, [userId]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await MiniGameService.getMiniGames(userId);
      setGames(data);
    } catch (err) {
      console.error('Failed to load mini games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (gameId: number) => {
    try {
      setPlayingGameId(gameId);
      const result = await MiniGameService.playMiniGame(userId, gameId);

      if (result.success) {
        console.log('Play result:', result);
        await loadGames(); // Refresh list
      } else {
        alert(result.errorMessage || 'Failed to play game');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to play game');
    } finally {
      setPlayingGameId(null);
    }
  };

  if (loading) {
    return <div>Loading mini games...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <MiniGameCard
          key={game.id}
          game={game}
          onPlay={handlePlay}
          isLoading={playingGameId === game.id}
        />
      ))}
    </div>
  );
}
```

#### Step 6.3: Run Frontend

```bash
cd frontend
npm install
npm run dev

# Expected output:
#   VITE v5.x.x  ready in 300 ms
#
#   ➜  Local:   http://localhost:5173/
```

---

## Testing Guide

### Unit Tests

```bash
# Backend unit tests
cd backend/tests/Smartico.Missions.Domain.Tests
dotnet test

cd ../Smartico.Missions.Application.Tests
dotnet test

# Frontend unit tests
cd frontend
npm test
```

### Integration Tests

```bash
# Backend integration tests (WebApplicationFactory)
cd backend/tests/Smartico.Missions.Api.IntegrationTests
dotnet test
```

### Manual Testing Checklist

- [ ] **GET /api/mini-games** returns 5 demo games
- [ ] **POST /api/mini-games/1/play** returns prize result
- [ ] Cache hit time < 10ms (check logs)
- [ ] SignalR events received in frontend console
- [ ] Cooldown timer displayed correctly
- [ ] Jackpot amount updates after play
- [ ] Prize pool depletes after wins
- [ ] Error messages user-friendly

---

## Common Issues & Troubleshooting

### Issue: Backend won't start

**Symptoms:** Port 5227 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :5227
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5227 | xargs kill -9
```

### Issue: Frontend can't connect to backend

**Symptoms:** CORS error in browser console

**Solution:** Check `appsettings.json`:
```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
  }
}
```

### Issue: SignalR connection fails

**Symptoms:** "Failed to start connection" in console

**Solution:**
1. Verify backend is running on `http://localhost:5227`
2. Check browser network tab for 101 Switching Protocols
3. Restart frontend dev server

### Issue: Cache not invalidating

**Symptoms:** Stale game data after play

**Solution:** Check logs for cache removal:
```
[DEBUG] Cache invalidation for key: minigames:user123
```

---

## Performance Benchmarks

### Backend Targets

```bash
# Load test with k6 (optional)
k6 run specs/003-mini-games/tests/load-test.js

# Expected results:
# GET /api/mini-games:  < 200ms (p95)
# POST /api/mini-games/1/play: < 500ms (p95)
```

### Frontend Targets

```bash
# Lighthouse audit
npm run build
npx lighthouse http://localhost:5173 --view

# Expected scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
```

---

## Next Steps

1. ✅ **Phase 0-1 Complete**: Domain entities and design documents ready
2. ⏭️ **Implement Backend**: Follow phases 2-4 (CQRS handlers, infrastructure, controller)
3. ⏭️ **Implement Frontend**: Follow phases 5-6 (services, components)
4. ⏭️ **Write Tests**: Achieve 80%+ coverage
5. ⏭️ **Integration Testing**: E2E tests for critical flows
6. ⏭️ **Demo & Review**: Present MVP to stakeholders

---

**Questions?** Refer to:
- [spec.md](./spec.md) - Feature requirements
- [plan.md](./plan.md) - Implementation phases
- [research/research.md](./research/research.md) - Technology decisions
- [design/data-model.md](./design/data-model.md) - Entity definitions
- [contracts/minigames-api.yaml](./contracts/minigames-api.yaml) - API specification

**Happy Coding!** 🚀
