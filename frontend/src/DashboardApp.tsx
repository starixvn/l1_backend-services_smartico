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
import { ThemeCustomizer } from './components/dashboard/ThemeCustomizer';
import { useReducedMotion } from './hooks/useReducedMotion';

export function DashboardApp() {
  const [isLayoutCustomizerOpen, setIsLayoutCustomizerOpen] = useState(false);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Listen for custom event to open layout customizer
  useEffect(() => {
    const handleOpenCustomizer = () => setIsLayoutCustomizerOpen(true);
    window.addEventListener('open-layout-customizer', handleOpenCustomizer);
    return () => window.removeEventListener('open-layout-customizer', handleOpenCustomizer);
  }, []);

  return (
    <DashboardProvider>
      <DashboardLayout pageTitle="Dashboard">
        <div className="space-y-6">
          {/* Customization Buttons */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">
                Welcome back! Here's your gamification overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Customizer Button */}
              <motion.button
                whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => setIsThemeCustomizerOpen(true)}
                className="
                  px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600
                  hover:from-pink-700 hover:to-purple-700
                  text-white text-sm font-medium rounded-lg
                  transition-all shadow-lg shadow-pink-500/30
                  focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900
                  flex items-center gap-2
                "
                title="Customize Theme"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                <span>Theme</span>
              </motion.button>

              {/* Layout Customizer Button */}
              <motion.button
                whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => setIsLayoutCustomizerOpen(true)}
                className="
                  px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
                  hover:from-purple-700 hover:to-pink-700
                  text-white text-sm font-medium rounded-lg
                  transition-all shadow-lg shadow-purple-500/30
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
                  flex items-center gap-2
                "
                title="Customize Layout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                <span>Layout</span>
              </motion.button>
            </div>
          </div>

          {/* Widget Grid */}
          <WidgetGrid />
        </div>
      </DashboardLayout>

      {/* Layout Customizer Modal */}
      <LayoutCustomizer
        isOpen={isLayoutCustomizerOpen}
        onClose={() => setIsLayoutCustomizerOpen(false)}
      />

      {/* Theme Customizer Modal */}
      <ThemeCustomizer
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
      />
    </DashboardProvider>
  );
}
