'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RotateCcw, Clock, FileText, Image, Upload, Download, Eye, Trash2 as Trash2Icon, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { getTopics, createTopic, updateTopic, deleteTopic, incrementRevision, addTimeInvested, addMaterial, deleteMaterial, getTopic, subscribeToData, fileToBase64 } from '@/lib/storage';
import { formatTime } from '@/lib/types';
import { clsx } from 'clsx';

interface TopicListProps {
  courseId: string;
  courseName: string;
}

export function TopicList({ courseId, courseName }: TopicListProps) {
  const [topics, setTopics] = useState<Array<{
    id: string;
    name: string;
    revisionCount: number;
    timeInvested: number;
    materials: Array<{ id: string; name: string; type: 'pdf' | 'image'; url: string; size: number; uploadedAt: string }>;
  }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const [uploadingTopicId, setUploadingTopicId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showStudyTimeModal, setShowStudyTimeModal] = useState(false);
  const [studyTimeMinutes, setStudyTimeMinutes] = useState(0);

  useEffect(() => {
    const updateTopics = () => {
      const topicData = getTopics(courseId);
      setTopics(topicData);
    };
    updateTopics();
    const unsubscribe = subscribeToData(updateTopics);
    return unsubscribe;
  }, [courseId]);

  const handleCreateTopic = () => {
    if (!newTopicName.trim()) return;
    createTopic(courseId, newTopicName.trim());
    setNewTopicName('');
    setShowCreateModal(false);
  };

  const handleEditTopic = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setEditingTopicId(topicId);
      setEditName(topic.name);
    }
  };

  const handleSaveEdit = () => {
    if (!editingTopicId || !editName.trim()) return;
    updateTopic(courseId, editingTopicId, { name: editName.trim() });
    setEditingTopicId(null);
    setEditName('');
  };

  const handleDeleteTopic = (topicId: string) => setDeleteTopicId(topicId);
  const confirmDeleteTopic = () => {
    if (deleteTopicId) {
      deleteTopic(courseId, deleteTopicId);
      setDeleteTopicId(null);
    }
  };

  const handleRevision = (topicId: string) => {
    incrementRevision(courseId, topicId);
  };

  const handleAddTime = (topicId: string, minutes: number) => {
    addTimeInvested(courseId, topicId, minutes);
  };

  const handleFileUpload = async (topicId: string, files: FileList) => {
    setUploadingTopicId(topicId);
    setUploadProgress(prev => ({ ...prev, [topicId]: 0 }));

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported type. Only PDF and images are allowed.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        addMaterial(courseId, topicId, {
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
          url: base64,
          size: file.size,
        });
      } catch (error) {
        console.error('Failed to upload file:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploadingTopicId(null);
    setUploadProgress(prev => ({ ...prev, [topicId]: 100 }));
    setTimeout(() => setUploadProgress(prev => ({ ...prev, [topicId]: 0 })), 500);
  };

  const handleDeleteMaterial = (topicId: string, materialId: string) => {
    deleteMaterial(courseId, topicId, materialId);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const openStudyTimeModal = (topicId: string) => {
    setShowStudyTimeModal(true);
    setStudyTimeMinutes(0);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Add Topic Button */}
      <Button variant="secondary" size="sm" className="w-full" onClick={() => setShowCreateModal(true)}>
        <Plus className="h-4 w-4" />
        Add Topic
      </Button>

      {topics.length === 0 && (
        <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No topics yet. Add your first topic!</p>
        </div>
      )}

      <div className="space-y-2">
        {topics.map((topic) => {
          const isEditing = editingTopicId === topic.id;
          const isUploading = uploadingTopicId === topic.id;
          const progress = uploadProgress[topic.id] || 0;

          return (
            <Card key={topic.id} variant="bordered" className="animate-in">
              <CardContent className="p-4">
                {/* Topic Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-xl bg-[rgb(var(--primary))/0.1] flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-[rgb(var(--primary))]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        autoFocus
                        className="max-w-md"
                      />
                    ) : (
                      <h4 className="font-medium text-[rgb(var(--foreground))] truncate">{topic.name}</h4>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Revision Counter */}
                    <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[rgb(var(--muted))]">
                      <RotateCcw className="h-4 w-4 text-[rgb(var(--muted-foreground))]" />
                      <span className="font-mono font-bold text-[rgb(var(--foreground))]">{topic.revisionCount}</span>
                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => handleRevision(topic.id)} aria-label="Add revision">
                        <span className="text-xs">+1</span>
                      </Button>
                    </div>

                    {/* Study Time Quick Actions */}
                    <div className="flex items-center gap-2 rounded-xl bg-[rgb(var(--muted))/0.5] px-2 py-1">
                      {/* Revision +1 Button */}
                      <Button variant="ghost" size="sm" className="p-1.5 h-6 w-6" onClick={() => handleRevision(topic.id)} aria-label="Add revision">
                        <RotateCcw className="h-4 w-4" />
                      </Button>

                      {/* Study Time Input */}
                      <Button variant="ghost" size="sm" className="p-1.5 h-6 w-6" onClick={() => openStudyTimeModal(topic.id)} aria-label="Log study time">
                        <Clock className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Time Invested */}
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(topic.timeInvested)}
                    </Badge>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {isEditing ? (
                        <>
                          <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={handleSaveEdit} aria-label="Save">
                            <span className="text-xs">✓</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => setEditingTopicId(null)} aria-label="Cancel">
                            <span className="text-xs">✕</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => handleEditTopic(topic.id)} aria-label="Edit topic">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1 h-6 w-6" onClick={() => handleDeleteTopic(topic.id)} aria-label="Delete topic">
                            <Trash2Icon className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Time Add */}
                <div className="flex items-center gap-2 mb-3">
                  <Button variant="ghost" size="sm" onClick={() => handleAddTime(topic.id, 15)}>
                    +15m
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAddTime(topic.id, 30)}>
                    +30m
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAddTime(topic.id, 60)}>
                    +1h
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAddTime(topic.id, 25)}>
                    +25m (Pomodoro)
                  </Button>
                </div>

                {/* Materials Section */}
                <div className="border-t border-[rgb(var(--border))] pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[rgb(var(--foreground))]">Materials</span>
                    <label className="btn-primary text-xs px-3 py-1.5 cursor-pointer">
                      <Upload className="h-3 w-3" />
                      Add File
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
                        multiple
                        className="sr-only"
                        onChange={(e) => e.target.files && handleFileUpload(topic.id, e.target.files)}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {isUploading && progress > 0 && (
                    <div className="mb-3">
                      <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[rgb(var(--primary))] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Uploading... {progress}%</p>
                    </div>
                  )}

                  {topic.materials.length === 0 && !isUploading && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))] text-center py-4">
                      No materials attached. Click "Add File" to upload PDFs or images.
                    </p>
                  )}

                  <div className="space-y-2">
                    {topic.materials.map((material) => (
                      <div key={material.id} className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--background))] border border-[rgb(var(--border))]">
                        <div className={clsx('h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0', material.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')}>
                          {material.type === 'pdf' ? <FileText className="h-5 w-5" /> : <Image className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[rgb(var(--foreground))] truncate">{material.name}</p>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatFileSize(material.size)} • {new Date(material.uploadedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {material.type === 'image' && (
                            <Button variant="ghost" size="sm" className="p-1 h-7 w-7" onClick={() => window.open(material.url, '_blank')} aria-label="View image">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="p-1 h-7 w-7" onClick={() => {
                            const link = document.createElement('a');
                            link.href = material.url;
                            link.download = material.name;
                            link.click();
                          }} aria-label="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-1 h-7 w-7 text-red-500" onClick={() => handleDeleteMaterial(topic.id, material.id)} aria-label="Delete material">
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Topic Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Topic" size="sm">
        <div className="space-y-4">
          <Input
            label="Topic Name"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="e.g., Chapter 1: Limits, Hiragana, React Hooks"
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateTopic} disabled={!newTopicName.trim()}>Add Topic</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Topic Modal */}
      <Modal isOpen={!!editingTopicId} onClose={() => setEditingTopicId(null)} title="Edit Topic" size="sm">
        <div className="space-y-4">
          <Input
            label="Topic Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditingTopicId(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Topic Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTopicId}
        onClose={() => setDeleteTopicId(null)}
        onConfirm={confirmDeleteTopic}
        title="Delete Topic"
        message="Are you sure you want to delete this topic? All materials and study sessions for this topic will also be deleted. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}