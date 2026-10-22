'use client';

import { useTheme } from '@/lib/theme-provider';
import { Button } from './Button';
import { Palette, Sparkles, Sun, Moon, Star, Heart, Bell, Crown } from 'lucide-react';
import { clsx } from 'clsx';

const themes = [
  {
    id: 'hello-kitty' as const,
    name: 'Hello Kitty',
    icon: Sparkles,
    avatar: '🐱',
    colors: ['#ff4d6f', '#ffa3b6', '#fff0f5', '#ffe0eb'],
    description: 'Soft pastel pinks with cute accents',
    bgClass: 'hello-kitty-bg',
  },
  {
    id: 'dorami' as const,
    name: 'Dorami',
    icon: Sun,
    avatar: '🌟',
    colors: ['#fde01a', '#fff37a', '#fffef0', '#fffce0'],
    description: 'Bright yellow with warm orange accents',
    bgClass: 'dorami-bg',
  },
  {
    id: 'classic' as const,
    name: 'Clean Classic',
    icon: Moon,
    avatar: '◆',
    colors: ['#334155', '#64748b', '#f8fafc', '#f1f5f9'],
    description: 'Minimalist neutral tones for focus',
    bgClass: 'classic-bg',
  },
];

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-[rgb(var(--muted))] rounded-xl p-1">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={clsx(
              'relative flex items-center justify-center rounded-lg p-2 transition-all duration-200',
              theme === t.id
                ? 'bg-[rgb(var(--background))] shadow-sm'
                : 'hover:bg-[rgb(var(--background))]'
            )}
            aria-label={t.name}
            aria-pressed={theme === t.id}
          >
            <span className="text-lg">{t.avatar}</span>
            {theme === t.id && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--primary-foreground))]" />
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-[rgb(var(--muted-foreground))]" />
        <span className="font-medium text-[rgb(var(--foreground))]">Theme</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={clsx(
              'relative group p-4 rounded-2xl border-2 transition-all duration-300',
              theme === t.id
                ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))/0.05] shadow-[0_0_0_2px_rgb(var(--primary))/0.2]'
                : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))/0.5] hover:shadow-md'
            )}
            aria-label={t.name}
            aria-pressed={theme === t.id}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{t.avatar}</span>
              {theme === t.id && (
                <div className="h-5 w-5 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--primary-foreground))]" />
                </div>
              )}
            </div>
            <div className="flex gap-1 mb-3" aria-hidden="true">
              {t.colors.map((color, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-[rgb(var(--foreground))] block mb-1">{t.name}</span>
            <span className="text-xs text-[rgb(var(--muted-foreground))] block">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}