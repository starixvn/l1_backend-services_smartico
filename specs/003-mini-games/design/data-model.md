# Mini Games - Data Model

**Created:** 2025-11-08
**Status:** Final
**Phase:** Phase 0 - Research & Design

## Purpose

This document defines all entities, enums, and interfaces for the Mini Games feature. All types map directly to Smartico API structures documented in `smartico-api/docs/`.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        MiniGame                             │
├─────────────────────────────────────────────────────────────┤
│ Id: int                                                     │
│ Name: string                                                │
│ Description: string?                                        │
│ Thumbnail: string?                                          │
│ GameType: GameType                                          │
│ BuyInType: BuyInType                                        │
│ BuyInCostPoints: decimal?                                   │
│ BuyInCostGems: decimal?                                     │
│ BuyInCostDiamonds: decimal?                                 │
│ SpinCount: int?                                             │
│ NextAvailableSpinTs: long?                                  │
│ JackpotCurrent: decimal?                                    │
│ JackpotAddOnAttempt: decimal?                               │
│ MaxNumberOfAttempts: int?                                   │
│ MaxSpinsPeriodMs: long?                                     │
│ ActiveFromDate: long?                                       │
│ ActiveTillDate: long?                                       │
│ Prizes: List<MiniGamePrize>                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 1:N
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     MiniGamePrize                           │
├─────────────────────────────────────────────────────────────┤
│ Id: int                                                     │
│ Name: string                                                │
│ PrizeType: MiniGamePrizeType                                │
│ PrizeValue: decimal?                                        │
│ Icon: string?                                               │
│ Pool: int?                                                  │
│ PoolInitial: int?                                           │
│ WinsCount: int?                                             │
│ AcknowledgeMessage: string?                                 │
│ AcknowledgeDp: string?                                      │
│ AcknowledgeActionTitle: string?                             │
│ OutOfStockMessage: string?                                  │
│ IsSurcharge: bool                                           │
│ HidePrizeFromHistory: bool                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  PlayMiniGameResult                         │
├─────────────────────────────────────────────────────────────┤
│ Success: bool                                               │
│ PrizeId: int?                                               │
│ PrizeName: string?                                          │
│ PrizeType: MiniGamePrizeType?                               │
│ PrizeValue: decimal?                                        │
│ ErrorCode: string?                                          │
│ ErrorMessage: string?                                       │
│ UpdatedGame: MiniGame?                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Domain Entities

### 1.1 MiniGame Entity

**Source:** Maps `TMiniGameTemplate` from Smartico API

**File:** `backend/src/Smartico.Missions.Domain/Entities/MiniGame.cs`

**Properties:**

```csharp
namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a mini game available to users.
/// Maps to TMiniGameTemplate from Smartico API.
/// </summary>
public class MiniGame
{
    /// <summary>
    /// Unique identifier for the mini game template.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Localized name of the mini game.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Localized description of the mini game.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// URL to the game's thumbnail image.
    /// </summary>
    public string? Thumbnail { get; init; }

    /// <summary>
    /// Type of game (Spin, GiftBox, Scratch, MatchX).
    /// </summary>
    public required GameType GameType { get; init; }

    /// <summary>
    /// Buy-in requirement type (Free, Points, Gems, Diamonds, Spin).
    /// </summary>
    public required BuyInType BuyInType { get; init; }

    /// <summary>
    /// Cost in points to play (if BuyInType is Points).
    /// </summary>
    public decimal? BuyInCostPoints { get; init; }

    /// <summary>
    /// Cost in gems to play (if BuyInType is Gems).
    /// </summary>
    public decimal? BuyInCostGems { get; init; }

    /// <summary>
    /// Cost in diamonds to play (if BuyInType is Diamonds).
    /// </summary>
    public decimal? BuyInCostDiamonds { get; init; }

    /// <summary>
    /// Current number of spin attempts available to user.
    /// Null if unlimited or not applicable.
    /// </summary>
    public int? SpinCount { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when next play is available.
    /// Null if no cooldown active.
    /// </summary>
    public long? NextAvailableSpinTs { get; init; }

    /// <summary>
    /// Current jackpot amount (if game has jackpot).
    /// </summary>
    public decimal? JackpotCurrent { get; init; }

    /// <summary>
    /// Amount added to jackpot on each play attempt.
    /// </summary>
    public decimal? JackpotAddOnAttempt { get; init; }

    /// <summary>
    /// Maximum number of attempts allowed per period.
    /// Null if unlimited.
    /// </summary>
    public int? MaxNumberOfAttempts { get; init; }

    /// <summary>
    /// Period duration in milliseconds for attempt limits.
    /// </summary>
    public long? MaxSpinsPeriodMs { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when game becomes available.
    /// Null if always available.
    /// </summary>
    public long? ActiveFromDate { get; init; }

    /// <summary>
    /// Unix timestamp (milliseconds) when game becomes unavailable.
    /// Null if no expiration.
    /// </summary>
    public long? ActiveTillDate { get; init; }

    /// <summary>
    /// List of prizes available in this mini game.
    /// </summary>
    public required List<MiniGamePrize> Prizes { get; init; }

    /// <summary>
    /// Checks if the game is currently within its active time window.
    /// </summary>
    public bool IsActive()
    {
        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        if (ActiveFromDate.HasValue && now < ActiveFromDate.Value)
            return false;

        if (ActiveTillDate.HasValue && now > ActiveTillDate.Value)
            return false;

        return true;
    }

    /// <summary>
    /// Checks if the user is on cooldown and cannot play yet.
    /// </summary>
    public bool IsOnCooldown()
    {
        if (!NextAvailableSpinTs.HasValue)
            return false;

        var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        return now < NextAvailableSpinTs.Value;
    }

    /// <summary>
    /// Checks if the user has remaining attempts.
    /// </summary>
    public bool HasAttemptsRemaining()
    {
        if (!SpinCount.HasValue)
            return true; // Unlimited

        return SpinCount.Value > 0;
    }
}
```

**Validation Rules:**
- `Id` must be > 0
- `Name` must not be null or empty
- `Prizes` must contain at least one prize
- If `BuyInType` is Points/Gems/Diamonds, corresponding cost field must be > 0

---

### 1.2 MiniGamePrize Entity

**Source:** Maps `TMiniGamePrize` from Smartico API

**File:** `backend/src/Smartico.Missions.Domain/Entities/MiniGamePrize.cs`

**Properties:**

```csharp
namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents a prize within a mini game.
/// Maps to TMiniGamePrize from Smartico API.
/// </summary>
public class MiniGamePrize
{
    /// <summary>
    /// Unique identifier for the prize.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Display name of the prize.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Type of prize (NO_PRIZE, POINTS, BONUS, etc.).
    /// </summary>
    public required MiniGamePrizeType PrizeType { get; init; }

    /// <summary>
    /// Numeric value of the prize (for POINTS, SPIN, GEMS_AND_DIAMONDS).
    /// Null for prize types without numeric value.
    /// </summary>
    public decimal? PrizeValue { get; init; }

    /// <summary>
    /// URL to the prize icon.
    /// </summary>
    public string? Icon { get; init; }

    /// <summary>
    /// Number of prizes remaining in stock.
    /// Null if unlimited or not tracked.
    /// </summary>
    public int? Pool { get; init; }

    /// <summary>
    /// Initial pool size for reference.
    /// </summary>
    public int? PoolInitial { get; init; }

    /// <summary>
    /// Total number of times this prize has been won.
    /// </summary>
    public int? WinsCount { get; init; }

    /// <summary>
    /// Message displayed when user wins this prize.
    /// </summary>
    public string? AcknowledgeMessage { get; init; }

    /// <summary>
    /// Deep link URL for action button (e.g., "Go to Bonuses").
    /// </summary>
    public string? AcknowledgeDp { get; init; }

    /// <summary>
    /// Text for action button (e.g., "Claim Now").
    /// </summary>
    public string? AcknowledgeActionTitle { get; init; }

    /// <summary>
    /// Message shown when prize pool is depleted.
    /// </summary>
    public string? OutOfStockMessage { get; init; }

    /// <summary>
    /// If true, prize is always available regardless of pool count.
    /// </summary>
    public required bool IsSurcharge { get; init; }

    /// <summary>
    /// If true, hide this prize from user's prize history.
    /// </summary>
    public required bool HidePrizeFromHistory { get; init; }

    /// <summary>
    /// Checks if the prize is available (in stock or surcharge).
    /// </summary>
    public bool IsAvailable()
    {
        if (IsSurcharge)
            return true;

        if (!Pool.HasValue)
            return true; // Unlimited

        return Pool.Value > 0;
    }
}
```

**Validation Rules:**
- `Id` must be > 0
- `Name` must not be null or empty
- `PrizeValue` required for POINTS, SPIN, GEMS_AND_DIAMONDS types
- If `Pool` is 0 and `IsSurcharge` is false, prize cannot be won

---

### 1.3 PlayMiniGameResult Entity

**Source:** Maps `TMiniGamePlayResult` from Smartico API + additional response data

**File:** `backend/src/Smartico.Missions.Domain/Entities/PlayMiniGameResult.cs`

**Properties:**

```csharp
namespace Smartico.Missions.Domain.Entities;

/// <summary>
/// Represents the result of playing a mini game.
/// Returned by PlayMiniGameCommand.
/// </summary>
public record PlayMiniGameResult(
    /// <summary>
    /// Whether the play was successful.
    /// </summary>
    bool Success,

    /// <summary>
    /// ID of the prize won (null if no prize or error).
    /// </summary>
    int? PrizeId = null,

    /// <summary>
    /// Name of the prize won (for UI display).
    /// </summary>
    string? PrizeName = null,

    /// <summary>
    /// Type of prize won.
    /// </summary>
    MiniGamePrizeType? PrizeType = null,

    /// <summary>
    /// Numeric value of the prize (if applicable).
    /// </summary>
    decimal? PrizeValue = null,

    /// <summary>
    /// Error code if play failed (e.g., "INSUFFICIENT_BALANCE").
    /// </summary>
    string? ErrorCode = null,

    /// <summary>
    /// User-friendly error message if play failed.
    /// </summary>
    string? ErrorMessage = null,

    /// <summary>
    /// Updated game state after play (with new cooldown, attempts, jackpot).
    /// </summary>
    MiniGame? UpdatedGame = null
);
```

**Validation Rules:**
- If `Success` is true, `PrizeId` must be provided
- If `Success` is false, `ErrorCode` and `ErrorMessage` should be provided
- `UpdatedGame` should always be provided to reflect new state

---

## 2. Enumerations

### 2.1 MiniGamePrizeType Enum

**Source:** Maps `MiniGamePrizeTypeName` from Smartico API

**File:** `backend/src/Smartico.Missions.Domain/Enums/MiniGamePrizeType.cs`

```csharp
namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Types of prizes that can be won in mini games.
/// Maps to MiniGamePrizeTypeName from Smartico API.
/// </summary>
public enum MiniGamePrizeType
{
    /// <summary>
    /// No prize awarded ("Better luck next time").
    /// </summary>
    NoPrize,

    /// <summary>
    /// Gamification points awarded.
    /// </summary>
    Points,

    /// <summary>
    /// Triggers a bonus template.
    /// </summary>
    Bonus,

    /// <summary>
    /// Requires manual operator intervention.
    /// </summary>
    Manual,

    /// <summary>
    /// Additional spin attempts awarded.
    /// </summary>
    Spin,

    /// <summary>
    /// Jackpot prize awarded (resets jackpot).
    /// </summary>
    Jackpot,

    /// <summary>
    /// Triggers level progression.
    /// </summary>
    ChangeLevel,

    /// <summary>
    /// Unlocks a mission for the user.
    /// </summary>
    Mission,

    /// <summary>
    /// Raffle ticket for future drawing.
    /// </summary>
    RaffleTicket,

    /// <summary>
    /// Gems and/or diamonds awarded.
    /// </summary>
    GemsAndDiamonds,

    /// <summary>
    /// Unknown/fallback prize type.
    /// </summary>
    Unknown
}
```

**Smartico API Mapping:**
```
"no-prize"            → NoPrize
"points"              → Points
"bonus"               → Bonus
"manual"              → Manual
"spin"                → Spin
"jackpot"             → Jackpot
"change-level"        → ChangeLevel
"mission"             → Mission
"raffle-ticket"       → RaffleTicket
"gems-and-diamonds"   → GemsAndDiamonds
"unknown"             → Unknown
```

---

### 2.2 GameType Enum

**Source:** Maps `SAWGameTypeName` from Smartico API

**File:** `backend/src/Smartico.Missions.Domain/Enums/GameType.cs`

```csharp
namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Types of mini game mechanics.
/// Maps to SAWGameTypeName from Smartico API.
/// </summary>
public enum GameType
{
    /// <summary>
    /// Spin the Wheel game mechanic.
    /// </summary>
    Spin,

    /// <summary>
    /// Gift Box reveal game mechanic.
    /// </summary>
    GiftBox,

    /// <summary>
    /// Scratch card reveal game mechanic.
    /// </summary>
    Scratch,

    /// <summary>
    /// Match X symbols game mechanic.
    /// </summary>
    MatchX
}
```

**Smartico API Mapping:**
```
"spin"     → Spin
"giftbox"  → GiftBox
"scratch"  → Scratch
"matchx"   → MatchX
```

---

### 2.3 BuyInType Enum

**Source:** Maps `SAWBuyInTypeName` from Smartico API

**File:** `backend/src/Smartico.Missions.Domain/Enums/BuyInType.cs`

```csharp
namespace Smartico.Missions.Domain.Enums;

/// <summary>
/// Types of buy-in requirements for mini games.
/// Maps to SAWBuyInTypeName from Smartico API.
/// </summary>
public enum BuyInType
{
    /// <summary>
    /// Free to play (no cost).
    /// </summary>
    Free,

    /// <summary>
    /// Costs gamification points.
    /// </summary>
    Points,

    /// <summary>
    /// Costs gems currency.
    /// </summary>
    Gems,

    /// <summary>
    /// Costs diamonds currency.
    /// </summary>
    Diamonds,

    /// <summary>
    /// Costs a spin attempt.
    /// </summary>
    Spin
}
```

**Smartico API Mapping:**
```
"free"      → Free
"points"    → Points
"gems"      → Gems
"diamonds"  → Diamonds
"spin"      → Spin
```

---

## 3. Interfaces

### 3.1 ISmarticoMiniGameApiClient Interface

**File:** `backend/src/Smartico.Missions.Domain/Interfaces/ISmarticoMiniGameApiClient.cs`

```csharp
namespace Smartico.Missions.Domain.Interfaces;

/// <summary>
/// Abstraction for Smartico Mini Game API operations.
/// Enables demo data implementation for MVP and real API integration later.
/// </summary>
public interface ISmarticoMiniGameApiClient
{
    /// <summary>
    /// Gets all mini games available to the specified user.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of available mini games with current state.</returns>
    Task<List<MiniGame>> GetMiniGamesAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Plays a mini game and returns the result.
    /// </summary>
    /// <param name="userId">User identifier.</param>
    /// <param name="gameId">Mini game template ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Play result with prize information or error details.</returns>
    Task<PlayMiniGameResult> PlayMiniGameAsync(string userId, int gameId, CancellationToken cancellationToken = default);
}
```

**Implementation Notes:**
- **MVP**: `SmarticoMiniGameApiClient` implements with in-memory demo data
- **Production**: Real implementation calls Smartico REST API
- **Resilience**: Polly policies configured for retry + timeout

---

### 3.2 IProgressBroadcaster Interface (Extension)

**File:** `backend/src/Smartico.Missions.Domain/Interfaces/IProgressBroadcaster.cs` (existing, extend)

**New Methods Added:**

```csharp
public interface IProgressBroadcaster
{
    // ... existing mission/bonus/badge methods ...

    /// <summary>
    /// Broadcasts that a user played a mini game.
    /// </summary>
    Task BroadcastMiniGamePlayedAsync(
        string userId,
        MiniGame game,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a user won a prize in a mini game.
    /// </summary>
    Task BroadcastMiniGamePrizeWonAsync(
        string userId,
        MiniGame game,
        MiniGamePrize prize,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a user won the jackpot.
    /// Sent to all connected clients (global event).
    /// </summary>
    Task BroadcastMiniGameJackpotWonAsync(
        string userId,
        MiniGame game,
        decimal jackpotAmount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a prize pool has been updated.
    /// Sent to all connected clients (global event).
    /// </summary>
    Task BroadcastMiniGamePoolUpdatedAsync(
        int gameId,
        int prizeId,
        int remainingPool,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Broadcasts that a new mini game became available to the user.
    /// </summary>
    Task BroadcastMiniGameAvailableAsync(
        string userId,
        MiniGame game,
        CancellationToken cancellationToken = default);
}
```

**Frontend Event Names:**
- `MiniGamePlayed` - Update attempt counters, cooldown timers
- `MiniGamePrizeWon` - Show win notification, update prize history
- `MiniGameJackpotWon` - Update jackpot display globally, show celebration
- `MiniGamePoolUpdated` - Update prize availability indicators
- `MiniGameAvailable` - Add new game to list

---

## 4. DTOs (Data Transfer Objects)

### 4.1 CQRS Query/Command DTOs

**GetMiniGamesQuery.cs:**
```csharp
public record GetMiniGamesQuery(string UserId) : IRequest<GetMiniGamesResponse>;

public record GetMiniGamesResponse(List<MiniGame> MiniGames);
```

**PlayMiniGameCommand.cs:**
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
```

---

## 5. Validation Rules Summary

### Game Availability Validation

```csharp
public static class MiniGameValidation
{
    public static ValidationResult CanPlay(MiniGame game, string userId)
    {
        if (!game.IsActive())
            return ValidationResult.Error("GAME_NOT_ACTIVE", "This game is not currently available");

        if (game.IsOnCooldown())
            return ValidationResult.Error("COOLDOWN_ACTIVE", $"Next play available in {game.GetCooldownRemaining()}");

        if (!game.HasAttemptsRemaining())
            return ValidationResult.Error("MAX_ATTEMPTS_EXCEEDED", "You've reached the maximum attempts");

        // Check buy-in balance
        switch (game.BuyInType)
        {
            case BuyInType.Points:
                if (userBalance.Points < game.BuyInCostPoints)
                    return ValidationResult.Error("INSUFFICIENT_BALANCE", $"You need {game.BuyInCostPoints - userBalance.Points} more points");
                break;
            // ... similar for Gems, Diamonds, Spin
        }

        return ValidationResult.Success();
    }
}
```

### Prize Selection Logic

```csharp
public static class PrizeSelector
{
    public static MiniGamePrize? SelectPrize(List<MiniGamePrize> prizes)
    {
        // Filter available prizes (pool > 0 or IsSurcharge = true)
        var availablePrizes = prizes.Where(p => p.IsAvailable()).ToList();

        if (!availablePrizes.Any())
            return null; // All prizes depleted

        // Weighted random selection based on probability weights (from Smartico API)
        // Implementation: Use Random.Shared with cumulative probability distribution
        return WeightedRandomSelect(availablePrizes);
    }
}
```

---

## 6. State Transitions

### Game State After Play

```
Before Play:
  SpinCount = 3
  NextAvailableSpinTs = null
  JackpotCurrent = 100

After Play (non-jackpot):
  SpinCount = 2
  NextAvailableSpinTs = UnixTime(now + 6 hours)
  JackpotCurrent = 105 (incremented by JackpotAddOnAttempt)

After Play (jackpot won):
  SpinCount = 2
  NextAvailableSpinTs = UnixTime(now + 6 hours)
  JackpotCurrent = 10 (reset to seed value)
```

### Prize Pool Depletion

```
Before Play:
  Prize { Id: 1, Name: "100 Points", Pool: 1 }

After Play (prize won):
  Prize { Id: 1, Name: "100 Points", Pool: 0 }

Next Play Attempt:
  Prize is skipped in weighted selection (Pool = 0, IsSurcharge = false)
```

---

## 7. Error Codes

| Error Code | HTTP Status | Description | User-Facing Message |
|-----------|-------------|-------------|---------------------|
| `GAME_NOT_FOUND` | 404 | Game ID does not exist | "This game is no longer available" |
| `GAME_NOT_ACTIVE` | 400 | Game outside active time window | "This game is not currently available" |
| `INSUFFICIENT_BALANCE` | 400 | User lacks required points/gems/diamonds | "You need X more [currency] to play" |
| `COOLDOWN_ACTIVE` | 400 | User must wait before next play | "Next play available in X hours Y minutes" |
| `MAX_ATTEMPTS_EXCEEDED` | 400 | User exhausted daily/period attempts | "You've reached the maximum attempts for today" |
| `PRIZE_OUT_OF_STOCK` | 400 | All prizes depleted | "No prizes currently available" |
| `INVALID_USER_ID` | 400 | UserId is null or empty | "Invalid user identifier" |
| `NETWORK_ERROR` | 500 | External API call failed | "Unable to connect. Please try again" |
| `SERVER_ERROR` | 500 | Unexpected server error | "Something went wrong. Please try again later" |

---

## 8. Performance Considerations

### Entity Size

**MiniGame Entity:**
- Typical size: ~2 KB (with 5 prizes)
- Cache efficiency: 500 games cached = ~1 MB memory
- Serialization: JSON.NET handles efficiently

**Caching Strategy:**
- Cache key: `minigames:{userId}`
- TTL: 30 seconds
- Invalidate: On play, on game state change

### Concurrency

**Prize Pool Updates:**
- Use `lock` statement in demo client to prevent race conditions
- Production: Distributed lock (Redis) or optimistic concurrency (ETags)

**Jackpot Updates:**
- Atomic increment: `Interlocked.Add()` for in-memory demo
- Production: Database transaction or atomic update API

---

## Next Steps

1. ✅ **Data Model Complete**: All entities, enums, interfaces defined
2. ⏭️ **Generate API Contracts**: OpenAPI spec for REST endpoints
3. ⏭️ **Implement Domain Entities**: C# code in Domain project
4. ⏭️ **Write Unit Tests**: Test entity validation logic

---

**Status:** Final - Ready for Implementation
**Approvals:** Validated against Smartico API documentation ✅
