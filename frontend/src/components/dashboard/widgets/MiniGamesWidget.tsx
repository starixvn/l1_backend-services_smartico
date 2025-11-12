/**
 * MiniGamesWidget Component
 * Displays available mini games with play actions and jackpot amounts.
 */

import { motion } from 'framer-motion';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { AnimatedCard, SkeletonLoader, EmptyState } from '../shared';
import type { MiniGame } from '../../../types/dashboard/data';

/**
 * Game type icon mapping.
 */
const GAME_ICONS: Record<MiniGame['gameType'], string> = {
  'spin-wheel': '🎡',
  'gift-box': '🎁',
  'scratch-card': '🎫',
  'match-x': '🎮',
};

/**
 * Game type color mapping.
 */
const GAME_COLORS: Record<MiniGame['gameType'], string> = {
  'spin-wheel': 'from-purple-600 to-pink-600',
  'gift-box': 'from-blue-600 to-cyan-600',
  'scratch-card': 'from-yellow-600 to-orange-600',
  'match-x': 'from-green-600 to-emerald-600',
};

/**
 * Mini game card component.
 */
function MiniGameCard({ game, onPlay }: { game: MiniGame; onPlay: (id: number) => void }) {
  const prefersReducedMotion = useReducedMotion();
  const isAvailable = !game.nextAvailableAt || new Date(game.nextAvailableAt) <= new Date();

  return (
    <motion.div
      whileHover={prefersReducedMotion || !isAvailable ? undefined : { y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`
        glass-dark-subtle rounded-xl border overflow-hidden
        ${isAvailable ? 'border-purple-500/30 hover:border-purple-500/50' : 'border-gray-700/30 opacity-60'}
        transition-all
      `}
    >
      {/* Thumbnail */}
      <div
        className={`
          h-32 bg-gradient-to-br ${GAME_COLORS[game.gameType]}
          flex items-center justify-center text-5xl
          relative
        `}
      >
        {GAME_ICONS[game.gameType]}

        {/* Jackpot Badge */}
        {game.jackpotAmount && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-bold rounded">
            💰 {game.jackpotAmount.toLocaleString()}
          </div>
        )}

        {/* Cooldown Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm font-medium">On Cooldown</div>
              <div className="text-gray-400 text-xs mt-1">
                {new Date(game.nextAvailableAt!).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-base font-semibold text-white mb-1 truncate">
          {game.name}
        </h4>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {game.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          {/* Cost */}
          <div className="text-sm">
            {game.buyInCost > 0 ? (
              <span className="text-yellow-400 font-medium">
                💎 {game.buyInCost}
              </span>
            ) : (
              <span className="text-green-400 font-medium">Free</span>
            )}
          </div>

          {/* Play Button */}
          <motion.button
            whileHover={prefersReducedMotion || !isAvailable ? undefined : { scale: 1.05 }}
            whileTap={prefersReducedMotion || !isAvailable ? undefined : { scale: 0.95 }}
            onClick={() => onPlay(game.id)}
            disabled={!isAvailable}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isAvailable ? 'text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            style={
              isAvailable
                ? {
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-accent))',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                  }
                : undefined
            }
            onMouseEnter={
              isAvailable
                ? (e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }
                : undefined
            }
            onMouseLeave={
              isAvailable
                ? (e) => {
                    e.currentTarget.style.filter = 'brightness(1)';
                  }
                : undefined
            }
          >
            {isAvailable ? 'Play' : 'Locked'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * MiniGamesWidget component.
 * Displays available mini games in a grid.
 */
export function MiniGamesWidget() {
  const { data, isLoading } = useDashboardData();
  const miniGames = data?.miniGames || [];

  // Handle play game
  const handlePlay = (gameId: number) => {
    // TODO: Call miniGameService.playGame(gameId)
    // TODO: Open game modal/overlay
    console.log('Playing game:', gameId);
  };

  // Loading state
  if (isLoading) {
    return (
      <AnimatedCard className="p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🎮</span> Mini Games
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" height={200} />
          ))}
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🎮</span> Mini Games
        </h3>
        <span className="text-sm text-gray-400">
          {miniGames.filter((g) => !g.nextAvailableAt || new Date(g.nextAvailableAt) <= new Date()).length} available
        </span>
      </div>

      {miniGames.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              />
            </svg>
          }
          title="No Mini Games Available"
          description="New games are coming soon! Check back later for exciting mini games and prizes."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {miniGames.map((game) => (
            <MiniGameCard key={game.id} game={game} onPlay={handlePlay} />
          ))}
        </div>
      )}

      {/* View All Button */}
      {miniGames.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
            View All Games →
          </button>
        </div>
      )}

      {/* TODO: SignalR listener for mini-game-available event */}
      {/* TODO: SignalR listener for mini-game-result event */}
    </AnimatedCard>
  );
}
