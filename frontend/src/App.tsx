import { useState, useEffect } from 'react';
import { api } from './services/api';
import { signalRService } from './services/signalr';
import { MissionList } from './components/MissionList';
import { BonusList } from './components/BonusList';
import { MiniGameList } from './components/MiniGameList';
import { TournamentList } from './components/TournamentList';
import { LevelCard } from './components/LevelCard';
import { LevelList } from './components/LevelList';
import { LevelUpNotification } from './components/LevelUpNotification';
import type { Mission } from './types';
import type { Level } from './types/level';

// Hardcoded user ID for MVP testing
const TEST_USER_ID = 'test-user-123';

type ActiveTab = 'missions' | 'bonuses' | 'minigames' | 'tournaments' | 'levels';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('missions');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMissionId, setLoadingMissionId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [selectedLevelUserId, setSelectedLevelUserId] = useState<string>(TEST_USER_ID);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: Level; previousLevel: Level | null } | null>(null);

  // Load missions on mount
  useEffect(() => {
    loadMissions();
    connectSignalR();

    // Cleanup on unmount
    return () => {
      signalRService.disconnect();
    };
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMissions(TEST_USER_ID);
      setMissions(data);
      console.log('✅ Loaded missions:', data.length);
    } catch (err) {
      console.error('❌ Failed to load missions:', err);
      setError('Failed to load missions. Make sure the backend is running at http://localhost:5227');
    } finally {
      setIsLoading(false);
    }
  };

  const connectSignalR = async () => {
    try {
      await signalRService.connect(TEST_USER_ID);
      setSignalRConnected(true);

      // Subscribe to real-time updates
      signalRService.onMissionProgressUpdated((updatedMission) => {
        console.log('📊 Mission progress updated via SignalR:', updatedMission);
        setLastUpdate(`Mission "${updatedMission.name}" progress: ${updatedMission.progress.toFixed(0)}%`);
        
        // Update the mission in the list
        setMissions((prev) =>
          prev.map((m) => (m.id === updatedMission.id ? updatedMission : m))
        );
      });

      signalRService.onMissionCompleted((completedMission) => {
        console.log('🎉 Mission completed via SignalR:', completedMission);
        setLastUpdate(`Mission "${completedMission.name}" completed! 🎉`);
        
        // Update the mission in the list
        setMissions((prev) =>
          prev.map((m) => (m.id === completedMission.id ? completedMission : m))
        );
      });

      signalRService.onBadgeEarned((badge) => {
        console.log('🏆 Badge earned via SignalR:', badge);
        setLastUpdate(`Badge "${badge.name}" earned! 🏆`);
      });

      console.log('✅ SignalR connected and subscribed to updates');
    } catch (err) {
      console.error('❌ SignalR connection failed:', err);
      setSignalRConnected(false);
    }
  };

  const handleOptIn = async (missionId: number) => {
    try {
      setLoadingMissionId(missionId);
      console.log(`🎯 Opting into mission ${missionId}...`);
      
      const result = await api.optInToMission(TEST_USER_ID, missionId);
      
      if (result.success) {
        console.log('✅ Opt-in successful:', result.message);
        // Reload missions to get updated status
        await loadMissions();
      } else {
        console.error('❌ Opt-in failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ Opt-in error:', err);
      setError('Failed to opt in to mission');
    } finally {
      setLoadingMissionId(undefined);
    }
  };

  const handleClaim = async (missionId: number) => {
    try {
      setLoadingMissionId(missionId);
      console.log(`💰 Claiming reward for mission ${missionId}...`);
      
      const result = await api.claimReward(TEST_USER_ID, missionId);
      
      if (result.success) {
        console.log('✅ Claim successful:', result.message);
        if (result.rewardAmount) {
          alert(`🎉 You earned ${result.rewardAmount} ${result.rewardCurrency || 'points'}!`);
        }
        // Reload missions to get updated status
        await loadMissions();
      } else {
        console.error('❌ Claim failed:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ Claim error:', err);
      setError('Failed to claim reward');
    } finally {
      setLoadingMissionId(undefined);
    }
  };

  const handleTestLevelUp = () => {
    // Simulate level-up from Silver to Gold
    const previousLevel: Level = {
      id: 2,
      name: 'Silver',
      description: "You're gaining momentum! Keep playing to unlock even better rewards.",
      image: 'https://images.example.com/levels/silver-badge.png',
      requiredPoints: 500,
      visibilityPoints: 0,
      requiredLevelCounter1: null,
      requiredLevelCounter2: null,
      customData: '{"color":"#C0C0C0","tier":"intermediate"}',
    };

    const newLevel: Level = {
      id: 3,
      name: 'Gold',
      description: "Impressive progress! You're now among the top players. Exclusive rewards await.",
      image: 'https://images.example.com/levels/gold-badge.png',
      requiredPoints: 1000,
      visibilityPoints: 500,
      requiredLevelCounter1: null,
      requiredLevelCounter2: null,
      customData: '{"color":"#FFD700","tier":"advanced"}',
    };

    setLevelUpData({ newLevel, previousLevel });
    setShowLevelUpModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎯 Smartico Gamification</h1>
              <p className="text-sm text-gray-600 mt-1">
                Missions, Badges & Bonuses - User ID: <code className="bg-gray-100 px-2 py-1 rounded">{TEST_USER_ID}</code>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${signalRConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-600">
                    {signalRConnected ? 'Real-time Connected' : 'Disconnected'}
                  </span>
                </div>
                {lastUpdate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last update: {lastUpdate}
                  </div>
                )}
              </div>
              <button
                onClick={loadMissions}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Loading...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'missions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎯 Missions
            </button>
            <button
              onClick={() => setActiveTab('bonuses')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'bonuses'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎁 Bonuses
            </button>
            <button
              onClick={() => setActiveTab('minigames')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'minigames'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎮 Mini Games
            </button>
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'tournaments'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏆 Tournaments
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'levels'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⭐ Levels
            </button>
          </nav>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">❌ Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'missions' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{missions.length}</div>
            <div className="text-sm text-gray-600">Total Missions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {missions.filter((m) => m.status === 1).length}
            </div>
            <div className="text-sm text-gray-600">Active Missions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {missions.filter((m) => m.status === 2).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {missions.filter((m) => m.status === 0).length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>

            {/* Mission List */}
            {isLoading && missions.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading missions...</p>
              </div>
            ) : (
              <MissionList
                missions={missions}
                onOptIn={handleOptIn}
                onClaim={handleClaim}
                isLoading={!!loadingMissionId}
                loadingMissionId={loadingMissionId}
              />
            )}
          </>
        )}

        {activeTab === 'bonuses' && (
          <BonusList userId={TEST_USER_ID} />
        )}

        {activeTab === 'minigames' && (
          <MiniGameList userId={TEST_USER_ID} />
        )}

        {activeTab === 'tournaments' && (
          <TournamentList userId={TEST_USER_ID} />
        )}

        {activeTab === 'levels' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Level Progression</h2>
                  <p className="text-gray-600">Track your progress and see how far you've come!</p>
                </div>

                {/* Demo Controls */}
                <div className="flex gap-3">
                  {/* Test Level Up Button */}
                  <button
                    onClick={handleTestLevelUp}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    title="Test level-up notification"
                  >
                    🎉 Test Level Up
                  </button>

                  {/* Demo User Switcher */}
                  <div className="relative">
                  <label htmlFor="user-select" className="block text-xs text-gray-500 mb-1">
                    Demo User
                  </label>
                  <select
                    id="user-select"
                    value={selectedLevelUserId}
                    onChange={(e) => setSelectedLevelUserId(e.target.value)}
                    className="block w-48 px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <option value="test-user-123">New User (Bronze - 0 pts)</option>
                    <option value="newbie">Newbie (Bronze - 50 pts)</option>
                    <option value="user123">User123 (Gold - 1,250 pts)</option>
                    <option value="demo_user">Demo User (Platinum - 3,500 pts)</option>
                    <option value="elite">Elite (Diamond - 15,000 pts)</option>
                  </select>
                  </div>
                </div>
              </div>
            </div>
            <LevelCard userId={selectedLevelUserId} />
            <LevelList userId={selectedLevelUserId} />

            {/* Level-Up Notification Modal */}
            {showLevelUpModal && levelUpData && (
              <LevelUpNotification
                newLevel={levelUpData.newLevel}
                previousLevel={levelUpData.previousLevel}
                onClose={() => setShowLevelUpModal(false)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>
            Backend API: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5227</code>
          </p>
          <p className="mt-2">
            SignalR Hub: <code className="bg-gray-100 px-2 py-1 rounded">ws://localhost:5227/hubs/progress</code>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

