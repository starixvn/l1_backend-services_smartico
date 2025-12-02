# xSpeed Level Dashboard - Quick Start Guide

**Created:** 2025-12-02
**Version:** 1.0.0

## Overview

This guide provides a quick reference for implementing the xSpeed Level Dashboard feature.

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    xSpeed Level Dashboard                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages                                                           │
│  └── XSpeedDashboardPage.tsx                                    │
│                                                                  │
│  Widgets/Components                                              │
│  ├── VelocityTierCard.tsx (hero status card)                   │
│  ├── TierJourneyProgress.tsx (horizontal timeline)             │
│  ├── NextTierPreview.tsx (goal/aspiration card)                │
│  ├── MissionAvailabilityCard.tsx (tier-gated missions)         │
│  ├── XPActivityFeed.tsx (recent XP events)                     │
│  └── LevelUpCelebration.tsx (modal overlay)                    │
│                                                                  │
│  Hooks                                                           │
│  ├── useVelocityProgress.ts                                    │
│  ├── useVelocityTiers.ts                                       │
│  └── useXPActivity.ts                                          │
│                                                                  │
│  Services                                                        │
│  └── velocityService.ts                                        │
│                                                                  │
│  Types                                                           │
│  └── velocity.ts                                                │
├─────────────────────────────────────────────────────────────────┤
│                       Backend API                                │
│  GET /api/velocity/progress                                     │
│  GET /api/velocity/tiers                                        │
│  GET /api/velocity/missions                                     │
│  GET /api/velocity/xp-activity                                  │
│  GET /api/velocity/level-up-events                             │
│  POST /api/velocity/level-up-events/{id}/acknowledge           │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
frontend/src/
├── pages/
│   └── XSpeedDashboardPage.tsx
├── components/
│   └── velocity/
│       ├── VelocityTierCard.tsx
│       ├── TierJourneyProgress.tsx
│       ├── TierMilestone.tsx
│       ├── NextTierPreview.tsx
│       ├── MissionAvailabilityCard.tsx
│       ├── MissionTierRow.tsx
│       ├── XPActivityFeed.tsx
│       ├── XPActivityItem.tsx
│       └── LevelUpCelebration.tsx
├── hooks/
│   ├── useVelocityProgress.ts
│   ├── useVelocityTiers.ts
│   └── useXPActivity.ts
├── services/
│   └── velocityService.ts
└── types/
    └── velocity.ts

backend/src/Smartico.Missions.Api/
└── Controllers/
    └── VelocityController.cs

backend/src/Smartico.Missions.Application/
└── Features/
    └── Velocity/
        ├── Queries/
        │   ├── GetVelocityProgress/
        │   ├── GetVelocityTiers/
        │   ├── GetVelocityMissions/
        │   └── GetXPActivity/
        └── Commands/
            └── AcknowledgeLevelUp/
```

## Key Implementation Patterns

### 1. Custom Hook Pattern

```typescript
// hooks/useVelocityProgress.ts
export function useVelocityProgress(userId: string) {
  const [data, setData] = useState<PlayerVelocityProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        setIsLoading(true);
        const response = await VelocityService.getProgress(userId);
        setData(response.progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProgress();
  }, [userId]);

  return { data, isLoading, error };
}
```

### 2. Service Layer Pattern

```typescript
// services/velocityService.ts
export class VelocityService {
  static async getProgress(userId: string): Promise<VelocityProgressResponse> {
    return apiClient.get<VelocityProgressResponse>('/velocity/progress', { userId });
  }

  static async getTiers(): Promise<VelocityTiersResponse> {
    return apiClient.get<VelocityTiersResponse>('/velocity/tiers');
  }

  static async getMissions(userId: string): Promise<VelocityMissionsResponse> {
    return apiClient.get<VelocityMissionsResponse>('/velocity/missions', { userId });
  }
}
```

### 3. Component Composition Pattern

```tsx
// pages/XSpeedDashboardPage.tsx
export function XSpeedDashboardPage() {
  const { userId } = useAuth();
  const { data: progress, isLoading } = useVelocityProgress(userId);
  const { data: tiers } = useVelocityTiers();

  if (isLoading) return <SkeletonLoader />;

  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Velocity Program">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Card - Full Width */}
          <div className="lg:col-span-2">
            <VelocityTierCard progress={progress} tiers={tiers} />
          </div>

          {/* Next Tier Preview */}
          <NextTierPreview progress={progress} tiers={tiers} />

          {/* Tier Journey - Full Width */}
          <div className="lg:col-span-3">
            <TierJourneyProgress progress={progress} tiers={tiers} />
          </div>

          {/* Mission Availability */}
          <div className="lg:col-span-2">
            <MissionAvailabilityCard userId={userId} currentTier={progress?.currentTier} />
          </div>

          {/* XP Activity Feed */}
          <XPActivityFeed userId={userId} />
        </div>

        {/* Level Up Celebration Modal */}
        <LevelUpCelebration userId={userId} />
      </DashboardLayout>
    </DashboardProvider>
  );
}
```

### 4. Tier Rarity Color Mapping

```typescript
// utils/tierColors.ts
export const TIER_COLORS = {
  1: { name: 'Ignition', rarity: 'common', border: 'border-gray-500/30', bg: 'bg-gray-500' },
  2: { name: 'Cruiser', rarity: 'rare', border: 'border-blue-500/30', bg: 'bg-blue-500' },
  3: { name: 'Turbo', rarity: 'epic', border: 'border-purple-500/30', bg: 'bg-purple-500' },
  4: { name: 'Supersonic', rarity: 'legendary', border: 'border-yellow-500/30', bg: 'bg-yellow-500' },
} as const;
```

## Velocity Tier Configuration

| Tier | Name | XP Required | Missions | Key Benefit |
|------|------|-------------|----------|-------------|
| 1 | Ignition | 0 | Daily Driver | Basic mission access |
| 2 | Cruiser | 500 | + Explorer | Daily Drop Jackpot |
| 3 | Turbo | 5,000 | + Table Tactician | 1.2x reward multiplier |
| 4 | Supersonic | 25,000 | + Whale Challenge | VIP tournament access |

## Testing Checklist

- [ ] VelocityTierCard renders correct tier for each level (1-4)
- [ ] XP progress bar animates smoothly
- [ ] Level-up celebration triggers on tier change
- [ ] Mission availability updates when tier changes
- [ ] XP activity feed loads and filters correctly
- [ ] Max tier (Supersonic) shows "Max Level" state
- [ ] Responsive layout works on mobile
- [ ] Keyboard navigation functional
- [ ] Screen reader announces tier changes

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/velocity/progress` | GET | Player's current tier & XP |
| `/api/velocity/tiers` | GET | Static tier definitions |
| `/api/velocity/missions` | GET | Tier-gated mission availability |
| `/api/velocity/xp-activity` | GET | Recent XP earning events |
| `/api/velocity/level-up-events` | GET | Unacknowledged level-ups |
| `/api/velocity/level-up-events/{id}/acknowledge` | POST | Mark level-up seen |

## Design System Components Used

- `AnimatedCard` - Base card with glassmorphism and rarity styling
- `ProgressRing` - Circular XP progress indicator
- `SkeletonLoader` - Loading placeholder
- `ParticleEffect` - Celebration confetti
- `DashboardLayout` - Page wrapper with sidebar/header

---

**Quick Start Status:** Complete
**Ready for:** Implementation
