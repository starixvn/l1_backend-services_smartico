/**
 * NavigationItem Component
 * Individual navigation menu item with active state and gradient highlight.
 */

import { forwardRef, ReactNode, KeyboardEvent } from 'react';

/**
 * Navigation item data structure.
 */
export interface NavigationItemData {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation href */
  href: string;
  /** Icon element */
  icon: ReactNode;
}

/**
 * Props for NavigationItem component.
 */
export interface NavigationItemProps {
  /** Navigation item data */
  data: NavigationItemData;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Click handler */
  onClick: () => void;
  /** Keyboard event handler */
  onKeyDown?: (e: KeyboardEvent<HTMLAnchorElement>) => void;
  /** ARIA role */
  role?: string;
}

/**
 * NavigationItem component.
 * Displays a single navigation menu item with icon, label, and active state.
 *
 * @param props - Component props
 * @param ref - Forwarded ref for keyboard navigation
 * @returns Navigation menu item
 */
export const NavigationItem = forwardRef<HTMLAnchorElement, NavigationItemProps>(
  ({ data, isActive, onClick, onKeyDown, role = 'menuitem' }, ref) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Update the URL hash to trigger hash-based routing
      window.location.hash = data.href.slice(1); // Remove # from href
      onClick();
    };

    return (
      <a
        ref={ref}
        href={data.href}
        onClick={handleClick}
        onKeyDown={onKeyDown}
        role={role}
        aria-current={isActive ? 'page' : undefined}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900
          ${
            isActive
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        {/* Icon */}
        <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}>
          {data.icon}
        </span>

        {/* Label */}
        <span className="font-medium">{data.label}</span>

        {/* Active Indicator */}
        {isActive && (
          <span className="ml-auto">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </a>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';
