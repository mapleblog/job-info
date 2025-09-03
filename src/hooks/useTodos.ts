import { useMemo } from 'react';
import { useFirebase } from './useFirebase';
import { Priority, CreateTodoInput, UpdateTodoInput } from '../types/todo';

export interface UseTodosReturn {
  todos: any[];
  loading: boolean;
  error: string | null;
  addTodo: (title: string, priority: Priority) => Promise<void>;
  updateTodo: (id: string, updates: { title?: string; priority?: Priority }) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}

export const useTodos = (): UseTodosReturn => {
  const {
    todos,
    loading,
    error,
    addTodo: firebaseAddTodo,
    updateTodo: firebaseUpdateTodo,
    deleteTodo: firebaseDeleteTodo,
    toggleTodo: firebaseToggleTodo,
    clearCompleted: firebaseClearCompleted
  } = useFirebase();

  // Calculate statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [todos]);

  // Adapter function to match the old interface
  const addTodo = async (title: string, priority: Priority): Promise<void> => {
    // Parse title to extract description if it contains " - "
    const parts = title.split(' - ');
    const todoTitle = parts[0];
    const description = parts.length > 1 ? parts.slice(1).join(' - ') : undefined;

    const todoInput: CreateTodoInput = {
      title: todoTitle,
      description,
      priority
    };

    await firebaseAddTodo(todoInput);
  };

  // Adapter function to match the old interface
  const updateTodo = async (id: string, updates: { title?: string; priority?: Priority }): Promise<void> => {
    const updateData: UpdateTodoInput = {};

    if (updates.title) {
      // Parse title to extract description if it contains " - "
      const parts = updates.title.split(' - ');
      updateData.title = parts[0];
      updateData.description = parts.length > 1 ? parts.slice(1).join(' - ') : undefined;
    }

    if (updates.priority) {
      updateData.priority = updates.priority;
    }

    await firebaseUpdateTodo(id, updateData);
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo: firebaseDeleteTodo,
    toggleTodo: firebaseToggleTodo,
    clearCompleted: firebaseClearCompleted,
    stats
  };
};