import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { TournamentsPage } from './features/tournaments/pages/TournamentsPage';
import { CreateTournamentPage } from './features/tournaments/pages/CreateTournamentPage';
import { TournamentDetailsPage } from './features/tournaments/pages/TournamentDetailsPage';
import { LeaderboardPage } from './features/leaderboard/pages/LeaderboardPage';
import { MissionsPage } from './features/missions/pages/MissionsPage';
import { CreateMissionPage } from './features/missions/pages/CreateMissionPage';
import { MissionDetailsPage } from './features/missions/pages/MissionDetailsPage';
import { BonusesPage } from './features/bonuses/pages/BonusesPage';
import { CreateBonusPage } from './features/bonuses/pages/CreateBonusPage';
import { GlobalLimitsPage } from './features/bonuses/pages/GlobalLimitsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/tournaments" replace />} />

            {/* Tournaments */}
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route
              path="tournaments/create"
              element={
                <ProtectedRoute requirePermission="tournaments.create">
                  <CreateTournamentPage />
                </ProtectedRoute>
              }
            />
            <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
            <Route path="tournaments/:tournamentId/leaderboard" element={<LeaderboardPage />} />

            {/* Missions */}
            <Route path="missions" element={<MissionsPage />} />
            <Route
              path="missions/create"
              element={
                <ProtectedRoute requirePermission="missions.create">
                  <CreateMissionPage />
                </ProtectedRoute>
              }
            />
            <Route path="missions/edit/:id" element={<CreateMissionPage />} />
            <Route path="missions/:id" element={<MissionDetailsPage />} />

            {/* Bonuses */}
            <Route path="bonuses" element={<BonusesPage />} />
            <Route
              path="bonuses/create"
              element={
                <ProtectedRoute requirePermission="bonuses.create">
                  <CreateBonusPage />
                </ProtectedRoute>
              }
            />
            <Route path="bonuses/limits" element={<GlobalLimitsPage />} />
            <Route path="bonuses/:id" element={<CreateBonusPage />} />
            <Route path="bonuses/edit/:id" element={<CreateBonusPage />} />

            <Route path="*" element={<Navigate to="/tournaments" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
