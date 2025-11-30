# Back Office Campaign Management - Implementation Tasks

**Epic:** 002-back-office-campaign-management
**Created:** 2025-01-25
**Last Updated:** 2025-01-26
**Owner:** Development Team

---

## Active Features

| Feature | Status | Progress |
|---------|--------|----------|
| FR-4: Jackpot System | ✅ Complete | 100% |
| FR-6: Badge and Achievement System | ✅ Complete | 100% |
| FR-13: User Permission Management | In Progress | Backend 100%, Frontend 80% |
| FR-2.2: Bonus Template System | ✅ Complete | 100% |
| FR-1.1: Mission Reward Integration | ✅ Complete | 100% |

---

# Feature: FR-4 Jackpot System ✅ COMPLETE

## Overview

The Jackpot System allows operators to create progressive and fixed jackpots with multi-tier configurations, various trigger conditions, and flexible prize distribution options.

## Implementation Summary

### Backend (100% Complete)
- **Domain Layer**: Jackpot entity, JackpotTier, JackpotTriggerCondition, JackpotPrizeDistribution value objects
- **Repository**: IJackpotRepository with full CRUD operations
- **Service**: JackpotService with create, update, publish, archive operations
- **DTOs**: Complete DTO layer for API communication
- **Validators**: CreateJackpotCommandValidator with comprehensive validation

### Frontend (100% Complete)
- **List Page**: JackpotsPage with filtering, status badges, tier display
- **Create Page**: CreateJackpotPage with JackpotForm component
- **Edit Page**: EditJackpotPage for draft jackpots
- **Details Page**: JackpotDetailsPage with full tier information
- **Components**: TierBuilder for multi-tier configuration

## Completed Tasks

### J1: Domain Layer ✅
- [x] TJ101 Create Jackpot entity with tiers, triggers, and prize distribution
- [x] TJ102 Create JackpotTier value object with trigger conditions
- [x] TJ103 Create JackpotTriggerCondition with 4 trigger types (Random, ValueBased, TimeBased, AmountBased)
- [x] TJ104 Create JackpotPrizeDistribution with 3 distribution types (WinnerTakesAll, SplitAmongWinners, ProportionalToWager)
- [x] TJ105 Create IJackpotRepository interface
- [x] TJ106 Implement JackpotRepository with MongoDB

### J2: Application Layer ✅
- [x] TJ201 Create JackpotService with CRUD operations
- [x] TJ202 Create JackpotDto and related DTOs
- [x] TJ203 Create CreateJackpotCommand and handler
- [x] TJ204 Create UpdateJackpotCommand and handler
- [x] TJ205 Create PublishJackpotCommand and handler
- [x] TJ206 Create CreateJackpotCommandValidator with comprehensive rules

### J3: API Layer ✅
- [x] TJ301 Create JackpotsController with full CRUD endpoints
- [x] TJ302 Add publish/archive endpoints
- [x] TJ303 Register services in DI container

### J4: Frontend ✅
- [x] TJ401 Add Jackpot types to api.types.ts
- [x] TJ402 Create jackpotApi.ts service
- [x] TJ403 Create JackpotsPage (list view)
- [x] TJ404 Create CreateJackpotPage with form
- [x] TJ405 Create EditJackpotPage
- [x] TJ406 Create JackpotDetailsPage
- [x] TJ407 Create JackpotForm component
- [x] TJ408 Create TierBuilder component
- [x] TJ409 Create jackpotSchema.ts with Zod validation
- [x] TJ410 Add routes to App.tsx
- [x] TJ411 Add Jackpots to navigation

## Features Implemented

### Jackpot Types
- **Progressive**: Grows from bet contributions (configurable contribution rate per tier)
- **Fixed**: Static prize amounts

### Trigger Types
- **Random**: Probability-based trigger on each qualifying bet
- **Value-Based**: Triggered when bet amount meets threshold
- **Time-Based**: Scheduled drops (hourly, daily, weekly)
- **Amount-Based**: Must-drop when jackpot reaches target amount

### Prize Distribution Types
- **Winner Takes All**: Single winner gets entire prize
- **Split Among Winners**: Fixed percentage split (custom or equal)
- **Proportional to Wager**: Prize distributed based on player betting volume
  - Max Winners configuration
  - Minimum Wager to Qualify
  - Max Percentage Per Player (cap to prevent monopoly)

### Multi-Tier Support
- Multiple tiers per jackpot (Mini, Minor, Major, Grand)
- Independent configuration per tier
- Display order control
- Seed amounts and max value caps

### Additional Features
- Eligible games filtering
- Schedule configuration (start/end dates)
- Reset behavior (ResetToSeed, ResetToZero, KeepRemainder)
- Status workflow (Draft → Active → Paused → Completed → Archived)
- Currency support

---

# Feature: FR-2.2 Bonus Template System (REVISED)

## Overview

**Previous Understanding (Incorrect):**
- Bonus creates linked mission for turnover tracking
- Bonus → Mission relationship

**Revised Understanding (Correct):**
- Bonus is a **template** that defines reward calculation rules
- Bonuses can have **dynamic calculations** based on player activity
- Mission reward nodes **reference bonus templates** to issue rewards
- Mission → Bonus relationship
- External platforms (casino/sportsbook) execute actual bonus wagering

## Bonus Template Concept

A bonus is a **reusable template** that defines:
1. **Reward Type**: Free spins, cash bonus, points
2. **Calculation Rules**: Fixed amount OR dynamic based on player activity
3. **Limits**: Per-player and global limits
4. **Eligibility**: Player segments, availability windows

### Examples

| Bonus Template | Type | Calculation |
|----------------|------|-------------|
| "Win {x} free spins on {game}" | FreeSpins | x = dynamic based on bet volume |
| "Earn {amount}$ for 1000 bets" | CashBonus | amount = 0.01 * total_bet_volume |
| "50 Free Spins Welcome" | FreeSpins | Fixed: 50 spins |

---

## Phase B1: Domain Model Revision ✅ COMPLETE

### B1.1 Remove Incorrect Fields from Bonus Entity ✅ COMPLETE

- [x] TB101 [P0] Remove `linkedMissionId` from Bonus entity
  - File: `Domain/Entities/Bonus.cs`
  - Bonus no longer creates missions

- [x] TB102 [P0] Remove `WinningsDestination` from Bonus entity
  - File: `Domain/Entities/Bonus.cs`
  - External platform handles balance management

- [x] TB103 [P0] Remove `TurnoverConfig` from Bonus entity
  - File: `Domain/ValueObjects/BonusConfig.cs`
  - External platform handles wagering requirements

- [x] TB104 [P0] Remove bonus-mission linking logic from BonusService
  - File: `Application/Bonuses/Services/BonusService.cs`
  - Remove auto-creation of linked missions

### B1.2 Add Bonus Template Features ✅ COMPLETE

- [x] TB105 [P1] Add `BonusCalculationRule` value object
  - File: `Domain/ValueObjects/BonusConfig.cs`
  - Fields:
    - `CalculationType`: Fixed | Dynamic
    - `TieredCalculation`: basedOn, tiers[], defaultValue
    - `Formula`: string (generated from tier config)
    - `MinAmount`: decimal (floor for dynamic)
    - `MaxAmount`: decimal (cap for dynamic)

- [x] TB106 [P1] Add `BonusLimits` value object
  - File: `Domain/ValueObjects/BonusConfig.cs`
  - Fields:
    - `MaxTotalClaims`: int? (global inventory)
    - `MaxClaimsPerPlayer`: int? (lifetime per player)
    - `AmountLimits`: minAmount, maxAmount (CAP)
    - `Approval`: autoApprove, autoApproveThreshold

- [x] TB107 [P1] Add `OperatorBonusLimits` entity
  - File: `Domain/Entities/OperatorBonusLimits.cs`
  - Global limits across all bonuses for an operator

- [x] TB108 [P1] Update Bonus entity with new fields
  - File: `Domain/Entities/Bonus.cs`
  - Simplified to 3 award types: FreeSpins, Cash, Points
  - Add: `CalculationRule`, `Limits`
  - Keep: Basic info, type, schedule

### B1.3 Add Bonus Claim Tracking ✅ COMPLETE

- [x] TB109 [P1] Create `BonusClaim` entity for tracking
  - File: `Domain/Entities/BonusClaim.cs`

- [x] TB110 [P1] Create `IBonusClaimRepository` interface
  - File: `Domain/Repositories/IBonusClaimRepository.cs`

- [x] TB111 [P1] Implement `BonusClaimRepository`
  - File: `Infrastructure/Repositories/BonusClaimRepository.cs`

---

## Phase B2: Application Layer Updates ✅ COMPLETE

### B2.1 Update Commands and DTOs ✅ COMPLETE

- [x] TB201 [P1] Update `CreateBonusCommand` - remove turnover fields
  - File: `Application/Bonuses/Commands/CreateBonusCommand.cs`

- [x] TB202 [P1] Update `UpdateBonusCommand` - remove turnover fields
  - File: `Application/Bonuses/Commands/UpdateBonusCommand.cs`

- [x] TB203 [P1] Add `BonusCalculationRuleDto`
  - Integrated into BonusDto

- [x] TB204 [P1] Add `BonusLimitsDto`
  - Integrated into BonusDto with AmountLimits and Approval settings

- [x] TB205 [P1] Update `BonusDto` with new fields
  - File: `Application/Bonuses/DTOs/BonusDto.cs`

### B2.2 Update Validators ✅ COMPLETE

- [x] TB206 [P1] Update `CreateBonusCommandValidator`
  - File: `Application/Bonuses/Validators/CreateBonusCommandValidator.cs`
  - Removed turnover validation
  - Added calculation rule validation
  - Added limits validation

### B2.3 Add Limit Checking Service ✅ COMPLETE

- [x] TB207 [P1] Create `IBonusLimitService` interface
  - File: `Domain/Services/IBonusLimitService.cs`
  - Methods:
    - `CheckPlayerCanClaimAsync(operatorId, playerId, bonusId, claimValue, currency)`
    - `GetPlayerDailyTotalAsync(operatorId, playerId, currency)`
    - `GetPlayerWeeklyTotalAsync(operatorId, playerId, currency)`
    - `GetPlayerMonthlyTotalAsync(operatorId, playerId, currency)`
    - `GetPlayerRemainingDailyLimitAsync(operatorId, playerId, currency)`
    - `GetPlayerRemainingWeeklyLimitAsync(operatorId, playerId, currency)`
    - `GetPlayerRemainingMonthlyLimitAsync(operatorId, playerId, currency)`
  - Includes `BonusClaimCheckResult` record and `BonusLimitType` enum

- [x] TB208 [P1] Implement `BonusLimitService`
  - File: `Application/Bonuses/Services/BonusLimitService.cs`
  - Checks per-bonus limits (MaxTotalClaims, MaxClaimsPerPlayer, MaxClaimsPerPlayerPerDay/Week/Month, MaxTotalValue)
  - Checks global operator limits (MaxDailyBonusValuePerPlayer, MaxWeeklyBonusValuePerPlayer, MaxMonthlyBonusValuePerPlayer)
  - Returns detailed rejection reasons with limit type, value, and current usage

- [x] TB209 [P1] Create `RecordBonusClaimCommand`
  - File: `Application/Bonuses/Commands/RecordBonusClaimCommand.cs`
  - Includes `RecordBonusClaimResult` for success/failure tracking
  - `RecordBonusClaimCommandHandler` validates limits before recording claim
  - Supports updating claim status after external API response

---

## Phase B3: Frontend Updates ✅ COMPLETE

### B3.1 Update Types ✅ COMPLETE

- [x] TB301 [P1] Update `api.types.ts` - remove turnover types
  - Removed: `WinningsDestination`, `TurnoverConfig`, `WageringRequirement`
  - Added: `BonusCalculationType`, `FormulaVariableType`
  - Added: `BonusCalculationRule`, `BonusLimits`, `BonusAmountLimits`, `BonusApprovalSettings`
  - Simplified BonusType to 3 award types: FreeSpins, Cash, Points

### B3.2 Update Bonus Form ✅ COMPLETE

- [x] TB302 [P1] Remove Winnings Destination section from CreateBonusPage
  - File: `features/bonuses/pages/CreateBonusPage.tsx`
  - Removed wagering requirements entirely

- [x] TB303 [P1] Add Calculation Rules section to CreateBonusPage
  - Fixed vs Tiered toggle with visual cards
  - Tiered: TieredCalculationBuilder with basedOn selector, tier management
  - Example calculations based on award type (spins/pts/$)
  - Min/Max amount fields (moved to Limits section)

- [x] TB304 [P1] Add Limits & Approval section to CreateBonusPage
  - Bonus Amount Limits: min, max (CAP)
  - Claim Limits: max total claims, max per player
  - Approval Settings: auto-approve toggle, threshold for manual approval

### B3.3 Add Operator Settings ✅ COMPLETE

- [x] TB305 [P2] Create GlobalLimitsPage (OperatorBonusSettings)
  - File: `features/bonuses/pages/GlobalLimitsPage.tsx`
  - Configure global limits for operator:
    - Max Daily/Weekly/Monthly Bonus Value Per Player
    - Max Active Bonuses Per Player
    - Currency selection
  - Validation: daily <= weekly <= monthly hierarchy
  - Reset to unlimited option
  - Route: `/bonuses/limits`

---

# Feature: FR-1.1 Mission Reward Integration ✅ COMPLETE

## Overview

Missions now use a **task-based structure** where each task can optionally reward a bonus template when completed. Mission completion awards points (completionPoints).

## Mission Task Structure

| Field | Description |
|-------|-------------|
| `tasks[]` | Array of mission tasks |
| `task.trigger` | What action triggers progress (BetPlaced, DepositMade, etc.) |
| `task.goal` | Target to achieve (BetCount, WageredAmount, etc.) |
| `task.bonusTemplateId` | Optional bonus template to award on task completion |
| `completionPoints` | Points awarded when ALL tasks complete |

---

## Phase M1: Domain Model Updates ✅ COMPLETE

### M1.1 Update Mission Structure ✅ COMPLETE

- [x] TM101 [P1] Add task-based mission structure
  - File: `Domain/Entities/Mission.cs`
  - Added: `MissionTask` with trigger, goal, bonusTemplateId

- [x] TM102 [P1] Add `BONUS_TEMPLATE` RewardType
  - File: `Domain/ValueObjects/MissionRule.cs`
  - Reward nodes can reference bonus templates

- [x] TM103 [P1] Update `NodeData` to include bonus template reference
  - File: `Domain/ValueObjects/MissionRule.cs`
  - Added: `bonusTemplateId`, `bonusTemplateName`

### M1.2 Remove Incorrect Mission Fields ✅ COMPLETE

- [x] TM104 [P0] Remove `MissionSource` enum
  - All missions manually created

- [x] TM105 [P0] Remove `SourceBonusId` from Mission entity

- [x] TM106 [P0] Simplify RewardType to BONUS_TEMPLATE only
  - Points are at mission level (completionPoints)
  - Other rewards via bonus templates

---

## Phase M2: Application Layer Updates ✅ COMPLETE

### M2.1 Update Mission Service ✅ COMPLETE

- [x] TM201 [P1] Update mission structure with tasks
  - MissionService handles task-based missions
  - Tasks have trigger/goal/optional bonus

### M2.2 Update DTOs ✅ COMPLETE

- [x] TM202 [P1] Update DTOs for task-based structure
  - `MissionDto` includes tasks array
  - `MissionTaskDto` with trigger, goal, bonusTemplateId

- [x] TM203 [P1] Update `CreateMissionCommand`
  - Removed source fields
  - Added tasks array

---

## Phase M3: Frontend Updates ✅ COMPLETE

### M3.1 Update Types ✅ COMPLETE

- [x] TM301 [P1] Update `api.types.ts`
  - Added `MissionTask`, `TaskTrigger`, `TaskGoal`
  - Added `bonusTemplateId` to NodeData
  - Simplified RewardType to BONUS_TEMPLATE only

### M3.2 Update Mission Builder ✅ COMPLETE

- [x] TM302 [P1] Create TaskBuilder component
  - File: `features/missions/components/TaskBuilder.tsx`
  - Task-based UI with trigger, goal, bonus template selector

- [x] TM303 [P1] Add Bonus Template selector to tasks
  - Dropdown to select active bonus templates
  - Shows bonus template name in UI

### M3.3 Update Mission Schema ✅ COMPLETE

- [x] TM304 [P1] Update `missionSchema.ts`
  - Task-based validation
  - `bonusTemplateId` validation
  - Removed legacy rule validation

---

# Feature: FR-13 User Role and Permission Management

**Status:** In Progress (Backend 88% Complete, Frontend 0%)

## Feature Overview

This document tracks the implementation of **FR-13: User Role and Permission Management**, which enables operators to:
- Create custom roles with granular permissions
- Assign roles to team members within their operator
- Manage access control for campaign operations
- All functionality is strictly scoped by operator (Casino A's users cannot access Casino B's data)

**Key Architectural Decisions:**
1. **Database-Driven Permissions**: Permissions stored as MongoDB collection (not enum) for scalability
2. **Permission Code Format**: Dotted notation (e.g., `tournaments.view`, `missions.create`)
3. **JWT Claims**: User permissions included in JWT token claims for efficient authorization
4. **Operator Isolation**: All queries automatically filtered by `OperatorId` via BaseRepository pattern

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

## Phase 0: Setup & Configuration ✅ COMPLETE (7/7)

### Infrastructure Setup
- [x] T001 [P0] Create Clean Architecture solution structure
  - `backoffice-api/Smartico.BackOffice.sln`
  - Projects: Api, Application, Domain, Infrastructure

- [x] T002 [P0] Configure C# nullable reference types
  - All `.csproj` files with `<Nullable>enable</Nullable>`

- [x] T003 [P0] Add NuGet packages
  - MongoDB.Driver 3.0+, FluentValidation, xUnit, NSubstitute, FluentAssertions

- [x] T004 [P0] Set up MongoDB connection
  - `Infrastructure/MongoDbContext.cs`

- [x] T005 [P0] Create base repository pattern with OperatorId filtering
  - `Infrastructure/Repositories/BaseRepository.cs`

- [x] T006 [P1] Configure ASP.NET Core Identity + JWT authentication
  - `Api/Program.cs`

- [x] T007 [P1] Create React 19 frontend project
  - `backoffice-frontend/` with TypeScript strict mode

---

## Phase 1: Backend Foundation 🔄 IN PROGRESS (42/47 tasks - 89%)

### 1.1 Domain Layer - Entities ✅ COMPLETE

- [x] T101 [P0] Create Permission entity
  - File: [Domain/Entities/Permission.cs](backoffice-api/src/Smartico.BackOffice.Domain/Entities/Permission.cs)
  - Fields: Id, Code (string), Name, Description, Module, IsSystem, DisplayOrder, CreatedAt, UpdatedAt
  - Permission codes use dotted notation: `"tournaments.view"`, `"missions.create"`

- [x] T102 [P0] Create Role entity
  - File: [Domain/Entities/Role.cs](backoffice-api/src/Smartico.BackOffice.Domain/Entities/Role.cs)
  - Fields: Id, OperatorId, Name, Description, Permissions (List<string>), IsSystem, CreatedAt, UpdatedAt
  - Changed from enum to string array for scalability

- [x] T103 [P0] Update User entity
  - File: [Domain/Entities/User.cs](backoffice-api/src/Smartico.BackOffice.Domain/Entities/User.cs)
  - Fields: Id, OperatorId, Email, FullName, PasswordHash, RoleIds (List<ObjectId>), IsActive, LastLoginAt, CreatedAt, UpdatedAt

### 1.2 Domain Layer - Repositories ✅ COMPLETE

- [x] T104 [P0] Create IPermissionRepository interface
  - File: [Domain/Repositories/IPermissionRepository.cs](backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IPermissionRepository.cs)

- [x] T106 [P0] Create IRoleRepository interface
  - File: [Domain/Repositories/IRoleRepository.cs](backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IRoleRepository.cs)

- [x] T108 [P0] Create IUserRepository interface
  - File: [Domain/Repositories/IUserRepository.cs](backoffice-api/src/Smartico.BackOffice.Domain/Repositories/IUserRepository.cs)

### 1.3 Infrastructure Layer - Repositories ✅ COMPLETE

- [x] T105 [P0] Implement PermissionRepository
  - File: [Infrastructure/Repositories/PermissionRepository.cs](backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/PermissionRepository.cs)

- [x] T107 [P0] Implement RoleRepository
  - File: [Infrastructure/Repositories/RoleRepository.cs](backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/RoleRepository.cs)
  - Inherits BaseRepository<Role> for automatic OperatorId filtering

- [x] T109 [P0] Implement UserRepository
  - File: [Infrastructure/Repositories/UserRepository.cs](backoffice-api/src/Smartico.BackOffice.Infrastructure/Repositories/UserRepository.cs)
  - Includes FindByEmailAsync method for login

### 1.4 Infrastructure Layer - MongoDB Indexes ✅ COMPLETE

- [x] T110 [P0] Create permissions collection indexes
  - Compound index: `{ code: 1, isSystem: 1 }`

- [x] T111 [P0] Create roles collection indexes
  - Compound index: `{ operatorId: 1, isSystem: 1, name: 1 }`

- [x] T112 [P0] Create users collection indexes
  - Unique index: `{ operatorId: 1, email: 1 }`

- [x] T113 [P0] Create users status index
  - Compound index: `{ operatorId: 1, isActive: 1 }`

### 1.5 Application Layer - Services ✅ COMPLETE

- [x] T114 [P1] Create IPermissionService interface
  - File: [Domain/Services/IPermissionService.cs](backoffice-api/src/Smartico.BackOffice.Domain/Services/IPermissionService.cs)
  - Methods: GetAllPermissionsAsync(), GetPermissionByCodeAsync(code), GetPermissionsByModuleAsync(module)

- [x] T115 [P1] Implement PermissionService
  - File: [Application/Services/PermissionService.cs](backoffice-api/src/Smartico.BackOffice.Application/Services/PermissionService.cs)

- [x] T116 [P1] Create PermissionValidator
  - File: [Application/Validators/PermissionValidator.cs](backoffice-api/src/Smartico.BackOffice.Application/Validators/PermissionValidator.cs)

- [x] T117 [P1] Create IRoleService interface
  - File: [Domain/Services/IRoleService.cs](backoffice-api/src/Smartico.BackOffice.Domain/Services/IRoleService.cs)
  - Methods: CreateRoleAsync, UpdateRoleAsync, DeleteRoleAsync, GetRolesByOperatorAsync, GetRoleByIdAsync

- [x] T118 [P1] Implement RoleService
  - File: [Application/Services/RoleService.cs](backoffice-api/src/Smartico.BackOffice.Application/Services/RoleService.cs)
  - Prevents deletion of system roles (isSystem: true)
  - Validates permission codes exist before assigning

- [x] T119 [P1] Create RoleValidator
  - File: [Application/Validators/RoleValidator.cs](backoffice-api/src/Smartico.BackOffice.Application/Validators/RoleValidator.cs)
  - Name required (3-50 chars), Permissions not empty

### 1.6 Application Layer - Auth ✅ COMPLETE

- [x] T120 [P0] Update AuthService with permission claims
  - File: [Application/Auth/Services/AuthService.cs](backoffice-api/src/Smartico.BackOffice.Application/Auth/Services/AuthService.cs)
  - GetUserPermissionsAsync(userId, operatorId) flattens role permissions
  - JWT token includes permission array claims
  - BCrypt password verification

- [x] T121 [P0] Create OperatorContextMiddleware
  - File: [Api/Middleware/OperatorContextMiddleware.cs](backoffice-api/src/Smartico.BackOffice.Api/Middleware/OperatorContextMiddleware.cs)
  - Extracts operatorId from JWT claims
  - Injects into HttpContext.Items

- [x] T122 [P0] Create PermissionAuthorizationHandler
  - File: [Application/Auth/PermissionAuthorizationHandler.cs](backoffice-api/src/Smartico.BackOffice.Application/Auth/PermissionAuthorizationHandler.cs)
  - Checks permission claims in JWT

### 1.7 API Layer - Controllers ✅ COMPLETE (3/3)

- [x] T123 [P1] Create PermissionsController
  - File: [Api/Controllers/PermissionsController.cs](backoffice-api/src/Smartico.BackOffice.Api/Controllers/PermissionsController.cs)
  - `GET /api/permissions` - List all permissions (grouped by module)
  - `GET /api/permissions/modules` - Get list of modules

- [X] T124 [P1] Create RolesController
  - File: [Api/Controllers/RolesController.cs](backoffice-api/src/Smartico.BackOffice.Api/Controllers/RolesController.cs)
  - `GET /api/roles` - List roles for operator
  - `POST /api/roles` - Create role (require "roles.create" permission)
  - `GET /api/roles/{id}` - Get role details
  - `PUT /api/roles/{id}` - Update role (require "roles.edit" permission)
  - `DELETE /api/roles/{id}` - Delete role (require "roles.delete" permission, block system roles)

- [X] T125 [P1] Create UsersController
  - File: [Api/Controllers/UsersController.cs](backoffice-api/src/Smartico.BackOffice.Api/Controllers/UsersController.cs)
  - `GET /api/users` - List users for operator (require "users.view")
  - `POST /api/users` - Create user (require "users.create")
  - `GET /api/users/{id}` - Get user details
  - `PUT /api/users/{id}` - Update user (require "users.edit")
  - `PUT /api/users/{id}/roles` - Assign roles (require "users.manage_roles")
  - `DELETE /api/users/{id}` - Deactivate user (require "users.delete")

### 1.8 API Layer - DTOs & Models ✅ COMPLETE (8/8)

- [X] T126 [P1] Create PermissionDto
  - File: [Api/Models/Dtos/PermissionDto.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Dtos/PermissionDto.cs)

- [X] T127 [P1] Create RoleDto
  - File: [Api/Models/Dtos/RoleDto.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Dtos/RoleDto.cs)

- [X] T128 [P1] Create UserDto
  - File: [Api/Models/Dtos/UserDto.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Dtos/UserDto.cs)

- [X] T129 [P1] Create CreateRoleRequest
  - File: [Api/Models/Requests/CreateRoleRequest.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Requests/CreateRoleRequest.cs)
  - Properties: Name, Description, PermissionCodes (List<string>)

- [X] T130 [P1] Create UpdateRoleRequest
  - File: [Api/Models/Requests/UpdateRoleRequest.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Requests/UpdateRoleRequest.cs)

- [X] T131 [P1] Create CreateUserRequest
  - File: [Api/Models/Requests/CreateUserRequest.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Requests/CreateUserRequest.cs)
  - Properties: Email, FullName, Password, RoleIds (List<string>)

- [X] T132 [P1] Create UpdateUserRequest
  - File: [Api/Models/Requests/UpdateUserRequest.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Requests/UpdateUserRequest.cs)

- [X] T133 [P1] Create AssignRolesRequest
  - File: [Api/Models/Requests/AssignRolesRequest.cs](backoffice-api/src/Smartico.BackOffice.Api/Models/Requests/AssignRolesRequest.cs)
  - Properties: RoleIds (List<string>)

### 1.9 Database Seed Data ✅ COMPLETE

- [x] T134 [P1] Create seed-permissions.json
  - File: [backoffice-api/scripts/seed-permissions.json](backoffice-api/scripts/seed-permissions.json)
  - 23 permissions across 7 modules: Tournaments (5), Missions (5), Users (5), Roles (4), Analytics (2), Settings (1), Audit (1)

- [x] T135 [P1] Create seed-roles.json
  - File: [backoffice-api/scripts/seed-roles.json](backoffice-api/scripts/seed-roles.json)
  - Administrator (all permissions, isSystem: true)
  - Campaign Manager (campaign permissions only, isSystem: false)

- [x] T136 [P1] Create seed-users.json
  - File: [backoffice-api/scripts/seed-users.json](backoffice-api/scripts/seed-users.json)
  - admin@example.com / Admin123! (Administrator role)
  - manager@example.com / Manager123! (Campaign Manager role)

- [x] T137 [P1] Create MongoDB Compass import README
  - File: [backoffice-api/scripts/README.md](backoffice-api/scripts/README.md)
  - Import order: permissions → roles → users

### 1.10 Testing - Backend ⚠️ TODO (0/5)

- [ ] T138 [P0] Unit tests for PermissionService ⚠️ PRIORITY
  - File: `tests/Application.Tests/Services/PermissionServiceTests.cs`
  - Test: `Should_ReturnAllPermissions_When_GetAllPermissionsAsyncCalled`
  - Test: `Should_ReturnPermission_When_ValidCodeProvided`
  - Test: `Should_ThrowException_When_PermissionCodeNotFound`
  - Use NSubstitute for mocking, FluentAssertions for assertions, AAA pattern

- [ ] T139 [P0] Unit tests for RoleService ⚠️ PRIORITY
  - File: `tests/Application.Tests/Services/RoleServiceTests.cs`
  - Test: `Should_CreateRole_When_ValidDataProvided`
  - Test: `Should_PreventDeletion_When_SystemRoleProvided`
  - Test: `Should_ValidatePermissionCodes_When_CreatingRole`
  - Test: `Should_ThrowException_When_UserLacksPermission`

- [ ] T140 [P0] Unit tests for AuthService ⚠️ PRIORITY
  - File: `tests/Application.Tests/Auth/AuthServiceTests.cs`
  - Test: `Should_IncludePermissionsInJWT_When_UserLogsIn`
  - Test: `Should_FlattenRolePermissions_When_UserHasMultipleRoles`

- [ ] T141 [P0] Integration tests for operator isolation ⚠️ PRIORITY
  - File: `tests/Integration.Tests/OperatorIsolationTests.cs`
  - Test: `Should_ReturnOnlyOperatorRoles_When_GetRolesCalledForOperatorA`
  - Test: `Should_Return403_When_OperatorATriesToAccessOperatorBRole`
  - Test: `Should_FilterUsersByOperator_When_GetUsersCalledWithOperatorContext`
  - Use Testcontainers.MongoDB for real database

- [ ] T142 [P0] Integration tests for RolesController ⚠️ PRIORITY
  - File: `tests/Integration.Tests/Controllers/RolesControllerTests.cs`
  - Test: `Should_CreateRole_When_ValidRequestProvided`
  - Test: `Should_Return403_When_UserLacksRolesCreatePermission`
  - Test: `Should_Return400_When_InvalidPermissionCodeProvided`
  - Test: `Should_PreventDeletion_When_SystemRoleTargeted`

---

## Phase 2: Frontend - User & Role Management UI ⚠️ TODO (0/28 tasks - 0%)

### 2.1 State Management ⚠️ TODO (0/4)

- [ ] T201 [P1] Create authSlice ⚠️ PRIORITY
  - File: `frontend/src/store/slices/authSlice.ts`
  - State: user, token, permissions, isAuthenticated
  - Thunks: login, logout, refreshToken

- [ ] T202 [P1] Create rolesApi (RTK Query)
  - File: `frontend/src/store/apis/rolesApi.ts`
  - Endpoints: getRoles, getRoleById, createRole, updateRole, deleteRole

- [ ] T203 [P1] Create permissionsApi (RTK Query)
  - File: `frontend/src/store/apis/permissionsApi.ts`
  - Endpoints: getPermissions, getPermissionModules

- [ ] T204 [P1] Create usersApi (RTK Query)
  - File: `frontend/src/store/apis/usersApi.ts`
  - Endpoints: getUsers, getUserById, createUser, updateUser, assignRoles, deactivateUser

### 2.2 Authentication ⚠️ TODO (0/4)

- [ ] T205 [P0] Create AuthContext ⚠️ PRIORITY
  - File: `frontend/src/contexts/AuthContext.tsx`
  - Provide: user, permissions, hasPermission(code), login, logout

- [ ] T206 [P0] Create ProtectedRoute component
  - File: `frontend/src/components/auth/ProtectedRoute.tsx`
  - Check authentication, redirect to login if not authenticated

- [ ] T207 [P1] Create RequirePermission component
  - File: `frontend/src/components/auth/RequirePermission.tsx`
  - Props: permission (string), fallback (ReactNode)
  - Hide/show UI based on user permissions

- [ ] T208 [P1] Create usePermission hook
  - File: `frontend/src/hooks/usePermission.ts`
  - Return: hasPermission(code), hasAnyPermission(codes[]), hasAllPermissions(codes[])

### 2.3 Login Page ⚠️ TODO (0/2)

- [ ] T209 [P1] Create LoginPage component ⚠️ PRIORITY
  - File: `frontend/src/pages/LoginPage.tsx`
  - Email/password form with React Hook Form + Zod validation
  - Call login API endpoint, store JWT token in localStorage
  - Redirect to dashboard on success

- [ ] T210 [P1] Add login form validation
  - Email required, valid format
  - Password required, min 8 characters

### 2.4 Roles Management ⚠️ TODO (0/5)

- [ ] T211 [P1] Create RolesPage component
  - File: `frontend/src/pages/RolesPage.tsx`
  - List all roles for operator in table (name, description, permission count)
  - Action buttons: Create Role, Edit, Delete (conditional on permissions)
  - Show "System Role" badge for isSystem: true roles
  - Disable delete button for system roles

- [ ] T212 [P1] Create RoleTable component
  - File: `frontend/src/components/roles/RoleTable.tsx`
  - Columns: Name, Description, Permissions Count, Actions
  - Sortable by name, created date
  - Row actions: Edit, Delete (with confirmation modal)

- [ ] T213 [P1] Create CreateRolePage component
  - File: `frontend/src/pages/CreateRolePage.tsx`
  - Form: Name, Description, Permission Selection
  - Fetch all permissions grouped by module
  - Submit: POST /api/roles

- [ ] T214 [P1] Create EditRolePage component
  - File: `frontend/src/pages/EditRolePage.tsx`
  - Pre-populate form with existing role data
  - Disable editing if system role (show read-only view)
  - Submit: PUT /api/roles/:id

- [ ] T215 [P1] Create PermissionSelector component
  - File: `frontend/src/components/roles/PermissionSelector.tsx`
  - Group permissions by module (Tournaments, Missions, Users, Roles, Analytics, Settings, Audit)
  - Checkbox for each permission with name and description
  - "Select All" checkbox per module
  - Search/filter permissions by name or code

### 2.5 Users Management ⚠️ TODO (0/5)

- [ ] T216 [P1] Create UsersPage component
  - File: `frontend/src/pages/UsersPage.tsx`
  - List all users for operator in table (email, full name, roles, status)
  - Action buttons: Create User, Edit, Assign Roles, Deactivate
  - Filter by status (active/inactive), role
  - Search by email or full name

- [ ] T217 [P1] Create UserTable component
  - File: `frontend/src/components/users/UserTable.tsx`
  - Columns: Email, Full Name, Roles (comma-separated), Status, Last Login, Actions
  - Status badge: Active (green), Inactive (gray)
  - Row actions: Edit, Assign Roles, Deactivate

- [ ] T218 [P1] Create CreateUserPage component
  - File: `frontend/src/pages/CreateUserPage.tsx`
  - Form: Email, Full Name, Password, Confirm Password, Role Selection (multi-select)
  - Submit: POST /api/users
  - Password validation: min 8 chars, uppercase, lowercase, number, special char

- [ ] T219 [P1] Create EditUserPage component
  - File: `frontend/src/pages/EditUserPage.tsx`
  - Form: Email (disabled), Full Name, Status (active/inactive)
  - Password change section (optional): New Password, Confirm New Password
  - Submit: PUT /api/users/:id

- [ ] T220 [P1] Create AssignRolesModal component
  - File: `frontend/src/components/users/AssignRolesModal.tsx`
  - Multi-select dropdown for roles
  - Show current roles selected by default
  - Submit: PUT /api/users/:id/roles
  - Success toast: "Roles updated successfully"

### 2.6 Shared Components ⚠️ TODO (0/3)

- [ ] T221 [P2] Create ConfirmationModal component
  - File: `frontend/src/components/shared/ConfirmationModal.tsx`
  - Props: title, message, onConfirm, onCancel, confirmText, cancelText, variant (danger/warning/info)
  - Used for: Delete role, deactivate user

- [ ] T222 [P2] Create EmptyState component
  - File: `frontend/src/components/shared/EmptyState.tsx`
  - Props: title, description, action (button)
  - Used when: No roles created, no users found

- [ ] T223 [P2] Create LoadingSpinner component
  - File: `frontend/src/components/shared/LoadingSpinner.tsx`
  - Variants: page (full screen), inline, button

### 2.7 Routing ⚠️ TODO (0/1)

- [ ] T224 [P1] Update router configuration ⚠️ PRIORITY
  - File: `frontend/src/App.tsx`
  - Add routes: /login, /roles, /roles/create, /roles/:id/edit, /users, /users/create, /users/:id/edit
  - Wrap protected routes with ProtectedRoute component
  - Add permission checks to routes (e.g., /roles requires "roles.view")

### 2.8 Testing - Frontend ⚠️ TODO (0/4)

- [ ] T225 [P1] Unit tests for AuthContext
  - File: `frontend/src/contexts/__tests__/AuthContext.test.tsx`
  - Test: `Should_ProvideUserPermissions_When_UserLogsIn`
  - Test: `Should_ReturnTrue_When_UserHasPermission`
  - Test: `Should_ReturnFalse_When_UserLacksPermission`

- [ ] T226 [P1] Unit tests for PermissionSelector
  - File: `frontend/src/components/roles/__tests__/PermissionSelector.test.tsx`
  - Test: `Should_GroupPermissionsByModule_When_Rendered`
  - Test: `Should_SelectAllPermissions_When_SelectAllClicked`
  - Test: `Should_FilterPermissions_When_SearchQueryEntered`

- [ ] T227 [P1] Integration tests for RolesPage
  - File: `frontend/src/pages/__tests__/RolesPage.test.tsx`
  - Test: `Should_DisplayRoles_When_PageLoads`
  - Test: `Should_ShowCreateButton_When_UserHasRolesCreatePermission`
  - Test: `Should_HideDeleteButton_When_RoleIsSystemRole`

- [ ] T228 [P1] E2E tests for role management
  - File: `frontend/e2e/roles.spec.ts`
  - Test: `Should_CreateRole_When_ValidDataProvided`
  - Test: `Should_PreventDeletion_When_SystemRoleTargeted`
  - Test: `Should_UpdateRolePermissions_When_EditFormSubmitted`
  - Use Playwright for E2E testing

---

## Phase 3: Approval Workflow (Future Enhancement) - TODO (0/6)

**Note**: This phase is deferred until core functionality is complete.

- [ ] T301 [P2] Add approval workflow fields to Campaign entity
- [ ] T302 [P2] Create ApprovalService
- [ ] T303 [P2] Add approval endpoints to CampaignsController
- [ ] T304 [P2] Create ApprovalBadge component
- [ ] T305 [P2] Add approval actions to CampaignDetails page
- [ ] T306 [P2] Create ApprovalHistoryPanel component

---

## Phase 4: Audit Logging (Future Enhancement) - TODO (0/8)

**Note**: Audit logging will be added after core functionality is complete.

- [ ] T401 [P2] Create AuditLog entity
- [ ] T402 [P2] Create AuditLogRepository
- [ ] T403 [P2] Create AuditLogService
- [ ] T404 [P2] Add audit logging to RoleService
- [ ] T405 [P2] Add audit logging to UserService
- [ ] T406 [P2] Create AuditLogsController
- [ ] T407 [P2] Create AuditLogsPage component
- [ ] T408 [P2] Create AuditLogDetails component

---

## Phase 5: Budget Management Integration (Future) - TODO (0/6)

**Note**: Budget management will be added in future iterations.

- [ ] T501 [P3] Create Budget entity
- [ ] T502 [P3] Create BudgetService
- [ ] T503 [P3] Add budget check to campaign publish workflow
- [ ] T504 [P3] Create BudgetController
- [ ] T505 [P3] Create BudgetSettingsPage component
- [ ] T506 [P3] Create BudgetWarningModal component

---

## Phase 6: Performance Optimization & Polish (Future) - TODO (0/10)

**Note**: Performance optimizations will be applied after core functionality is complete.

### Backend Optimizations
- [ ] T601 [P2] Add caching for GetUserPermissionsAsync
- [ ] T602 [P2] Add pagination to GET /api/roles endpoint
- [ ] T603 [P2] Add pagination to GET /api/users endpoint
- [ ] T604 [P2] Optimize GetRolesByOperatorAsync query

### Frontend Optimizations
- [ ] T605 [P2] Add optimistic updates to role mutations
- [ ] T606 [P2] Add debounced search to UserTable and RoleTable
- [ ] T607 [P2] Add lazy loading for large permission lists

### Documentation
- [ ] T608 [P2] Add Swagger documentation for all endpoints
- [ ] T609 [P2] Create user guide for role management
- [ ] T610 [P2] Create user guide for user management

---

## Progress Summary

### FR-4: Jackpot System

| Phase | Status | Progress |
|-------|--------|----------|
| Phase J1: Domain Layer | ✅ Complete | 6/6 (100%) |
| Phase J2: Application Layer | ✅ Complete | 6/6 (100%) |
| Phase J3: API Layer | ✅ Complete | 3/3 (100%) |
| Phase J4: Frontend | ✅ Complete | 11/11 (100%) |
| **Total** | **✅ Complete** | **26/26 (100%)** |

### FR-2.2: Bonus Template System

| Phase | Status | Progress |
|-------|--------|----------|
| Phase B1: Domain Model Revision | ✅ Complete | 11/11 (100%) |
| Phase B2: Application Layer | ✅ Complete | 9/9 (100%) |
| Phase B3: Frontend Updates | ✅ Complete | 5/5 (100%) |
| **Total** | **✅ Complete** | **25/25 (100%)** |

### FR-1.1: Mission Reward Integration

| Phase | Status | Progress |
|-------|--------|----------|
| Phase M1: Domain Model Updates | ✅ Complete | 6/6 (100%) |
| Phase M2: Application Layer | ✅ Complete | 3/3 (100%) |
| Phase M3: Frontend Updates | ✅ Complete | 4/4 (100%) |
| **Total** | **Complete** | **13/13 (100%)** |

### FR-13: User Permission Management

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 0: Setup & Configuration | ✅ Complete | 7/7 (100%) |
| Phase 1: Backend Foundation | 🔄 In Progress | 37/42 (88%) |
| Phase 2: Frontend UI | ⚠️ Not Started | 0/28 (0%) |
| Phase 3: Approval Workflow | 📅 Future | 0/6 (0%) |
| Phase 4: Audit Logging | 📅 Future | 0/8 (0%) |
| Phase 5: Budget Management | 📅 Future | 0/6 (0%) |
| Phase 6: Performance & Polish | 📅 Future | 0/10 (0%) |
| **Total** | **In Progress** | **44/107 (41%)** |

---

## Current Focus

### FR-2.2: Bonus Template System - ✅ COMPLETE

All tasks completed:
- Domain Model (entities, value objects, repositories)
- Application Layer (services, commands, validators)
- Frontend (CreateBonusPage, GlobalLimitsPage, API types)

### FR-13: User Permission Management - Backend Completion

**Priority Tasks (Must Complete Before Frontend):**

1. **T124** [P1] - Create RolesController with full CRUD endpoints
2. **T125** [P1] - Create UsersController with full CRUD endpoints
3. **T126-T133** [P1] - Create all DTOs and request/response models
4. **T138-T142** [P0] - Write comprehensive unit and integration tests

**Blocking Issues:** None

---

## Next Steps

### Immediate
1. Complete RolesController and UsersController (T124-T125)
2. Create all DTOs (T126-T133)

### Short-Term
1. Write unit tests for RoleService and AuthService (T138-T140)
2. Write integration tests (T141-T142)
3. Start frontend authentication (T201, T205-T210)

### Medium-Term
1. Complete role management UI (T211-T215)
2. Complete user management UI (T216-T220)
3. Add comprehensive E2E tests (T228)

---

## Technical Notes

### Database-Driven Permission System

The permission system was refactored from enum-based to database-driven for scalability:

**Before (Enum-Based)**:
```csharp
public enum Permission {
    TournamentsView,
    TournamentsCreate,
    // ... hardcoded
}

public class Role {
    public List<Permission> Permissions { get; set; }
}
```

**After (Database-Driven)**:
```csharp
public class Permission {
    public ObjectId Id { get; set; }
    public string Code { get; set; } // "tournaments.view"
    public string Name { get; set; } // "View Tournaments"
    public string Module { get; set; } // "Tournaments"
}

public class Role {
    public List<string> Permissions { get; set; } // Permission codes
}
```

**Benefits**:
- New permissions can be added via database without code changes
- Permissions organized by module
- Easy to manage via MongoDB Compass
- Future-proof and scalable

### JWT Permission Claims

User permissions are included in JWT token for efficient authorization:

```csharp
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim("operatorId", user.OperatorId.ToString()),
    new Claim(ClaimTypes.Email, user.Email)
};

// Add permission claims
foreach (var permission in userPermissions)
{
    claims.Add(new Claim("permission", permission));
}
```

This allows permission checks at API layer without database queries.

### Operator Isolation Pattern

All data access goes through BaseRepository which automatically adds OperatorId filter:

```csharp
public abstract class BaseRepository<T> where T : IOperatorScoped
{
    protected FilterDefinition<T> AddOperatorFilter(FilterDefinition<T> filter)
    {
        var operatorFilter = Builders<T>.Filter.Eq(x => x.OperatorId, OperatorId);
        return Builders<T>.Filter.And(filter, operatorFilter);
    }
}
```

This ensures Casino A cannot access Casino B data at the database query level.

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-25 | Initial task breakdown for FR-13 User Role and Permission Management |
| 1.0.0 | 2025-01-25 | Marked Phase 0 and most of Phase 1 as complete (37/42 tasks) |
| 1.0.0 | 2025-01-25 | Identified priority tasks for Phase 1 completion: T124, T125, T126-T133, T138-T142 |
| 1.1.0 | 2025-01-26 | **MAJOR REVISION**: Added FR-2.2 Bonus Template System tasks (25 tasks) |
| 1.1.0 | 2025-01-26 | **MAJOR REVISION**: Added FR-1.1 Mission Reward Integration tasks (13 tasks) |
| 1.1.0 | 2025-01-26 | Corrected Bonus-Mission relationship: Mission → Bonus (not Bonus → Mission) |
| 1.1.0 | 2025-01-26 | Bonus is now a template with dynamic calculation rules and limits |
| 1.1.0 | 2025-01-26 | Removed turnover/locked balance from Bonus (handled by external platform) |

---

**Last Updated:** 2025-01-26
**Status:** Planning FR-2.2 and FR-1.1 revisions
**Next Review:** After domain model revision tasks complete
**Owner:** Development Team
