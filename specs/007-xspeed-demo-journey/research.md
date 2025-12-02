# xSpeed Demo Journey - Research

## Summary

This document captures research findings for implementing the xSpeed Demo Journey APIs feature.

---

## Research Topic 1: Mission Level Gating

### Question
How can missions be restricted to specific player levels (e.g., Daily Driver requires Level 1+, Table Tactician requires Level 3+)?

### Investigation
Examined existing mission creation in `DemoScenarioService.cs`:
- `CreateMissionCommand` uses `TargetSegment` for player filtering (`AllPlayers`, `VipOnly`)
- Current segments: `AllPlayers`, `VipOnly`, `NewPlayers`, `InactivePlayers`

### Decision
**Use `TargetSegment` with level-based segments** or **extend MissionTask with level requirement**.

Looking at the mission structure:
```csharp
public PlayerSegment TargetSegment { get; set; }
```

For xSpeed, we have two options:

1. **Option A: Add new PlayerSegments** (requires enum extension):
   - `Level1Plus`, `Level2Plus`, `Level3Plus`, `Level4Plus`

2. **Option B: Use Mission Prerequisites** (if supported):
   - Missions can depend on other missions or achievements

3. **Option C: For Demo - Use Description** (simplest):
   - Set `TargetSegment = AllPlayers`
   - Add level requirement to description: "Requires Level 2+"
   - Actual enforcement would be in production code

### Rationale
For the demo API, **Option C (description-based)** is sufficient. The demo shows the concept; actual level enforcement would be implemented in the player-facing API. This avoids schema changes and keeps the demo focused.

### Alternatives Considered
- Extending `PlayerSegment` enum - more invasive, requires DB migration
- Mission prerequisites - not yet implemented in the system

---

## Research Topic 2: Jackpot Trigger Types for xSpeed

### Question
What jackpot trigger types are available to implement xSpeed's Hourly/Daily/Mega jackpots?

### Investigation
Examined `DemoScenarioService.cs` jackpot creation:

```csharp
TriggerCondition = new JackpotTriggerConditionDto
{
    TriggerType = JackpotTriggerType.TimeBased,
    TimeInterval = JackpotTimeInterval.Hourly
}
```

Available trigger types:
- `JackpotTriggerType.Random` - Probability-based
- `JackpotTriggerType.TimeBased` - Time-based with intervals (Hourly, Daily)
- `JackpotTriggerType.AmountBased` - Triggers at specific amount

Available time intervals:
- `JackpotTimeInterval.Hourly`
- `JackpotTimeInterval.Daily`

### Decision
**Map xSpeed jackpots to existing trigger types:**

| xSpeed Jackpot | Trigger Type | Configuration |
|---------------|--------------|---------------|
| Hourly Prize Drop | `TimeBased` | `Hourly` interval |
| Daily Pot | `TimeBased` | `Daily` interval, `TimeOfDay = "20:00"` |
| Mega Pot | `AmountBased` | `TriggerAmount = 50000` |

### Rationale
Existing trigger types fully support xSpeed requirements. No schema changes needed.

---

## Research Topic 3: Velocity Tier Implementation

### Question
How should the 4 Velocity Tiers (Ignition, Cruiser, Turbo, Supersonic) be represented?

### Investigation
Velocity Tiers are a progression/level system:
- Tier 1: Ignition (0 XP)
- Tier 2: Cruiser (500 XP)
- Tier 3: Turbo (5,000 XP)
- Tier 4: Supersonic (25,000 XP)

Current system has:
- Player levels (existing feature via 004-player-level spec)
- Badges that can represent tier achievements

### Decision
**Represent tiers using Badge Series for achievement tracking:**

1. Create "Velocity Tier" badge series with 4 badges
2. Each badge represents reaching that tier
3. Tier XP thresholds are documented but enforced by player progression system

For the demo:
- Badges show the tier concept
- Actual XP-based tier unlocking is handled by existing level system

### Rationale
The demo API focuses on content creation. Actual tier progression mechanics are handled by the player progression system (spec 004-player-level). Using badges provides visual representation of tier achievements.

---

## Research Topic 4: Existing Demo Patterns

### Question
What patterns does the existing demo service follow that xSpeed should match?

### Investigation
Examined `DemoScenarioService.cs` patterns:

1. **Scenario Definitions**: Static list with `DemoScenarioDto`
2. **Setup Methods**: Private async methods like `SetupNewGameLaunchMission()`
3. **Switch Cases**: `SetupScenarioAsync()` routes to specific handlers
4. **Entity Creation**: Uses service methods (`_missionService.CreateMissionAsync()`)
5. **Activation**: Optional activation via `activate` parameter
6. **Result Tracking**: `DemoSetupResultDto` with `CreatedEntities` list

### Decision
**Follow exact same patterns for xSpeed:**

```csharp
// Add to _scenarios
new DemoScenarioDto { Id = "xspeed-velocity-program", ... }

// Add setup methods
private async Task SetupXSpeedVelocityProgram(...) { }

// Add switch cases
case "xspeed-velocity-program":
    await SetupXSpeedVelocityProgram(operatorId, result, activate);
    break;
```

### Rationale
Consistency with existing patterns ensures maintainability and predictable behavior.

---

## Research Topic 5: Tournament Support

### Question
Does the demo service support tournament creation for xSpeed's Slot Sprint and High Roller Table Wars?

### Investigation
Searched for tournament creation in `DemoScenarioService.cs`:
- No tournament scenarios currently exist
- No `ITournamentService` dependency injected

However, tournament system exists (spec 003-tournament-system).

### Decision
**Defer tournament creation to future enhancement:**

For MVP xSpeed demo:
- Focus on Missions, Jackpots, Badges
- Document tournaments as "coming soon" in Phase 3

If tournament service becomes available:
1. Add `ITournamentService` dependency
2. Implement `SetupSlotSprintTournament()` and `SetupHighRollerTableWars()`

### Rationale
Core xSpeed demo value is in Velocity Tiers, Missions, and Jackpots. Tournaments can be added as enhancement without blocking initial delivery.

---

## Technical Clarifications Resolved

| Item | Resolution |
|------|------------|
| Mission level gating | Use description-based requirements for demo |
| Jackpot triggers | Existing TimeBased/AmountBased types support xSpeed |
| Velocity Tiers | Represent as Badge Series with tier badges |
| Demo patterns | Follow existing DemoScenarioService patterns |
| Tournaments | Defer to future enhancement |

---

## Open Items

None - all technical clarifications resolved.

---

*Generated with [Claude Code](https://claude.com/claude-code)*
