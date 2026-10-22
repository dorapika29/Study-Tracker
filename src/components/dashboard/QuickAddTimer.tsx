'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Plus, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getCourses, createStudySession, getTopics } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { clsx } from 'clsx';

export function QuickAddTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [notes, setNotes] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ duration: '', notes: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

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
    if (isRunning && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 60000);
        setElapsedMinutes(elapsed);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const finalMinutes = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 60000);
      setElapsedMinutes(finalMinutes);
      startTimeRef.current = null;
    } else {
      // Start
      if (elapsedMinutes === 0) {
        startTimeRef.current = Date.now();
      } else {
        // Resume from elapsed
        startTimeRef.current = Date.now() - elapsedMinutes * 60000;
      }
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedMinutes(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  const logSession = () => {
    const minutes = showManual ? parseInt(manualMinutes) || 0 : elapsedMinutes;
    if (minutes <= 0) return;

    createStudySession({
      date: new Date().toISOString().split('T')[0],
      courseId: selectedCourseId,
      topicId: selectedTopicId || undefined,
      duration: minutes,
      notes: notes || undefined,
    });

    // Update topic time invested
    if (selectedTopicId) {
      const { addTimeInvested } = require('@/lib/storage');
      addTimeInvested(selectedCourseId, selectedTopicId, minutes);
    }

    // Reset
    resetTimer();
    setNotes('');
    setManualMinutes('');
    setShowManual(false);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  return (
    <Card className="animate-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
          Quick Add Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center py-6">
          <div className="text-5xl font-mono font-bold text-[rgb(var(--foreground))] tabular-nums">
            {formatTime(elapsedMinutes)}
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              size="lg"
              onClick={toggleTimer}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start
                </>
              )}
            </Button>
            <Button variant="ghost" size="lg" onClick={resetTimer} disabled={elapsedMinutes === 0 && !isRunning}>
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          </div>
        </div>

        {/* Manual Entry Toggle */}
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setShowManual(!showManual)}
        >
          <Plus className="h-4 w-4" />
          {showManual ? 'Use Timer' : 'Manual Entry'}
        </Button>

        {showManual ? (
          <Input
            label="Minutes"
            type="number"
            min="1"
            max="480"
            value={manualMinutes}
            onChange={(e) => setManualMinutes(e.target.value)}
            placeholder="Enter minutes"
          />
        ) : null}

        {/* Course Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={isRunning}
            className={clsx(
              'w-full rounded-xl border bg-[rgb(var(--background))] px-4 py-2.5 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200',
              'border-[rgb(var(--input))]'
            )}
          >
            <option value="" disabled>Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            disabled={topics.length === 0 || isRunning}
            className={clsx(
              'w-full rounded-xl border bg-[rgb(var(--background))] px-4 py-2.5 text-sm text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200',
              'border-[rgb(var(--input))]'
            )}
          >
            <option value="" disabled>Select Topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you study?"
            className="input min-h-[80px] resize-y"
            rows={3}
          />
        </div>

        {/* Log Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={logSession}
          disabled={(showManual ? !manualMinutes : elapsedMinutes === 0) || !selectedCourseId}
        >
          <Plus className="h-4 w-4" />
          Log Session ({formatTime(showManual ? parseInt(manualMinutes) || 0 : elapsedMinutes)})
        </Button>

        {selectedCourse && (
          <p className="text-xs text-[rgb(var(--muted-foreground))] text-center">
            Course: <span className="font-medium">{selectedCourse.name}</span>
            {selectedTopic && <span> → Topic: <span className="font-medium">{selectedTopic.name}</span></span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}