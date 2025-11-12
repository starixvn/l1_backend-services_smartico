# Drag-and-Drop Implementation Patterns - Quick Reference

## Structured Findings: Widget Layout with React + Framer Motion

### Pattern: Drag-and-Drop Approach
**Selected Architecture: Hybrid Custom Hook + Framer Motion**

- Custom `useWidgetDrag` hook manages grid positioning and collision detection
- Framer Motion handles drag gesture and animations
- Lightweight implementation: 33KB gzip (Framer Motion only)
- Recommended for 14-widget dashboard with responsive breakpoints

**Why this pattern for your project:**
1. Perfect widget count (<=20) for custom implementation
2. Full control over snap-to-grid behavior
3. Easy to integrate with localStorage
4. Minimal dependencies and bundle impact
5. Proven pattern on Notion, Linear, Figma dashboards

---

### Framer Motion APIs: Essential Hooks & Components

#### Primary API: motion.div with drag prop

```typescript
<motion.div
  drag="x"                           // Constrain to horizontal (x-axis only for horizontal grid movement)
  dragConstraints={{ left: 0, right: containerWidth }}
  dragElastic={0.1}                  // Subtle bounce on boundaries
  dragMomentum={false}               // No momentum (snap to grid)
  dragTransition={{
    power: 0,
    restDelta: 0.001,
    modifyTarget: (v) => snapToGrid(v)  // Custom snap function
  }}
  whileDrag={{
    scale: 1.02,
    opacity: 0.8,
    boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)'  // Royal Purple glow
  }}
  onDragStart={() => setIsDragging(true)}
  onDragEnd={(event, info) => handleWidgetDrop(info)}
/>
```

#### Key Properties for Your Use Case:

| Property | Purpose | Value for Dashboard |
|----------|---------|-------------------|
| `drag` | Enable axis | `"x"` (horizontal grid movement) or `true` (both) |
| `dragConstraints` | Boundary box | `{ left: 0, right: gridWidth }` |
| `dragElastic` | Boundary resistance | `0.1` (for subtle snap feel) |
| `dragMomentum` | Inertial motion | `false` (disable, snap immediately) |
| `dragTransition.modifyTarget` | Snap function | Round to nearest column position |
| `whileDrag` | Drag visual state | Scale 1.02, opacity 0.8, shadow |
| `onDragStart` | Drag initiated | Set `isDragging = true`, raise `zIndex` |
| `onDragEnd` | Drag released | Validate position, save to localStorage |

#### Animation Components for Visual Feedback:

```typescript
// Ghost element (placeholder during drag)
<AnimatePresence>
  {isDragging && (
    <motion.div
      className="absolute inset-0 bg-purple-500/20 border-2 border-purple-400 rounded-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    />
  )}
</AnimatePresence>

// Snap-back animation (invalid position)
<motion.div
  animate={isValidPosition ? {} : { x: originalX, y: originalY }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
/>
```

---

### Grid Management: Column Span & Responsive Handling

#### Data Structure:

```typescript
// Grid position in your system
interface GridPosition {
  x: number;              // Column 0-11
  y: number;              // Row index
  columnSpan: number;     // Width in columns (4, 6, 8, or 12)
  rowSpan: number;        // Height in rows (1-3)
}

// Widget configuration with responsive variants
interface WidgetConfig {
  id: string;
  title: string;
  component: React.ComponentType;

  desktop: { columnSpan: 4; rowSpan: 1 };   // 3-column layout (12/3=4)
  tablet: { columnSpan: 6; rowSpan: 1 };    // 2-column layout (12/2=6)
  mobile: { columnSpan: 12; rowSpan: 1 };   // Full width (no drag)

  position: GridPosition;  // Current position
  draggable: boolean;      // Disable on mobile
}
```

#### CSS Grid Implementation:

```typescript
// Container setup
<div
  style={{
    display: 'grid',
    gridTemplateColumns: `repeat(12, 1fr)`,
    gap: '1rem',
    gridAutoRows: 'auto',
    gridAutoFlow: 'dense'  // Fill gaps intelligently
  }}
>
  {widgets.map(widget => (
    <motion.div
      key={widget.id}
      style={{
        gridColumn: `${widget.position.x + 1} / span ${widget.position.columnSpan}`,
        gridRow: `${widget.position.y + 1} / span ${widget.position.rowSpan}`
      }}
      drag={widget.draggable}
      // ... drag handlers
    >
      {/* Widget content */}
    </motion.div>
  ))}
</div>
```

#### Snap-to-Grid Logic:

```typescript
const GRID_SIZE = 12;
const COLUMN_WIDTH = containerWidth / GRID_SIZE;

const snapToGrid = (pixelValue: number): number => {
  return Math.round(pixelValue / COLUMN_WIDTH) * COLUMN_WIDTH;
};

// In dragTransition:
dragTransition={{
  power: 0,
  restDelta: 0.001,
  modifyTarget: snapToGrid  // Snap horizontally to column edges
}}
```

#### Collision Detection:

```typescript
function checkCollision(
  position1: GridPosition,
  position2: GridPosition
): boolean {
  const horizontalOverlap =
    position1.x < position2.x + position2.columnSpan &&
    position1.x + position1.columnSpan > position2.x;

  const verticalOverlap =
    position1.y < position2.y + position2.rowSpan &&
    position1.y + position1.rowSpan > position2.y;

  return horizontalOverlap && verticalOverlap;
}
```

---

### Persistence: localStorage Strategy

#### Storage Format:

```typescript
interface DashboardLayout {
  version: 1;
  timestamp: number;
  breakpoint: 'desktop' | 'tablet' | 'mobile';
  widgets: Array<{
    id: string;
    position: { x: number; y: number; columnSpan: number; rowSpan: number };
    collapsed?: boolean;
  }>;
}

const STORAGE_KEY = 'smartico:dashboard:layout:v1';
```

#### Custom Hook for Persistence:

```typescript
function useWidgetLayout(defaultLayout: DashboardLayout) {
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultLayout;
    } catch {
      return defaultLayout;
    }
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const updateLayout = useCallback((newLayout: DashboardLayout) => {
    setLayout(newLayout);

    // Debounce saves (1s delay)
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
      } catch (e) {
        console.error('Failed to save layout:', e);
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(saveTimeoutRef.current);
  }, []);

  return { layout, updateLayout };
}
```

#### Usage in Component:

```typescript
export function DashboardGrid() {
  const { layout, updateLayout } = useWidgetLayout(DEFAULT_LAYOUT);

  const handleWidgetDrop = (widgetId: string, newPosition: GridPosition) => {
    const updatedLayout: DashboardLayout = {
      ...layout,
      timestamp: Date.now(),
      widgets: layout.widgets.map(w =>
        w.id === widgetId ? { ...w, position: newPosition } : w
      )
    };
    updateLayout(updatedLayout);
  };

  return (
    <div className="dashboard-grid">
      {/* Grid content with drag handlers */}
    </div>
  );
}
```

---

### Visual Feedback: Ghost Elements & Drag Handles

#### Ghost Element Pattern:

```typescript
<motion.div className="relative">
  {/* Placeholder grid cell shows during drag */}
  <AnimatePresence>
    {isDragging && (
      <motion.div
        className="absolute inset-0 bg-purple-500/20 border-2 border-purple-400 border-dashed rounded-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        pointerEvents="none"
      />
    )}
  </AnimatePresence>

  {/* Actual draggable widget */}
  <motion.div
    drag={!disabled}
    whileDrag={{
      scale: 1.05,
      opacity: 0.7,
      boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)',
      zIndex: 50
    }}
  >
    {children}
  </motion.div>
</motion.div>
```

#### Drag Handle Component:

```typescript
function DragHandle() {
  return (
    <div className="absolute top-3 left-3 cursor-grab active:cursor-grabbing">
      <svg
        className="w-4 h-4 text-purple-400/60 group-hover:text-purple-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        {/* Hamburger/grip icon */}
        <line x1="3" y1="5" x2="21" y2="5" strokeWidth="2" />
        <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
        <line x1="3" y1="19" x2="21" y2="19" strokeWidth="2" />
      </svg>
    </div>
  );
}

// In widget:
{canDrag && <DragHandle />}
```

#### Drop Zone Feedback:

```typescript
<motion.div
  animate={{
    backgroundColor: isDraggedOver ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
    borderColor: isDraggedOver ? 'rgb(168, 85, 247)' : 'transparent'
  }}
  className="absolute inset-0 border-2 border-dashed rounded-lg pointer-events-none"
/>
```

---

### Touch vs Mouse: Unified Handler

#### Pointer Events (unified approach):

```typescript
function useDragHandler(ref: React.RefObject<HTMLDivElement>) {
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.isPrimary === false) return; // Ignore secondary touches

      startPos.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !startPos.current) return;

      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;

      // Handle drag delta
      onDragMove?.({ x: dx, y: dy });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      startPos.current = null;
    };

    el.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);
}
```

#### Mobile Optimization:

```typescript
// Disable drag on mobile, disable momentum
<motion.div
  drag={breakpoint !== 'mobile'}  // Disable drag on mobile
  dragMomentum={false}             // Always snap-to-grid
  dragElastic={isMobile ? 0 : 0.1} // Less bounce on touch
  onTouchStart={(e) => {
    // Optional: provide haptic feedback
    navigator.vibrate?.([10, 20, 10]);
  }}
  style={{ touchAction: 'manipulation' }}
/>
```

---

### Accessibility: Keyboard & Screen Readers

#### Keyboard Navigation:

```typescript
function useKeyboardDragNav(selectedId: string | null) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedId) return;

    const widget = widgets.find(w => w.id === selectedId);
    if (!widget?.position) return;

    let newX = widget.position.x;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newX = Math.max(0, newX - 1);
        updatePosition(selectedId, { ...widget.position, x: newX });
        break;
      case 'ArrowRight':
        e.preventDefault();
        newX = Math.min(12 - widget.position.columnSpan, newX + 1);
        updatePosition(selectedId, { ...widget.position, x: newX });
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedId(null);
        break;
    }
  }, [selectedId]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

#### ARIA Labels:

```typescript
<motion.div
  drag
  role="region"
  aria-label="Dashboard grid - reorder widgets by dragging or use arrow keys"
  aria-live="polite"
  aria-busy={isDragging}
>
  {widgets.map(w => (
    <motion.div
      key={w.id}
      tabIndex={0}
      role="button"
      aria-label={`${w.title} widget, column ${w.position.x + 1}, row ${w.position.y + 1}`}
      aria-pressed={selectedId === w.id}
      onFocus={() => setSelectedId(w.id)}
    >
      {/* Widget */}
    </motion.div>
  ))}
</motion.div>
```

---

## Quick Implementation Checklist

- [ ] Install Framer Motion: `npm install framer-motion`
- [ ] Create `useWidgetLayout` hook for localStorage persistence
- [ ] Create `DashboardGridManager` class for collision detection
- [ ] Implement snap-to-grid function with COLUMN_WIDTH calculation
- [ ] Build `DraggableWidget` wrapper component with Framer Motion
- [ ] Add ghost element with `AnimatePresence`
- [ ] Implement drag handle with visual indicator
- [ ] Test on desktop (mouse), tablet (touch), mobile (read-only)
- [ ] Add keyboard navigation support
- [ ] Add ARIA labels and roles
- [ ] Verify localStorage persistence across sessions
- [ ] Test responsive breakpoint transitions

---

## Bundle Impact

- **Framer Motion**: +33KB gzip (already optimized library)
- **Custom hooks & utilities**: ~5-10KB additional code
- **Total overhead**: ~40-45KB gzip (acceptable for dashboard feature)

