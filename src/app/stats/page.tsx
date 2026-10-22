'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCourses, getStudySessions, getDailyStats, getTotalStudyTime, getWeekStudyTime, getMonthStudyTime, getRevisionStreak, getActiveCoursesCount, getCompletedTopicsCount, getTotalTopicsCount, subscribeToData } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { BookOpen, Clock, TrendingUp, Flame, Target, Calendar, BarChart3, PieChart } from 'lucide-react';
import { clsx } from 'clsx';

export default function StatsPage() {
  const [weeklyData, setWeeklyData] = useState<Array<{ date: string; minutes: number; label: string }>>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ date: string; minutes: number }>>([]);
  const [courseDistribution, setCourseDistribution] = useState<Array<{ name: string; minutes: number; color: string }>>([]);
  const [topicDistribution, setTopicDistribution] = useState<Array<{ name: string; revisions: number }>>([]);

  useEffect(() => {
    const updateStats = () => {
      // Weekly data
      const weekStats = getDailyStats(7);
      const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      setWeeklyData(weekStats.map((d, i) => ({ ...d, label: labels[new Date(d.date).getDay()] })));

      // Monthly data
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthData: Array<{ date: string; minutes: number }> = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i).toISOString().split('T')[0];
        const sessions = getStudySessions().filter(s => s.date === date);
        const minutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        monthData.push({ date, minutes });
      }
      setMonthlyData(monthData);

      // Course distribution
      const courses = getCourses();
      const colors = [
        'rgb(var(--primary))',
        '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
      ];
      const courseDist = courses.map((course, i) => {
        const sessions = getStudySessions().filter(s => s.courseId === course.id);
        const minutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        return { name: course.name, minutes, color: colors[i % colors.length] };
      }).filter(c => c.minutes > 0);
      setCourseDistribution(courseDist);

      // Topic distribution (top 5 by revisions)
      const allTopics = courses.flatMap(c => c.topics.map(t => ({ ...t, courseName: c.name })));
      const topicDist = allTopics
        .filter(t => t.revisionCount > 0)
        .sort((a, b) => b.revisionCount - a.revisionCount)
        .slice(0, 5)
        .map(t => ({ name: t.name, revisions: t.revisionCount }));
      setTopicDistribution(topicDist);
    };

    updateStats();
    const unsubscribe = subscribeToData(updateStats);
    return unsubscribe;
  }, []);

  const totalTime = getTotalStudyTime();
  const weekTime = getWeekStudyTime();
  const monthTime = getMonthStudyTime();
  const streak = getRevisionStreak();
  const activeCourses = getActiveCoursesCount();
  const completedTopics = getCompletedTopicsCount();
  const totalTopics = getTotalTopicsCount();
  const avgDaily = weekTime / 7;
  const avgSession = getStudySessions().length > 0 ? totalTime / getStudySessions().length : 0;

  const maxWeekly = Math.max(...weeklyData.map(d => d.minutes), 1);
  const maxMonthly = Math.max(...monthlyData.map(d => d.minutes), 1);
  const maxCourse = Math.max(...courseDistribution.map(c => c.minutes), 1);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]">Statistics</h1>
          <p className="mt-2 text-[rgb(var(--muted-foreground))]">Analyze your study patterns and progress</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Study Time"
            value={formatTime(totalTime)}
            icon={Clock}
            color="text-pink-500 bg-pink-100 dark:bg-pink-900/30"
          />
          <StatCard
            title="This Week"
            value={formatTime(weekTime)}
            icon={Calendar}
            color="text-green-500 bg-green-100 dark:bg-green-900/30"
          />
          <StatCard
            title="Revision Streak"
            value={`${streak} days`}
            icon={Flame}
            color="text-orange-500 bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            title="Avg Daily"
            value={formatTime(Math.round(avgDaily))}
            icon={TrendingUp}
            color="text-purple-500 bg-purple-100 dark:bg-purple-900/30"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Chart */}
          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[rgb(var(--primary))]" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {weeklyData.map((day, i) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                    <div
                      className="w-full bg-[rgb(var(--primary))] rounded-t transition-all duration-500 hover:opacity-80"
                      style={{
                        height: `${(day.minutes / maxWeekly) * 100}%`,
                        minHeight: day.minutes > 0 ? '4px' : '0',
                      }}
                      title={`${day.label}: ${formatTime(day.minutes)}`}
                    />
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">{day.label}</span>
                    <span className="text-xs font-medium text-[rgb(var(--foreground))]">
                      {day.minutes > 0 ? formatTime(day.minutes) : '-'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                <span>Week Total: <span className="font-medium text-[rgb(var(--foreground))]">{formatTime(weekTime)}</span></span>
                <span>Daily Avg: <span className="font-medium text-[rgb(var(--foreground))]">{formatTime(Math.round(avgDaily))}</span></span>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Heatmap */}
          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[rgb(var(--primary))]" />
                Monthly Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 justify-center">
                {monthlyData.map((day) => {
                  const intensity = day.minutes / maxMonthly;
                  const opacity = intensity > 0 ? 0.3 + intensity * 0.7 : 0.1;
                  return (
                    <div
                      key={day.date}
                      className="w-6 h-6 rounded transition-colors cursor-pointer"
                      style={{
                        backgroundColor: `rgb(var(--primary))`,
                        opacity,
                      }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${formatTime(day.minutes)}`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[rgb(var(--muted-foreground))]">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(var(--primary))', opacity: 0.1 }} />
                  <span>No study</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(var(--primary))', opacity: 0.5 }} />
                  <span>Light</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(var(--primary))', opacity: 1 }} />
                  <span>Heavy</span>
                </div>
              </div>
              <div className="mt-2 text-center text-sm text-[rgb(var(--muted-foreground))]">
                Month Total: <span className="font-medium text-[rgb(var(--foreground))]">{formatTime(monthTime)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Course Distribution */}
          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-[rgb(var(--primary))]" />
                Time by Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courseDistribution.length > 0 ? (
                <div className="space-y-3">
                  {courseDistribution.map((course, i) => (
                    <div key={course.name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: course.color }} />
                          <span className="text-sm font-medium text-[rgb(var(--foreground))] truncate max-w-[150px]">{course.name}</span>
                        </div>
                        <span className="text-sm font-mono text-[rgb(var(--foreground))]">{formatTime(course.minutes)}</span>
                      </div>
                      <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(course.minutes / maxCourse) * 100}%`, backgroundColor: course.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                  <PieChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No course data yet. Start a study session!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Topic Revisions */}
          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[rgb(var(--primary))]" />
                Top Topics by Revisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topicDistribution.length > 0 ? (
                <div className="space-y-3">
                  {topicDistribution.map((topic, i) => (
                    <div key={topic.name} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-medium text-[rgb(var(--muted-foreground))]">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{topic.name}</p>
                        <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[rgb(var(--primary))] rounded-full"
                            style={{ width: `${(topic.revisions / topicDistribution[0].revisions) * 100}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary">{topic.revisions} revisions</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
                  <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No revisions yet. Start reviewing topics!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[rgb(var(--primary))]" />
                Course Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatRow label="Active Courses" value={activeCourses} />
              <StatRow label="Total Topics" value={totalTopics} />
              <StatRow label="Completed Topics" value={completedTopics} />
              <StatRow label="Completion Rate" value={totalTopics > 0 ? `${Math.round((completedTopics / totalTopics) * 100)}%` : '0%'} />
            </CardContent>
          </Card>

          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
                Time Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatRow label="Total Sessions" value={getStudySessions().length} />
              <StatRow label="Avg Session" value={formatTime(Math.round(avgSession))} />
              <StatRow label="This Month" value={formatTime(monthTime)} />
              <StatRow label="Longest Streak" value={`${streak} days`} />
            </CardContent>
          </Card>

          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[rgb(var(--primary))]" />
                Goals & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatRow label="Daily Goal" value={formatTime(require('@/lib/storage').getDailyGoal())} />
              <StatRow label="Today" value={formatTime(require('@/lib/storage').getTodayStudyTime())} />
              <StatRow label="Week Progress" value={`${Math.min(100, Math.round((weekTime / (require('@/lib/storage').getDailyGoal() * 7)) * 100))}%`} />
              <StatRow label="Sessions This Week" value={getStudySessions().filter(s => {
                const weekDates = require('@/lib/types').getWeekDates();
                return weekDates.includes(s.date);
              }).length} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <Card className="animate-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--muted-foreground))]">{title}</p>
            <p className="mt-2 text-3xl font-bold text-[rgb(var(--foreground))]">{value}</p>
          </div>
          <div className={clsx('p-3 rounded-xl', color)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[rgb(var(--muted-foreground))]">{label}</span>
      <span className="text-sm font-medium text-[rgb(var(--foreground))]">{value}</span>
    </div>
  );
}