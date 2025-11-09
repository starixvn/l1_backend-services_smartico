# Feature Specification: Jackpot System

**Version**: 1.2
**Status**: Draft
**Created**: 2025-11-09
**Last Updated**: 2025-11-09

---

## Overview

### Feature Name
Jackpot System

### Brief Description
A jackpot system that allows users to opt-in to jackpot draws and compete for growing prize pools. The system supports two jackpot types: **MultiUser** (shared pool among all users) and **Personal** (individual pool per user). Users opt-in for free, then contributions are automatically deducted during gameplay based on the jackpot's contribution type (Fixed amount or Percentage of bet). Features include real-time pool updates, temperature indicators (COLD/WARM/HOT/BURNING), and winner announcements.

### Problem Statement
Users need an engaging, high-reward gamification mechanic that creates excitement through the possibility of winning significant prizes. Traditional progression systems (levels, missions) provide incremental rewards, but lack the thrill of potentially winning a large jackpot. This feature adds a lottery-style mechanic that increases user engagement and provides aspirational goals.

### Goals & Objectives
- Increase user engagement through high-value prize opportunities
- Provide free opt-in mechanics with automatic contribution during gameplay
- Create anticipation and excitement through visible pool growth, temperature indicators, and explosion countdowns
- Support both community-based (MultiUser) and individual (Personal) jackpot experiences
- Offer flexible contribution models (Fixed amount or Percentage-based)
- Maintain transparency by displaying recent winners, contribution rates, and pool temperatures

---

## User Scenarios & Testing

### Primary User Scenarios

#### Scenario 1: Opting Into a MultiUser Jackpot
**Actor**: Sarah, an active player with 5,000 points

**Preconditions**:
- Sarah has earned 5,000 points through gameplay
- A MultiUser "Mega Jackpot" is active with current pool at 50,000 points (shared among all users)
- Jackpot has Percentage contribution: 5% of each bet
- Temperature: HOT (pool exceeds minimum threshold)
- Sarah is not yet opted in

**Steps**:
1. Sarah navigates to the Jackpots section
2. She sees the Mega Jackpot card displaying:
   - Current pool: 50,000 points (growing)
   - Temperature: 🔥 HOT
   - Contribution rate: "5% of each bet"
   - Registration count: 312 users
   - Explosion estimate: "In 2 days, 5 hours"
   - "Opt In" button (enabled)
3. Sarah clicks "Opt In"
4. System shows confirmation: "You're in! Your bets will now contribute to the Mega Jackpot pool."
5. Registration count updates to 313
6. Sarah's opt-in status changes to "Opted In"
7. During subsequent gameplay:
   - Sarah places a 100-point bet → 5 points contribute to jackpot pool (5%)
   - Sarah places a 200-point bet → 10 points contribute to jackpot pool (5%)
8. Pool grows to 50,015 points in real-time
9. Temperature indicator may shift to BURNING as pool approaches max threshold

**Expected Outcome**:
- Sarah is registered for the jackpot (free opt-in)
- Her opt-in status is visible on the jackpot card
- Automatic contributions happen during gameplay
- Pool updates reflect her contributions in real-time
- She can view temperature changes as pool grows

#### Scenario 2: Viewing Recent Winners
**Actor**: Mike, a new player

**Preconditions**:
- Mike has just started playing
- Multiple jackpots have been drawn in the past 30 days

**Steps**:
1. Mike opens the Jackpots section
2. He clicks the "Recent Winners" tab
3. System displays a list showing:
   - Username (anonymized: "M***e")
   - Jackpot name
   - Prize amount
   - Win date
4. Mike sees entries like:
   - "J***n won Community Jackpot: 10,000 points (Nov 8)"
   - "S***h won Mega Jackpot: 50,000 points (Nov 5)"
5. Mike filters by "MultiUser" jackpots
6. List updates to show only MultiUser jackpot winners

**Expected Outcome**:
- Mike understands the potential prizes
- Recent winners are displayed with partial anonymization
- Filtering works correctly

### Edge Cases & Error Scenarios

#### Edge Case 1: Opting Out After Registration
**Scenario**: User wants to stop participating in a jackpot

**Steps**:
1. User is currently opted in to "Mega Jackpot"
2. User clicks "Opt Out" button
3. System prompts confirmation: "Are you sure? You'll stop contributing to this jackpot."
4. User confirms

**Expected Behavior**:
- User's opt-in status changes to "Not Opted In"
- Registration count decreases by 1
- Future gameplay no longer contributes to this jackpot
- Button changes from "Opt Out" to "Opt In"

#### Edge Case 2: Jackpot Explosion (Draw) in Progress
**Scenario**: User attempts to opt-in while jackpot is exploding/drawing winner

**Steps**:
1. Pool reaches explosion threshold (max amount exceeded)
2. System begins processing winner selection
3. User attempts to opt in

**Expected Behavior**:
- "Opt In" button is disabled
- Message displays: "Jackpot draw in progress. New pot will be available soon."
- User can view results once draw completes

#### Edge Case 3: Already Opted In
**Scenario**: User attempts to opt-in to a jackpot they're already registered for

**Steps**:
1. User is already opted in to "Community Jackpot"
2. User views jackpot card

**Expected Behavior**:
- "Opt In" button is replaced with "Opt Out" button
- Status badge shows: "✓ You're In"
- Contribution rate is highlighted (e.g., "You contribute 5% per bet")

#### Edge Case 4: Insufficient Balance for Contribution
**Scenario**: User places bet but has insufficient balance after contribution deduction

**Steps**:
1. User is opted in to jackpot with Fixed contribution of 50 points
2. User attempts to place 100-point bet
3. User only has 120 points (not enough for 100 bet + 50 contribution)

**Expected Behavior**:
- System displays error: "Insufficient balance. Bet requires 150 points (100 bet + 50 jackpot contribution)."
- Bet is not placed
- No contribution is made
- User balance remains unchanged

---

## Functional Requirements

### Core Features

#### F1: Jackpot Display
- System shall display all active jackpots
- Each jackpot shall show:
  - Name and description
  - Thumbnail image
  - Current pool amount (in both jackpot currency and user wallet currency)
  - Contribution type and value (e.g., "Fixed: 10 points per bet" or "Percentage: 5% of each bet")
  - Registration count (number of opted-in users) for MultiUser jackpots
  - Pool temperature indicator (COLD/WARM/HOT/BURNING) with visual styling
  - Explosion estimate (time until pool is likely to explode/draw)
  - Jackpot type badge (MultiUser or Personal)
  - User's opt-in status ("Opted In" badge if registered)
  - Opt In/Opt Out button based on current status
- Users shall be able to filter jackpots by type (MultiUser/Personal)
- Pool amounts shall display in real-time as other users contribute

#### F2: Jackpot Opt-In/Opt-Out
- Users shall be able to opt-in to jackpots (free registration, no upfront cost)
- Users shall be able to opt-out at any time
- System shall validate:
  - User is not already opted in (for opt-in requests)
  - User is currently opted in (for opt-out requests)
  - Jackpot is not in explosion/draw state
- Opt-in shall:
  - Register user for the jackpot
  - Update registration count for MultiUser jackpots
  - Enable automatic contributions during gameplay
  - Show confirmation message with contribution details
  - Change button from "Opt In" to "Opt Out"
- Opt-out shall:
  - Deregister user from the jackpot
  - Update registration count for MultiUser jackpots
  - Stop automatic contributions
  - Show confirmation message
  - Change button from "Opt Out" to "Opt In"

#### F2.1: Automatic Contribution During Gameplay
- When user is opted in and places a bet/wager:
  - System shall calculate contribution based on contribution type:
    - **Fixed**: Deduct fixed contribution amount (e.g., 10 points per bet)
    - **Percentage**: Deduct percentage of bet amount (e.g., 5% of 100-point bet = 5 points)
  - System shall validate user has sufficient balance for bet + contribution
  - Contribution shall be added to appropriate pool:
    - **MultiUser**: Add to shared pool visible to all users
    - **Personal**: Add to user's individual pool
  - Pool amount shall update in real-time for all viewing users
  - Temperature may update if pool crosses thresholds

#### F3: Winner Display
- System shall display recent winners (last 30 days)
- Each winner entry shall show:
  - Partially anonymized username
  - Jackpot name
  - Prize amount
  - Win date
- Users shall be able to filter winners by jackpot type
- Current user's wins shall be highlighted

#### F4: Real-time Updates
- Pool amounts shall update in real-time when other users enter
- Participant counts shall update in real-time
- Draw completion shall trigger winner announcement
- Winner list shall update when new winners are announced

### Data & Validation

#### Contribution Validation
- System validates sufficient balance before allowing bet when user is opted in
- Contribution calculation is accurate based on type:
  - Fixed: Exact amount per bet (e.g., 10 points)
  - Percentage: Calculated from bet amount (e.g., 5% of 100 = 5 points)
- Transaction is atomic (deduct bet + contribution together)

#### Pool Temperature Calculation
- Temperature thresholds are defined per jackpot:
  - **COLD** (0): current_pot < (min_amount - seed_amount) / 2
  - **WARM** (1): (min_amount - seed_amount) / 2 ≤ current_pot < min_amount
  - **HOT** (2): min_amount ≤ current_pot < min_amount + 0.5 * (max_amount - min_amount)
  - **BURNING** (3): current_pot ≥ min_amount + 0.5 * (max_amount - min_amount)
- Temperature updates in real-time as pool grows
- Visual indicators change based on temperature (colors, animations)

#### Explosion (Draw) Triggering
- Each jackpot has explosion thresholds (min_amount, max_amount)
- Explosion can occur when pool ≥ min_amount
- Explosion is guaranteed when pool ≥ max_amount
- System prevents opt-in/opt-out during explosion processing
- Explosion timestamp is recorded for historical data

---

## Success Criteria

### Measurable Outcomes

#### User Engagement
- 40% of active users opt-in to at least one jackpot within first week
- Average user remains opted-in to 2+ jackpots simultaneously
- Daily active users increase by 15% on jackpot explosion days

#### Performance
- Jackpot list loads in under 2 seconds
- Opt-in/opt-out transactions complete in under 500ms
- Real-time pool updates appear within 2 seconds of contribution
- System supports 1,000 concurrent users viewing jackpots during peak times

#### User Satisfaction
- Users can complete jackpot opt-in in under 10 seconds
- 95% of users successfully opt-in on first attempt
- Winner announcement reaches users within 5 seconds of explosion completion
- Temperature indicators update smoothly as pools grow

#### System Reliability
- Opt-in/opt-out transactions have 99.9% success rate
- Zero duplicate opt-in records for same user/jackpot combination
- Pool calculations are 100% accurate
- Contribution deductions are atomic with bet transactions
- Temperature calculations are deterministic and consistent

---

## Key Entities

### Jackpot (JackpotDetails)
**Purpose**: Represents a jackpot template with current pot information

**Attributes**:
- Template ID (unique identifier for jackpot configuration)
- Jackpot type (MultiUser = 1, Personal = 2)
- Name
- Description
- Thumbnail image URL
- Base currency (e.g., "USD", "Points")
- User wallet currency (for display conversion)
- **Contribution type** (Fixed = 1, Percentage = 2)
- **Contribution value** (fixed amount or percentage, e.g., 10 or 5.0)
- Current pot amount (in base currency)
- Current pot amount (in user currency)
- **Pool temperature** (COLD = 0, WARM = 1, HOT = 2, BURNING = 3)
- Minimum pool amount (explosion threshold start)
- Maximum pool amount (guaranteed explosion threshold)
- Seed amount (initial pool value)
- **Explosion date timestamp** (when pot exploded/will explode)
- **Registration count** (number of opted-in users)
- **User opt-in status** (boolean: is current user opted in)
- Allow all games (boolean: jackpot applies to all games vs specific games)
- Expose winners publicly (boolean: show winners in UI/API)

### Jackpot Opt-In Record
**Purpose**: Records user's registration for a jackpot

**Attributes**:
- User identifier
- Jackpot template ID
- Opt-in timestamp
- Opt-in status (Active, Opted Out)

### Jackpot Pot
**Purpose**: Represents a specific pot instance (for explosion tracking)

**Attributes**:
- Pot ID (unique identifier for this pot instance)
- Template ID (parent jackpot template)
- Current pot amount (base currency)
- Current pot amount (user currency)
- Temperature (COLD/WARM/HOT/BURNING)
- Explosion date timestamp (when this pot exploded)
- Status (Active, Exploding, Exploded)

### Jackpot Winner
**Purpose**: Records jackpot explosion winners

**Attributes**:
- Pot ID (which pot instance)
- User identifier
- Public username (masked for privacy, except for current user)
- Avatar ID
- Winning amount (in jackpot currency)
- Winning amount (in user wallet currency)
- **Winning position** (1st, 2nd, 3rd for multi-winner jackpots)
- Win date timestamp
- Is current user (boolean flag)

---

## Dependencies & Constraints

### Dependencies
- Existing user point/gem/diamond balance system
- Existing transaction/payment processing system
- SignalR for real-time updates
- Existing caching infrastructure (30s TTL)
- Existing CQRS + MediatR pattern
- Existing API client pattern (ISmartico*ApiClient)

### Constraints
- Must integrate into existing Smartico.Missions.* projects
- Must reuse existing SignalR hub (/hubs/progress)
- Must follow existing Clean Architecture + CQRS pattern
- Must use existing caching strategy (30s TTL)
- No new infrastructure projects
- Build must succeed with 0 warnings/errors

---

## Assumptions

### Technical Assumptions
- Backend uses .NET 9 / ASP.NET Core 9
- Frontend uses React 19 + TypeScript
- Existing IProgressBroadcaster interface can be extended
- Existing caching service supports required TTL patterns
- FluentValidation is available for command validation

### Business Assumptions
- Jackpot draws are processed by an external system (not implemented in this feature)
- Winner selection algorithm is handled externally
- Currency balances are managed by existing system
- User authentication/authorization is already implemented
- Maximum 100 active jackpots at any time

### Data Assumptions
- Demo data will simulate jackpots of both types (MultiUser and Personal)
- Demo data will include both contribution types (Fixed and Percentage)
- Demo jackpots will have various temperatures (COLD, WARM, HOT, BURNING)
- Demo users will have pre-configured opt-in statuses
- Winner history will include mock data for demonstration
- Explosion timestamps will be realistic (next few hours/days)

---

## Scope

### In Scope
- Display active jackpots with all required information (pool, temperature, contribution rate, opt-in status)
- Opt-in/opt-out process with validation
- Real-time pool/temperature/registration count updates via SignalR
- Temperature indicator visualization (COLD/WARM/HOT/BURNING)
- Multi-currency support (base currency + user wallet currency conversion)
- Winner history display with filtering and position display
- Demo data for MVP testing (both jackpot types, both contribution types, all temperatures)
- Integration with existing infrastructure

### Out of Scope
- Actual gameplay/betting mechanics (existing feature - we only handle contribution deduction)
- Winner selection algorithm (external system - Smartico API handles explosion and winner drawing)
- Explosion trigger processing (external system)
- Contribution transaction processing during bets (handled by existing bet system)
- Currency earning mechanisms (existing feature)
- User balance management (existing feature)
- Email/push notifications for winners
- Jackpot creation/management UI (admin feature - BackOffice)
- Historical analytics and reporting
- Game eligibility configuration (simplified to "all games" for MVP)

---

## Non-Functional Requirements

### Performance
- API responses complete in under 500ms (p95)
- Real-time updates delivered within 2 seconds
- Support 1,000 concurrent users viewing jackpots
- Caching reduces database queries by 80%

### Scalability
- System handles 100 active jackpots simultaneously
- Opt-in/opt-out system processes 100 transactions per second
- Winner list supports 10,000+ historical entries
- Temperature calculations scale with pool updates

### Reliability
- Zero data loss during opt-in/opt-out transactions
- Idempotent opt-in operations (no duplicate registrations)
- Graceful degradation if real-time updates unavailable
- Temperature calculations remain consistent across sessions

### Security
- Opt-in/opt-out transactions are validated server-side
- User can only manage their own opt-in status
- Pool amounts cannot be manipulated by client
- Contribution rates are server-enforced during bets
- User balances are verified before deduction
- Entry limits are enforced server-side
- No price manipulation on client-side

---

## Acceptance Criteria

### AC1: View Available Jackpots with All Details
**Given** I am a logged-in user
**When** I navigate to the Jackpots section
**Then** I see all active jackpots with name, pool amount (both currencies), contribution rate, temperature, registration count, and explosion estimate
**And** I can filter by jackpot type (MultiUser/Personal)
**And** Temperature indicators are visually distinct (COLD=blue, WARM=yellow, HOT=orange, BURNING=red)
**And** My opt-in status is visible for each jackpot
**And** Page loads in under 2 seconds

### AC2: Opt-In to MultiUser Jackpot
**Given** I am a logged-in user
**And** A MultiUser jackpot exists with Percentage contribution at 5%
**And** I am not currently opted in
**And** Jackpot is not in explosion state
**When** I click "Opt In"
**Then** My opt-in status changes to "Opted In"
**And** Registration count increases by 1
**And** Button changes from "Opt In" to "Opt Out"
**And** Confirmation message displays: "You're in! Your bets will now contribute 5% to this jackpot."
**And** Transaction completes in under 500ms

### AC3: Automatic Contribution During Gameplay (Percentage)
**Given** I am opted in to a jackpot with Percentage contribution at 5%
**And** I have 1,000 points balance
**When** I place a 100-point bet during gameplay
**Then** 5 points are deducted for jackpot contribution (5% of 100)
**And** 100 points are deducted for the bet
**And** My balance decreases to 895 points (1,000 - 100 - 5)
**And** Jackpot pool increases by 5 points (for MultiUser) or my personal pool increases by 5 (for Personal)
**And** Pool updates in real-time within 2 seconds

### AC4: Automatic Contribution During Gameplay (Fixed)
**Given** I am opted in to a jackpot with Fixed contribution at 10 points per bet
**And** I have 500 points balance
**When** I place a 50-point bet during gameplay
**Then** 10 points are deducted for jackpot contribution (fixed amount)
**And** 50 points are deducted for the bet
**And** My balance decreases to 440 points (500 - 50 - 10)
**And** Jackpot pool increases by 10 points
**And** Pool updates in real-time within 2 seconds

### AC5: Opt-Out from Jackpot
**Given** I am currently opted in to a jackpot
**When** I click "Opt Out"
**And** Confirm the opt-out action
**Then** My opt-in status changes to "Not Opted In"
**And** Registration count decreases by 1 (for MultiUser)
**And** Button changes from "Opt Out" to "Opt In"
**And** Future bets no longer contribute to this jackpot
**And** Confirmation message displays: "You've opted out. Your bets will no longer contribute to this jackpot."

### AC6: Real-time Pool and Temperature Updates
**Given** I am viewing a MultiUser jackpot with current pool at 4,950 points
**And** Temperature is WARM (pool is approaching min_amount of 5,000)
**When** Another user's contribution adds 100 points to the pool
**Then** Pool amount updates to 5,050 points within 2 seconds
**And** Temperature changes from WARM to HOT (pool exceeded min_amount)
**And** Temperature indicator color changes from yellow to orange
**And** Explosion estimate may update based on pool growth rate

### AC7: View Recent Winners with Positions
**Given** Jackpots have exploded in the past 30 days
**And** Some jackpots had multiple winners (1st, 2nd, 3rd place)
**When** I view the Winners section
**Then** I see a list of recent winners
**And** Each entry shows partially anonymized username, jackpot name, prize amount (both currencies), winning position, and win date
**And** My username is NOT masked if I'm the winner (shows "is_me" indicator)
**And** I can filter by jackpot type (MultiUser/Personal)
**And** My wins are highlighted with special styling
**And** Winner avatars are displayed

### AC8: Explosion Estimate Display
**Given** A jackpot has HOT temperature with pool at 5,500 points
**And** Min amount is 5,000 points, max amount is 10,000 points
**And** Average contribution rate is 500 points per hour
**When** I view the jackpot
**Then** Explosion estimate displays approximate time (e.g., "In 9 hours" based on growth to max_amount)
**And** Estimate updates as contribution rate changes
**And** When explosion is imminent (pool near max), estimate shows "Exploding soon!"

### AC9: Prevent Opt-In During Explosion
**Given** A jackpot is currently in explosion/draw state
**When** I view the jackpot
**Then** "Opt In" button is disabled
**And** Status message displays: "Jackpot draw in progress. New pot will be available soon."
**And** I can view explosion results once processing completes

---

## Open Questions

_None - All requirements have been specified based on Smartico API constraints._

---

## Specification Clarifications

### JackpotType Alignment (2025-11-09)

**Original Assumption**: The initial draft incorrectly specified 5 jackpot types (Progressive, Fixed, Daily, Weekly, Monthly) based on common industry patterns for jackpot systems.

**Correction**: After review of the Smartico API documentation ([smartico-api/docs/enums/JackpotType.md](../../smartico-api/docs/enums/JackpotType.md)), the specification has been corrected to align with the actual API enum:

```csharp
public enum JackpotType
{
    MultiUser = 1,  // Shared jackpot pool among all users
    Personal = 2    // Individual jackpot pool per user
}
```

**Impact**: The following sections were updated to reflect the correct 2-type system:
- Brief Description: Updated to describe MultiUser (shared pool) and Personal (individual pool) types
- Goals & Objectives: Removed mention of daily/weekly schedules
- User Scenarios: Changed "Progressive Jackpot" to "MultiUser Jackpot"
- Functional Requirements: Updated filter options to MultiUser/Personal
- Key Entities: Updated Jackpot type attribute to use correct enum values
- Acceptance Criteria: Updated test scenarios to reference MultiUser type
- Data Assumptions: Updated to reflect both jackpot types in demo data

**Behavioral Differences**:
- **MultiUser**: Pool grows with each user's entry, shared among all participants, higher potential prizes
- **Personal**: Isolated pool per user, individual prize calculation, personalized experience

---

### Opt-In Model vs Entry Model (2025-11-09 - v1.2)

**Original Assumption (v1.0-1.1)**: The specification incorrectly described jackpots as using a direct "entry purchase" model where users pay points upfront to buy entries (similar to buying lottery tickets).

**Example from v1.1**:
> "Sarah selects 5 entries (500 points total)"
> "500 points are deducted from my balance"
> "Jackpot pool increases by 500 points"

**Correction (v1.2)**: After deep review of the Smartico API source code ([smartico-api/src/Jackpots](../../smartico-api/src/Jackpots/)), the specification has been completely rewritten to reflect the actual **opt-in + automatic contribution** model:

**How It Actually Works**:
1. **Free Opt-In**: Users register for jackpots at no cost (`JackpotsOptinRequest` / `JackpotsOptoutRequest`)
2. **Automatic Contributions**: During gameplay, when users place bets, a portion is automatically deducted and added to the jackpot pool
3. **Contribution Types**:
   - **Fixed** (`JackpotContributionType.Fixed = 1`): Fixed amount per bet (e.g., 10 points per bet)
   - **Percentage** (`JackpotContributionType.Percentage = 2`): Percentage of bet (e.g., 5% of each bet)

**Major Additions in v1.2**:

1. **JackpotContributionType** (Fixed/Percentage) - Previously missing entirely
2. **Pool Temperature** (`JackPotTemparature`: COLD/WARM/HOT/BURNING) - Visual indicator of pool status
3. **Explosion Model**: Jackpots "explode" (draw winners) when pool reaches thresholds (min_amount to max_amount range)
4. **Multi-Currency**: Base currency + user wallet currency conversion (`jp_currency` vs `user_currency`)
5. **Registration Count**: Opt-in users count (not "participant count" which was ambiguous)
6. **Explosion Timestamp**: When pot will/did explode (`explode_date_ts`)
7. **Winning Position**: Multi-winner support (1st, 2nd, 3rd place)
8. **Is Me Flag**: Current user's wins are not masked (`is_me` boolean)

**Sections Completely Rewritten**:
- **Brief Description**: Changed from "enter jackpot draws using currencies" to "opt-in and contribute during gameplay"
- **Goals & Objectives**: Added contribution models, temperature indicators, removed "entry options"
- **User Scenario 1**: Completely rewritten from "purchasing entries" to "opting in and betting"
- **Edge Cases**: Replaced "Insufficient Balance for Entry" / "Maximum Entries" with "Opting Out" / "Already Opted In" / "Insufficient Balance for Contribution"
- **Functional Requirement F2**: Completely replaced "Jackpot Entry" with "Jackpot Opt-In/Opt-Out" + "Automatic Contribution During Gameplay"
- **Data & Validation**: Replaced "Entry Limits" / "Currency Validation" with "Contribution Validation" / "Pool Temperature Calculation" / "Explosion Triggering"
- **Success Criteria**: Changed from "enter jackpots" to "opt-in to jackpots", updated metrics
- **Key Entities**: Completely rewritten with all API fields (contribution_type, temperature, registration_count, etc.)
- **Acceptance Criteria**: All 9 criteria rewritten for opt-in model (AC2-AC9 are entirely new)
- **Scope**: Clarified that actual betting mechanics and contribution processing are out of scope (existing features)

**Impact**: This is a **fundamental architectural change** to the feature. The implementation will follow the Smartico API's actual opt-in pattern, not the fictional entry-purchase pattern from v1.0-1.1.

---

## Change Log

| Version | Date       | Author  | Changes                                                                 |
|---------|------------|---------|-------------------------------------------------------------------------|
| 1.0     | 2025-11-09 | Claude  | Initial draft                                                           |
| 1.1     | 2025-11-09 | Claude  | Corrected JackpotType from 5 types to 2 types (MultiUser, Personal)   |
| 1.2     | 2025-11-09 | Claude  | **Major revision**: Rewritten to align with Smartico API opt-in model. Added JackpotContributionType, pool temperature, explosion model, multi-currency, and all missing API fields. Replaced entry-purchase model with opt-in + automatic contribution model. Completely rewrote user scenarios, functional requirements, entities, and acceptance criteria. |
