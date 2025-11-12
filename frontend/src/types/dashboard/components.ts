/**
 * Component prop interfaces for shared dashboard components.
 */

import { ReactNode } from 'react';

/**
 * Rarity levels for rewards and achievements
 */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/**
 * Props for AnimatedCard component (glassmorphism wrapper with animations).
 */
export interface AnimatedCardProps {
  /** Card content */
  children: ReactNode;
  /** Optional CSS class name */
  className?: string;
  /** Rarity level (affects border color) */
  rarity?: Rarity;
  /** Click handler */
  onClick?: () => void;
  /** Delay for staggered entrance animation (in ms) */
  delay?: number;
  /** Whether card is clickable/interactive */
  isInteractive?: boolean;
}

/**
 * Props for ProgressRing component (circular progress indicator).
 */
export interface ProgressRingProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Ring size in pixels */
  size?: number;
  /** Ring thickness in pixels */
  thickness?: number;
  /** Ring color (CSS color value) */
  color?: string;
  /** Background ring color */
  backgroundColor?: string;
  /** Whether to show percentage text */
  showPercentage?: boolean;
  /** Whether to show pulsing glow at 100% */
  showGlow?: boolean;
  /** Optional label text */
  label?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for ParticleEffect component (celebration particles).
 */
export interface ParticleEffectProps {
  /** Particle effect type */
  type: 'confetti' | 'fireworks' | 'stars';
  /** Number of particles (max 50 on desktop, 20 on mobile) */
  count?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Colors for particles */
  colors?: string[];
  /** Whether effect is active */
  isActive: boolean;
  /** Callback when effect completes */
  onComplete?: () => void;
}

/**
 * Props for SkeletonLoader component (loading placeholder).
 */
export interface SkeletonLoaderProps {
  /** Skeleton variant/size */
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Number of skeleton lines (for text variant) */
  lines?: number;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for ToastNotification component.
 */
export interface ToastNotificationProps {
  /** Toast message */
  message: string;
  /** Toast type */
  type: 'success' | 'error' | 'warning' | 'info';
  /** Duration in milliseconds before auto-dismiss */
  duration?: number;
  /** Whether toast is visible */
  isVisible: boolean;
  /** Callback when toast closes */
  onClose: () => void;
}

/**
 * Props for ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Fallback UI to show on error */
  fallback?: ReactNode;
  /** Error handler callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Props for EmptyState component.
 */
export interface EmptyStateProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional CSS class name */
  className?: string;
}
