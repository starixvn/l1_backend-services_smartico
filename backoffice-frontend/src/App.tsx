import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TournamentsPage } from './features/tournaments/pages/TournamentsPage';
import { CreateTournamentPage } from './features/tournaments/pages/CreateTournamentPage';
import { TournamentDetailsPage } from './features/tournaments/pages/TournamentDetailsPage';
import { LeaderboardPage } from './features/leaderboard/pages/LeaderboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/tournaments" replace />} />
          <Route path="tournaments" element={<TournamentsPage />} />
          <Route path="tournaments/create" element={<CreateTournamentPage />} />
          <Route path="tournaments/:id" element={<TournamentDetailsPage />} />
          <Route path="tournaments/:tournamentId/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/tournaments" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
