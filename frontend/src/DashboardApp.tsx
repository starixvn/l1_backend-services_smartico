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
  // Phase 4 Widgets
  DailyChallengeWidget,
  LevelProgressWidget,
  ActiveMissionsWidget,
  RecentAchievementsWidget,
  LeaderboardWidget,
  // Phase 5 Widgets
  BonusTrackerWidget,
  MiniGamesWidget,
  TournamentWidget,
  JackpotWidget,
  ActivityFeedWidget,
  PersonalGoalsWidget,
  RewardCalendarWidget,
  StreakTrackerWidget,
  VIPStatusWidget,
} from './components/dashboard/widgets';

export function DashboardApp() {
  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Dashboard">
        <div className="space-y-6">
          {/* Row 1: Daily Challenge + Level Progress + Streak */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DailyChallengeWidget />
            <LevelProgressWidget />
            <StreakTrackerWidget />
          </div>

          {/* Row 2: Active Missions (full width) */}
          <ActiveMissionsWidget />

          {/* Row 3: Tournament + Jackpot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TournamentWidget />
            <JackpotWidget />
          </div>

          {/* Row 4: Bonuses + Mini Games */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BonusTrackerWidget />
            <MiniGamesWidget />
          </div>

          {/* Row 5: Personal Goals + Reward Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalGoalsWidget />
            <RewardCalendarWidget />
          </div>

          {/* Row 6: VIP Status + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VIPStatusWidget />
            <ActivityFeedWidget />
          </div>

          {/* Row 7: Achievements + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentAchievementsWidget />
            <LeaderboardWidget />
          </div>

          {/* Implementation Status */}
          <div className="glass-dark-subtle p-6 rounded-xl border border-green-500/30">
            <h4 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span>✨</span> All 14 Widgets Complete!
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-semibold text-green-400 mb-2">✅ Phase 4 - Core Widgets (Part 1)</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Daily Challenge Widget</li>
                  <li>• Level Progress Widget</li>
                  <li>• Active Missions Widget</li>
                  <li>• Recent Achievements Widget</li>
                  <li>• Leaderboard Widget</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-green-400 mb-2">✅ Phase 5 - Core Widgets (Part 2)</h5>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Bonus Tracker Widget</li>
                  <li>• Mini Games Widget</li>
                  <li>• Tournament Widget</li>
                  <li>• Jackpot Widget</li>
                  <li>• Activity Feed Widget</li>
                  <li>• Personal Goals Widget</li>
                  <li>• Reward Calendar Widget</li>
                  <li>• Streak Tracker Widget</li>
                  <li>• VIP Status Widget</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </DashboardProvider>
  );
}
