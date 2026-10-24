import { AppData, Topic, Material, Course, StudySession } from './types';

const STORAGE_KEY = 'study-tracker-data';

function getDefaultData(): AppData {
  return {
    courses: [],
    sessions: [],
    settings: {
      dailyGoal: 60,
      theme: 'light',
    },
  } as any;
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
    window.dispatchEvent(new Event('storage'));
  } catch (error: any) {
    console.error('Storage limit reached or failed to save', error);
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      alert('Storage limit reached! Browser local storage cannot hold files this large.');
    } else {
      alert('Failed to save data. Storage limit may have been reached.');
    }
  }
}

// --- Courses ---
export function getCourses(): Course[] {
  const data = getData();
  return data.courses || [];
}

export function createCourse(name: string, description?: string, color?: string): void {
  const data = getData();
  const newCourse: Course = {
    id: Date.now().toString(),
    name,
    description: description || '',
    color: color || 'blue',
    topics: [],
  };
  data.courses.push(newCourse);
  saveData(data);
}

export function updateCourse(id: string, updates: Partial<Course>): void {
  const data = getData();
  const course = data.courses.find(c => c.id === id);
  if (course) {
    Object.assign(course, updates);
    saveData(data);
  }
}

export function deleteCourse(courseId: string): void {
  const data = getData();
  data.courses = data.courses.filter(c => c.id !== courseId);
  saveData(data);
}

// --- Topics & Materials ---
export function getTopics(courseId: string): Topic[] {
  const data = getData();
  const course = data.courses.find(c => c.id === courseId);
  return course ? course.topics || [] : [];
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

// --- Study Sessions ---
export function getStudySessions(): StudySession[] {
  const data = getData() as any;
  return data.sessions || [];
}

export function createStudySession(session: Omit<StudySession, 'id'>): void {
  const data = getData() as any;
  if (!data.sessions) data.sessions = [];
  const newSession = {
    id: Date.now().toString(),
    ...session,
  };
  data.sessions.push(newSession);
  saveData(data);
}

export function deleteStudySession(sessionId: string): void {
  const data = getData() as any;
  if (data.sessions) {
    data.sessions = data.sessions.filter((s: any) => s.id !== sessionId);
    saveData(data);
  }
}

// --- Settings & Preferences ---
export function getDailyGoal(): number {
  const data = getData();
  return data.settings?.dailyGoal || 60;
}

export function setDailyGoal(goal: number): void {
  const data = getData();
  if (!data.settings) data.settings = { dailyGoal: 60, theme: 'light' };
  data.settings.dailyGoal = goal;
  saveData(data);
}

export function getTheme(): string {
  const data = getData();
  return data.settings?.theme || 'light';
}

export function setTheme(theme: string): void {
  const data = getData();
  if (!data.settings) data.settings = { dailyGoal: 60, theme: 'light' };
  data.settings.theme = theme as any;
  saveData(data);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// --- Stats & Analytics Helpers ---
export function getTotalStudyTime(): number {
  const courses = getCourses();
  let total = 0;
  courses.forEach(c => {
    if (c.topics) {
      c.topics.forEach(t => {
        total += t.timeInvested || 0;
      });
    }
  });
  return total;
}

export function getTotalTopicsCount(): number {
  const courses = getCourses();
  let count = 0;
  courses.forEach(c => {
    if (c.topics) {
      count += c.topics.length;
    }
  });
  return count;
}

export function getWeekStudyTime(): number {
  return 0;
}

export function getDailyStats(dateStr?: string): { timeSpent: number; topicsStudied: number } {
  return { timeSpent: 0, topicsStudied: 0 };
}

export function getTodayStudyTime(): number {
  return 0;
}

export function getMonthStudyTime(): number {
  return 0;
}

export function getActiveCoursesCount(): number {
  return getCourses().length;
}

export function getCompletedTopicsCount(): number {
  const courses = getCourses();
  let count = 0;
  courses.forEach(c => {
    if (c.topics) {
      count += c.topics.filter(t => (t.revisionCount || 0) > 0).length;
    }
  });
  return count;
}

export function getRevisionStreak(): number {
  return 0;
}

// --- Backup & Sync ---
export function exportData(): string {
  return JSON.stringify(getData(), null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    saveData(data);
    return true;
  } catch {
    return false;
  }
}

export function subscribeToData(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}