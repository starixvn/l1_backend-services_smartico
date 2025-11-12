/**
 * Sidebar Component
 * Fixed navigation sidebar with glassmorphism design.
 */

import { useEffect, useRef } from 'react';
import { NavigationMenu } from './NavigationMenu';

/**
 * Props for Sidebar component.
 */
export interface SidebarProps {
  /** Whether mobile menu is open */
  isOpen: boolean;
  /** Callback when mobile menu closes */
  onClose: () => void;
}

/**
 * Sidebar component.
 * Provides navigation menu with responsive mobile support and glassmorphism design.
 *
 * @param props - Component props
 * @returns Sidebar navigation
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Get all focusable elements
    const focusableElements = sidebar.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when menu opens
    firstElement?.focus();

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-0 left-0 z-40 h-screen w-64
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        glass-sidebar
      `}
      aria-label="Main navigation"
      aria-expanded={isOpen}
    >
      {/* Logo/Branding */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Smartico
          </h1>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <NavigationMenu onNavigate={onClose} />

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-500/30">
        <p className="text-xs text-gray-400 text-center">
          Smartico Gamification v1.0.0
        </p>
      </div>
    </aside>
  );
}
