# API Integration Guide

Complete guide for integrating the dashboard with the Smartico backend API.

## Table of Contents

- [Overview](#overview)
- [Current State](#current-state)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Implementation Steps](#implementation-steps)
- [SignalR Real-time Updates](#signalr-real-time-updates)
- [Error Handling](#error-handling)
- [Testing Strategy](#testing-strategy)

## Overview

This guide outlines the integration of the frontend dashboard with the Smartico backend API. The dashboard currently uses mock data and needs to be connected to real API endpoints with SignalR for real-time updates.

### Goals

1. **Replace mock data** with real API calls
2. **Implement SignalR** for real-time updates
3. **Add error handling** with user-friendly messages
4. **Implement retry logic** for network failures
5. **Add caching strategy** to reduce API calls
6. **Maintain loading states** for better UX

### Prerequisites

- Backend API running on `http://localhost:5000`
- SignalR hub available at `/hubs/progress`
- User ID for authentication (temporary until JWT)

## Current State

### Services Created ✅

1. **`apiClient.ts`** - HTTP client with retry logic
   - Exponential backoff (1s, 2s, 4s, 8s, 10s max)
   - Automatic retry on 5xx errors
   - Request timeout (30s default)
   - Error wrapping with ApiError class

2. **`signalrService.ts`** - SignalR connection management
   - Automatic reconnection
   - Event subscription system
   - Connection state tracking
   - Type-safe event handlers

3. **Environment Configuration**
   - `.env.example` - Template for configuration
   - `.env.local` - Local development settings
   - Feature flags for mock/real data toggle

### Mock Data Structure

Current `useDashboardData` hook returns:
```typescript
interface DashboardData {
  missions: Mission[];
  achievements: Achievement[];
  level: LevelProgress;
  leaderboard: LeaderboardEntry[];
  bonuses: Bonus[];
  goals: PersonalGoal[];
  streak: StreakData;
  calendar: RewardCalendar;
  vipStatus: VIPStatus;
  jackpot: JackpotData;
  tournament: TournamentData;
  miniGames: MiniGame[];
  activityFeed: ActivityEntry[];
}
```

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                 Dashboard Component                  │
│              (14 Widget Components)                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ useDashboardData()
                  │
┌─────────────────▼───────────────────────────────────┐
│            Data Aggregation Layer                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  Parallel API Calls (Promise.allSettled)   │   │
│  │  - getMissions()                             │   │
│  │  - getAchievements()                         │   │
│  │  - getLevel()                                │   │
│  │  - ... (11 more endpoints)                   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼────────┐  ┌───────▼──────────┐
│   API Client   │  │  SignalR Service │
│  (HTTP/REST)   │  │  (WebSockets)    │
└───────┬────────┘  └───────┬──────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  Backend API      │
        │  (ASP.NET Core)   │
        └───────────────────┘
```

### Caching Strategy

```
Request → Check Memory Cache → Hit? Return Data
                ↓
                Miss
                ↓
       Check API (with retry)
                ↓
        Update Memory Cache
                ↓
           Return Data
```

**Cache TTL**: 30 seconds (configurable via `VITE_CACHE_TTL`)

## API Endpoints

### Available Endpoints (from Backend)

#### Missions API
- `GET /api/missions?userId={userId}` - Get all missions
- `GET /api/missions/{id}?userId={userId}` - Get mission by ID
- `POST /api/missions/{id}/opt-in?userId={userId}` - Opt into mission
- `POST /api/missions/{id}/claim?userId={userId}` - Claim mission reward

**Response:**
```typescript
interface Mission {
  id: number;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progress: number; // 0-100
  rewardPoints: number;
  deadline: string; // ISO 8601
  isCompleted: boolean;
  isClaimed: boolean;
}
```

#### Badges/Achievements API
- `GET /api/badges?userId={userId}` - Get all achievements
- `GET /api/badges/{id}?userId={userId}` - Get achievement by ID

**Response:**
```typescript
interface Achievement {
  id: number;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt: string; // ISO 8601
  iconUrl: string;
}
```

#### Levels API
- `GET /api/levels/progress?userId={userId}` - Get level progress
- `GET /api/levels?userId={userId}` - Get all levels

**Response:**
```typescript
interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  xpProgress: number; // 0-100
  benefits: string[];
}
```

#### Bonuses API
- `GET /api/bonuses?userId={userId}` - Get active bonuses
- `POST /api/bonuses/{bonusId}/claim?userId={userId}` - Claim bonus

**Response:**
```typescript
interface Bonus {
  id: number;
  name: string;
  value: number;
  progress: number; // 0-100
  expiresAt: string; // ISO 8601
  claimed: boolean;
}
```

#### Jackpots API
- `GET /api/jackpots?userId={userId}` - Get jackpot info
- `GET /api/jackpots/winners?userId={userId}` - Get recent winners
- `POST /api/jackpots/{templateId}/opt-in?userId={userId}` - Opt in
- `POST /api/jackpots/{templateId}/opt-out?userId={userId}` - Opt out

**Response:**
```typescript
interface JackpotData {
  amount: number;
  userTickets: number;
  lastWinners: Array<{
    username: string;
    amount: number;
    timestamp: string;
  }>;
}
```

#### Tournaments API
- `GET /api/tournaments?userId={userId}` - Get active tournament
- `POST /api/tournaments/{tournamentInstanceId}/register?userId={userId}` - Register
- `GET /api/tournaments/{tournamentInstanceId}/leaderboard?userId={userId}` - Get leaderboard

**Response:**
```typescript
interface TournamentData {
  id: number;
  name: string;
  endsAt: string;
  userRank: number;
  userPoints: number;
  totalParticipants: number;
}
```

#### Mini Games API
- `GET /api/minigames?userId={userId}` - Get available games
- `POST /api/minigames/{gameId}/play?userId={userId}` - Play game

**Response:**
```typescript
interface MiniGame {
  id: number;
  name: string;
  type: string;
  isAvailable: boolean;
  nextSpinTime: string | null;
  jackpotAmount: number | null;
}
```

## Implementation Steps

### Step 1: Create API Service Layer

Create individual service files for each domain:

**`frontend/src/services/missionsService.ts`**
```typescript
import { apiClient } from './apiClient';
import type { Mission } from '../types/dashboard/widgets';

export const missionsService = {
  async getMissions(): Promise<Mission[]> {
    return apiClient.get<Mission[]>('/missions');
  },

  async getMissionById(id: number): Promise<Mission> {
    return apiClient.get<Mission>(`/missions/${id}`);
  },

  async optIn(id: number): Promise<void> {
    return apiClient.post<void>(`/missions/${id}/opt-in`);
  },

  async claim(id: number): Promise<void> {
    return apiClient.post<void>(`/missions/${id}/claim`);
  },
};
```

**Repeat for:**
- `achievementsService.ts`
- `levelsService.ts`
- `bonusesService.ts`
- `jackpotsService.ts`
- `tournamentsService.ts`
- `miniGamesService.ts`
- `leaderboardService.ts`
- `vipService.ts`
- `streakService.ts`
- `calendarService.ts`
- `activityService.ts`

### Step 2: Update useDashboardData Hook

Replace mock data with API calls:

```typescript
import { useState, useEffect } from 'react';
import { missionsService } from '../services/missionsService';
import { achievementsService } from '../services/achievementsService';
// ... import all services
import { signalrService } from '../services/signalrService';
import type { DashboardData } from '../types/dashboard/data';

const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Use mock data if flag is set
    if (ENABLE_MOCK) {
      setData(MOCK_DASHBOARD_DATA);
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const results = await Promise.allSettled([
          missionsService.getMissions(),
          achievementsService.getAchievements(),
          levelsService.getProgress(),
          bonusesService.getBonuses(),
          jackpotsService.getJackpot(),
          tournamentsService.getActiveTournament(),
          miniGamesService.getMiniGames(),
          // ... other services
        ]);

        if (!isMounted) return;

        // Extract data from results (handle rejections)
        const [
          missionsResult,
          achievementsResult,
          levelResult,
          // ... other results
        ] = results;

        const dashboardData: DashboardData = {
          missions: missionsResult.status === 'fulfilled' ? missionsResult.value : [],
          achievements: achievementsResult.status === 'fulfilled' ? achievementsResult.value : [],
          level: levelResult.status === 'fulfilled' ? levelResult.value : null,
          // ... other data
        };

        setData(dashboardData);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
```

### Step 3: Integrate SignalR

Add SignalR connection in `DashboardProvider`:

```typescript
import { useEffect } from 'react';
import { signalrService } from '../services/signalrService';

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const userId = import.meta.env.VITE_USER_ID || 'demo-user';
    const enableSignalR = import.meta.env.VITE_ENABLE_SIGNALR === 'true';

    if (!enableSignalR) return;

    // Connect to SignalR
    signalrService.connect(userId).catch((error) => {
      console.error('Failed to connect to SignalR:', error);
    });

    return () => {
      signalrService.disconnect();
    };
  }, []);

  return <>{children}</>;
}
```

### Step 4: Add Real-time Updates

In each widget, subscribe to SignalR events:

```typescript
// Example: DailyChallengeWidget
export function DailyChallengeWidget() {
  const { data, isLoading } = useDashboardData();
  const [challenge, setChallenge] = useState(data?.missions?.[0]);

  useEffect(() => {
    // Subscribe to mission progress updates
    const handleMissionProgress = (event: { missionId: number; progress: number }) => {
      if (event.missionId === challenge?.id) {
        setChallenge((prev) => ({
          ...prev!,
          progress: event.progress,
        }));
      }
    };

    signalrService.on('mission-progress', handleMissionProgress);

    return () => {
      signalrService.off('mission-progress', handleMissionProgress);
    };
  }, [challenge?.id]);

  // ... rest of component
}
```

### Step 5: Implement Caching

Add simple in-memory cache:

```typescript
// frontend/src/utils/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new MemoryCache();
```

Update services to use cache:

```typescript
import { cache } from '../utils/cache';

const CACHE_TTL = Number(import.meta.env.VITE_CACHE_TTL) || 30000;

export const missionsService = {
  async getMissions(): Promise<Mission[]> {
    const cacheKey = 'missions';
    const cached = cache.get<Mission[]>(cacheKey);
    if (cached) return cached;

    const missions = await apiClient.get<Mission[]>('/missions');
    cache.set(cacheKey, missions, CACHE_TTL);
    return missions;
  },
};
```

## SignalR Real-time Updates

### Event Types

| Event | Payload | Widgets Affected |
|-------|---------|------------------|
| `mission-progress` | `{ missionId, progress, currentValue }` | Daily Challenge, Active Missions |
| `mission-complete` | `{ missionId, reward }` | Daily Challenge, Active Missions |
| `achievement-unlocked` | `{ achievementId, name, points, rarity }` | Recent Achievements |
| `level-up` | `{ newLevel, xpEarned }` | Level Progress |
| `xp-gained` | `{ amount, currentXP, nextLevelXP }` | Level Progress |
| `bonus-available` | `{ bonusId, name, value }` | Bonus Tracker |
| `bonus-claimed` | `{ bonusId, reward }` | Bonus Tracker |
| `leaderboard-update` | `{ userId, rank, points }` | Leaderboard |
| `tournament-rank-update` | `{ tournamentId, rank, points }` | Tournament |
| `jackpot-update` | `{ templateId, amount }` | Jackpot |
| `jackpot-winner` | `{ username, amount }` | Jackpot |
| `mini-game-result` | `{ gameId, prizeId, prizeValue }` | Mini Games |

### Usage Example

```typescript
import { signalrService } from '../services/signalrService';

// Subscribe to event
signalrService.on('mission-progress', (data) => {
  console.log('Mission progress updated:', data);
  // Update UI
});

// Unsubscribe
signalrService.off('mission-progress', handler);

// Connection state
signalrService.onStateChange((state) => {
  console.log('SignalR state:', state);
  // Show connection indicator in UI
});
```

## Error Handling

### Error Boundary Component

```typescript
// frontend/src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage

```typescript
<ErrorBoundary>
  <DashboardApp />
</ErrorBoundary>
```

### API Error Handling

Errors are automatically wrapped in `ApiError` class:

```typescript
try {
  const missions = await missionsService.getMissions();
} catch (error) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.message, error.statusCode);
    // Show user-friendly message based on status code
    if (error.statusCode === 404) {
      // Not found
    } else if (error.statusCode === 401) {
      // Unauthorized - redirect to login
    } else if (error.statusCode && error.statusCode >= 500) {
      // Server error - retry or show error
    }
  }
}
```

## Testing Strategy

### Unit Tests

Test individual services:

```typescript
describe('missionsService', () => {
  it('should fetch missions', async () => {
    const missions = await missionsService.getMissions();
    expect(missions).toBeInstanceOf(Array);
  });

  it('should handle API errors', async () => {
    // Mock API error
    await expect(missionsService.getMissionById(999)).rejects.toThrow(ApiError);
  });
});
```

### Integration Tests

Test data flow:

```typescript
describe('useDashboardData', () => {
  it('should fetch all data on mount', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle API failures gracefully', async () => {
    // Mock API failure
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### E2E Tests

Test real-time updates:

```typescript
test('should update mission progress via SignalR', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for initial load
  await page.waitForSelector('[data-widget-id="daily-challenge"]');

  // Trigger backend event (via API or direct SignalR)
  // ...

  // Verify UI updated
  await expect(page.locator('.progress-bar')).toHaveAttribute('aria-valuenow', '75');
});
```

## Implementation Checklist

### Phase D.1: Foundation ✅
- [x] Create API client with retry logic
- [x] Create SignalR service
- [x] Add environment configuration
- [x] Document integration plan

### Phase D.2: Service Layer (Next)
- [ ] Create `missionsService.ts`
- [ ] Create `achievementsService.ts`
- [ ] Create `levelsService.ts`
- [ ] Create `bonusesService.ts`
- [ ] Create `jackpotsService.ts`
- [ ] Create `tournamentsService.ts`
- [ ] Create `miniGamesService.ts`
- [ ] Create `leaderboardService.ts`
- [ ] Create `vipService.ts`
- [ ] Create `streakService.ts`
- [ ] Create `calendarService.ts`
- [ ] Create `activityService.ts`

### Phase D.3: Data Aggregation
- [ ] Update `useDashboardData` hook
- [ ] Implement parallel data fetching
- [ ] Add error handling per service
- [ ] Implement caching layer

### Phase D.4: Real-time Updates
- [ ] Integrate SignalR in `DashboardProvider`
- [ ] Add event handlers in each widget
- [ ] Test connection stability
- [ ] Handle reconnection scenarios

### Phase D.5: Error Handling
- [ ] Create `ErrorBoundary` component
- [ ] Add error states to widgets
- [ ] Implement retry UI
- [ ] Add loading states

### Phase D.6: Testing
- [ ] Unit tests for services
- [ ] Integration tests for hooks
- [ ] E2E tests for critical flows
- [ ] Load testing for API calls

## Next Steps

1. **Complete Service Layer** - Create all 12 service files
2. **Update Data Hook** - Replace mock data with API calls
3. **Test Integration** - Verify all widgets work with real data
4. **Add Error UI** - Implement user-friendly error messages
5. **Enable Real-time** - Connect SignalR and test events
6. **Performance Audit** - Optimize API calls and caching

## Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/progress
VITE_USER_ID=demo-user
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_SIGNALR=false
```

### Production
```env
VITE_API_BASE_URL=https://api.smartico.com/api
VITE_SIGNALR_HUB_URL=https://api.smartico.com/hubs/progress
VITE_USER_ID= # From JWT
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_SIGNALR=true
```

---

**Phase D Foundation Complete!** 🚀

The infrastructure is in place. Next session: implement the service layer and update widgets.
