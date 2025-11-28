# Back Office Campaign Management - Bonus-Mission Integration Tasks

**Feature:** Bonus-Mission Linked Flow (FR-2 Enhancement)
**Epic:** 002-back-office-campaign-management
**Created:** 2025-01-25
**Last Updated:** 2025-01-25
**Owner:** Development Team
**Status:** Planning

---

## Feature Overview

This document tracks the implementation of **Linked Bonus-Mission Flow**, which enables operators to:
- Create bonus campaigns (e.g., free spins via gift code) that deliver value to players
- Link bonuses to missions that track wagering/turnover requirements
- Release bonus winnings only after mission completion (turnover met)

### Business Use Case

**Scenario: Free Spins with Turnover Requirement**
1. Operator creates a **FreeSpins Bonus** with gift code `WELCOME50`
2. Player enters gift code → receives 50 free spins on eligible games
3. Player plays free spins → wins $200 (goes to **Locked Balance**)
4. System auto-creates linked **Mission**: "Wager 5x on eligible games"
5. Player wagers on eligible games → progress tracked (e.g., $400/$1000)
6. Player completes 5x turnover ($1000 wagered)
7. Mission completes → $200 released from Locked Balance to Real Balance

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  BONUS (FreeSpins)                                              │
│  - Gift code: WELCOME50                                         │
│  - 50 free spins on eligible games                              │
│  - Winnings go to: Locked Balance                               │
│  - Linked Mission ID: [auto-generated]                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │ triggers on activation
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  MISSION (Turnover Requirement)                                 │
│  - Trigger: BonusActivated (linked bonus)                       │
│  - Goal: WageredAmount (5x of locked balance)                   │
│  - Eligible Games: [same as bonus]                              │
│  - Reward: ReleaseLockedBalance                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task Format

```
- [ ] T### [Priority] Description (file path)
```

**Priority Levels:**
- **P0**: Critical (blocking, security, data integrity)
- **P1**: High (core features, user-facing)
- **P2**: Medium (enhancements, non-blocking)
- **P3**: Low (nice-to-have, optimizations)

---

## Phase 1: Domain Model Updates (Backend)

### 1.1 Bonus Entity Updates

- [ ] T701 [P0] Add LinkedMissionId to Bonus entity
  - File: `Domain/Entities/Bonus.cs`
  - Add: `ObjectId? LinkedMissionId` - Reference to auto-created mission
  - Add: `WinningsDestination` enum (RealBalance, LockedBalance)
  - Update BsonElement attributes

- [ ] T702 [P0] Create WinningsDestination enum
  - File: `Domain/Entities/Bonus.cs` or `Domain/ValueObjects/BonusConfig.cs`
  ```csharp
  public enum WinningsDestination
  {
      RealBalance,    // Winnings go directly to withdrawable balance
      LockedBalance   // Winnings locked until mission complete
  }
  ```

- [ ] T703 [P1] Add TurnoverRequirement to Bonus config
  - File: `Domain/ValueObjects/BonusConfig.cs`
  - Add: `TurnoverConfig? TurnoverRequirement`
  ```csharp
  public record TurnoverConfig
  {
      public decimal Multiplier { get; init; }           // e.g., 5x
      public TurnoverBasis Basis { get; init; }          // WinningsAmount or FixedAmount
      public decimal? FixedAmount { get; init; }         // If Basis is FixedAmount
      public List<string> EligibleGames { get; init; }   // Games that count toward turnover
  }

  public enum TurnoverBasis
  {
      WinningsAmount,  // Turnover = Multiplier × Winnings from bonus
      FixedAmount      // Turnover = Multiplier × FixedAmount
  }
  ```

### 1.2 Mission Entity Updates

- [ ] T704 [P0] Add new TriggerType: BonusActivated
  - File: `Domain/ValueObjects/MissionRule.cs`
  - Add to TriggerType enum:
  ```csharp
  BonusActivated  // Mission triggers when linked bonus is activated
  ```

- [ ] T705 [P0] Add LinkedBonusId to Mission trigger data
  - File: `Domain/ValueObjects/MissionRule.cs`
  - Add to NodeData and TriggerCondition:
  ```csharp
  [BsonElement("linkedBonusId")]
  [BsonRepresentation(BsonType.ObjectId)]
  public ObjectId? LinkedBonusId { get; init; }
  ```

- [ ] T706 [P0] Add new GoalType: TurnoverAmount
  - File: `Domain/ValueObjects/MissionRule.cs`
  - Add to GoalType enum:
  ```csharp
  TurnoverAmount  // Player must wager X amount on eligible games
  ```
  - Add to GoalStep:
  ```csharp
  [BsonElement("turnoverMultiplier")]
  public decimal? TurnoverMultiplier { get; init; }  // e.g., 5x

  [BsonElement("eligibleGames")]
  public List<string>? EligibleGames { get; init; }
  ```

- [ ] T707 [P0] Add new RewardType: ReleaseLockedBalance
  - File: `Domain/ValueObjects/MissionRule.cs`
  - Add to RewardType enum:
  ```csharp
  ReleaseLockedBalance  // Release player's locked balance to real balance
  ```

- [ ] T708 [P1] Add MissionSource to track origin
  - File: `Domain/Entities/Mission.cs`
  - Add:
  ```csharp
  [BsonElement("source")]
  [BsonRepresentation(BsonType.String)]
  public MissionSource Source { get; set; } = MissionSource.Manual;

  [BsonElement("sourceBonusId")]
  [BsonRepresentation(BsonType.ObjectId)]
  public ObjectId? SourceBonusId { get; set; }
  ```
  - Create enum:
  ```csharp
  public enum MissionSource
  {
      Manual,           // Created manually by operator
      BonusLinked       // Auto-generated from bonus
  }
  ```

### 1.3 Database Indexes

- [ ] T709 [P1] Add index for bonus-mission lookup
  - File: `Infrastructure/MongoDbContext.cs`
  - Index: `{ operatorId: 1, linkedMissionId: 1 }`
  - Index: `{ operatorId: 1, sourceBonusId: 1 }`

---

## Phase 2: Application Layer Updates

### 2.1 Bonus Service Updates

- [ ] T710 [P0] Update CreateBonusCommand with turnover config
  - File: `Application/Bonuses/Commands/CreateBonusCommand.cs`
  - Add: `TurnoverConfigDto? TurnoverRequirement`
  - Add: `WinningsDestination WinningsDestination`

- [ ] T711 [P0] Update BonusDto with linked mission info
  - File: `Application/Bonuses/DTOs/BonusDto.cs`
  - Add: `string? LinkedMissionId`
  - Add: `string WinningsDestination`
  - Add: `TurnoverConfigDto? TurnoverRequirement`

- [ ] T712 [P0] Create TurnoverConfigDto
  - File: `Application/Bonuses/DTOs/TurnoverConfigDto.cs`
  ```csharp
  public record TurnoverConfigDto
  {
      public decimal Multiplier { get; init; }
      public string Basis { get; init; }  // "WinningsAmount" or "FixedAmount"
      public decimal? FixedAmount { get; init; }
      public List<string>? EligibleGames { get; init; }
  }
  ```

- [ ] T713 [P1] Update BonusService.CreateAsync to auto-create linked mission
  - File: `Application/Bonuses/Services/BonusService.cs`
  - Logic:
    1. Create bonus
    2. If `WinningsDestination == LockedBalance && TurnoverRequirement != null`:
       - Auto-create Mission with:
         - Trigger: BonusActivated (linkedBonusId = bonus.Id)
         - Goal: TurnoverAmount (multiplier, eligibleGames)
         - Reward: ReleaseLockedBalance
       - Set `bonus.LinkedMissionId = mission.Id`
       - Save both

- [ ] T714 [P1] Update BonusService.UpdateAsync to sync linked mission
  - File: `Application/Bonuses/Services/BonusService.cs`
  - Logic:
    - If turnover config changes, update linked mission
    - If turnover removed, delete linked mission (if Draft status)

- [ ] T715 [P1] Update BonusService.DeleteAsync to cascade delete mission
  - File: `Application/Bonuses/Services/BonusService.cs`
  - Logic: Delete linked mission when bonus deleted (if Draft status)

### 2.2 Validation Updates

- [ ] T716 [P1] Update CreateBonusCommandValidator for turnover config
  - File: `Application/Bonuses/Validators/CreateBonusCommandValidator.cs`
  - Rules:
    - If WinningsDestination == LockedBalance, TurnoverRequirement required
    - TurnoverMultiplier must be > 0
    - If Basis == FixedAmount, FixedAmount required and > 0

---

## Phase 3: API Layer Updates

### 3.1 Controller Updates

- [ ] T717 [P1] Update BonusesController for turnover config
  - File: `Api/Controllers/BonusesController.cs`
  - Ensure CreateBonus and UpdateBonus handle turnover config
  - Add: `GET /api/bonuses/{id}/linked-mission` - Get linked mission details

### 3.2 Request/Response Models

- [ ] T718 [P1] Update CreateBonusRequest with turnover fields
  - File: `Api/Models/Requests/` (if separate from command)
  - Add turnover configuration fields

---

## Phase 4: Frontend Updates

### 4.1 Type Definitions

- [ ] T719 [P1] Update api.types.ts with turnover types
  - File: `frontend/src/services/api.types.ts`
  - Add: `WinningsDestination`, `TurnoverConfig`, `TurnoverBasis`
  - Update: `Bonus` interface with new fields

### 4.2 Bonus Form Updates

- [ ] T720 [P1] Add Turnover Configuration section to CreateBonusPage
  - File: `frontend/src/features/bonuses/pages/CreateBonusPage.tsx`
  - UI sections:
    1. **Winnings Destination** dropdown:
       - "Real Balance (immediately withdrawable)"
       - "Locked Balance (requires turnover)"
    2. **Turnover Requirement** (shown if Locked Balance selected):
       - Multiplier input (e.g., 5x)
       - Basis radio: "Based on winnings" / "Fixed amount"
       - Fixed amount input (if Fixed selected)
       - Eligible games multi-select (optional, defaults to bonus eligible games)

- [ ] T721 [P2] Add visual indicator for linked mission
  - File: `frontend/src/features/bonuses/pages/CreateBonusPage.tsx`
  - Show info box: "A turnover mission will be automatically created"
  - After save, show link to view/edit the linked mission

### 4.3 Bonus List Updates

- [ ] T722 [P2] Show linked mission indicator in BonusList
  - File: `frontend/src/features/bonuses/components/BonusList.tsx`
  - Add column or badge showing "Has Turnover Mission"
  - Click to navigate to linked mission

### 4.4 Mission Form Updates

- [ ] T723 [P2] Show "Bonus-Linked" badge on missions
  - File: `frontend/src/features/missions/pages/MissionsPage.tsx`
  - Indicate missions created from bonuses
  - Show link back to source bonus

- [ ] T724 [P2] Restrict editing of bonus-linked missions
  - File: `frontend/src/features/missions/pages/CreateMissionPage.tsx`
  - If mission.source == "BonusLinked":
    - Show warning: "This mission is linked to a bonus. Edit the bonus to change turnover settings."
    - Disable key fields (trigger, goal, reward)
    - Allow editing name, description only

---

## Phase 5: Testing

### 5.1 Unit Tests

- [ ] T725 [P0] Unit tests for BonusService auto-mission creation
  - File: `tests/Application.Tests/Bonuses/BonusServiceTests.cs`
  - Test: `Should_CreateLinkedMission_When_LockedBalanceSelected`
  - Test: `Should_NotCreateMission_When_RealBalanceSelected`
  - Test: `Should_UpdateLinkedMission_When_TurnoverConfigChanges`
  - Test: `Should_DeleteLinkedMission_When_BonusDeleted`

- [ ] T726 [P0] Unit tests for turnover validation
  - File: `tests/Application.Tests/Bonuses/CreateBonusCommandValidatorTests.cs`
  - Test: `Should_RequireTurnover_When_LockedBalanceSelected`
  - Test: `Should_RequireFixedAmount_When_BasisIsFixedAmount`

### 5.2 Integration Tests

- [ ] T727 [P1] Integration tests for bonus-mission flow
  - File: `tests/Integration.Tests/BonusMissionIntegrationTests.cs`
  - Test: `Should_CreateBonusAndMission_When_TurnoverConfigured`
  - Test: `Should_LinkMissionToBonus_Correctly`
  - Test: `Should_CascadeDelete_When_BonusDeleted`

---

## Phase 6: Documentation

- [ ] T728 [P2] Update API documentation for turnover config
  - Swagger annotations for new DTOs
  - Example requests/responses

- [ ] T729 [P3] Add user guide for turnover configuration
  - How to set up free spins with turnover
  - Explanation of locked balance flow

---

## Progress Summary

**Overall Progress:** 20/29 tasks (69%)

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Domain Model | ✅ Completed | 9/9 (100%) |
| Phase 2: Application Layer | ✅ Completed | 7/7 (100%) |
| Phase 3: API Layer | ✅ Completed | 2/2 (100%) |
| Phase 4: Frontend | ✅ Completed | 6/6 (100%) |
| Phase 5: Testing | ⚠️ Not Started | 0/3 (0%) |
| Phase 6: Documentation | ⚠️ Not Started | 0/2 (0%) |

---

## Dependencies

- Bonus entity and service already implemented ✅
- Mission entity and service already implemented ✅
- Visual rule builder already implemented ✅

---

## Notes

### Simplification from Original Wagering Requirement

The current Bonus entity has a complex `WageringRequirement` with:
- Multiplier, AppliesTo, MaxWinFromBonus, ContributionRules

For the linked mission flow, we're adding a simpler `TurnoverRequirement` specifically for tracking post-bonus-activation wagering. The existing `WageringRequirement` remains for traditional bonus wagering (if needed).

**Key Difference:**
- `WageringRequirement`: Traditional casino bonus wagering before withdrawal
- `TurnoverRequirement`: Mission-based turnover to release locked winnings

### Future Enhancements

1. **Progress Widget**: Show turnover progress in player-facing widget
2. **Partial Release**: Allow partial release at milestones (e.g., 50% at 3x)
3. **Time Limits**: Mission expires if turnover not met within X days
4. **Multiple Bonuses**: Support multiple bonuses contributing to same mission

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-25 | Initial task breakdown for Bonus-Mission Integration |

---

**Last Updated:** 2025-11-25
**Status:** Core Implementation Complete (Phases 1-4)
**Next Review:** Testing Phase
**Owner:** Development Team
