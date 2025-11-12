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

export function DashboardApp() {
  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Dashboard">
        {/* Placeholder content - widgets will be added in Phase 4 & 5 */}
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="glass-dark-strong p-8 rounded-xl border border-purple-500/50 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
            <h2 className="text-3xl font-bold text-white mb-3">
              Welcome to Your Dashboard! 🎮
            </h2>
            <p className="text-gray-300 text-lg">
              Track your progress, complete missions, and earn rewards!
            </p>
          </div>

          {/* Widget Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Widget Cards */}
            {[
              { title: '🎯 Daily Challenge', desc: 'Complete today\'s challenges', color: 'purple' },
              { title: '⭐ Level Progress', desc: 'Track your level advancement', color: 'blue' },
              { title: '📋 Active Missions', desc: 'View your current missions', color: 'green' },
              { title: '🏆 Recent Achievements', desc: 'See your latest wins', color: 'yellow' },
              { title: '📊 Leaderboard', desc: 'Compare with other players', color: 'red' },
              { title: '🎁 Bonus Tracker', desc: 'Available bonuses & rewards', color: 'pink' },
              { title: '🎮 Mini Games', desc: 'Play games to win prizes', color: 'indigo' },
              { title: '🎰 Jackpot', desc: 'Current jackpot pool', color: 'orange' },
              { title: '📅 Reward Calendar', desc: 'Daily login rewards', color: 'teal' },
            ].map((widget, index) => (
              <div
                key={index}
                className="glass-dark p-6 rounded-xl border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group"
              >
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  {widget.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {widget.desc}
                </p>
                <div className="h-32 bg-slate-700/30 rounded-lg flex items-center justify-center border border-slate-600/30">
                  <span className="text-gray-500 text-sm">Coming in Phase 4 & 5</span>
                </div>
              </div>
            ))}
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
