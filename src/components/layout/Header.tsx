'use client';

import { Menu, Bell, Sun, Moon, User, Sparkles, Star, Crown } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { clsx } from 'clsx';
import { useState } from 'react';

const themeAvatars: Record<string, string> = {
  'hello-kitty': '🐱',
  dorami: '🌟',
  classic: '◆',
};

export function Header() {
  const { theme, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    const themes: Array<'hello-kitty' | 'dorami' | 'classic'> = ['hello-kitty', 'dorami', 'classic'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[rgb(var(--background))]/80 backdrop-blur-lg border-b border-[rgb(var(--border))]">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between" style={{ marginLeft: '16rem' }}>
        {/* Left side - Mobile menu button */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Center - Theme switcher (compact) */}
        <div className="hidden md:flex items-center">
          <ThemeSwitcher compact />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Theme toggle (cycle) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] transition-colors"
            aria-label={`Switch from ${theme} theme`}
          >
            {theme === 'hello-kitty' && <Sun className="h-5 w-5" />}
            {theme === 'dorami' && <Moon className="h-5 w-5" />}
            {theme === 'classic' && <Sun className="h-5 w-5" />}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="h-8 w-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center">
                <User className="h-4 w-4 text-[rgb(var(--primary-foreground))]" />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--card))] rounded-xl border border-[rgb(var(--border))] shadow-lg py-2 animate-fade-in">
                <ThemeSwitcher />
                <hr className="my-2 border-[rgb(var(--border))]" />
                <button className="w-full px-4 py-2 text-left text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <span>Toggle Theme</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}