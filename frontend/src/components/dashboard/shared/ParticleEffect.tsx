/**
 * ParticleEffect Component
 * Celebration particle animations for achievements and level-ups.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { ParticleEffectProps } from '../../../types/dashboard/components';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
}

/**
 * Generate random particles based on effect type.
 */
function generateParticles(
  count: number,
  type: 'confetti' | 'fireworks' | 'stars',
  colors: string[]
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const particle: Particle = {
      id: i,
      x: type === 'fireworks' ? 50 : Math.random() * 100,
      y: type === 'fireworks' ? 50 : Math.random() * 20,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: type === 'stars' ? 8 + Math.random() * 8 : 6 + Math.random() * 6,
    };
    particles.push(particle);
  }

  return particles;
}

/**
 * Default colors for particle effects.
 */
const DEFAULT_COLORS = {
  confetti: ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  fireworks: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399'],
  stars: ['#fbbf24', '#fcd34d'],
};

/**
 * ParticleEffect component.
 * Creates animated particles for celebrations.
 *
 * @param props - Component props
 * @returns Particle animation overlay
 */
export function ParticleEffect({
  type,
  count = 30,
  duration = 3000,
  colors,
  isActive,
  onComplete,
}: ParticleEffectProps) {
  const prefersReducedMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  // Reduce particle count on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = Math.min(count, isMobile ? 20 : 50);

  // Use default colors if not provided
  const particleColors = colors || DEFAULT_COLORS[type];

  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      // Generate particles
      const newParticles = generateParticles(particleCount, type, particleColors);
      setParticles(newParticles);

      // Auto-cleanup after duration
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else if (!isActive) {
      setParticles([]);
    }
  }, [isActive, type, particleCount, particleColors, duration, onComplete, prefersReducedMotion]);

  // Don't render anything if reduced motion is preferred or not active
  if (prefersReducedMotion || !isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => {
          const variants = {
            confetti: {
              initial: { x: particle.x + '%', y: particle.y + '%', opacity: 1, rotate: 0 },
              animate: {
                x: particle.x + (Math.random() - 0.5) * 100 + '%',
                y: '100vh',
                opacity: 0,
                rotate: particle.rotation + (Math.random() - 0.5) * 720,
              },
            },
            fireworks: {
              initial: { x: particle.x + '%', y: particle.y + '%', scale: 0, opacity: 1 },
              animate: {
                x: particle.x + (Math.random() - 0.5) * 150 + '%',
                y: particle.y + (Math.random() - 0.5) * 150 + '%',
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
              },
            },
            stars: {
              initial: { x: particle.x + '%', y: particle.y + '%', scale: 0, opacity: 1 },
              animate: {
                y: ['0%', '-20%', '100vh'],
                scale: [0, 1, 1, 0.5],
                opacity: [1, 1, 1, 0],
                rotate: [0, 180, 360],
              },
            },
          };

          const currentVariant = variants[type];

          return (
            <motion.div
              key={particle.id}
              initial={currentVariant.initial}
              animate={currentVariant.animate}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                ease: type === 'confetti' ? 'easeIn' : 'easeOut',
                delay: Math.random() * 0.3,
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: type === 'stars' ? '50%' : type === 'confetti' ? '2px' : '50%',
                willChange: 'transform, opacity',
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
