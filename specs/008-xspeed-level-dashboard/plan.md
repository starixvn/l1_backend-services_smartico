# xSpeed Level Dashboard - Implementation Plan

**Version:** 1.0.0
**Created:** 2025-12-02
**Status:** Draft
**Owner:** Development Team

## Constitution Compliance Checklist

Before proceeding, verify alignment with project constitution:

- [x] **Code Quality:** Plan incorporates SOLID principles and Clean Code standards
- [x] **Testing Strategy:** AAA pattern with single assertions specified for all components
- [x] **UX Consistency:** Design system usage and accessibility requirements documented
- [x] **Performance:** Performance budgets and monitoring strategy defined
- [x] **Type Safety:** TypeScript strict mode compliance plan included

## Executive Summary

The xSpeed Level Dashboard is a player-facing dashboard view that emphasizes the core retention mechanics of the Velocity Tier level system. It provides players with clear visibility into their progression through four tiers (Ignition → Cruiser → Turbo → Supersonic), shows unlocked vs locked benefits, displays tier-gated mission availability, and celebrates tier advancements.

This feature leverages existing infrastructure (Level API, Dashboard widgets, Glassmorphism design system) while adding xSpeed-specific visualizations and the Velocity Program branding. The implementation focuses on creating psychological hooks for long-term engagement through clear progress visualization and aspiration-driving tier previews.

## Goals & Objectives

### Primary Goals
- Display player's Velocity Tier status prominently with tier-specific branding
- Visualize XP progress toward next tier with animated progress indicators
- Show tier benefits comparison (unlocked vs locked features)
- Display tier-gated mission availability matrix
- Provide celebratory feedback on tier advancement

### Success Metrics
- Player Engagement: 80% of active players view dashboard weekly
- Progression Understanding: 90% can identify their tier within 5 seconds
- Tier Advancement: 15% increase in tier advancement rate
- Session Duration: 20% longer sessions for dashboard viewers
- Technical: < 2 second initial load, 95% successful data loads

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)                 │
├─────────────────────────────────────────────────────────────────┤
│  XSpeedDashboardPage                                            │
│  ├── VelocityTierCard (hero status)                            │
│  │   ├── TierBadge                                             │
│  │   ├── XPProgressRing                                        │
│  │   └── TierBenefitsList                                      │
│  ├── TierJourneyProgress (timeline)                            │
│  │   └── TierMilestone × 4                                     │
│  ├── NextTierPreview (aspiration)                              │
│  ├── MissionAvailabilityCard                                   │
│  │   └── MissionTierRow × n                                    │
│  ├── XPActivityFeed                                            │
│  │   └── XPActivityItem × n                                    │
│  └── LevelUpCelebration (modal)                                │
├─────────────────────────────────────────────────────────────────┤
│  Custom Hooks                                                    │
│  ├── useVelocityProgress (player state)                        │
│  ├── useVelocityTiers (tier config)                            │
│  └── useXPActivity (activity feed)                             │
├─────────────────────────────────────────────────────────────────┤
│  Services                                                        │
│  └── VelocityService (API client wrapper)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Backend API (ASP.NET Core)                       │
├─────────────────────────────────────────────────────────────────┤
│  VelocityController                                              │
│  ├── GET /velocity/progress                                     │
│  ├── GET /velocity/tiers                                        │
│  ├── GET /velocity/missions                                     │
│  ├── GET /velocity/xp-activity                                  │
│  └── POST /velocity/level-up-events/{id}/acknowledge           │
├─────────────────────────────────────────────────────────────────┤
│  CQRS Handlers (MediatR)                                        │
│  ├── GetVelocityProgressQueryHandler                           │
│  ├── GetVelocityTiersQueryHandler                              │
│  ├── GetVelocityMissionsQueryHandler                           │
│  └── GetXPActivityQueryHandler                                 │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                  │
│  ├── SmarticoLevelApiClient (existing)                         │
│  ├── CacheService (30s TTL)                                    │
│  └── SignalRProgressBroadcaster                                │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Runtime: .NET 8
- Framework: ASP.NET Core
- Language: C#
- Pattern: CQRS with MediatR
- Caching: Distributed cache (30s TTL)

**Frontend:**
- Library: React 18+
- Language: TypeScript 5+ (strict mode)
- State: Custom hooks + Context
- Styling: TailwindCSS + Glassmorphism CSS
- Animation: Framer Motion

**DevOps:**
- Testing: Vitest + React Testing Library (Frontend), xUnit (Backend)
- CI/CD: Existing pipeline

### Key Design Decisions

1. **Reuse Existing Level API**: Map existing `/api/levels/progress` to Velocity Tier context rather than creating duplicate endpoints
2. **Static Tier Config**: Cache tier definitions client-side (they rarely change)
3. **Progressive Enhancement**: Core functionality works without animations; animations enhance experience
4. **Fallback for SignalR**: Polling fallback if WebSocket unavailable

## Implementation Phases

### Phase 1: Foundation
**Dependencies:** None

**Tasks:**
- [ ] Create TypeScript types for Velocity entities (`velocity.ts`)
- [ ] Implement `VelocityService` with API client integration
- [ ] Create `useVelocityProgress` hook with error handling
- [ ] Create `useVelocityTiers` hook for static config
- [ ] Unit tests for hooks and service

**Deliverables:**
- `frontend/src/types/velocity.ts`
- `frontend/src/services/velocityService.ts`
- `frontend/src/hooks/useVelocityProgress.ts`
- `frontend/src/hooks/useVelocityTiers.ts`
- Test files with 90%+ coverage

**Constitution Compliance:**
- Testing: AAA pattern, single assert per test
- Performance: Service includes timeout and retry
- Types: Full TypeScript strict mode compliance

### Phase 2: Core Components
**Dependencies:** Phase 1

**Tasks:**
- [ ] Create `VelocityTierCard` component (hero status display)
- [ ] Create `XPProgressRing` component (circular progress)
- [ ] Create `TierBadge` component (tier icon with rarity styling)
- [ ] Create `TierBenefitsList` component (unlocked benefits)
- [ ] Integrate tier rarity colors with AnimatedCard
- [ ] Unit tests for all components

**Deliverables:**
- `frontend/src/components/velocity/VelocityTierCard.tsx`
- `frontend/src/components/velocity/XPProgressRing.tsx`
- `frontend/src/components/velocity/TierBadge.tsx`
- `frontend/src/components/velocity/TierBenefitsList.tsx`
- Test files with 90%+ coverage

**Constitution Compliance:**
- Testing: Component render tests, prop validation
- Performance: Memoized calculations, optimized renders
- UX: WCAG AA compliance, keyboard navigation

### Phase 3: Progression Visualization
**Dependencies:** Phase 2

**Tasks:**
- [ ] Create `TierJourneyProgress` component (horizontal timeline)
- [ ] Create `TierMilestone` component (individual tier marker)
- [ ] Create `NextTierPreview` component (aspiration card)
- [ ] Add XP gain animations
- [ ] Unit tests for progression components

**Deliverables:**
- `frontend/src/components/velocity/TierJourneyProgress.tsx`
- `frontend/src/components/velocity/TierMilestone.tsx`
- `frontend/src/components/velocity/NextTierPreview.tsx`
- Test files

**Constitution Compliance:**
- UX: Clear visual hierarchy, progress perception
- Performance: Animation at 60fps
- Accessibility: Progress announced to screen readers

### Phase 4: Mission & Activity Features
**Dependencies:** Phase 1

**Tasks:**
- [ ] Create `MissionAvailabilityCard` component
- [ ] Create `MissionTierRow` component
- [ ] Create `useXPActivity` hook
- [ ] Create `XPActivityFeed` component
- [ ] Create `XPActivityItem` component
- [ ] Implement activity filtering
- [ ] Unit tests for all components

**Deliverables:**
- `frontend/src/components/velocity/MissionAvailabilityCard.tsx`
- `frontend/src/components/velocity/MissionTierRow.tsx`
- `frontend/src/components/velocity/XPActivityFeed.tsx`
- `frontend/src/components/velocity/XPActivityItem.tsx`
- `frontend/src/hooks/useXPActivity.ts`

**Constitution Compliance:**
- Testing: Activity filtering logic tests
- Performance: Virtualized list for long activity feeds
- Types: Full type coverage for activity events

### Phase 5: Level-Up Celebration
**Dependencies:** Phase 2

**Tasks:**
- [ ] Create `LevelUpCelebration` modal component
- [ ] Integrate ParticleEffect for confetti
- [ ] Add tier transition animations
- [ ] Implement acknowledgement flow
- [ ] Add SignalR listener for real-time level-ups
- [ ] Unit tests for celebration flow

**Deliverables:**
- `frontend/src/components/velocity/LevelUpCelebration.tsx`
- SignalR integration
- Test files

**Constitution Compliance:**
- UX: Celebratory but dismissible, non-blocking
- Accessibility: Focus trap, keyboard dismissable
- Performance: Lazy-loaded modal

### Phase 6: Page Integration
**Dependencies:** Phases 2-5

**Tasks:**
- [ ] Create `XSpeedDashboardPage` component
- [ ] Implement responsive grid layout
- [ ] Add route configuration
- [ ] Add navigation link to dashboard
- [ ] Integration tests for full page
- [ ] Performance testing

**Deliverables:**
- `frontend/src/pages/XSpeedDashboardPage.tsx`
- Route configuration update
- Integration test files

**Constitution Compliance:**
- Testing: E2E user journey tests
- Performance: < 2s load time
- UX: Mobile-first responsive design

### Phase 7: Backend Velocity API
**Dependencies:** None (can parallel with Phase 1-3)

**Tasks:**
- [ ] Create `VelocityController` with endpoints
- [ ] Create `GetVelocityProgressQueryHandler`
- [ ] Create `GetVelocityTiersQueryHandler`
- [ ] Create `GetVelocityMissionsQueryHandler`
- [ ] Create `GetXPActivityQueryHandler`
- [ ] Add caching layer
- [ ] Unit tests for handlers

**Deliverables:**
- `backend/src/Smartico.Missions.Api/Controllers/VelocityController.cs`
- CQRS handlers in Application layer
- Test files with 90%+ coverage

**Constitution Compliance:**
- Code Quality: SOLID principles, DI
- Testing: AAA pattern, mocked dependencies
- Performance: 30s cache TTL, < 200ms response

## Testing Strategy

### Unit Testing
- **Coverage Target:** 90% for business logic, 80% for components
- **Pattern:** AAA (Arrange-Act-Assert) with single assertion per test
- **Naming:** `should_ExpectedBehavior_When_StateUnderTest`
- **Tools:** Vitest + React Testing Library (Frontend), xUnit (Backend)
- **Mocking:** Dependency injection for services

### Integration Testing
- **Scope:** API endpoints, dashboard data flow
- **Tools:** MSW for API mocking, Supertest for backend
- **Coverage:** All API endpoints, critical user flows

### End-to-End Testing
- **Scope:** Critical user journeys
- **Tools:** Playwright
- **Scenarios:**
  - New player views dashboard
  - Player tracks progress
  - Level-up celebration flow
  - Mission availability updates

### Performance Testing
- **API Load Testing:** k6, target 100 RPS
- **Frontend Performance:** Lighthouse CI, LCP < 2.5s
- **Bundle Analysis:** < 50KB for Velocity components

## Performance Requirements

### Backend
- GET endpoints: < 200ms (p95)
- Cached responses: < 50ms (p95)
- Database queries: All indexed

### Frontend
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Animation: 60fps, no frame drops
- Bundle impact: < 50KB gzipped for Velocity feature

### Monitoring
- Key metrics: Dashboard load time, tier advancement events, API errors
- Alerting: > 5% error rate, > 500ms p95 latency

## UX/UI Specifications

### Design System Compliance
- Components used: AnimatedCard, ProgressRing, SkeletonLoader, ParticleEffect
- Custom components: VelocityTierCard, TierMilestone, XPActivityFeed
- Tokens: Royal Purple theme, glassmorphism styles

### Tier Color Mapping
| Tier | Name | Rarity | Border | Background |
|------|------|--------|--------|------------|
| 1 | Ignition | Common | gray-500/30 | gray-500 |
| 2 | Cruiser | Rare | blue-500/30 | blue-500 |
| 3 | Turbo | Epic | purple-500/30 | purple-500 |
| 4 | Supersonic | Legendary | yellow-500/30 | yellow-500 |

### Accessibility Requirements
- WCAG Level: AA
- Keyboard navigation: Full tab navigation through all cards
- Screen reader: Tier status, progress, and benefits announced
- Color contrast: Verified with tools (4.5:1 minimum)
- Motion: Respects `prefers-reduced-motion`

### Responsive Breakpoints
- Mobile: 320px - 767px (single column, stacked cards)
- Tablet: 768px - 1023px (2 column grid)
- Desktop: 1024px+ (3 column grid with hero spanning 2)

## Security Considerations

- [x] Input validation on userId parameter
- [x] Output encoding for user-generated content
- [x] Authentication required (existing auth middleware)
- [x] Authorization checks (user can only access own data)
- [x] Rate limiting on API endpoints
- [ ] Security audit before production

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SignalR connection issues | Medium | Medium | Polling fallback, graceful degradation |
| Performance on mobile | Medium | Low | Reduce animations, lazy loading |
| Tier config mismatch | Low | Medium | Single source of truth in backend |
| Animation jank | Medium | Low | Test on low-end devices, motion prefs |

## Dependencies

### External Dependencies
- Framer Motion: Already in project
- React 18: Already in project
- TailwindCSS: Already in project

### Internal Dependencies
- Level API: Existing, operational
- Dashboard Layout: Existing, stable
- Design System: Existing, stable
- SignalR Infrastructure: Existing, needs integration

## Success Criteria

The implementation is considered successful when:

1. All phases completed and tests passing (90%+ coverage)
2. Dashboard loads in < 2 seconds
3. All four tier states render correctly
4. Level-up celebration triggers on tier advancement
5. Accessibility audit passes (WCAG AA)
6. Mobile responsive design verified
7. No critical issues in first week post-launch

## Approval

- [ ] Technical Lead: [Name] - [Date]
- [ ] Product Owner: [Name] - [Date]
- [ ] UX Designer: [Name] - [Date]

---

**Last Updated:** 2025-12-02
**Next Steps:** Proceed to `/speckit.tasks` for task breakdown
