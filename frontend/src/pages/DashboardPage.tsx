/**
 * DashboardPage - New Gamification Widget Layout
 * Access this page to see the new Royal Purple glassmorphism dashboard.
 */

import { DashboardLayout } from '../components/dashboard/layout';
import { DashboardProvider } from '../contexts';

/**
 * DashboardPage component.
 * Demonstrates the new dashboard layout with widgets.
 */
export function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Dashboard">
        {/* Placeholder content - widgets will be added in Phase 4 & 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder Widget Cards */}
          {[
            { title: 'Daily Challenge', color: 'purple' },
            { title: 'Level Progress', color: 'blue' },
            { title: 'Active Missions', color: 'green' },
            { title: 'Recent Achievements', color: 'yellow' },
            { title: 'Leaderboard', color: 'red' },
            { title: 'Bonus Tracker', color: 'pink' },
          ].map((widget, index) => (
            <div
              key={index}
              className="glass-dark p-6 rounded-xl border border-purple-500/30 hover:border-purple-500 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{widget.title}</h3>
              <p className="text-gray-400 text-sm">
                Widget placeholder - Coming in Phase 4 & 5
              </p>
              <div className="mt-4 h-32 bg-slate-700/30 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Widget Content</span>
              </div>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-8 glass-dark-subtle p-6 rounded-xl border border-blue-500/30">
          <h4 className="text-lg font-semibold text-white mb-2">
            ✨ New Dashboard Layout (Phase 1 & 2 Complete)
          </h4>
          <p className="text-gray-300 text-sm mb-4">
            You're viewing the new Gamification Widget Layout with Royal Purple theme and glassmorphism design.
          </p>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>✅ <strong>Phase 1:</strong> Foundation (types, hooks, contexts, testing)</li>
            <li>✅ <strong>Phase 2:</strong> Layout shell & navigation</li>
            <li>⏳ <strong>Phase 3:</strong> Shared components (AnimatedCard, ProgressRing, etc.)</li>
            <li>⏳ <strong>Phase 4-5:</strong> 14 interactive widgets</li>
            <li>⏳ <strong>Phase 6:</strong> Widget grid layout</li>
            <li>⏳ <strong>Phase 7:</strong> Theme customization</li>
          </ul>
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
}
