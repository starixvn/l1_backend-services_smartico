/**
 * TopHeader Component
 * Sticky header with level, counters, notifications, and user avatar.
 */

import { useState, useEffect } from 'react';
import { useDashboardData } from '../../../hooks/useDashboardData';

/**
 * Props for TopHeader component.
 */
export interface TopHeaderProps {
  /** Current page title */
  pageTitle: string;
  /** Callback for mobile menu toggle */
  onMenuToggle: () => void;
}

/**
 * TopHeader component.
 * Displays page title, level badge, counters, notifications, and user profile.
 *
 * @param props - Component props
 * @returns Top header bar
 */
export function TopHeader({ pageTitle, onMenuToggle }: TopHeaderProps) {
  const { data, isLoading } = useDashboardData();
  const [notificationCount, setNotificationCount] = useState(0);

  // Initialize notification count from data
  useEffect(() => {
    if (data?.counters) {
      setNotificationCount(data.counters.notificationCount);
    }
  }, [data]);

  // TODO: Add SignalR listener for counter updates
  // useEffect(() => {
  //   const handleCounterUpdate = (event: CounterUpdateEvent) => {
  //     if (event.counters.notificationCount !== undefined) {
  //       setNotificationCount(event.counters.notificationCount);
  //     }
  //   };
  //
  //   signalrService.on('counter-update', handleCounterUpdate);
  //
  //   return () => {
  //     signalrService.off('counter-update', handleCounterUpdate);
  //   };
  // }, []);

  const counters = data?.counters || { coins: 0, gems: 0, diamonds: 0 };
  const level = data?.level || { currentLevel: 1 };

  return (
    <header className="sticky top-0 z-40 glass-header">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Section: Mobile Menu + Page Title + Level */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Page Title */}
          <h2 className="text-xl md:text-2xl font-bold text-white">{pageTitle}</h2>

          {/* Level Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-white">
              {isLoading ? '...' : `Level ${level.currentLevel}`}
            </span>
          </div>
        </div>

        {/* Right Section: Counters + Notifications + Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Coin Counter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-dark-subtle">
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-semibold text-white">
              {isLoading ? '...' : counters.coins.toLocaleString()}
            </span>
          </div>

          {/* Gem Counter */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-dark-subtle">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
            </svg>
            <span className="text-sm font-semibold text-white">
              {isLoading ? '...' : counters.gems.toLocaleString()}
            </span>
          </div>

          {/* Diamond Counter (Mobile: Show only diamonds) */}
          <div className="flex md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-dark-subtle">
            <svg
              className="w-5 h-5 text-pink-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-semibold text-white">
              {isLoading ? '...' : counters.diamonds.toLocaleString()}
            </span>
          </div>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
