# Gamification Widget Layout - Technical Specification

**Version:** 1.0.0
**Created:** 2025-11-09
**Last Updated:** 2025-11-09
**Status:** Draft
**Author:** Claude Code (AI Assistant)

## Constitution Alignment

This specification adheres to the following constitutional principles:

- **Code Quality:** SOLID principles and Clean Code standards applied
- **Testing:** AAA pattern with single assertions per test
- **UX Consistency:** Design system compliance and WCAG 2.1 AA accessibility
- **Performance:** Meets defined performance budgets (Lighthouse 90+, FCP <1.5s, TTI <3s)
- **Type Safety:** Full TypeScript strict mode compliance

## Overview

### Purpose

The Gamification Widget Layout feature transforms the Smartico platform into an immersive, engaging experience that introduces game-like elements into marketing, training, and business activities. The primary goals are:

1. **Increase User Stickiness**: Create an immersive dashboard with interactive widgets, animations, and real-time updates that keep users engaged
2. **Motivate Through Rewards**: Present rewards in exciting, visually appealing ways with multiple presentation modes and rarity tiers
3. **Drive Retention**: Provide personalized progress tracking with multi-dimensional visualizations that encourage return visits
4. **Build Loyalty**: Showcase loyalty benefits, VIP tiers, and referral programs with engaging visual incentives
5. **Enable Personalization**: Allow users to customize themes, avatars, and widget layouts to create their unique experience

This feature focuses exclusively on the presentation layer, creating a new "Dashboard" section that aggregates existing gamification data (missions, bonuses, mini games, tournaments, levels, jackpots) into a unified, visually stunning interface.

## Clarifications

### Session 2025-11-12

- Q: Should the design file's dark gradient glassmorphism aesthetic be the primary theme or an alternate? → A: Use design file's dark gradient as primary "Royal Purple" preset; Ocean Blue becomes secondary light option
- Q: Should widget cards use glassmorphism or solid backgrounds? → A: Use glassmorphism (`bg-slate-800/50 backdrop-blur-lg border border-purple-500/30`) for all widget cards
- Q: Should animations use CSS keyframes (design file) or Framer Motion (spec)? → A: Replace all with Framer Motion for consistency
- Q: Should navigation follow the design file's fixed sidebar or use a different pattern? → A: Use fixed sidebar navigation (left-side, 256px/w-64 width) as shown in design file
- Q: Should there be a top header bar with user info and counters? → A: Include sticky top header: Level badge, coins/gems display, notification bell (with badge count), user avatar (from design file)

### Scope

**In Scope:**
- **New Dashboard page** with customizable 14-widget layout and **fixed sidebar navigation** (256px width, glassmorphism style matching design master file)
- **Core Gamification Widgets:**
  - **Missions Widget**: Daily challenges display with progress tracking and completion status
  - **Bonuses Widget**: Active bonuses showcase with expiration timers and claim status
  - **Mini Games Widget**: Spotlight for Spin the Wheel, Gift Box, Scratch Card, MatchX with quick-play access
  - **Tournaments Widget**: Active/upcoming tournament cards (integrated via Live Activity Feed)
  - **Levels Widget**: XP progress bar with level-up rewards preview
  - **Jackpots Widget**: Live jackpot pools (Mega/Mini/Major/Minor) with real-time countdown timers
- **Supporting Widgets:**
  - Progress Rings (multi-dimensional goal tracking)
  - Quick Stats (aggregated metrics dashboard)
  - VIP Tier Progress (loyalty ladder visualization)
  - Daily Login Calendar (streak tracking with rewards)
  - Streak Counter (engagement metric display)
  - Achievements Showcase (badge collection gallery)
  - Reward Showcase (prize display with multiple presentation modes)
  - Live Activity Feed (real-time platform events)
  - Upcoming Rewards (personalized recommendations)
- **Reusable animation component library** (AnimatedCard, ProgressRing, RewardBadge, CountUpNumber, ParticleEffect, ToastNotification, SkeletonLoader)
- **Theme system**: 5 predefined theme presets with **Royal Purple (Dark Glassmorphism)** as default, plus Ocean Blue (light), Neon Cyber, Nature Zen, Sunset Orange + custom theme creator
- **Widget customization**: Drag-and-drop reordering, show/hide toggles, compact/expanded modes
- **Multi-dimensional progress visualizations** (circular rings, XP bar, skill trees, heat maps)
- **Reward presentation modes**: Card grid, trophy cabinet, treasure chest, slot machine
- **Real-time updates** using existing SignalR events (/hubs/progress)
- **Responsive design** for mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Complete accessibility features** (WCAG 2.1 AA compliance)
- **Performance optimizations** (lazy loading, skeleton loaders, 60fps animations, <150KB bundle increase)

**Out of Scope:**
- New backend API endpoints or business logic
- Modifications to existing feature pages (Missions, Bonuses, Mini Games, Tournaments, Levels, Jackpots remain unchanged)
- New gamification mechanics or reward algorithms
- Social features (user-to-user messaging, friend lists)
- Push notifications or email alerts
- Mobile native app development
- Gamification analytics dashboard (separate feature)
- User-generated content systems
- Integration with third-party gamification platforms

### Target Users

- **Marketing Managers**: Track campaign engagement and user activation metrics in an engaging format
- **Training Coordinators**: Monitor employee progress through training modules with visual skill trees
- **Platform End-Users**: Experience an immersive interface that motivates continued engagement
- **Sales Teams**: Track performance against quotas with leaderboards and tier progression
- **HR/People Ops**: Drive employee engagement in wellness and onboarding programs

## Requirements

### Functional Requirements

#### FR-1: Dashboard Home Screen
**Priority:** Critical
**Description:** Display a customizable dashboard that serves as the central hub for all gamification widgets.

**Acceptance Criteria:**
- [ ] **Fixed sidebar navigation** (left-side, 256px width, `fixed left-0 top-0 h-full w-64`): glassmorphism style `bg-slate-800/50 backdrop-blur-lg border-r border-purple-500/30`
- [ ] Sidebar menu items: Dashboard (active with gradient `bg-gradient-to-r from-purple-600 to-pink-600`), Progress, Rewards, VIP Tiers, Daily Login, Referrals, Activity Feed, Settings
- [ ] Main content area offset by sidebar: `ml-64` (256px left margin)
- [ ] **Sticky top header** (`sticky top-0 z-40`, glassmorphism `bg-slate-800/30 backdrop-blur-lg border-b border-purple-500/30`):
  - Left: Page title "Dashboard" + Level badge (gradient `bg-gradient-to-r from-amber-500 to-orange-500`, e.g., "Level 42")
  - Right: Coin counter (with icon 💰), Gem counter (with icon 💎), Notification bell (with red badge showing count), User avatar (rounded with purple border)
- [ ] Mobile: Collapsible hamburger menu (☰), sidebar slides in/out with overlay
- [ ] Dashboard displays 3-column grid (desktop 1024px+), 2-column (tablet 768-1023px), single-column (mobile 320-767px)
- [ ] Dashboard background: `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900` (Royal Purple default theme)
- [ ] All widget cards use glassmorphism: `bg-slate-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl` with hover transition `hover:border-purple-500`
- [ ] 14 core widgets available: Progress Rings, Quick Stats, Active Jackpots, Mini Games Spotlight, Daily Challenges (Missions), Active Bonuses, XP Progress Bar, VIP Tier Progress, Daily Login Calendar, Streak Counter, Achievements Showcase, Reward Showcase, Live Activity Feed, Upcoming Rewards
- [ ] All 6 gamification features integrated: Missions, Bonuses, Mini Games, Tournaments (via Live Feed), Levels (XP Bar), Jackpots
- [ ] Users can drag-and-drop widgets to reorder (desktop/tablet)
- [ ] Users can show/hide widgets via customization panel
- [ ] Users can toggle compact/expanded view modes per widget
- [ ] Skeleton loaders shown during data fetch
- [ ] Respects user's selected theme

#### FR-2: Theme Customization System
**Priority:** Critical
**Description:** Allow users to customize dashboard theme with light/dark mode and color presets.

**Acceptance Criteria:**
- [ ] Theme settings accessible via "Customize" button
- [ ] Light/Dark mode toggle with 300ms CSS transition
- [ ] 5 predefined presets:
  - **Royal Purple (Dark Glassmorphism)** - DEFAULT: `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900` with `backdrop-blur-lg` glassmorphism, border `border-purple-500/30`
  - Ocean Blue (Light): #0077BE primary, #00B4D8 accent
  - Neon Cyber: #00F0FF, #FF00F0
  - Nature Zen: #2D5016, #A8E6CF
  - Sunset Orange: #FF6B35, #F7931E
- [ ] Custom color picker for primary/accent colors (HSL)
- [ ] Theme persisted in localStorage
- [ ] Font size options: Small (14px), Medium (16px), Large (18px)

#### FR-3: Progress Rings (Apple Watch Style)
**Priority:** High
**Description:** Display circular progress rings for daily/weekly goals.

**Acceptance Criteria:**
- [ ] 3 nested circular rings with distinct colors
- [ ] Each shows: goal name, current/target value, percentage
- [ ] Rings fill smoothly with 500ms Framer Motion animation (spring physics)
- [ ] Completed rings (100%) display pulsing glow (Framer Motion loop)
- [ ] Tapping shows detailed tooltip
- [ ] Real-time updates via SignalR
- [ ] Respects prefers-reduced-motion (via `useReducedMotion()` hook)

#### FR-4: Achievement Showcase with 3D Card Flip
**Priority:** High
**Description:** Display achievements with 3D flip animations.

**Acceptance Criteria:**
- [ ] Up to 6 recent achievements in grid: 2x3 (desktop), 2x2 (tablet), 1x4 (mobile)
- [ ] Card shows icon, name, date on front
- [ ] Hover/tap flips card to reveal description and rarity
- [ ] 600ms Framer Motion 3D flip animation (`rotateY: 180`, spring transition)
- [ ] "New!" badge with pulse (Framer Motion loop) for 24h after earning
- [ ] Color-coded by rarity
- [ ] Links to full achievements gallery

#### FR-5: Reward Showcase - Multiple Modes
**Priority:** Critical
**Description:** Display rewards in card grid, trophy cabinet, treasure chest, or slot machine modes.

**Acceptance Criteria:**
- [ ] **Card Grid**: 3 columns (desktop), 2 (tablet), 1 (mobile) with hover 3D transform
- [ ] **Trophy Cabinet**: 3D shelves with perspective, spotlight hover effects
- [ ] **Treasure Chest**: Animated opening with particle effects, 2-3s duration
- [ ] **Slot Machine**: 3 spinning reels for random rewards, 1-2s spin
- [ ] Rarity color coding: Common (#C0C0C0), Rare (#4A90E2), Epic (#9D4EDD), Legendary (#FFD700), Mythic (rainbow)
- [ ] "Claim" button with press animation
- [ ] View mode switcher

#### FR-6: XP Bar with Level-Up Animation
**Priority:** High
**Description:** Display XP with progress bar and celebration on level-up.

**Acceptance Criteria:**
- [ ] Shows current level, XP, next level XP, percentage
- [ ] Gradient fill (blue→purple) with shimmer (2s loop)
- [ ] "+X XP" floating number on gains (500ms fade)
- [ ] Level-up triggers: bar fills 100%, confetti burst, "LEVEL UP!" bounce, modal with benefits
- [ ] Next level preview
- [ ] Links to Levels page

#### FR-7: Skill Tree (RPG-Style)
**Priority:** Medium
**Description:** Visual skill tree showing unlockable branches.

**Acceptance Criteria:**
- [ ] 5-7 branches for skill areas (Mission Master, Bonus Hunter, etc.)
- [ ] 3-5 nodes per branch for milestones
- [ ] Unlocked nodes colored, locked nodes grayscale with locks
- [ ] Animated connecting lines on unlock
- [ ] Click shows tooltip with requirements, rewards, progress
- [ ] Zoom/pan (desktop), pinch-to-zoom (mobile)

#### FR-8: VIP Tier Progression
**Priority:** High
**Description:** Display tier ladder with visual badges and benefits.

**Acceptance Criteria:**
- [ ] 5 vertical tier badges: Bronze → Silver → Gold → Platinum → Diamond
- [ ] Current tier highlighted with glow and enlargement
- [ ] Progress bar: "X points to next tier" with percentage
- [ ] Tap shows modal with benefits comparison table (checkmark animations)
- [ ] Tier-specific color themes applied

#### FR-9: Daily Login Calendar
**Priority:** High
**Description:** 7-day/30-day calendar with streak incentives.

**Acceptance Criteria:**
- [ ] 7-day default, expandable to 30 days
- [ ] Each day shows: number, reward preview, status (Claimed/Available/Locked)
- [ ] Current day glow effect
- [ ] Claimed days: checkmark
- [ ] Missed days: broken chain visual
- [ ] Progressive reward values (Day 1: 10pts, Day 7: 100pts)
- [ ] Comeback bonus for 7+ day absence
- [ ] "Claim" button with press animation

#### FR-10: Live Activity Feed
**Priority:** Medium
**Description:** Real-time feed of other users' activities.

**Acceptance Criteria:**
- [ ] 10 recent activities with infinite scroll/"Load More"
- [ ] Each shows: masked username, action, timestamp, icon
- [ ] New activities slide in from top (300ms fade+slide)
- [ ] Real-time via SignalR (BonusClaimed, JackpotWon, LevelUpAchieved, etc.)
- [ ] Usernames masked for privacy (e.g., "J\*\*\*n")
- [ ] Activity types: Missions, Badges, Bonuses, Jackpots, Levels
- [ ] "No recent activity" empty state

### Non-Functional Requirements

#### NFR-1: Performance
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: ≥ 90
- Animation frame rate: 60fps
- Bundle size increase: < 150KB gzipped
- API response (existing): < 500ms p95
- SignalR latency: < 100ms

#### NFR-2: Scalability
- Support 20+ widgets without degradation
- Infinite scroll: 1000+ entries smoothly
- Heat map: 365 days in < 500ms
- Theme switch: < 300ms

#### NFR-3: Reliability
- Offline function with cached data
- Graceful SignalR reconnection
- Animation failures don't block interactions
- LocalStorage fallback to sessionStorage

#### NFR-4: Security
- Sanitize all user input (XSS prevention)
- Validate colors, goal names
- Never expose actual usernames in feed
- No sensitive data in localStorage

#### NFR-5: Accessibility
- WCAG AA compliance
- Full keyboard navigation (Tab, Enter, Escape, Arrows)
- ARIA labels, roles, live regions
- Color contrast: 4.5:1 (normal), 3:1 (large/UI)
- Visible focus (2px solid)
- Respect prefers-reduced-motion
- Support High Contrast Mode
- Zoom to 200% without breaking

## Technical Design

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              FRONTEND (React 19 + TypeScript)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              DashboardPage.tsx                   │  │
│  └───────────┬──────────────────────────────────────┘  │
│              │                                          │
│  ┌───────────▼──────────────────────────────────────┐  │
│  │         Widget Components Library               │  │
│  │  [DailyChallenges] [ProgressRings] [LiveFeed]  │  │
│  │  [Achievements] [RewardShowcase] [VIPTiers]     │  │
│  └──────────────────────────────────────────────────┘  │
│              │                                          │
│  ┌───────────▼──────────────────────────────────────┐  │
│  │        Reusable UI Components                   │  │
│  │  AnimatedCard, ProgressRing, RewardBadge        │  │
│  │  CountUpNumber, ParticleEffect, Toast, Skeleton │  │
│  └──────────────────────────────────────────────────┘  │
│              │                                          │
│  ┌───────────▼──────────────────────────────────────┐  │
│  │      Custom Hooks & State Management            │  │
│  │  useTheme, useWidgetLayout, useDashboardData    │  │
│  └──────────────────────────────────────────────────┘  │
│              │                                          │
│  ┌───────────▼──────────────────────────────────────┐  │
│  │      Existing Services (Reused)                 │  │
│  │  missionService, bonusService, signalr.ts       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────────────┘
              │ HTTP + SignalR
┌─────────────▼───────────────────────────────────────────┐
│      EXISTING BACKEND (No changes)                      │
│  GET /api/missions, /api/bonuses, etc.                  │
│  SignalR Hub: /hubs/progress                             │
└─────────────────────────────────────────────────────────┘
```

### Layout & Grid System Design

#### Desktop Layout (1024px+)

**3-Column Responsive Grid** with 12-column foundation:

```
┌────────────────────────────────────────────────────────────────────┐
│                        Dashboard Header                            │
│  [Logo] Gamification Dashboard            [Theme] [Settings] [👤] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  Progress Rings  │  │   Quick Stats    │  │ Active Jackpots │ │
│  │    (4 cols)      │  │     (4 cols)     │  │    (4 cols)     │ │
│  │                  │  │                  │  │                 │ │
│  │   ◉  ◉  ◉        │  │  🏆 Achievements │  │  💰 Mega Prize  │ │
│  │  ╱ │ ╲           │  │     127 / 200    │  │   $125,450.00   │ │
│  │ 75%│80%│90%      │  │                  │  │   ⏰ 2h 34m     │ │
│  │                  │  │  💎 Total Points │  │                 │ │
│  │ Missions Bonus   │  │     45,320       │  │  🎰 Mini Prize  │ │
│  │ XP Progress      │  │                  │  │    $3,240.50    │ │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────┐  ┌──────────────────────────┐ │
│  │      Mini Games Spotlight      │  │     Active Bonuses       │ │
│  │         (8 cols)               │  │        (4 cols)          │ │
│  │                                │  │                          │ │
│  │  🎰 Spin  🎁 Gift  🎫 Scratch  │  │  🎁 Welcome Bonus        │ │
│  │   100pts   FREE    50 gems     │  │     +500 Points          │ │
│  │                                │  │     ⏰ Expires in 6h     │ │
│  │  🎲 MatchX  (featured today)   │  │                          │ │
│  │   Jackpot: $5,230              │  │  💎 Daily Bonus          │ │
│  │                                │  │     50 Free Spins        │ │
│  │  [Play Now] [View All Games]   │  │     ✅ Claimed           │ │
│  └────────────────────────────────┘  │                          │ │
│                                      │  🏆 Loyalty Bonus        │ │
│  ┌────────────────────────────────┐  │     2x Points (Active)   │ │
│  │    Daily Challenges (Missions) │  │     ⏰ 12h remaining     │ │
│  │         (8 cols)               │  │                          │ │
│  │                                │  │  [View All Bonuses]      │ │
│  │  ☐ Complete 5 trades (3/5)     │  └──────────────────────────┘ │
│  │     +200 XP, 100 Points        │                               │
│  │  ☐ Win 3 mini games (1/3)      │  ┌──────────────────────────┐ │
│  │     +150 XP, 50 Gems           │  │   VIP Tier Progress      │ │
│  │  ☑ Login streak (DONE)         │  │        (4 cols)          │ │
│  │     +50 XP ✅                   │  │                          │ │
│  │                                │  │    💎 Diamond            │ │
│  │  [View All Missions]           │  │    ◇  Platinum (Next)    │ │
│  └────────────────────────────────┘  │    •  Gold (Current)     │ │
│                                      │    •  Silver             │ │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                   XP Progress Bar                          │   │
│  │                      (12 cols)                             │   │
│  │                                                            │   │
│  │  Level 12                                                  │   │
│  │  ████████████████░░░░░░░░░░░░░░ 8,450 / 10,000 XP (85%)   │   │
│  │                                                            │   │
│  │  Next Level Unlocks: "Master Trader" Badge + 500 Gems     │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │ Login Calendar   │  │  Streak Counter  │  │  Achievements   │ │
│  │    (4 cols)      │  │     (4 cols)     │  │    (4 cols)     │ │
│  │                  │  │                  │  │                 │ │
│  │  M T W T F S S   │  │       🔥         │  │  [🏅] [🏅]      │ │
│  │  ✓ ✓ ✓ ⭐ ◯ ◯ ◯   │  │       15         │  │  [🏅] [🏅]      │ │
│  │                  │  │    Day Streak    │  │                 │ │
│  │  Day 4 Streak!   │  │                  │  │  127 / 200      │ │
│  │  +50 Points      │  │  Keep it going!  │  │                 │ │
│  │                  │  │                  │  │                 │ │
│  │  [Claim]         │  │  [History]       │  │  [View All]     │ │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────┐  ┌──────────────────────────┐ │
│  │       Reward Showcase          │  │  Live Activity Feed      │ │
│  │         (8 cols)               │  │        (4 cols)          │ │
│  │                                │  │                          │ │
│  │  Mode: [Card] Trophy Chest Slot│  │  • J***n won Jackpot!   │ │
│  │                                │  │    (2m ago)              │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐       │  │  • S***h completed       │ │
│  │  │ 🎁  │ │ 🏆  │ │ 💰  │       │  │    "Weekly Warrior"      │ │
│  │  │Rare │ │Epic │ │Lgnd │       │  │  • YOU earned badge!     │ │
│  │  │     │ │     │ │     │       │  │  • M***l claimed bonus   │ │
│  │  └─────┘ └─────┘ └─────┘       │  │  • E***y leveled up      │ │
│  │                                │  │                          │ │
│  │  [View All Rewards]            │  │  [Load More]             │ │
│  └────────────────────────────────┘  └──────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              Upcoming Rewards (Recommendations)            │   │
│  │                      (12 cols)                             │   │
│  │                                                            │   │
│  │  🎯 "Complete 2 more missions to unlock Golden Chest!"     │   │
│  │  🏆 "Weekend Tournament starts in 3h - Join now!"          │   │
│  │  🎰 "Your favorite mini game has JACKPOT BONUS today!"     │   │
│  │  💎 "Claim your daily bonus before it expires (6h left)"   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Grid Specifications**:
- Container: `max-w-7xl mx-auto px-6 py-8` (1280px max width)
- 12-column grid with `gap-6` (24px gap)
- Widget cards: `bg-slate-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6` (glassmorphism)
- Column spans: 4/4/4 (3 columns), 8/4 (2 columns), 12 (full width)

#### Tablet Layout (768px - 1023px)

**2-Column Responsive Grid**:

```
┌──────────────────────────────────────────┐
│          Dashboard Header                │
├──────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │Progress Rings│  │  Quick Stats     │ │
│  │   (6 cols)   │  │    (6 cols)      │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Active Jackpots               │ │
│  │         (12 cols)                  │ │
│  │  💰 Mega: $125,450 | Mini: $3,240  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Mini Games   │  │  Active Bonuses  │ │
│  │   (6 cols)   │  │    (6 cols)      │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Daily Challenges (Missions)     │ │
│  │         (12 cols)                  │ │
│  │     ☐ Task 1  ☐ Task 2  ☑ Task 3   │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      XP Progress Bar               │ │
│  │         (12 cols)                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ VIP Tier     │  │  Login Calendar  │ │
│  │   (6 cols)   │  │    (6 cols)      │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │Streak Counter│  │  Achievements    │ │
│  │   (6 cols)   │  │    (6 cols)      │ │
│  └──────────────┘  └──────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │       Reward Showcase              │ │
│  │         (12 cols)                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │      Live Activity Feed            │ │
│  │         (12 cols)                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │    Upcoming Rewards                │ │
│  │         (12 cols)                  │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

**Grid Specifications**:
- Container: `px-4 py-6` (1024px max width)
- 12-column grid with `gap-4` (16px gap)
- Column spans: 6/6 (2 columns), 12 (full width)

#### Mobile Layout (320px - 767px)

**Single-Column Stacked Layout**:

```
┌─────────────────────────────┐
│    ☰  Dashboard      [👤]   │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │   Progress Rings      │  │
│  │      (12 cols)        │  │
│  │      ◉  ◉  ◉          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   Quick Stats         │  │
│  │      (12 cols)        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   Active Jackpots     │  │
│  │      (12 cols)        │  │
│  │  💰 Mega: $125,450    │  │
│  │  🎰 Mini: $3,240      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   Mini Games          │  │
│  │      (12 cols)        │  │
│  │  🎰 🎁 🎫 🎲          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Daily Challenges     │  │
│  │      (12 cols)        │  │
│  │  ☐ Mission 1          │  │
│  │  ☐ Mission 2          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   Active Bonuses      │  │
│  │      (12 cols)        │  │
│  │  🎁 +500 Points       │  │
│  │  💎 50 Free Spins     │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   XP Progress Bar     │  │
│  │      (12 cols)        │  │
│  │  Level 12 ████░░ 85%  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   VIP Tier Progress   │  │
│  │      (12 cols)        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Login Calendar       │  │
│  │      (12 cols)        │  │
│  │   M T W T F S S       │  │
│  │   ✓ ✓ ✓ ⭐ ◯ ◯ ◯       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   Streak Counter      │  │
│  │      (12 cols)        │  │
│  │        🔥 15          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Achievements         │  │
│  │      (12 cols)        │  │
│  │   [🏅] [🏅]           │  │
│  │   [🏅] [🏅]           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Reward Showcase      │  │
│  │      (12 cols)        │  │
│  │   [🎁] [🏆]           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Live Activity Feed   │  │
│  │      (12 cols)        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Upcoming Rewards     │  │
│  │      (12 cols)        │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Grid Specifications**:
- Container: `px-3 py-4` (full width)
- Single column with `gap-3` (12px gap)
- All widgets: 12 columns (full width)

#### Widget Layout Customization

**Default Widget Order** (Priority-based, 14 widgets total):
1. **Progress Rings** (top priority - daily goals visibility)
2. **Quick Stats** (key metrics at a glance)
3. **Active Jackpots** (urgency - live jackpot pools with countdown timers)
4. **Mini Games Spotlight** (engagement - quick access to Spin the Wheel, Gift Box, Scratch Card, MatchX)
5. **Daily Challenges (Missions)** (actionable tasks - mission progress tracking)
6. **Active Bonuses** (reward visibility - available bonuses with expiration timers)
7. **XP Progress Bar** (gamification core - level progression)
8. **VIP Tier Progress** (loyalty incentive - tier advancement tracking)
9. **Daily Login Calendar** (retention driver - streak tracking)
10. **Streak Counter** (engagement motivator - current streak display)
11. **Achievements Showcase** (social proof - badge collection)
12. **Reward Showcase** (reward visibility - prize gallery)
13. **Live Activity Feed** (social engagement - real-time platform activity)
14. **Upcoming Rewards (Recommendations)** (recommendation engine - personalized suggestions)

**Drag-and-Drop Reordering** (Desktop/Tablet only):
- Users can drag widgets vertically within their column
- Snap to grid positions with visual feedback
- Cross-column dragging changes widget width (4→8→12 cols)
- Touch-friendly drag handles on mobile (tap + hold)
- Persist order in localStorage: `widgetLayout.order: string[]`

**Show/Hide Widgets**:
- Customization panel: "Manage Widgets" button in header
- Checkbox list of all 14 widgets
- Hidden widgets removed from grid (not just `display: none`)
- Persist visibility: `widgetLayout.visibility: Record<string, boolean>`

**Compact/Expanded Modes**:
- Toggle per widget: Icon button in widget header
- Compact: Reduced padding, smaller fonts, collapsed details
- Expanded: Full padding, larger fonts, expanded details
- Persist mode: `widgetLayout.sizeMode: Record<string, 'compact' | 'expanded'>`

#### Responsive Breakpoints

```typescript
// Tailwind breakpoints
const breakpoints = {
  mobile: '320px',   // sm: 0-767px
  tablet: '768px',   // md: 768-1023px
  desktop: '1024px', // lg: 1024+px
  wide: '1280px'     // xl: 1280+px (max-width container)
};

// Grid columns by breakpoint
const gridColumns = {
  mobile: 'grid-cols-1',           // 1 column
  tablet: 'grid-cols-2',           // 2 columns
  desktop: 'grid-cols-3',          // 3 columns
  wide: 'grid-cols-12'             // 12-column foundation
};

// Gap by breakpoint
const gridGap = {
  mobile: 'gap-3',    // 12px
  tablet: 'gap-4',    // 16px
  desktop: 'gap-6'    // 24px
};
```

#### Grid Implementation (TailwindCSS)

```tsx
<div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 max-w-7xl">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6">

    {/* Desktop: 4 cols, Tablet: 6 cols, Mobile: 12 cols */}
    <div className="col-span-1 md:col-span-1 lg:col-span-4">
      <DailyChallengesWidget mode={sizeMode.dailyChallenges} />
    </div>

    <div className="col-span-1 md:col-span-1 lg:col-span-4">
      <ProgressRingsWidget mode={sizeMode.progressRings} />
    </div>

    <div className="col-span-1 md:col-span-1 lg:col-span-4">
      <QuickStatsWidget mode={sizeMode.quickStats} />
    </div>

    {/* Desktop: 8 cols, Tablet: 12 cols, Mobile: 12 cols */}
    <div className="col-span-1 md:col-span-2 lg:col-span-8">
      <AchievementsWidget mode={sizeMode.achievements} />
    </div>

    <div className="col-span-1 md:col-span-1 lg:col-span-4">
      <VIPTierWidget mode={sizeMode.vipTier} />
    </div>

    {/* Full width: 12 cols */}
    <div className="col-span-1 md:col-span-2 lg:col-span-12">
      <XPProgressWidget mode={sizeMode.xpProgress} />
    </div>

  </div>
</div>
```

### Data Model

**Existing Entities (Reused):**
- Mission, Bonus, MiniGame, Level, UserLevelProgress, JackpotDetails

**New Client-Side Models:**

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark';
  preset: 'neon-cyber' | 'nature-zen' | 'royal-purple' | 'ocean-blue' | 'sunset-orange' | 'custom';
  primaryColor?: string;
  accentColor?: string;
  fontSize: 14 | 16 | 18;
}

interface WidgetLayoutConfig {
  order: string[];
  visibility: Record<string, boolean>;
  sizeMode: Record<string, 'compact' | 'expanded'>;
}
```

### Component Specification

**AnimatedCard, ProgressRing, RewardBadge, CountUpNumber, ParticleEffect, ToastNotification, SkeletonLoader** - See full props interfaces and usage examples in extended documentation.

### Service Layer Design

**Custom Hooks:**
- `useTheme()`: Manage theme with localStorage
- `useWidgetLayout()`: Manage layout preferences
- `useAnimationIntensity()`: Handle motion preferences
- `useDashboardData()`: Aggregate data from all services

## Testing Specification

### Unit Tests
- AnimatedCard: Rendering, rarity classes, click handlers, keyboard accessibility
- ProgressRing: Progress calculation, glow effects, ARIA attributes
- useTheme: LocalStorage persistence, theme switching

### Integration Tests
- Dashboard data aggregation
- Real-time widget updates via SignalR
- Theme persistence across reloads

### E2E Tests
- Complete daily challenge flow
- Customize theme flow
- Level-up celebration

## Performance Considerations

- **Code Splitting**: Lazy-load Framer Motion (~50KB), below-fold widgets
- **Bundle Budget**: <150KB total (AnimatedCard 2KB, ProgressRing 3KB, ParticleEffect 5KB, Framer Motion 50KB lazy-loaded)
- **Animations**: All animations via Framer Motion with GPU-accelerated transforms, `useReducedMotion()` hook for accessibility, max 50 particles
- **Framer Motion optimization**: Use `layout` prop sparingly, prefer `animate` + `transform`, enable `layoutId` for shared element transitions
- **Monitoring**: Track FCP, TTI, FPS (target 60fps), SignalR latency

## Security Considerations

- [x] Input validation: Sanitize colors (HEX validation), goal names (max 100 chars, no HTML)
- [x] XSS prevention: React JSX escaping, no dangerouslySetInnerHTML
- [x] Privacy: Never expose actual usernames, mask in activity feed
- [x] LocalStorage: No tokens/passwords, only preferences

## Accessibility Checklist

- [x] Semantic HTML, ARIA labels
- [x] Keyboard navigation
- [x] Focus indicators (2px solid)
- [x] Color contrast WCAG AA
- [x] Alt text for images
- [x] Screen reader tested (NVDA, VoiceOver)
- [x] Respect prefers-reduced-motion

## Dependencies

**External Libraries:**
- **Framer Motion** ^11.0.0 - Animations - MIT
- **lucide-react** (existing) - Icons - ISC
- **TailwindCSS** (existing) - Styling - MIT

**Internal Services:**
- missionService, bonusService, miniGameService, tournamentService, levelService, jackpotService, signalRService

## Assumptions

1. Existing APIs return data in expected format
2. SignalR events already implemented
3. User authenticated before dashboard access
4. Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
5. LocalStorage available (fallback to sessionStorage)
6. Default theme: **Royal Purple (Dark Glassmorphism)**, 16px font (based on design master file `frontend/design-files/1-Dashboard.html`)
7. Default layout: All 8 widgets visible, in standard order
8. Default animation: "moderate" intensity
9. Max 20 widgets, 50 particles, 5 goals

## Open Questions

None. All design decisions finalized with documented defaults.

## Change Log

| Version | Date       | Author           | Changes               |
|---------|------------|------------------|-----------------------|
| 1.0.0   | 2025-11-09 | Claude Code (AI) | Initial specification |

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] UX Designer: [Name] - [Date]
- [ ] Security Review: [Name] - [Date]

---

**Document Status:** Draft
**Implementation Start:** TBD
**Target Completion:** TBD
