# SabaONE Gamification Platform

A comprehensive gamification platform with a modern, customizable dashboard featuring real-time updates, theme customization, and 14 specialized widgets.

## Features

### 🎮 Gamification Dashboard

- **14 Interactive Widgets**: Track missions, achievements, leaderboards, bonuses, and more
- **Theme Customization**: 6 preset themes + custom color picker with WCAG AA validation
- **Layout Controls**: Show/hide widgets, customize your dashboard experience
- **Real-time Updates**: SignalR integration for live progress tracking (planned)
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Smooth Animations**: Spring-based physics animations with accessibility support

### 🎨 Customization

- **Theme Presets**: Royal Purple, Ocean Blue, Neon Cyber, Nature Zen, Sunset Orange
- **Light/Dark Mode**: Toggle between themes
- **Font Sizes**: 14px, 16px, 18px options
- **Animation Control**: None, subtle, moderate, energetic
- **Import/Export**: Share and backup your theme configurations

### 📊 Widget Gallery

1. **Daily Challenge** - Today's mission with countdown timer
2. **Level Progress** - XP tracking with circular progress ring
3. **Active Missions** - Ongoing missions and rewards
4. **Recent Achievements** - Unlocked achievements showcase
5. **Leaderboard** - Top players and your rank
6. **Bonus Tracker** - Active bonuses to claim
7. **Personal Goals** - User-defined goals tracking
8. **Streak Tracker** - Daily login streak calendar
9. **Reward Calendar** - Monthly login rewards
10. **VIP Status** - Tier progress and benefits
11. **Jackpot** - Jackpot pool and tickets
12. **Tournament** - Active tournament standings
13. **Mini Games** - Available games to play
14. **Activity Feed** - Recent activity timeline

## Project Structure

```
smartico/
├── frontend/                  # React dashboard application
│   ├── src/
│   │   ├── components/
│   │   │   └── dashboard/    # Dashboard components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript type definitions
│   │   ├── contexts/         # React context providers
│   │   └── styles/           # Global styles and themes
│   ├── docs/                 # Documentation
│   │   ├── USER_GUIDE.md    # User customization guide
│   │   └── DEVELOPER_GUIDE.md # Developer reference
│   ├── DASHBOARD.md          # Dashboard feature documentation
│   └── package.json
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- **Node.js**: 20.19+ or 22.12+
- **npm**: 10+
- **Git**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://git3.nexdev.net/l1/backend-services/smartico.git
   cd smartico
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
cd frontend
npm run build
```

Build output: `frontend/dist/`

## Documentation

### For Users

- **[User Guide](./frontend/docs/USER_GUIDE.md)** - Learn how to customize themes and layouts
- **[Dashboard Overview](./frontend/DASHBOARD.md)** - Complete feature documentation

### For Developers

- **[Developer Guide](./frontend/docs/DEVELOPER_GUIDE.md)** - Technical reference for developers
- **[Dashboard README](./frontend/DASHBOARD.md)** - Architecture and API integration guide

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.6+ | Type safety |
| Vite | 7.1 | Build tool + dev server |
| TailwindCSS | 3.4 | Utility-first styling |
| Framer Motion | 11 | Declarative animations |
| SignalR | - | Real-time updates (planned) |

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing (planned)
- **Playwright** - E2E testing (planned)

## Development Workflow

### Running the Dashboard

1. **Update entry point** (`frontend/src/main.tsx`):
   ```tsx
   import { DashboardApp } from './DashboardApp'

   root.render(
     <StrictMode>
       <DashboardApp />
     </StrictMode>,
   )
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Access dashboard**:
   ```
   http://localhost:5173
   ```

### Creating a New Widget

See the [Developer Guide](./frontend/docs/DEVELOPER_GUIDE.md#creating-widgets) for step-by-step instructions.

Quick overview:
1. Create widget component in `frontend/src/components/dashboard/widgets/`
2. Define widget type in `frontend/src/types/dashboard/widgets.ts`
3. Add mock data in `frontend/src/hooks/useDashboardData.ts`
4. Register widget in `frontend/src/components/dashboard/WidgetGrid.tsx`
5. Add metadata in `frontend/src/components/dashboard/LayoutCustomizer.tsx`

### Git Workflow

**Branch naming:**
- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-type` - Documentation updates
- `refactor/component-name` - Code refactoring

**Commit messages** (Conventional Commits):
```
feat: add new streak tracker widget
fix: resolve theme persistence issue
docs: update developer guide with API integration
refactor: simplify theme hook logic
test: add unit tests for theme system
```

## Roadmap

### Phase 1-8: Dashboard Foundation ✅ Completed
- [x] 14 dashboard widgets
- [x] Theme customization system
- [x] Layout management
- [x] Animations and polish
- [x] Full theme integration across all widgets

### Phase 9: Testing & QA (In Progress)
- [ ] Unit tests (80%+ coverage)
- [ ] E2E tests with Playwright
- [ ] Accessibility audit (WCAG AA)
- [ ] Performance testing
- [ ] Cross-browser testing

### Phase 10: Backend Integration (Planned)
- [ ] Replace mock data with SabaONE API
- [ ] SignalR real-time updates
- [ ] Error handling and retry logic
- [ ] Loading states optimization
- [ ] API response caching

### Phase 11: Deployment (Planned)
- [ ] Production build optimization
- [ ] CI/CD pipeline setup
- [ ] Staging environment deployment
- [ ] Production deployment
- [ ] Monitoring and analytics

### Future Enhancements
- [ ] Toast notifications for actions
- [ ] Undo/redo for layout changes
- [ ] Keyboard shortcuts
- [ ] Widget drag-and-drop reordering
- [ ] Additional theme presets
- [ ] Mobile app (React Native)

## Performance

**Current Build Stats:**
- Bundle Size: 433.13 KB
- Gzipped: 124.71 KB
- Build Time: ~3s
- TypeScript Errors: 0

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow code style**: ESLint + Prettier
3. **Write tests**: Unit tests for new features
4. **Update docs**: Keep documentation current
5. **Submit PR**: Use PR template, describe changes clearly

See [Developer Guide](./frontend/docs/DEVELOPER_GUIDE.md) for detailed development instructions.

## License

This project is part of the SabaONE gamification platform.

## Support

- **Issues**: Report bugs and feature requests on [GitLab Issues](https://git3.nexdev.net/l1/backend-services/smartico/-/issues)
- **Documentation**: See `/frontend/docs/` for detailed guides
- **Contact**: SabaONE support team

## Acknowledgments

Built with:
- React team for the amazing framework
- Tailwind Labs for TailwindCSS
- Framer for Framer Motion
- Vite team for lightning-fast builds

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
