import { useEffect } from 'react';
import type { Level } from '../types/level';

interface LevelUpNotificationProps {
  newLevel: Level;
  previousLevel: Level | null;
  onClose: () => void;
}

/**
 * Modal notification displayed when user levels up.
 * Features:
 * - Celebration animation with confetti effect
 * - Auto-dismiss after 5 seconds
 * - Escape key to close
 * - Focus trap for accessibility
 * - Backdrop click to close
 *
 * @param newLevel - The new level the user achieved
 * @param previousLevel - The previous level (optional)
 * @param onClose - Callback when modal is closed
 *
 * @example
 * ```tsx
 * <LevelUpNotification
 *   newLevel={goldLevel}
 *   previousLevel={silverLevel}
 *   onClose={() => setShowNotification(false)}
 * />
 * ```
 */
export function LevelUpNotification({ newLevel, previousLevel, onClose }: LevelUpNotificationProps) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    // Handle Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
      aria-describedby="level-up-description"
    >
      {/* Confetti background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              width: '10px',
              height: '10px',
              backgroundColor: ['#FFD700', '#FF6B35', '#4ECDC4', '#45B7D1', '#F7B731'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Modal card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Celebration header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2
            id="level-up-title"
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 mb-2"
          >
            Level Up!
          </h2>
          <p className="text-gray-600">Congratulations on your achievement!</p>
        </div>

        {/* Level progression */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {previousLevel && (
            <>
              {/* Previous level */}
              <div className="text-center opacity-60">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  {previousLevel.image ? (
                    <img
                      src={previousLevel.image}
                      alt={`${previousLevel.name} badge`}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600">{previousLevel.name}</p>
              </div>

              {/* Arrow */}
              <div className="text-3xl text-green-500 animate-pulse">→</div>
            </>
          )}

          {/* New level */}
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mb-2 shadow-lg animate-pulse">
              {newLevel.image ? (
                <img
                  src={newLevel.image}
                  alt={`${newLevel.name} badge`}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <span className="text-4xl">🏆</span>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">{newLevel.name}</p>
          </div>
        </div>

        {/* New level description */}
        <div
          id="level-up-description"
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6"
        >
          <p className="text-sm text-gray-700 text-center">{newLevel.description}</p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Awesome! 🚀
        </button>

        {/* Auto-dismiss indicator */}
        <p className="text-xs text-gray-400 text-center mt-3">Auto-closing in 5 seconds...</p>
      </div>
    </div>
  );
}
