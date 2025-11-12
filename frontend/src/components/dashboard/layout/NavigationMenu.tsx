/**
 * NavigationMenu Component
 * Container for navigation menu items with keyboard navigation support.
 */

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { NavigationItem, type NavigationItemData } from './NavigationItem';

/**
 * Props for NavigationMenu component.
 */
export interface NavigationMenuProps {
  /** Callback when navigation occurs (for closing mobile menu) */
  onNavigate?: () => void;
}

/**
 * Navigation menu items configuration.
 */
const MENU_ITEMS: NavigationItemData[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '#dashboard',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    id: 'progress',
    label: 'Progress',
    href: '#progress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'rewards',
    label: 'Rewards',
    href: '#rewards',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'vip-tiers',
    label: 'VIP Tiers',
    href: '#vip-tiers',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ),
  },
  {
    id: 'daily-login',
    label: 'Daily Login',
    href: '#daily-login',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'referrals',
    label: 'Referrals',
    href: '#referrals',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
      </svg>
    ),
  },
  {
    id: 'activity-feed',
    label: 'Activity Feed',
    href: '#activity-feed',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '#settings',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

/**
 * NavigationMenu component.
 * Provides navigation menu with keyboard support (Arrow keys, Enter, Escape).
 *
 * @param props - Component props
 * @returns Navigation menu
 */
export function NavigationMenu({ onNavigate }: NavigationMenuProps) {
  const [activeItemId, setActiveItemId] = useState<string>('dashboard');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        {
          const nextIndex = (index + 1) % MENU_ITEMS.length;
          setFocusedIndex(nextIndex);
          itemRefs.current[nextIndex]?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        {
          const prevIndex = (index - 1 + MENU_ITEMS.length) % MENU_ITEMS.length;
          setFocusedIndex(prevIndex);
          itemRefs.current[prevIndex]?.focus();
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        {
          const lastIndex = MENU_ITEMS.length - 1;
          setFocusedIndex(lastIndex);
          itemRefs.current[lastIndex]?.focus();
        }
        break;
    }
  };

  // Handle navigation item click
  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId);
    onNavigate?.();
  };

  // Detect active item from URL hash (for demo purposes)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove #
      const matchingItem = MENU_ITEMS.find((item) => item.href === `#${hash}`);
      if (matchingItem) {
        setActiveItemId(matchingItem.id);
      }
    };

    // Set initial active item
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <nav
      className="flex-1 px-4 py-6 overflow-y-auto"
      role="navigation"
      aria-label="Main navigation menu"
    >
      <ul className="space-y-2" role="menu">
        {MENU_ITEMS.map((item, index) => (
          <li key={item.id} role="none">
            <NavigationItem
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              data={item}
              isActive={activeItemId === item.id}
              onClick={() => handleItemClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              role="menuitem"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
