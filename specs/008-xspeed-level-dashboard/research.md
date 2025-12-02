# xSpeed Level Dashboard - Research & Technical Decisions

**Created:** 2025-12-02
**Status:** Complete

## Technical Context Analysis

### Existing Infrastructure

Based on codebase exploration, the following infrastructure is already available:

1. **Level System Backend**: Full CQRS pattern with `LevelsController`, `GetUserLevelProgressQueryHandler`, and 30-second caching
2. **Level Components**: `LevelProgressWidget`, `LevelCard`, `LevelProgressBar`, `LevelBadge`, `LevelList`, `LevelUpNotification`
3. **Dashboard Framework**: `DashboardLayout`, `DashboardProvider`, `AnimatedCard`, `ProgressRing`
4. **API Client**: Retry logic, error handling, timeout management
5. **XSpeed Configuration**: Velocity Tiers defined (Ignition, Cruiser, Turbo, Supersonic)

### Unknowns Resolved

#### 1. Data Source for Velocity Tiers

**Decision:** Use existing Level API (`/api/levels/progress`) mapped to xSpeed Velocity Tiers

**Rationale:**
- The `UserLevelProgress` model already supports level names, XP tracking, and progression percentages
- Velocity Tiers map directly to Level entities (Tier 1 = Ignition @ 0 XP, Tier 2 = Cruiser @ 500 XP, etc.)
- No new backend endpoints needed - existing infrastructure sufficient

**Alternatives Considered:**
- Creating new `/api/velocity-tiers` endpoint → Rejected (duplicates existing functionality)
- Embedding tier config in frontend → Rejected (config already exists in `XSpeedConfiguration.cs`)

#### 2. Mission Availability Data

**Decision:** Extend existing missions API to include tier requirements

**Rationale:**
- Missions already have `TargetSegment` property
- Can derive availability from player's current tier level
- Mission availability matrix is tier-based (1 mission @ Tier 1, 2 @ Tier 2, 3 @ Tier 3-4)

**Alternatives Considered:**
- New `/api/missions/availability` endpoint → May be needed for tier filtering
- Client-side filtering → Acceptable for initial implementation

#### 3. XP Activity Feed

**Decision:** Reuse activity tracking from `activityFeed` in `DashboardData`

**Rationale:**
- `DashboardData` already includes `activityFeed: ActivityEvent[]`
- Filter activities by type (Slots, Table Games) to show XP sources
- XP rate: $10 wagered on Slots = 1 XP, $20 on Tables = 1 XP

**Alternatives Considered:**
- New `/api/xp/history` endpoint → Defer to Phase 2 if needed
- Derive from bet history → Complex, defer

#### 4. Real-Time Updates

**Decision:** Use SignalR integration (TODO in existing code)

**Rationale:**
- `SignalRProgressBroadcaster` exists in backend infrastructure
- `LevelProgressWidget` already has TODO for SignalR integration
- Essential for level-up celebrations without polling

**Alternatives Considered:**
- Polling every 30s → Fallback if SignalR unavailable
- WebSocket custom implementation → SignalR already in stack

#### 5. Tier Visual Branding

**Decision:** Use existing rarity color system with tier-specific icons

**Rationale:**
- Rarity colors map to tiers: Common (Ignition), Rare (Cruiser), Epic (Turbo), Legendary (Supersonic)
- `AnimatedCard` already supports `rarity` prop with corresponding border colors
- Consistent with badge rarity system

**Color Mapping:**
| Tier | Name | XP Required | Rarity | Border Color |
|------|------|-------------|--------|--------------|
| 1 | Ignition | 0 | Common | gray-500/30 |
| 2 | Cruiser | 500 | Rare | blue-500/30 |
| 3 | Turbo | 5,000 | Epic | purple-500/30 |
| 4 | Supersonic | 25,000 | Legendary | yellow-500/30 |

### Best Practices Identified

#### React Component Architecture
- Use custom hooks for data fetching (`useVelocityProgress`)
- Separate presentation from logic
- Memoize expensive calculations
- Error boundaries for graceful degradation

#### Animation Performance
- Use Framer Motion spring animations for smooth transitions
- Respect `prefers-reduced-motion`
- Throttle XP gain animations to prevent jank
- Use CSS transitions for simple hover effects

#### API Integration
- Leverage existing `LevelService` patterns
- Implement optimistic UI updates where possible
- Cache tier configuration client-side (static data)

### Integration Patterns

#### Dashboard Widget Integration
The xSpeed Level Dashboard will integrate as a new page/view using:
1. `DashboardLayout` as the container
2. `DashboardProvider` for context
3. Custom widgets following `AnimatedCard` patterns

#### Component Composition
```
XSpeedLevelDashboard (page)
├── VelocityTierCard (hero - current tier status)
│   ├── TierBadge (tier icon + name)
│   ├── XPProgressRing (circular progress)
│   └── TierBenefits (unlocked benefits)
├── TierJourneyProgress (horizontal tier timeline)
│   └── TierMilestone × 4 (Ignition → Supersonic)
├── NextTierPreview (goal card)
│   ├── NextTierBadge
│   ├── BenefitsPreview
│   └── XPRemaining
├── MissionAvailabilityCard (tier-gated missions)
│   └── MissionTierRow × 4
├── XPActivityFeed (recent earnings)
│   └── XPActivityItem × n
└── LevelUpCelebration (modal/overlay)
```

## Dependencies Confirmed

### Frontend Dependencies (Existing)
- React 18 ✓
- Framer Motion ✓
- Tailwind CSS ✓
- Glassmorphism CSS ✓

### Backend Dependencies (Existing)
- Level API endpoints ✓
- Missions API ✓
- SignalR infrastructure ✓
- Caching layer ✓

### New Dependencies Required
- None - all requirements met by existing infrastructure

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SignalR not connected | Medium | Medium | Implement polling fallback |
| Level API performance | Low | High | 30s caching already in place |
| Animation jank on mobile | Medium | Low | Reduce blur, respect motion prefs |
| Tier config mismatch | Low | Medium | Single source of truth in backend |

---

**Research Status:** Complete
**Blockers:** None identified
**Ready for:** Phase 1 Design
