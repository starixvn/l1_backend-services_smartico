/**
 * ThemeCustomizer Component
 * Modal for customizing theme settings (presets, colors, font size, animations).
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ThemePresetGrid } from './ThemePresetGrid';
import { CustomColorPicker } from './CustomColorPicker';
import type { ThemeConfig, FontSize } from '../../types/dashboard/theme';

/**
 * Font size label mapping.
 */
const FONT_SIZE_LABELS: Record<FontSize, string> = {
  14: 'Small',
  16: 'Medium',
  18: 'Large',
};

/**
 * ThemeCustomizer component props.
 */
interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ThemeCustomizer component.
 * Modal for managing theme settings with presets and custom colors.
 */
export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const { theme, setTheme, resetTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  // Local state for draft changes (apply on save)
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>({
    mode: theme.mode,
    preset: theme.preset,
    primaryColor: theme.primaryColor || '#9333ea',
    accentColor: theme.accentColor || '#ec4899',
    fontSize: theme.fontSize,
    animationIntensity: theme.animationIntensity,
  });

  // Update draft when theme changes
  useEffect(() => {
    setDraftTheme({
      mode: theme.mode,
      preset: theme.preset,
      primaryColor: theme.primaryColor || '#9333ea',
      accentColor: theme.accentColor || '#ec4899',
      fontSize: theme.fontSize,
      animationIntensity: theme.animationIntensity,
    });
  }, [theme]);

  // Handle preset selection
  const handlePresetSelect = (preset: ThemeConfig['preset']) => {
    setDraftTheme((prev) => ({
      ...prev,
      preset,
    }));
  };

  // Handle color change
  const handleColorChange = (key: 'primaryColor' | 'accentColor', value: string) => {
    setDraftTheme((prev) => ({
      ...prev,
      [key]: value,
      preset: 'custom', // Switch to custom when colors change
    }));
  };

  // Handle mode toggle
  const handleModeToggle = () => {
    setDraftTheme((prev) => ({
      ...prev,
      mode: prev.mode === 'dark' ? 'light' : 'dark',
    }));
  };

  // Handle font size change
  const handleFontSizeChange = (fontSize: FontSize) => {
    setDraftTheme((prev) => ({
      ...prev,
      fontSize,
    }));
  };

  // Handle animation intensity change
  const handleAnimationIntensityChange = (animationIntensity: ThemeConfig['animationIntensity']) => {
    setDraftTheme((prev) => ({
      ...prev,
      animationIntensity,
    }));
  };

  // Handle save
  const handleSave = () => {
    setTheme(draftTheme);
    onClose();
  };

  // Handle reset
  const handleReset = () => {
    resetTheme();
    setDraftTheme({
      mode: 'dark',
      preset: 'royal-purple',
      primaryColor: '#9333ea',
      accentColor: '#ec4899',
      fontSize: 16,
      animationIntensity: 'moderate',
    });
  };

  // Handle cancel (revert draft)
  const handleCancel = () => {
    setDraftTheme({
      mode: theme.mode,
      preset: theme.preset,
      primaryColor: theme.primaryColor || '#9333ea',
      accentColor: theme.accentColor || '#ec4899',
      fontSize: theme.fontSize,
      animationIntensity: theme.animationIntensity,
    });
    onClose();
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(draftTheme, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `theme-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string) as ThemeConfig;
        setDraftTheme(importedTheme);
      } catch (error) {
        console.error('Failed to import theme:', error);
        alert('Invalid theme file. Please select a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="
                glass-dark-strong rounded-2xl border border-purple-500/30
                max-w-4xl w-full max-h-[85vh] overflow-hidden
                shadow-2xl shadow-purple-500/20
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>🎨</span> Theme Customizer
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="
                      text-gray-400 hover:text-white
                      transition-colors p-2 rounded-lg
                      hover:bg-white/5
                      focus:outline-none focus:ring-2 focus:ring-purple-500
                    "
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Customize your dashboard appearance with presets or create your own theme
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="space-y-8">
                  {/* Theme Presets */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                      </svg>
                      Theme Presets
                    </h3>
                    <ThemePresetGrid
                      selectedPreset={draftTheme.preset}
                      onPresetSelect={handlePresetSelect}
                    />
                  </div>

                  {/* Custom Colors */}
                  {draftTheme.preset === 'custom' && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                        Custom Colors
                      </h3>
                      <CustomColorPicker
                        primaryColor={draftTheme.primaryColor || '#9333ea'}
                        accentColor={draftTheme.accentColor || '#ec4899'}
                        onPrimaryColorChange={(color) => handleColorChange('primaryColor', color)}
                        onAccentColorChange={(color) => handleColorChange('accentColor', color)}
                      />
                    </div>
                  )}

                  {/* Light/Dark Mode Toggle */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      Appearance Mode
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleModeToggle}
                        className={`
                          flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all
                          ${
                            draftTheme.mode === 'dark'
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                          }
                        `}
                      >
                        <span className="text-2xl">🌙</span>
                        <span className="text-sm font-medium text-white">Dark Mode</span>
                      </button>
                      <button
                        onClick={handleModeToggle}
                        className={`
                          flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all
                          ${
                            draftTheme.mode === 'light'
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                          }
                        `}
                      >
                        <span className="text-2xl">☀️</span>
                        <span className="text-sm font-medium text-white">Light Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Font Size
                    </h3>
                    <div className="flex items-center gap-3">
                      {([14, 16, 18] as FontSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleFontSizeChange(size)}
                          className={`
                            px-4 py-2 rounded-lg border-2 transition-all
                            ${
                              draftTheme.fontSize === size
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-slate-600 bg-slate-800/30 text-gray-400 hover:border-slate-500'
                            }
                          `}
                        >
                          {FONT_SIZE_LABELS[size]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Animation Intensity */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Animation Intensity
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(['none', 'subtle', 'moderate', 'full'] as const).map((intensity) => (
                        <button
                          key={intensity}
                          onClick={() => handleAnimationIntensityChange(intensity)}
                          className={`
                            px-4 py-2 rounded-lg border-2 transition-all capitalize
                            ${
                              draftTheme.animationIntensity === intensity
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-slate-600 bg-slate-800/30 text-gray-400 hover:border-slate-500'
                            }
                          `}
                        >
                          {intensity}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Import/Export */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Import / Export Theme
                    </h3>
                    <div className="flex items-center gap-3">
                      <label className="
                        px-4 py-2 bg-slate-700 hover:bg-slate-600
                        text-white text-sm font-medium rounded-lg
                        cursor-pointer transition-colors
                        focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900
                      ">
                        Import Theme
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="sr-only"
                        />
                      </label>
                      <button
                        onClick={handleExport}
                        className="
                          px-4 py-2 bg-slate-700 hover:bg-slate-600
                          text-white text-sm font-medium rounded-lg
                          transition-colors
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
                        "
                      >
                        Export Theme
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={handleReset}
                  className="
                    px-4 py-2 text-sm font-medium
                    text-gray-300 hover:text-white
                    bg-slate-700 hover:bg-slate-600
                    rounded-lg transition-colors
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900
                  "
                >
                  Reset to Default
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="
                      px-4 py-2 text-sm font-medium
                      text-gray-300 hover:text-white
                      hover:bg-white/5
                      rounded-lg transition-colors
                      focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    "
                  >
                    Cancel
                  </button>

                  <motion.button
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
                    onClick={handleSave}
                    className="
                      px-6 py-2 text-sm font-medium
                      bg-gradient-to-r from-purple-600 to-pink-600
                      hover:from-purple-700 hover:to-pink-700
                      text-white rounded-lg
                      transition-all shadow-lg shadow-purple-500/30
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
                    "
                  >
                    Save Theme
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
