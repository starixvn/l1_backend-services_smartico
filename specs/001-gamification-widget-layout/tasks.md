# Gamification Widget Layout - Task List

**Feature:** Gamification Widget Layout
**Version:** 1.0.0
**Created:** 2025-11-12
**Status:** Ready for Implementation

## Task Format

Every task follows this format:
```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

- **TaskID:** Sequential identifier (T001, T002, etc.)
- **[P]:** Parallelizable task (can be worked on independently)
- **[Story]:** User story reference for user story phases (e.g., [US1], [US2])
- **Description:** Clear action with affected file path

## Implementation Phases

### Phase 1: Setup & Foundation

**Note:** This phase builds upon the existing working frontend. Tasks T001-T003 are already complete (branch exists, React 19 project initialized, base src/ structure created). Phase 1 focuses on adding dashboard-specific infrastructure.

**Estimated Duration:** 1 week → **Reduced to 3-4 days** (due to existing setup)

#### Prerequisites (Verify Existing Setup)

- [x] ~~[T001] Create feature branch `001-gamification-widget-layout`~~ (DONE - branch exists)
- [x] ~~[T002] Initialize frontend project~~ (DONE - package.json, vite.config.ts, tailwind.config.js exist)
- [x] ~~[T003] Create base src/ directories~~ (DONE - components/, hooks/, types/, services/ exist)

#### New Dependencies

- [x] [T004] Install Framer Motion 11: `npm install framer-motion@^11.0.0` in `frontend/package.json` ✅

#### Dashboard Directory Structure

- [x] [T005] [P] Create `frontend/src/components/dashboard/` with subdirs: `widgets/`, `layout/`, `shared/` ✅
- [x] [T006] [P] Create `frontend/src/types/dashboard/` for dashboard-specific TypeScript interfaces ✅
- [x] [T007] [P] Create `frontend/src/contexts/` for React Context providers (if doesn't exist) ✅

#### TypeScript Interfaces

- [x] [T008] [P] Define `ThemeConfig` interface in `frontend/src/types/dashboard/theme.ts` (mode, preset, primaryColor, accentColor, fontSize, animationIntensity) ✅
- [x] [T009] [P] Define `WidgetLayoutConfig` interface in `frontend/src/types/dashboard/layout.ts` (visibility only - Record<WidgetId, boolean>) ✅
- [x] [T010] [P] Define `DashboardData` interface in `frontend/src/types/dashboard/data.ts` (level, missions, bonuses, miniGames, tournaments, jackpots, achievements, activityFeed, vipTier, loginStreak, currency) ✅
- [x] [T011] [P] Define component prop interfaces in `frontend/src/types/dashboard/components.ts` (AnimatedCardProps, ProgressRingProps, ParticleEffectProps, SkeletonLoaderProps) ✅
- [x] [T012] [P] Define SignalR event types in `frontend/src/types/dashboard/events.ts` (SignalREvent union type) ✅
- [x] [T013] [P] Define widget identifiers type `WidgetId` in `frontend/src/types/dashboard/widgets.ts` (union of 14 widget IDs) ✅

#### TailwindCSS Configuration

- [x] [T014] Update `frontend/tailwind.config.js` to add glassmorphism utility classes (backdrop-blur variants) ✅
- [x] [T015] Update `frontend/tailwind.config.js` to add Royal Purple theme colors (purple-600, pink-500, slate-900) ✅
- [x] [T016] Update `frontend/tailwind.config.js` to add custom animation timings (spring-slow, spring-fast) ✅
- [x] [T017] [P] Create `frontend/src/styles/glassmorphism.css` with glassmorphism patterns (dark/light variants) ✅

#### Custom Hooks - Core Infrastructure

- [x] [T018] Implement `useTheme()` hook in `frontend/src/hooks/useTheme.ts` with localStorage persistence (get, set, default to Royal Purple) ✅
- [x] [T019] Implement `useWidgetLayout()` hook in `frontend/src/hooks/useWidgetLayout.ts` with localStorage persistence (visibility only - fixed order, no drag-and-drop) ✅
- [x] [T020] Implement `useAnimationIntensity()` hook in `frontend/src/hooks/useAnimationIntensity.ts` (none, subtle, moderate, full) ✅
- [x] [T021] Implement `useReducedMotion()` hook in `frontend/src/hooks/useReducedMotion.ts` (detect prefers-reduced-motion) ✅
- [x] [T022] Implement `useDashboardData()` hook in `frontend/src/hooks/useDashboardData.ts` (aggregate all service calls in parallel) ✅

#### React Context Providers

- [x] [T023] [P] Create `ThemeContext` in `frontend/src/contexts/ThemeContext.tsx` (provide theme config and setter) ✅
- [x] [T024] [P] Create `WidgetLayoutContext` in `frontend/src/contexts/WidgetLayoutContext.tsx` (provide layout config and setters) ✅
- [x] [T025] [P] Create `AnimationIntensityContext` in `frontend/src/contexts/AnimationIntensityContext.tsx` (provide animation preference) ✅
- [x] [T026] Create `DashboardProvider` in `frontend/src/contexts/DashboardProvider.tsx` (wrap all context providers) ✅

#### Testing Setup

- [x] [T027] [P] Create test utilities in `frontend/src/tests/utils/renderWithProviders.tsx` (render with all contexts) ✅
- [x] [T028] [P] Create mock services in `frontend/src/tests/mocks/services.ts` (mockMissionService, mockLevelService, etc.) ✅
- [x] [T029] [P] Configure MSW handlers in `frontend/src/tests/mocks/handlers.ts` (mock API responses) ✅

---

### Phase 2: Layout Shell & Navigation

#### Core Layout Components

- [ ] [T029] [US1] Create `DashboardLayout` component in `frontend/src/components/dashboard/layout/DashboardLayout.tsx` (root shell with sidebar + content area)
- [ ] [T030] [US1] Create `Sidebar` component in `frontend/src/components/dashboard/layout/Sidebar.tsx` (fixed 256px navigation with glassmorphism)
- [ ] [T031] [US1] Create `TopHeader` component in `frontend/src/components/dashboard/layout/TopHeader.tsx` (sticky header with level, coins, gems, avatar)
- [ ] [T032] [US1] Create `NavigationMenu` component in `frontend/src/components/dashboard/layout/NavigationMenu.tsx` (menu items container)
- [ ] [T033] [US1] Create `NavigationItem` component in `frontend/src/components/dashboard/layout/NavigationItem.tsx` (individual menu item with active state)

#### Sidebar Features

- [ ] [T034] [US1] Implement sidebar menu items in `Sidebar.tsx` (Dashboard, Progress, Rewards, VIP Tiers, Daily Login, Referrals, Activity Feed, Settings)
- [ ] [T035] [US1] Add active menu item gradient `bg-gradient-to-r from-purple-600 to-pink-600` in `NavigationItem.tsx`
- [ ] [T036] [US1] Implement mobile hamburger menu toggle in `Sidebar.tsx` (collapsible with overlay)
- [ ] [T037] [US1] Implement sidebar glassmorphism styles in `Sidebar.tsx` (`bg-slate-800/50 backdrop-blur-lg border-r border-purple-500/30`)
- [ ] [T038] [US1] Add focus trap for mobile menu in `Sidebar.tsx` (trap focus within open menu)

#### Top Header Features

- [ ] [T039] [US1] Implement left section in `TopHeader.tsx` (page title "Dashboard" + level badge with gradient)
- [ ] [T040] [US1] Implement right section in `TopHeader.tsx` (coin counter, gem counter, notification bell, user avatar)
- [ ] [T041] [US1] Add notification badge count in `TopHeader.tsx` (red badge with count number)
- [ ] [T042] [US1] Implement SignalR listener for counter updates in `TopHeader.tsx` (CurrencyUpdated event)
- [ ] [T043] [US1] Add sticky positioning `sticky top-0 z-40` in `TopHeader.tsx`
- [ ] [T044] [US1] Implement header glassmorphism styles in `TopHeader.tsx` (`bg-slate-800/30 backdrop-blur-lg border-b border-purple-500/30`)

#### Accessibility

- [ ] [T045] [US1] Add skip-to-content link in `DashboardLayout.tsx` (jump to main content)
- [ ] [T046] [US1] Implement ARIA attributes for sidebar in `Sidebar.tsx` (aria-label, aria-expanded)
- [ ] [T047] [US1] Implement keyboard navigation for sidebar in `NavigationMenu.tsx` (Arrow keys, Enter, Escape)

#### Responsive Design

- [ ] [T048] [US1] Implement main content area offset in `DashboardLayout.tsx` (`ml-64` for desktop, `ml-0` for mobile)
- [ ] [T049] [US1] Implement mobile breakpoints in `DashboardLayout.tsx` (320px, 768px, 1024px)

#### Testing

- [ ] [T050] [P] Write unit test for `DashboardLayout` rendering in `frontend/src/components/dashboard/layout/DashboardLayout.test.tsx`
- [ ] [T051] [P] Write unit test for `Sidebar` menu items rendering in `frontend/src/components/dashboard/layout/Sidebar.test.tsx`
- [ ] [T052] [P] Write unit test for `TopHeader` counters in `frontend/src/components/dashboard/layout/TopHeader.test.tsx`
- [ ] [T053] [P] Write unit test for mobile menu toggle in `frontend/src/components/dashboard/layout/Sidebar.test.tsx`

---

### Phase 3: Shared Component Library

#### Core Shared Components

- [ ] [T054] [P] Create `AnimatedCard` component in `frontend/src/components/dashboard/shared/AnimatedCard.tsx` (glassmorphism wrapper with hover effects)
- [ ] [T055] [P] Create `ProgressRing` component in `frontend/src/components/dashboard/shared/ProgressRing.tsx` (circular progress indicator with spring animation)
- [ ] [T056] [P] Create `ParticleEffect` component in `frontend/src/components/dashboard/shared/ParticleEffect.tsx` (celebration particles for achievements/level-ups)
- [ ] [T057] [P] Create `SkeletonLoader` component in `frontend/src/components/dashboard/shared/SkeletonLoader.tsx` (loading state placeholder)
- [ ] [T058] [P] Create `ErrorBoundary` component in `frontend/src/components/dashboard/shared/ErrorBoundary.tsx` (error handling wrapper)
- [ ] [T059] [P] Create `EmptyState` component in `frontend/src/components/dashboard/shared/EmptyState.tsx` (no data state)
- [ ] [T060] [P] Create `ToastNotification` component in `frontend/src/components/dashboard/shared/ToastNotification.tsx` (action feedback)

#### AnimatedCard Implementation

- [ ] [T061] Implement glassmorphism styles in `AnimatedCard.tsx` (`bg-slate-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl`)
- [ ] [T062] Add Framer Motion entrance animation in `AnimatedCard.tsx` (fade + slide with spring physics)
- [ ] [T063] Add hover transition in `AnimatedCard.tsx` (`hover:border-purple-500` with 300ms transition)
- [ ] [T064] Add rarity color variants in `AnimatedCard.tsx` (common, rare, epic, legendary, mythic)
- [ ] [T065] Implement accessibility features in `AnimatedCard.tsx` (ARIA role, keyboard focus)

#### ProgressRing Implementation

- [ ] [T066] Implement SVG circular progress in `ProgressRing.tsx` (viewBox, circle, strokeDasharray/strokeDashoffset)
- [ ] [T067] Add spring animation for progress fill in `ProgressRing.tsx` (500ms spring transition)
- [ ] [T068] Add pulsing glow effect for 100% completion in `ProgressRing.tsx` (Framer Motion loop)
- [ ] [T069] Add percentage text overlay in `ProgressRing.tsx` (centered text with dynamic color)
- [ ] [T070] Implement ARIA attributes in `ProgressRing.tsx` (role="progressbar", aria-valuenow, aria-valuemin, aria-valuemax)
- [ ] [T071] Respect `useReducedMotion()` in `ProgressRing.tsx` (disable animations if reduced motion preferred)

#### ParticleEffect Implementation

- [ ] [T072] Implement particle generation in `ParticleEffect.tsx` (max 50 particles, random positions)
- [ ] [T073] Add Framer Motion for particle animations in `ParticleEffect.tsx` (x, y, scale, opacity with GPU acceleration)
- [ ] [T074] Add celebration patterns in `ParticleEffect.tsx` (confetti burst, fireworks)
- [ ] [T075] Implement auto-cleanup after animation in `ParticleEffect.tsx` (unmount after 3s)
- [ ] [T076] Optimize performance in `ParticleEffect.tsx` (reduce particles on mobile, use MotionValue)

#### Other Shared Components

- [ ] [T077] Implement skeleton shimmer animation in `SkeletonLoader.tsx` (2s loop with gradient)
- [ ] [T078] Add size variants in `SkeletonLoader.tsx` (small, medium, large, full-width)
- [ ] [T079] Implement error catching in `ErrorBoundary.tsx` (componentDidCatch, fallback UI)
- [ ] [T080] Add retry button in `ErrorBoundary.tsx` (reset error boundary)
- [ ] [T081] Implement empty state with icon and message in `EmptyState.tsx` (centered layout)
- [ ] [T082] Implement toast positioning in `ToastNotification.tsx` (top-right, auto-dismiss after 3s)
- [ ] [T083] Add toast variants in `ToastNotification.tsx` (success, error, warning, info)

#### Testing

- [ ] [T084] [P] Write unit tests for `AnimatedCard` in `frontend/src/components/dashboard/shared/AnimatedCard.test.tsx` (rendering, rarity classes, hover state)
- [ ] [T085] [P] Write unit tests for `ProgressRing` in `frontend/src/components/dashboard/shared/ProgressRing.test.tsx` (progress calculation, ARIA attributes)
- [ ] [T086] [P] Write unit tests for `ParticleEffect` in `frontend/src/components/dashboard/shared/ParticleEffect.test.tsx` (particle count, animation)
- [ ] [T087] [P] Write unit tests for `SkeletonLoader` in `frontend/src/components/dashboard/shared/SkeletonLoader.test.tsx` (variants, animation)
- [ ] [T088] [P] Write unit tests for `ErrorBoundary` in `frontend/src/components/dashboard/shared/ErrorBoundary.test.tsx` (error catching, fallback UI)

---

### Phase 4: Core Widgets (Part 1)

#### Widget Components

- [ ] [T089] [US1] Create `DailyChallengeWidget` component in `frontend/src/components/dashboard/widgets/DailyChallengeWidget.tsx` (daily challenge with timer)
- [ ] [T090] [US6] Create `LevelProgressWidget` component in `frontend/src/components/dashboard/widgets/LevelProgressWidget.tsx` (level + XP progress ring)
- [ ] [T091] [US1] Create `ActiveMissionsWidget` component in `frontend/src/components/dashboard/widgets/ActiveMissionsWidget.tsx` (mission list with progress bars)
- [ ] [T092] [US4] Create `RecentAchievementsWidget` component in `frontend/src/components/dashboard/widgets/RecentAchievementsWidget.tsx` (achievement gallery with flip cards)
- [ ] [T093] [US1] Create `LeaderboardWidget` component in `frontend/src/components/dashboard/widgets/LeaderboardWidget.tsx` (top 10 rankings)

#### DailyChallengeWidget Implementation

- [ ] [T094] [US1] Fetch daily challenge data in `DailyChallengeWidget.tsx` (use missions service)
- [ ] [T095] [US1] Display challenge name, description, progress in `DailyChallengeWidget.tsx`
- [ ] [T096] [US1] Implement countdown timer in `DailyChallengeWidget.tsx` (show hours/minutes remaining)
- [ ] [T097] [US1] Add "Complete Challenge" button in `DailyChallengeWidget.tsx` (trigger completion)
- [ ] [T098] [US1] Implement skeleton loader in `DailyChallengeWidget.tsx` (loading state)
- [ ] [T099] [US1] Add SignalR listener for challenge completion in `DailyChallengeWidget.tsx` (MissionCompleted event)

#### LevelProgressWidget Implementation

- [ ] [T100] [US6] Fetch user level data in `LevelProgressWidget.tsx` (use level service)
- [ ] [T101] [US6] Display current level, XP, next level XP in `LevelProgressWidget.tsx`
- [ ] [T102] [US6] Implement ProgressRing for XP visualization in `LevelProgressWidget.tsx` (circular progress)
- [ ] [T103] [US6] Add gradient fill (blue→purple) in `LevelProgressWidget.tsx`
- [ ] [T104] [US6] Implement "+X XP" floating number on gains in `LevelProgressWidget.tsx` (500ms fade animation)
- [ ] [T105] [US6] Add level-up celebration in `LevelProgressWidget.tsx` (confetti burst, "LEVEL UP!" bounce, modal with benefits)
- [ ] [T106] [US6] Add SignalR listener for level-up in `LevelProgressWidget.tsx` (LevelUpAchieved event)

#### ActiveMissionsWidget Implementation

- [ ] [T107] [US1] Fetch active missions in `ActiveMissionsWidget.tsx` (use missions service)
- [ ] [T108] [US1] Display mission list (up to 5) in `ActiveMissionsWidget.tsx` (name, description, progress)
- [ ] [T109] [US1] Implement progress bars for each mission in `ActiveMissionsWidget.tsx` (percentage fill)
- [ ] [T110] [US1] Add completion status checkmark in `ActiveMissionsWidget.tsx` (for completed missions)
- [ ] [T111] [US1] Add "View All Missions" button in `ActiveMissionsWidget.tsx` (link to missions page)
- [ ] [T112] [US1] Add SignalR listener for mission progress updates in `ActiveMissionsWidget.tsx` (MissionProgressUpdated event)

#### RecentAchievementsWidget Implementation

- [ ] [T113] [US4] Fetch recent achievements in `RecentAchievementsWidget.tsx` (use achievements service, last 5)
- [ ] [T114] [US4] Display achievement grid (2x3 desktop, 2x2 tablet, 1x4 mobile) in `RecentAchievementsWidget.tsx`
- [ ] [T115] [US4] Implement 3D flip card animation in `RecentAchievementsWidget.tsx` (600ms spring, rotateY: 180)
- [ ] [T116] [US4] Display icon, name, date on front in `RecentAchievementsWidget.tsx`
- [ ] [T117] [US4] Display description, rarity on back in `RecentAchievementsWidget.tsx`
- [ ] [T118] [US4] Add "New!" badge with pulse for 24h in `RecentAchievementsWidget.tsx` (Framer Motion loop)
- [ ] [T119] [US4] Implement rarity color coding in `RecentAchievementsWidget.tsx` (common, rare, epic, legendary)
- [ ] [T120] [US4] Add SignalR listener for new achievements in `RecentAchievementsWidget.tsx` (BadgeEarned event)

#### LeaderboardWidget Implementation

- [ ] [T121] [US1] Fetch leaderboard data in `LeaderboardWidget.tsx` (use leaderboard service, top 10)
- [ ] [T122] [US1] Display ranked list in `LeaderboardWidget.tsx` (rank, username, points)
- [ ] [T123] [US1] Highlight current user in `LeaderboardWidget.tsx` (different background color)
- [ ] [T124] [US1] Mask usernames for privacy in `LeaderboardWidget.tsx` (e.g., "J***n")
- [ ] [T125] [US1] Add rank badges for top 3 in `LeaderboardWidget.tsx` (gold, silver, bronze icons)

#### Testing

- [ ] [T126] [P] Write unit tests for `DailyChallengeWidget` in `frontend/src/components/dashboard/widgets/DailyChallengeWidget.test.tsx` (rendering, timer, button click)
- [ ] [T127] [P] Write unit tests for `LevelProgressWidget` in `frontend/src/components/dashboard/widgets/LevelProgressWidget.test.tsx` (XP calculation, level-up animation)
- [ ] [T128] [P] Write unit tests for `ActiveMissionsWidget` in `frontend/src/components/dashboard/widgets/ActiveMissionsWidget.test.tsx` (mission list, progress bars)
- [ ] [T129] [P] Write unit tests for `RecentAchievementsWidget` in `frontend/src/components/dashboard/widgets/RecentAchievementsWidget.test.tsx` (flip animation, rarity colors)
- [ ] [T130] [P] Write unit tests for `LeaderboardWidget` in `frontend/src/components/dashboard/widgets/LeaderboardWidget.test.tsx` (ranking, current user highlight)

---

### Phase 5: Core Widgets (Part 2)

#### Widget Components

- [ ] [T131] [US1] Create `BonusTrackerWidget` component in `frontend/src/components/dashboard/widgets/BonusTrackerWidget.tsx` (active bonuses with timers)
- [ ] [T132] [US1] Create `MiniGamesWidget` component in `frontend/src/components/dashboard/widgets/MiniGamesWidget.tsx` (game thumbnails with quick-play)
- [ ] [T133] [US1] Create `TournamentWidget` component in `frontend/src/components/dashboard/widgets/TournamentWidget.tsx` (active tournament with rank)
- [ ] [T134] [US1] Create `JackpotWidget` component in `frontend/src/components/dashboard/widgets/JackpotWidget.tsx` (prize pool with countdown)
- [ ] [T135] [US10] Create `ActivityFeedWidget` component in `frontend/src/components/dashboard/widgets/ActivityFeedWidget.tsx` (real-time event stream)
- [ ] [T136] [US1] Create `PersonalGoalsWidget` component in `frontend/src/components/dashboard/widgets/PersonalGoalsWidget.tsx` (user goals with progress)
- [ ] [T137] [US9] Create `RewardCalendarWidget` component in `frontend/src/components/dashboard/widgets/RewardCalendarWidget.tsx` (daily login calendar)
- [ ] [T138] [US1] Create `StreakTrackerWidget` component in `frontend/src/components/dashboard/widgets/StreakTrackerWidget.tsx` (streak counter)
- [ ] [T139] [US8] Create `VIPStatusWidget` component in `frontend/src/components/dashboard/widgets/VIPStatusWidget.tsx` (tier progress)

#### BonusTrackerWidget Implementation

- [ ] [T140] [US1] Fetch active bonuses in `BonusTrackerWidget.tsx` (use bonuses service)
- [ ] [T141] [US1] Display bonus list (up to 3) in `BonusTrackerWidget.tsx` (name, description, value)
- [ ] [T142] [US1] Implement expiration timers in `BonusTrackerWidget.tsx` (countdown with hours/minutes)
- [ ] [T143] [US1] Add claim status indicator in `BonusTrackerWidget.tsx` (Claimed/Available)
- [ ] [T144] [US1] Add "Claim" button with press animation in `BonusTrackerWidget.tsx`
- [ ] [T145] [US1] Add SignalR listener for bonus claims in `BonusTrackerWidget.tsx` (BonusClaimed event)

#### MiniGamesWidget Implementation

- [ ] [T146] [US1] Fetch available mini games in `MiniGamesWidget.tsx` (use mini games service)
- [ ] [T147] [US1] Display game thumbnails (4 games) in `MiniGamesWidget.tsx` (Spin Wheel, Gift Box, Scratch Card, MatchX)
- [ ] [T148] [US1] Show buy-in cost for each game in `MiniGamesWidget.tsx` (points/gems/diamonds or FREE)
- [ ] [T149] [US1] Show jackpot amount for games with jackpots in `MiniGamesWidget.tsx`
- [ ] [T150] [US1] Add "Play Now" button for each game in `MiniGamesWidget.tsx` (quick-play modal)
- [ ] [T151] [US1] Add "View All Games" button in `MiniGamesWidget.tsx` (link to mini games page)

#### TournamentWidget Implementation

- [ ] [T152] [US1] Fetch active tournament in `TournamentWidget.tsx` (use tournament service)
- [ ] [T153] [US1] Display tournament name, end date, prize pool in `TournamentWidget.tsx`
- [ ] [T154] [US1] Display user rank and total participants in `TournamentWidget.tsx` (e.g., "#42 of 523")
- [ ] [T155] [US1] Implement countdown timer in `TournamentWidget.tsx` (days/hours remaining)
- [ ] [T156] [US1] Add "View Details" button in `TournamentWidget.tsx` (link to tournament page)

#### JackpotWidget Implementation

- [ ] [T157] [US1] Fetch jackpot data in `JackpotWidget.tsx` (use jackpot service)
- [ ] [T158] [US1] Display prize pool amounts in `JackpotWidget.tsx` (Mega, Mini, Major, Minor tiers)
- [ ] [T159] [US1] Display draw date/time in `JackpotWidget.tsx` (countdown timer)
- [ ] [T160] [US1] Display user ticket count in `JackpotWidget.tsx` (number of entries)
- [ ] [T161] [US1] Display last winners in `JackpotWidget.tsx` (masked usernames, amounts)
- [ ] [T162] [US1] Add SignalR listener for jackpot updates in `JackpotWidget.tsx` (JackpotWon, jackpot pool updates)

#### ActivityFeedWidget Implementation

- [ ] [T163] [US10] Fetch recent activity in `ActivityFeedWidget.tsx` (use activity service, last 10 events)
- [ ] [T164] [US10] Display activity list in `ActivityFeedWidget.tsx` (username, action, timestamp, icon)
- [ ] [T165] [US10] Mask usernames for privacy in `ActivityFeedWidget.tsx` (e.g., "J***n")
- [ ] [T166] [US10] Implement slide-in animation for new activities in `ActivityFeedWidget.tsx` (300ms fade+slide from top)
- [ ] [T167] [US10] Add infinite scroll / "Load More" button in `ActivityFeedWidget.tsx`
- [ ] [T168] [US10] Add SignalR listener for real-time activity in `ActivityFeedWidget.tsx` (all activity events)
- [ ] [T169] [US10] Implement empty state in `ActivityFeedWidget.tsx` ("No recent activity")

#### Other Widgets Implementation

- [ ] [T170] [US1] Implement personal goals list in `PersonalGoalsWidget.tsx` (name, progress, deadline)
- [ ] [T171] [US9] Implement 7-day calendar view in `RewardCalendarWidget.tsx` (M-S with claim status)
- [ ] [T172] [US9] Add expandable 30-day view in `RewardCalendarWidget.tsx` (toggle button)
- [ ] [T173] [US9] Implement daily reward preview in `RewardCalendarWidget.tsx` (points/gems for each day)
- [ ] [T174] [US9] Add progressive reward values in `RewardCalendarWidget.tsx` (Day 1: 10pts, Day 7: 100pts)
- [ ] [T175] [US9] Implement "Claim" button in `RewardCalendarWidget.tsx` (for current day)
- [ ] [T176] [US1] Display current streak count in `StreakTrackerWidget.tsx` (fire icon with number)
- [ ] [T177] [US1] Display longest streak in `StreakTrackerWidget.tsx` (historical record)
- [ ] [T178] [US8] Display tier ladder in `VIPStatusWidget.tsx` (Bronze → Silver → Gold → Platinum → Diamond)
- [ ] [T179] [US8] Highlight current tier in `VIPStatusWidget.tsx` (glow effect, enlargement)
- [ ] [T180] [US8] Display progress to next tier in `VIPStatusWidget.tsx` (points needed, percentage)
- [ ] [T181] [US8] Add tier benefits modal in `VIPStatusWidget.tsx` (tap to show comparison table)

#### Testing

- [ ] [T182] [P] Write unit tests for all Phase 5 widgets in `frontend/src/components/dashboard/widgets/*.test.tsx` (AAA pattern, 80% coverage)

---

### Phase 6: Widget Grid & Layout (Simplified - No Drag-and-Drop)

**Note:** Drag-and-drop removed to reduce scope. Widgets use a fixed responsive grid with visibility toggles only.

**Estimated Duration:** 1 week → **Reduced to 2-3 days**

#### WidgetGrid Component

- [ ] [T183] [US1] Create `WidgetGrid` component in `frontend/src/components/dashboard/WidgetGrid.tsx` (12-column responsive grid)
- [ ] [T184] [US1] Implement responsive column classes in `WidgetGrid.tsx` (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] [T185] [US1] Implement widget rendering in fixed order in `WidgetGrid.tsx` (render all 14 widgets)
- [ ] [T186] [US1] Filter hidden widgets in `WidgetGrid.tsx` (check widgetLayout.visibility from localStorage)

#### Layout Customizer (Visibility Only)

- [ ] [T187] [US1] Create `LayoutCustomizer` component in `frontend/src/components/dashboard/LayoutCustomizer.tsx` (modal for visibility settings)
- [ ] [T188] [US1] Implement widget visibility toggles in `LayoutCustomizer.tsx` (checkbox list of all 14 widgets)
- [ ] [T189] [US1] Add "Reset to Default" button in `LayoutCustomizer.tsx` (restore all widgets visible)
- [ ] [T190] [US1] Add "Save Layout" button in `LayoutCustomizer.tsx` (persist visibility to localStorage)

#### Testing

- [ ] [T191] [P] Write unit tests for `WidgetGrid` in `frontend/src/components/dashboard/WidgetGrid.test.tsx` (rendering, responsive classes, visibility filtering)
- [ ] [T192] [P] Write unit tests for `LayoutCustomizer` in `frontend/src/components/dashboard/LayoutCustomizer.test.tsx` (visibility toggles, reset, localStorage persistence)

---

### Phase 7: Theme Customization

#### ThemeCustomizer Component

- [ ] [T193] [US2] Create `ThemeCustomizer` component in `frontend/src/components/dashboard/ThemeCustomizer.tsx` (modal for theme settings)
- [ ] [T194] [US2] Create `ThemePresetGrid` component in `frontend/src/components/dashboard/ThemePresetGrid.tsx` (preset selection grid)
- [ ] [T195] [US2] Create `CustomColorPicker` component in `frontend/src/components/dashboard/CustomColorPicker.tsx` (HSL color picker)

#### Theme Presets Implementation

- [ ] [T196] [US2] Implement Royal Purple preset in `ThemePresetGrid.tsx` (DEFAULT: dark gradient glassmorphism)
- [ ] [T197] [US2] Implement Ocean Blue preset in `ThemePresetGrid.tsx` (light theme)
- [ ] [T198] [US2] Implement Neon Cyber preset in `ThemePresetGrid.tsx` (dark theme)
- [ ] [T199] [US2] Implement Nature Zen preset in `ThemePresetGrid.tsx` (light theme)
- [ ] [T200] [US2] Implement Sunset Orange preset in `ThemePresetGrid.tsx` (dark theme)
- [ ] [T201] [US2] Add preset preview thumbnails in `ThemePresetGrid.tsx` (visual representation)
- [ ] [T202] [US2] Implement preset selection in `ThemePresetGrid.tsx` (click to apply)

#### Custom Theme Creator

- [ ] [T203] [US2] Implement custom theme option in `ThemeCustomizer.tsx` (enable when "Custom" selected)
- [ ] [T204] [US2] Implement primary color picker in `CustomColorPicker.tsx` (HSL picker with preview)
- [ ] [T205] [US2] Implement accent color picker in `CustomColorPicker.tsx` (HSL picker with preview)
- [ ] [T206] [US2] Validate hex color format in `CustomColorPicker.tsx` (#RRGGBB pattern)
- [ ] [T207] [US2] Validate color contrast ratio in `CustomColorPicker.tsx` (4.5:1 minimum for WCAG AA)
- [ ] [T208] [US2] Show contrast validation error in `CustomColorPicker.tsx` (warning message)

#### Other Theme Settings

- [ ] [T209] [US2] Implement light/dark mode toggle in `ThemeCustomizer.tsx` (switch with 300ms transition)
- [ ] [T210] [US2] Implement font size slider in `ThemeCustomizer.tsx` (14px, 16px, 18px options)
- [ ] [T211] [US2] Implement animation intensity toggle in `ThemeCustomizer.tsx` (none, subtle, moderate, full)
- [ ] [T212] [US2] Add real-time theme preview in `ThemeCustomizer.tsx` (apply changes instantly)
- [ ] [T213] [US2] Implement theme export in `ThemeCustomizer.tsx` (download JSON file)
- [ ] [T214] [US2] Implement theme import in `ThemeCustomizer.tsx` (upload JSON file, validate)
- [ ] [T215] [US2] Add "Save Theme" button in `ThemeCustomizer.tsx` (persist to localStorage)
- [ ] [T216] [US2] Add "Reset to Default" button in `ThemeCustomizer.tsx` (restore Royal Purple)

#### Theme Application

- [ ] [T217] [US2] Apply theme to CSS variables in `useTheme.ts` (update document root)
- [ ] [T218] [US2] Apply theme to all widget cards in `AnimatedCard.tsx` (glassmorphism colors)
- [ ] [T219] [US2] Apply theme to sidebar/header in `Sidebar.tsx` and `TopHeader.tsx` (background colors)
- [ ] [T220] [US2] Apply 300ms transition for theme switch in `DashboardLayout.tsx` (smooth color change)

#### Testing

- [ ] [T221] [P] Write unit tests for `ThemeCustomizer` in `frontend/src/components/dashboard/ThemeCustomizer.test.tsx` (preset selection, custom colors)
- [ ] [T222] [P] Write unit tests for color validation in `CustomColorPicker.test.tsx` (hex format, contrast ratio)
- [ ] [T223] Write E2E test for theme customization in `frontend/tests/e2e/theme-customization.spec.ts` (select preset, verify applied)

---

### Phase 8: Animations & Polish

#### Card Entrance Animations

- [ ] [T224] Implement staggered entrance animations in `WidgetGrid.tsx` (stagger by grid position, 50ms delay per widget)
- [ ] [T225] Add spring physics to card entrance in `AnimatedCard.tsx` (type: 'spring', stiffness: 300, damping: 20)
- [ ] [T226] Implement fade+slide animation in `AnimatedCard.tsx` (opacity 0→1, y: 20→0)

#### Progress Ring Animations

- [ ] [T227] Implement fill animation for progress rings in `ProgressRing.tsx` (500ms spring transition)
- [ ] [T228] Add shimmer effect to completed rings in `ProgressRing.tsx` (2s loop gradient animation)
- [ ] [T229] Implement pulsing glow for 100% completion in `ProgressRing.tsx` (scale: 1→1.05→1 loop)

#### Particle Effects

- [ ] [T243] Implement confetti burst pattern in `ParticleEffect.tsx` (random directions, gravity)
- [ ] [T244] Implement fireworks pattern in `ParticleEffect.tsx` (upward burst with spread)
- [ ] [T245] Optimize particle performance in `ParticleEffect.tsx` (max 50 particles, GPU acceleration)
- [ ] [T246] Reduce particle count on mobile in `ParticleEffect.tsx` (max 20 particles)

#### Micro-interactions

- [ ] [T247] Add hover scale effect to widgets in `AnimatedCard.tsx` (scale: 1→1.02 on hover)
- [ ] [T248] Add hover border glow to widgets in `AnimatedCard.tsx` (border-purple-500 on hover)
- [ ] [T249] Add button press animation in `AnimatedCard.tsx` (scale: 1→0.95 on click)
- [ ] [T250] Add focus ring for keyboard navigation in `AnimatedCard.tsx` (2px solid outline)

#### Skeleton Loaders

- [ ] [T251] Implement skeleton loader for all widgets in corresponding widget files (show during data fetch)
- [ ] [T252] Add shimmer animation to skeletons in `SkeletonLoader.tsx` (2s loop with gradient)

#### Toast Notifications

- [ ] [T253] Implement toast for theme saved in `ThemeCustomizer.tsx` (success toast, auto-dismiss 3s)
- [ ] [T254] Implement toast for layout saved in `LayoutCustomizer.tsx` (success toast, auto-dismiss 3s)
- [ ] [T255] Implement toast for errors in `ErrorBoundary.tsx` (error toast with retry button)

#### Animation Performance

- [ ] [T256] Enable GPU acceleration for all animations in `AnimatedCard.tsx` (use transform, opacity only)
- [ ] [T257] Add will-change sparingly in `AnimatedCard.tsx` (only for actively animating elements)
- [ ] [T258] Test all animations at 60fps in browser DevTools (Performance tab)

#### Accessibility for Animations

- [ ] [T259] Test all animations with `prefers-reduced-motion` in browser DevTools (disable animations)
- [ ] [T260] Verify `useReducedMotion()` hook disables all Framer Motion animations
- [ ] [T261] Add instant transitions for reduced motion in `AnimatedCard.tsx` (duration: 0)

#### Testing

- [ ] [T262] [P] Write visual regression tests for animations in `frontend/tests/visual/animations.spec.ts` (capture screenshots)
- [ ] [T263] Write performance test for 60fps animations in `frontend/tests/performance/animation-fps.spec.ts` (measure frame rate)

---

### Phase 9: Testing & Quality Assurance

#### Unit Test Coverage

- [ ] [T264] [P] Achieve 80% unit test coverage for all components (run `npm test -- --coverage`)
- [ ] [T265] [P] Write tests for custom hooks in `frontend/src/hooks/*.test.ts` (useTheme, useWidgetLayout, useDashboardData, useReducedMotion)
- [ ] [T266] [P] Write tests for context providers in `frontend/src/contexts/*.test.tsx` (ThemeContext, WidgetLayoutContext)
- [ ] [T267] [P] Review and fix all test failures (ensure 100% passing)

#### Integration Tests

- [ ] [T268] Write integration test for dashboard data aggregation in `frontend/tests/integration/dashboard-data.test.tsx` (fetch all services in parallel)
- [ ] [T269] Write integration test for SignalR updates in `frontend/tests/integration/signalr-updates.test.tsx` (mock SignalR events, verify widget updates)
- [ ] [T270] Write integration test for theme persistence in `frontend/tests/integration/theme-persistence.test.tsx` (save theme, reload, verify applied)
- [ ] [T271] Write integration test for layout persistence in `frontend/tests/integration/layout-persistence.test.tsx` (save layout, reload, verify order)

#### E2E Tests (Playwright)

- [ ] [T272] Write E2E test for daily challenge flow in `frontend/tests/e2e/daily-challenge.spec.ts` (complete challenge, verify celebration)
- [ ] [T273] Write E2E test for theme customization flow in `frontend/tests/e2e/theme-customization.spec.ts` (select preset, verify applied)
- [ ] [T274] Write E2E test for widget drag-and-drop flow in `frontend/tests/e2e/widget-drag-drop.spec.ts` (reorder widgets, verify saved)
- [ ] [T275] Write E2E test for level-up celebration flow in `frontend/tests/e2e/level-up.spec.ts` (trigger level-up, verify confetti + modal)

#### Accessibility Audits

- [ ] [T276] Run axe-core audit on dashboard in browser DevTools (Accessibility tab, fix all violations)
- [ ] [T277] Run Lighthouse accessibility audit (target score: 100)
- [ ] [T278] Fix all WCAG 2.1 AA violations (color contrast, keyboard nav, ARIA attributes)
- [ ] [T279] Test keyboard navigation for all interactive elements (Tab, Enter, Escape, Arrow keys)
- [ ] [T280] Test screen reader compatibility (NVDA on Windows, VoiceOver on macOS)

#### Performance Audits

- [ ] [T281] Run Lighthouse performance audit (target score: ≥90)
- [ ] [T282] Verify FCP <1.5s (First Contentful Paint)
- [ ] [T283] Verify LCP <2.5s (Largest Contentful Paint)
- [ ] [T284] Verify TTI <3s (Time to Interactive)
- [ ] [T285] Verify CLS <0.1 (Cumulative Layout Shift)
- [ ] [T286] Verify bundle size <150KB gzipped increase (run `npm run build`, check bundle analyzer)
- [ ] [T287] Optimize bundle size if needed (code splitting, lazy loading, tree shaking)

#### Cross-Browser Testing

- [ ] [T288] [P] Test on Chrome 90+ (desktop + mobile)
- [ ] [T289] [P] Test on Firefox 88+ (desktop + mobile)
- [ ] [T290] [P] Test on Safari 14+ (desktop + mobile)
- [ ] [T291] [P] Test on Edge 90+ (desktop)
- [ ] [T292] [P] Fix all browser compatibility issues (CSS fallbacks, polyfills)

#### Cross-Device Testing

- [ ] [T293] [P] Test on iOS devices (iPhone, iPad)
- [ ] [T294] [P] Test on Android devices (various screen sizes)
- [ ] [T295] [P] Fix all mobile-specific issues (touch interactions, viewport)

---

### Phase 10: Documentation & Deployment

#### Documentation

- [ ] [T296] [P] Update `frontend/README.md` with feature overview (Gamification Widget Layout section)
- [ ] [T297] [P] Document all components in Storybook (create stories for shared components)
- [ ] [T298] [P] Create user guide in `docs/user-guide-widget-layout.md` (how to customize theme, layout)
- [ ] [T299] [P] Document performance optimization techniques in `docs/performance-optimization.md` (LazyMotion, code splitting)
- [ ] [T300] [P] Update `CHANGELOG.md` with version 1.0.0 entry (Gamification Widget Layout feature)

#### Pull Request

- [ ] [T301] Create pull request from `001-gamification-widget-layout` to `main` (include detailed description, screenshots)
- [ ] [T302] Request code reviews (minimum 2 approvals)
- [ ] [T303] Address code review feedback (fix issues, answer questions)
- [ ] [T304] Verify all CI checks pass (tests, linting, build, performance budgets)

#### Deployment

- [ ] [T305] Merge pull request to main branch (squash and merge)
- [ ] [T306] Deploy to staging environment (run staging pipeline)
- [ ] [T307] Run QA validation on staging (manual testing + automated E2E tests)
- [ ] [T308] Fix any issues found in staging (create hotfix branch if needed)
- [ ] [T309] Deploy to production with feature flag disabled (run production pipeline)
- [ ] [T310] Enable feature flag for 10% of users (canary rollout)
- [ ] [T311] Monitor metrics for 24 hours (performance, errors, user engagement)
- [ ] [T312] Enable feature flag for 100% of users (full rollout)
- [ ] [T313] Monitor post-launch metrics for 1 week (performance, errors, feedback)

---

## Dependency Graph (User Story Completion Order)

### Critical Path (Must be done sequentially)

1. **Setup & Foundation** (Phase 1)
   - Required for all subsequent phases
   - Creates infrastructure, hooks, contexts

2. **Layout Shell & Navigation** (Phase 2) → Depends on Phase 1
   - Required for all widgets (provides layout container)
   - [US1] Dashboard Home Screen (partial)

3. **Shared Component Library** (Phase 3) → Depends on Phase 1
   - Required for all widgets (provides AnimatedCard, ProgressRing, etc.)

4. **Core Widgets** (Phases 4-5) → Depends on Phases 1-3
   - [US1] Dashboard Home Screen (complete all 14 widgets)
   - [US4] Achievement Showcase
   - [US6] XP Bar with Level-Up Animation
   - [US8] VIP Tier Progression
   - [US9] Daily Login Calendar
   - [US10] Live Activity Feed

5. **Widget Grid & Drag-and-Drop** (Phase 6) → Depends on Phases 4-5
   - [US1] Dashboard Home Screen (complete with reordering)

6. **Theme Customization** (Phase 7) → Depends on Phase 1 (can be parallel with Phases 4-6)
   - [US2] Theme Customization System

7. **Animations & Polish** (Phase 8) → Depends on Phases 4-6
   - Enhances all widgets, not blocking

8. **Testing & QA** (Phase 9) → Depends on all previous phases
   - Validates all user stories

9. **Documentation & Deployment** (Phase 10) → Depends on Phase 9
   - Final delivery

### Parallel Execution Opportunities

#### Phase 1 (All tasks can run in parallel after initial setup)
```
T002 (Install Framer Motion)
├─ T003-T006 (Create directories) [P]
├─ T007-T012 (Define interfaces) [P]
├─ T013-T016 (TailwindCSS config) [P]
├─ T022-T024 (Create contexts) [P]
└─ T026-T028 (Test utilities) [P]

After T003-T012 complete:
├─ T017-T021 (Implement hooks) - Sequential within hooks, but hooks are independent
```

#### Phase 3 (Shared components are fully parallelizable)
```
T054-T060 (Create shared components) [P]
├─ T061-T065 (AnimatedCard implementation)
├─ T066-T071 (ProgressRing implementation)
├─ T072-T076 (ParticleEffect implementation)
├─ T077-T078 (SkeletonLoader implementation)
├─ T079-T080 (ErrorBoundary implementation)
├─ T081 (EmptyState implementation)
└─ T082-T083 (ToastNotification implementation)

T084-T088 (Tests) [P] - After component implementations
```

#### Phase 4-5 (Widgets are fully parallelizable)
```
T089-T093 (Create widget components) [P]
├─ T094-T099 (DailyChallengeWidget) → [US1]
├─ T100-T106 (LevelProgressWidget) → [US6]
├─ T107-T112 (ActiveMissionsWidget) → [US1]
├─ T113-T120 (RecentAchievementsWidget) → [US4]
└─ T121-T125 (LeaderboardWidget) → [US1]

T131-T139 (Create Phase 5 widgets) [P]
├─ T140-T145 (BonusTrackerWidget) → [US1]
├─ T146-T151 (MiniGamesWidget) → [US1]
├─ T152-T156 (TournamentWidget) → [US1]
├─ T157-T162 (JackpotWidget) → [US1]
├─ T163-T169 (ActivityFeedWidget) → [US10]
├─ T170 (PersonalGoalsWidget) → [US1]
├─ T171-T175 (RewardCalendarWidget) → [US9]
├─ T176-T177 (StreakTrackerWidget) → [US1]
└─ T178-T181 (VIPStatusWidget) → [US8]

T126-T130, T182 (Widget tests) [P] - After widget implementations
```

#### Phase 7 (Theme components can be parallel, application is sequential)
```
T206-T208 (Create theme components) [P]
├─ T209-T215 (Theme presets)
├─ T216-T221 (Custom theme creator)
└─ T222-T229 (Other theme settings)

Then:
T230-T233 (Theme application) - Sequential
T234-T236 (Tests) [P]
```

#### Phase 9 (Tests can run in parallel by category)
```
T264-T267 (Unit tests) [P]
T268-T271 (Integration tests) [P]
T272-T275 (E2E tests) [P]
T276-T280 (Accessibility audits) - Sequential within audits
T281-T287 (Performance audits) - Sequential within audits
T288-T292 (Cross-browser testing) [P]
T293-T295 (Cross-device testing) [P]
```

#### Phase 10 (Documentation can be parallel, deployment is sequential)
```
T296-T300 (Documentation) [P]

Then:
T301-T304 (Pull request) - Sequential
T305-T313 (Deployment) - Sequential
```

## Summary Statistics

- **Total Tasks:** 297 (reduced from 313 after removing redundant setup + drag-and-drop)
- **Tasks Removed:**
  - 3 redundant setup tasks (T001-T003)
  - 13 drag-and-drop tasks (removed from Phase 6)
- **Completed Tasks:** 3 (branch creation, project initialization, base directory setup)
- **Remaining Tasks:** 294
- **Parallelizable Tasks:** ~165 (56%)
- **User Stories Covered:** 10 (FR-1 to FR-10)
- **Estimated Duration:** 10.5 weeks → **Reduced to ~9 weeks** (due to simplified Phase 1 & 6)
- **Test Tasks:** 46 (16%)

### Scope Changes
- ✅ **Removed:** Drag-and-drop widget reordering
- ✅ **Simplified:** Fixed widget grid with visibility toggles only
- ✅ **Kept:** All 14 widgets, theme customization, animations, real-time updates

## Next Steps

1. Review this task list with the development team
2. Assign tasks to team members based on expertise
3. Set up project tracking (Jira, Linear, or GitHub Projects)
4. Begin Phase 1 implementation
5. Hold daily standups to track progress
6. Adjust timeline based on actual velocity

---

**Last Updated:** 2025-11-12
**Status:** Ready for Implementation

