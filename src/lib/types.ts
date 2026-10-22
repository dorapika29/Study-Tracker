export type Theme = 'hello-kitty' | 'dorami' | 'classic';

export interface StudyMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  url: string; // base64 data URL or blob URL
  size: number;
  uploadedAt: string;
}

export interface Topic {
  id: string;
  courseId: string;
  name: string;
  revisionCount: number;
  timeInvested: number; // in minutes
  materials: StudyMaterial[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  topicId?: string;
  duration: number; // in minutes
  notes?: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
}

export interface AppData {
  courses: Course[];
  studySessions: StudySession[];
  settings: {
    theme: Theme;
    dailyGoal: number; // in minutes
  };
}

// LocalStorage keys
export const STORAGE_KEYS = {
  APP_DATA: 'study-tracker-data',
  THEME: 'study-tracker-theme',
} as const;

// Default data structure
export const DEFAULT_DATA: AppData = {
  courses: [],
  studySessions: [],
  settings: {
    theme: 'hello-kitty',
    dailyGoal: 60,
  },
};

// Helper functions for generating IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getTodayString(): string {
  return formatDate(new Date());
}

export function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(formatDate(date));
  }
  return dates;
}

export function getMonthDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    dates.push(formatDate(date));
  }
  return dates;
}