'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar className={clsx('transition-transform duration-300 ease-in-out z-40', isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0')} />

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm animate-fade-in lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className={clsx('min-h-screen transition-all duration-300', isMobile ? 'ml-0' : 'ml-64')}>
        <Header />
        <div className="p-4 sm:p-6 lg:p-8" style={{ marginLeft: isMobile ? '0' : '16rem' }}>
          {children}
        </div>
      </main>

      {/* Mobile menu button is in Header */}
    </div>
  );
}