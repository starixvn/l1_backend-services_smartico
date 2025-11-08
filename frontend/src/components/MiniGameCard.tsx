import { MiniGame, GameType, BuyInType } from '../types/minigame';

interface MiniGameCardProps {
  game: MiniGame;
  onPlay: (gameId: number) => void;
  isLoading?: boolean;
}

export function MiniGameCard({ game, onPlay, isLoading }: MiniGameCardProps) {
  const getGameTypeIcon = (type: GameType) => {
    const icons = {
      [GameType.Spin]: '🎡',
      [GameType.GiftBox]: '🎁',
      [GameType.Scratch]: '🎫',
      [GameType.MatchX]: '🎰',
    };
    return icons[type] || '🎮';
  };

  const getGameTypeName = (type: GameType) => {
    const names = {
      [GameType.Spin]: 'Spin the Wheel',
      [GameType.GiftBox]: 'Gift Box',
      [GameType.Scratch]: 'Scratch Card',
      [GameType.MatchX]: 'Match 3',
    };
    return names[type] || 'Game';
  };

  const getBuyInDisplay = () => {
    switch (game.buyInType) {
      case BuyInType.Free:
        return { text: 'FREE', color: 'text-green-600' };
      case BuyInType.Points:
        return { text: `${game.buyInCostPoints} Points`, color: 'text-blue-600' };
      case BuyInType.Gems:
        return { text: `${game.buyInCostGems} Gems`, color: 'text-purple-600' };
      case BuyInType.Diamonds:
        return { text: `${game.buyInCostDiamonds} Diamonds`, color: 'text-pink-600' };
      case BuyInType.Spin:
        return { text: '1 Spin', color: 'text-orange-600' };
      default:
        return { text: 'Unknown', color: 'text-gray-600' };
    }
  };

  const formatCooldown = (timestampMs: number | null | undefined) => {
    if (!timestampMs) return null;
    const now = Date.now();
    const diff = timestampMs - now;
    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isOnCooldown = () => {
    if (!game.nextAvailableSpinTs) return false;
    return Date.now() < game.nextAvailableSpinTs;
  };

  const hasAttemptsRemaining = () => {
    if (game.spinCount === null || game.spinCount === undefined) return true;
    return game.spinCount > 0;
  };

  const canPlay = !isOnCooldown() && hasAttemptsRemaining();
  const buyIn = getBuyInDisplay();
  const cooldownTime = formatCooldown(game.nextAvailableSpinTs);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Thumbnail */}
      {game.thumbnail && (
        <div className="h-40 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden relative">
          <img
            src={game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          {/* Game Type Badge */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-md">
            {getGameTypeIcon(game.gameType)} {getGameTypeName(game.gameType)}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
          {game.description && (
            <p className="text-sm text-gray-600 mt-1">{game.description}</p>
          )}
        </div>

        {/* Buy-in Cost */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">Cost:</span>
          <span className={`text-lg font-bold ${buyIn.color}`}>{buyIn.text}</span>
        </div>

        {/* Jackpot (if enabled) */}
        {game.jackpotCurrent !== null && game.jackpotCurrent !== undefined && (
          <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">💰 Jackpot</span>
              <span className="text-xl font-bold text-orange-600">${game.jackpotCurrent.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Attempts Remaining */}
        {game.spinCount !== null && game.spinCount !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Attempts Remaining:</span>
              <span className={`font-bold ${game.spinCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {game.spinCount} / {game.maxNumberOfAttempts || '∞'}
              </span>
            </div>
          </div>
        )}

        {/* Cooldown Warning */}
        {isOnCooldown() && cooldownTime && (
          <div className="mb-3 p-2 bg-orange-50 rounded border border-orange-200">
            <p className="text-sm text-orange-700 font-medium">
              ⏳ Next play in: {cooldownTime}
            </p>
          </div>
        )}

        {/* No Attempts Warning */}
        {!hasAttemptsRemaining() && !isOnCooldown() && (
          <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-700 font-medium">
              🚫 No attempts remaining
            </p>
          </div>
        )}

        {/* Play Button */}
        <button
          onClick={() => onPlay(game.id)}
          disabled={!canPlay || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Playing...' : canPlay ? '🎮 Play Now' : '🔒 Unavailable'}
        </button>

        {/* Meta Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>Type: {getGameTypeName(game.gameType)}</span>
            <span>{game.prizes.length} Prizes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
