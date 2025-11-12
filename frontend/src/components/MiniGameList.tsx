import { useState, useEffect } from 'react';
import { MiniGame, GameType } from '../types/minigame';
import { MiniGameCard } from './MiniGameCard';
import { MiniGameService } from '../services/miniGameService';
import { signalRService } from '../services/signalr';

interface MiniGameListProps {
  userId: string;
}

export function MiniGameList({ userId }: MiniGameListProps) {
  const [games, setGames] = useState<MiniGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingGameId, setPlayingGameId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | GameType>('all');
  const [winMessage, setWinMessage] = useState<string | null>(null);

  useEffect(() => {
    loadGames();

    // Subscribe to SignalR mini game events
    signalRService.onMiniGamePlayed((game) => {
      console.log('Real-time: Mini game played', game);
      // Update the game in state with new cooldown/attempts
      setGames((prev) => prev.map((g) => (g.id === game.id ? game : g)));
    });

    signalRService.onMiniGamePrizeWon((data) => {
      console.log('Real-time: Prize won', data);
      // Show win notification
      setWinMessage(`🎉 You won: ${data.prize.name}!`);
      setTimeout(() => setWinMessage(null), 5000); // Hide after 5 seconds
      // Update game state
      setGames((prev) => prev.map((g) => (g.id === data.game.id ? data.game : g)));
    });

    signalRService.onMiniGameJackpotWon((data) => {
      console.log('Real-time: JACKPOT WON!', data);
      // Show jackpot celebration
      const isMe = data.userId === userId;
      setWinMessage(`💰 JACKPOT! ${isMe ? 'YOU WON' : `${data.userId} won`} $${data.jackpotAmount.toFixed(2)}!`);
      setTimeout(() => setWinMessage(null), 10000); // Hide after 10 seconds
      // Update all games with new jackpot values
      setGames((prev) => prev.map((g) => (g.id === data.game.id ? data.game : g)));
    });
  }, [userId]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MiniGameService.getMiniGames(userId);
      setGames(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mini games');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (gameId: number) => {
    try {
      setPlayingGameId(gameId);
      const result = await MiniGameService.playMiniGame(gameId, userId);

      if (result.success) {
        // Update the game with new state
        if (result.updatedGame) {
          setGames((prev) => prev.map((g) => (g.id === gameId ? result.updatedGame! : g)));
        }

        // Show prize won
        if (result.prizeName) {
          alert(`🎉 You won: ${result.prizeName}!`);
        } else {
          alert('Better luck next time!');
        }
      } else {
        alert(`❌ ${result.errorMessage || 'Failed to play game'}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to play game');
    } finally {
      setPlayingGameId(null);
    }
  };

  const filteredGames = games.filter((game) => {
    if (filter === 'all') return true;
    return game.gameType === filter;
  });

  const stats = {
    total: games.length,
    available: games.filter((g) => {
      const hasAttempts = g.spinCount === null || g.spinCount === undefined || g.spinCount > 0;
      const noCooldown = !g.nextAvailableSpinTs || Date.now() >= g.nextAvailableSpinTs;
      return hasAttempts && noCooldown;
    }).length,
    totalJackpot: games
      .filter((g) => g.jackpotCurrent !== null && g.jackpotCurrent !== undefined)
      .reduce((sum, g) => sum + (g.jackpotCurrent || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading mini games</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={loadGames}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Win Notification Toast */}
      {winMessage && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-yellow-300 max-w-md">
            <p className="text-xl font-bold text-center">{winMessage}</p>
          </div>
        </div>
      )}

      {/* Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Mini Games</h2>
          <button
            onClick={loadGames}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Games</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Available to Play</p>
            <p className="text-3xl font-bold text-green-900">{stats.available}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Total Jackpots</p>
            <p className="text-3xl font-bold text-orange-900">${stats.totalJackpot.toFixed(2)}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter(GameType.Spin)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === GameType.Spin
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎡 Spin ({games.filter((g) => g.gameType === GameType.Spin).length})
          </button>
          <button
            onClick={() => setFilter(GameType.GiftBox)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === GameType.GiftBox
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎁 Gift Box ({games.filter((g) => g.gameType === GameType.GiftBox).length})
          </button>
          <button
            onClick={() => setFilter(GameType.Scratch)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === GameType.Scratch
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎫 Scratch ({games.filter((g) => g.gameType === GameType.Scratch).length})
          </button>
          <button
            onClick={() => setFilter(GameType.MatchX)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === GameType.MatchX
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎰 Match 3 ({games.filter((g) => g.gameType === GameType.MatchX).length})
          </button>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">No games found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Check back later for new games!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <MiniGameCard
              key={game.id}
              game={game}
              onPlay={handlePlay}
              isLoading={playingGameId === game.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
