export type TaskPriority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: TaskPriority;
  listId: string;
  tags: string[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  subtasks: SubTask[];
  isStarred: boolean;
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly';
  isArchived: boolean;
}

export interface List {
  id: string;
  name: string;
  emoji: string;
  accentColor: string; // Tailwind tint or Hex value
}

export interface Settings {
  theme: 'dark' | 'light';
  globalAccentColor: string; // The primary custom UI accent
  notificationsEnabled: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export interface UndoAction {
  id: string;
  type: 'delete_task' | 'archive_task' | 'complete_task';
  task: Task;
  expiry: number; // UTC timestamp when undo expires
}
