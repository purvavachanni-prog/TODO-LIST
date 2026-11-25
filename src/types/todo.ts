export type Priority = 'Low' | 'Medium' | 'High';

export type Category = 'Work' | 'Study' | 'Personal' | 'Projects';

export type ViewMode = 'week' | 'today' | 'all';

export type ThemeId =
  | 'warm-editorial'
  | 'botanical-sage'
  | 'dusk-lavender'
  | 'minimalist-mono';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  category: Category;
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
  reminded: boolean;
  created_at: string;
}

export interface TodoPayload {
  title: string;
  description: string | null;
  priority: Priority;
  category: Category;
  due_date: string | null;
  due_time: string | null;
  completed: boolean;
  reminded: boolean;
}
