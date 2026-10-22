'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, BookOpen, Clock, Settings, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/lib/theme-provider';

const navigation = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/courses', label: 'Courses', icon: BookOpen },
  { href: '/timer', label: 'Study Timer', icon: Clock },
  { href: '/stats', label: 'Statistics', icon: Target },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const themeAvatars: Record<string, string> = {
  'hello-kitty': '🐱',
  dorami: '🌟',
  classic: '◆',
};

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getSidebarBg = () => {
    if (theme === 'hello-kitty') return '#FFF0F5';
    if (theme === 'dorami') return '#FFF8E0';
    return '#F1F5F9';
  };

  const getActiveLinkStyle = () => {
    if (theme === 'hello-kitty') return 'bg-white text-[#1E293B] shadow-sm';
    if (theme === 'dorami') return 'bg-yellow-50 text-[#1E293B] shadow-sm';
    return 'bg-white text-[#1E293B] shadow-sm';
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur border shadow-md"
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop overlay for mobile view */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="md:hidden fixed inset-0 bg-black/40 z-30" 
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={clsx(
          "fixed left-0 top-0 z-40 h-screen w-64 flex flex-col transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
        style={{ backgroundColor: getSidebarBg(), color: '#1E293B' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <Link href="/" className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: theme === 'hello-kitty' ? '#FFB6C1' : theme === 'dorami' ? '#FDD835' : '#475569' }}
            >
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="font-rounded text-xl font-bold" style={{ color: '#1E293B' }}>
              StudyTracker
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'sidebar-link rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 flex items-center gap-3',
                  isActive
                    ? getActiveLinkStyle()
                    : 'text-[#475569] hover:bg-white/50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Indicator */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
            <span className="text-lg">{themeAvatars[theme]}</span>
            <span className="font-medium capitalize">{theme}</span>
            <span>theme</span>
          </div>
        </div>
      </aside>
    </>
  );
}