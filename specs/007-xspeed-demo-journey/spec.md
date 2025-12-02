# Feature Specification: xSpeed Demo Journey APIs

**Version**: 1.0
**Status**: Draft
**Created**: 2025-12-02
**Last Updated**: 2025-12-02

---

## Overview

### Feature Name
xSpeed Demo Journey APIs

### Brief Description
Extend the existing backoffice Demo API to setup the complete xSpeed "Velocity Program" gamification journey. This feature adds new demo scenarios that create the full xSpeed configuration including: Velocity Tiers (level system), tiered missions (Daily Driver, Explorer, Table Tactician), tournaments (Slot Sprint, High Roller Table Wars), and the xSpeed Mystery Drop jackpots (Hourly Prize Drop, Daily Pot, Mega Pot).

### Problem Statement
The current Demo API (`DemoController`) provides generic gamification setup scenarios. xSpeed, a specific operator, requires a tailored demo journey based on their "Velocity Program" specification. Creating this journey manually through the backoffice UI is time-consuming and error-prone. A single API call should setup the entire xSpeed-specific gamification configuration.

### Goals & Objectives
- Provide single-API setup for complete xSpeed "Velocity Program"
- Create Velocity Tiers (Ignition, Cruiser, Turbo, Supersonic) level system
- Setup tiered missions unlocked by player level progression
- Configure xSpeed Mystery Drop jackpot system with 3 tiers
- Support phased rollout (Phase 1, Phase 2, Phase 3) demo scenarios
- Maintain consistency with existing Demo API patterns

---

## User Scenarios & Testing

### Primary User Scenarios

#### Scenario 1: Setup Complete xSpeed Journey
**Actor**: Demo Operator setting up xSpeed showcase

**Preconditions**:
- Backoffice API is running
- Operator context is established (default demo operator)

**Steps**:
1. Operator calls `POST /api/demo/setup/xspeed-velocity-program?activate=true`
2. System creates all xSpeed entities:
   - 4 Velocity Tiers (level configuration)
   - 4 Missions (Daily Driver, Explorer, Table Tactician, Whale Challenge)
   - 2 Tournaments (Slot Sprint, High Roller Table Wars)
   - 3 Jackpots (Hourly Prize Drop, Daily Pot, Mega Pot)
   - 4 Badges (Velocity Tier achievement badges)
3. All entities are activated and visible in player dashboard
4. Response returns summary of created entities

**Expected Outcome**:
- Player dashboard shows all xSpeed gamification features
- Missions are level-gated (Level 1+, Level 2+, Level 3+, Level 4+)
- Jackpots display with correct temperature and contribution rates

#### Scenario 2: Phase 1 Soft Launch Setup
**Actor**: Demo Operator testing Phase 1 rollout

**Preconditions**:
- Operator wants to demonstrate Phase 1 features only

**Steps**:
1. Operator calls `POST /api/demo/setup/xspeed-phase-1?activate=true`
2. System creates Phase 1 entities only:
   - Levels 1-2 (Ignition, Cruiser)
   - Daily Driver mission (Slots only)
3. Response shows Phase 1 summary

**Expected Outcome**:
- Only Phase 1 features are available
- Player dashboard shows limited progression system

#### Scenario 3: Progressive Phase Unlock
**Actor**: Demo Operator demonstrating full rollout

**Preconditions**:
- Phase 1 already setup

**Steps**:
1. Operator calls `POST /api/demo/setup/xspeed-phase-2?activate=true`
2. System adds Phase 2 entities:
   - Table Game missions
   - Hourly Drop Jackpot
3. Operator later calls `POST /api/demo/setup/xspeed-phase-3?activate=true`
4. System adds Phase 3 entities:
   - Tournaments
   - Cross-sell missions (Keno/Lottery)

**Expected Outcome**:
- Features progressively unlock as phases are activated
- Dashboard reflects increasing complexity

---

## Functional Requirements

### Core Features

#### F1: xSpeed Velocity Program Setup
System shall provide API endpoint to create complete xSpeed journey.

**Endpoint**: `POST /api/demo/setup/xspeed-velocity-program`

**Query Parameters**:
- `activate` (boolean, default: false): If true, activate all entities immediately

**Created Entities**:

##### Velocity Tiers (Level Configuration)
| Tier | Name | XP Required | Benefit | Risk Control |
|------|------|-------------|---------|--------------|
| 1 | Ignition | 0 | Access to Basic Missions | Cap rewards at $5 total value |
| 2 | Cruiser | 500 | Unlocks "Daily Drop" Jackpot | Eligibility: Must have deposited once |
| 3 | Turbo | 5,000 | 1.2x Multiplier on Mission Rewards | Velocity Control: Flag <24h reach |
| 4 | Supersonic | 25,000 | Private VIP Tournament Access | Manual Withdrawal Review enabled |

##### Missions (Level-Gated)
| Mission | Level Req | Task | Reward | Risk Control |
|---------|-----------|------|--------|--------------|
| Daily Driver | 1+ | Login + Wager $50 on any Slot | 10 Free Spins | 1 Claim per 24h, min spin 2s |
| Explorer | 2+ | Play 5 rounds of Keno/Lottery | 50 XP + Badge | Cross-sell promotion |
| Table Tactician | 3+ | Win 5 hands of Blackjack/Baccarat in row | $10 Cash Credit | Min bet $2, flag >80% win rate |
| Whale Challenge | 4+ | Wager $5,000 total | VIP Bonus Package | Weekly VIP mission |

##### Jackpots (xSpeed Mystery Drop)
| Tier | Name | Trigger Type | Trigger Value | Risk Control |
|------|------|--------------|---------------|--------------|
| Hourly | Hourly Prize Drop | Time-Based | Every 60 mins | Must wager >$10 in last 15 mins |
| Daily | Daily Pot | Time-Based | 20:00-22:00 | Prime-time boost |
| Mega | Mega Pot | Amount-Based | Drops at $50,000 | Alert if growth >20% above average |

##### Tournaments
| Track | Name | Target | Mechanic | Risk Control |
|-------|------|--------|----------|--------------|
| A | Slot Sprint | Slot Players | Highest Single Spin Win Multiplier | Score velocity check, manual top 3 review |
| B | High Roller Table Wars | Table VIPs | Total Wager Amount | 10% GGR cap, exclude risk-free bets |

##### Badges (Achievement Series)
| Badge | Level Unlock | Description |
|-------|--------------|-------------|
| Ignition Badge | Level 1 | Welcome to Velocity Program |
| Cruiser Badge | Level 2 | Unlocked second tier |
| Turbo Badge | Level 3 | Power player status |
| Supersonic Badge | Level 4 | Elite VIP achieved |

#### F2: Phased Rollout Scenarios
System shall provide separate endpoints for each phase.

**Phase 1 - Soft Launch** (`POST /api/demo/setup/xspeed-phase-1`)
- Velocity Tiers 1-2 only (Ignition, Cruiser)
- Daily Driver mission only
- Ignition and Cruiser badges

**Phase 2 - Expansion** (`POST /api/demo/setup/xspeed-phase-2`)
- All 4 Velocity Tiers
- Table Game missions (Table Tactician)
- Hourly Prize Drop jackpot
- All 4 tier badges

**Phase 3 - Full Velocity** (`POST /api/demo/setup/xspeed-phase-3`)
- Complete mission set (all 4)
- All 3 jackpots
- Both tournaments
- Cross-sell missions (Explorer)

#### F3: Scenario Discovery
Existing `GET /api/demo/scenarios` shall include xSpeed scenarios.

**New Scenarios**:
```json
[
  {
    "id": "xspeed-velocity-program",
    "name": "xSpeed Velocity Program (Complete)",
    "category": "Complete",
    "description": "Complete xSpeed gamification journey with all tiers, missions, jackpots, tournaments, and badges"
  },
  {
    "id": "xspeed-phase-1",
    "name": "xSpeed Phase 1 (Soft Launch)",
    "category": "Complete",
    "description": "Phase 1: Levels 1-2, Daily Driver mission, basic badges"
  },
  {
    "id": "xspeed-phase-2",
    "name": "xSpeed Phase 2 (Expansion)",
    "category": "Complete",
    "description": "Phase 2: All levels, Table Game missions, Hourly jackpot"
  },
  {
    "id": "xspeed-phase-3",
    "name": "xSpeed Phase 3 (Full Velocity)",
    "category": "Complete",
    "description": "Phase 3: Full journey with tournaments and cross-sell"
  }
]
```

---

## Success Criteria

### Measurable Outcomes

#### Setup Efficiency
- Complete xSpeed journey created in single API call (<5 seconds)
- Phase-specific setup completes in <2 seconds
- Zero manual configuration required after API call

#### Demo Readiness
- Player dashboard displays all xSpeed features immediately after setup
- Missions show correct level requirements
- Jackpots display with correct temperature indicators
- Tournaments visible with registration counts

#### Data Accuracy
- XP thresholds match xSpeed specification exactly
- Mission rewards match specification
- Jackpot trigger values are correct
- Risk control parameters are configured

---

## Key Entities

### xSpeed Scenario Definition
**Purpose**: Defines xSpeed-specific demo scenario configuration

**Attributes**:
- Scenario ID (e.g., "xspeed-velocity-program")
- Name
- Category ("Complete")
- Description
- Phase (1, 2, 3, or null for complete)
- Included Features (missions, jackpots, tournaments, badges, levels)

### Velocity Tier Configuration
**Purpose**: Level progression configuration for xSpeed

**Attributes**:
- Tier Number (1-4)
- Name (Ignition, Cruiser, Turbo, Supersonic)
- XP Required
- Benefit Description
- Risk Control Settings
- Unlocked Features (missions, jackpots)

---

## Dependencies & Constraints

### Dependencies
- Existing `DemoController` and `IDemoScenarioService`
- Existing Mission, Jackpot, Badge, Tournament entity repositories
- Existing Demo Scenario infrastructure
- MongoDB collections (missions, jackpots, badges, tournaments)

### Constraints
- Must follow existing Demo API patterns
- Must integrate with existing `DemoScenarioService`
- Entity creation must use existing repository methods
- Scenario IDs must be unique and follow naming convention

---

## Assumptions

### Technical Assumptions
- Level/Tier system can be configured via Mission prerequisites
- XP generation (1 XP per $10 wagered) is handled by existing progression system
- Tournament functionality exists from previous implementation (003-tournament-system)
- Badge awarding based on level is automated by existing system

### Business Assumptions
- xSpeed specification is final and approved
- Risk control settings are for demonstration only (not enforced in demo)
- Phased rollout mimics production deployment strategy
- All monetary values are in demo/test currency

---

## Scope

### In Scope
- New demo scenario definitions for xSpeed
- API endpoints for xSpeed setup (complete and phased)
- Entity creation for missions, jackpots, tournaments, badges
- Integration with existing Demo API infrastructure
- Level/tier configuration matching xSpeed spec

### Out of Scope
- Actual XP generation mechanics (existing feature)
- Risk control enforcement (demonstration only)
- Player eligibility checks (existing feature)
- Real money/currency handling
- Tournament leaderboard processing (existing feature)
- Jackpot explosion/winner selection (existing feature)

---

## Non-Functional Requirements

### Performance
- Complete xSpeed setup completes in <5 seconds
- Phase setup completes in <2 seconds
- No impact on existing Demo API performance

### Reliability
- Idempotent setup (calling twice doesn't create duplicates)
- Rollback on partial failure
- Clear error messages for missing dependencies

### Maintainability
- xSpeed configuration defined in single location
- Easy to modify tier/mission/jackpot parameters
- Clear separation from generic demo scenarios

---

## Acceptance Criteria

### AC1: Complete xSpeed Setup
**Given** I am authenticated as a demo operator
**When** I call `POST /api/demo/setup/xspeed-velocity-program?activate=true`
**Then** System creates 4 Velocity Tiers, 4 Missions, 3 Jackpots, 2 Tournaments, 4 Badges
**And** All entities are activated
**And** Response shows summary with created entity counts
**And** Setup completes in <5 seconds

### AC2: Phase 1 Setup
**Given** I am authenticated as a demo operator
**When** I call `POST /api/demo/setup/xspeed-phase-1?activate=true`
**Then** System creates Levels 1-2, Daily Driver mission, 2 badges
**And** Only Phase 1 features are visible in dashboard

### AC3: Phase 2 Expansion
**Given** Phase 1 is already set up
**When** I call `POST /api/demo/setup/xspeed-phase-2?activate=true`
**Then** System adds Levels 3-4, Table Tactician mission, Hourly jackpot, 2 more badges
**And** Phase 1 entities remain intact

### AC4: Phase 3 Full Velocity
**Given** Phase 2 is already set up
**When** I call `POST /api/demo/setup/xspeed-phase-3?activate=true`
**Then** System adds remaining missions, jackpots, and tournaments
**And** All phases are now complete

### AC5: Scenario Discovery
**Given** I call `GET /api/demo/scenarios`
**Then** Response includes xspeed-velocity-program, xspeed-phase-1, xspeed-phase-2, xspeed-phase-3
**And** Each scenario has correct name, category, and description

### AC6: Dashboard Display
**Given** xSpeed velocity program is set up
**When** Player opens dashboard
**Then** Missions show level requirements (Level 1+, Level 2+, etc.)
**And** Jackpots show correct names and trigger types
**And** Tournaments are visible with registration option

### AC7: Mission Level Gating
**Given** xSpeed missions are created
**Then** Daily Driver requires Level 1+
**And** Explorer requires Level 2+
**And** Table Tactician requires Level 3+
**And** Whale Challenge requires Level 4+

### AC8: Jackpot Configuration
**Given** xSpeed jackpots are created
**Then** Hourly Prize Drop triggers every 60 minutes
**And** Daily Pot triggers between 20:00-22:00
**And** Mega Pot triggers at $50,000 pool amount

---

## API Endpoints Summary

### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/demo/setup/xspeed-velocity-program` | Setup complete xSpeed journey |
| `POST` | `/api/demo/setup/xspeed-phase-1` | Setup Phase 1 (Soft Launch) |
| `POST` | `/api/demo/setup/xspeed-phase-2` | Setup Phase 2 (Expansion) |
| `POST` | `/api/demo/setup/xspeed-phase-3` | Setup Phase 3 (Full Velocity) |

### Modified Endpoints

| Method | Endpoint | Change |
|--------|----------|--------|
| `GET` | `/api/demo/scenarios` | Include xSpeed scenarios in response |

---

## Implementation Notes

### DemoScenarioService Extension
Add xSpeed scenario handlers in `DemoScenarioService`:

```csharp
// New scenario IDs
private const string XSpeedVelocityProgram = "xspeed-velocity-program";
private const string XSpeedPhase1 = "xspeed-phase-1";
private const string XSpeedPhase2 = "xspeed-phase-2";
private const string XSpeedPhase3 = "xspeed-phase-3";
```

### Configuration Structure
Define xSpeed configuration as reusable data:

```csharp
public static class XSpeedConfiguration
{
    public static readonly VelocityTier[] Tiers = [...];
    public static readonly MissionDefinition[] Missions = [...];
    public static readonly JackpotDefinition[] Jackpots = [...];
    public static readonly TournamentDefinition[] Tournaments = [...];
    public static readonly BadgeDefinition[] Badges = [...];
}
```

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-02 | Claude | Initial draft based on xSpeed Velocity Program specification |

---

*Generated with [Claude Code](https://claude.com/claude-code)*
