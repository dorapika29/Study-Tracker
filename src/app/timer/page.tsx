'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Clock, Target, CheckCircle, Coffee, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { SelectTrigger, SelectContent, SelectItem } from '@/components/ui/Select';
import { getCourses, getTopics, createStudySession, addTimeInvested, getDailyGoal } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { clsx } from 'clsx';

const POMODORO_PRESETS = [
  { label: 'Pomodoro (25/5)', work: 25, break: 5 },
  { label: 'Short Break (5/1)', work: 5, break: 1 },
  { label: 'Long Focus (50/10)', work: 50, break: 10 },
  { label: 'Deep Work (90/20)', work: 90, break: 20 },
];

export default function TimerPage() {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const courseList = getCourses().map(c => ({ id: c.id, name: c.name }));
    setCourses(courseList);
    if (courseList.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courseList[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const topicList = getTopics(selectedCourseId).map(t => ({ id: t.id, name: t.name }));
      setTopics(topicList);
      setSelectedTopicId(topicList.length > 0 ? topicList[0].id : '');
    } else {
      setTopics([]);
      setSelectedTopicId('');
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft((mode === 'work' ? workDuration : breakDuration) * 60);
    }
  }, [mode, workDuration, breakDuration, isRunning]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
    audioRef.current.volume = 0.5;
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleTimerComplete = () => {
    playSound();
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mode === 'work') {
      // Log the work session
      if (selectedCourseId) {
        createStudySession({
          date: new Date().toISOString().split('T')[0],
          courseId: selectedCourseId,
          topicId: selectedTopicId || undefined,
          duration: workDuration,
          notes: notes || undefined,
        });
        if (selectedTopicId) {
          addTimeInvested(selectedCourseId, selectedTopicId, workDuration);
        }
      }
      setSessionsCompleted(prev => prev + 1);
      setMode('break');
      setTimeLeft(breakDuration * 60);
      setNotes('');
    } else {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft((mode === 'work' ? workDuration : breakDuration) * 60);
  };

  const skipBreak = () => {
    if (mode === 'break') {
      setMode('work');
      setTimeLeft(workDuration * 60);
    }
  };

  const applyPreset = (preset: { work: number; break: number }) => {
    if (!isRunning) {
      setWorkDuration(preset.work);
      setBreakDuration(preset.break);
      setMode('work');
      setTimeLeft(preset.work * 60);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((mode === 'work' ? workDuration : breakDuration) * 60 - timeLeft) / ((mode === 'work' ? workDuration : breakDuration) * 60);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(var(--foreground))]">Study Timer</h1>
            <p className="mt-2 text-[rgb(var(--muted-foreground))]">Focus sessions with Pomodoro technique</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Timer */}
        <Card className="animate-in mb-6">
          <CardContent className="p-8 text-center">
            {/* Mode Indicator */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span
                className={clsx(
                  'px-4 py-1.5 rounded-full text-sm font-medium',
                  mode === 'work'
                    ? 'bg-[rgb(var(--primary))/0.15] text-[rgb(var(--primary))]'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                )}
              >
                {mode === 'work' ? 'Focus Time' : 'Break Time'}
              </span>
            </div>

            {/* Circular Timer */}
            <div className="relative w-64 h-64 mx-auto mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="rgb(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  fill="none"
                  stroke="rgb(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 110}
                  strokeDashoffset={2 * Math.PI * 110 * (1 - progress)}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl sm:text-7xl font-mono font-bold text-[rgb(var(--foreground))] tabular-nums">
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="h-3 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-1000 ease-linear',
                    mode === 'work' ? 'bg-[rgb(var(--primary))]' : 'bg-green-500'
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={resetTimer}
                className="h-14 w-14 p-0"
                aria-label="Reset timer"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={toggleTimer}
                className="h-16 w-16 p-0 min-w-0"
                aria-label={isRunning ? 'Pause timer' : 'Start timer'}
              >
                {isRunning ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
              {mode === 'break' && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={skipBreak}
                  className="h-14 w-14 p-0"
                  aria-label="Skip break"
                >
                  <Zap className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Sessions Completed */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{sessionsCompleted} sessions completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Coffee className="h-4 w-4" />
                <span>{sessionsCompleted * workDuration} min focused</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presets */}
        <Card className="animate-in mb-6">
          <CardHeader>
            <CardTitle>Quick Presets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {POMODORO_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant={workDuration === preset.work && breakDuration === preset.break ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  disabled={isRunning}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="animate-in mb-6">
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Work Duration (minutes)</label>
                  <Input
                    type="number"
                    min="1"
                    max="180"
                    value={workDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setWorkDuration(val);
                      if (!isRunning && mode === 'work') setTimeLeft(val * 60);
                    }}
                  />
                </div>
                <div>
                  <label className="label">Break Duration (minutes)</label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={breakDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setBreakDuration(val);
                      if (!isRunning && mode === 'break') setTimeLeft(val * 60);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={isRunning}
                  className="w-full rounded-xl border bg-[rgb(var(--background))] px-4 py-2.5 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200 border-[rgb(var(--input))]"
                >
                  <option value="" disabled>Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  disabled={topics.length === 0 || isRunning}
                  className="w-full rounded-xl border bg-[rgb(var(--background))] px-4 py-2.5 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200 border-[rgb(var(--input))]"
                >
                  <option value="" disabled>Select Topic</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Session Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What will you focus on?"
                  className="input min-h-[80px] resize-y"
                  rows={3}
                  disabled={isRunning}
                />
              </div>

              <div className="p-4 rounded-xl bg-[rgb(var(--muted))/0.5]">
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  <Target className="h-4 w-4 inline-block mr-1" />
                  Daily Goal: {formatTime(getDailyGoal())} • Today: {formatTime(require('@/lib/storage').getTodayStudyTime())}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card className="animate-in">
          <CardHeader>
            <CardTitle>Session Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[rgb(var(--muted))/0.5]">
                <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{sessionsCompleted}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgb(var(--muted))/0.5]">
                <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{formatTime(sessionsCompleted * workDuration)}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Focus Time</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgb(var(--muted))/0.5]">
                <p className="text-3xl font-bold text-[rgb(var(--foreground))]">{formatTime(sessionsCompleted * breakDuration)}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Break Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}