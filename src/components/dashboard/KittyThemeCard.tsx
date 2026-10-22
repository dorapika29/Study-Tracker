'use client';

import { useTheme } from '@/lib/theme-provider';
import { Sparkles, Star, Heart, Crown, Cat, Flower } from 'lucide-react';

export function KittyThemeCard() {
  const { theme } = useTheme();

  if (theme !== 'hello-kitty') return null;

  return (
    <div className="hello-kitty-card p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-2 right-2 text-pink-300 text-xl">⭐</div>
      <div className="absolute top-1/2 right-4 text-pink-400 text-lg">💖</div>
      <div className="absolute bottom-4 right-2 text-pink-300 text-lg">🌸</div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-pink-500" />
          <h3 className="font-bold text-lg" style={{ color: '#1E293B' }}>
            Kitty Theme Settings
          </h3>
        </div>

        {/* Hello Kitty Face SVG */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              {/* Face circle */}
              <circle cx="40" cy="45" r="28" fill="#FFFFFF" stroke="#FFB6C1" strokeWidth="2" />
              {/* Eyes */}
              <ellipse cx="32" cy="40" rx="4" ry="5" fill="#1E293B" />
              <ellipse cx="48" cy="40" rx="4" ry="5" fill="#1E293B" />
              {/* Nose */}
              <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#FF6B9D" />
              {/* Whiskers */}
              <line x1="20" y1="44" x2="30" y2="42" stroke="#FFB6C1" strokeWidth="1.5" />
              <line x1="20" y1="48" x2="30" y2="48" stroke="#FFB6C1" strokeWidth="1.5" />
              <line x1="50" y1="42" x2="60" y2="44" stroke="#FFB6C1" strokeWidth="1.5" />
              <line x1="50" y1="48" x2="60" y2="48" stroke="#FFB6C1" strokeWidth="1.5" />
              {/* Mouth */}
              <path d="M 36 52 Q 40 56 44 52" stroke="#FF6B9D" strokeWidth="2" fill="none" />
              {/* Bow */}
              <ellipse cx="56" cy="34" rx="6" ry="5" fill="#FF6B9D" />
              <path d="M 50 34 L 46 28 L 56 34 L 46 40 Z" fill="#FF6B9D" />
              <path d="M 62 34 L 66 28 L 56 34 L 66 40 Z" fill="#FF6B9D" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: '#FF6B9D' }}>
            Theme applied: Pastel Pink & Stars
          </p>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
            Soft pinks, white cards, and cute accents
          </p>
        </div>
      </div>
    </div>
  );
}