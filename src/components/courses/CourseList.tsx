'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, ChevronDown, ChevronRight, MoreVertical, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { getCourses, createCourse, updateCourse, deleteCourse, getTopics, createTopic, updateTopic, deleteTopic, incrementRevision, addTimeInvested, subscribeToData } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { clsx } from 'clsx';
import { TopicList } from './TopicList';

export function CourseList() {
  const [courses, setCourses] = useState<Array<{
    id: string;
    name: string;
    topics: Array<{ id: string; name: string; revisionCount: number; timeInvested: number }>;
    createdAt: string;
    updatedAt: string;
  }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateCourses = () => {
      setCourses(getCourses());
    };
    updateCourses();
    const unsubscribe = subscribeToData(updateCourses);
    return unsubscribe;
  }, []);

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) return;
    createCourse(newCourseName.trim());
    setNewCourseName('');
    setShowCreateModal(false);
  };

  const handleEditCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setEditingCourseId(courseId);
      setEditName(course.name);
    }
  };

  const handleSaveEdit = () => {
    if (!editingCourseId || !editName.trim()) return;
    updateCourse(editingCourseId, { name: editName.trim() });
    setEditingCourseId(null);
    setEditName('');
  };

  const handleDeleteCourse = (courseId: string) => setDeleteCourseId(courseId);
  const confirmDeleteCourse = () => {
    if (deleteCourseId) {
      deleteCourse(deleteCourseId);
      setDeleteCourseId(null);
    }
  };

  const toggleExpanded = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const getTotalTime = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.topics.reduce((sum, t) => sum + t.timeInvested, 0) || 0;
  };

  const getTotalRevisions = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.topics.reduce((sum, t) => sum + t.revisionCount, 0) || 0;
  };

  if (courses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">Courses</h2>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
        <Card className="animate-in">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-[rgb(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-[rgb(var(--foreground))] mb-2">No courses yet</h3>
            <p className="text-[rgb(var(--muted-foreground))] mb-6">Create your first course to start tracking</p>
            <Button onClick={() => setShowCreateModal(true)} size="lg">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </CardContent>
        </Card>

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course" size="sm">
          <div className="space-y-4">
            <Input
              label="Course Name"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="e.g., Calculus, Japanese, Web Development"
              autoFocus
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateCourse} disabled={!newCourseName.trim()}>Create Course</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">Courses</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => {
          const isExpanded = expandedCourses.has(course.id);
          const isEditing = editingCourseId === course.id;
          const totalTime = getTotalTime(course.id);
          const totalRevisions = getTotalRevisions(course.id);
          const topicCount = course.topics.length;

          return (
            <Card key={course.id} className="animate-in overflow-hidden">
              <CardContent className="p-0">
                {/* Course Header */}
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(course.id)}
                      className="p-1"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                          autoFocus
                          className="max-w-xs"
                        />
                      ) : (
                        <h3 className="font-semibold text-lg text-[rgb(var(--foreground))] truncate">{course.name}</h3>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{topicCount} topics</Badge>
                      <Badge variant="outline">{formatTime(totalTime)}</Badge>
                      <Badge variant="outline">{totalRevisions} revisions</Badge>

                      <div className="relative">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course.id)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Topics */}
                {isExpanded && (
                  <div className="border-t border-[rgb(var(--border))] bg-[rgb(var(--muted))/0.3]">
                    <TopicList courseId={course.id} courseName={course.name} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Course Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Course" size="sm">
        <div className="space-y-4">
          <Input
            label="Course Name"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="e.g., Calculus, Japanese, Web Development"
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse} disabled={!newCourseName.trim()}>Create Course</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={!!editingCourseId} onClose={() => setEditingCourseId(null)} title="Edit Course" size="sm">
        <div className="space-y-4">
          <Input
            label="Course Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditingCourseId(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Course Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteCourseId}
        onClose={() => setDeleteCourseId(null)}
        onConfirm={confirmDeleteCourse}
        title="Delete Course"
        message="Are you sure you want to delete this course? All topics and study sessions will also be deleted. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}