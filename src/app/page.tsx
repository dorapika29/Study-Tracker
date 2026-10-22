'use client';

import { Layout } from '@/components/layout/Layout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { useTheme } from '@/lib/theme-provider';

export default function HomePage() {
  const { theme } = useTheme();

  const getGreeting = () => {
    if (theme === 'hello-kitty') return 'Welcome back, Hello Kitty Fan!';
    if (theme === 'dorami') return 'Welcome back, Dorami Friend!';
    return 'Welcome back!';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]">
            {getGreeting()}
          </h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">
            {theme === 'hello-kitty'
              ? 'Track your progress with pastel pink stars and hearts 💖'
              : theme === 'dorami'
              ? 'Track your progress with bright yellow sunshine 🌟'
              : 'Track your progress and build better study habits'}
          </p>
        </div>
        <DashboardContent />
      </div>
    </Layout>
  );
}