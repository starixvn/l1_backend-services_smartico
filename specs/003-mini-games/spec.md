# Mini Games - Feature Specification

**Version:** 1.0.0
**Created:** 2025-11-08
**Last Updated:** 2025-11-08
**Status:** Draft
**Author:** AI Specification Agent

## Overview

### Purpose

The Mini Games feature enables users to play interactive games (Spin the Wheel, Gift Box, Scratch Card, MatchX) and win prizes, increasing user engagement and retention through gamified experiences. Users can win various prize types including points, bonuses, spins, jackpots, and other rewards.

### Scope

**In Scope:**
- Display list of available mini games with details (name, description, thumbnail, game type)
- Show buy-in costs (points/gems/diamonds or free)
- Display game availability restrictions (cooldowns, limits, time windows)
- Execute game play with prize determination
- Award prizes immediately (points, spins, bonuses, etc.)
- Show prize history with filtering
- Real-time updates for jackpots and prize pool changes
- Game statistics and leaderboards
- Support for 11 prize types (no-prize, points, bonus, manual, spin, jackpot, change-level, mission, raffle-ticket, gems-and-diamonds, unknown)
- Integration with existing Missions & Badges infrastructure

**Out of Scope:**
- Custom game creation by users
- Multiplayer game modes
- Social sharing features
- Third-party game integrations
- Mobile-specific game animations (initial MVP)
- Prize redemption workflows (manual prizes)
- Payment processing for buy-ins
- Real money gambling features

### Target Users

- **Casino Players**: Play mini games to win free spins, bonuses, and jackpot prizes
- **Casual Gamers**: Engage with simple, quick-play games for instant rewards
- **Loyalty Program Members**: Redeem points/gems to play games and earn additional rewards
- **VIP Players**: Access exclusive high-value games and jackpot opportunities

## User Scenarios & Testing

### US1: View Available Mini Games

**Scenario**: Player browses available mini games
**Actors**: Registered player
**Preconditions**: User is logged in

**Steps**:
1. User navigates to Mini Games section
2. System displays list of available games with:
   - Game name, description, and thumbnail
   - Game type (Spin the Wheel, Gift Box, Scratch Card, MatchX)
   - Buy-in cost (Free, X points, X gems, X diamonds, X spins)
   - Jackpot amount (if enabled)
   - Next available play time (if cooldown active)
3. User filters games by type
4. System shows filtered results
5. User selects a game to view details
6. System displays full game information including prizes

**Expected Outcome**: User can easily browse and select games to play

**Edge Cases**:
- No games available for user's segment
- All game attempts exhausted (cooldown active)
- Game becomes unavailable while viewing (time window expired)
- Network interruption during game list loading

### US2: Play Mini Game

**Scenario**: Player plays a mini game and wins a prize
**Actors**: Registered player
**Preconditions**: User has sufficient balance for buy-in, game is available

**Steps**:
1. User clicks "Play" on selected game
2. System validates:
   - User has sufficient points/gems/diamonds/spins
   - Attempt limits not exceeded
   - Cooldown period elapsed
   - Game within active time window
3. System deducts buy-in cost from user balance
4. System executes game logic and determines prize
5. System displays win animation with prize details
6. System awards prize immediately:
   - Points: Added to points balance
   - Bonus: Triggers bonus template
   - Spin: Adds spin attempts
   - Jackpot: Awards jackpot amount
   - Gems/Diamonds: Added to respective balances
7. System shows acknowledgment message with action buttons (if configured)
8. System updates prize pool and jackpot (if applicable)
9. System broadcasts real-time event via SignalR

**Expected Outcome**: User successfully plays game and receives prize

**Edge Cases**:
- Insufficient balance during play attempt
- Prize pool depleted mid-game
- Network interruption during play
- Concurrent plays exhausting limits
- Manual prize requiring operator intervention
- Prize award failure (retry mechanism needed)

### US3: View Prize History

**Scenario**: Player reviews past wins
**Actors**: Registered player
**Preconditions**: User is logged in

**Steps**:
1. User navigates to Prize History
2. System displays list of won prizes:
   - Prize name and type
   - Prize value
   - Game name
   - Timestamp
3. User applies filters:
   - Date range
   - Prize type
   - Game type
4. System shows filtered results
5. User views prize details

**Expected Outcome**: User can review and filter their prize history

**Edge Cases**:
- No prizes won yet (empty state)
- Large prize history (pagination needed)
- Deleted/hidden prizes (hide_prize_from_history flag)

### US4: Real-time Updates

**Scenario**: Player receives live updates for game changes
**Actors**: All connected players
**Preconditions**: SignalR connection established

**Steps**:
1. Player views mini games list
2. Another player wins jackpot
3. System broadcasts "MiniGameJackpotWon" event via SignalR
4. All connected clients receive update
5. System updates jackpot display for all users
6. System shows notification toast (optional)

**Expected Outcome**: All users see live jackpot/prize pool updates

**Events to Broadcast**:
- `MiniGamePlayed`: When any user plays a game
- `MiniGamePrizeWon`: When prize is awarded
- `MiniGameJackpotWon`: When jackpot is won
- `MiniGamePoolUpdated`: When prize pool changes
- `MiniGameAvailable`: When new game becomes available

### US5: Game Stats and Leaderboards

**Scenario**: Player views game statistics
**Actors**: Registered player
**Preconditions**: User has played at least one game

**Steps**:
1. User navigates to Game Stats
2. System displays personal statistics:
   - Total games played
   - Total prizes won
   - Total points/gems/diamonds won
   - Biggest jackpot win
3. User views leaderboards:
   - Most games played
   - Most prizes won
   - Highest jackpot wins
4. System shows user's rank

**Expected Outcome**: User can track performance and compare with others

## Functional Requirements

### FR-1: Display Available Mini Games
**Priority:** Critical
**Description:** System must display list of all mini games available to the current user based on their segment, time windows, and limits.

**Acceptance Criteria:**
- [ ] List includes game name, description, thumbnail, and type
- [ ] Buy-in cost displayed clearly (points/gems/diamonds/free)
- [ ] Jackpot amount shown when enabled
- [ ] Next available play time shown when cooldown active
- [ ] Games outside active time windows are hidden
- [ ] Games can be filtered by type (Spin the Wheel, Gift Box, Scratch Card, MatchX)
- [ ] Empty state shown when no games available

### FR-2: Execute Game Play
**Priority:** Critical
**Description:** System must validate buy-in requirements, execute game logic, determine prize, and award it immediately.

**Acceptance Criteria:**
- [ ] Validates user has sufficient points/gems/diamonds/spins for buy-in
- [ ] Checks attempt limits (max per period) before allowing play
- [ ] Verifies cooldown period has elapsed
- [ ] Deducts buy-in cost from user balance
- [ ] Executes game logic and randomly selects prize based on prize pool
- [ ] Awards prize immediately based on type (points/bonus/spin/jackpot/etc.)
- [ ] Updates prize pool after play (decrements available items)
- [ ] Handles prize pool depletion gracefully (out-of-stock message)
- [ ] Broadcasts real-time event via SignalR on successful play

### FR-3: Prize Award System
**Priority:** Critical
**Description:** System must correctly award all 11 prize types with appropriate side effects.

**Acceptance Criteria:**
- [ ] NO_PRIZE: Shows "Better luck next time" message
- [ ] POINTS: Adds specified points to user balance
- [ ] BONUS: Triggers associated bonus template
- [ ] MANUAL: Creates operator task for manual prize fulfillment
- [ ] SPIN: Adds spin attempts to user's balance
- [ ] JACKPOT: Awards current jackpot amount and resets pool
- [ ] CHANGE_LEVEL: Triggers level progression logic
- [ ] MISSION: Unlocks specified mission for user
- [ ] RAFFLE_TICKET: Adds raffle entry for user
- [ ] GEMS_AND_DIAMONDS: Adds gems/diamonds to user balance
- [ ] UNKNOWN: Logs error and shows fallback message

### FR-4: Prize History Tracking
**Priority:** High
**Description:** System must maintain complete history of all prizes won by users.

**Acceptance Criteria:**
- [ ] Records all prize wins with timestamp
- [ ] Stores prize type, value, and game information
- [ ] Supports filtering by date range
- [ ] Supports filtering by prize type
- [ ] Supports filtering by game type
- [ ] Paginates results (20 items per page)
- [ ] Hides prizes with hide_prize_from_history flag set
- [ ] Shows empty state when no prizes won

### FR-5: Game Limits and Cooldowns
**Priority:** High
**Description:** System must enforce attempt limits and cooldown periods per game template configuration.

**Acceptance Criteria:**
- [ ] Tracks attempts per user per game per period (max_number_of_attempts)
- [ ] Enforces cooldown period between plays (max_spins_period_ms)
- [ ] Displays time remaining until next available play
- [ ] Shows "over limit" message when max attempts reached
- [ ] Resets attempt counters after period expires
- [ ] Supports relative time zones (relative_period_timezone)

### FR-6: Prize Pool Management
**Priority:** High
**Description:** System must manage prize inventory and prevent over-allocation.

**Acceptance Criteria:**
- [ ] Tracks prize pool inventory (pool field)
- [ ] Prevents allocation when pool = 0 (unless is_surcharge = true)
- [ ] Shows out-of-stock message when prize depleted
- [ ] Exposes pool stats when expose_game_stat_on_api enabled
- [ ] Updates pool atomically to prevent race conditions
- [ ] Supports prize modifiers (2x, 5x, 10x multipliers)

### FR-7: Real-time Game Updates
**Priority:** High
**Description:** System must broadcast game events to all connected clients via SignalR.

**Acceptance Criteria:**
- [ ] Broadcasts "MiniGamePlayed" when user plays game
- [ ] Broadcasts "MiniGamePrizeWon" when prize awarded
- [ ] Broadcasts "MiniGameJackpotWon" when jackpot won
- [ ] Broadcasts "MiniGamePoolUpdated" when prize pool changes
- [ ] Broadcasts "MiniGameAvailable" when new game activates
- [ ] Updates sent to user-specific groups (user:{userId})
- [ ] Global updates sent to all connected clients for jackpots
- [ ] Handles connection failures gracefully

### FR-8: Jackpot System
**Priority:** Medium
**Description:** System must manage progressive jackpots with contributions from each play.

**Acceptance Criteria:**
- [ ] Displays current jackpot amount (jackpot_current)
- [ ] Increments jackpot by contribution amount on each play (jackpot_add_on_attempt)
- [ ] Awards full jackpot when jackpot prize won
- [ ] Resets jackpot to seed amount after win
- [ ] Shows jackpot symbol (currency/item type)
- [ ] Broadcasts jackpot updates in real-time

### FR-9: Game Statistics
**Priority:** Medium
**Description:** System must track and display player-specific and global game statistics.

**Acceptance Criteria:**
- [ ] Tracks total games played per user
- [ ] Tracks total prizes won per user
- [ ] Tracks total value won per prize type
- [ ] Displays biggest jackpot win
- [ ] Shows global leaderboards (top players by wins)
- [ ] Updates statistics in real-time after each play

### FR-10: Time-based Availability
**Priority:** Medium
**Description:** System must show/hide games based on time windows and schedules.

**Acceptance Criteria:**
- [ ] Hides games before activeFromDate
- [ ] Hides games after activeTillDate
- [ ] Supports weekday restrictions (weekdays array)
- [ ] Respects time zone configuration
- [ ] Shows countdown to next availability

## Non-Functional Requirements

### NFR-1: Performance
- API response time for game list: < 200ms (p95)
- Game play execution time: < 500ms (p95)
- Prize award processing: < 300ms (p95)
- Prize history loading: < 300ms (p95)
- SignalR event latency: < 100ms
- Database query time: < 50ms per query

### NFR-2: Scalability
- Support 10,000 concurrent players
- Handle 100 game plays per second
- Support 1000 SignalR connections per hub instance
- Prize history supports up to 100,000 records per user
- Leaderboards support up to 1 million players

### NFR-3: Reliability
- Uptime target: 99.9%
- Recovery time objective (RTO): 15 minutes
- Recovery point objective (RPO): 5 minutes
- Automatic retry for failed prize awards (3 attempts)
- Graceful degradation if SignalR unavailable

### NFR-4: Caching
- Game list cached for 30 seconds
- Prize pool cached for 10 seconds
- User balance cached for 5 seconds
- Cache invalidation on mutations
- Distributed cache for multi-instance deployments

### NFR-5: Consistency
- Prize pool updates must be atomic (prevent over-allocation)
- Balance deductions must be transactional
- Prize awards must be idempotent (prevent duplicates)
- Eventually consistent for statistics/leaderboards

## Success Criteria

1. **User Engagement**: Users play an average of 5+ mini games per session
2. **Prize Award Success**: 99.5%+ of prize awards complete successfully
3. **Performance**: Game play completes in under 500ms for 95% of requests
4. **Real-time Updates**: SignalR events delivered within 100ms to 95%+ of clients
5. **Availability**: Games available 99.9%+ of the time
6. **Error Rate**: < 0.1% of game plays result in errors
7. **User Satisfaction**: 80%+ of users find games fun and engaging (survey)
8. **Prize Pool Accuracy**: 100% accuracy in prize allocation (no over-allocation)

## Assumptions

1. Users already have points/gems/diamonds balances managed by existing system
2. Smartico API provides reliable mini game templates and prize configurations
3. Frontend can handle game-specific animations (client-side responsibility)
4. Operator manually fulfills MANUAL prize types within 24 hours
5. Prize values are configured correctly in Smartico Backoffice
6. Game types (Spin the Wheel, etc.) use standard UI components
7. User authentication already handled by existing JWT middleware
8. Rate limiting at API gateway level prevents abuse
9. Database supports concurrent transactions with row-level locking

## Dependencies

### Internal Services
- **Smartico Bonus API**: Required for BONUS prize type
- **Smartico Mission API**: Required for MISSION prize type
- **User Balance Service**: Required for points/gems/diamonds operations
- **SignalR Hub**: Required for real-time updates (existing /hubs/progress)
- **Cache Service**: Required for performance optimization (existing MemoryCacheService)

### External APIs
- **Smartico API**: Provides mini game templates, prizes, and play logic
  - GET mini game templates: `smartico.api.getMiniGameTemplates()`
  - Play mini game: `smartico.api.playMiniGame(template_id)`

## Key Entities

### MiniGameTemplate
Primary entity representing a mini game configuration.

**Source**: Smartico API `TMiniGameTemplate`

**Key Fields**:
- `id` (number): Unique template identifier
- `name` (string): Localized game name
- `description` (string): Localized game description
- `thumbnail` (string): Game icon URL
- `saw_game_type` (enum): Game type (spin/giftbox/scratch/matchx)
- `saw_buyin_type` (enum): Buy-in type (free/points/gems/diamonds/spin)
- `buyin_cost_points` (number): Points cost (optional)
- `buyin_cost_gems` (number): Gems cost (optional)
- `buyin_cost_diamonds` (number): Diamonds cost (optional)
- `spin_count` (number): Current spin attempts (optional)
- `next_available_spin_ts` (number): Next play timestamp (cooldown)
- `jackpot_current` (number): Current jackpot amount
- `jackpot_add_on_attempt` (number): Jackpot contribution per play
- `prizes` (TMiniGamePrize[]): List of available prizes
- `max_number_of_attempts` (number): Max plays per period
- `max_spins_period_ms` (number): Period duration in milliseconds
- `activeFromDate` (number): Start timestamp
- `activeTillDate` (number): End timestamp

### MiniGamePrize
Entity representing a prize within a mini game.

**Source**: Smartico API `TMiniGamePrize`

**Key Fields**:
- `id` (number): Unique prize identifier
- `name` (string): Prize display name
- `prize_type` (MiniGamePrizeTypeName): Type of prize
- `prize_value` (number): Numeric value (for points/spins)
- `icon` (string): Prize icon URL
- `pool` (number): Items remaining in stock
- `pool_initial` (number): Initial stock amount
- `wins_count` (number): Total wins recorded
- `aknowledge_message` (string): Win notification message
- `acknowledge_dp` (string): Deep link for action button
- `acknowledge_action_title` (string): Action button text
- `out_of_stock_message` (string): Shown when pool depleted
- `is_surcharge` (boolean): Always available regardless of pool
- `hide_prize_from_history` (boolean): Hide from history display

### MiniGamePlayResult
Entity representing the outcome of a game play attempt.

**Source**: Smartico API `TMiniGamePlayResult`

**Key Fields**:
- `err_code` (SAWSpinErrorCode): Error code (0 = success)
- `err_message` (string): Error description
- `prize_id` (number): Won prize ID

### MiniGamePlayHistory
Entity for tracking prize wins (internal storage).

**Key Fields**:
- `id` (string): Unique record ID
- `userId` (string): User who won the prize
- `gameId` (number): Game template ID
- `gameName` (string): Game name (snapshot)
- `prizeId` (number): Prize ID
- `prizeName` (string): Prize name (snapshot)
- `prizeType` (MiniGamePrizeTypeName): Prize type
- `prizeValue` (number): Prize value (optional)
- `timestamp` (DateTime): When prize was won
- `acknowledged` (boolean): Whether user acknowledged win

## Open Questions

**None** - All requirements clarified based on Smartico API reference and existing patterns.

## Change Log

| Version | Date       | Author                  | Changes                |
|---------|------------|-------------------------|------------------------|
| 1.0.0   | 2025-11-08 | AI Specification Agent  | Initial specification  |

---

**Document Status:** Draft
**Next Step:** `/speckit.plan` to create implementation plan
**Estimated Effort:** 3-4 weeks (following Missions & Bonuses pattern)
