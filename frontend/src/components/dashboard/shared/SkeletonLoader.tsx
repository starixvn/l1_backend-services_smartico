/**
 * SkeletonLoader Component
 * Loading placeholder with shimmer animation.
 */

import type { SkeletonLoaderProps } from '../../../types/dashboard/components';

/**
 * SkeletonLoader component.
 * Displays animated loading placeholder.
 *
 * @param props - Component props
 * @returns Skeleton loading placeholder
 */
export function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  className = '',
}: SkeletonLoaderProps) {
  // Base skeleton classes with shimmer animation
  const baseClasses = 'bg-slate-700/50 animate-shimmer relative overflow-hidden';

  // Variant-specific classes
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl',
  };

  // Default sizes for variants
  const defaultSizes = {
    text: { width: '100%', height: '1rem' },
    circular: { width: '3rem', height: '3rem' },
    rectangular: { width: '100%', height: '8rem' },
    card: { width: '100%', height: '12rem' },
  };

  const widthStyle = width || defaultSizes[variant].width;
  const heightStyle = height || defaultSizes[variant].height;

  // Shimmer gradient overlay
  const shimmerOverlay = (
    <div
      className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
      style={{
        animation: 'shimmer 2s infinite',
      }}
    />
  );

  // Text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses.text}`}
            style={{
              width: index === lines - 1 ? '80%' : widthStyle,
              height: heightStyle,
            }}
          >
            {shimmerOverlay}
          </div>
        ))}
      </div>
    );
  }

  // Single skeleton element
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
      role="status"
      aria-label="Loading..."
    >
      {shimmerOverlay}
    </div>
  );
}
