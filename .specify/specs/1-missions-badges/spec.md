# Missions & Badges - Feature Specification

**Version:** 1.1.0
**Created:** 2024-10-29
**Last Updated:** 2024-10-29
**Status:** Draft - Backend Migration (.NET 9)
**Author:** System Architect

## Constitution Alignment

This specification adheres to the following constitutional principles:

- **Code Quality:** SOLID principles and Clean Code standards applied
- **Testing:** AAA pattern with single assertions per test
- **UX Consistency:** Design system compliance and WCAG 2.1 AA accessibility
- **Performance:** Meets defined performance budgets
- **Type Safety:** Full TypeScript strict mode compliance

## Overview

### Purpose

The Missions & Badges feature implements a comprehensive gamification system that motivates users through achievement-based rewards and recognition. Users complete missions to earn prizes and badges, creating an engaging experience that drives platform usage and user retention.

**Value Proposition:**
- Increases user engagement through goal-oriented challenges
- Provides clear progression paths and rewards
- Builds user loyalty through recognition (badges)
- Drives specific user behaviors aligned with business goals

### Scope

**In Scope:**
- Mission display and progress tracking
- Badge collection and display system
- Mission opt-in functionality
- Prize/reward claiming
- Real-time progress updates
- Category-based organization
- Time-limited missions
- Recurring missions
- Multi-task missions
- Related game associations
- Mission and badge history
- Filter and search capabilities

**Out of Scope:**
- Mission creation and configuration (handled by Smartico backend)
- Reward fulfillment (integration with existing reward systems)
- User authentication (leverages existing auth)
- Payment processing for purchased missions
- Social sharing features (future phase)
- Leaderboard integration (separate feature)

### Target Users

- **Active Players**: Users who regularly engage with platform content and want achievement goals
- **Casual Players**: Users seeking occasional objectives and rewards to enhance their experience
- **Completionists**: Users motivated by collecting all badges and completing all available missions
- **New Users**: Users exploring platform features through guided mission paths

## Requirements

### Functional Requirements

#### FR-1: Mission Discovery and Display
**Priority:** Critical
**Description:** Users must be able to discover missions through a tabbed interface, view their details, and understand what's required to complete them.

**Acceptance Criteria:**
- [ ] Tabbed interface with "Active" | "Available" | "Completed" | "Expired" tabs
- [ ] Each tab shows missions for that specific status
- [ ] Tab badges display count of missions in each status
- [ ] Filter and sort controls within each tab (by category, time, rewards)
- [ ] Search functionality to find missions across all tabs
- [ ] Each mission displays name, description, reward, and current progress
- [ ] Users can view detailed mission information including all tasks
- [ ] Mission images and visual assets are displayed correctly
- [ ] Time-limited missions show remaining time
- [ ] Recurring missions show next availability time

#### FR-2: Mission Progress Tracking
**Priority:** Critical
**Description:** Users must see server-confirmed updates on their progress toward completing missions.

**Acceptance Criteria:**
- [ ] Progress percentage is displayed for each active mission
- [ ] Individual task completion status is shown
- [ ] Progress updates appear without page refresh (via WebSocket or polling)
- [ ] Loading indicator shown during server confirmation (max 2 seconds)
- [ ] UI updates only after server confirms the progress change
- [ ] Completed tasks are visually distinguished from incomplete ones
- [ ] Users can see how many times they've completed recurring missions
- [ ] Progress history is accessible for completed missions

#### FR-3: Mission Opt-In
**Priority:** High
**Description:** For missions requiring opt-in, users must explicitly choose to participate.

**Acceptance Criteria:**
- [ ] Opt-in button is prominently displayed on eligible missions
- [ ] Users receive confirmation after opting in
- [ ] Opt-in status is immediately reflected in mission display
- [ ] Users cannot opt-in to missions they don't meet requirements for
- [ ] Clear messaging explains why opt-in is required
- [ ] Opt-in action triggers mission start tracking

#### FR-4: Reward Claiming
**Priority:** Critical
**Description:** Users must be able to claim rewards for completed missions.

**Acceptance Criteria:**
- [ ] Claim button appears when mission is completed and prize is available
- [ ] Reward details are clearly displayed before claiming
- [ ] Users receive confirmation after successful claim
- [ ] Claimed rewards are immediately reflected in user's account
- [ ] Visual celebration/feedback is shown upon claiming
- [ ] Users can see history of claimed rewards

#### FR-5: Badge Collection and Display
**Priority:** High
**Description:** Users can earn badges and view them in a trophy case style grid gallery.

**Acceptance Criteria:**
- [ ] Badge collection displays as a grid gallery (trophy case style)
- [ ] Earned badges shown in full color with visual prominence
- [ ] Locked/unearned badges displayed in greyscale/dimmed state
- [ ] Click badge to view details modal (name, description, criteria, earn date)
- [ ] Filter controls: "All" | "Recent" | "Rarity" | "Category"
- [ ] Total badge count and earned count displayed prominently
- [ ] Badge progress shown for partially completed badges (in badge details)
- [ ] Responsive grid layout adapts to screen size
- [ ] Smooth hover effects and animations for earned badges

#### FR-6: Category Organization
**Priority:** Medium
**Description:** Missions and badges are organized into categories for easier navigation.

**Acceptance Criteria:**
- [ ] Users can filter missions by category
- [ ] Category navigation is intuitive and accessible
- [ ] Each category shows count of available/completed items
- [ ] "All" category shows all missions across categories
- [ ] Category selection is persistent during session
- [ ] Visual indicators distinguish different categories

#### FR-7: Mission Filtering and Search
**Priority:** Medium
**Description:** Users can filter and search for specific missions.

**Acceptance Criteria:**
- [ ] Filter by status (available, in-progress, completed, locked)
- [ ] Filter by category
- [ ] Search by mission name or description
- [ ] Multiple filters can be applied simultaneously
- [ ] Filter results update immediately
- [ ] Active filters are clearly indicated and removable

#### FR-8: Related Game Integration
**Priority:** Medium
**Description:** Missions show which games they're associated with for easy access.

**Acceptance Criteria:**
- [ ] Related games are displayed on mission details
- [ ] Game thumbnails/images are shown
- [ ] Users can launch games directly from mission view
- [ ] Multiple related games are supported per mission
- [ ] Game availability status is indicated

#### FR-9: Time-Limited Missions
**Priority:** High
**Description:** Missions with time constraints display countdown and auto-expire when time runs out.

**Acceptance Criteria:**
- [ ] Countdown timer is prominently displayed
- [ ] Timer updates in real-time
- [ ] Visual urgency indicators for expiring missions
- [ ] Expired missions are clearly marked
- [ ] Users are notified before mission expires (if time allows)
- [ ] Completed missions preserve completion status even after time limit

#### FR-10: Recurring Missions
**Priority:** Medium
**Description:** Missions that can be completed multiple times show recurrence information.

**Acceptance Criteria:**
- [ ] Completion count is displayed (e.g., "2 of 5 completed")
- [ ] Next availability time is shown for time-gated recurrences
- [ ] Users can claim rewards for each completion
- [ ] Completion history tracks all instances
- [ ] Visual indication differentiates recurring from one-time missions

### Non-Functional Requirements

#### NFR-1: Performance
- **Page Load:** Mission list appears within 1.5 seconds
- **Search/Filter:** Results update within 300ms of user input
- **Real-time Updates:** Progress changes reflect within 2 seconds
- **API Response:** Mission data retrieved within 200ms (p95)
- **Image Loading:** Optimized images load progressively
- **Smooth Animations:** UI transitions maintain 60fps

#### NFR-2: Scalability
- **Concurrent Users:** Support 10,000 simultaneous users viewing missions
- **Mission Volume:** Handle 500+ active missions per user
- **Badge Collection:** Support 1,000+ badges per user
- **Data Growth:** Accommodate 50,000+ users with full mission history

#### NFR-3: Reliability
- **Uptime:** 99.9% availability during business hours
- **Data Consistency:** Mission progress never reverts or loses data
- **Error Recovery:** Graceful degradation if backend services are slow
- **Offline Resilience:** Show cached data if connection lost
- **WebSocket Fallback:** If WebSocket unavailable, automatically fall back to polling (10-30s intervals)
- **Connection Status:** Clear indicator showing real-time vs. polling mode

#### NFR-4: Security
- **Authentication:** All mission actions require authenticated session
- **Authorization:** Users can only access their own mission data
- **Data Privacy:** Personal mission data is not exposed to other users
- **API Security:** All endpoints protected against common attacks
- **Rate Limiting:** Prevent abuse of opt-in and claim actions

#### NFR-5: Accessibility
- **WCAG Level:** AA compliance for all mission interfaces
- **Keyboard Navigation:** Complete functionality without mouse
- **Screen Reader:** Full compatibility with major screen readers
- **Color Contrast:** Minimum 4.5:1 for all text
- **Focus Management:** Clear focus indicators on all interactive elements
- **Alt Text:** Descriptive text for all mission and badge images

#### NFR-6: Mobile & Responsive Design
- **Mobile-First:** Design and develop for mobile screens first (320px+)
- **Progressive Enhancement:** Add features for tablet (768px+) and desktop (1024px+)
- **Touch Optimization:** All interactive elements minimum 44x44px touch targets
- **Gesture Support:** Swipe gestures for navigation (tabs, carousels)
- **Responsive Grid:** Badge gallery adapts from 2 columns (mobile) to 6+ (desktop)
- **Performance:** Optimized images and lazy loading for mobile bandwidth
- **Offline-First:** Service worker caching for improved mobile experience

## User Scenarios

### Scenario 1: Discovering and Starting a Mission

**Actor:** Active Player

**Steps:**
1. User logs into the platform
2. User navigates to Missions section
3. User browses available missions or uses category filter
4. User selects an interesting mission to view details
5. User sees mission requirements, rewards, and current progress
6. For opt-in missions, user clicks "Opt In" button
7. System confirms opt-in and starts tracking progress
8. User proceeds to complete mission tasks

**Expected Outcome:**
- User successfully opts into mission
- Mission appears in "In Progress" section
- Progress tracking begins immediately
- User understands what they need to do

### Scenario 2: Tracking Mission Progress

**Actor:** Active Player

**Steps:**
1. User completes activities that contribute to mission tasks
2. User checks mission progress in real-time
3. System updates progress bar and task completion status
4. User sees how close they are to completion
5. As tasks complete, visual feedback is provided
6. User monitors remaining requirements

**Expected Outcome:**
- Progress updates appear without manual refresh
- Each task shows current vs. required completion
- Visual feedback motivates continued engagement
- User always knows current status

### Scenario 3: Completing and Claiming Rewards

**Actor:** Active Player

**Steps:**
1. User completes final mission task
2. System marks mission as complete
3. User receives notification/visual indicator
4. User navigates to completed mission
5. User sees "Claim Reward" button
6. User clicks claim button
7. System processes reward
8. User receives confirmation with reward details
9. Reward is added to user's account

**Expected Outcome:**
- Completion is immediately visible
- Claim process is smooth and quick
- User receives clear confirmation
- Reward is properly credited

### Scenario 4: Collecting Badges

**Actor:** Completionist

**Steps:**
1. User navigates to Badge Collection
2. User browses earned and locked badges
3. User views badge details to understand requirements
4. User pursues activities that earn specific badges
5. Upon earning badge, user receives notification
6. Badge appears in collection as earned
7. User shares achievement (if enabled)

**Expected Outcome:**
- Badge collection is visually appealing
- Progress toward badges is trackable
- Earning moment is celebrated
- Collection motivates further engagement

### Scenario 5: Managing Time-Limited Missions

**Actor:** Casual Player

**Steps:**
1. User sees time-limited mission with countdown
2. User decides whether to commit based on time available
3. User opts in and monitors remaining time
4. Timer provides urgency and motivation
5. User completes mission before deadline
6. OR time expires and mission becomes unavailable

**Expected Outcome:**
- Time constraints are always visible
- User can make informed decisions
- Urgency motivates timely completion
- Expiration is handled gracefully

## Success Criteria

1. **User Engagement Metrics**
   - 60% of active users engage with missions daily
   - Average session time increases by 40% for users with active missions
   - Mission completion rate reaches 65% for opted-in missions

2. **System Performance**
   - Mission list loads and becomes interactive within 1.5 seconds
   - 99.5% of mission interactions complete without errors
   - Real-time progress updates appear within 2 seconds of backend changes

3. **User Satisfaction**
   - 80% of surveyed users find missions engaging and valuable
   - Mission-related support tickets represent less than 2% of total tickets
   - User retention improves by 25% for users who complete at least 3 missions

4. **Accessibility**
   - Zero critical accessibility violations in automated audits
   - 100% of mission functionality accessible via keyboard
   - Positive feedback from accessibility testing with assistive technology users

5. **Mission Interaction**
   - 70% of available missions are viewed by active users
   - 40% opt-in rate for missions requiring opt-in
   - 85% reward claim rate for completed missions within 24 hours

## Assumptions

1. **Smartico API Integration:**
   - Smartico backend provides reliable mission data and progress tracking
   - API performance meets documented SLAs
   - WebSocket connections for real-time updates are stable

2. **User Authentication:**
   - Users are already authenticated before accessing missions
   - Session management is handled by existing auth system
   - User identity is reliably available for all mission actions

3. **Reward System:**
   - Reward fulfillment is handled by existing reward infrastructure
   - Reward types (points, bonuses, items) are supported
   - Reward crediting is atomic and reliable

4. **Design System:**
   - Approved design system exists with mission/badge components
   - Design tokens for colors, typography, and spacing are defined
   - Component library includes progress bars, cards, and badges

5. **Browser Support:**
   - Modern browsers (Chrome, Firefox, Safari, Edge) from last 2 years
   - Mobile browsers (iOS Safari, Chrome Mobile) are supported
   - Progressive enhancement for older browsers

6. **Infrastructure:**
   - Backend services can handle projected load
   - WebSocket infrastructure supports real-time connections (SignalR)
   - CDN is available for image/asset delivery
   - File system access for JSON storage (sessions, rate limits, audit logs)
   - Backup strategy for JSON files in production environment

## Dependencies

### Backend Stack (.NET 9)
- **Runtime:** .NET 9 SDK and Runtime
- **Framework:** ASP.NET Core 9.0 (Web API + SignalR)
- **Language:** C# 12 with nullable reference types enabled
- **Architecture:** Clean Architecture with Vertical Slices (API, Application, Domain, Infrastructure layers)
- **API Client:** HttpClient wrapper for Smartico API using @smartico/public-api TypeScript interfaces as reference for C# models
- **WebSocket:** SignalR with automatic fallback (WebSocket → SSE → Long Polling)
- **Caching:** IMemoryCache (built-in) + Redis support via StackExchange.Redis (optional)
- **Persistence:** JSON File Storage for MVP (sessions, rate limits, audit logs) with atomic writes
- **Authentication:** JWT Bearer tokens (Microsoft.AspNetCore.Authentication.JwtBearer)
- **Testing:** xUnit + FluentAssertions + Moq + WebApplicationFactory (AAA pattern)
- **Deployment:** Docker containers with multi-stage builds

### Frontend Stack
- **@smartico/public-api**: NPM package providing TypeScript interfaces (used as reference for backend C# models):
  - TypeScript interfaces (TMissionOrBadge, TMissionOrBadgeTask, etc.)
  - Type definitions for API contracts
  - Reference for data structures and transformations

### External Systems
- **Smartico API Backend:** Mission data, progress tracking, reward issuance (accessed via HTTP client from .NET backend)
- **Authentication Service:** User identity and session management
- **Reward System:** Reward crediting and balance updates
- **Notification Service:** Push notifications for mission updates (optional)

### Internal Components
- **User Profile:** For displaying user stats and badges
- **Game Catalog:** For related game information and launch
- **Analytics:** For tracking mission engagement metrics

## Edge Cases and Error Scenarios

### Error Handling Strategy

**Read Operations (Fetching Missions/Badges):**
- Automatically retry once silently (with loading indicator)
- If retry fails, display cached/stale data with warning banner
- Show "Refresh" button to manually retry
- Warning: "Showing cached data. Connection issues detected."

**Write Operations (Opt-in, Claim Reward):**
- Auto-retry once silently
- If fails, show error message immediately with retry button
- Prevent duplicate submissions during retry
- Clear error feedback: "Action failed. Please try again."

### Edge Case 1: Network Disconnection During Claim
- **Scenario:** User clicks "Claim Reward" but loses connection
- **Handling:** 
  - Auto-retry once silently (with loading indicator)
  - If fails, show error modal with "Retry" button
  - Prevent duplicate claims during retry attempts
  - Allow retry when connection restored
  - Show clear error message: "Failed to claim reward. Connection issues detected."

### Edge Case 2: Mission Progress Reverted by Backend
- **Scenario:** Backend corrects progress due to fraud detection
- **Handling:**
  - Update UI to reflect corrected progress
  - Show notification explaining progress adjustment
  - Provide support contact for disputes

### Edge Case 3: Simultaneous Mission Completion
- **Scenario:** Multiple tasks complete at same time
- **Handling:**
  - Handle concurrent updates correctly
  - Show all completions in order
  - Ensure reward claiming isn't blocked

### Edge Case 4: Time-Limited Mission Expires During Viewing
- **Scenario:** User is viewing mission when timer reaches zero
- **Handling:**
  - Immediately update UI to show expiration
  - Disable opt-in/interaction buttons
  - Show clear message about expiration
  - Suggest similar active missions

### Edge Case 5: Badge Progress at 99.9%
- **Scenario:** User is extremely close but hasn't completed badge
- **Handling:**
  - Show precise progress (not rounded to 100%)
  - Make clear what final requirement is
  - Avoid false sense of completion

## Clarifications

### Session 2024-10-29

- Q: Should the implementation define new TypeScript interfaces for missions and badges, or use existing types? → A: Must use existing interfaces from @smartico/public-api package (TMissionOrBadge, TMissionOrBadgeTask, TMissionOptInResult, TMissionClaimRewardResult, TAchCategory). Do not create new data models.
- Q: If WebSocket connection fails or is unavailable, how should the system behave? → A: WebSocket with graceful degradation - Use WebSocket for real-time updates, fall back to periodic polling (every 10-30 seconds) if WebSocket unavailable. Show connection status indicator.
- Q: When a user completes a mission task, how should the UI respond to progress updates? → A: Wait for server confirmation - Show loading indicator during API call, update UI only after server confirms (up to 2 seconds delay). No optimistic updates to avoid rollback scenarios.
- Q: How should missions be organized when users have 50+ missions? → A: Tabbed interface - Use tabs for "Active" | "Available" | "Completed" | "Expired" with filter/sort controls (by category, time, rewards) within each tab. Provides clear separation and focused view per status.
- Q: How should badges be displayed when users might have 100+ badges? → A: Grid Gallery - Trophy case style with large badge icons, earned badges in color and locked badges greyed out. Click for details. Filters: "All" | "Recent" | "Rarity" | "Category". Visual impact and collection feel.
- Q: When API calls fail, how should the system respond? → A: Smart Fallback - Auto-retry once silently, if fails show cached/stale data with warning banner and "Refresh" button. Graceful degradation for read operations. Critical actions (opt-in, claim) show error immediately with retry option.
- Q: Should the design prioritize mobile or desktop experience? → A: Mobile-First Design - Design for mobile screens first with progressive enhancement for tablets/desktop. Touch-optimized interactions, simplified UI for small screens. Target: 60%+ users on mobile devices.
- Q: Which .NET framework version should the backend use? → A: .NET 9 - Latest version with newest features and performance improvements.
- Q: What architecture pattern should the .NET backend follow? → A: Clean Architecture with Vertical Slices - Feature-based folders with clear layers (API, Application, Domain, Infrastructure), pragmatic for BFF pattern, maintains SOLID principles.
- Q: What data persistence strategy should the backend use for MVP? → A: JSON File Storage - Lightweight file-based storage for sessions, rate limits, and audit logs; atomic writes with backups; easy migration path to full database later.
- Q: What WebSocket implementation should the .NET backend use? → A: SignalR - ASP.NET Core's built-in real-time framework with automatic fallback (WebSocket → Server-Sent Events → Long Polling), strongly-typed hubs, and native authentication support.
- Q: What deployment platform should the .NET backend target? → A: Docker Containers - Cross-platform deployment flexibility, consistent dev/prod environments, supports any cloud provider or on-premises, enables easy horizontal scaling and CI/CD integration.

## Data Model

**Important:** All data structures are defined by the @smartico/public-api package. The implementation must use these existing TypeScript interfaces:

- **TMissionOrBadge**: Main interface for both missions and badges
  - Includes: id, type ('mission' | 'badge'), name, description, reward, progress, status flags (is_completed, is_locked, is_requires_optin, is_opted_in), time limits, tasks array, related games, category IDs
- **TMissionOrBadgeTask**: Interface for individual tasks within a mission
  - Includes: id, name, is_completed, progress, execution counts, points_reward
- **TMissionOptInResult**: Response type for mission opt-in operations
  - Includes: err_code, err_message
- **TMissionClaimRewardResult**: Response type for reward claiming
  - Includes: err_code, err_message
- **TAchCategory**: Interface for mission/badge categories
  - Includes: id, name, description, image

**Data Source:** All mission and badge data is retrieved from the Smartico API backend via the @smartico/public-api wrapper. The frontend and backend layers consume these types directly without transformation.

## Open Questions

[None - All critical decisions have reasonable defaults based on industry standards and Smartico API capabilities]

## Change Log

| Version | Date       | Author            | Changes                    |
|---------|------------|-------------------|----------------------------|
| 1.0.0   | 2024-10-29 | System Architect  | Initial specification      |
| 1.1.0   | 2024-10-29 | System Architect  | Backend migration: Node.js → .NET 9; Added clarifications for .NET stack (framework, architecture, persistence, SignalR, Docker) |

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] UX Designer: [Name] - [Date]
- [ ] Security Review: [Name] - [Date]

---

**Document Status:** Draft
**Implementation Start:** TBD
**Target Completion:** 6 weeks from start (based on implementation plan)

