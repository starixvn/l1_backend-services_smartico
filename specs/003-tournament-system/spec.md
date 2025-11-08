# Tournament System - Feature Specification

**Version:** 1.0.0
**Created:** 2025-11-08
**Last Updated:** 2025-11-08
**Status:** Draft
**Author:** AI Assistant

## Overview

### Purpose

The Tournament System enables users to participate in competitive events with leaderboards and prizes, creating engagement through gamified competition. Users can discover tournaments, register to participate, track their performance on leaderboards, and compete for rewards based on their rankings.

This feature addresses the need for structured competitive experiences within the platform, allowing users to:
- Compete against other users in time-bound events
- Track their progress and ranking in real-time
- Win rewards based on their final placement
- Discover and join tournaments that match their interests and skill levels

### Scope

**In Scope:**
- Viewing list of available tournaments with filtering and sorting
- Displaying tournament details including rules, prizes, and timelines
- Registering for tournaments (free and paid entry)
- Viewing real-time leaderboards with participant rankings
- Showing user's personal tournament statistics and position
- Real-time updates for tournament events (registrations, leaderboard changes, winners)
- Prize structure display with place-based rewards
- Tournament status management (upcoming, active, finished, cancelled)
- Registration validation (balance checks, player limits, eligibility)
- Featured tournaments with visual indicators
- Tournament filtering by status, section, and featured flag
- MVP demo data for at least 3 tournaments in different states

**Out of Scope:**
- Tournament creation and administration interfaces
- Prize fulfillment and distribution mechanisms
- Tournament scheduling and automation
- Advanced tournament formats (bracket, elimination)
- Tournament replay or history viewing beyond basic stats
- Multi-stage or multi-round tournaments
- Team-based tournaments
- Tournament chat or social features
- Integration with external tournament platforms
- Tournament analytics and reporting for administrators

### Target Users

- **Casual Players**: View tournaments, register for free events, check their ranking
- **Competitive Players**: Monitor leaderboards closely, register for high-stake tournaments, optimize performance
- **Prize Seekers**: Browse prize structures, register for tournaments with valuable rewards, track winnings
- **New Users**: Discover available tournaments, understand rules and requirements, participate in entry-level events

## User Scenarios & Testing

### Scenario 1: Discovering and Joining a Tournament

**Actors:** New User

**Flow:**
1. User navigates to tournaments section
2. System displays list of available tournaments ordered by priority
3. User filters tournaments by "upcoming" status
4. User selects a free tournament to view details
5. System shows tournament information including:
   - Name, description, and images
   - Start and end times
   - Prize pool summary
   - Current registration count and player limits
   - Prize structure breakdown
   - Registration requirements
6. User clicks "Register" button
7. System validates:
   - Tournament is open for registration
   - User meets eligibility conditions
   - Maximum player limit not reached
   - User is not already registered
8. System confirms registration and updates UI to show "Registered" status
9. User receives real-time confirmation
10. Registration count increments across all users viewing the tournament

**Success Criteria:**
- User can filter and discover tournaments in under 10 seconds
- Registration process completes in under 3 seconds
- Real-time registration count updates within 1 second
- User clearly understands tournament rules and prize structure before registering

### Scenario 2: Monitoring Leaderboard During Active Tournament

**Actors:** Registered User, Other Participants

**Flow:**
1. User opens an active tournament they're registered in
2. System displays leaderboard showing:
   - User's current position highlighted
   - Top 10 participants with usernames, avatars, and scores
   - User's current score
   - Prize structure showing which positions win which rewards
3. User performs actions that earn tournament points
4. System updates user's score and position in real-time
5. Other participants' scores update as they progress
6. User drops from 5th to 7th position
7. System immediately reflects position change with visual indicator
8. User sees prize structure and notes they're still in "2nd-10th place" prize tier
9. User continues competing to improve position
10. Tournament ends at scheduled time
11. System freezes leaderboard and displays final rankings
12. User sees final placement and prize won (if qualified)

**Success Criteria:**
- Leaderboard updates appear within 2 seconds of score changes
- User can identify their position within 1 second of viewing leaderboard
- Prize structure clearly shows which positions earn which rewards
- Real-time updates don't disrupt user experience or cause UI flicker
- Final rankings are accurate and reflect qualifying score requirements

### Scenario 3: Attempting to Register for Paid Tournament

**Actors:** User with Insufficient Balance

**Flow:**
1. User browses tournaments and finds a premium event
2. Tournament details show "Entry Fee: 500 Points"
3. User has only 300 points in their account
4. User clicks "Register (500 Points)" button
5. System validates user's point balance
6. System displays error message: "Insufficient points. You have 300, but 500 are required."
7. User sees clear indication of:
   - Required amount (500 points)
   - Current balance (300 points)
   - Shortage amount (200 points)
8. User cannot complete registration until balance requirement is met
9. Registration button remains disabled with tooltip explaining why

**Success Criteria:**
- Balance validation occurs before registration attempt
- Error messages clearly state required vs. available balance
- User understands exactly what's needed to register
- System prevents invalid registrations without confusing the user

### Scenario 4: Viewing Tournament with Minimum Qualifying Score

**Actors:** Multiple Participants (some above, some below threshold)

**Flow:**
1. User opens active tournament with minimum qualifying score of 1000 points
2. Tournament details clearly state: "Minimum 1000 points required to win prizes"
3. User views leaderboard and sees:
   - Participants with 1000+ scores ranked normally
   - If hide_leaderboard_min_scores is enabled: participants below 1000 are hidden
   - If hide_leaderboard_min_scores is disabled: participants below 1000 shown with visual indicator they don't qualify
4. User has 750 points (below threshold)
5. System shows user their score with message: "You need 250 more points to qualify for prizes"
6. User continues playing and reaches 1050 points
7. System updates display to show user now qualifies
8. User sees visual confirmation they're eligible for prizes

**Success Criteria:**
- Minimum qualifying score is prominently displayed in tournament details
- Users can easily identify if they currently qualify for prizes
- Leaderboard clearly distinguishes qualifying vs. non-qualifying participants
- Users understand exactly how many points needed to qualify

## Functional Requirements

### FR-1: View Tournament List
**Priority:** Critical

**Description:** Users must be able to view a list of all tournaments, with filtering and sorting capabilities to find relevant events.

**Acceptance Criteria:**
- [ ] Display all tournaments with name, description, primary image, and status
- [ ] Show tournament timeline (start time, end time, duration)
- [ ] Display prize pool summary and registration cost
- [ ] Indicate current registration count and player limits (min/max)
- [ ] Show user's registration status for each tournament
- [ ] Display featured tournaments with ribbon indicators (sale, hot, new, vip, custom)
- [ ] Highlight tournaments by priority ordering
- [ ] Filter tournaments by status: all, upcoming, active, finished, cancelled
- [ ] Filter tournaments by featured flag
- [ ] Filter tournaments by custom section
- [ ] Sort tournaments by priority, start time, or prize pool
- [ ] Load and display tournaments within 2 seconds
- [ ] Support viewing on mobile with appropriate responsive images

**Edge Cases:**
- Empty tournament list shows helpful message
- Tournaments with no prizes display "No prizes" instead of empty prize structure
- Expired tournaments clearly marked as finished/cancelled
- Tournaments at max capacity show "Full" indicator

### FR-2: Register for Tournament
**Priority:** Critical

**Description:** Users must be able to register for tournaments, with proper validation of eligibility, balance, and player limits.

**Acceptance Criteria:**
- [ ] Allow registration for tournaments with status "upcoming" or "in registration period"
- [ ] Validate user has sufficient balance for paid tournaments (points, gems, or diamonds)
- [ ] Check maximum player limit and prevent registration when full
- [ ] Prevent duplicate registrations by same user
- [ ] Validate user meets segment conditions (if applicable)
- [ ] Display appropriate error message for each failure condition:
  - Insufficient balance: show required vs. available
  - Tournament full: show max capacity reached
  - Already registered: indicate user is already participating
  - Doesn't meet conditions: display segment_dont_match_message
  - Registration closed: indicate registration period ended
- [ ] Deduct registration cost from user's balance upon successful registration
- [ ] Update registration count immediately
- [ ] Broadcast registration event to all users viewing the tournament
- [ ] Confirm successful registration with visual feedback
- [ ] Update button state from "Register" to "Registered" after success
- [ ] Complete registration process within 3 seconds

**Edge Cases:**
- Tournament fills up while user is viewing details (show updated status)
- User balance changes during registration attempt (re-validate)
- Tournament cancelled after user registers (notify user, refund cost)
- Invite-only tournaments show appropriate access denied message

### FR-3: View Tournament Leaderboard
**Priority:** Critical

**Description:** Users must be able to view tournament rankings with participant information, scores, and prize structure.

**Acceptance Criteria:**
- [ ] Display participants ranked by score (highest to lowest)
- [ ] Show for each participant: position, username, avatar, score
- [ ] Highlight current user's position if registered
- [ ] Display current user's stats separately: position, score, username, avatar
- [ ] Show prize structure with place ranges (e.g., "1st place", "2nd-5th place", "6th-10th")
- [ ] Display for each prize: name, description, image, type, value (if points-based)
- [ ] Apply minimum qualifying score filter if configured
- [ ] Hide participants below qualifying score if hide_leaderboard_min_scores enabled
- [ ] Show visual indicator for participants who don't qualify for prizes
- [ ] Update leaderboard in real-time as scores change
- [ ] Load leaderboard within 2 seconds
- [ ] Support pagination for tournaments with 100+ participants
- [ ] Show external user ID and CRM brand ID for integration purposes

**Edge Cases:**
- Tied scores show same position number, next position skips appropriately
- User with 0 score still appears on leaderboard if registered
- Empty leaderboard (no participants) shows helpful message
- Prize structure with gaps (e.g., prizes for 1st and 10th but not 2nd-9th) displays clearly

### FR-4: View Tournament Details
**Priority:** High

**Description:** Users must be able to view comprehensive tournament information to make informed participation decisions.

**Acceptance Criteria:**
- [ ] Display all core tournament properties:
  - Instance ID and template ID
  - Name and description
  - Primary image, secondary image, and mobile image
  - Prize pool summary message
  - Custom price text
- [ ] Show complete prize structure with all prize tiers
- [ ] Display tournament timeline:
  - Start time (formatted date/time)
  - End time (formatted date/time)
  - Total duration
  - Time remaining (for active tournaments)
  - Time until start (for upcoming tournaments)
- [ ] Show registration information:
  - Registration type (free, paid points, paid gems, paid diamonds, invite-only)
  - Registration cost (if applicable)
  - Current registration count
  - Minimum and maximum player limits
  - Registration status for current user
- [ ] Display custom data if provided by operator
- [ ] Show segment eligibility message if user doesn't meet conditions
- [ ] Display current user's tournament stats if registered:
  - Current position
  - Current score
  - Public username
  - Avatar URL
- [ ] Indicate tournament status clearly:
  - Upcoming (with countdown to start)
  - In Progress (with countdown to end)
  - Finished (with final results)
  - Cancelled (with reason if available)
- [ ] Show custom section assignment
- [ ] Display ribbon if tournament is featured

**Edge Cases:**
- Tournaments with no custom data don't show empty section
- Tournaments without minimum qualifying score don't display threshold
- Missing images fall back to placeholder
- Custom data in various formats (JSON, string, number) displays appropriately

### FR-5: Real-time Tournament Updates
**Priority:** High

**Description:** Users must receive immediate notifications of tournament events without needing to refresh.

**Acceptance Criteria:**
- [ ] Broadcast tournament registration events when user registers
- [ ] Update registration count across all viewers within 1 second
- [ ] Broadcast leaderboard position changes during active tournaments
- [ ] Update individual participant scores in real-time
- [ ] Notify users when tournament status changes:
  - Upcoming → Active (tournament starts)
  - Active → Finished (tournament ends)
  - Any → Cancelled (tournament cancelled)
- [ ] Broadcast prize winners when tournament completes
- [ ] Update "can register" status when player limit reached
- [ ] Maintain update performance with 100+ concurrent viewers
- [ ] Handle connection interruptions gracefully (reconnect and sync state)
- [ ] Throttle updates during high-frequency score changes (maximum 1 update per second per user)

**Edge Cases:**
- User offline when tournament ends still sees correct final state on reconnect
- Multiple simultaneous registrations don't cause race conditions in count
- Rapid score changes don't flood UI with updates
- Connection loss during active tournament recovers without data loss

### FR-6: Tournament Stats and Filtering
**Priority:** Medium

**Description:** Users must be able to view aggregate tournament statistics and filter to find relevant events.

**Acceptance Criteria:**
- [ ] Display total tournaments count
- [ ] Show count of active tournaments
- [ ] Show count of user's registered tournaments
- [ ] Filter by tournament status:
  - All tournaments
  - Upcoming (PUBLISHED or REGISTER status)
  - In Progress (STARTED status)
  - Finished (FINISHED, CANCELLED, or FINALIZING status)
  - Cancelled (CANCELLED status)
- [ ] Filter by featured tournaments only
- [ ] Filter by custom section assignment
- [ ] Combine multiple filters (e.g., "featured AND upcoming")
- [ ] Sort results by:
  - Priority (ascending or descending)
  - Start time (ascending or descending)
  - Prize pool value (if comparable across tournaments)
- [ ] Update stats in real-time as tournaments change status
- [ ] Persist filter preferences during session
- [ ] Reset filters to default with single action

**Edge Cases:**
- No tournaments match filter criteria shows empty state with filter summary
- Stats update when user registers/unregisters from tournaments
- Featured tournaments without ribbon still included in featured filter
- Custom sections with no tournaments show in filter but indicate "0 tournaments"

## Success Criteria

The Tournament System will be considered successful when:

1. **Discovery & Engagement**
   - Users can find relevant tournaments within 10 seconds using filters
   - 70% of users who view tournaments understand prize structure without assistance
   - Featured tournaments receive 50% more views than non-featured ones

2. **Registration Process**
   - Tournament registration completes in under 3 seconds (95th percentile)
   - Registration error messages reduce support tickets by 60%
   - 90% of eligible users successfully register on first attempt
   - Registration abandonment rate below 15%

3. **Leaderboard Performance**
   - Leaderboard loads within 2 seconds for tournaments with up to 1000 participants
   - Real-time score updates appear within 2 seconds of score change
   - User can identify their position within 1 second of viewing leaderboard
   - Leaderboard updates maintain smooth rendering without UI flicker

4. **Real-time Updates**
   - Tournament event broadcasts reach all viewers within 1 second
   - System maintains real-time accuracy with 500 concurrent tournament viewers
   - Connection recovery restores accurate state within 3 seconds
   - Zero duplicate broadcasts or lost events

5. **User Comprehension**
   - 85% of users understand minimum qualifying score requirements
   - Users correctly identify their prize eligibility 95% of the time
   - Tournament timeline clarity reduces "when does it start?" questions by 70%
   - Registration requirement errors are self-explanatory without help documentation

6. **System Reliability**
   - Tournament system maintains 99.9% uptime
   - Zero data inconsistencies between tournament state and user view
   - Prize structure displays accurately across all place ranges
   - Registration count accuracy maintained under concurrent load

## Key Entities

### Tournament
Represents a competitive event with defined rules, timeline, and rewards.

**Key Attributes:**
- Instance identifier (unique per scheduled run)
- Template identifier (tournament template)
- Name and description (user-facing, translated)
- Visual assets (primary image, secondary image, mobile image)
- Prize pool summary message
- Custom pricing text
- Start time, end time, duration
- Registration type and cost
- Player limits (minimum, maximum)
- Current registration count
- Status flags (active, finished, cancelled, upcoming, in progress)
- Eligibility flags (can register, is user registered)
- Featured indicator and ribbon type
- Priority for ordering
- Custom section assignment
- Custom operator data
- Minimum qualifying score (optional)
- Leaderboard visibility rules

**Relationships:**
- Contains multiple Prizes (one-to-many)
- Has multiple Participants (many-to-many through registration)
- May have one current user Participation (one-to-one for logged-in user)

### Prize
Represents a reward awarded based on tournament placement.

**Key Attributes:**
- Name and description
- Image URL
- Place range (from position, to position)
- Prize type (points, bonus, manual, real money, free spins, custom)
- Point value (for points-based prizes)

**Relationships:**
- Belongs to one Tournament (many-to-one)
- Awarded to Participants based on final position

### Participant
Represents a user's participation in a specific tournament.

**Key Attributes:**
- Public username
- Avatar URL
- Current position in leaderboard
- Current score
- External user ID (for integration)
- CRM brand ID (for integration)
- Internal user ID

**Relationships:**
- Belongs to one Tournament (many-to-one)
- Represents one User (one-to-one)

### Registration
Represents a user's enrollment in a tournament.

**Key Attributes:**
- User identifier
- Tournament instance identifier
- Registration timestamp
- Registration status (registered, pending, failed)
- Payment amount (if paid entry)
- Payment currency type (points, gems, diamonds)

**Relationships:**
- Links User to Tournament (many-to-many join)

## Non-Functional Requirements

### NFR-1: Performance
- Tournament list loads within 2 seconds with up to 100 tournaments
- Tournament details display within 1.5 seconds
- Leaderboard renders within 2 seconds for tournaments with up to 1000 participants
- Real-time updates deliver within 1 second of event occurrence
- Registration validation completes within 500ms
- Filter and sort operations respond within 500ms
- Pagination loads next page within 1 second

### NFR-2: Scalability
- Support 10,000 concurrent users viewing tournaments
- Handle 1,000 concurrent users viewing same leaderboard
- Support tournaments with up to 10,000 registered participants
- Process 100 registrations per second during peak times
- Maintain performance with 1000+ active tournaments in system
- Leaderboard pagination supports unlimited participants (page size: 50)

### NFR-3: Reliability
- 99.9% uptime for tournament viewing
- 99.95% accuracy in registration count under concurrent load
- Zero data loss during real-time updates
- Automatic reconnection within 3 seconds after connection loss
- Transaction integrity for paid registrations (no double-charging or failed deductions)
- Leaderboard consistency (all users see same rankings within 2-second window)

### NFR-4: Security
- Validate all registration attempts server-side
- Prevent race conditions in player limit enforcement
- Ensure balance deductions are atomic and cannot be duplicated
- Protect against leaderboard manipulation
- Validate user eligibility based on segment conditions
- Rate limit tournament viewing to prevent scraping (100 requests per minute per user)
- Sanitize all user-generated content (usernames, avatars) in leaderboards

### NFR-5: Accessibility
- WCAG 2.1 AA compliance for all tournament interfaces
- Keyboard navigation for tournament list, details, and leaderboard
- Screen reader support with appropriate ARIA labels
- High contrast mode support for visual indicators (featured ribbons, status badges)
- Minimum 4.5:1 color contrast for text and interactive elements
- Focus indicators visible for all interactive components
- Alt text for all tournament images
- Clear error messages readable by screen readers
- Time-based elements (countdowns) have accessible alternatives

### NFR-6: Usability
- Tournament status immediately apparent through visual indicators
- Registration eligibility clear before user attempts registration
- Prize structure understandable within 10 seconds of viewing
- Error messages provide actionable next steps
- Real-time updates don't disrupt user's current view or focus
- Consistent terminology across all tournament interfaces
- Mobile-responsive design for smartphones and tablets
- Leaderboard position always visible without scrolling (for registered users)

## Assumptions

1. **Tournament Data Source**: Tournament configurations, prizes, and rules are managed externally (assumed to exist in Smartico API) and this feature only displays and interacts with existing tournaments

2. **Score Tracking**: Tournament scores are calculated and updated by external systems; this feature only displays the scores and rankings provided by the API

3. **Authentication**: Users are already authenticated before accessing tournament features; authentication and session management handled by existing platform infrastructure

4. **Currency Management**: User balances for points, gems, and diamonds are managed by existing wallet/balance system; tournament registration only validates and deducts from existing balances

5. **Prize Fulfillment**: Actual prize distribution (crediting points, triggering bonuses, manual prize handling) is handled by external systems after tournament completion; this feature only displays prize winners

6. **Timezone Handling**: Tournament times are provided in UTC epoch milliseconds; client-side converts to user's local timezone for display

7. **Image Hosting**: Tournament images are hosted externally; URLs provided by API are assumed to be accessible and optimized

8. **Localization**: Tournament names and descriptions are pre-translated by the system providing the data; this feature displays the translated strings

9. **User Data Privacy**: User avatars, usernames, and external IDs are already privacy-compliant; leaderboard display doesn't require additional consent

10. **Segment Eligibility**: User segment membership is determined by external system; this feature only checks the boolean eligibility flag and displays appropriate messages

11. **Connection Reliability**: Users have reasonably stable internet connections; brief disconnections (< 30 seconds) are recoverable without data loss

12. **Concurrent Access**: Multiple users can view and interact with same tournament simultaneously; system handles race conditions for registration and updates

## Dependencies

### External Systems
- **Smartico Tournament API**: Provides tournament data, registration endpoints, leaderboard data
- **Smartico Balance System**: Validates user balances, processes registration payments
- **Smartico Segment System**: Determines user eligibility based on segment conditions
- **Smartico Prize System**: Handles prize fulfillment after tournament completion

### Platform Services
- **Authentication Service**: Provides current user identity and session management
- **Real-time Communication Service**: SignalR for broadcasting tournament events
- **Caching Service**: 30-second TTL for tournament list and leaderboard data
- **Logging Service**: Records tournament interactions for analytics and debugging

### Frontend Dependencies
- **Existing UI Components**: Reuse design system components for consistency
- **Existing Navigation**: Tournament section integrates into main app navigation
- **Existing State Management**: Tournament state follows same patterns as Missions/Bonuses/MiniGames

## Open Questions

1. **Leaderboard Pagination Strategy**
   - **Context**: Tournaments could have thousands of participants
   - **Question**: Should we always show top N participants + user's position, or implement full pagination?
   - **Options**:
     - Option A: Show top 50 + user's position (if outside top 50) = simpler UX but limits discovery
     - Option B: Full pagination with "jump to my position" button = more complex but complete visibility
     - Option C: Hybrid - top 50 visible, pagination for rest, quick jump to user = balances both needs
   - **Recommendation**: Option C provides best user experience

2. **Registration Cost Currency Priority**
   - **Context**: Tournaments can cost points, gems, or diamonds
   - **Question**: Can tournaments require multiple currencies simultaneously, or only one at a time?
   - **Assumption**: Only one currency type per tournament (as shown in Smartico API structure)
   - **Validation Needed**: Confirm with Smartico API documentation

3. **Tournament Instance vs Template Handling**
   - **Context**: Tournaments have both instance_id (unique run) and tournament_id (template)
   - **Question**: Should UI distinguish between recurring tournaments (same template, different instances)?
   - **Options**:
     - Option A: Treat each instance completely independently = simpler but loses continuity
     - Option B: Group instances by template, show "previous runs" = adds complexity but shows history
     - Option C: MVP treats instances independently, future phase adds grouping = pragmatic approach
   - **Recommendation**: Option C for MVP scope

## Out of Scope (Explicitly Excluded)

The following features are NOT included in this specification:

1. **Tournament Administration**
   - Creating new tournaments
   - Editing tournament configuration
   - Cancelling or rescheduling tournaments
   - Managing prize pools
   - Setting eligibility rules

2. **Advanced Tournament Formats**
   - Bracket-style elimination tournaments
   - Multi-round/multi-stage tournaments
   - Team-based tournaments
   - Double elimination or Swiss system formats

3. **Social & Community Features**
   - Tournament chat or discussion boards
   - Sharing tournament results to social media
   - Following other participants
   - Tournament groups or clubs

4. **Historical & Analytics Features**
   - User's tournament history across all events
   - Performance analytics and statistics
   - Win/loss records
   - Average placement tracking
   - Earnings summaries

5. **Administrative Reporting**
   - Tournament participation reports
   - Prize distribution reports
   - Revenue analytics from paid entries
   - Fraud detection and monitoring

6. **Mobile Native Features**
   - Push notifications for tournament events
   - Native mobile app integration
   - Offline viewing of tournament details

## Change Log

| Version | Date       | Author       | Changes                                               |
|---------|------------|--------------|-------------------------------------------------------|
| 1.0.0   | 2025-11-08 | AI Assistant | Initial specification created from feature description|

---

**Document Status:** Draft
**Ready for:** Clarification and Planning Phases
