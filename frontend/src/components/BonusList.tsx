import { useState, useEffect } from 'react';
import { Bonus, BonusStatus } from '../types/bonus';
import { BonusCard } from './BonusCard';
import { BonusService } from '../services/bonusService';
import { signalRService } from '../services/signalr';

interface BonusListProps {
  userId: string;
}

export function BonusList({ userId }: BonusListProps) {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingBonusId, setClaimingBonusId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all');

  useEffect(() => {
    loadBonuses();

    // Subscribe to SignalR bonus events
    signalRService.onBonusIssued((bonus) => {
      console.log('Real-time: Bonus issued', bonus);
      setBonuses((prev) => [...prev, bonus]);
    });

    signalRService.onBonusClaimed((bonus) => {
      console.log('Real-time: Bonus claimed', bonus);
      setBonuses((prev) => prev.map((b) => (b.id === bonus.id ? bonus : b)));
    });

    signalRService.onBonusExpired((data) => {
      console.log('Real-time: Bonus expired', data);
      setBonuses((prev) =>
        prev.map((b) => (b.id === data.bonusId ? { ...b, status: BonusStatus.Expired } : b))
      );
    });
  }, [userId]);

  const loadBonuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BonusService.getBonuses(userId);
      setBonuses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bonuses');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (bonusId: string) => {
    try {
      setClaimingBonusId(bonusId);
      const result = await BonusService.claimBonus(userId, bonusId);

      if (result.success) {
        // Refresh bonuses list
        await loadBonuses();
        alert('Bonus claimed successfully!');
      } else {
        alert(`Failed to claim bonus: ${result.errorMessage || 'Unknown error'}`);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to claim bonus');
    } finally {
      setClaimingBonusId(null);
    }
  };

  const filteredBonuses = bonuses.filter((bonus) => {
    if (filter === 'available') return bonus.status === BonusStatus.Issued && bonus.isRedeemable;
    if (filter === 'claimed') return bonus.status === BonusStatus.Claimed;
    return true;
  });

  const stats = {
    total: bonuses.length,
    available: bonuses.filter((b) => b.status === BonusStatus.Issued && b.isRedeemable).length,
    claimed: bonuses.filter((b) => b.status === BonusStatus.Claimed).length,
    totalAmount: bonuses
      .filter((b) => b.status === BonusStatus.Claimed)
      .reduce((sum, b) => sum + Number(b.amount), 0),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-medium">Error loading bonuses</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={loadBonuses}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Bonuses</h2>
          <button
            onClick={loadBonuses}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Total Bonuses</p>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Available</p>
            <p className="text-3xl font-bold text-green-900">{stats.available}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Claimed Value</p>
            <p className="text-3xl font-bold text-purple-900">${stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
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
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'available'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Available ({stats.available})
          </button>
          <button
            onClick={() => setFilter('claimed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'claimed'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Claimed ({stats.claimed})
          </button>
        </div>
      </div>

      {/* Bonuses Grid */}
      {filteredBonuses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 text-lg">No bonuses found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filter !== 'all' ? 'Try changing the filter' : 'Check back later for new bonuses!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBonuses.map((bonus) => (
            <BonusCard
              key={bonus.id}
              bonus={bonus}
              onClaim={handleClaim}
              isLoading={claimingBonusId === bonus.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
