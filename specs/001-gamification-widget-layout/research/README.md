# Drag-and-Drop Widget Layout Research - Navigation Guide

## Overview

This research directory contains comprehensive findings on implementing drag-and-drop widget layout functionality for your 14-widget dashboard with React and Framer Motion.

**Total Content:** 75KB of detailed patterns, code examples, and implementation strategies

---

## Document Guide

### 1. **RESEARCH-SUMMARY.md** - Start Here (16KB)
**Best for:** Quick overview and decision-making

Contains:
- Executive summary of all research tasks
- Key findings by topic with code snippets
- Implementation recommendation (Hybrid Custom Hook + Framer Motion)
- Architecture decision matrix
- Critical implementation details
- Phase-based implementation plan
- FAQs and success criteria

**Read time:** 15-20 minutes

---

### 2. **drag-drop-patterns.md** - Deep Dive (22KB)
**Best for:** Understanding all design patterns and theory

Contains:
- Detailed analysis of 3 architectural approaches
- Framer Motion API reference with examples
- Grid management algorithms and collision detection
- localStorage persistence strategies with versioning
- Visual feedback implementation patterns
- Touch vs mouse event handling comparison table
- Accessibility patterns with keyboard navigation
- Implementation checklist (4 phases)
- Bundle size comparison
- Reference implementations from production dashboards

**Read time:** 30-40 minutes

---

### 3. **implementation-patterns.md** - Quick Reference (14KB)
**Best for:** Copy-paste code snippets and patterns

Contains:
- Structured findings in table format
- Core Framer Motion API with usage examples
- Grid management code snippets
- localStorage hook implementation
- Visual feedback patterns
- Touch/mouse unified handler
- Keyboard navigation code
- Quick implementation checklist
- Bundle impact summary

**Read time:** 20-25 minutes

---

### 4. **complete-example.md** - Full Working Code (23KB)
**Best for:** Ready-to-use implementation examples

Contains:
- Complete TypeScript type definitions
- All custom hooks with full implementations:
  - `useWidgetLayout` (localStorage)
  - `useGridDrag` (positioning & collision)
  - `useResponsiveBreakpoint` (breakpoints)
- `DashboardGridManager` class (collision detection)
- `DraggableWidget` component (fully featured)
- `DashboardGrid` container component
- Configuration example
- Usage in DashboardPage
- Best practices throughout

**Read time:** 30-35 minutes
**Implementation time:** 2-3 hours to integrate

---

## Quick Start Path

### If you have 5 minutes:
1. Read RESEARCH-SUMMARY.md first section only
2. Scan the "Architecture Decision Matrix"
3. Check "Implementation Recommendations" timeline

### If you have 30 minutes:
1. Read RESEARCH-SUMMARY.md completely
2. Skim drag-drop-patterns.md sections 1-3
3. Check implementation-patterns.md for code snippets

### If you have 1-2 hours:
1. Read RESEARCH-SUMMARY.md (20 min)
2. Read drag-drop-patterns.md completely (40 min)
3. Review complete-example.md code (30 min)
4. Plan integration with your codebase (10 min)

### If you're implementing:
1. Use complete-example.md as template
2. Reference implementation-patterns.md for specific patterns
3. Consult drag-drop-patterns.md for architecture questions
4. Use RESEARCH-SUMMARY.md for critical details checklist

---

## Key Findings Summary

### Selected Architecture: Hybrid Custom Hook + Framer Motion

**Why?**
- Perfect for 14 widgets (10-20 widget sweet spot)
- Bundle size: +40-45KB gzip (acceptable)
- Full control over snap-to-grid behavior
- Proven pattern on Notion, Linear, Figma
- Aligns with React 19 + Framer Motion approach

**Core Technologies:**
- Framer Motion for drag gestures and animations
- Custom React hooks for grid positioning
- CSS Grid for layout foundation
- localStorage for persistence

---

## Research Questions Addressed

✓ **Question 1**: Find Framer Motion drag-and-drop patterns for grid layouts
- Answer: In drag-drop-patterns.md § 1-2 and complete-example.md

✓ **Question 2**: Find strategies for handling responsive grid reorganization
- Answer: In drag-drop-patterns.md § 3 and implementation-patterns.md § 3

✓ **Question 3**: Find localStorage persistence patterns for widget order
- Answer: In drag-drop-patterns.md § 4 and complete-example.md hooks

✓ **Question 4**: Find snap-to-grid implementation with Framer Motion
- Answer: In drag-drop-patterns.md § 2 (Snap-to-Grid Implementation)

✓ **Question 5**: Find visual feedback patterns (ghost element, drag handles)
- Answer: In drag-drop-patterns.md § 5 and complete-example.md components

✓ **Question 6**: Find touch vs mouse event handling differences
- Answer: In drag-drop-patterns.md § 6 and implementation-patterns.md § Touch

---

## Structured Findings: Key Takeaways

### Pattern: Drag-and-Drop Approach
**Selected:** Hybrid Custom Hook + Framer Motion

```typescript
<motion.div
  drag="x"
  dragTransition={{ power: 0, modifyTarget: snapToGrid }}
  whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)' }}
/>
```

### Framer Motion APIs
**Essential:** `drag`, `dragConstraints`, `dragElastic`, `dragTransition`, `whileDrag`, `onDragEnd`

See: implementation-patterns.md § 2 for detailed reference table

### Grid Management
**System:** 12-column grid with collision detection

```typescript
interface GridPosition {
  x: number;              // Column 0-11
  y: number;              // Row index
  columnSpan: number;     // Width (4, 6, 12)
  rowSpan: number;        // Height
}
```

### Persistence
**Strategy:** localStorage with debounced saves (1s delay)

Key: `smartico:dashboard:layout:v1` with version control

### Snap-to-Grid
**Implementation:**
```typescript
const COLUMN_WIDTH = containerWidth / 12;
const snapToGrid = (px) => Math.round(px / COLUMN_WIDTH) * COLUMN_WIDTH;
```

### Visual Feedback
**Features:**
- Ghost element (semi-transparent placeholder)
- Drag handle (grip icon, 32x32px)
- Scale 1.02x + purple glow during drag
- Spring animation on snap-back
- Invalid position indicator (red dashed border)

### Touch vs Mouse
**Key Difference:** Touch needs larger hit targets (44x44px min)

**Solution:** Disable drag on mobile, show handle on tablet

### Accessibility
**Support:**
- Arrow keys for movement (Arrow Left/Right/Up/Down)
- Escape to deselect
- ARIA labels with position announcements
- Focus indicators (ring-2 ring-purple-500)

---

## Implementation Timeline

| Phase | Duration | Tasks | Docs |
|-------|----------|-------|------|
| **Foundation** | 1-2 days | Setup hooks, types, manager class | complete-example.md: sections 1-3 |
| **Core Interaction** | 2-3 days | Drag component, snap-to-grid, feedback | implementation-patterns.md + complete-example.md: section 4-5 |
| **Polish & A11y** | 1-2 days | Handles, keyboard nav, ARIA | drag-drop-patterns.md § 7 |
| **Testing & Deploy** | 1-2 days | Performance, accessibility, mobile | RESEARCH-SUMMARY.md: Testing section |

**Total: 5-9 days for full implementation**

---

## Code Files to Create

Based on complete-example.md:

```
src/
├── hooks/
│   ├── useWidgetLayout.ts           (50 lines)
│   ├── useGridDrag.ts               (120 lines)
│   └── useResponsiveBreakpoint.ts   (30 lines)
├── services/
│   └── DashboardGridManager.ts      (100 lines)
├── components/
│   ├── DraggableWidget.tsx          (150 lines)
│   └── DashboardGrid.tsx            (120 lines)
├── types/
│   └── dashboard.ts                 (80 lines)
├── config/
│   └── widgetConfig.ts              (50 lines)
└── pages/
    └── DashboardPage.tsx            (40 lines)
```

**Total: ~700 lines of TypeScript code**

---

## Critical Implementation Checklist

### Before You Start
- [ ] Read RESEARCH-SUMMARY.md
- [ ] Review complete-example.md § 1-2 (types & hooks)
- [ ] Understand 12-column grid math

### During Implementation
- [ ] Column width calculation: `containerWidth / 12`
- [ ] Debounced saves: 1 second delay
- [ ] Collision detection: Horizontal AND vertical overlap
- [ ] Mobile optimization: Disable drag on mobile breakpoint
- [ ] Error handling: localStorage quota exceeded

### After Implementation
- [ ] Test desktop dragging (60fps)
- [ ] Test tablet touch (44px+ targets)
- [ ] Test mobile read-only layout
- [ ] Verify localStorage persistence
- [ ] Check keyboard navigation
- [ ] Validate ARIA labels with screen reader

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Bundle Size | <50KB gzip | Framer Motion + custom code |
| Drag FPS | 60fps | Should feel smooth |
| Lighthouse | 90+ | Performance score |
| First Contentful Paint | <1.5s | Spec requirement |
| Time to Interactive | <3s | Spec requirement |

---

## Troubleshooting Guide

### Issue: Widgets overlapping after drag
**Solution:** Check collision detection in DashboardGridManager.checkOverlap()
- Ensure horizontal AND vertical overlap both checked
- See: drag-drop-patterns.md § 3 (Collision Detection)

### Issue: Drag doesn't snap to grid
**Solution:** Verify snap function and dragTransition.modifyTarget
- Ensure columnWidth calculated correctly
- Check: `Math.round(px / columnWidth) * columnWidth`
- See: implementation-patterns.md § Snap-to-Grid

### Issue: localStorage not persisting
**Solution:** Add error handling and check browser quota
- Catch quota exceeded errors
- Validate JSON parsing
- See: complete-example.md § useWidgetLayout

### Issue: Mobile layout broken
**Solution:** Check responsive breakpoint detection
- Verify breakpoint transitions
- Ensure drag disabled on mobile: `drag={breakpoint !== 'mobile'}`
- See: implementation-patterns.md § Mobile Optimization

### Issue: Touch targets too small
**Solution:** Increase hit area for touch devices
- Drag handle minimum: 44x44px
- Use pointer events instead of mouse-specific
- See: drag-drop-patterns.md § 6 (Touch Handling)

---

## Related Documentation

- **Main Spec:** `/specs/001-gamification-widget-layout/spec.md`
- **Project Plan:** `/specs/001-gamification-widget-layout/plan.md`
- **Constitution:** `.claude/constitution.md` (if exists)

---

## Questions or Clarifications?

This research provides answers to:

1. ✓ Framer Motion drag-and-drop patterns (drag-drop-patterns.md § 1-2)
2. ✓ Responsive grid reorganization (drag-drop-patterns.md § 3)
3. ✓ localStorage persistence (drag-drop-patterns.md § 4)
4. ✓ Snap-to-grid implementation (implementation-patterns.md § Snap-to-Grid)
5. ✓ Visual feedback patterns (drag-drop-patterns.md § 5)
6. ✓ Touch vs mouse handling (implementation-patterns.md § Touch)

Plus:
- ✓ Accessibility patterns (drag-drop-patterns.md § 7)
- ✓ Architecture comparison (RESEARCH-SUMMARY.md)
- ✓ Complete working examples (complete-example.md)
- ✓ Phase-based implementation plan (RESEARCH-SUMMARY.md)

---

## Next Steps

1. **Read:** Start with RESEARCH-SUMMARY.md (15 min)
2. **Understand:** Review complete-example.md § 1-3 types and hooks (20 min)
3. **Plan:** Check implementation timeline and checklist (10 min)
4. **Implement:** Follow complete-example.md as template (2-3 hours)
5. **Test:** Run through testing checklist (1-2 hours)
6. **Deploy:** Verify all success criteria met

**Total time to production-ready:** 5-9 days

---

## Document Statistics

| Document | Size | Sections | Code Examples |
|----------|------|----------|----------------|
| RESEARCH-SUMMARY.md | 16KB | 14 sections | 8 examples |
| drag-drop-patterns.md | 22KB | 10 sections | 25+ examples |
| implementation-patterns.md | 14KB | 7 sections | 20+ snippets |
| complete-example.md | 23KB | 6 sections | 6 files worth |
| **Total** | **75KB** | **37** | **50+** |

---

## Last Updated

Created: 2025-11-12
Research Scope: React + Framer Motion for 14-widget dashboard
Target Audience: Full-stack development team
Expertise Level: Intermediate to Advanced React

