# Back Office Campaign Management - Specification

**Version:** 1.0.0
**Created:** 2025-01-24
**Last Updated:** 2025-01-24
**Status:** Draft
**Author:** AI Assistant

## Overview

### Purpose

Operators (casino operators, game providers, platform operators) need a centralized, no-code platform to create, manage, and analyze gamification events and player engagement systems without requiring technical expertise or developer support. Currently, creating gamification campaigns requires technical implementation, making it slow, expensive, and inaccessible to marketing teams.

The Back Office is the management interface for Smartico's gamification platform, empowering marketing and operations teams to independently configure and optimize gamification strategies (missions, bonuses, tournaments, jackpots, player levels, badges) for player retention and engagement, reducing time-to-market from weeks to hours and eliminating dependency on development resources.

### Scope

**In Scope:**
- Campaign creation and configuration for missions, bonuses, tournaments, and jackpots
- Player progression system configuration (levels, experience points, tier advancement)
- Badge and achievement system management (badge design, unlock criteria, rewards)
- **Mission task-based builder** with trigger/goal/reward configuration per task
- **Visual drag-and-drop builder** for bonus formula configuration (future)
- Player segmentation and targeting (tier-based, behavioral, custom criteria)
- Campaign scheduling (start/end dates)
- Real-time campaign performance analytics and reporting
- A/B testing framework for campaign optimization
- User role and permission management for team collaboration
- Campaign templates and duplication for faster setup
- Draft/publish workflow with preview capabilities
- Active campaign monitoring and management

**Out of Scope:**
- Player-facing widget UI (separate feature)
- Real-time game integration and event processing (handled by existing backend)
- Payment processing and financial transactions
- Customer support ticketing system
- Content management for marketing pages
- Email/SMS notification systems (campaigns trigger bonuses, separate system handles notifications)

### Target Users

- **Marketing Manager (Casino/Game Provider)**: Creates and launches promotional campaigns, analyzes campaign ROI, runs A/B tests to optimize player engagement
- **Casino Operator**: Monitors active campaigns, adjusts campaign parameters based on performance, manages player segments and progression systems
- **Retention Manager**: Configures player level progression and badge systems to maximize long-term player engagement and reduce churn
- **Campaign Analyst**: Reviews campaign analytics, generates performance reports, identifies optimization opportunities
- **Platform Administrator**: Manages team access, sets up user roles and permissions, oversees campaign compliance across operators

## Success Criteria

The Back Office Campaign Management system will be considered successful when:

1. **Time Efficiency**: Marketing teams can create and launch a complete campaign (mission, bonus, or tournament) in under 10 minutes without developer support
2. **Campaign Volume**: Operators run 5+ concurrent campaigns per operator with zero technical bottlenecks
3. **User Adoption**: 80%+ of campaign creation activity happens through the Back Office (not custom development)
4. **Performance Visibility**: Campaign managers can view real-time performance metrics (participation rate, completion rate, ROI) within 5 seconds of opening analytics dashboard
5. **Self-Service Success**: 90%+ of campaign modifications happen without contacting support or development teams
6. **Team Productivity**: Multiple team members can collaborate on campaigns simultaneously with clear role separation (creator, reviewer, approver)
7. **Campaign Accuracy**: Preview mode correctly represents campaign behavior with 99%+ accuracy before publishing

## User Scenarios & Testing

### Scenario 1: Marketing Manager Creates Weekend Mission Campaign

**User Story**: As a marketing manager, I want to create a "Weekend Warrior" mission that rewards VIP players who bet $100 on slots 5 times during Saturday-Sunday, so that I can increase weekend engagement and contribute to their level progression.

**Steps:**
1. User logs into Back Office and navigates to Missions
2. User clicks "Create New Mission"
3. User configures mission details:
   - Name: "Weekend Warrior"
   - Description: "Complete betting tasks this weekend for rewards!"
   - Completion XP: 500 (XP awarded when all tasks complete, contributes to level progression)
   - Target Segment: VIP Only
   - Schedule: Saturday 00:00 - Sunday 23:59
4. User adds Task 1:
   - Task Name: "Place 5 bets of $100+"
   - Trigger Type: Bet Placed
   - Trigger Min Amount: $100
   - Goal Type: Bet Count
   - Target Count: 5
   - Bonus Reward: (Optional) Select "50 Free Spins" bonus template
5. User can add more tasks if needed (multi-task mission)
6. User clicks "Save as Draft" to save progress
7. User clicks "Save & Publish" when ready to activate
8. System validates tasks have proper triggers/goals and publishes mission

**Acceptance Criteria:**
- Mission builder loads in under 3 seconds
- Task-based form is intuitive with clear sections for Trigger, Goal, and Reward
- Completion XP field shows info tooltip: "This XP contributes to player's level progression"
- Mission card in list shows: task count, XP reward, bonus count
- Draft saves without requiring complete task configuration
- Publish validates all tasks have triggers and goals configured
- Publish action takes effect within 60 seconds
- User receives confirmation and is redirected to mission list

**Edge Cases:**
- User selects invalid date range (end before start) - system shows clear error message
- User tries to publish without any tasks - system shows validation error
- User tries to publish with incomplete task (no goal) - system highlights missing fields
- User accidentally closes browser - draft can be recovered via edit
- User sets 0 XP - allowed (mission grants only bonus rewards, no XP)

### Scenario 2: Operator Monitors Active Campaign Performance

**User Story**: As a casino operator, I want to view real-time performance of all active campaigns, so that I can identify underperforming campaigns and make adjustments.

**Steps:**
1. User navigates to Active Campaigns dashboard
2. System displays table of all live campaigns with key metrics:
   - Campaign name, type, status
   - Active players count
   - Participation rate (% of eligible players engaged)
   - Completion rate (% of participants who completed)
   - Total cost (rewards distributed)
   - ROI (revenue generated vs cost)
3. User clicks on specific campaign to view detailed analytics
4. User sees hourly performance trends and player activity graphs
5. User identifies low participation and decides to adjust reward amount
6. User clicks "Edit Campaign" and increases reward
7. System updates live campaign and shows confirmation

**Acceptance Criteria:**
- Dashboard loads all campaign data in under 5 seconds
- Metrics refresh automatically every 30 seconds without page reload
- Campaign list supports filtering by type, status, date range
- Editing active campaign shows warning about impact on current participants
- Changes to live campaigns take effect within 2 minutes
- Audit log tracks all campaign modifications with user and timestamp

**Edge Cases:**
- No active campaigns exist - dashboard shows helpful "Create Your First Campaign" message
- Campaign ended during viewing session - status updates automatically without refresh
- User lacks permission to edit - edit button is disabled with tooltip explanation
- Extreme values (1M+ players) - metrics display with readable formatting (1.2M, not 1,234,567)

### Scenario 3: Marketing Team Runs A/B Test for Bonus Campaign

**User Story**: As a marketing analyst, I want to A/B test two deposit bonus offers (50% vs 100% match) to determine which generates higher player lifetime value.

**Steps:**
1. User creates first bonus campaign: "50% Match Bonus"
   - Deposit match: 50%
   - Max bonus: $100
   - Wagering requirement: 30x
   - Target: New players
2. User duplicates campaign and modifies to create variant B: "100% Match Bonus"
   - Deposit match: 100%
   - Max bonus: $200
   - Wagering requirement: 40x
   - Target: New players (same segment)
3. User enables A/B test mode and assigns 50/50 traffic split
4. User sets test duration: 7 days
5. User defines success metric: "Player lifetime value after 30 days"
6. System automatically assigns new players to variant A or B randomly
7. After 7 days, user reviews A/B test results showing:
   - Variant A: 250 players, $15,000 LTV average
   - Variant B: 250 players, $18,500 LTV average
   - Winner: Variant B (23% higher LTV, statistically significant)
8. User clicks "Apply Winner" to deactivate variant A and keep variant B live

**Acceptance Criteria:**
- Campaign duplication copies all settings except name
- A/B test setup completes in under 2 minutes
- Traffic split is truly random and balanced (within 5% tolerance)
- System prevents overlapping A/B tests on same player segment
- Results include statistical significance indicators
- "Apply Winner" action preserves all historical data for both variants

**Edge Cases:**
- Test duration ends mid-day - system completes current day before stopping
- Insufficient sample size - system warns user and suggests longer duration
- Variants perform equally - system recommends "no clear winner" and suggests extended test
- User tries to edit variant during active test - system blocks edit and shows warning

### Scenario 4: Retention Manager Configures Player Level System

**User Story**: As a retention manager, I want to create a VIP progression system where players earn XP from bets, deposits, and mission completions, advance through Bronze/Silver/Gold/Platinum/Diamond tiers, and receive rewards at milestone levels, so that I can drive long-term player engagement and loyalty.

**Steps:**
1. User navigates to Level Systems section in Back Office
2. User clicks "Create Level System"
3. User configures basic settings:
   - Name: "VIP Progression 2025"
   - Max Level: 100
   - Progression Curve: Exponential (each level requires 1.5x more XP)
   - Base XP Required: 100 (level 1→2)
4. User defines tier structure:
   - Bronze: Levels 1-10 (color: #CD7F32)
   - Silver: Levels 11-25 (color: #C0C0C0)
   - Gold: Levels 26-50 (color: #FFD700)
   - Platinum: Levels 51-75 (color: #E5E4E2)
   - Diamond: Levels 76-100 (color: #B9F2FF)
5. User adds XP earning rules:
   - Bet: 1 XP per $10 wagered (daily cap: 1000 XP)
   - Deposit: 5 XP per $10 deposited (no cap)
   - Tournament Participation: 50 XP per tournament
   - Tournament Win: 200 XP per win
   - Daily Login: 10 XP per day
6. User configures level-up rewards:
   - Level 10 (Bronze max): 50 Free Spins
   - Level 25 (Silver max): $25 Cash Bonus
   - Level 50 (Gold max): "Gold Celebration" Bonus Template
   - Level 75 (Platinum max): "Platinum Exclusive" Bonus Template
   - Level 100 (Diamond): "Diamond VIP Package" Bonus Template
7. User configures tier benefits:
   - Silver: 2% Cashback Boost
   - Gold: 5% Cashback Boost, VIP Support access
   - Platinum: 8% Cashback Boost, VIP Support, Exclusive Tournaments
   - Diamond: 15% Cashback Boost, VIP Support, Exclusive Tournaments, Higher Withdrawal Limits
8. User optionally enables demotion rules:
   - Inactive for 90 days: Drop one tier
   - Warning notification: 7 days before demotion
   - Preserve XP within demoted tier
9. User clicks "Save" to save as Draft
10. User clicks "Activate" to make level system live
11. System warns: "Activating this will pause any currently active level system"
12. User confirms - new level system becomes active

**Acceptance Criteria:**
- Level system builder loads in under 3 seconds
- XP calculation preview shows sample level progression (levels 1-20 with XP thresholds)
- Tier level ranges must be contiguous (no gaps or overlaps)
- Only one level system can be active per operator at a time
- Activating a new system automatically pauses the previous one
- Level-up rewards can reference existing Bonus Templates
- XP earning rules support caps to prevent abuse
- Draft saves without requiring complete configuration
- Activate validates all tiers cover level 1 to max level

**Edge Cases:**
- User sets tier ranges with gaps (e.g., Bronze 1-10, Gold 15-50) - system shows validation error
- User sets overlapping tier ranges (e.g., Bronze 1-15, Silver 10-25) - system shows validation error
- User tries to activate without any tiers defined - system shows validation error
- Player is mid-level when system changes - player retains XP, mapped to nearest equivalent level
- XP rule has 0 amount - system allows (disables that XP source)

### Scenario 5: Administrator Manages Team Permissions

**User Story**: As an administrator, I want to grant my marketing team permission to create campaigns but require my approval before publishing, so that I maintain quality control.

**Steps:**
1. Admin navigates to User Management section
2. Admin clicks "Create Role" and defines "Marketing Creator" role with permissions:
   - Can create campaigns
   - Can save drafts
   - Can preview campaigns
   - Cannot publish campaigns (requires approval)
   - Can view analytics (read-only)
3. Admin assigns "Marketing Creator" role to 3 team members
4. Admin creates "Campaign Approver" role with permissions:
   - Can view all drafts
   - Can publish campaigns
   - Can edit active campaigns
   - Full analytics access
5. Admin assigns "Campaign Approver" role to themselves and 1 senior manager
6. Marketing team member creates campaign and saves as draft
7. Draft appears in "Pending Approval" queue for approvers
8. Approver reviews draft, adds comment, and approves
9. System publishes campaign automatically upon approval

**Acceptance Criteria:**
- Role creation supports granular permission selection (10+ permission types)
- Permission changes take effect immediately (no logout required)
- Users see only permitted actions in UI (disabled/hidden buttons)
- Approval queue shows all pending drafts with submission date
- Approvers can reject drafts with required comment explaining reason
- Audit log tracks all permission changes and approval actions

**Edge Cases:**
- User with active campaigns has permissions revoked - campaigns continue running but user cannot edit
- Last approver removes own approval permission - system warns and requires assigning new approver first
- Multiple approvers approve simultaneously - first approval wins, others notified
- User tries to access restricted action via URL - system redirects with permission error

### Scenario 6: Marketing Manager Creates Multi-Game Mission

**User Story**: As a marketing manager, I want to create a "Crazy Spins in December" mission where players complete tasks across specific games (Wukong, Candy Land, Olympub), so that I can promote multiple slot games in a single campaign.

**Steps:**
1. User logs into Back Office and navigates to Missions
2. User clicks "Create New Mission"
3. User configures mission details:
   - Name: "Crazy Spins in December"
   - Description: "Complete these game challenges to win amazing rewards!"
   - Completion XP: 1000
   - Target Segment: All Players
   - Schedule: December 1-31
4. User adds Task 1 "Spin Wukong 10 times":
   - Task Name: "10 spins in Wukong"
   - Trigger Type: Bet Placed
   - Eligible Games: wukong
   - Goal Type: Bet Count
   - Target Count: 10
5. User adds Task 2 "Spin Candy Land 20 times":
   - Task Name: "20 spins in Candy Land"
   - Trigger Type: Bet Placed
   - Eligible Games: candy-land
   - Goal Type: Bet Count
   - Target Count: 20
6. User adds Task 3 "Wager $20 in Olympub":
   - Task Name: "Wager $20 in Olympub"
   - Trigger Type: Bet Placed
   - Eligible Games: olympub
   - Goal Type: Wagered Amount
   - Target Amount: $20
7. User clicks "Save & Publish"
8. System validates all tasks and publishes mission

**Acceptance Criteria:**
- Eligible Games field appears when trigger type is "Bet Placed" or "Game Played"
- User can enter multiple game IDs as comma-separated values (e.g., "wukong, candy-land")
- Empty Eligible Games means "all games" qualify for the trigger
- Mission card shows game-specific tasks in preview
- Mission details page displays eligible games for each task
- Task summary shows: "Bet Placed (wukong) → Bet Count: 10"

**Edge Cases:**
- User enters invalid game ID - mission still saves (game validation happens at runtime)
- User wants multiple games for one task - can enter comma-separated IDs (e.g., "wukong, candy-land")
- User leaves Eligible Games empty - all games count toward the trigger
- User copies/duplicates mission - eligible games configuration is preserved

## Functional Requirements

### FR-1: Campaign Builder - Mission Configuration (Task-Based)
**Priority:** Critical

**Description:** Users must be able to create and configure mission campaigns through a task-based builder. Each mission consists of one or more tasks, where each task defines a trigger (what starts tracking), a goal (what to achieve), and an optional bonus template reward. **Mission-level completion XP** is awarded when all tasks are completed, contributing directly to the player's level progression (see FR-5).

**Architecture:**
- **Mission**: Container with name, description, completion XP, schedule, and player targeting
- **Tasks**: List of 1+ tasks that must be completed
- **Task**: Trigger + Goal + Optional Bonus Template reward
- **Completion XP**: XP awarded when ALL tasks complete (contributes to player level progression)
- **Per-Task Bonus**: Optional bonus template reference per task (granted when specific task completes)

**XP Integration:**
- Missions use `completionXp` field (0-100,000 XP range)
- XP is added to player's total XP when mission completes
- Player level advancement is handled by the active Level System (FR-5)
- 0 XP is valid for missions that only grant bonus rewards

**Acceptance Criteria:**
- [ ] Mission builder uses task-based form UI (not drag-and-drop visual builder)
- [ ] Each mission requires at least one task to be published
- [ ] Mission-level completion XP field with range 0-100,000
- [ ] Completion XP info tooltip explains: "This XP contributes to player's level progression"
- [ ] Task trigger types: Bet Placed, Deposit Made, Game Played, Daily Login
- [ ] Task goal types: Bet Count, Deposit Amount, Wagered Amount, Turnover Amount, Login Count
- [ ] Users can set numeric thresholds for triggers (minimum bet amount, etc.)
- [ ] Goal configuration supports count-based (complete 5 times) and value-based (wager $1000 total) goals
- [ ] Per-task bonus reward is optional - references a Bonus Template from the Bonus system
- [ ] Tasks can be reordered via up/down controls
- [ ] Schedule supports one-time and date range campaigns (start date, end date)
- [ ] Player segment targeting supports tier-based (All Players, VIP Only)
- [ ] Mission card preview shows task count, XP reward, and bonus count
- [ ] Draft saves without full validation (allows incomplete configuration)
- [ ] Publish action validates all tasks have valid triggers and goals
- [ ] Published missions activate within 60 seconds and appear to eligible players immediately

### FR-2: Campaign Builder - Bonus Configuration
**Priority:** Critical

**Description:** Users must be able to create deposit bonuses, free spins bonuses, cashback offers, and referral bonuses with configurable rules, wagering requirements, and expiration conditions.

**Acceptance Criteria:**
- [ ] Bonus builder supports 5+ bonus types (deposit match, fixed bonus, free spins, cashback, referral)
- [ ] Deposit match configuration allows percentage (50%, 100%, 200%) and maximum amount caps
- [ ] Wagering requirement configuration supports multipliers (20x, 30x, 40x) and applies to bonus amount or deposit+bonus
- [ ] Game contribution rules allow setting percentage per game type (slots 100%, table games 10%, etc.)
- [ ] Expiration settings support time-based (expires in 7 days) and wagering-based (expires when wagering complete)
- [ ] Minimum deposit thresholds prevent abuse (e.g., $20 minimum to claim)
- [ ] Gift code generation creates unique, single-use codes for distribution
- [ ] Preview shows bonus terms and conditions exactly as players will see them
- [ ] Multi-currency support displays correct amounts for each operator's currency
- [ ] Bonus activation can be automatic (on deposit) or manual (player claims via code)

### FR-2.1: Bonus-Mission Linked Flow (Turnover Requirements)
**Priority:** High

**Description:** Users must be able to link bonuses (especially free spins) to turnover missions, where bonus winnings are held in a locked balance until the player completes a wagering requirement tracked via a mission.

**Use Case Example:**
1. Player enters gift code → receives 50 free spins
2. Player wins $200 from spins → goes to Locked Balance
3. System creates linked mission: "Wager 5x ($1000) on eligible games"
4. Player completes turnover → $200 released to Real Balance

**Acceptance Criteria:**
- [ ] Bonus configuration includes "Winnings Destination" option (Real Balance / Locked Balance)
- [ ] When Locked Balance selected, Turnover Requirement section becomes available
- [ ] Turnover configuration supports multiplier (e.g., 5x) based on winnings or fixed amount
- [ ] Turnover can specify eligible games (defaults to same games as bonus)
- [ ] System auto-creates linked Mission when bonus with turnover is saved
- [ ] Linked mission uses new trigger type "BonusActivated" and goal type "TurnoverAmount"
- [ ] Linked mission reward is "ReleaseLockedBalance" (not cash/spins)
- [ ] Bonus details page shows link to view/manage linked mission
- [ ] Mission list indicates which missions are "Bonus-Linked" (auto-generated)
- [ ] Editing bonus turnover settings syncs changes to linked mission
- [ ] Deleting bonus cascade-deletes linked mission (if in Draft status)

**See:** [tasks-bonus-mission-integration.md](tasks-bonus-mission-integration.md) for implementation details

### FR-3: Campaign Builder - Tournament Configuration
**Priority:** High

**Description:** Users must be able to create tournament campaigns with bracket structures, prize pools, leaderboards, and scheduling that support competitive player engagement.

**Acceptance Criteria:**
- [ ] Tournament builder supports 3+ tournament types (leaderboard, bracket, time-based challenge)
- [ ] Leaderboard configuration allows scoring by points, highest win, most wins, wagering volume
- [ ] Prize pool distribution supports top-N winners (top 10 get prizes) with configurable prize amounts
- [ ] Entry requirements can be free, paid (entry fee), or invitation-only
- [ ] Tournament duration supports fixed time windows (24 hours, 7 days, 1 month)
- [ ] Real-time leaderboard updates visible to participants during active tournament
- [ ] Bracket tournaments support single/double elimination with automatic progression
- [ ] Prize distribution happens automatically when tournament ends
- [ ] Tie-breaking rules configurable (earliest achievement, random, split prize)
- [ ] Tournament preview shows complete rules, prize structure, and eligibility

### FR-4: Campaign Builder - Jackpot Configuration
**Priority:** High

**Description:** Users must be able to create progressive and fixed jackpots with contribution rates, trigger conditions, and prize distribution rules.

**Acceptance Criteria:**
- [ ] Jackpot builder supports progressive (grows with contributions) and fixed (static amount) types
- [ ] Progressive jackpot contribution rate configurable per game (0.5% of each bet)
- [ ] Trigger conditions support random (probability-based), value-based (bet threshold), and time-based (hourly drop)
- [ ] Seed amount configuration sets initial jackpot value
- [ ] Multi-tier jackpots support (mini, minor, major, grand) with independent triggers
- [ ] Prize distribution supports winner-takes-all or split among multiple players
- [ ] Reset behavior configurable (reset to seed, reset to zero, keep remainder)
- [ ] Eligible games selection allows inclusion/exclusion of specific games
- [ ] Maximum jackpot cap prevents runaway growth
- [ ] Jackpot preview shows current value, contribution rate, and trigger conditions

### FR-5: Player Level and Progression System
**Priority:** Critical

**Description:** Users must be able to configure player level systems with experience point (XP) mechanics, tier advancement rules, and level-based rewards to drive long-term player retention and engagement. **XP is the unified currency** - missions directly award XP (via completionXp field) that contributes to level progression.

**XP Architecture:**
- **Unified XP System**: All XP from any source (bets, deposits, missions, tournaments) contributes to the same player level
- **Mission XP**: Each mission has a `completionXp` field - XP awarded when ALL tasks are completed
- **Activity XP**: Level system defines XP rules for other activities (bets, deposits, tournaments, daily login)
- **No separate "Mission Points"**: The legacy "points" concept is replaced by XP for simplicity

**Acceptance Criteria:**
- [ ] Level system builder supports creating custom level structures (e.g., 1-100 levels with tier groupings)
- [ ] XP earning rules configurable per action type:
  - Bet: XP per wager amount (e.g., 1 XP per $10 wagered)
  - Deposit: XP per deposit amount (e.g., 5 XP per $10 deposited)
  - Tournament Participation: Fixed XP per tournament entered
  - Tournament Win: Fixed XP per tournament won
  - Daily Login: Fixed XP per login day
  - Referral: Fixed XP per successful referral
  - Badge Unlock: Fixed XP per badge earned
  - Custom: Operator-defined XP rules
- [ ] Mission XP is configured directly on missions (completionXp field), not in level system
- [ ] XP rules support daily caps to prevent abuse
- [ ] XP rules can optionally filter by eligible games
- [ ] Level thresholds define XP required to advance:
  - Linear curve: Each level requires baseXp × level (e.g., 100, 200, 300...)
  - Exponential curve: Each level requires baseXp × multiplier^(level-1) (e.g., 100, 150, 225...)
  - Custom curve: Manual XP thresholds per level (future)
- [ ] Tier configuration groups levels into tiers (Bronze: 1-10, Silver: 11-25, Gold: 26-50, Platinum: 51-75, Diamond: 76-100)
- [ ] Tier level ranges must be contiguous (no gaps) and non-overlapping
- [ ] Tier benefits define ongoing perks (cashback boost %, VIP support, withdrawal limit boost, exclusive tournaments, XP multiplier)
- [ ] Level-up rewards configurable per level (free spins, cash, bonus template, exclusive mission access, XP boost, badge)
- [ ] Level-up rewards can reference existing Bonus Templates from Bonus system
- [ ] Demotion rules configurable:
  - Inactive days threshold (e.g., 90 days without activity)
  - Demotion type: One tier, one level, or reset to bottom
  - Warning period before demotion (e.g., 7 days notice)
  - XP preservation option (keep XP within demoted tier vs reset)
- [ ] Only one level system can be active per operator at a time
- [ ] Activating a new system automatically pauses any currently active system
- [ ] Level progression preview shows XP thresholds, tier assignments, and rewards for levels 1-20
- [ ] Level system analytics show player distribution across levels and tier advancement rates

### FR-6: Badge and Achievement System
**Priority:** High

**Description:** Users must be able to create badges and achievements with unlock criteria, visual designs, and rewards to gamify player actions and encourage specific behaviors. Badges integrate with the Level System (FR-5) - unlocking badges can earn XP, and level-up rewards can grant badges.

**Badge Unlock Criteria Types:**
Badges are unlocked when players meet specific criteria. The following unlock criteria types are supported:

| Criteria Type | Description | Example | Threshold Type |
|---------------|-------------|---------|----------------|
| `MissionCompleted` | Complete a number of missions | "Complete 100 missions" | Count |
| `WagerAmount` | Cumulative wagering amount | "Wager $10,000 total" | Amount |
| `DepositAmount` | Cumulative deposit amount | "Deposit $5,000 total" | Amount |
| `BetCount` | Number of bets placed | "Place 1,000 bets" | Count |
| `TournamentWins` | Number of tournament victories | "Win 50 tournaments" | Count |
| `TournamentParticipations` | Number of tournaments entered | "Enter 100 tournaments" | Count |
| `LoginStreak` | Consecutive daily logins | "Login 30 days in a row" | Count (consecutive) |
| `TotalLogins` | Total login days (non-consecutive) | "Login 365 days total" | Count |
| `LevelReached` | Reach a specific level | "Reach level 50" | Level number |
| `TierReached` | Reach a specific tier | "Reach Gold tier" | Tier name |
| `GamePlayed` | Play specific game(s) N times | "Play Wukong 100 times" | Count + Game IDs |
| `FirstDeposit` | Make first deposit | "Welcome Deposit" | Boolean (one-time) |
| `FirstBet` | Place first bet | "First Spin" | Boolean (one-time) |
| `Custom` | Operator-defined criteria | Custom event trigger | Flexible |

**Badge Reward Types:**
When a badge is unlocked, optional rewards can be granted:

| Reward Type | Description | Configuration |
|-------------|-------------|---------------|
| `None` | Badge only (prestige) | No additional reward |
| `XpBoost` | XP earning multiplier | Multiplier (e.g., 1.5x) + Duration (hours) |
| `FreeSpins` | Free spin credits | Count + Game ID (optional) |
| `Cash` | Cash/credit bonus | Amount |
| `BonusTemplate` | Reference existing bonus | Bonus Template ID |

**Level System Integration:**
- **Badge → Level**: When a badge is unlocked, the Level System's `XpActionType.BadgeUnlock` rule triggers, awarding XP to the player
- **Level → Badge**: Level-up rewards can use `LevelRewardType.Badge` to automatically grant a badge when reaching a specific level

**Acceptance Criteria:**
- [ ] Badge builder supports creating custom badges with name, description, and icon upload
- [ ] Unlock criteria configuration supports all criteria types listed above
- [ ] Unlock criteria can specify threshold value (count or amount) and optional filters (game IDs, tier names)
- [ ] Badge rarity levels configurable (common, rare, epic, legendary) affecting prestige and display
- [ ] Badge rewards optional - select from None, XpBoost, FreeSpins, Cash, or BonusTemplate
- [ ] XpBoost rewards require multiplier (1.1x - 3.0x) and duration (1-168 hours)
- [ ] Hidden badges supported (criteria not revealed until unlocked for surprise/discovery)
- [ ] Badge series/collections for thematic grouping (e.g., "Slots Master" collection: Beginner, Intermediate, Expert, Master)
- [ ] Progress tracking visible to players (e.g., "Win 50 tournaments: 32/50 complete")
- [ ] Badge showcase allows players to display favorite badges on profile
- [ ] Badge analytics show unlock rates, most popular badges, and correlation with retention
- [ ] Badge preview shows how it appears in player widget and profile
- [ ] Badge unlock triggers `XpActionType.BadgeUnlock` in active Level System (awards XP per configured rule)
- [ ] Level-up rewards with `LevelRewardType.Badge` automatically grant specified badge to player

**Edge Cases:**
- Player already has badge when level-up grants it - no duplicate, no error (idempotent)
- Badge with criteria referencing deleted game - badge remains but cannot be earned from that game
- Hidden badge with progress tracking enabled - progress hidden until badge unlocked
- Badge series partially completed - show completed badges, hide locked ones if hidden flag set
- Player demoted below tier required for badge - badge retained (badges are permanent)

### FR-7: Player Segmentation and Targeting
**Priority:** Critical

**Description:** Users must be able to define player segments based on criteria (tier, activity, geography, behavior, level, badges) and target campaigns to specific segments for personalized engagement.

**Acceptance Criteria:**
- [ ] Segment builder supports 15+ criteria types (tier, level, badges, country, registration date, last activity, total deposits, etc.)
- [ ] Criteria support logical operators (AND, OR, NOT) for complex segment definitions
- [ ] Tier-based segments (Diamond, Platinum, Gold, Silver, Bronze, New) available as presets
- [ ] Level-based segments (Level 1-10, Level 11-25, Level 50+) available as presets
- [ ] Badge-based segments (Has "High Roller" badge, Missing "Welcome" badge) for targeting
- [ ] Activity-based segments (active in last 7 days, dormant 30+ days, high rollers) available as presets
- [ ] Custom segment creation allows combining multiple criteria with conditions
- [ ] Segment size estimation shows number of players matching criteria before saving
- [ ] Segments update dynamically as player data changes (no manual refresh required)
- [ ] Campaign targeting allows selecting one or multiple segments (union)
- [ ] Exclusion targeting prevents specific segments from seeing campaign (blacklist)
- [ ] Segment analytics show engagement metrics per segment (conversion rate, LTV, retention rate)

### FR-8: Campaign Scheduling and Automation
**Priority:** High

**Description:** Users must be able to schedule campaigns to start/end automatically, configure recurring schedules (daily, weekly, monthly), and queue campaigns for future activation.

**Acceptance Criteria:**
- [ ] Schedule builder supports immediate activation, specific date/time, and recurring patterns
- [ ] Recurring schedules support daily, weekly (specific days), monthly (specific dates), and custom intervals
- [ ] Time zone configuration ensures campaigns activate at correct local time for each operator
- [ ] Future campaigns show in "Scheduled" status with countdown to activation
- [ ] Auto-deactivation triggers when end date/time reached
- [ ] Campaign queue shows all scheduled campaigns in chronological order
- [ ] Schedule conflicts detected and warned (overlapping campaigns on same segment)
- [ ] Emergency stop allows immediate deactivation of active campaign
- [ ] Schedule preview shows calendar view of all upcoming campaign activations
- [ ] Timezone-aware scheduling displays correct activation time for user's location

### FR-9: Active Campaign Monitoring and Management
**Priority:** Critical

**Description:** Users must be able to view all active campaigns in a centralized dashboard, monitor real-time performance metrics, and make adjustments to live campaigns without stopping them.

**Acceptance Criteria:**
- [ ] Active campaigns dashboard shows all live campaigns with status indicators
- [ ] Dashboard displays key metrics per campaign: active players, participation rate, completion rate, cost, ROI
- [ ] Real-time metric updates every 30 seconds without page reload
- [ ] Filtering supports campaign type, date range, player segment, performance thresholds
- [ ] Sorting allows ordering by any metric column (ascending/descending)
- [ ] Campaign detail view shows hourly performance trends and player activity graphs
- [ ] Edit live campaign workflow warns about impact on current participants
- [ ] Parameter adjustments (reward amount, eligibility) apply to new participants only (preserves existing)
- [ ] Emergency pause stops new enrollments but allows current participants to complete
- [ ] Audit log tracks all modifications with timestamp, user, and changed values

### FR-10: Campaign Analytics and Reporting
**Priority:** High

**Description:** Users must be able to view comprehensive campaign performance analytics, generate custom reports, and export data for external analysis.

**Acceptance Criteria:**
- [ ] Analytics dashboard loads performance data within 5 seconds
- [ ] Key metrics displayed: total participants, completion rate, total cost, revenue generated, ROI
- [ ] Performance trends visualized as line graphs (hourly, daily, weekly views)
- [ ] Player engagement funnel shows drop-off at each campaign stage
- [ ] Cohort analysis compares performance across player segments
- [ ] Custom report builder allows selecting date ranges, metrics, and grouping dimensions
- [ ] Export functionality supports CSV, Excel, and PDF formats
- [ ] Scheduled reports can be emailed daily/weekly to stakeholders
- [ ] Comparative analytics show campaign performance vs historical averages
- [ ] Attribution tracking shows which campaigns drive most revenue/retention

### FR-11: A/B Testing Framework
**Priority:** Medium

**Description:** Users must be able to create A/B test experiments comparing two campaign variants, automatically split traffic, and analyze results to determine winning strategy.

**Acceptance Criteria:**
- [ ] A/B test creation duplicates base campaign and allows variant modification
- [ ] Traffic split configuration supports 50/50, 70/30, 80/20, and custom ratios
- [ ] Player assignment is random, consistent (same player always sees same variant), and balanced
- [ ] Test duration configuration sets automatic end date or sample size target
- [ ] Success metrics configurable (participation rate, completion rate, LTV, revenue)
- [ ] Statistical significance calculation shows confidence level in results
- [ ] Results dashboard compares both variants across all metrics
- [ ] Winner selection automatically deactivates losing variant and keeps winner live
- [ ] Overlapping test prevention blocks running multiple tests on same segment simultaneously
- [ ] Test history preserves data from all variants for future analysis

### FR-12: Campaign Templates and Duplication
**Priority:** Medium

**Description:** Users must be able to save successful campaigns as reusable templates, duplicate existing campaigns for faster setup, and share templates across team members.

**Acceptance Criteria:**
- [ ] Save as template option available on any campaign with custom template name
- [ ] Template library shows all saved templates with preview cards
- [ ] Template creation from campaign copies all configuration except dates and names
- [ ] Duplicate campaign creates exact copy with "(Copy)" appended to name
- [ ] Template application pre-fills campaign builder with template values
- [ ] Template editing updates template without affecting campaigns created from it
- [ ] Template sharing allows setting visibility (private, team, organization-wide)
- [ ] Default templates provided for common campaign types (welcome bonus, weekend mission, etc.)
- [ ] Template categories organize templates by type (mission, bonus, tournament)
- [ ] Template search supports filtering by name, type, creator, date created

### FR-13: User Role and Permission Management (Operator-Scoped)
**Priority:** High

**Description:** Administrators must be able to create custom user roles with granular permissions, assign roles to team members within their operator, and manage access control for campaign operations. All users, roles, and permissions are strictly scoped by operator - Casino A's users cannot access Casino B's data.

**Acceptance Criteria:**
- [ ] Role builder supports creating custom roles with permission selection (operator-scoped)
- [ ] Permission types include: create, edit, delete, publish, view analytics, manage users, approve campaigns
- [ ] Role assignment allows assigning multiple users to a role within same operator only
- [ ] Permission changes take effect immediately without requiring logout
- [ ] Users see only permitted actions in UI (disabled or hidden buttons/menus)
- [ ] Approval workflow requires designated approver role to publish campaigns (operator-scoped)
- [ ] Audit log tracks all role assignments and permission changes with operator context
- [ ] Role deletion requires reassigning users to different role first (no orphaned users)
- [ ] Preset roles provided (Admin, Manager, Creator, Analyst, Viewer) per operator
- [ ] Permission inheritance allows creating roles based on existing roles within operator
- [ ] Cross-operator access completely blocked - Casino A users cannot view Casino B campaigns/players/analytics
- [ ] User login includes operator selection if user belongs to multiple operators (rare edge case)

### FR-14: Draft and Publish Workflow
**Priority:** High

**Description:** Users must be able to save campaigns as drafts, preview campaigns before publishing, and manage single-level approval workflows (operator-scoped) for quality control.

**Acceptance Criteria:**
- [ ] Save draft action stores campaign without publishing (not visible to players)
- [ ] Auto-save preserves work every 30 seconds and on navigation away
- [ ] Draft recovery restores unsaved changes if browser crashes
- [ ] Draft list shows all user's drafts with last modified date
- [ ] Preview mode accurately simulates player view of campaign
- [ ] Publish validation checks all required fields and shows error messages for missing data
- [ ] Approval queue shows pending drafts for users with approver role (operator-scoped)
- [ ] Any user with approver role can approve drafts within their operator
- [ ] Approver can review, comment, approve, or reject drafts
- [ ] Rejection requires comment explaining reason for rejection
- [ ] Operators can disable approval requirement if desired (direct publish allowed)
- [ ] Published campaigns cannot revert to draft (only pause/deactivate)

### FR-15: Budget Management and Spend Controls
**Priority:** Medium

**Description:** Operators must be able to set global spending limits (monthly or weekly) across all campaigns and receive warnings when approaching budget thresholds to prevent excessive reward costs.

**Acceptance Criteria:**
- [ ] Budget settings allow operators to configure monthly or weekly spending limits
- [ ] Spending tracker aggregates real-time costs from all active campaigns
- [ ] Warning notifications trigger at 80% (warning), 90% (critical), and 100% (over budget) thresholds
- [ ] Budget dashboard shows current spend vs limit with trend projection
- [ ] Over-budget status does not hard-block campaign creation (warnings only)
- [ ] Budget warnings display prominently when creating/publishing new campaigns
- [ ] Spending includes all reward costs (free spins value, cash bonuses, tournament prizes, jackpots)
- [ ] Budget period resets automatically (start of month for monthly, start of week for weekly)
- [ ] Historical budget performance viewable for past periods
- [ ] Budget alerts can be sent via email to designated stakeholders

### FR-16: Data Retention and Archival
**Priority:** Medium

**Description:** System must automatically archive campaign data after 90 days of campaign completion, preserving summary statistics while removing detailed metrics to optimize storage costs.

**Acceptance Criteria:**
- [ ] Active campaigns retain all detailed data indefinitely until completion
- [ ] Completed campaigns retain detailed metrics for 90 days after completion date
- [ ] Archive warning sent to campaign creators 7 days before archival (prompts export)
- [ ] Archived campaigns preserve summary statistics (total participants, final ROI, total cost, completion rate)
- [ ] Archived campaigns remove detailed data (hourly metrics, individual player participation)
- [ ] Archive process runs automatically daily for campaigns past retention period
- [ ] Users can manually export campaign data before archival (CSV, Excel, PDF)
- [ ] Archived campaign list shows limited data with "Archived" status indicator
- [ ] Archive date displayed on archived campaigns
- [ ] Future enhancement: Operators can configure custom retention periods (3, 6, 12 months)

## Non-Functional Requirements

### NFR-1: Performance
- Dashboard loads complete campaign list (up to 100 active campaigns) in under 5 seconds
- Campaign builder opens and renders all configuration options in under 3 seconds
- Real-time metrics update every 30 seconds with no perceptible UI lag
- Analytics graphs render with 10,000+ data points in under 2 seconds
- Campaign publish action completes and activates campaign within 60 seconds
- Search and filter operations return results in under 1 second
- Export operations (CSV/Excel) complete for datasets up to 100,000 rows in under 30 seconds

### NFR-2: Scalability
- System supports 100+ concurrent users creating/editing campaigns simultaneously
- Database handles 1,000+ active campaigns per operator without performance degradation
- Analytics queries aggregate data from 10M+ player events efficiently
- User interface remains responsive with 1,000+ campaigns in dashboard list
- A/B testing framework supports 10+ concurrent tests without traffic allocation conflicts

### NFR-3: Reliability
- System uptime target: 99.9% (excluding planned maintenance)
- Campaign activation must succeed 99.99% of the time (failures auto-retry)
- Auto-save must preserve draft data with 99.999% reliability (no data loss)
- Metrics refresh failures must not crash UI (graceful degradation)
- Database backup frequency: hourly with 30-day retention

### NFR-4: Security and Multi-Tenant Data Isolation
- Authentication required for all Back Office access (OAuth2/SAML)
- Role-based access control (RBAC) enforces permissions at API level
- **Operator-level data isolation**: All database queries automatically filtered by `operatorId` from user's authentication context
- **Zero cross-operator access**: Casino A users cannot query, view, or modify Casino B data under any circumstance
- **API-level isolation**: All REST endpoints validate `operatorId` matches authenticated user's operator
- **Database-level isolation**: Row-level security (RLS) enforces operator filtering at database layer
- Audit logging captures all campaign modifications with user identification and operator context
- Data encryption at rest and in transit (TLS 1.3)
- Session timeout after 30 minutes of inactivity
- SQL injection and XSS prevention on all user inputs
- CSRF protection on all state-changing operations
- Compliance with GDPR for EU operators (data export, deletion per operator)

### NFR-5: Accessibility
- WCAG 2.1 Level AA compliance for all UI components
- Keyboard navigation functional for all workflows (tab order, shortcuts)
- Screen reader compatibility (ARIA labels, semantic HTML)
- Color contrast ratios meet 4.5:1 minimum for text
- Focus indicators visible for all interactive elements
- Form validation messages clear and actionable
- Alternative text for all images and icons

### NFR-6: Usability
- New users can create first campaign in under 10 minutes without training
- Help tooltips available on all complex configuration options
- Error messages provide actionable guidance (not just "Error occurred")
- Undo/redo functionality for campaign builder actions
- Responsive design supports desktop (1920x1080), laptop (1366x768), and tablet (768x1024) resolutions
- Localization support for 5+ languages (English, Spanish, French, German, Portuguese)

## Key Entities

### Mission
Represents a mission campaign with task-based configuration. **Operator-scoped**: Each mission belongs to exactly one operator.

**Architecture:** Missions use a task-based structure where each mission contains one or more tasks. Each task defines a trigger (what starts tracking), a goal (what to achieve), and an optional bonus template reward. **Mission-level completion XP** is awarded when all tasks are completed, contributing directly to the player's level progression.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Mission name
- Description (optional)
- Status (Draft, Active, Completed, Cancelled)
- **Completion XP** (0-100,000 - XP awarded when ALL tasks complete, contributes to level progression)
- **Tasks** (list of MissionTask objects - at least 1 required for publishing)
- Player segment targeting (All Players, VIP Only)
- Start date
- End date
- Created date
- Last modified date

### Mission Task
Represents a single task within a mission. Each task defines what the player needs to do to make progress.

**Attributes:**
- Unique identifier (within mission)
- Task name
- Description (optional)
- Order (display/execution order)
- **Trigger** (what starts tracking progress):
  - Type: Bet Placed, Deposit Made, Game Played, Daily Login
  - Min Amount (optional - minimum threshold)
  - Eligible Games (optional - list of game IDs that qualify for trigger, e.g., ["wukong", "candy-land"])
- **Goal** (what to achieve):
  - Type: Bet Count, Deposit Amount, Wagered Amount, Turnover Amount, Login Count
  - Target Count (for count-based goals)
  - Target Amount (for value-based goals)
  - Eligible Games (optional - games that count toward goal)
- **Bonus Template ID** (optional - references a Bonus Template to grant when this task completes)

### Campaign (Generic)
Represents a gamification campaign (bonus, tournament, or jackpot) with configuration, status, and performance data. **Operator-scoped**: Each campaign belongs to exactly one operator.

**Note:** Missions are now managed separately with task-based architecture (see Mission entity above).

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Campaign name
- Campaign type (bonus, tournament, jackpot)
- Status (draft, scheduled, active, paused, completed, archived)
- Configuration (type-specific rules and rewards)
- Player segment targeting
- Schedule (start date, end date, recurring pattern)
- Created by (user ID + operator ID)
- Created date
- Last modified date
- Performance metrics (participants, completions, cost, revenue)

### Player Segment
Represents a group of players matching specific criteria for targeted campaign delivery. **Operator-scoped**: Each segment belongs to one operator and only includes players from that operator.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Segment name
- Criteria definition (tier, level, badges, country, activity, behavior)
- Estimated player count (only players from this operator)
- Created by (user ID + operator ID)
- Created date
- Last refreshed date

### User Role
Represents a set of permissions assigned to Back Office users for access control. **Operator-scoped**: Roles are defined per operator. Casino A's "Admin" role is independent from Casino B's "Admin" role.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Role name
- Permission list (create, edit, delete, publish, approve, view analytics, manage users)
- Created date
- Modified date

### A/B Test
Represents an experiment comparing two campaign variants to determine optimal strategy. **Operator-scoped**: A/B tests only compare campaigns within same operator.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Test name
- Variant A (campaign configuration)
- Variant B (campaign configuration)
- Traffic split ratio
- Start date
- End date or sample size target
- Success metric definition
- Results (variant A metrics, variant B metrics, statistical significance)
- Status (running, completed, winner applied)
- Created by (user ID + operator ID)

### Campaign Template
Represents a reusable campaign configuration saved for future use. **Operator-scoped**: Templates can be shared within operator but not across operators.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Template name
- Campaign type
- Configuration (pre-filled values)
- Visibility (private, team within operator, organization-wide within operator)
- Created by (user ID + operator ID)
- Created date
- Usage count (how many campaigns created from this template within operator)

### Player Level System
Represents the progression system configuration with levels, XP requirements, and tier structure. **Operator-scoped**: Each operator configures their own level system independently.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- System name
- Total levels (e.g., 1-100)
- Tier definitions (Bronze, Silver, Gold, Platinum, Diamond with level ranges)
- XP earning rules (action → XP mapping)
- Level thresholds (XP required per level)
- Level-up rewards (rewards granted at each level)
- Tier benefits (ongoing perks per tier)
- Demotion rules (conditions for tier downgrade)
- XP boost multipliers (event-based XP modifiers)
- Status (active, draft, archived)
- Created by (user ID + operator ID)
- Created date
- Last modified date

### Badge
Represents an achievement badge with unlock criteria and rewards. **Operator-scoped**: Each operator creates their own badges. Casino A players cannot earn Casino B badges.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Badge name
- Description
- Icon/image URL
- Rarity level (common, rare, epic, legendary)
- **Unlock Criteria**:
  - Criteria Type (MissionCompleted, WagerAmount, DepositAmount, BetCount, TournamentWins, TournamentParticipations, LoginStreak, TotalLogins, LevelReached, TierReached, GamePlayed, FirstDeposit, FirstBet, Custom)
  - Threshold Value (count or amount depending on criteria type)
  - Eligible Games (optional - list of game IDs for GamePlayed criteria)
  - Target Tier (optional - tier name for TierReached criteria)
  - Target Level (optional - level number for LevelReached criteria)
- **Reward** (optional):
  - Reward Type (None, XpBoost, FreeSpins, Cash, BonusTemplate)
  - Value (amount for Cash, count for FreeSpins, multiplier for XpBoost)
  - Duration Hours (for XpBoost - how long the boost lasts)
  - Game ID (optional - for FreeSpins on specific game)
  - Bonus Template ID (for BonusTemplate reward type)
- Hidden status (criteria revealed or hidden until unlocked)
- Badge series/collection ID (grouping for related badges within operator)
- Order within series (display order in collection)
- Progress tracking enabled (yes/no - show progress to players)
- Unlock count (how many players from this operator unlocked - analytics)
- Status (Draft, Active, Archived)
- Created by (user ID + operator ID)
- Created date
- Last modified date

### Badge Series
Represents a thematic grouping of related badges. **Operator-scoped**.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Series name (e.g., "Slots Master", "High Roller", "Tournament Champion")
- Description
- Icon/image URL
- Badges (list of badge IDs in this series)
- Display order (for ordering series in UI)
- Status (Draft, Active, Archived)
- Created date

## Assumptions

1. **Authentication System Exists**: Operators already have user accounts and authentication mechanism (OAuth2/SAML) in place. Back Office integrates with existing identity provider.

2. **Player Data Available**: Player information (tier, country, last active date, deposit history) is accessible via existing Smartico API for segmentation purposes.

3. **Campaign Execution Engine Exists**: Backend systems for processing missions, bonuses, tournaments, and jackpots are already implemented. Back Office creates campaign configurations consumed by these engines.

4. **Real-Time Event Streaming**: Player events (bets, deposits, wins) are already captured and streamed to Smartico platform for real-time campaign triggering.

5. **Currency Handling**: Multi-currency conversion and display is handled by existing platform services. Back Office displays amounts in operator's default currency.

6. **Notification System Separate**: Back Office creates campaigns but does not send player notifications. Separate notification service handles email/SMS when campaigns trigger.

7. **Multi-Tenant Architecture with Operator Isolation**: Back Office supports multiple operators (casino A, casino B, game provider C) in a single deployment with strict data isolation. All data (campaigns, players, analytics, users, roles) is scoped by `operatorId`. Casino A cannot view, edit, or access any data from Casino B. User authentication includes operator context, and all API calls are filtered by operator.

8. **Browser Support**: Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+). No IE11 support required.

9. **Desktop-First Design**: Primary usage on desktop/laptop. Tablet support secondary. Mobile phone not supported (screen too small for complex campaign builder).

10. **English Primary Language**: Initial release supports English UI. Localization to other languages can be added post-MVP.

## Dependencies

### External Dependencies
- **Smartico Core API**: Provides player data, campaign execution, event streaming (required for all campaign operations)
- **Identity Provider**: OAuth2/SAML authentication for Back Office users (required for login)
- **Analytics Database**: Time-series database for storing campaign performance metrics (required for reporting)

### Internal Dependencies
- **Mission Engine**: Processes mission campaigns created in Back Office (must support mission config format)
- **Bonus Engine**: Processes bonus campaigns created in Back Office (must support bonus config format)
- **Tournament Engine**: Processes tournament campaigns created in Back Office (must support tournament config format)
- **Jackpot Engine**: Processes jackpot campaigns created in Back Office (must support jackpot config format)
- **Level Progression Engine**: Processes XP earning, level advancement, and tier changes (must support level system config)
- **Badge Achievement Engine**: Tracks badge unlock criteria and awards badges when conditions met (must support badge config)
- **Player Segmentation Service**: Evaluates player criteria including level/badges and returns matching player lists (required for targeting)
- **Notification Service**: Sends player notifications when campaigns trigger, levels up, or badges unlock (optional but recommended)

## Resolved Design Decisions

### Decision 1: Campaign Approval Workflow (RESOLVED)

**Question**: Should draft campaigns require multi-level approval or single-level approval before publishing?

**Decision**: Single-level approval scoped per operator. Each operator can designate one or more users with "Approver" role. Any designated approver can publish drafts created within their operator instance.

**Rationale**: Simpler workflow enables faster campaign launch while maintaining quality control. Operator-scoped approval ensures appropriate governance without cross-operator complexity.

**Implementation Notes**:
- Approval workflow is operator-specific (no cross-operator approvals)
- Multiple users can have approver role (any one can approve)
- Approval is optional - operators can disable approval requirement if desired
- Future enhancement: Multi-level approval can be added if operators request it

---

### Decision 2: Campaign Historical Data Retention (RESOLVED)

**Question**: How long should historical campaign data be retained and accessible?

**Decision**: 90-day retention with archival. Detailed campaign metrics (participants, performance, costs) retained for 90 days. After 90 days, data is archived (summary statistics preserved, detailed data removed).

**Rationale**: Balances storage costs with immediate analysis needs. 90 days sufficient for campaign optimization and reporting. Export functionality allows operators to preserve critical data externally before archival.

**Implementation Notes**:
- Active campaigns: Data retained indefinitely until campaign ends
- Completed campaigns: 90 days detailed retention after completion date
- Archived campaigns: Summary statistics only (total participants, final ROI, total cost)
- Export before archive: System warns users 7 days before archival, prompts export
- Future enhancement: Configurable retention periods per operator (3 months, 6 months, 1 year)

---

### Decision 3: Campaign Budget Controls (RESOLVED)

**Question**: Should the Back Office enforce campaign budget limits?

**Decision**: Global operator budgets with warning thresholds. Operators can set monthly or weekly spending limits across all campaigns. System warns when approaching limit (80%, 90%, 100%) but does not hard-block campaign creation.

**Rationale**: Provides organization-wide spend control and financial planning without completely blocking urgent campaigns. Warning-based approach allows operators to make informed decisions while maintaining flexibility.

**Implementation Notes**:
- Budget configuration: Operators set monthly or weekly limits in Back Office settings
- Spending tracking: Real-time aggregation of all campaign costs (rewards distributed)
- Warning levels: Notifications at 80% (warning), 90% (critical), 100% (over budget)
- No hard blocks: Campaigns can still be created/published when over budget (with clear warnings)
- Budget dashboard: Operators view current spend vs limit with trend projections
- Future enhancement: Campaign-level budgets and auto-pause when budget exhausted

---

## Change Log

| Version | Date       | Author       | Changes                                                                                                    |
| ------- | ---------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-01-24 | AI Assistant | Initial specification draft                                                                                |
| 1.1.0   | 2025-01-24 | AI Assistant | Resolved 3 design decisions, added FR-13 (Budget) and FR-14 (Retention)                                   |
| 1.2.0   | 2025-01-24 | AI Assistant | Added FR-5 (Player Levels), FR-6 (Badges), updated scope, entities, dependencies, target users            |
| 1.3.0   | 2025-01-24 | AI Assistant | **CRITICAL**: Clarified multi-tenant operator isolation - all data scoped by operatorId, zero cross-access |
| 1.4.0   | 2025-01-27 | AI Assistant | **ARCHITECTURE CHANGE**: Missions now use task-based builder instead of visual drag-and-drop. Updated FR-1, Scenario 1, added Mission and Mission Task entities. Tasks have Trigger + Goal + Optional Bonus Template reward. Mission-level completion points replace node-based rewards. |
| 1.5.0   | 2025-01-28 | AI Assistant | **UNIFIED XP SYSTEM**: Replaced "Completion Points" with "Completion XP" across missions. XP directly contributes to player level progression (FR-5). Added Scenario 4 for Level System configuration. Updated FR-1, FR-5, and Mission entity. Removed MissionComplete XP action type (missions now award XP directly). |
| 1.6.0   | 2025-11-30 | AI Assistant | **BADGE SYSTEM DETAIL**: Added concrete Badge Unlock Criteria Types (14 types including MissionCompleted, WagerAmount, LoginStreak, etc.), Badge Reward Types (None, XpBoost, FreeSpins, Cash, BonusTemplate), Level System integration notes, edge cases, and expanded Badge entity attributes. Added Badge Series entity. |

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] UX Designer: [Name] - [Date]
- [ ] Marketing Stakeholder: [Name] - [Date]

---

**Document Status:** Draft - Ready for Validation
**Clarifications:** All resolved (see Resolved Design Decisions section)
**Next Steps:** Run specification quality validation, then proceed to planning phase
