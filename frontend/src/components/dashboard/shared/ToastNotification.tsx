/**
 * ToastNotification Component
 * Temporary notification toast with auto-dismiss.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { ToastNotificationProps } from '../../../types/dashboard/components';

/**
 * Toast type configuration (icons and colors).
 */
const TOAST_CONFIG = {
  success: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: 'bg-green-500',
    borderColor: 'border-green-500/50',
  },
  error: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: 'bg-red-500',
    borderColor: 'border-red-500/50',
  },
  warning: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500/50',
  },
  info: {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: 'bg-blue-500',
    borderColor: 'border-blue-500/50',
  },
};

/**
 * ToastNotification component.
 * Displays temporary notification message with auto-dismiss.
 *
 * @param props - Component props
 * @returns Toast notification
 */
export function ToastNotification({
  message,
  type,
  duration = 3000,
  isVisible,
  onClose,
}: ToastNotificationProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = TOAST_CONFIG[type];

  // Auto-dismiss after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -50, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, x: 100, scale: 0.95 }
            }
            transition={{
              duration: 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            className={`
              glass-dark-strong rounded-lg border ${config.borderColor} shadow-lg
              p-4 flex items-center gap-3
            `}
            role="alert"
            aria-live="assertive"
          >
            {/* Icon */}
            <div className={`flex-shrink-0 text-white ${config.color} rounded-full p-1`}>
              {config.icon}
            </div>

            {/* Message */}
            <p className="flex-1 text-white font-medium">
              {message}
            </p>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
