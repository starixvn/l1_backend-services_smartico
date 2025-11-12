# Gamification Dashboard

A modern, customizable dashboard for the Smartico gamification platform with real-time updates, theme customization, and responsive design.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Widgets](#widgets)
- [Customization](#customization)
- [Development](#development)
- [API Integration](#api-integration)

## Features

### 🎨 Theme Customization

- **6 Preset Themes**:
  - Royal Purple (default)
  - Ocean Blue
  - Neon Cyber
  - Nature Zen
  - Sunset Orange
  - Custom (create your own)

- **Theme Options**:
  - Light/Dark mode
  - Font size (14px, 16px, 18px)
  - Animation intensity (none, subtle, moderate, energetic)
  - Custom primary and accent colors with WCAG AA contrast validation
  - Import/Export theme configuration as JSON

- **Persistence**: All theme settings saved to `localStorage` and persist across sessions

### 📐 Layout Customization

- **Widget Visibility Controls**: Show/hide any of the 14 dashboard widgets
- **Draft Preview**: Changes preview in modal before saving
- **Reset to Default**: One-click restore to default layout
- **Empty State Handling**: Helpful CTA when all widgets are hidden

### ✨ Animations & Polish

- **Staggered Entrance Animations**: Widgets animate in with 50ms delay between each
- **Spring Physics**: Natural, physics-based motion using Framer Motion
- **GPU Acceleration**: Optimized rendering with `translateZ(0)` and `will-change`
- **Reduced Motion Support**: Respects user's `prefers-reduced-motion` setting
- **Hover Effects**: Interactive buttons with brightness(1.1) hover state

### 📱 Responsive Design

- **Mobile**: 1-column layout
- **Tablet**: 2-column layout (768px+)
- **Desktop**: 3-column layout (1024px+)
- **Glassmorphism**: Frosted glass effect with backdrop blur

## Architecture

### Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 7.1** - Build tool
- **Framer Motion 11** - Animations
- **TailwindCSS 3.4** - Styling
- **CSS Variables** - Dynamic theming

### Project Structure

```
frontend/src/
├── components/
│   └── dashboard/
│       ├── layout/                 # Layout components (DashboardLayout, Sidebar, etc.)
│       ├── widgets/                # 14 dashboard widgets
│       ├── shared/                 # Shared components (AnimatedCard, ProgressRing, etc.)
│       ├── DashboardApp.tsx        # Main dashboard entry point
│       ├── WidgetGrid.tsx          # Responsive grid with staggered animations
│       ├── LayoutCustomizer.tsx    # Widget visibility modal
│       ├── ThemeCustomizer.tsx     # Theme customization modal
│       ├── ThemePresetGrid.tsx     # Preset theme cards
│       └── CustomColorPicker.tsx   # Custom color picker with WCAG validation
├── hooks/
│   ├── useDashboardData.ts         # Data fetching (currently mock, ready for API)
│   ├── useTheme.ts                 # Theme management with localStorage
│   ├── useWidgetLayout.ts          # Layout persistence
│   └── useReducedMotion.ts         # Accessibility hook
├── types/
│   └── dashboard/
│       ├── widgets.ts              # Widget data types
│       ├── theme.ts                # Theme configuration types
│       └── components.ts           # Component prop types
├── contexts/
│   └── DashboardContext.tsx        # Global dashboard state
└── styles/
    ├── index.css                   # Global styles + CSS variables
    └── glassmorphism.css           # Glassmorphism utilities
```

## Widgets

The dashboard includes **14 widgets** across 7 categories:

### 1. Daily Challenge Widget
- **Purpose**: Display today's mission with countdown timer and progress
- **Features**:
  - Real-time countdown (hours, minutes)
  - Progress bar with shimmer effect
  - Target value tracking
  - Reward points display
  - "Continue Challenge" CTA or "Completed!" state
- **Mock Data**: First mission from missions array
- **Theme Integration**: Progress bar + CTA button

### 2. Level Progress Widget
- **Purpose**: Show player's current level and XP progress
- **Features**:
  - Circular progress ring with spring animation
  - XP stats (current, next level, remaining)
  - Linear progress bar
  - Level-up celebration with confetti
- **Mock Data**: Level 12 with 75% progress
- **Theme Integration**: Progress bars + LEVEL UP text gradient

### 3. Active Missions Widget
- **Purpose**: List of ongoing missions with progress tracking
- **Features**:
  - Scrollable list (max 3 visible)
  - Individual progress bars with shimmer
  - Completion checkmarks
  - Reward display
- **Mock Data**: 3 missions (2 active, 1 complete)
- **Theme Integration**: Active mission progress bars (green for completed)

### 4. Recent Achievements Widget
- **Purpose**: Showcase recently unlocked achievements
- **Features**:
  - Achievement cards with rarity colors
  - Unlock date display
  - Rarity badges (Common, Rare, Epic, Legendary)
  - Points earned
- **Mock Data**: 3 achievements (2 epic, 1 legendary)
- **Theme Integration**: None (uses rarity-specific colors)

### 5. Leaderboard Widget
- **Purpose**: Display top players and user's rank
- **Features**:
  - Top 5 players with rankings
  - Medal badges for top 3 (🥇🥈🥉)
  - Current user highlight
  - Points display
- **Mock Data**: 5 players, user at rank 4
- **Theme Integration**: Current user avatar gradient

### 6. Bonus Tracker Widget
- **Purpose**: Track active bonuses and rewards
- **Features**:
  - Bonus list with expiry timers
  - Progress bars
  - "Claim" buttons for ready bonuses
  - Claimed state
- **Mock Data**: 2 bonuses (1 ready to claim)
- **Theme Integration**: Claim buttons

### 7. Personal Goals Widget
- **Purpose**: User-defined goals with progress tracking
- **Features**:
  - Goal cards with deadlines
  - Animated progress bars
  - Completion checkmarks
  - Reward points
- **Mock Data**: 3 goals (varied progress)
- **Theme Integration**: Active goal progress bars (green for completed)

### 8. Streak Tracker Widget
- **Purpose**: Track daily login streaks
- **Features**:
  - Current streak counter
  - 7-day visual calendar
  - Checkmarks for completed days
  - Milestone celebrations
- **Mock Data**: 5-day streak
- **Theme Integration**: None (uses fixed colors for streak states)

### 9. Reward Calendar Widget
- **Purpose**: Monthly reward calendar with daily login bonuses
- **Features**:
  - Calendar grid (current month)
  - Reward type indicators
  - "Claim Today" CTA
  - Monthly progress bar
- **Mock Data**: 15 days completed
- **Theme Integration**: Claim button + monthly progress bar

### 10. VIP Status Widget
- **Purpose**: Display VIP tier and benefits
- **Features**:
  - Tier badge (Bronze, Silver, Gold, Platinum, Diamond)
  - Points to next tier
  - Progress bar
  - Benefit list
- **Mock Data**: Gold tier with 3 benefits
- **Theme Integration**: None (uses tier-specific gold gradient)

### 11. Jackpot Widget
- **Purpose**: Show current jackpot pool and user's tickets
- **Features**:
  - Animated jackpot amount
  - User ticket count
  - "Buy Tickets" CTA
  - Recent winners list
- **Mock Data**: $12,500 jackpot, 3 recent winners
- **Theme Integration**: Buy Tickets button uses fixed yellow-orange (branding)

### 12. Tournament Widget
- **Purpose**: Current tournament standings and progress
- **Features**:
  - Tournament name and end time
  - User rank and points
  - Rank tier display
  - Progress to next tier
  - "View Leaderboard" CTA
- **Mock Data**: "Weekend Warriors" tournament
- **Theme Integration**: Rank progress bar uses fixed yellow-orange (branding)

### 13. Mini Games Widget
- **Purpose**: List available mini games to play
- **Features**:
  - Game cards with thumbnails
  - Jackpot indicators
  - Cooldown timers
  - "Play" or "Locked" buttons
- **Mock Data**: 3 games (2 available, 1 locked)
- **Theme Integration**: Play buttons (when available)

### 14. Activity Feed Widget
- **Purpose**: Recent user activity and notifications
- **Features**:
  - Activity timeline
  - Event type icons
  - Relative timestamps
  - "View All" link
- **Mock Data**: 4 recent activities
- **Theme Integration**: None (uses semantic colors)

## Customization

### Using the Theme Customizer

1. **Open Theme Panel**: Click the "Theme" button in the top-right corner
2. **Select Preset**: Choose from 6 preset themes
3. **Customize Colors** (Custom preset only):
   - Adjust Primary Color using HSL sliders or hex input
   - Adjust Accent Color
   - View WCAG AA contrast validation
4. **Adjust Settings**:
   - Toggle Light/Dark mode
   - Select font size (14px, 16px, 18px)
   - Set animation intensity
5. **Save**: Click "Save Theme" to apply changes
6. **Reset**: Click "Reset to Default" to restore Royal Purple theme

### Using the Layout Customizer

1. **Open Layout Panel**: Click the "Layout" button in the top-right corner
2. **Toggle Widgets**: Check/uncheck widgets to show/hide
3. **Preview**: Changes preview in real-time (not saved yet)
4. **Save**: Click "Save Layout" to persist changes
5. **Reset**: Click "Reset Layout" to restore all widgets

### Theme Configuration API

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark';
  preset: 'royal-purple' | 'ocean-blue' | 'neon-cyber' | 'nature-zen' | 'sunset-orange' | 'custom';
  primaryColor?: string;  // Only for custom preset
  accentColor?: string;   // Only for custom preset
  fontSize: 14 | 16 | 18;
  animationIntensity: 'none' | 'subtle' | 'moderate' | 'energetic';
}
```

### CSS Variables

The theme system uses CSS variables for dynamic theming:

```css
:root {
  --color-primary: #9333ea;     /* Primary brand color */
  --color-accent: #ec4899;      /* Accent/secondary color */
  --base-font-size: 16px;       /* Base font size */
  --animation-intensity: moderate;
}

[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
}

[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
}
```

### Using Theme Variables in Components

```tsx
// Progress bar with theme colors
<div
  style={{
    background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
  }}
/>

// Button with theme colors and hover effect
<button
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
  Click Me
</button>
```

## Development

### Running the Dashboard

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Access dashboard**:
   - Update `frontend/src/main.tsx` to import `DashboardApp` instead of `App`
   ```tsx
   import { DashboardApp } from './DashboardApp'

   root.render(
     <StrictMode>
       <DashboardApp />
     </StrictMode>,
   )
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

### Creating a New Widget

1. **Create widget component** in `frontend/src/components/dashboard/widgets/`:

```tsx
import { AnimatedCard } from '../shared/AnimatedCard';
import { useDashboardData } from '../../../hooks/useDashboardData';

export function MyWidget() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonLoader variant="text" lines={3} />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <h3 className="text-lg font-bold text-white mb-4">My Widget</h3>
      {/* Widget content */}
    </AnimatedCard>
  );
}
```

2. **Register widget** in `frontend/src/components/dashboard/WidgetGrid.tsx`:

```tsx
import { MyWidget } from './widgets/MyWidget';

const WIDGET_REGISTRY: Record<WidgetId, React.ComponentType> = {
  // ... existing widgets
  'my-widget': MyWidget,
};

const WIDGET_LAYOUT: Array<{ id: WidgetId; className: string }> = [
  // ... existing widgets
  { id: 'my-widget', className: 'col-span-1 lg:col-span-1' },
];
```

3. **Add widget metadata** in `frontend/src/components/dashboard/LayoutCustomizer.tsx`:

```tsx
const WIDGET_METADATA: Record<WidgetId, { label: string; description: string; emoji: string }> = {
  // ... existing widgets
  'my-widget': {
    label: 'My Widget',
    description: 'Description of what this widget does',
    emoji: '🎯',
  },
};
```

4. **Update WidgetId type** in `frontend/src/types/dashboard/widgets.ts`:

```typescript
export type WidgetId =
  | 'daily-challenge'
  // ... existing IDs
  | 'my-widget';
```

### Performance Best Practices

1. **Use AnimatedCard wrapper**: Provides consistent animations and GPU acceleration
2. **Implement SkeletonLoader**: Show loading states for better UX
3. **Respect prefers-reduced-motion**: Use `useReducedMotion()` hook
4. **Optimize re-renders**: Use `useMemo` and `useCallback` for expensive operations
5. **Lazy load widgets**: Consider code splitting for large widgets

### Accessibility Guidelines

- **Keyboard Navigation**: All interactive elements should be keyboard accessible
- **ARIA Labels**: Use appropriate ARIA attributes for screen readers
- **Color Contrast**: Ensure WCAG AA compliance (4.5:1 ratio for text)
- **Focus Indicators**: Visible focus rings on all interactive elements
- **Reduced Motion**: Respect user's motion preferences

## API Integration

### Current State: Mock Data

All widgets currently use mock data from `useDashboardData()` hook. Mock data is defined in `frontend/src/hooks/useDashboardData.ts`.

### Migration Plan: Real API

To connect widgets to the Smartico API:

1. **Replace useDashboardData hook**:

```typescript
// Before (mock)
export function useDashboardData() {
  return {
    data: MOCK_DASHBOARD_DATA,
    isLoading: false,
  };
}

// After (real API)
export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, isLoading };
}
```

2. **Add SignalR for real-time updates**:

```typescript
// Example: Mission completion event
useEffect(() => {
  const handleMissionComplete = (event: MissionCompleteEvent) => {
    // Update UI, trigger celebration
  };

  signalrConnection.on('mission-complete', handleMissionComplete);

  return () => {
    signalrConnection.off('mission-complete', handleMissionComplete);
  };
}, []);
```

3. **Implement error handling**:

```typescript
const { data, isLoading, error } = useDashboardData();

if (error) {
  return (
    <AnimatedCard className="p-6">
      <div className="text-center text-red-400">
        Failed to load data. Please try again.
      </div>
    </AnimatedCard>
  );
}
```

### API Endpoints (Expected)

- `GET /api/dashboard` - Fetch all dashboard data
- `GET /api/missions` - Fetch active missions
- `GET /api/achievements` - Fetch achievements
- `GET /api/leaderboard` - Fetch leaderboard
- `GET /api/bonuses` - Fetch active bonuses
- `POST /api/bonuses/:id/claim` - Claim a bonus
- `GET /api/tournaments/active` - Fetch active tournament
- `GET /api/mini-games` - Fetch available mini games
- `POST /api/mini-games/:id/play` - Play a mini game

### SignalR Events (Expected)

- `mission-complete` - Mission completed
- `achievement-unlocked` - New achievement
- `level-up` - Player leveled up
- `leaderboard-update` - Leaderboard changed
- `bonus-claimed` - Bonus claimed
- `tournament-rank-update` - Tournament rank changed
- `jackpot-winner` - Jackpot won
- `mini-game-result` - Mini game completed

## Build Information

- **Bundle Size**: 433.13 KB (124.71 KB gzipped)
- **TypeScript**: Strict mode, zero errors
- **Build Tool**: Vite 7.1
- **Target**: ES2020
- **Module**: ESNext

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This dashboard is part of the Smartico gamification platform.

---

**Generated with [Claude Code](https://claude.com/claude-code)**
