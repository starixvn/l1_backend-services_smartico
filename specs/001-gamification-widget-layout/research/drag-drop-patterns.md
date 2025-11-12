# Drag-and-Drop Widget Layout Research - Dashboard Implementation Guide

## Research Summary: React + Framer Motion Patterns

Based on analysis of Framer Motion documentation, react-grid-layout patterns, and modern dashboard implementations, here are the findings for your 14-widget responsive dashboard system.

---

## 1. PATTERN: Drag-and-Drop Approach

### Recommended Architecture: Hybrid Approach

**Option A: Framer Motion + Custom Grid (Lightweight)**
- Use Framer Motion's `drag` gesture on individual widgets
- Implement custom grid calculation logic
- Lowest bundle overhead, maximum control
- Best for: <=20 widgets, custom styling required

**Option B: react-grid-layout + Framer Motion (Balanced)**
- Use react-grid-layout for grid management, collision detection
- Layer Framer Motion for enhanced animations and visual feedback
- Handles responsive breakpoints automatically
- Best for: Dashboard with 10-20 widgets, standard behavior expected

**Option C: Custom React Hook + Framer Motion (Most Control)**
- Implement `useGridDrag` custom hook
- Handle drag state, snap-to-grid, collision detection
- Pair with Framer Motion for animations
- Best for: Highly custom implementations, pixel-perfect control

### For Your Use Case (14 widgets, 12-column grid):
**Recommendation: Option A + Option C Hybrid**
- Implement custom `useWidgetDrag` hook for grid positioning
- Use Framer Motion `drag` prop with constraints
- Maintain localStorage for persistence
- Scale pattern is proven on production dashboards (Notion, Linear, Figma)

---

## 2. FRAMER MOTION APIs: Essential Components

### Core APIs for Drag Implementation

```typescript
// Motion.div for draggable container
<motion.div
  drag                          // Enable dragging (x, y, or both)
  dragConstraints={{           // Limit drag boundaries
    top: 0,
    left: 0,
    right: containerWidth,
    bottom: containerHeight
  }}
  dragElastic={0.1}            // Tension on constraint boundaries
  dragMomentum={true}          // Inertial scrolling
  dragTransition={{            // Drag animation config
    power: 0,                    // No momentum on release
    restDelta: 0.001,           // Snap threshold
    modifyTarget: snapToGrid    // Custom snap function
  }}
  whileDrag={{                 // Styles during drag
    opacity: 0.8,
    scale: 1.02,
    zIndex: 50
  }}
  onDragStart={handleDragStart}
  onDragEnd={handleDragEnd}
/>
```

### Key Properties Breakdown:

| Property | Purpose | Your Use Case |
|----------|---------|---------------|
| `drag` | Enable dragging | `"x"` or `true` for both axes |
| `dragConstraints` | Boundary limits | Container bounds to prevent overflow |
| `dragElastic` | Boundary resistance (0-1) | `0` = no bounce, `0.1-0.3` = subtle bounce |
| `dragMomentum` | Inertial motion | `true` for natural feel (disable on mobile?) |
| `dragTransition` | Animation on release | `modifyTarget` for snap-to-grid |
| `whileDrag` | Visual feedback states | Scale, opacity, shadow changes |
| `onDragStart` / `onDragEnd` | Event handlers | Handle order updates, validation |
| `initial`/`animate` | State-based animations | Animate back to grid on invalid placement |

### Snap-to-Grid Implementation:

```typescript
const GRID_SIZE = 12; // 12-column system
const COLUMN_WIDTH = containerWidth / GRID_SIZE;

const snapToGrid = (value: number) => {
  return Math.round(value / COLUMN_WIDTH) * COLUMN_WIDTH;
};

const dragTransition = {
  power: 0,
  restDelta: 0.001,
  modifyTarget: (v: number) => snapToGrid(v)
};
```

### Visual Feedback Hooks:

```typescript
const [isDragging, setIsDragging] = useState(false);

<motion.div
  onDragStart={() => setIsDragging(true)}
  onDragEnd={() => setIsDragging(false)}
  whileDrag={{
    scale: 1.05,
    boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)', // purple glow
    zIndex: 50
  }}
  // For ghost element effect:
  initial={{ opacity: 1 }}
  animate={{ opacity: isDragging ? 0.5 : 1 }}
/>

// Snap-back animation if invalid position:
<AnimatePresence>
  {!isValidPosition && (
    <motion.div
      initial={{ x: 0, y: 0 }}
      animate={{ x: originalX, y: originalY }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    />
  )}
</AnimatePresence>
```

---

## 3. GRID MANAGEMENT: Handling Column Spans

### Grid System Design (12-column foundation):

```typescript
interface GridPosition {
  x: number;              // Column index (0-11)
  y: number;              // Row index (starting at 0)
  columnSpan: number;     // 1, 2, 3, 4, 6, 8, or 12 columns
  rowSpan: number;        // 1-3 rows typically
}

interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType;

  // Responsive breakpoints
  desktop: {
    columnSpan: number;   // Desktop span (e.g., 4 for 3-column layout)
    rowSpan: number;
  };
  tablet: {
    columnSpan: number;   // Tablet span (e.g., 6 for 2-column layout)
    rowSpan: number;
  };
  mobile: {
    columnSpan: number;   // Mobile span (12 for full width)
    rowSpan: number;
  };

  // Constraints
  minColSpan?: number;    // Minimum draggable width
  maxColSpan?: number;    // Maximum draggable width
  draggable?: boolean;    // Disable for pinned widgets

  // Position management
  position?: GridPosition;
}
```

### Responsive Grid Layout Algorithm:

```typescript
// Desktop: 12 columns, 3 visible
// Tablet: 12 columns, 2 visible
// Mobile: 12 columns, 1 visible (no drag)

function getColumnSpanForBreakpoint(
  config: WidgetConfig,
  breakpoint: 'desktop' | 'tablet' | 'mobile'
): number {
  return config[breakpoint].columnSpan;
}

// Calculate widget position in CSS Grid
function calculateGridPosition(
  widget: WidgetConfig,
  widgets: WidgetConfig[],
  containerWidth: number
) {
  const columnWidth = containerWidth / 12;
  const widthPx = columnWidth * widget.position!.columnSpan;

  return {
    gridColumn: `${widget.position!.x + 1} / span ${widget.position!.columnSpan}`,
    gridRow: `${widget.position!.y + 1} / span ${widget.position!.rowSpan}`,
    width: `${widthPx}px`
  };
}
```

### Collision Detection & Reflow:

```typescript
interface CollisionDetector {
  checkOverlap(widget1: GridPosition, widget2: GridPosition): boolean;
  findValidPosition(widget: WidgetConfig, targetX: number): GridPosition | null;
  reflowWidgets(widgets: WidgetConfig[]): WidgetConfig[];
}

class DashboardGridManager {
  private widgets: Map<string, WidgetConfig> = new Map();
  private gridSize = 12;

  checkOverlap(w1: GridPosition, w2: GridPosition): boolean {
    const horizontalOverlap =
      w1.x < w2.x + w2.columnSpan &&
      w1.x + w1.columnSpan > w2.x;

    const verticalOverlap =
      w1.y < w2.y + w2.rowSpan &&
      w1.y + w1.rowSpan > w2.y;

    return horizontalOverlap && verticalOverlap;
  }

  findValidPosition(draggedWidget: WidgetConfig, draggedX: number): GridPosition | null {
    // Snap X to nearest column
    const snappedColumn = Math.round(draggedX / this.columnWidth);

    // Check boundaries
    if (snappedColumn + draggedWidget.position!.columnSpan > 12) {
      return null; // Out of bounds
    }

    // Check collisions with other widgets
    const potentialPosition: GridPosition = {
      x: snappedColumn,
      y: draggedWidget.position!.y,
      columnSpan: draggedWidget.position!.columnSpan,
      rowSpan: draggedWidget.position!.rowSpan
    };

    for (const widget of this.widgets.values()) {
      if (widget.id !== draggedWidget.id &&
          this.checkOverlap(potentialPosition, widget.position!)) {
        return null; // Collision detected
      }
    }

    return potentialPosition;
  }
}
```

---

## 4. PERSISTENCE: localStorage Strategy

### Data Structure for Storage:

```typescript
interface WidgetLayoutConfig {
  version: 1;
  timestamp: number;
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  widgets: Array<{
    id: string;
    position: {
      x: number;
      y: number;
      columnSpan: number;
      rowSpan: number;
    };
    collapsed?: boolean;    // Collapse state
    hidden?: boolean;       // Visibility state
  }>;
}

// Key structure
const STORAGE_KEY = 'smartico:dashboard:layout:v1';

// Save layout
function saveWidgetLayout(layout: WidgetLayoutConfig) {
  try {
    const serialized = JSON.stringify(layout);
    localStorage.setItem(STORAGE_KEY, serialized);
    console.log('Layout saved successfully');
  } catch (e) {
    console.error('Failed to save layout (quota exceeded?):', e);
    // Fallback: try clearing old data and retry
  }
}

// Load layout
function loadWidgetLayout(): WidgetLayoutConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const layout: WidgetLayoutConfig = JSON.parse(stored);

    // Validate version compatibility
    if (layout.version !== 1) {
      console.warn('Layout version mismatch, using defaults');
      return null;
    }

    // Validate data integrity
    if (!Array.isArray(layout.widgets)) return null;

    return layout;
  } catch (e) {
    console.error('Failed to parse stored layout:', e);
    return null;
  }
}

// Custom Hook for persistence
function useWidgetLayout(initialLayout: WidgetLayoutConfig) {
  const [layout, setLayout] = useState<WidgetLayoutConfig>(() => {
    return loadWidgetLayout() || initialLayout;
  });

  // Debounce saves to avoid excessive writes
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const updateLayout = useCallback((newLayout: WidgetLayoutConfig) => {
    setLayout(newLayout);

    // Debounced save
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveWidgetLayout(newLayout);
    }, 1000); // Save 1s after last change
  }, []);

  useEffect(() => {
    return () => clearTimeout(saveTimeoutRef.current);
  }, []);

  return { layout, updateLayout };
}
```

### Migration & Versioning:

```typescript
function migrateLayout(stored: any): WidgetLayoutConfig | null {
  // Handle version upgrades
  switch (stored.version) {
    case undefined:
      // v0 (no version field) - legacy format
      return {
        version: 1,
        timestamp: Date.now(),
        breakpoint: 'desktop',
        widgets: stored.widgets || []
      };
    case 1:
      return stored as WidgetLayoutConfig;
    default:
      return null; // Unknown version
  }
}
```

---

## 5. VISUAL FEEDBACK: Ghost Elements & Handles

### Ghost Element Pattern (drag preview):

```typescript
<motion.div
  className="relative"
>
  {/* Placeholder while dragging */}
  <AnimatePresence>
    {isDragging && (
      <motion.div
        className="absolute inset-0 bg-purple-500/20 border-2 border-purple-400 rounded-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      />
    )}
  </AnimatePresence>

  {/* Actual draggable widget */}
  <motion.div
    drag
    whileDrag={{
      opacity: 0.6,
      zIndex: 50
    }}
  >
    {children}
  </motion.div>
</motion.div>
```

### Drag Handle Implementation:

```typescript
interface DraggableWidgetProps {
  children: React.ReactNode;
  onReorder: (newPosition: GridPosition) => void;
  isDragDisabled?: boolean;
  showHandle?: boolean;
}

export function DraggableWidget({
  children,
  onReorder,
  isDragDisabled = false,
  showHandle = true
}: DraggableWidgetProps) {
  const [position, setPosition] = useState<GridPosition>({ x: 0, y: 0, columnSpan: 4, rowSpan: 1 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (e: MouseEvent, info: DragHandlerEvent) => {
    setIsDragging(false);
    const newX = snapToGrid(info.offset.x);
    const newPosition: GridPosition = {
      ...position,
      x: newX / COLUMN_WIDTH
    };
    onReorder(newPosition);
  };

  return (
    <motion.div
      drag={!isDragDisabled}
      dragElastic={0.1}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
      className="relative"
    >
      {/* Drag Handle (optional visual indicator) */}
      {showHandle && !isDragDisabled && (
        <div className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVerticalIcon className="w-4 h-4 text-purple-400" />
        </div>
      )}

      {/* Widget Content */}
      <div className="glass-morphism rounded-lg p-4">
        {children}
      </div>
    </motion.div>
  );
}
```

### Drop Zone Feedback:

```typescript
function DropZoneFeedback({ isOver, isDragging }: { isOver: boolean; isDragging: boolean }) {
  return (
    <motion.div
      animate={{
        backgroundColor: isOver ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
        borderColor: isOver ? 'rgb(168, 85, 247)' : 'transparent'
      }}
      className="absolute inset-0 border-2 border-dashed rounded-lg pointer-events-none"
      transition={{ duration: 0.2 }}
    />
  );
}
```

---

## 6. TOUCH vs MOUSE EVENT HANDLING

### Key Differences & Implementation:

| Aspect | Mouse | Touch |
|--------|-------|-------|
| **Event Type** | `mousedown`, `mousemove`, `mouseup` | `touchstart`, `touchmove`, `touchend` |
| **Multi-point** | Single pointer | Multiple touches (e.g., pinch-to-zoom) |
| **Hover Effects** | Available | Not available (use `:active`) |
| **Precision** | High (pixel-level) | Lower (touch point radius ~40px) |
| **Momentum** | Manual implementation | Native browser behavior |
| **Delay** | Immediate | ~100ms tap delay (iOS) |
| **Draggable Handles** | Optional | **Recommended (larger touch targets)** |

### Unified Implementation:

```typescript
interface PointerEvent {
  clientX: number;
  clientY: number;
  pointerId?: string;
  isPrimary?: boolean;
}

function useDragGesture(
  ref: React.RefObject<HTMLDivElement>,
  onDrag: (delta: { x: number; y: number }) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore non-primary touch (e.g., second finger)
      if (e.isPrimary === false) return;

      startPositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
      setIsDragging(true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !startPositionRef.current) return;

      const delta = {
        x: e.clientX - startPositionRef.current.x,
        y: e.clientY - startPositionRef.current.y
      };

      onDrag(delta);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      startPositionRef.current = null;
    };

    element.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, onDrag]);

  return isDragging;
}

// Framer Motion handles this automatically with `drag` prop
// but you can customize for touch with:
<motion.div
  drag
  dragElastic={0}           // No momentum on mobile
  dragMomentum={isMobile ? false : true}
  whileTap={{ scale: 1.1 }} // Visual feedback for touch
/>
```

### Mobile Optimization:

```typescript
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export function DashboardGrid() {
  const [breakpoint, setBreakpoint] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const isTouch = isMobile();

  return (
    <div
      className={isTouch ? 'touch-manipulation' : ''}
      style={{
        touchAction: isTouch ? 'manipulation' : 'auto'
      }}
    >
      {/* Disable dragging on mobile */}
      {widgets.map(widget => (
        <DraggableWidget
          key={widget.id}
          isDragDisabled={breakpoint === 'mobile'}
          showHandle={isTouch}  // Show drag handle on touch devices
        >
          {/* Widget content */}
        </DraggableWidget>
      ))}
    </div>
  );
}
```

---

## 7. ACCESSIBILITY: Keyboard Alternatives

### Keyboard Navigation Implementation:

```typescript
interface KeyboardGridNav {
  // Arrow keys to move widgets
  // Enter/Space to toggle drag mode
  // Escape to cancel drag
}

function useKeyboardGridNav(selectedWidgetId: string | null) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedWidgetId) return;

    const widget = widgets.find(w => w.id === selectedWidgetId);
    if (!widget?.position) return;

    let newX = widget.position.x;
    let newY = widget.position.y;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newX = Math.max(0, newX - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newX = Math.min(12 - widget.position.columnSpan, newX + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newY = Math.max(0, newY - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newY = newY + 1; // Allow flexible height
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedWidgetId(null);
        break;
      default:
        return;
    }

    updateWidgetPosition(selectedWidgetId, { x: newX, y: newY });
  }, [selectedWidgetId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Widget with keyboard focus support
<motion.div
  tabIndex={0}
  role="button"
  aria-label={`${widget.title} - ${widget.position?.x + 1}, ${widget.position?.y + 1}`}
  onKeyDown={handleWidgetKeyDown}
  className={selectedWidgetId === widget.id ? 'ring-2 ring-purple-500' : ''}
>
  {children}
</motion.div>
```

### ARIA Labels & Roles:

```typescript
<motion.div
  drag
  role="region"
  aria-label="Dashboard widgets - drag to reorder or use arrow keys"
  aria-live="polite"
  aria-busy={isDragging}
>
  {widgets.map(widget => (
    <motion.div
      key={widget.id}
      drag
      role="button"
      tabIndex={0}
      aria-label={`${widget.title} widget at row ${widget.position?.y}, column ${widget.position?.x}`}
      aria-pressed={selectedWidgetId === widget.id}
      onFocus={() => setSelectedWidgetId(widget.id)}
      onBlur={() => setSelectedWidgetId(null)}
    >
      {children}
    </motion.div>
  ))}
</motion.div>
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Install Framer Motion: `npm install framer-motion`
- [ ] Create `useWidgetDrag` hook for grid positioning
- [ ] Implement `DashboardGridManager` class for collision detection
- [ ] Set up localStorage persistence with `useWidgetLayout` hook
- [ ] Create responsive breakpoint detection hook

### Phase 2: Core Interaction
- [ ] Implement draggable widget wrapper component
- [ ] Add snap-to-grid logic with `dragTransition.modifyTarget`
- [ ] Implement visual feedback (opacity, scale, shadow changes)
- [ ] Add ghost element placeholder during drag
- [ ] Test desktop, tablet, mobile layouts

### Phase 3: Polish & Accessibility
- [ ] Add keyboard navigation with arrow keys
- [ ] Implement ARIA labels and roles
- [ ] Add touch handle indicators
- [ ] Test mobile touch interactions (disable drag on mobile)
- [ ] Add animation feedback (snap-back, success states)

### Phase 4: Testing & Performance
- [ ] Performance: Test with 20+ widgets, measure frame rate
- [ ] Accessibility: Test with screen readers (NVDA, JAWS)
- [ ] Touch: Test on actual mobile devices
- [ ] localStorage: Verify persistence across sessions
- [ ] Responsive: Test breakpoint transitions

---

## 9. BUNDLE SIZE COMPARISON

| Approach | Bundle Size | Features | Learning Curve |
|----------|-------------|----------|-----------------|
| **Framer Motion only** | +33KB gzip | Basic drag, animations | Low |
| **react-grid-layout** | +25KB gzip | Full grid system, auto-reflow | Medium |
| **Framer + react-dnd** | +50KB gzip | Full ecosystem, touch support | High |
| **Custom + Framer** | +33KB gzip | Total control, minimal overhead | High |

**For your project: Framer Motion + Custom Grid Hook = 33KB + minimal custom code**

---

## 10. REFERENCE IMPLEMENTATIONS

### Popular Dashboards Using Similar Patterns:
- **Vercel Dashboard**: Framer Motion + CSS Grid, localStorage persistence
- **Linear Dashboard**: Custom grid with snap-to-grid, keyboard nav
- **Figma Board**: Infinite canvas with collision detection
- **Notion Workspace**: Widget stacking with dynamic height

### Open Source Examples:
- https://github.com/react-grid-layout/react-grid-layout (Full reference)
- https://github.com/atlassian/react-beautiful-dnd (Accessibility focus)
- Framer Motion official examples: framer.com/motion

