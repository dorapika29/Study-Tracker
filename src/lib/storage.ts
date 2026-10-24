import { AppData, Topic, Material, Course } from './types';

const STORAGE_KEY = 'study-tracker-data';

function getDefaultData(): AppData {
  return {
    courses: [],
    settings: {
      dailyGoal: 60,
      theme: 'light',
    },
  };
}

export function getData(): AppData {
  if (typeof window === 'undefined') return getDefaultData();
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : getDefaultData();
  } catch (error) {
    console.error('Failed to load data from localStorage', error);
    return getDefaultData();
  }
}

function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error: any) {
    console.error('Storage limit reached or failed to save', error);
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      alert('Storage limit reached! Browser local storage cannot hold files this large. Try uploading files under 10MB to ensure they save properly.');
    } else {
      alert('Failed to save data. Storage limit may have been reached.');
    }
  }
}

export function createTopic(courseId: string, name: string): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    const newTopic: Topic = {
      id: Date.now().toString(),
      name,
      revisionCount: 0,
      timeInvested: 0,
      materials: [],
    };
    course.topics.push(newTopic);
    saveData(data);
  }
}

export function updateTopic(courseId: string, topicId: string, updates: Partial<Topic>): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    const topic = course.topics.find(t => t.id === topicId);
    if (topic) {
      Object.assign(topic, updates);
      saveData(data);
    }
  }
}

export function deleteTopic(courseId: string, topicId: string): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    course.topics = course.topics.filter(t => t.id !== topicId);
    saveData(data);
  }
}

export function incrementRevision(courseId: string, topicId: string): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    const topic = course.topics.find(t => t.id === topicId);
    if (topic) {
      topic.revisionCount = (topic.revisionCount || 0) + 1;
      saveData(data);
    }
  }
}

export function addTimeInvested(courseId: string, topicId: string, minutes: number): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    const topic = course.topics.find(t => t.id === topicId);
    if (topic) {
      topic.timeInvested = (topic.timeInvested || 0) + minutes;
      saveData(data);
    }
  }
}

export function addMaterial(courseId: string, topicId: string, material: Omit<Material, 'id'>): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    const topic = course.topics.find(t => t.id === topicId);
    if (topic) {
      if (!topic.materials) topic.materials = [];
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...material,
      };
      topic.materials.push(newMaterial);
      saveData(data);
    }
  }
}

export function deleteMaterial(courseId: string, topicId: string, materialId: string): void {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  if (course) {
    const topic = course.topics.find(t => t.id === topicId);
    if (topic && topic.materials) {
      topic.materials = topic.materials.filter(m => m.id !== materialId);
      saveData(data);
    }
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}