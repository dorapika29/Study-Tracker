'use client';

import { Clock, BookOpen, CheckCircle, Flame } from 'lucide-react';
import { 
  getTodayStudyTime, 
  getWeekStudyTime, 
  getMonthStudyTime, 
  getActiveCoursesCount, 
  getCompletedTopicsCount, 
  getTotalTopicsCount, 
  getRevisionStreak, 
  getDailyStats, 
  subscribeToData 
} from '@/lib/storage';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-provider';

function formatTime(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function StatsCards() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalTime: 0,
    todayTime: 0,
    weekTime: 0,
    monthTime: 0,
    activeCourses: 0,
    completedTopics: 0,
    totalTopics: 0,
    streak: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        totalTime: getTotalTime(),
        todayTime: getTodayStudyTime(),
        weekTime: getWeekStudyTime(),
        monthTime: getMonthStudyTime(),
        activeCourses: getActiveCoursesCount(),
        completedTopics: getCompletedTopicsCount(),
        totalTopics: getTotalTopicsCount(),
        streak: getRevisionStreak(),
      });
    };

    updateStats();
    const unsubscribe = subscribeToData(updateStats);
    return unsubscribe;
  }, []);

  const statItems = [
    {
      title: "Today's Study",
      value: formatTime(stats.todayTime),
      icon: Clock,
    },
    {
      title: "This Week",
      value: formatTime(stats.weekTime),
      icon: Clock,
    },
    {
      title: "Active Courses",
      value: stats.activeCourses,
      icon: BookOpen,
    },
    {
      title: "Revision Streak",
      value: `${stats.streak} days`,
      icon: Flame,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        const cardStyle = theme === 'hello-kitty' 
          ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,209,220,0.85) 100%)' }
          : theme === 'dorami'
          ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,243,205,0.85) 100%)' }
          : {};

        return (
          <div 
            key={stat.title}
            className="relative p-6 rounded-3xl border border-pink-200 shadow-md overflow-hidden flex flex-col justify-between h-36"
            style={cardStyle}
          >
            {/* Header: Title & Icon */}
            <div className="flex items-center justify-between z-10">
              <p className="text-xs font-bold uppercase tracking-wider text-pink-900 opacity-80">
                {stat.title}
              </p>
              <div className="p-2.5 bg-white/70 rounded-full shadow-sm z-10">
                <Icon className="w-5 h-5 text-pink-700" />
              </div>
            </div>

            {/* Value */}
            <div className="text-3xl font-extrabold font-mono text-pink-950 z-10 my-auto">
              {stat.value}
            </div>

            {/* Character Images positioned properly */}
            {theme === 'hello-kitty' && (
              <img 
                src="/images/kitty-image.png" 
                alt="Hello Kitty" 
                className="absolute right-2 bottom-1 w-24 h-24 object-contain z-20 pointer-events-none"
              />
            )}
            {theme === 'dorami' && (
              <img 
                src="/images/dorami-image.png" 
                alt="Dorami" 
                className="absolute right-2 bottom-1 w-24 h-24 object-contain z-20 pointer-events-none"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function getTotalTime() {
  const stats = getDailyStats(30);
  return stats.reduce((sum, d) => sum + d.minutes, 0);
}