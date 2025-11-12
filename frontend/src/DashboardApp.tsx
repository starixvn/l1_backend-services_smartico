/**
 * DashboardApp - Standalone entry point for new dashboard
 *
 * To use this dashboard, update main.tsx to import DashboardApp instead of App:
 *
 * import { DashboardApp } from './DashboardApp'
 *
 * root.render(
 *   <StrictMode>
 *     <DashboardApp />
 *   </StrictMode>,
 * )
 */

import { DashboardLayout } from './components/dashboard/layout';
import { DashboardProvider } from './contexts';
import {
  DailyChallengeWidget,
  LevelProgressWidget,
  ActiveMissionsWidget,
  RecentAchievementsWidget,
  LeaderboardWidget,
} from './components/dashboard/widgets';

export function DashboardApp() {
  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Dashboard">
        <div className="space-y-6">
          {/* Top Row: Daily Challenge + Level Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DailyChallengeWidget />
            <LevelProgressWidget />
          </div>

          {/* Middle Row: Active Missions (full width) */}
          <ActiveMissionsWidget />

          {/* Bottom Row: Achievements + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentAchievementsWidget />
            <LeaderboardWidget />
          </div>

          {/* Implementation Status */}
          <div className="glass-dark-subtle p-6 rounded-xl border border-blue-500/30">
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span>✨</span> Implementation Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-green-400 mb-2">✅ Completed</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Phase 1: Foundation & type system</li>
                  <li>• Phase 2: Layout shell & navigation</li>
                  <li>• Custom hooks (theme, layout, animations)</li>
                  <li>• Context providers (global state)</li>
                  <li>• Testing infrastructure (Vitest)</li>
                  <li>• Royal Purple glassmorphism theme</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-yellow-400 mb-2">⏳ In Progress</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Phase 3: Shared components</li>
                  <li>• Phase 4-5: 14 interactive widgets</li>
                  <li>• Phase 6: Widget grid layout</li>
                  <li>• Phase 7: Theme customization</li>
                  <li>• Phase 8: Animations & polish</li>
                  <li>• Phase 9-10: Testing & deployment</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="glass-dark-subtle p-6 rounded-xl border border-green-500/30">
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span>📖</span> How to Use This Dashboard
            </h4>
            <div className="text-gray-300 text-sm space-y-3">
              <p>
                <strong className="text-white">Current View:</strong> This is the new Gamification Widget Layout
                built with React 19, TypeScript, TailwindCSS, and Framer Motion.
              </p>
              <p>
                <strong className="text-white">Navigation:</strong> Use the sidebar menu on the left to navigate
                between different sections. Try the keyboard shortcuts (Arrow keys, Enter, Escape).
              </p>
              <p>
                <strong className="text-white">Mobile:</strong> On mobile devices, tap the hamburger menu (☰)
                in the top header to open the sidebar.
              </p>
              <p>
                <strong className="text-white">Features:</strong> Notice the glassmorphism design, smooth
                animations, and Royal Purple color scheme. All components are accessible and responsive.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
}
