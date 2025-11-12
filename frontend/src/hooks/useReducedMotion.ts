/**
 * useReducedMotion hook for detecting prefers-reduced-motion preference.
 * Respects user's OS-level motion preferences for accessibility.
 */

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if user prefers reduced motion (WCAG 2.1 AA compliance).
 * Listens to system preference and returns boolean.
 *
 * @returns True if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check on mount
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    // Listen for changes to prefers-reduced-motion
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(event.matches);
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback to deprecated addListener for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener?.(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get Framer Motion transition config based on reduced motion preference.
 *
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Framer Motion transition config
 */
export function getMotionConfig(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  };
}
