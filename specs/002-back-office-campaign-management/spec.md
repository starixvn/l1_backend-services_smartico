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
- Visual campaign builder with drag-and-drop condition/trigger/reward setup
- Player segmentation and targeting (tier-based, behavioral, custom criteria)
- Campaign scheduling (start/end dates, recurring schedules)
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

**User Story**: As a marketing manager, I want to create a "Weekend Warrior" mission that rewards VIP players who bet $100 on slots 5 times during Saturday-Sunday, so that I can increase weekend engagement.

**Steps:**
1. User logs into Back Office and navigates to Mission Builder
2. User clicks "Create New Mission" and selects mission template
3. User configures mission:
   - Name: "Weekend Warrior"
   - Trigger condition: "Bet placed on slots"
   - Trigger amount: $100
   - Goal: Complete 5 times
   - Reward: 50 Free Spins
   - Schedule: Saturday 00:00 - Sunday 23:59 (recurring weekly)
   - Player segment: VIP tier only
4. User clicks "Preview" to see how mission appears to players
5. User clicks "Save Draft" to save progress
6. User clicks "Publish" when ready to activate
7. System confirms mission is live and scheduled

**Acceptance Criteria:**
- Mission builder loads in under 3 seconds
- All configuration options are available without scrolling more than 2 screens
- Preview shows accurate mission card as players will see it
- Draft saves automatically every 30 seconds
- Publish action takes effect within 60 seconds
- User receives confirmation notification

**Edge Cases:**
- User selects invalid date range (end before start) - system shows clear error message
- User tries to publish without required fields - system highlights missing fields
- User accidentally closes browser - draft is preserved and recoverable
- Multiple users edit same campaign - last save wins with conflict notification

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

### Scenario 4: Administrator Manages Team Permissions

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

## Functional Requirements

### FR-1: Campaign Builder - Mission Configuration
**Priority:** Critical

**Description:** Users must be able to create and configure mission campaigns through a visual builder that supports trigger conditions, goals, rewards, scheduling, and player targeting without writing code.

**Acceptance Criteria:**
- [ ] Mission builder supports 8+ trigger types (bet placed, deposit made, game played, login, win amount, etc.)
- [ ] Users can set numeric thresholds for triggers (minimum bet amount, win multiplier, etc.)
- [ ] Goal configuration supports count-based (complete 5 times) and value-based (wager $1000 total) goals
- [ ] Reward selection includes free spins, cash bonus, bonus balance, tournament entries
- [ ] Schedule supports one-time, recurring daily/weekly/monthly, and date range campaigns
- [ ] Player segment targeting supports tier-based (VIP, new, dormant) and custom criteria (country, last active date)
- [ ] Mission preview accurately shows player-facing mission card with all configured details
- [ ] Draft auto-saves every 30 seconds and preserves unsaved changes if browser closes
- [ ] Publish action validates all required fields and shows clear error messages for missing data
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

**Description:** Users must be able to configure player level systems with experience point (XP) mechanics, tier advancement rules, and level-based rewards to drive long-term player retention and engagement.

**Acceptance Criteria:**
- [ ] Level system builder supports creating custom level structures (e.g., 1-100 levels with tier groupings)
- [ ] XP earning rules configurable per action (bet $10 = 1 XP, deposit $100 = 50 XP, mission complete = 100 XP)
- [ ] Level thresholds define XP required to advance (level 1→2 = 100 XP, level 2→3 = 250 XP, exponential/linear curves)
- [ ] Tier configuration groups levels into tiers (Bronze: 1-10, Silver: 11-25, Gold: 26-50, Platinum: 51-75, Diamond: 76-100)
- [ ] Level-up rewards configurable (free spins, cash bonus, exclusive mission access, higher cashback %)
- [ ] Tier benefits define ongoing perks (VIP support, higher withdrawal limits, exclusive tournaments)
- [ ] Demotion rules configurable (e.g., drop tier if inactive for 90 days, or no demotion ever)
- [ ] XP boost multipliers for special events (double XP weekends, 3x XP for new games)
- [ ] Level progression preview shows player journey and rewards at each milestone
- [ ] Level system analytics show player distribution across levels and tier advancement rates

### FR-6: Badge and Achievement System
**Priority:** High

**Description:** Users must be able to create badges and achievements with unlock criteria, visual designs, and rewards to gamify player actions and encourage specific behaviors.

**Acceptance Criteria:**
- [ ] Badge builder supports creating custom badges with name, description, and icon upload
- [ ] Unlock criteria support multiple trigger types (complete 100 missions, wager $10,000, win 50 tournaments, login 30 days in a row)
- [ ] Badge rarity levels configurable (common, rare, epic, legendary) affecting prestige and rewards
- [ ] Badge rewards optional (unlock badge only, or unlock + cash bonus, free spins, XP boost)
- [ ] Hidden badges supported (criteria not revealed until unlocked for surprise/discovery)
- [ ] Badge series/collections for thematic grouping (e.g., "Slots Master" collection: Beginner, Intermediate, Expert, Master)
- [ ] Progress tracking visible to players (e.g., "Win 50 tournaments: 32/50 complete")
- [ ] Badge showcase allows players to display favorite badges on profile
- [ ] Badge analytics show unlock rates, most popular badges, and correlation with retention
- [ ] Badge preview shows how it appears in player widget and profile

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

### Campaign
Represents a gamification campaign (mission, bonus, tournament, or jackpot) with configuration, status, and performance data. **Operator-scoped**: Each campaign belongs to exactly one operator.

**Attributes:**
- Unique identifier
- **Operator ID** (foreign key - determines data isolation boundary)
- Campaign name
- Campaign type (mission, bonus, tournament, jackpot)
- Status (draft, scheduled, active, paused, completed, archived)
- Configuration (trigger conditions, goals, rewards, rules)
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
- Unlock criteria (trigger type and threshold)
- Reward (optional: cash, free spins, XP boost)
- Hidden status (criteria revealed or hidden)
- Badge series/collection (grouping for related badges within operator)
- Progress tracking enabled (yes/no)
- Unlock count (how many players from this operator unlocked)
- Status (active, draft, archived)
- Created by (user ID + operator ID)
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

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] UX Designer: [Name] - [Date]
- [ ] Marketing Stakeholder: [Name] - [Date]

---

**Document Status:** Draft - Ready for Validation
**Clarifications:** All resolved (see Resolved Design Decisions section)
**Next Steps:** Run specification quality validation, then proceed to planning phase
