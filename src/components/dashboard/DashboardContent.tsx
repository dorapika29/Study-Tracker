'use client';

import { StatsCards } from './StatsCards';
import { QuickAddTimer } from './QuickAddTimer';
import { RecentSessions } from './RecentSessions';
import { KittyThemeCard } from './KittyThemeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getCourses, getTopics, getStudySessions, getTotalStudyTime, getMonthStudyTime, getCompletedTopicsCount, getDailyGoal, getTodayStudyTime, subscribeToData } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Target, Clock, Calendar, CheckCircle, PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { clsx } from 'clsx';

export function DashboardContent() {
  const [courseProgress, setCourseProgress] = useState<Array<{
    id: string;
    name: string;
    totalTopics: number;
    completedTopics: number;
    totalTime: number;
    progress: number;
  }>>([]);
  const [totalTopicsCount, setTotalTopicsCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(60);
  const [todayTime, setTodayTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateStats = () => {
      const courses = getCourses();
      const progress = courses.map(course => {
        const topics = course.topics;
        const totalTopics = topics.length;
        const completedTopics = topics.filter(t => t.revisionCount > 0).length;
        const totalTime = topics.reduce((sum, t) => sum + t.timeInvested, 0);
        const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        return { id: course.id, name: course.name, totalTopics, completedTopics, totalTime, progress };
      });
      setCourseProgress(progress);
      setTotalTopicsCount(courses.reduce((sum, c) => sum + c.topics.length, 0));
      const goal = getDailyGoal();
      setDailyGoal(goal);
      const time = getTodayStudyTime();
      setTodayTime(time);
      setProgress(Math.min(100, Math.round((time / goal) * 100)));
    };
    updateStats();
    const unsubscribe = subscribeToData(updateStats);
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6 animate-in">
      {/* Stats Cards */}
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Add Timer */}
        <div className="lg:col-span-2 space-y-6">
          <QuickAddTimer />

          {/* Course Progress */}
          {courseProgress.length > 0 && (
            <Card className="animate-in hello-kitty-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1E293B' }}>
                  <PawPrint className="h-5 w-5" style={{ color: '#FF6B9D' }} />
                  Subjects Tracked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseProgress.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFE6EE' }}>
                          <PawPrint className="h-4 w-4" style={{ color: '#FF6B9D' }} />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#1E293B' }}>{course.name}</p>
                          <p className="text-sm" style={{ color: '#94A3B8' }}>
                            {course.completedTopics}/{course.totalTopics} topics • {formatTime(course.totalTime)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={course.progress === 100 ? 'success' : 'secondary'}>
                        {course.progress}%
                      </Badge>
                    </div>
                    <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
                      <div
                        className="hello-kitty-progress transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <RecentSessions />
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Kitty Theme Settings Card */}
          <KittyThemeCard />

          <Card className="animate-in hello-kitty-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1E293B' }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#FF6B9D' }} />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Total Hours" value={formatTime(getTotalStudyTime())} icon={<Clock className="h-5 w-5" />} color="text-pink-500" />
                <StatItem label="This Month" value={formatTime(getMonthStudyTime())} icon={<Calendar className="h-5 w-5" />} color="text-pink-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Total Topics" value={totalTopicsCount} icon={<BookOpen className="h-5 w-5" />} color="text-pink-600" />
                <StatItem label="Completed" value={getCompletedTopicsCount()} icon={<CheckCircle className="h-5 w-5" />} color="text-pink-500" />
              </div>
            </CardContent>
          </Card>

          {/* Daily Goal */}
          <Card className="animate-in hello-kitty-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1E293B' }}>
                <Target className="h-5 w-5" style={{ color: '#FF6B9D' }} />
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#94A3B8' }}>Today's Progress</span>
                  <span className="text-sm font-medium" style={{ color: '#1E293B' }}>{formatTime(todayTime)} / {formatTime(dailyGoal)}</span>
                </div>
                <div className="h-3 bg-pink-100 rounded-full overflow-hidden">
                  <div
                    className="hello-kitty-progress transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  {progress >= 100 ? '🎉 Goal achieved! Keep going!' : `${100 - progress}% to go`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="animate-in hello-kitty-card">
            <CardHeader>
              <CardTitle style={{ color: '#1E293B' }}>Study Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TipItem tip="Use the Pomodoro technique: 25min focus + 5min break" />
              <TipItem tip="Review material within 24 hours for better retention" />
              <TipItem tip="Track revisions to identify weak areas" />
              <TipItem tip="Set a consistent daily study time" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFE6EE' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className={clsx('p-2 rounded-lg', color + '/10')}>{icon}</span>
        <span className="text-sm" style={{ color: '#94A3B8' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1E293B' }}>{value}</p>
    </div>
  );
}

function TipItem({ tip }: { tip: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#FFE6EE' }}>
      <span className="mt-0.5">💡</span>
      <p className="text-sm" style={{ color: '#1E293B' }}>{tip}</p>
    </div>
  );
}