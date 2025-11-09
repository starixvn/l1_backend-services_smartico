# Feature Specification: Jackpot System

**Version**: 1.0
**Status**: Draft
**Created**: 2025-11-09
**Last Updated**: 2025-11-09

---

## Overview

### Feature Name
Jackpot System

### Brief Description
A progressive jackpot system that allows users to enter jackpot draws using various currencies (points, gems, diamonds) and compete for growing prize pools. The system supports multiple jackpot types (progressive, fixed, daily, weekly, monthly) with real-time updates on pool amounts, participant counts, and winner announcements.

### Problem Statement
Users need an engaging, high-reward gamification mechanic that creates excitement through the possibility of winning significant prizes. Traditional progression systems (levels, missions) provide incremental rewards, but lack the thrill of potentially winning a large jackpot. This feature adds a lottery-style mechanic that increases user engagement and provides aspirational goals.

### Goals & Objectives
- Increase user engagement through high-value prize opportunities
- Provide multiple jackpot entry options to accommodate different user spending patterns
- Create anticipation and excitement through visible pool growth and countdown timers
- Encourage repeat visits through daily/weekly jackpot schedules
- Maintain transparency by displaying recent winners and prize amounts

---

## User Scenarios & Testing

### Primary User Scenarios

#### Scenario 1: Discovering and Entering a Progressive Jackpot
**Actor**: Sarah, an active player with 5,000 points

**Preconditions**:
- Sarah has earned 5,000 points through gameplay
- A progressive "Mega Jackpot" is active with current pool at 50,000 points
- Entry cost is 100 points per entry
- Max 10 entries per user

**Steps**:
1. Sarah navigates to the Jackpots section
2. She sees the Mega Jackpot card displaying:
   - Current pool: 50,000 points
   - Entry cost: 100 points
   - Participants: 312 users
   - Draw date: "In 2 days, 5 hours"
3. Sarah clicks "Enter Jackpot"
4. System prompts: "How many entries? (1-10)"
5. Sarah selects 5 entries (500 points total)
6. System shows confirmation: "5 entries purchased. Your total entries: 5/10"
7. Her points balance decreases from 5,000 to 4,500
8. Jackpot pool increases to 50,500 points
9. Participant count updates to 313

**Expected Outcome**:
- Sarah's entries are recorded
- Pool amount increases immediately
- Sarah can view her entry count on the jackpot card

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
   - "J***n won Daily Jackpot: 10,000 points (Nov 8)"
   - "S***h won Mega Jackpot: 50,000 points (Nov 5)"
5. Mike filters by "Daily" jackpots
6. List updates to show only daily jackpot winners

**Expected Outcome**:
- Mike understands the potential prizes
- Recent winners are displayed with partial anonymization
- Filtering works correctly

### Edge Cases & Error Scenarios

#### Edge Case 1: Insufficient Balance
**Scenario**: User attempts to enter jackpot without sufficient currency

**Steps**:
1. User has 50 points
2. Jackpot entry costs 100 points
3. User clicks "Enter Jackpot"

**Expected Behavior**:
- System displays error: "Insufficient balance. You need 100 points but have 50 points."
- No entry is processed
- User balance remains unchanged

#### Edge Case 2: Maximum Entries Reached
**Scenario**: User has already reached the maximum entry limit

**Steps**:
1. User has 10/10 entries in a jackpot
2. User attempts to purchase more entries

**Expected Behavior**:
- "Enter Jackpot" button is disabled
- Message displays: "Maximum entries reached (10/10)"
- Option to view existing entries is available

#### Edge Case 3: Jackpot Draw in Progress
**Scenario**: User attempts to enter while draw is being processed

**Steps**:
1. Draw time arrives
2. System begins processing winner selection
3. User attempts to enter

**Expected Behavior**:
- Entry button is disabled
- Message displays: "Draw in progress. New entries will be available for the next jackpot."
- User can view results once draw completes

---

## Functional Requirements

### Core Features

#### F1: Jackpot Display
- System shall display all active jackpots
- Each jackpot shall show:
  - Name and description
  - Thumbnail image
  - Current pool amount
  - Entry cost and currency type
  - Participant count
  - Draw date/time with countdown timer
  - Jackpot type badge (Progressive, Fixed, Daily, etc.)
  - User's current entry count (if applicable)
- Users shall be able to filter jackpots by type

#### F2: Jackpot Entry
- Users shall be able to enter jackpots using points, gems, or diamonds
- System shall validate:
  - Sufficient currency balance
  - Entry limit not exceeded
  - Jackpot is accepting entries (not drawn/closed)
- Entry shall:
  - Deduct currency immediately
  - Record entry count for user
  - Increase pool for progressive jackpots
  - Update participant count
  - Show confirmation with updated entry count
- Users shall be able to enter multiple times (up to maximum limit)

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

#### Entry Limits
- Each jackpot defines maximum entries per user
- System enforces limits before accepting payment
- Users can view their current entry count vs maximum

#### Currency Validation
- Entry cost can be in points, gems, diamonds, or free
- System checks user's balance before entry
- Transaction is atomic (deduct currency + record entry)

#### Draw Scheduling
- Each jackpot has a defined draw date/time
- System prevents entries after draw begins
- Countdown timer shows time remaining

---

## Success Criteria

### Measurable Outcomes

#### User Engagement
- 40% of active users enter at least one jackpot within first week
- Average user enters jackpots 3+ times per week
- Daily active users increase by 15% on jackpot draw days

#### Performance
- Jackpot list loads in under 2 seconds
- Entry transactions complete in under 1 second
- Real-time pool updates appear within 2 seconds of entry
- System supports 1,000 concurrent entries during peak times

#### User Satisfaction
- Users can complete jackpot entry in under 30 seconds
- 90% of users successfully enter jackpots on first attempt
- Winner announcement reaches users within 5 seconds of draw completion

#### System Reliability
- Entry transactions have 99.9% success rate
- Zero duplicate entries for same user/jackpot combination
- Pool calculations are 100% accurate

---

## Key Entities

### Jackpot
**Purpose**: Represents a jackpot draw opportunity

**Attributes**:
- Unique identifier
- Name
- Description
- Thumbnail image URL
- Jackpot type (Progressive, Fixed, Daily, Weekly, Monthly)
- Entry cost amount
- Entry cost currency (Points, Gems, Diamonds, Free)
- Current pool amount
- Maximum entries per user
- Draw date/time
- Status (Active, Drawing, Completed)
- Participant count

### Jackpot Entry
**Purpose**: Records user's participation in a jackpot

**Attributes**:
- Unique identifier
- User identifier
- Jackpot identifier
- Entry count (number of entries purchased)
- Total cost paid
- Entry timestamp

### Jackpot Winner
**Purpose**: Records jackpot draw winners

**Attributes**:
- Unique identifier
- User identifier
- Jackpot identifier
- Prize amount
- Prize currency
- Win date/time

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
- Demo data will simulate 5 jackpots with varying types
- Demo users will have pre-configured entries
- Winner history will include mock data for demonstration
- Draw dates will be realistic (next few days/weeks)

---

## Scope

### In Scope
- Display active jackpots with all required information
- Entry process with validation and payment
- Real-time pool/participant updates via SignalR
- Winner history display with filtering
- Demo data for MVP testing
- Integration with existing infrastructure

### Out of Scope
- Winner selection algorithm (external system)
- Draw processing mechanism (external system)
- Currency earning mechanisms (existing feature)
- User balance management (existing feature)
- Payment gateway integration (handled by existing system)
- Email/push notifications for winners
- Jackpot creation/management UI (admin feature)
- Historical analytics and reporting

---

## Non-Functional Requirements

### Performance
- API responses complete in under 500ms (p95)
- Real-time updates delivered within 2 seconds
- Support 1,000 concurrent users entering jackpots
- Caching reduces database queries by 80%

### Scalability
- System handles 100 active jackpots simultaneously
- Entry system processes 100 transactions per second
- Winner list supports 10,000+ historical entries

### Reliability
- Zero data loss during entry transactions
- Idempotent entry operations (no duplicate entries)
- Graceful degradation if real-time updates unavailable

### Security
- Entry transactions are atomic and validated
- User balances are verified before deduction
- Entry limits are enforced server-side
- No price manipulation on client-side

---

## Acceptance Criteria

### AC1: View Available Jackpots
**Given** I am a logged-in user
**When** I navigate to the Jackpots section
**Then** I see all active jackpots with name, pool amount, entry cost, participant count, and countdown timer
**And** I can filter by jackpot type
**And** Page loads in under 2 seconds

### AC2: Enter Jackpot with Sufficient Balance
**Given** I have 1,000 points
**And** A jackpot costs 100 points per entry
**And** I have 0/10 entries
**When** I purchase 5 entries
**Then** 500 points are deducted from my balance
**And** My entry count shows 5/10
**And** Jackpot pool increases by 500 points (for progressive)
**And** Participant count increases
**And** Transaction completes in under 1 second

### AC3: Prevent Entry with Insufficient Balance
**Given** I have 50 points
**And** A jackpot costs 100 points per entry
**When** I attempt to enter
**Then** System displays "Insufficient balance" error
**And** No currency is deducted
**And** No entry is recorded

### AC4: Enforce Maximum Entry Limit
**Given** I have 10/10 entries in a jackpot
**When** I view the jackpot
**Then** Entry button is disabled
**And** Message displays "Maximum entries reached (10/10)"

### AC5: Real-time Pool Updates
**Given** I am viewing a jackpot
**When** Another user enters the jackpot
**Then** Pool amount updates within 2 seconds
**And** Participant count increases within 2 seconds

### AC6: View Recent Winners
**Given** Jackpots have been drawn in the past 30 days
**When** I view the Winners section
**Then** I see a list of recent winners
**And** Each entry shows partially anonymized username, jackpot name, prize amount, and win date
**And** I can filter by jackpot type
**And** My wins (if any) are highlighted

### AC7: Countdown Timer Accuracy
**Given** A jackpot draw is in 2 days, 5 hours
**When** I view the jackpot
**Then** Countdown displays "2d 5h" or similar format
**And** Timer updates every minute
**And** When draw time arrives, entry button is disabled

---

## Open Questions

_None - All requirements have been specified with reasonable industry-standard defaults._

---

## Change Log

| Version | Date       | Author  | Changes            |
|---------|------------|---------|-------------------|
| 1.0     | 2025-11-09 | Claude  | Initial draft     |
