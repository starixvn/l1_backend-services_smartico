/**
 * DashboardLayout Component
 * Root shell for the gamification dashboard with sidebar and content area.
 */

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

/**
 * Props for DashboardLayout component.
 */
export interface DashboardLayoutProps {
  /** Main content area */
  children: ReactNode;
  /** Current page title */
  pageTitle?: string;
}

/**
 * DashboardLayout component.
 * Provides the main layout structure with sidebar navigation and top header.
 *
 * @param props - Component props
 * @returns Dashboard layout with sidebar and content area
 */
export function DashboardLayout({ children, pageTitle = 'Dashboard' }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={handleMobileMenuClose} />

      {/* Main Content Area */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <TopHeader pageTitle={pageTitle} onMenuToggle={handleMobileMenuToggle} />

        {/* Main Content */}
        <main
          id="main-content"
          className="p-4 md:p-6 lg:p-8"
          role="main"
          aria-label="Dashboard content"
        >
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={handleMobileMenuClose}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
