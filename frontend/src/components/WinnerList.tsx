import type { JackpotWinner, JackpotType } from '../types/jackpot';
import { WinnerCard } from './WinnerCard';

interface WinnerListProps {
  winners: JackpotWinner[];
  loading: boolean;
  error: string | null;
  filterType?: JackpotType;
  onFilterChange?: (filterType?: JackpotType) => void;
}

/**
 * Component for displaying a list of jackpot winners.
 * Supports loading states, error handling, and responsive layout.
 */
export function WinnerList({ winners, loading, error, filterType, onFilterChange }: WinnerListProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-48"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold mb-2">Failed to load winners</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        {onFilterChange && (
          <button
            onClick={() => onFilterChange(filterType)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Empty state
  if (winners.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <p className="text-gray-600 font-semibold mb-1">No Winners Yet</p>
        <p className="text-gray-500 text-sm">
          {filterType !== undefined
            ? 'No winners found for this jackpot type. Try a different filter.'
            : 'Be the first to win!'}
        </p>
      </div>
    );
  }

  // Winner list
  return (
    <div className="space-y-4">
      {/* Desktop: Table layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Winner
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Jackpot
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Prize
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {winners.map((winner, index) => {
              const winDate = new Date(winner.winDateTs);
              const formattedDate = winDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              const positionEmojis: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
              const positionEmoji = positionEmojis[winner.winningPosition] || '🏅';

              const rowClass = winner.isMe ? 'bg-blue-50 font-semibold' : 'bg-white hover:bg-gray-50';

              return (
                <tr key={`${winner.jpPotId}-${index}`} className={rowClass}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                        {winner.publicUsername.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-gray-900">{winner.publicUsername}</p>
                        {winner.isMe && (
                          <span className="text-xs text-blue-600 font-semibold">YOU</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-700">
                    {winner.jackpotName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <p className="text-green-600 font-bold">
                      {winner.winningAmountJpCurrency.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${winner.winningAmountWalletCurrency.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-xl">{positionEmoji}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {formattedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden space-y-4">
        {winners.map((winner, index) => (
          <WinnerCard key={`${winner.jpPotId}-${index}`} winner={winner} />
        ))}
      </div>
    </div>
  );
}
