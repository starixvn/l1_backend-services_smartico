import type { JackpotWinner } from '../types/jackpot';

interface WinnerCardProps {
  winner: JackpotWinner;
}

/**
 * Component for displaying a single jackpot winner card.
 * Shows avatar, username, jackpot name, prize amount, position badge, and win date.
 * Highlights current user's wins with special styling.
 */
export function WinnerCard({ winner }: WinnerCardProps) {
  // Position badge configuration
  const positionBadges: Record<number, { emoji: string; label: string; colorClass: string }> = {
    1: { emoji: '🥇', label: '1st Place', colorClass: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    2: { emoji: '🥈', label: '2nd Place', colorClass: 'text-gray-600 bg-gray-50 border-gray-200' },
    3: { emoji: '🥉', label: '3rd Place', colorClass: 'text-orange-600 bg-orange-50 border-orange-200' }
  };

  const badge = positionBadges[winner.winningPosition] || {
    emoji: '🏅',
    label: `${winner.winningPosition}th Place`,
    colorClass: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  // Format date
  const winDate = new Date(winner.winDateTs);
  const formattedDate = winDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Card border/background for current user's wins
  const cardClasses = winner.isMe
    ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-400 shadow-lg'
    : 'bg-white border border-gray-200 shadow-sm';

  return (
    <div className={`rounded-lg p-4 ${cardClasses} hover:shadow-md transition-shadow relative`}>
      {/* "Your Win!" badge for current user */}
      {winner.isMe && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
          YOUR WIN! 🎉
        </div>
      )}

      {/* Avatar and Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {winner.publicUsername.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${winner.isMe ? 'text-blue-900' : 'text-gray-900'}`}>
            {winner.publicUsername}
          </h3>
          <p className="text-sm text-gray-600 truncate">{winner.jackpotName}</p>
        </div>
      </div>

      {/* Prize Amount */}
      <div className="mb-3">
        <p className="text-2xl font-bold text-green-600">
          {winner.winningAmountJpCurrency.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500">
          ≈ ${winner.winningAmountWalletCurrency.toFixed(2)} USD
        </p>
      </div>

      {/* Position Badge and Date */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${badge.colorClass}`}>
          <span className="text-lg">{badge.emoji}</span>
          <span className="text-sm font-semibold">{badge.label}</span>
        </div>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
    </div>
  );
}
