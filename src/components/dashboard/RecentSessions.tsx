'use client';

import { useState, useEffect } from 'react';
import { Clock, BookOpen, Tag, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { getStudySessions, getCourses, getTopics, deleteStudySession, createStudySession } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export function RecentSessions() {
  const [sessions, setSessions] = useState<Array<{
    id: string;
    date: string;
    courseId: string;
    topicId?: string;
    duration: number;
    notes?: string;
    createdAt: string;
  }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);
  const [topicsMap, setTopicsMap] = useState<Record<string, Array<{ id: string; name: string }>>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSession, setEditSession] = useState<typeof sessions[0] | null>(null);
  const [editForm, setEditForm] = useState({ duration: '', notes: '' });

  useEffect(() => {
    const updateData = () => {
      const courseList = getCourses();
      setCourses(courseList);

      const topics: Record<string, Array<{ id: string; name: string }>> = {};
      courseList.forEach(course => {
        topics[course.id] = course.topics.map(t => ({ id: t.id, name: t.name }));
      });
      setTopicsMap(topics);

      const sessionList = getStudySessions()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setSessions(sessionList);
    };

    updateData();
    const unsubscribe = require('@/lib/storage').subscribeToData(updateData);
    return unsubscribe;
  }, []);

  const getCourseName = (courseId: string) => courses.find(c => c.id === courseId)?.name || 'Unknown';
  const getTopicName = (courseId: string, topicId?: string) => {
    if (!topicId) return null;
    return topicsMap[courseId]?.find(t => t.id === topicId)?.name || 'Unknown';
  };

  const handleEdit = (session: typeof sessions[0]) => {
    setEditSession(session);
    setEditForm({ duration: session.duration.toString(), notes: session.notes || '' });
  };

  const handleSaveEdit = () => {
    if (!editSession) return;
    const duration = parseInt(editForm.duration);
    if (isNaN(duration) || duration <= 0) return;

    // Delete old and create new (simpler approach)
    deleteStudySession(editSession.id);
    createStudySession({
      date: editSession.date,
      courseId: editSession.courseId,
      topicId: editSession.topicId,
      duration,
      notes: editForm.notes || undefined,
    });
    setEditSession(null);
  };

  const handleDelete = (id: string) => setDeleteId(id);
  const confirmDelete = () => {
    if (deleteId) {
      deleteStudySession(deleteId);
      setDeleteId(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <Card className="animate-in">
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[rgb(var(--foreground))] mb-1">No study sessions yet</h3>
          <p className="text-[rgb(var(--muted-foreground))]">Log your first session using the timer above!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="animate-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[rgb(var(--border))]">
            {sessions.map((session, index) => {
              const courseName = getCourseName(session.courseId);
              const topicName = getTopicName(session.courseId, session.topicId);
              const dateStr = format(new Date(session.date), 'MMM d, yyyy');
              const timeStr = format(new Date(session.createdAt), 'h:mm a');

              return (
                <div key={session.id} className="p-4 hover:bg-[rgb(var(--muted))/0.3] transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-[rgb(var(--primary))/0.1] flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[rgb(var(--primary))]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[rgb(var(--foreground))] truncate">{courseName}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[rgb(var(--muted-foreground))]">
                        {topicName && (
                          <>
                            <Tag className="h-3 w-3" />
                            <span>{topicName}</span>
                          </>
                        )}
                        <span className="text-[rgb(var(--border))]">·</span>
                        <span>{formatTime(session.duration)}</span>
                        <span className="text-[rgb(var(--border))]">·</span>
                        <span>{dateStr} at {timeStr}</span>
                      </div>
                      {session.notes && (
                        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))] line-clamp-1">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(session)} aria-label="Edit session">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(session.id)} aria-label="Delete session">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editSession}
        onClose={() => setEditSession(null)}
        title="Edit Session"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="480"
              value={editForm.duration}
              onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              className="input min-h-[80px] resize-y"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditSession(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Session"
        message="Are you sure you want to delete this study session? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}