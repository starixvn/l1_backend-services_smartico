# Missions & Badges - Architecture Design

**Version:** 1.0.0  
**Created:** 2024-10-29  
**Status:** Draft  
**Owner:** System Architect

## Constitution Compliance

This architecture design adheres to all constitutional principles:

- ✅ **Code Quality:** SOLID principles, dependency injection, clean separation of concerns
- ✅ **Testing:** Testable architecture with clear boundaries, supports AAA pattern
- ✅ **UX Consistency:** Mobile-first responsive design, consistent patterns
- ✅ **Performance:** Caching strategy, lazy loading, optimized bundle sizes
- ✅ **Type Safety:** Full TypeScript interfaces from @smartico/public-api

## Architecture Overview

### System Context

```
┌──────────────────────────────────────────────────────────────┐
│                     Smartico Platform                         │
│                                                               │
│  ┌────────────────┐          ┌──────────────────────┐       │
│  │   Frontend     │◄────────►│  @smartico/public-api│       │
│  │ (React/Redux)  │          │      Package          │       │
│  │                │          │                       │       │
│  │ - Missions UI  │          │ - TypeScript Types    │       │
│  │ - Badges UI    │          │ - HTTP Client         │       │
│  │ - Components   │          │ - WebSocket Client    │       │
│  └────────────────┘          └──────────────────────┘       │
│         │                              │                      │
│         │                              ▼                      │
│         │                    ┌──────────────────┐            │
│         │                    │  Smartico API    │            │
│         └───────────────────►│    Backend       │            │
│                               │                  │            │
│                               │ - Mission Data   │            │
│                               │ - Progress Track │            │
│                               │ - Rewards        │            │
│                               └──────────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

### Design Decisions (From Clarifications)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Data Model** | Use @smartico/public-api interfaces | Consistency, type safety, no duplication |
| **Real-time Updates** | WebSocket + Polling fallback | Reliability with graceful degradation |
| **Progress Updates** | Server confirmation | Data accuracy, no rollback scenarios |
| **Mission Organization** | Tabbed interface | Clear separation, focused view |
| **Badge Display** | Grid gallery | Visual impact, collection feel |
| **Error Handling** | Smart fallback + caching | Best UX, always show something useful |
| **Design Approach** | Mobile-first | 60%+ mobile users, progressive enhancement |

## High-Level Architecture

### Layer Architecture (Clean Architecture Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Pages      │  │ Components │  │ Containers │           │
│  │            │  │            │  │            │           │
│  │ - Missions │  │ - Mission  │  │ - Mission  │           │
│  │   Page     │  │   Card     │  │   List     │           │
│  │ - Badges   │  │ - Badge    │  │   Container│           │
│  │   Page     │  │   Grid     │  │ - Badge    │           │
│  │            │  │ - Tabs     │  │   Container│           │
│  └────────────┘  └────────────┘  └────────────┘           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Application Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Redux Store│  │ Middleware │  │ Selectors  │           │
│  │            │  │            │  │            │           │
│  │ - Missions │  │ - Logger   │  │ - Mission  │           │
│  │   Slice    │  │ - Thunk    │  │   Filters  │           │
│  │ - Badges   │  │ - WS Event │  │ - Badge    │           │
│  │   Slice    │  │   Handler  │  │   Filters  │           │
│  │ - UI Slice │  │            │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Domain Layer                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ Services   │  │ Use Cases  │  │ Types      │           │
│  │            │  │            │  │            │           │
│  │ - Mission  │  │ - Get      │  │ From       │           │
│  │   Service  │  │   Missions │  │ @smartico/ │           │
│  │ - Badge    │  │ - Claim    │  │ public-api │           │
│  │   Service  │  │   Reward   │  │            │           │
│  │ - Cache    │  │ - Opt-in   │  │ - TMission │           │
│  │   Service  │  │   Mission  │  │   OrBadge  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Infrastructure Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ API Client │  │ WebSocket  │  │ Storage    │           │
│  │            │  │ Client     │  │            │           │
│  │ @smartico/ │  │            │  │ - Browser  │           │
│  │ public-api │  │ @smartico/ │  │   Cache    │           │
│  │ HTTP       │  │ public-api │  │ - Local    │           │
│  │ methods    │  │ WSAPI      │  │   Storage  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture (Frontend)

### Component Tree

```
App
└── Router
    ├── MissionsPage
    │   ├── MissionTabs
    │   │   ├── TabHeader (Active, Available, Completed, Expired)
    │   │   └── TabContent
    │   │       ├── MissionFilters
    │   │       │   ├── SearchBar
    │   │       │   ├── CategoryFilter
    │   │       │   └── SortControl
    │   │       └── MissionListContainer
    │   │           ├── LoadingSpinner
    │   │           ├── ErrorBanner
    │   │           ├── EmptyState
    │   │           └── MissionList
    │   │               └── MissionCard[]
    │   │                   ├── MissionImage
    │   │                   ├── MissionInfo
    │   │                   ├── ProgressBar
    │   │                   ├── TaskList
    │   │                   ├── RewardDisplay
    │   │                   └── ActionButtons
    │   │                       ├── OptInButton
    │   │                       └── ClaimButton
    │   └── MissionDetailModal
    │       ├── MissionHeader
    │       ├── TaskProgress
    │       ├── RewardDetails
    │       └── RelatedGames
    │
    └── BadgesPage
        ├── BadgeHeader
        │   ├── BadgeCount
        │   └── FilterControls
        │       ├── AllFilter
        │       ├── RecentFilter
        │       ├── RarityFilter
        │       └── CategoryFilter
        ├── BadgeGridContainer
        │   ├── LoadingSpinner
        │   ├── ErrorBanner
        │   └── BadgeGrid
        │       └── BadgeCard[]
        │           ├── BadgeImage (color/greyscale)
        │           ├── BadgeName
        │           └── EarnedBadge (if earned)
        └── BadgeDetailModal
            ├── BadgeImage
            ├── BadgeInfo
            ├── CompletionCriteria
            ├── ProgressIndicator
            └── EarnDate (if earned)
```

### Component Responsibilities (SRP)

#### Page Components
- **MissionsPage**: Route container, coordinate tabs and filters state
- **BadgesPage**: Route container, coordinate grid and filter state

#### Container Components (Smart - Connected to Redux)
- **MissionListContainer**: Fetch missions, handle loading/error states, dispatch actions
- **BadgeGridContainer**: Fetch badges, handle loading/error states, dispatch actions

#### Presentational Components (Dumb - Pure UI)
- **MissionCard**: Display single mission, emit events to parent
- **BadgeCard**: Display single badge, emit events to parent
- **MissionTabs**: Tab navigation UI
- **MissionFilters**: Filter controls UI
- **ProgressBar**: Visual progress indicator
- **ActionButtons**: Mission action buttons (opt-in, claim)

## Data Flow Architecture

### State Management (Redux)

```typescript
// Root State Shape
interface RootState {
  missions: MissionsState;
  badges: BadgesState;
  ui: UIState;
  connection: ConnectionState;
}

// Missions State
interface MissionsState {
  // Data keyed by status for efficient tab rendering
  active: TMissionOrBadge[];
  available: TMissionOrBadge[];
  completed: TMissionOrBadge[];
  expired: TMissionOrBadge[];
  
  // Single source of truth for all missions (normalized)
  byId: Record<number, TMissionOrBadge>;
  allIds: number[];
  
  // UI State
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Filters
  filters: {
    search: string;
    categories: number[];
    sortBy: 'name' | 'progress' | 'reward' | 'expiry';
    sortOrder: 'asc' | 'desc';
  };
}

// Badges State
interface BadgesState {
  // All badges
  all: TMissionOrBadge[];
  byId: Record<number, TMissionOrBadge>;
  
  // UI State
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Filters
  filters: {
    filter: 'all' | 'recent' | 'rarity' | 'category';
    categoryId: number | null;
  };
}

// Connection State
interface ConnectionState {
  type: 'websocket' | 'polling' | 'disconnected';
  isConnected: boolean;
  lastHeartbeat: number | null;
}
```

### Data Flow Patterns

#### 1. Initial Load Flow

```
User navigates to /missions
        ↓
MissionsPage mounts
        ↓
useEffect dispatches fetchMissions()
        ↓
Redux Thunk calls MissionService.getMissions()
        ↓
MissionService calls @smartico/public-api
        ↓
API returns TMissionOrBadge[]
        ↓
Thunk dispatches fetchMissions.fulfilled(data)
        ↓
Reducer updates state (loading: false, missions: data)
        ↓
Component re-renders with missions
        ↓
WebSocket connects for real-time updates
```

#### 2. Real-time Update Flow

```
User completes activity (e.g., makes deposit)
        ↓
Backend updates mission progress
        ↓
WebSocket emits ReloadAchievementsEvent
        ↓
WSAPI listener receives event
        ↓
Middleware dispatches missionUpdated(payload)
        ↓
Reducer merges update into state
        ↓
Selectors recompute affected missions
        ↓
Connected components re-render
        ↓
User sees updated progress (after 2s max)
```

#### 3. Opt-in Flow

```
User clicks "Opt In" button
        ↓
OptInButton dispatches optInToMission(missionId)
        ↓
Reducer sets loading state for mission
        ↓
Button shows spinner, disables itself
        ↓
Thunk calls MissionService.optIn(missionId)
        ↓
Service calls @smartico/public-api.requestMissionOptIn()
        ↓
API returns TMissionOptInResult
        ↓
If success:
  ├─ Thunk dispatches optIn.fulfilled()
  ├─ Reducer updates mission status
  └─ Button re-enables, shows "Opted In"
If failure:
  ├─ Thunk dispatches optIn.rejected(error)
  ├─ Reducer sets error message
  ├─ Error modal displays with retry button
  └─ Button re-enables
```

#### 4. Error Handling Flow

```
API call fails
        ↓
Service catches error
        ↓
Retry once silently (if read operation)
        ↓
If still fails:
  ├─ For read operations:
  │   ├─ Check cache for stale data
  │   ├─ If cache exists:
  │   │   ├─ Display cached data
  │   │   ├─ Show warning banner
  │   │   └─ Offer "Refresh" button
  │   └─ If no cache:
  │       └─ Show error with retry button
  └─ For write operations (opt-in, claim):
      ├─ Show error immediately
      ├─ Display retry button
      └─ Prevent duplicate submissions
```

## API Integration

### Using @smartico/public-api

All API interactions must use the existing `@smartico/public-api` package:

```typescript
// services/MissionService.ts
import { WSAPI, TMissionOrBadge, TMissionOptInResult } from '@smartico/public-api';

/**
 * Service for mission-related operations.
 * Implements Repository pattern for clean separation.
 */
export class MissionService {
  constructor(private wsApi: WSAPI) {}

  /**
   * Fetches all missions for the current user.
   * Uses WebSocket with fallback to polling.
   */
  async getMissions(): Promise<TMissionOrBadge[]> {
    return this.wsApi.getMissions();
  }

  /**
   * Opts the user into a specific mission.
   */
  async optIn(missionId: number): Promise<TMissionOptInResult> {
    return this.wsApi.requestMissionOptIn(missionId);
  }

  /**
   * Claims reward for a completed mission.
   */
  async claimReward(missionId: number): Promise<TMissionClaimRewardResult> {
    return this.wsApi.requestMissionClaimReward(missionId);
  }

  /**
   * Fetches all badges for the current user.
   */
  async getBadges(): Promise<TMissionOrBadge[]> {
    return this.wsApi.getBadges();
  }
}
```

### WebSocket Integration

```typescript
// infrastructure/WebSocketManager.ts

/**
 * Manages WebSocket connection with automatic fallback to polling.
 * Implements Strategy pattern for connection types.
 */
export class WebSocketManager {
  private connectionStrategy: IConnectionStrategy;
  private wsApi: WSAPI;
  
  constructor(wsApi: WSAPI, dispatch: AppDispatch) {
    this.wsApi = wsApi;
    this.connectionStrategy = new WebSocketStrategy(wsApi, dispatch);
  }

  /**
   * Attempts WebSocket connection, falls back to polling on failure.
   */
  async connect(): Promise<void> {
    try {
      await this.connectionStrategy.connect();
      this.dispatch(connectionEstablished('websocket'));
    } catch (error) {
      console.warn('WebSocket failed, falling back to polling', error);
      this.connectionStrategy = new PollingStrategy(this.wsApi, this.dispatch);
      await this.connectionStrategy.connect();
      this.dispatch(connectionEstablished('polling'));
    }
  }

  /**
   * Subscribe to mission updates.
   */
  subscribeToMissionUpdates(callback: (missions: TMissionOrBadge[]) => void): void {
    this.wsApi.on('missionsUpdate', callback);
  }
}

interface IConnectionStrategy {
  connect(): Promise<void>;
  disconnect(): void;
}

class WebSocketStrategy implements IConnectionStrategy {
  constructor(private wsApi: WSAPI, private dispatch: AppDispatch) {}
  
  async connect(): Promise<void> {
    await this.wsApi.connect();
  }
  
  disconnect(): void {
    this.wsApi.disconnect();
  }
}

class PollingStrategy implements IConnectionStrategy {
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(private wsApi: WSAPI, private dispatch: AppDispatch) {}
  
  async connect(): Promise<void> {
    // Poll every 15 seconds
    this.intervalId = setInterval(async () => {
      try {
        const missions = await this.wsApi.getMissions();
        this.dispatch(missionsPolled(missions));
      } catch (error) {
        console.error('Polling failed', error);
      }
    }, 15000);
  }
  
  disconnect(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

## Caching Strategy

### Cache Layers

```
┌─────────────────────────────────────────────────────┐
│              Browser (Memory)                       │
│  Redux Store - Immediate access, session lifetime   │
│  TTL: Until page refresh                            │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           Browser (LocalStorage)                    │
│  Persistent cache for offline support               │
│  TTL: 24 hours                                      │
│  Key: smartico_missions_{userId}_{timestamp}       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            @smartico/public-api                     │
│  Internal caching (30s TTL per documentation)       │
│  Event-driven invalidation                          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            Smartico Backend                         │
│  Source of truth                                    │
└─────────────────────────────────────────────────────┘
```

### Cache Invalidation Rules

| Event | Action |
|-------|--------|
| User opts into mission | Invalidate missions cache, refetch |
| User claims reward | Invalidate missions cache, refetch |
| WebSocket update received | Update specific mission in cache |
| User switches tabs | Use cached data if < 30s old |
| API error with retry | Serve stale cache with warning |
| User manually refreshes | Bypass cache, force fetch |

## Performance Optimizations

### Code Splitting

```typescript
// routes.tsx
const MissionsPage = lazy(() => import('./pages/MissionsPage'));
const BadgesPage = lazy(() => import('./pages/BadgesPage'));

const routes = [
  {
    path: '/missions',
    element: (
      <Suspense fallback={<PageLoader />}>
        <MissionsPage />
      </Suspense>
    ),
  },
  // Bundle size per route: < 250KB gzipped
];
```

### Image Optimization

```typescript
// components/MissionImage.tsx
export const MissionImage: React.FC<Props> = ({ src, alt }) => {
  return (
    <picture>
      <source srcSet={`${src}.avif`} type="image/avif" />
      <source srcSet={`${src}.webp`} type="image/webp" />
      <img
        src={`${src}.jpg`}
        alt={alt}
        loading="lazy"
        width={320}
        height={180}
        decoding="async"
      />
    </picture>
  );
};
```

### List Virtualization

```typescript
// containers/MissionListContainer.tsx
import { FixedSizeList } from 'react-window';

export const MissionListContainer: React.FC = () => {
  const missions = useSelector(selectFilteredMissions);
  
  // Only render visible items + buffer
  return (
    <FixedSizeList
      height={800}
      itemCount={missions.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <MissionCard mission={missions[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

### Memoization Strategy

```typescript
// selectors/missionSelectors.ts
import { createSelector } from '@reduxjs/toolkit';

// Base selectors (no computation)
const selectMissionsState = (state: RootState) => state.missions;
const selectFilters = (state: RootState) => state.missions.filters;

// Memoized computed selector
export const selectFilteredMissions = createSelector(
  [selectMissionsState, selectFilters],
  (missions, filters) => {
    let filtered = Object.values(missions.byId);
    
    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(m =>
        filters.categories.includes(m.categoryId)
      );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      // Sort logic
    });
    
    return filtered;
  }
);
// Only recomputes when missions or filters change
```

## Mobile-First Responsive Design

### Breakpoints

```typescript
// theme/breakpoints.ts
export const breakpoints = {
  mobile: 320,      // Mobile first baseline
  mobileLarge: 480, // Large phones
  tablet: 768,      // Tablets
  desktop: 1024,    // Desktop
  desktopLarge: 1440, // Large desktop
};

// Usage in styled-components
export const MissionCard = styled.div`
  /* Mobile first (320px+) */
  padding: 1rem;
  display: flex;
  flex-direction: column;
  
  /* Tablet (768px+) */
  @media (min-width: ${breakpoints.tablet}px) {
    flex-direction: row;
    padding: 1.5rem;
  }
  
  /* Desktop (1024px+) */
  @media (min-width: ${breakpoints.desktop}px) {
    padding: 2rem;
    max-width: 1200px;
  }
`;
```

### Touch Optimization

```typescript
// All interactive elements minimum 44x44px
export const ActionButton = styled.button`
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
  
  /* Touch feedback */
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
  
  /* Larger touch targets on mobile */
  @media (max-width: ${breakpoints.tablet}px) {
    padding: 16px 32px;
    font-size: 1rem;
  }
`;
```

### Grid Responsive Layout

```typescript
// Badge grid adapts from 2 to 6 columns
export const BadgeGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  /* Mobile: 2 columns */
  grid-template-columns: repeat(2, 1fr);
  
  /* Tablet: 4 columns */
  @media (min-width: ${breakpoints.tablet}px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
  
  /* Desktop: 6 columns */
  @media (min-width: ${breakpoints.desktop}px) {
    grid-template-columns: repeat(6, 1fr);
    gap: 2rem;
  }
`;
```

## Security Considerations

### Authentication

All API calls include authentication headers automatically via `@smartico/public-api`:

```typescript
// The API package handles authentication automatically
const wsApi = new WSAPI({
  apiKey: process.env.REACT_APP_SMARTICO_API_KEY,
  brandKey: process.env.REACT_APP_BRAND_KEY,
  extUserId: getCurrentUserId(), // From auth context
});

// No need to manually add auth headers
```

### Authorization

- Users can only access their own missions/badges (enforced by backend)
- Mission opt-in and claim actions are rate-limited by backend
- No sensitive data exposed in client-side code

### Input Validation

```typescript
// Validate mission IDs before API calls
function isValidMissionId(id: unknown): id is number {
  return typeof id === 'number' && id > 0 && Number.isFinite(id);
}

export async function optIn(missionId: number): Promise<TMissionOptInResult> {
  if (!isValidMissionId(missionId)) {
    throw new ValidationError('Invalid mission ID');
  }
  return this.wsApi.requestMissionOptIn(missionId);
}
```

### XSS Prevention

```typescript
// React escapes strings by default, but for user-generated content:
import DOMPurify from 'isomorphic-dompurify';

export const MissionDescription: React.FC<Props> = ({ html }) => {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
```

## Testing Strategy

### Unit Tests (AAA Pattern, Single Assert)

```typescript
// services/MissionService.test.ts
describe('MissionService', () => {
  describe('getMissions', () => {
    it('should_return_missions_array_when_api_call_succeeds', async () => {
      // Arrange
      const mockWsApi = createMockWsApi();
      const expectedMissions = [createMockMission({ id: 1 })];
      mockWsApi.getMissions.mockResolvedValue(expectedMissions);
      const service = new MissionService(mockWsApi);

      // Act
      const result = await service.getMissions();

      // Assert
      expect(result).toEqual(expectedMissions);
    });

    it('should_call_wsApi_getMissions_once_when_invoked', async () => {
      // Arrange
      const mockWsApi = createMockWsApi();
      const service = new MissionService(mockWsApi);

      // Act
      await service.getMissions();

      // Assert
      expect(mockWsApi.getMissions).toHaveBeenCalledTimes(1);
    });

    it('should_throw_error_when_api_call_fails', async () => {
      // Arrange
      const mockWsApi = createMockWsApi();
      const expectedError = new Error('Network error');
      mockWsApi.getMissions.mockRejectedValue(expectedError);
      const service = new MissionService(mockWsApi);

      // Act & Assert
      await expect(service.getMissions()).rejects.toThrow('Network error');
    });
  });
});
```

### Integration Tests

```typescript
// Test Redux integration
describe('Missions Redux Integration', () => {
  it('should_update_state_when_fetchMissions_fulfilled', () => {
    // Arrange
    const initialState = createInitialMissionsState();
    const missions = [createMockMission({ id: 1 })];
    const action = fetchMissions.fulfilled(missions, 'requestId', undefined);

    // Act
    const newState = missionsReducer(initialState, action);

    // Assert
    expect(newState.loading).toBe(false);
  });
});
```

### Component Tests (React Testing Library)

```typescript
// components/MissionCard.test.tsx
describe('MissionCard', () => {
  it('should_display_mission_name_when_rendered', () => {
    // Arrange
    const mission = createMockMission({ name: 'Daily Login' });

    // Act
    render(<MissionCard mission={mission} />);

    // Assert
    expect(screen.getByText('Daily Login')).toBeInTheDocument();
  });

  it('should_call_onOptIn_when_opt_in_button_clicked', () => {
    // Arrange
    const mockOnOptIn = jest.fn();
    const mission = createMockMission({ id: 1 });
    render(<MissionCard mission={mission} onOptIn={mockOnOptIn} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /opt in/i }));

    // Assert
    expect(mockOnOptIn).toHaveBeenCalledWith(1);
  });
});
```

### E2E Tests (Cypress)

```typescript
// cypress/e2e/missions.cy.ts
describe('Missions Feature', () => {
  it('should_display_active_missions_when_user_navigates_to_missions_page', () => {
    // Arrange
    cy.login();
    
    // Act
    cy.visit('/missions');
    
    // Assert
    cy.get('[data-testid="mission-tab-active"]').should('be.visible');
  });

  it('should_opt_in_to_mission_when_opt_in_button_clicked', () => {
    // Arrange
    cy.login();
    cy.visit('/missions');
    
    // Act
    cy.get('[data-testid="mission-card"]').first()
      .find('button:contains("Opt In")').click();
    
    // Assert
    cy.contains('Successfully opted in').should('be.visible');
  });
});
```

## Deployment Architecture

### Build Pipeline

```yaml
# .github/workflows/build-deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Test (unit)
        run: npm run test:unit
      
      - name: Test (integration)
        run: npm run test:integration
      
      - name: Build
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Performance budget check
        run: npm run check-bundle-size
      
      - name: Deploy
        run: npm run deploy
```

### Environment Configuration

```typescript
// config/environment.ts
export const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000',
    enableDevTools: true,
  },
  staging: {
    apiUrl: 'https://staging-api.smartico.ai',
    wsUrl: 'wss://staging-api.smartico.ai',
    enableDevTools: false,
  },
  production: {
    apiUrl: 'https://api.smartico.ai',
    wsUrl: 'wss://api.smartico.ai',
    enableDevTools: false,
  },
};
```

## Monitoring & Observability

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| First Contentful Paint | < 1.5s | > 2.5s |
| Time to Interactive | < 3.5s | > 5s |
| Bundle Size (missions route) | < 250KB | > 300KB |
| API Response Time (p95) | < 200ms | > 500ms |
| Error Rate | < 0.1% | > 1% |
| WebSocket Connection Success | > 95% | < 90% |

### Logging Strategy

```typescript
// utils/logger.ts
export class Logger {
  info(message: string, context?: object): void {
    console.log(`[INFO] ${message}`, context);
    // Send to logging service (e.g., Sentry, LogRocket)
  }

  error(message: string, error: Error, context?: object): void {
    console.error(`[ERROR] ${message}`, error, context);
    // Send to error tracking service
  }

  performance(metric: string, value: number): void {
    // Send to analytics service
    console.log(`[PERF] ${metric}: ${value}ms`);
  }
}

// Usage
logger.info('Missions loaded', { count: missions.length, duration: 150 });
logger.error('Failed to opt in', error, { missionId: 123 });
logger.performance('missions-load-time', performance.now() - startTime);
```

## Architecture Decision Records (ADRs)

### ADR-001: Use Existing @smartico/public-api Types

**Status:** Accepted  
**Date:** 2024-10-29  
**Context:** Need to decide whether to define new TypeScript interfaces or use existing ones.  
**Decision:** Use existing `@smartico/public-api` interfaces (`TMissionOrBadge`, etc.)  
**Consequences:**
- ✅ Consistency across codebase
- ✅ No duplication or drift
- ✅ Type safety guaranteed
- ⚠️ Must stay synchronized with API package updates

### ADR-002: Mobile-First Responsive Design

**Status:** Accepted  
**Date:** 2024-10-29  
**Context:** 60%+ users on mobile devices  
**Decision:** Design and develop for mobile screens first, progressively enhance for desktop  
**Consequences:**
- ✅ Best experience for majority users
- ✅ Forces focus on essential features
- ✅ Better performance (smaller initial bundle)
- ⚠️ Desktop features may feel constrained initially

### ADR-003: Smart Fallback Error Handling

**Status:** Accepted  
**Date:** 2024-10-29  
**Context:** Need reliable UX even with network issues  
**Decision:** Auto-retry once, show cached data with warning if retry fails  
**Consequences:**
- ✅ Always show something useful
- ✅ Reduces perceived errors
- ✅ Better UX than blank screens
- ⚠️ Cache invalidation complexity

### ADR-004: Server-Confirmed Progress Updates

**Status:** Accepted  
**Date:** 2024-10-29  
**Context:** Risk of optimistic updates causing rollback scenarios  
**Decision:** Wait for server confirmation before updating UI  
**Consequences:**
- ✅ Data accuracy guaranteed
- ✅ No confusing rollbacks
- ✅ Simpler state management
- ⚠️ 2-second delay in feedback

## Future Enhancements

### Phase 2 (Post-MVP)
- Social sharing of badge achievements
- Mission recommendations based on user behavior
- Push notifications for mission expiration
- Achievement animations and celebrations
- Mission creation wizard (admin)

### Phase 3 (Advanced)
- Mission templates and duplication
- A/B testing for mission designs
- Advanced analytics dashboard
- Mission difficulty auto-tuning
- Collaborative missions (multi-user)

---

**Document Status:** Draft  
**Next Review:** Upon implementation start  
**Approval Required:** Technical Lead, Frontend Lead


