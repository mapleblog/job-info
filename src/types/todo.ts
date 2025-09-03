export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO string format for SQLite compatibility
  createdAt: string; // ISO string format for SQLite compatibility
  updatedAt: string; // ISO string format for SQLite compatibility
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum FilterStatus {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export type TodoFilter = {
  status: FilterStatus;
  searchQuery: string;
  priority?: Priority;
};

export type CreateTodoInput = Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>;

export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>;