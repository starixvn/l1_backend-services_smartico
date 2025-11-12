/**
 * EmptyState Component
 * Displays when no data is available with optional action button.
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { EmptyStateProps } from '../../../types/dashboard/components';

/**
 * Default empty state icon (inbox).
 */
const DefaultIcon = () => (
  <svg
    className="w-16 h-16 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

/**
 * EmptyState component.
 * Displays centered message when no data is available.
 *
 * @param props - Component props
 * @returns Empty state UI
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="mb-4">
        {icon || <DefaultIcon />}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-400 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <motion.button
          onClick={action.onClick}
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg shadow-purple-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
