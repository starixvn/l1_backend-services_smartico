/**
 * DashboardApp - Standalone entry point for new dashboard
 *
 * To use this dashboard, update main.tsx to import DashboardApp instead of App:
 *
 * import { DashboardApp } from './DashboardApp'
 *
 * root.render(
 *   <StrictMode>
 *     <DashboardApp />
 *   </StrictMode>,
 * )
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from './components/dashboard/layout';
import { DashboardProvider } from './contexts';
import { WidgetGrid } from './components/dashboard/WidgetGrid';
import { LayoutCustomizer } from './components/dashboard/LayoutCustomizer';
import { useReducedMotion } from './hooks/useReducedMotion';

export function DashboardApp() {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Listen for custom event to open customizer
  useEffect(() => {
    const handleOpenCustomizer = () => setIsCustomizerOpen(true);
    window.addEventListener('open-layout-customizer', handleOpenCustomizer);
    return () => window.removeEventListener('open-layout-customizer', handleOpenCustomizer);
  }, []);

  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Dashboard">
        <div className="space-y-6">
          {/* Layout Customizer Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">
                Welcome back! Here's your gamification overview.
              </p>
            </div>
            <motion.button
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              onClick={() => setIsCustomizerOpen(true)}
              className="
                px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
                hover:from-purple-700 hover:to-pink-700
                text-white text-sm font-medium rounded-lg
                transition-all shadow-lg shadow-purple-500/30
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
                flex items-center gap-2
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              <span>Customize Layout</span>
            </motion.button>
          </div>

          {/* Widget Grid */}
          <WidgetGrid />
        </div>
      </DashboardLayout>

      {/* Layout Customizer Modal */}
      <LayoutCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </DashboardProvider>
  );
}
