export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';
export type Category = 'work' | 'personal' | 'study' | 'project' | 'company';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: Category;
  dueDate: string | null;
  userId: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  userId: string;
  completedDates: string[]; // ISO date strings
  category?: Category;
  createdAt: string;
}

export interface UserContext {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
