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
            <Route path="*" element={<Navigate to="/tournaments" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
