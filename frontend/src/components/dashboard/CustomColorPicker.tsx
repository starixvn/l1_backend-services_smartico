/**
 * CustomColorPicker Component
 * HSL color picker with contrast validation for custom themes.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Convert hex color to RGB.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance for WCAG contrast ratio.
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors.
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validate hex color format.
 */
function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * CustomColorPicker component props.
 */
interface CustomColorPickerProps {
  primaryColor: string;
  accentColor: string;
  onPrimaryColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
}

/**
 * CustomColorPicker component.
 * Allows custom color selection with contrast validation.
 */
export function CustomColorPicker({
  primaryColor,
  accentColor,
  onPrimaryColorChange,
  onAccentColorChange,
}: CustomColorPickerProps) {
  const [primaryInput, setPrimaryInput] = useState(primaryColor);
  const [accentInput, setAccentInput] = useState(accentColor);

  // Sync with parent
  useEffect(() => {
    setPrimaryInput(primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    setAccentInput(accentColor);
  }, [accentColor]);

  // Validate colors
  const isPrimaryValid = isValidHexColor(primaryInput);
  const isAccentValid = isValidHexColor(accentInput);

  // Calculate contrast ratio (against dark background #0f172a)
  const darkBg = '#0f172a';
  const primaryContrast = isPrimaryValid ? getContrastRatio(primaryInput, darkBg) : 0;
  const accentContrast = isAccentValid ? getContrastRatio(accentInput, darkBg) : 0;

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const primaryPassesAA = primaryContrast >= 4.5;
  const accentPassesAA = accentContrast >= 4.5;

  // Handle primary color change
  const handlePrimaryChange = (value: string) => {
    setPrimaryInput(value);
    if (isValidHexColor(value)) {
      onPrimaryColorChange(value);
    }
  };

  // Handle accent color change
  const handleAccentChange = (value: string) => {
    setAccentInput(value);
    if (isValidHexColor(value)) {
      onAccentColorChange(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Primary Color
        </label>
        <div className="flex items-center gap-4">
          {/* Color Input */}
          <input
            type="color"
            value={primaryInput}
            onChange={(e) => handlePrimaryChange(e.target.value)}
            className="w-20 h-20 rounded-lg border-2 border-slate-600 cursor-pointer"
          />

          {/* Hex Input */}
          <div className="flex-1">
            <input
              type="text"
              value={primaryInput}
              onChange={(e) => handlePrimaryChange(e.target.value.toUpperCase())}
              placeholder="#9333EA"
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors
                bg-slate-800 text-white font-mono text-sm
                ${
                  isPrimaryValid
                    ? 'border-slate-600 focus:border-purple-500'
                    : 'border-red-500 focus:border-red-400'
                }
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
              `}
            />
            {!isPrimaryValid && (
              <p className="mt-2 text-xs text-red-400">
                Invalid hex color format. Use #RRGGBB (e.g., #9333EA)
              </p>
            )}
          </div>

          {/* Preview Card */}
          <div
            className="w-20 h-20 rounded-lg border-2 border-white/20 flex items-center justify-center"
            style={{ backgroundColor: primaryInput }}
          >
            <span className="text-xs font-bold text-white drop-shadow-lg">Aa</span>
          </div>
        </div>

        {/* Contrast Ratio */}
        {isPrimaryValid && (
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold
                ${
                  primaryPassesAA
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }
              `}
            >
              {primaryPassesAA ? '✓' : '⚠️'} Contrast: {primaryContrast.toFixed(2)}:1
            </div>
            {!primaryPassesAA && (
              <p className="text-xs text-gray-400">
                WCAG AA requires 4.5:1 for normal text
              </p>
            )}
          </div>
        )}
      </div>

      {/* Accent Color */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Accent Color
        </label>
        <div className="flex items-center gap-4">
          {/* Color Input */}
          <input
            type="color"
            value={accentInput}
            onChange={(e) => handleAccentChange(e.target.value)}
            className="w-20 h-20 rounded-lg border-2 border-slate-600 cursor-pointer"
          />

          {/* Hex Input */}
          <div className="flex-1">
            <input
              type="text"
              value={accentInput}
              onChange={(e) => handleAccentChange(e.target.value.toUpperCase())}
              placeholder="#EC4899"
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors
                bg-slate-800 text-white font-mono text-sm
                ${
                  isAccentValid
                    ? 'border-slate-600 focus:border-purple-500'
                    : 'border-red-500 focus:border-red-400'
                }
                focus:outline-none focus:ring-2 focus:ring-purple-500/50
              `}
            />
            {!isAccentValid && (
              <p className="mt-2 text-xs text-red-400">
                Invalid hex color format. Use #RRGGBB (e.g., #EC4899)
              </p>
            )}
          </div>

          {/* Preview Card */}
          <div
            className="w-20 h-20 rounded-lg border-2 border-white/20 flex items-center justify-center"
            style={{ backgroundColor: accentInput }}
          >
            <span className="text-xs font-bold text-white drop-shadow-lg">Aa</span>
          </div>
        </div>

        {/* Contrast Ratio */}
        {isAccentValid && (
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`
                px-3 py-1.5 rounded-full text-xs font-semibold
                ${
                  accentPassesAA
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }
              `}
            >
              {accentPassesAA ? '✓' : '⚠️'} Contrast: {accentContrast.toFixed(2)}:1
            </div>
            {!accentPassesAA && (
              <p className="text-xs text-gray-400">
                WCAG AA requires 4.5:1 for normal text
              </p>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="glass-dark-strong rounded-lg p-6 border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-4">Theme Preview</h4>
        <div className="space-y-3">
          {/* Gradient Preview */}
          <div
            className="h-24 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primaryInput} 0%, ${accentInput} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            <span className="relative text-white font-bold text-lg drop-shadow-lg">
              Preview Gradient
            </span>
          </div>

          {/* Button Preview */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg font-medium text-white transition-all shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryInput} 0%, ${accentInput} 100%)`,
              boxShadow: `0 10px 25px -5px ${primaryInput}30`,
            }}
          >
            Button Preview
          </motion.button>
        </div>
      </div>
    </div>
  );
}
