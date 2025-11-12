# Gamification Widget Layout - Component Architecture

**Version:** 1.0.0
**Created:** 2025-11-12
**Status:** Draft

## Component Hierarchy

```
Dashboard Page
├── DashboardLayout (layout shell)
│   ├── Sidebar (fixed navigation)
│   │   ├── Logo
│   │   ├── NavigationMenu
│   │   │   └── NavigationItem (x8)
│   │   └── UserProfile
│   ├── TopHeader (sticky header)
│   │   ├── PageTitle
│   │   ├── LevelBadge
│   │   ├── CountersDisplay
│   │   │   ├── CoinCounter
│   │   │   ├── GemCounter
│   │   │   └── DiamondCounter
│   │   ├── NotificationBell
│   │   └── UserAvatar
│   └── MainContent
│       ├── ThemeCustomizer (modal)
│       │   ├── ThemePresetGrid
│       │   ├── CustomColorPicker
│       │   ├── FontSizeSlider
│       │   └── AnimationIntensityToggle
│       ├── WidgetLayoutCustomizer (modal)
│       │   ├── WidgetVisibilityToggles
│       │   └── LayoutPreview (drag-and-drop grid)
│       └── WidgetGrid (12-column responsive grid)
│           ├── DailyChallengeWidget
│           ├── LevelProgressWidget
│           ├── ActiveMissionsWidget
│           ├── RecentAchievementsWidget
│           ├── LeaderboardWidget
│           ├── BonusTrackerWidget
│           ├── MiniGamesWidget
│           ├── TournamentWidget
│           ├── JackpotWidget
│           ├── ActivityFeedWidget
│           ├── PersonalGoalsWidget
│           ├── RewardCalendarWidget
│           ├── StreakTrackerWidget
│           └── VIPStatusWidget
└── Shared Components
    ├── AnimatedCard (glassmorphism wrapper)
    ├── ProgressRing (circular progress indicator)
    ├── ParticleEffect (celebration particles)
    ├── SkeletonLoader (loading state)
    ├── ErrorBoundary (error handling)
    └── EmptyState (no data state)
```

## Core Layout Components

### DashboardLayout

**Responsibility**: Root layout shell with sidebar, header, and main content area.

**Props**:
```typescript
interface DashboardLayoutProps {
  /** Child components (WidgetGrid) */
  children: React.ReactNode;
  /** Whether sidebar is initially collapsed (mobile) */
  sidebarCollapsed?: boolean;
}
```

**Structure**:
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggle} />
  <div className="ml-64 min-h-screen"> {/* Offset for fixed sidebar */}
    <TopHeader />
    <main className="px-6 py-8">
      {children}
    </main>
  </div>
</div>
```

**State Management**:
- `sidebarCollapsed: boolean` - Controls sidebar visibility (mobile)
- Persists to `localStorage['smartico-sidebar-collapsed']`

**Accessibility**:
- Landmark roles: `<nav>`, `<header>`, `<main>`
- Skip to content link for keyboard users
- Focus trap when mobile menu is open

---

### Sidebar

**Responsibility**: Fixed left navigation with menu items and user profile.

**Props**:
```typescript
interface SidebarProps {
  /** Whether sidebar is collapsed */
  collapsed: boolean;
  /** Callback when toggle button clicked */
  onToggle: () => void;
}
```

**Structure**:
```tsx
<nav className="fixed left-0 top-0 h-full w-64 bg-slate-800/50 backdrop-blur-lg border-r border-purple-500/30 z-50">
  <div className="p-6">
    <Logo />
  </div>
  <NavigationMenu>
    <NavigationItem icon={<LayoutDashboard />} label="Dashboard" active />
    <NavigationItem icon={<TrendingUp />} label="Progress" />
    <NavigationItem icon={<Gift />} label="Rewards" />
    {/* ... 5 more items */}
  </NavigationMenu>
  <div className="absolute bottom-0 w-full p-6">
    <UserProfile />
  </div>
</nav>
```

**Animations**:
- Slide in/out transition on mobile: `animate={{ x: collapsed ? -256 : 0 }}`
- Menu item hover: `whileHover={{ x: 4 }}`

**Responsive**:
- Desktop (1024px+): Always visible, 256px width
- Mobile (<1024px): Collapsible with hamburger button, overlay backdrop

---

### TopHeader

**Responsibility**: Sticky header with page title, level badge, counters, and user actions.

**Props**:
```typescript
interface TopHeaderProps {
  /** Current page title */
  title: string;
  /** Level data for badge */
  levelData: LevelData;
  /** User counters (coins, gems, diamonds) */
  counters: UserCounters;
}
```

**Structure**:
```tsx
<header className="sticky top-0 z-40 bg-slate-800/30 backdrop-blur-lg border-b border-purple-500/30">
  <div className="flex items-center justify-between px-6 py-4">
    <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <LevelBadge level={levelData.currentLevel} />
    </div>
    <div className="flex items-center gap-6">
      <CountersDisplay counters={counters} />
      <NotificationBell count={counters.notificationCount} />
      <UserAvatar />
    </div>
  </div>
</header>
```

**Real-time Updates**:
- Listens to SignalR `counter-update` event
- Animates counter changes with spring transition

---

### WidgetGrid

**Responsibility**: Responsive 12-column grid with drag-and-drop widget management.

**Props**:
```typescript
interface WidgetGridProps {
  /** Dashboard data from all services */
  data: DashboardData;
  /** Widget layout configuration */
  layout: WidgetLayoutConfig;
  /** Callback when layout changes (drag-and-drop) */
  onLayoutChange: (newLayout: WidgetLayoutConfig) => void;
  /** Whether in edit mode (drag-and-drop enabled) */
  editMode: boolean;
}
```

**Structure**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
  {layout.order
    .filter(widgetId => layout.visibility[widgetId])
    .map((widgetId, index) => (
      <m.div
        key={widgetId}
        layout
        drag={editMode}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, info) => handleDragEnd(widgetId, info)}
        className={getColumnSpanClass(layout.sizeMode[widgetId])}
      >
        {renderWidget(widgetId, data)}
      </m.div>
    ))}
</div>
```

**Drag-and-Drop Logic**:
- Uses Framer Motion's `drag` prop with constraints
- Snaps to grid on drag end (12-column system)
- Debounced localStorage save (500ms)
- Keyboard alternative: Arrow keys + Enter to reorder

**Grid Spans**:
- `compact`: `col-span-1 md:col-span-1 lg:col-span-1` (4 columns on desktop)
- `expanded`: `col-span-1 md:col-span-2 lg:col-span-1` (varies by widget)

---

## Widget Components

### DailyChallengeWidget

**Responsibility**: Displays today's daily challenge with progress and timer.

**Props**:
```typescript
interface DailyChallengeWidgetProps {
  /** Daily challenge data */
  challenge: Mission | null;
  /** Whether to show animations */
  animated?: boolean;
}
```

**Structure**:
```tsx
<AnimatedCard>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Daily Challenge</h3>
    <Timer expiresAt={challenge?.deadline} />
  </div>
  <p className="text-sm text-slate-300 mb-4">{challenge?.description}</p>
  <ProgressRing
    progress={challenge?.progress ?? 0}
    size={120}
    strokeWidth={12}
    color="purple"
    animated
  />
  <div className="mt-4 text-center">
    <span className="text-2xl font-bold">{challenge?.currentValue}/{challenge?.targetValue}</span>
    <span className="block text-sm text-slate-400 mt-1">
      Reward: {challenge?.rewardPoints} points
    </span>
  </div>
</AnimatedCard>
```

**Animations**:
- Card entrance: Slide up + fade in (300ms delay based on grid position)
- Progress ring fills with spring transition
- Timer pulses when <1 hour remaining

**Real-time Updates**:
- Listens to `mission-progress` SignalR event
- Updates progress ring smoothly

---

### LevelProgressWidget

**Responsibility**: Shows current level, XP progress, and next level requirements.

**Props**:
```typescript
interface LevelProgressWidgetProps {
  /** Level and XP data */
  levelData: LevelData;
}
```

**Structure**:
```tsx
<AnimatedCard>
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-4">
      <span className="text-3xl font-bold text-white">{levelData.currentLevel}</span>
    </div>
    <h3 className="text-lg font-semibold mb-2">Level {levelData.currentLevel}</h3>
    <ProgressBar progress={levelData.xpProgress} />
    <p className="text-sm text-slate-400 mt-2">
      {levelData.currentXP} / {levelData.xpToNextLevel} XP
    </p>
  </div>
</AnimatedCard>
```

**Animations**:
- Level-up: Particle explosion + scale pulse
- XP bar fills with spring transition
- Level badge rotates 360° on level-up

**Real-time Updates**:
- Listens to `level-up` SignalR event
- Triggers celebration animation (ParticleEffect)

---

### ActiveMissionsWidget

**Responsibility**: List of active missions with progress bars.

**Props**:
```typescript
interface ActiveMissionsWidgetProps {
  /** Active missions (max 5) */
  missions: Mission[];
  /** Callback when "View All" clicked */
  onViewAll: () => void;
}
```

**Structure**:
```tsx
<AnimatedCard>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Active Missions</h3>
    <button onClick={onViewAll} className="text-sm text-purple-400 hover:text-purple-300">
      View All →
    </button>
  </div>
  <div className="space-y-3">
    {missions.slice(0, 5).map(mission => (
      <MissionListItem key={mission.id} mission={mission} />
    ))}
  </div>
  {missions.length === 0 && <EmptyState message="No active missions" />}
</AnimatedCard>
```

**Sub-components**:
- `MissionListItem`: Single mission row with name, progress bar, and reward

**Real-time Updates**:
- Listens to `mission-progress` and `mission-complete` events
- Animates mission completion with slide-out + confetti

---

### RecentAchievementsWidget

**Responsibility**: Gallery of recently earned achievements with "New!" badges.

**Props**:
```typescript
interface RecentAchievementsWidgetProps {
  /** Recent achievements (last 5) */
  achievements: Achievement[];
}
```

**Structure**:
```tsx
<AnimatedCard>
  <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
  <div className="grid grid-cols-3 gap-4">
    {achievements.map(achievement => (
      <AchievementCard key={achievement.id} achievement={achievement} />
    ))}
  </div>
</AnimatedCard>
```

**Sub-components**:
- `AchievementCard`: Achievement icon with flip animation on hover, "New!" badge

**Animations**:
- Card flip: `rotateY: 180` on hover (600ms spring)
- "New!" badge pulses (scale 1.0 → 1.1 → 1.0 loop)

**Real-time Updates**:
- Listens to `achievement-earned` event
- Adds new achievement with slide-in animation

---

## Shared Components

### AnimatedCard

**Responsibility**: Reusable glassmorphism card wrapper with hover effects.

**Props**:
```typescript
interface AnimatedCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to animate on mount */
  animateOnMount?: boolean;
  /** Click handler (for interactive cards) */
  onClick?: () => void;
}
```

**Implementation**:
```tsx
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  animateOnMount = true,
  onClick
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (inView && animateOnMount && !shouldReduceMotion) {
      controls.start('visible');
    }
  }, [inView, controls, animateOnMount, shouldReduceMotion]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <m.div
      ref={ref}
      initial={animateOnMount && !shouldReduceMotion ? 'hidden' : 'visible'}
      animate={controls}
      variants={variants}
      whileHover={{ scale: 1.02, borderColor: 'rgba(168, 85, 247, 0.5)' }}
      className={`
        bg-slate-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6
        transition-all duration-150
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </m.div>
  );
};
```

**Accessibility**:
- If `onClick` provided, add `role="button"`, `tabIndex={0}`, `onKeyDown` handler

---

### ProgressRing

**Responsibility**: Circular progress indicator with customizable colors and sizes.

**Props**:
```typescript
interface ProgressRingProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Ring color theme */
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red';
  /** Whether to animate progress */
  animated?: boolean;
  /** Center content (e.g., percentage text) */
  children?: React.ReactNode;
}
```

**Implementation**:
```tsx
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = 'purple',
  animated = true,
  children
}) => {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const colorMap = {
    purple: '#9333EA',
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F97316',
    red: '#EF4444'
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: shouldReduceMotion ? offset : circumference - (progress / 100) * circumference
          }}
          transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};
```

**Animations**:
- Progress fills with spring transition (500ms)
- Completed rings (100%) pulse glow effect

---

### ParticleEffect

**Responsibility**: Celebration particle explosion for achievements and level-ups.

**Props**:
```typescript
interface ParticleEffectProps {
  /** Whether particles are active */
  active: boolean;
  /** Number of particles (max 50) */
  count?: number;
  /** Particle colors */
  colors?: string[];
  /** Callback when animation completes */
  onComplete?: () => void;
}
```

**Implementation**:
```tsx
export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  active,
  count = 30,
  colors = ['#9333EA', '#EC4899', '#F59E0B', '#10B981'],
  onComplete
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (!active || shouldReduceMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: Math.min(count, 50) }).map((_, i) => {
        const angle = (i / count) * 360;
        const distance = 100 + Math.random() * 100;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;

        return (
          <m.div
            key={i}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x,
              y,
              opacity: 0,
              scale: 0.5
            }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
              delay: Math.random() * 0.1
            }}
            onAnimationComplete={() => i === 0 && onComplete?.()}
          />
        );
      })}
    </div>
  );
};
```

**Performance**:
- Max 50 particles to prevent frame drops
- GPU-accelerated transforms (`x`, `y`, `scale`, `opacity`)
- Disabled when `prefers-reduced-motion` enabled

---

## Custom Hooks

### useTheme

**Responsibility**: Manages theme configuration and persistence.

```typescript
export const useTheme = () => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
    return stored ? JSON.parse(stored) : DEFAULT_THEME_CONFIG;
  });

  const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
    setThemeConfig(prev => {
      const newConfig = { ...prev, ...updates };
      validateThemeConfig(newConfig);
      localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(newConfig));
      return newConfig;
    });
  }, []);

  const resetTheme = useCallback(() => {
    setThemeConfig(DEFAULT_THEME_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
  }, []);

  return { themeConfig, updateTheme, resetTheme };
};
```

---

### useWidgetLayout

**Responsibility**: Manages widget layout with drag-and-drop and persistence.

```typescript
export const useWidgetLayout = () => {
  const [layout, setLayout] = useState<WidgetLayoutConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.WIDGET_LAYOUT);
    return stored ? JSON.parse(stored) : DEFAULT_WIDGET_LAYOUT;
  });

  const [editMode, setEditMode] = useState(false);

  const updateLayout = useDebouncedCallback((newLayout: WidgetLayoutConfig) => {
    validateWidgetLayoutConfig(newLayout);
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEYS.WIDGET_LAYOUT, JSON.stringify(newLayout));
  }, 500);

  const toggleWidgetVisibility = useCallback((widgetId: WidgetId) => {
    setLayout(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [widgetId]: !prev.visibility[widgetId]
      }
    }));
  }, []);

  const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
    setLayout(prev => {
      const newOrder = Array.from(prev.order);
      const [removed] = newOrder.splice(startIndex, 1);
      newOrder.splice(endIndex, 0, removed);
      return { ...prev, order: newOrder };
    });
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_WIDGET_LAYOUT);
    localStorage.removeItem(STORAGE_KEYS.WIDGET_LAYOUT);
  }, []);

  return {
    layout,
    editMode,
    setEditMode,
    updateLayout,
    toggleWidgetVisibility,
    reorderWidgets,
    resetLayout
  };
};
```

---

### useDashboardData

**Responsibility**: Aggregates data from all gamification services with SignalR updates.

```typescript
export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { connection } = useSignalR('/hubs/progress');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          level,
          missions,
          achievements,
          bonuses,
          miniGames,
          tournament,
          jackpot,
          // ... other services
        ] = await Promise.all([
          levelService.getLevel(),
          missionService.getMissions(),
          achievementService.getAchievements(),
          bonusService.getBonuses(),
          miniGameService.getMiniGames(),
          tournamentService.getTournament(),
          jackpotService.getJackpot(),
          // ... other service calls
        ]);

        setData({
          level,
          missions: missions.filter(m => !m.isCompleted),
          achievements: achievements.slice(0, 5),
          bonuses,
          miniGames,
          tournament,
          jackpot,
          // ... other data
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // SignalR event listeners
  useEffect(() => {
    if (!connection) return;

    connection.on('level-up', (payload) => {
      setData(prev => prev ? {
        ...prev,
        level: { ...prev.level, currentLevel: payload.newLevel }
      } : null);
    });

    connection.on('mission-progress', (payload) => {
      setData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          missions: prev.missions.map(m =>
            m.id === payload.missionId ? { ...m, progress: payload.progress } : m
          )
        };
      });
    });

    // ... other event listeners

    return () => {
      connection.off('level-up');
      connection.off('mission-progress');
      // ... cleanup other listeners
    };
  }, [connection]);

  return { data, loading, error, refetch: () => setData(null) };
};
```

---

## Testing Strategy

### Unit Tests (AAA Pattern, Single Assert)

**Component Rendering Tests**:
```typescript
describe('AnimatedCard', () => {
  describe('rendering', () => {
    it('should_render_children_when_provided', () => {
      // Arrange
      const testContent = 'Test Content';

      // Act
      render(<AnimatedCard>{testContent}</AnimatedCard>);

      // Assert
      expect(screen.getByText(testContent)).toBeInTheDocument();
    });

    it('should_apply_glassmorphism_classes_when_rendered', () => {
      // Arrange
      const { container } = render(<AnimatedCard>Content</AnimatedCard>);

      // Act
      const card = container.firstChild as HTMLElement;

      // Assert
      expect(card).toHaveClass('backdrop-blur-lg');
    });

    it('should_apply_custom_className_when_provided', () => {
      // Arrange
      const customClass = 'custom-test-class';
      const { container } = render(<AnimatedCard className={customClass}>Content</AnimatedCard>);

      // Act
      const card = container.firstChild as HTMLElement;

      // Assert
      expect(card).toHaveClass(customClass);
    });
  });

  describe('interactions', () => {
    it('should_call_onClick_when_card_clicked', () => {
      // Arrange
      const handleClick = jest.fn();
      render(<AnimatedCard onClick={handleClick}>Content</AnimatedCard>);

      // Act
      fireEvent.click(screen.getByText('Content'));

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should_have_button_role_when_onClick_provided', () => {
      // Arrange
      const handleClick = jest.fn();

      // Act
      const { container } = render(<AnimatedCard onClick={handleClick}>Content</AnimatedCard>);
      const card = container.firstChild as HTMLElement;

      // Assert
      expect(card).toHaveAttribute('role', 'button');
    });
  });

  describe('accessibility', () => {
    it('should_be_keyboard_accessible_when_onClick_provided', () => {
      // Arrange
      const handleClick = jest.fn();
      render(<AnimatedCard onClick={handleClick}>Content</AnimatedCard>);
      const card = screen.getByRole('button');

      // Act
      fireEvent.keyDown(card, { key: 'Enter' });

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should_respect_reduced_motion_when_user_preference_set', () => {
      // Arrange
      mockUseReducedMotion(true);

      // Act
      const { container } = render(<AnimatedCard>Content</AnimatedCard>);
      const card = container.firstChild as HTMLElement;

      // Assert
      expect(card).toHaveAttribute('data-no-animation', 'true');
    });
  });
});
```

**Hook Tests**:
```typescript
describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should_return_default_theme_when_no_stored_config', () => {
    // Arrange & Act
    const { result } = renderHook(() => useTheme());

    // Assert
    expect(result.current.themeConfig).toEqual(DEFAULT_THEME_CONFIG);
  });

  it('should_persist_theme_to_localStorage_when_updated', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());
    const newPreset: ThemeConfig['preset'] = 'ocean-blue';

    // Act
    act(() => {
      result.current.updateTheme({ preset: newPreset });
    });

    // Assert
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.THEME_CONFIG)!);
    expect(stored.preset).toBe(newPreset);
  });

  it('should_throw_error_when_invalid_theme_config_provided', () => {
    // Arrange
    const { result } = renderHook(() => useTheme());

    // Act & Assert
    expect(() => {
      act(() => {
        result.current.updateTheme({ preset: 'invalid-preset' as any });
      });
    }).toThrow(ValidationError);
  });
});
```

### Integration Tests

**Dashboard Data Aggregation**:
```typescript
describe('Dashboard data aggregation', () => {
  it('should_fetch_all_service_data_in_parallel_when_dashboard_loads', async () => {
    // Arrange
    const mockServices = setupMockServices();
    render(<DashboardPage />);

    // Act
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    // Assert
    expect(mockServices.levelService.getLevel).toHaveBeenCalledTimes(1);
    expect(mockServices.missionService.getMissions).toHaveBeenCalledTimes(1);
    // ... verify all services called
  });

  it('should_update_mission_progress_when_signalr_event_received', async () => {
    // Arrange
    const { emitSignalREvent } = setupMockSignalR();
    render(<DashboardPage />);
    await waitFor(() => screen.getByText('Active Missions'));

    // Act
    emitSignalREvent('mission-progress', { missionId: 1, progress: 75 });

    // Assert
    await waitFor(() => {
      const progressBar = screen.getByTestId('mission-1-progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });
  });
});
```

### E2E Tests (Playwright)

**Daily Challenge Flow**:
```typescript
test('should complete daily challenge and see celebration', async ({ page }) => {
  // Arrange
  await page.goto('/dashboard');
  await page.waitForSelector('[data-widget="daily-challenge"]');

  // Act
  await page.click('button:has-text("Complete Challenge")');

  // Assert
  await expect(page.locator('.particle-effect')).toBeVisible();
  await expect(page.locator('text=Challenge Complete!')).toBeVisible();
  await expect(page.locator('[data-widget="daily-challenge"] [data-progress="100"]')).toBeVisible();
});
```

**Theme Customization Flow**:
```typescript
test('should customize theme and persist selection', async ({ page }) => {
  // Arrange
  await page.goto('/dashboard');
  await page.click('[aria-label="Customize Theme"]');

  // Act
  await page.click('[data-preset="ocean-blue"]');
  await page.click('button:has-text("Save Theme")');

  // Assert
  await expect(page.locator('body')).toHaveClass(/bg-gradient-to-br from-blue-50/);

  // Verify persistence
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/bg-gradient-to-br from-blue-50/);
});
```

**Drag-and-Drop Widget Layout**:
```typescript
test('should reorder widgets via drag and drop', async ({ page }) => {
  // Arrange
  await page.goto('/dashboard');
  await page.click('[aria-label="Edit Layout"]');

  // Act
  const dailyChallenge = page.locator('[data-widget="daily-challenge"]');
  const levelProgress = page.locator('[data-widget="level-progress"]');
  await dailyChallenge.dragTo(levelProgress);
  await page.click('button:has-text("Save Layout")');

  // Assert
  const widgets = await page.locator('[data-widget]').all();
  const firstWidget = await widgets[0].getAttribute('data-widget');
  expect(firstWidget).toBe('level-progress');
});
```

---

## Performance Optimization

### Code Splitting

```typescript
// Lazy load widgets below the fold
const MiniGamesWidget = lazy(() => import('./widgets/MiniGamesWidget'));
const TournamentWidget = lazy(() => import('./widgets/TournamentWidget'));
const JackpotWidget = lazy(() => import('./widgets/JackpotWidget'));

// Lazy load Framer Motion
const LazyMotion = lazy(() => import('framer-motion').then(mod => ({ default: mod.LazyMotion })));
const domAnimation = lazy(() => import('framer-motion').then(mod => ({ default: mod.domAnimation })));
```

### Bundle Budget

| Component | Size (gzipped) | Notes |
|-----------|----------------|-------|
| DashboardLayout | 3KB | Core shell |
| AnimatedCard | 2KB | Shared component |
| ProgressRing | 3KB | Reused across widgets |
| ParticleEffect | 5KB | Lazy loaded |
| Framer Motion Core | 4.6KB | LazyMotion + domAnimation |
| All 14 Widgets | 80KB | Code-split by route |
| **Total (initial load)** | **<100KB** | Meets <150KB budget |

### Animation Performance

- All animations use GPU-accelerated properties: `transform`, `opacity`, `scale`
- Avoid animating `width`, `height`, `top`, `left` (causes reflow)
- Use `will-change` sparingly (memory overhead)
- Respect `prefers-reduced-motion` via `useReducedMotion()` hook
- Max 50 particles per celebration to maintain 60fps

---

## Accessibility Requirements

- **Keyboard Navigation**: All interactive elements accessible via Tab, Enter, Escape, Arrow keys
- **ARIA Attributes**: `role`, `aria-label`, `aria-live` for dynamic content
- **Color Contrast**: 4.5:1 (normal text), 3:1 (large text/UI components)
- **Focus Indicators**: Visible focus ring on all focusable elements
- **Screen Reader**: Announce widget updates, level-ups, achievements
- **Skip Links**: "Skip to main content" for keyboard users
- **Responsive Text**: Base font size 16px, scalable to 18px

---

## Notes

- All components use TypeScript strict mode with explicit types
- All state updates are immutable (spread operators, no mutations)
- All async operations have loading/error states
- All forms have validation and error messages
- All animations respect `prefers-reduced-motion`
