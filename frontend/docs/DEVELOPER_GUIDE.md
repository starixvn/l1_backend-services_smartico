# Dashboard Developer Guide

Technical guide for developers working on the Smartico Gamification Dashboard.

## Table of Contents

- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Creating Widgets](#creating-widgets)
- [Theme System](#theme-system)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Performance](#performance)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 10+
- TypeScript 5.6+
- React 19 knowledge
- Familiarity with Framer Motion

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/smartico.git
cd smartico/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

### Project Structure

```
frontend/src/
├── components/dashboard/
│   ├── layout/               # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── widgets/              # All dashboard widgets
│   │   ├── DailyChallengeWidget.tsx
│   │   ├── LevelProgressWidget.tsx
│   │   └── ... (12 more widgets)
│   ├── shared/               # Reusable components
│   │   ├── AnimatedCard.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── ParticleEffect.tsx
│   │   └── SkeletonLoader.tsx
│   ├── DashboardApp.tsx      # Main entry point
│   ├── WidgetGrid.tsx        # Grid layout + animations
│   ├── LayoutCustomizer.tsx  # Widget visibility modal
│   ├── ThemeCustomizer.tsx   # Theme customization modal
│   ├── ThemePresetGrid.tsx   # Preset theme cards
│   └── CustomColorPicker.tsx # Color picker with validation
├── hooks/
│   ├── useDashboardData.ts   # Data fetching
│   ├── useTheme.ts           # Theme management
│   ├── useWidgetLayout.ts    # Layout persistence
│   └── useReducedMotion.ts   # Accessibility
├── types/dashboard/
│   ├── widgets.ts            # Widget data types
│   ├── theme.ts              # Theme configuration
│   └── components.ts         # Component props
├── contexts/
│   └── DashboardContext.tsx  # Global state
└── styles/
    ├── index.css             # Global + CSS variables
    └── glassmorphism.css     # Glassmorphism utilities
```

## Architecture Overview

### Design Patterns

#### 1. Clean Architecture
- **Separation of Concerns**: UI, business logic, and data are separated
- **Dependency Inversion**: Components depend on abstractions (hooks), not implementations
- **Single Responsibility**: Each component has one clear purpose

#### 2. Component Composition
- **Shared Components**: Reusable primitives (AnimatedCard, ProgressRing)
- **Widget Components**: Specialized, feature-rich components
- **Layout Components**: Grid, modal, navigation

#### 3. Custom Hooks Pattern
- **useDashboardData**: Data fetching abstraction
- **useTheme**: Theme management + localStorage
- **useWidgetLayout**: Layout persistence
- **useReducedMotion**: Accessibility helper

### Data Flow

```
┌─────────────────────────────────────────┐
│         DashboardApp (Entry)            │
│  ┌───────────────────────────────────┐  │
│  │   DashboardProvider (Context)     │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   WidgetGrid (Layout)       │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Widget Components   │  │  │  │
│  │  │  │  - useDashboardData  │  │  │  │
│  │  │  │  - useTheme          │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | React 19 | Component rendering |
| Type Safety | TypeScript 5.6 | Static typing |
| Styling | TailwindCSS 3.4 | Utility-first CSS |
| Animations | Framer Motion 11 | Declarative animations |
| Build Tool | Vite 7.1 | Fast builds + HMR |
| State | Context API | Global state |
| Persistence | localStorage | Client-side storage |

## Creating Widgets

### Widget Template

Here's a complete widget template following best practices:

```tsx
/**
 * MyWidget Component
 * Brief description of what this widget does.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '../shared/AnimatedCard';
import { SkeletonLoader } from '../shared/SkeletonLoader';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

/**
 * MyWidget component.
 * Detailed description of functionality and features.
 */
export function MyWidget() {
  const { data, isLoading } = useDashboardData();
  const prefersReducedMotion = useReducedMotion();

  // Local state
  const [localState, setLocalState] = useState<string>('');

  // Get widget data
  const widgetData = data?.myWidgetData;

  // Side effects
  useEffect(() => {
    // Setup logic
    return () => {
      // Cleanup logic
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="text" lines={3} />
        <SkeletonLoader variant="rectangular" height="4rem" className="mt-4" />
      </AnimatedCard>
    );
  }

  // Empty state
  if (!widgetData) {
    return (
      <AnimatedCard className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-400">No data available</p>
        </div>
      </AnimatedCard>
    );
  }

  // Main render
  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          My Widget
        </h3>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Widget-specific content */}
      </div>

      {/* Footer / Actions */}
      <motion.button
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        className="w-full py-2 text-white text-sm font-medium rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900"
        style={{
          background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = 'brightness(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'brightness(1)';
        }}
      >
        Action Button
      </motion.button>
    </AnimatedCard>
  );
}
```

### Step-by-Step Widget Creation

#### Step 1: Create Widget File

Create `frontend/src/components/dashboard/widgets/MyWidget.tsx` using the template above.

#### Step 2: Define Widget Type

Update `frontend/src/types/dashboard/widgets.ts`:

```typescript
export type WidgetId =
  | 'daily-challenge'
  | 'level-progress'
  // ... existing widgets
  | 'my-widget';  // Add your widget ID

export interface MyWidgetData {
  // Define your widget's data structure
  title: string;
  value: number;
  timestamp: string;
}

export interface DashboardData {
  // ... existing data
  myWidgetData?: MyWidgetData;  // Add to dashboard data
}
```

#### Step 3: Add Mock Data

Update `frontend/src/hooks/useDashboardData.ts`:

```typescript
const MOCK_DASHBOARD_DATA: DashboardData = {
  // ... existing mock data
  myWidgetData: {
    title: 'My Widget Title',
    value: 42,
    timestamp: new Date().toISOString(),
  },
};
```

#### Step 4: Register Widget

Update `frontend/src/components/dashboard/WidgetGrid.tsx`:

```typescript
import { MyWidget } from './widgets/MyWidget';

const WIDGET_REGISTRY: Record<WidgetId, React.ComponentType> = {
  // ... existing widgets
  'my-widget': MyWidget,
};

const WIDGET_LAYOUT: Array<{ id: WidgetId; gridArea: string; className: string }> = {
  // ... existing widgets
  {
    id: 'my-widget',
    gridArea: 'my-widget',
    className: 'col-span-1 lg:col-span-1'  // Adjust grid span as needed
  },
};
```

#### Step 5: Add Widget Metadata

Update `frontend/src/components/dashboard/LayoutCustomizer.tsx`:

```typescript
const WIDGET_METADATA: Record<WidgetId, { label: string; description: string; emoji: string }> = {
  // ... existing widgets
  'my-widget': {
    label: 'My Widget',
    description: 'Brief description of what this widget displays',
    emoji: '🎯',  // Choose an appropriate emoji
  },
};
```

#### Step 6: Test Your Widget

1. Start dev server: `npm run dev`
2. Open Layout Customizer
3. Enable your widget
4. Verify it appears and functions correctly
5. Test loading and empty states
6. Test theme integration (if using CSS variables)

### Widget Best Practices

#### Loading States

Always show a skeleton loader while data is fetching:

```tsx
if (isLoading) {
  return (
    <AnimatedCard className="p-6">
      <SkeletonLoader variant="text" lines={3} />
      <SkeletonLoader variant="rectangular" height="4rem" className="mt-4" />
    </AnimatedCard>
  );
}
```

#### Empty States

Handle missing data gracefully:

```tsx
if (!widgetData) {
  return (
    <AnimatedCard className="p-6">
      <div className="text-center py-8">
        <p className="text-gray-400">No data available</p>
      </div>
    </AnimatedCard>
  );
}
```

#### Error States

Show user-friendly error messages:

```tsx
if (error) {
  return (
    <AnimatedCard className="p-6">
      <div className="text-center py-8 text-red-400">
        <p>Failed to load data</p>
        <button onClick={retry} className="mt-2 text-sm underline">
          Try Again
        </button>
      </div>
    </AnimatedCard>
  );
}
```

#### Progress Bars with Theme Colors

Use CSS variables for theme-aware progress bars:

```tsx
<div
  className="h-3 rounded-full transition-all duration-500"
  style={{
    width: `${progress}%`,
    background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
  }}
/>
```

#### Buttons with Theme Colors

Implement theme-aware buttons with hover effects:

```tsx
<button
  className="px-4 py-2 text-white font-medium rounded-lg transition-all shadow-lg"
  style={{
    background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.filter = 'brightness(1.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.filter = 'brightness(1)';
  }}
>
  Button Text
</button>
```

## Theme System

### CSS Variable Architecture

The theme system uses CSS variables for dynamic styling:

```css
/* Default values */
:root {
  --color-primary: #9333ea;
  --color-accent: #ec4899;
  --base-font-size: 16px;
  --animation-intensity: moderate;
}

/* Dark theme */
[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
}

/* Light theme */
[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
}
```

### useTheme Hook

The `useTheme` hook manages theme state and persistence:

```typescript
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_THEME_CONFIG;
  });

  const setTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setThemeState((prev) => {
      const updated = { ...prev, ...newTheme };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--base-font-size', `${theme.fontSize}px`);

    // Apply preset or custom colors
    if (theme.preset === 'custom') {
      root.style.setProperty('--color-primary', theme.primaryColor);
      root.style.setProperty('--color-accent', theme.accentColor);
    } else {
      const colors = PRESET_COLORS[theme.preset];
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-accent', colors.accent);
    }
  }, [theme]);

  return { theme, setTheme, resetTheme };
}
```

### Adding New Theme Presets

1. **Define preset colors** in `useTheme.ts`:

```typescript
const PRESET_COLORS: Record<string, { primary: string; accent: string }> = {
  // ... existing presets
  'midnight-blue': { primary: '#1e40af', accent: '#3b82f6' },
};
```

2. **Update ThemeConfig type** in `types/dashboard/theme.ts`:

```typescript
export type ThemePreset =
  | 'royal-purple'
  | 'ocean-blue'
  // ... existing presets
  | 'midnight-blue'
  | 'custom';
```

3. **Add preset card** in `ThemePresetGrid.tsx`:

```typescript
const THEME_PRESETS = [
  // ... existing presets
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    primaryColor: '#1e40af',
    accentColor: '#3b82f6',
    bgGradient: 'from-blue-800 to-blue-500',
    icon: '🌙',
  },
];
```

## State Management

### Context Architecture

The dashboard uses React Context for global state:

```typescript
interface DashboardContextValue {
  // Theme state
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;

  // Layout state
  layout: LayoutConfig;
  setWidgetVisibility: (widgetId: WidgetId, visible: boolean) => void;

  // Data state
  data: DashboardData | null;
  isLoading: boolean;
  error: Error | null;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);
```

### Local Storage Strategy

Persistent data is stored in `localStorage`:

| Key | Purpose | Structure |
|-----|---------|-----------|
| `smartico-theme` | Theme configuration | `ThemeConfig` JSON |
| `smartico-widget-layout` | Widget visibility | `LayoutConfig` JSON |

### Adding New Persistent State

1. **Define storage key constant**:

```typescript
const MY_STATE_KEY = 'smartico-my-state';
```

2. **Create custom hook**:

```typescript
export function useMyState() {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(MY_STATE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_STATE;
  });

  const updateState = useCallback((newState) => {
    setState((prev) => {
      const updated = { ...prev, ...newState };
      localStorage.setItem(MY_STATE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { state, updateState };
}
```

## API Integration

### Current: Mock Data

Currently, all widgets use mock data from `useDashboardData`:

```typescript
const MOCK_DASHBOARD_DATA: DashboardData = {
  missions: [/* ... */],
  achievements: [/* ... */],
  level: {/* ... */},
  // ... all widget data
};

export function useDashboardData() {
  return {
    data: MOCK_DASHBOARD_DATA,
    isLoading: false,
    error: null,
  };
}
```

### Future: Real API

#### REST API Integration

Replace mock implementation with real API calls:

```typescript
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}
```

#### SignalR Integration

Add real-time updates using SignalR:

```typescript
import * as signalR from '@microsoft/signalr';

export function useSignalRConnection() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/progress', {
        accessTokenFactory: () => getAuthToken(),
      })
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        console.log('SignalR connected');
        setConnection(conn);
      })
      .catch(err => console.error('SignalR connection error:', err));

    return () => {
      conn.stop();
    };
  }, []);

  return connection;
}

// In a widget component
export function DailyChallengeWidget() {
  const connection = useSignalRConnection();
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    if (!connection) return;

    const handleMissionProgress = (event: MissionProgressEvent) => {
      setChallenge(prev => ({
        ...prev,
        progress: event.progress,
        currentValue: event.currentValue,
      }));
    };

    connection.on('mission-progress', handleMissionProgress);

    return () => {
      connection.off('mission-progress', handleMissionProgress);
    };
  }, [connection]);

  // ... rest of component
}
```

#### Error Handling

Implement robust error handling:

```typescript
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Dashboard error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-400 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-400 mb-4">
          Please refresh the page or contact support
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Testing

### Unit Tests

Use Vitest and React Testing Library:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailyChallengeWidget } from './DailyChallengeWidget';

describe('DailyChallengeWidget', () => {
  it('renders loading state', () => {
    render(<DailyChallengeWidget />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays challenge data', () => {
    render(<DailyChallengeWidget />);
    expect(screen.getByText('Daily Challenge')).toBeInTheDocument();
  });

  it('shows progress bar with correct percentage', () => {
    render(<DailyChallengeWidget />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
  });
});
```

### E2E Tests

Use Playwright for end-to-end testing:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Theme Customization', () => {
  test('should change theme when selecting preset', async ({ page }) => {
    await page.goto('/dashboard');

    // Open theme customizer
    await page.click('button:has-text("Theme")');

    // Select Ocean Blue preset
    await page.click('button:has-text("Ocean Blue")');

    // Verify CSS variables changed
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary');
    });

    expect(primaryColor.trim()).toBe('#0ea5e9');
  });
});
```

## Performance

### Optimization Strategies

#### 1. Code Splitting

Split widgets into separate bundles:

```typescript
const DailyChallengeWidget = lazy(() => import('./widgets/DailyChallengeWidget'));
const LevelProgressWidget = lazy(() => import('./widgets/LevelProgressWidget'));

function WidgetGrid() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <DailyChallengeWidget />
      <LevelProgressWidget />
    </Suspense>
  );
}
```

#### 2. Memoization

Prevent unnecessary re-renders:

```typescript
const MemoizedWidget = memo(MyWidget, (prev, next) => {
  return prev.data?.id === next.data?.id;
});
```

#### 3. Virtual Scrolling

For long lists, use virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function LeaderboardWidget() {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: leaderboardEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  return (
    <div ref={parentRef} className="h-80 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(item => (
          <div key={item.key} style={{ height: `${item.size}px` }}>
            {/* Entry content */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4. GPU Acceleration

Enable GPU acceleration for animations:

```tsx
<motion.div
  style={{ transform: 'translateZ(0)' }}
  className="will-change-transform"
>
  {children}
</motion.div>
```

### Performance Monitoring

Track widget performance:

```typescript
function MyWidget() {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`MyWidget render time: ${endTime - startTime}ms`);
    };
  });

  // ... component code
}
```

## Best Practices

### Code Style

1. **TypeScript Strict Mode**: Always enabled
2. **ESLint**: Follow Airbnb React style guide
3. **Prettier**: Auto-format on save
4. **Naming Conventions**:
   - Components: PascalCase (`MyWidget.tsx`)
   - Hooks: camelCase with `use` prefix (`useMyHook.ts`)
   - Types: PascalCase (`MyType`)
   - Constants: SCREAMING_SNAKE_CASE (`MY_CONSTANT`)

### Accessibility

1. **Semantic HTML**: Use proper HTML5 elements
2. **ARIA Labels**: Add labels for screen readers
3. **Keyboard Navigation**: All interactive elements accessible via keyboard
4. **Focus Management**: Visible focus indicators
5. **Color Contrast**: WCAG AA compliance (4.5:1 ratio)
6. **Reduced Motion**: Respect `prefers-reduced-motion`

### Git Workflow

1. **Branch Naming**:
   - Feature: `feat/my-feature`
   - Bug fix: `fix/my-bug`
   - Docs: `docs/update-readme`

2. **Commit Messages** (Conventional Commits):
   ```
   feat: add new widget for streak tracking
   fix: resolve theme persistence issue
   docs: update developer guide
   refactor: simplify theme hook logic
   test: add unit tests for theme system
   ```

3. **Pull Request Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Documentation update
   - [ ] Refactoring

   ## Testing
   - [ ] Unit tests pass
   - [ ] E2E tests pass
   - [ ] Manual testing completed

   ## Screenshots
   (if applicable)
   ```

### Documentation

1. **Component Documentation**: JSDoc comments for all exports
2. **README Files**: Each major feature has a README
3. **Type Definitions**: Document complex types with comments
4. **Changelog**: Keep CHANGELOG.md updated

---

**Happy coding!** 🚀
