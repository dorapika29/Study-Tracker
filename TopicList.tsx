'use client';

import { useState } from 'react';
import { Topic } from '@/lib/types';
import { 
  addTopic, 
  updateTopic, 
  deleteTopic, 
  incrementRevision, 
  addTimeInvested, 
  addMaterial, 
  deleteMaterial, 
  fileToBase64 
} from '@/lib/storage';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RotateCcw, 
  Clock, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  ExternalLink 
} from 'lucide-react';

interface TopicListProps {
  courseId: string;
  topics: Topic[];
}

export function TopicList({ courseId, topics }: TopicListProps) {
  const [newTopicName, setNewTopicName] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const [uploadingTopicId, setUploadingTopicId] = useState<string | null>(null);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    addTopic(courseId, newTopicName.trim());
    setNewTopicName('');
  };

  const handleStartEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditName(topic.name);
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

    for (const file of Array.from(files)) {
      // 100MB Size limit validation
      if (file.size > 100 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size allowed is 100MB.`);
        continue;
      }

      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format. Only PDF and images are allowed.`);
        continue;
      }

      try {
        let fileUrl = '';
        if (file.size <= 4 * 1024 * 1024) {
          fileUrl = await fileToBase64(file);
        } else {
          fileUrl = URL.createObjectURL(file);
        }

        addMaterial(courseId, topicId, {
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          url: fileUrl,
          size: file.size,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploadingTopicId(null);
  };

  const handleDeleteMaterial = (topicId: string, materialId: string) => {
    deleteMaterial(courseId, topicId, materialId);
  };

  return (
    <div className="space-y-6">
      {/* Add Topic Form */}
      <form onSubmit={handleAddTopic} className="flex gap-2">
        <input
          type="text"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          placeholder="Add a new topic..."
          className="flex-1 px-4 py-2 rounded-xl border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium flex items-center gap-1 hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Topic
        </button>
      </form>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((topic) => {
          const isUploading = uploadingTopicId === topic.id;

          return (
            <div key={topic.id} className="p-4 rounded-2xl border bg-card text-card-foreground space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                {editingTopicId === topic.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1 rounded-lg border bg-background text-sm"
                      autoFocus
                    />
                    <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingTopicId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base">{topic.name}</h4>
                    <button onClick={() => handleStartEdit(topic)} className="p-1 text-muted-foreground hover:text-foreground">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <button onClick={() => handleDeleteTopic(topic.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button 
                  onClick={() => handleRevision(topic.id)} 
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-1 font-medium hover:opacity-90"
                >
                  <RotateCcw className="h-3 w-3" /> Revised ({topic.revisionCount})
                </button>
                <button 
                  onClick={() => handleAddTime(topic.id, 15)} 
                  className="px-3 py-1.5 border rounded-lg flex items-center gap-1 hover:bg-secondary/50"
                >
                  <Clock className="h-3 w-3" /> +15m
                </button>
                <button 
                  onClick={() => handleAddTime(topic.id, 30)} 
                  className="px-3 py-1.5 border rounded-lg flex items-center gap-1 hover:bg-secondary/50"
                >
                  <Clock className="h-3 w-3" /> +30m
                </button>
                <span className="text-muted-foreground font-mono ml-auto">
                  {Math.floor(topic.timeInvested / 60)}h {topic.timeInvested % 60}m spent
                </span>
              </div>

              {/* Materials Section */}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Materials</span>
                  <label className="cursor-pointer inline-flex items-center gap-1 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-medium">
                    <Upload className="h-3 w-3" /> Add File (up to 100MB)
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

                {isUploading && (
                  <div className="text-xs text-muted-foreground animate-pulse py-1">Uploading file...</div>
                )}

                {/* Material Attachments List */}
                {topic.materials && topic.materials.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {topic.materials.map((mat) => (
                      <div key={mat.id} className="flex items-center justify-between p-2 rounded-xl bg-secondary/50 border text-xs">
                        <div className="flex items-center gap-2 truncate mr-2">
                          {mat.type === 'pdf' ? <FileText className="h-4 w-4 text-red-500 shrink-0" /> : <ImageIcon className="h-4 w-4 text-blue-500 shrink-0" />}
                          <a href={mat.url} target="_blank" rel="noreferrer" className="truncate hover:underline font-medium">
                            {mat.name}
                          </a>
                        </div>
                          <div className="flex items-center gap-1 shrink-0">
                          <a href={mat.url} target="_blank" rel="noreferrer" className="p-1 hover:text-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button onClick={() => handleDeleteMaterial(topic.id, mat.id)} className="p-1 hover:text-red-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Topic Modal */}
      {deleteTopicId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-6 rounded-2xl max-w-sm w-full space-y-4 border shadow-xl">
            <h3 className="font-bold text-lg">Delete Topic?</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete this topic and all its attached materials?</p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setDeleteTopicId(null)} 
                className="px-4 py-2 border rounded-xl text-sm hover:bg-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteTopic} 
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}