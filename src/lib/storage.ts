'use client';

import type { AppData, Course, Topic, StudySession, StudyMaterial, Theme } from '@/lib/types';
import { DEFAULT_DATA, generateId, getTodayString, getWeekDates, getMonthDates, formatTime } from '@/lib/types';

const STORAGE_KEY = 'study-tracker-data';

// Initialize data in localStorage if not exists
export function initializeStorage(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle migrations
      return {
        ...DEFAULT_DATA,
        ...parsed,
        settings: {
          ...DEFAULT_DATA.settings,
          ...parsed.settings,
        },
      };
    }
  } catch (error) {
    console.error('Failed to parse stored data:', error);
  }

  // Save default data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  return DEFAULT_DATA;
}

// Get all data
export function getData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to get data:', error);
  }
  return DEFAULT_DATA;
}

// Save all data
export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event for real-time updates across components
    window.dispatchEvent(new CustomEvent('study-tracker-update', { detail: data }));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

// Subscribe to data changes
export function subscribeToData(callback: (data: AppData) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: CustomEvent) => {
    callback(event.detail);
  };

  window.addEventListener('study-tracker-update', handler as EventListener);
  return () => window.removeEventListener('study-tracker-update', handler as EventListener);
}

// Course operations
export function getCourses(): Course[] {
  return getData().courses;
}

export function getCourse(courseId: string): Course | undefined {
  return getData().courses.find(c => c.id === courseId);
}

export function createCourse(name: string): Course {
  const data = getData();
  const now = new Date().toISOString();
  const course: Course = {
    id: generateId(),
    name,
    topics: [],
    createdAt: now,
    updatedAt: now,
  };
  data.courses.push(course);
  saveData(data);
  return course;
}

export function updateCourse(courseId: string, updates: Partial<Pick<Course, 'name'>>): Course | undefined {
  const data = getData();
  const courseIndex = data.courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  data.courses[courseIndex] = {
    ...data.courses[courseIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveData(data);
  return data.courses[courseIndex];
}

export function deleteCourse(courseId: string): boolean {
  const data = getData();
  const initialLength = data.courses.length;
  data.courses = data.courses.filter(c => c.id !== courseId);
  // Also delete associated study sessions
  data.studySessions = data.studySessions.filter(s => s.courseId !== courseId);
  if (data.courses.length !== initialLength) {
    saveData(data);
    return true;
  }
  return false;
}

// Topic operations
export function getTopics(courseId: string): Topic[] {
  const course = getCourse(courseId);
  return course?.topics || [];
}

export function getTopic(courseId: string, topicId: string): Topic | undefined {
  const course = getCourse(courseId);
  return course?.topics.find(t => t.id === topicId);
}

export function createTopic(courseId: string, name: string): Topic | undefined {
  const data = getData();
  const courseIndex = data.courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const now = new Date().toISOString();
  const topic: Topic = {
    id: generateId(),
    courseId,
    name,
    revisionCount: 0,
    timeInvested: 0,
    materials: [],
    createdAt: now,
    updatedAt: now,
  };

  data.courses[courseIndex].topics.push(topic);
  data.courses[courseIndex].updatedAt = now;
  saveData(data);
  return topic;
}

export function updateTopic(courseId: string, topicId: string, updates: Partial<Pick<Topic, 'name' | 'revisionCount' | 'timeInvested'>>): Topic | undefined {
  const data = getData();
  const courseIndex = data.courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const topicIndex = data.courses[courseIndex].topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return undefined;

  data.courses[courseIndex].topics[topicIndex] = {
    ...data.courses[courseIndex].topics[topicIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  data.courses[courseIndex].updatedAt = new Date().toISOString();
  saveData(data);
  return data.courses[courseIndex].topics[topicIndex];
}

export function deleteTopic(courseId: string, topicId: string): boolean {
  const data = getData();
  const courseIndex = data.courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return false;

  const initialLength = data.courses[courseIndex].topics.length;
  data.courses[courseIndex].topics = data.courses[courseIndex].topics.filter(t => t.id !== topicId);
  // Also delete associated study sessions
  data.studySessions = data.studySessions.filter(s => s.topicId !== topicId);
  if (data.courses[courseIndex].topics.length !== initialLength) {
    data.courses[courseIndex].updatedAt = new Date().toISOString();
    saveData(data);
    return true;
  }
  return false;
}

export function incrementRevision(courseId: string, topicId: string): Topic | undefined {
  const topic = getTopic(courseId, topicId);
  if (!topic) return undefined;
  return updateTopic(courseId, topicId, { revisionCount: topic.revisionCount + 1 });
}

export function addTimeInvested(courseId: string, topicId: string, minutes: number): Topic | undefined {
  const topic = getTopic(courseId, topicId);
  if (!topic) return undefined;
  return updateTopic(courseId, topicId, { timeInvested: topic.timeInvested + minutes });
}

// Material operations
export function addMaterial(courseId: string, topicId: string, material: Omit<StudyMaterial, 'id' | 'uploadedAt'>): StudyMaterial | undefined {
  const data = getData();
  const courseIndex = data.courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return undefined;

  const topicIndex = data.courses[courseIndex].topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return undefined;

  const newMaterial: StudyMaterial = {
    ...material,
    id: generateId(),
    uploadedAt: new Date().toISOString(),
  };

  data.courses[courseIndex].topics[topicIndex].materials.push(newMaterial);
  data.courses[courseIndex].topics[topicIndex].updatedAt = new Date().toISOString();
  data.courses[courseIndex].updatedAt = new Date().toISOString();
  saveData(data);
  return newMaterial;
}

export function deleteMaterial(courseId: string, topicId: string, materialId: string): boolean {
  const data = getData();
  const courseIndex = data.courses.findIndex(c => c.id === courseId);
  if (courseIndex === -1) return false;

  const topicIndex = data.courses[courseIndex].topics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return false;

  const initialLength = data.courses[courseIndex].topics[topicIndex].materials.length;
  data.courses[courseIndex].topics[topicIndex].materials = data.courses[courseIndex].topics[topicIndex].materials.filter(m => m.id !== materialId);
  if (data.courses[courseIndex].topics[topicIndex].materials.length !== initialLength) {
    data.courses[courseIndex].topics[topicIndex].updatedAt = new Date().toISOString();
    data.courses[courseIndex].updatedAt = new Date().toISOString();
    saveData(data);
    return true;
  }
  return false;
}

// Study session operations
export function getStudySessions(): StudySession[] {
  return getData().studySessions;
}

export function getSessionsByDate(date: string): StudySession[] {
  return getData().studySessions.filter(s => s.date === date);
}

export function getSessionsByCourse(courseId: string): StudySession[] {
  return getData().studySessions.filter(s => s.courseId === courseId);
}

export function getSessionsByTopic(topicId: string): StudySession[] {
  return getData().studySessions.filter(s => s.topicId === topicId);
}

export function createStudySession(session: Omit<StudySession, 'id' | 'createdAt'>): StudySession {
  const data = getData();
  const newSession: StudySession = {
    ...session,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  data.studySessions.push(newSession);
  saveData(data);
  return newSession;
}

export function deleteStudySession(sessionId: string): boolean {
  const data = getData();
  const initialLength = data.studySessions.length;
  data.studySessions = data.studySessions.filter(s => s.id !== sessionId);
  if (data.studySessions.length !== initialLength) {
    saveData(data);
    return true;
  }
  return false;
}

// Statistics
export function getTotalStudyTime(): number {
  return getData().studySessions.reduce((sum, s) => sum + s.duration, 0);
}

export function getTodayStudyTime(): number {
  const today = getTodayString();
  return getSessionsByDate(today).reduce((sum, s) => sum + s.duration, 0);
}

export function getWeekStudyTime(): number {
  const weekDates = getWeekDates();
  return getData().studySessions
    .filter(s => weekDates.includes(s.date))
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getMonthStudyTime(): number {
  const monthDates = getMonthDates();
  return getData().studySessions
    .filter(s => monthDates.includes(s.date))
    .reduce((sum, s) => sum + s.duration, 0);
}

export function getActiveCoursesCount(): number {
  return getData().courses.filter(c => c.topics.length > 0).length;
}

export function getCompletedTopicsCount(): number {
  return getData().courses.reduce((sum, c) => sum + c.topics.filter(t => t.revisionCount > 0).length, 0);
}

export function getTotalTopicsCount(): number {
  return getData().courses.reduce((sum, c) => sum + c.topics.length, 0);
}

export function getRevisionStreak(): number {
  const data = getData();
  const datesSeen = new Set(data.studySessions.map(s => s.date));
  const dates = Array.from(datesSeen).sort().reverse();
  if (dates.length === 0) return 0;

  let streak = 0;
  const today = getTodayString();
  let checkDate = today;

  // Check if studied today or yesterday (to allow for late night study)
  const hasToday = dates.includes(today);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const hasYesterday = dates.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) return 0;

  for (const date of dates) {
    if (date === checkDate || (streak === 0 && date === yesterdayStr)) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else if (date < checkDate) {
      break;
    }
  }

  return streak;
}

export function getDailyStats(days: number = 7): { date: string; minutes: number }[] {
  const stats: { date: string; minutes: number }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const minutes = getSessionsByDate(dateStr).reduce((sum, s) => sum + s.duration, 0);
    stats.push({ date: dateStr, minutes });
  }

  return stats;
}

// Settings
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'hello-kitty';
  return (localStorage.getItem('study-tracker-theme') as Theme) || 'hello-kitty';
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('study-tracker-theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function getDailyGoal(): number {
  return getData().settings.dailyGoal;
}

export function setDailyGoal(goal: number): void {
  const data = getData();
  data.settings.dailyGoal = goal;
  saveData(data);
}

// File to base64 conversion
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Export/Import data
export function exportData(): string {
  return JSON.stringify(getData(), null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppData;
    saveData(data);
    return true;
  } catch {
    return false;
  }
}