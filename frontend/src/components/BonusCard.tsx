import { Bonus, BonusStatus } from '../types/bonus';

interface BonusCardProps {
  bonus: Bonus;
  onClaim: (bonusId: string) => void;
  isLoading?: boolean;
}

export function BonusCard({ bonus, onClaim, isLoading }: BonusCardProps) {
  const getStatusBadge = (status: BonusStatus) => {
    const badges = {
      [BonusStatus.New]: { text: 'New', color: 'bg-blue-100 text-blue-800' },
      [BonusStatus.Issued]: { text: 'Available', color: 'bg-green-100 text-green-800' },
      [BonusStatus.Claimed]: { text: 'Claimed', color: 'bg-purple-100 text-purple-800' },
      [BonusStatus.RedeemFailed]: { text: 'Failed', color: 'bg-red-100 text-red-800' },
      [BonusStatus.IssueFailed]: { text: 'Issue Failed', color: 'bg-orange-100 text-orange-800' },
      [BonusStatus.Expired]: { text: 'Expired', color: 'bg-gray-100 text-gray-800' },
    };
    return badges[status] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const statusBadge = getStatusBadge(bonus.status);
  const canClaim = bonus.isRedeemable && bonus.status === BonusStatus.Issued;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpiringSoon = () => {
    if (!bonus.expiresAt) return false;
    const expiryDate = new Date(bonus.expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Image */}
      {bonus.imageUrl && (
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img
            src={bonus.imageUrl}
            alt={bonus.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{bonus.name}</h3>
            {bonus.description && (
              <p className="text-sm text-gray-600 mt-1">{bonus.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${statusBadge.color}`}>
            {statusBadge.text}
          </span>
        </div>

        {/* Amount */}
        <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <p className="text-2xl font-bold text-gray-900">
            {bonus.amount} <span className="text-lg text-gray-600">{bonus.currency}</span>
          </p>
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon() && (
          <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Expires soon: {formatDate(bonus.expiresAt)}
            </p>
          </div>
        )}

        {/* Action Button */}
        {canClaim && (
          <button
            onClick={() => onClaim(bonus.id)}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Processing...' : '🎁 Claim Bonus'}
          </button>
        )}

        {/* Meta Info */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          {bonus.type && (
            <div>
              <span className="font-medium">Type:</span> {bonus.type}
            </div>
          )}
          {bonus.expiresAt && !isExpiringSoon() && (
            <div>
              <span className="font-medium">Expires:</span> {formatDate(bonus.expiresAt)}
            </div>
          )}
          {bonus.redeemedAt && (
            <div>
              <span className="font-medium">Claimed:</span> {formatDate(bonus.redeemedAt)}
            </div>
          )}
          <div>
            <span className="font-medium">Created:</span> {formatDate(bonus.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
