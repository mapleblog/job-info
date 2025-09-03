import { useState, useEffect, useCallback } from 'react';
import { Todo, Priority } from '../types/todo';
import {
  getAllTodos,
  addTodo as dbAddTodo,
  updateTodo as dbUpdateTodo,
  deleteTodo as dbDeleteTodo,
  clearAllTodos as dbClearAllTodos,
  getDatabaseStats,
  initDatabase
} from '../utils/database';
import { migrateFromLocalStorage, isMigrationNeeded } from '../utils/migration';

export interface UseSQLiteTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (title: string, priority?: Priority) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  clearAll: () => Promise<void>;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}

export const useSQLiteTodos = (): UseSQLiteTodosReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  // Initialize database and load todos
  const initializeAndLoadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if migration is needed
      if (isMigrationNeeded()) {
        console.log('Migration needed, starting migration...');
        const migrationSuccess = await migrateFromLocalStorage();
        if (!migrationSuccess) {
          throw new Error('Failed to migrate data from LocalStorage');
        }
      }

      // Initialize database
      await initDatabase();

      // Load todos
      const loadedTodos = await getAllTodos();
      setTodos(loadedTodos);

      // Update stats
      await updateStats();
    } catch (err) {
      console.error('Failed to initialize todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update statistics
  const updateStats = useCallback(async () => {
    try {
      const dbStats = await getDatabaseStats();
      setStats({
        total: dbStats.totalTodos,
        completed: dbStats.completedTodos,
        pending: dbStats.totalTodos - dbStats.completedTodos
      });
    } catch (err) {
      console.error('Failed to update stats:', err);
    }
  }, []);

  // Add new todo
  const addTodo = useCallback(async (title: string, priority: Priority = Priority.MEDIUM) => {
    try {
      setError(null);
      const newTodo = await dbAddTodo({
        title: title.trim(),
        completed: false,
        priority
      });
      
      setTodos(prev => [newTodo, ...prev]);
      await updateStats();
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to add todo');
    }
  }, [updateStats]);

  // Update todo
  const updateTodo = useCallback(async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      setError(null);
      await dbUpdateTodo(id, updates);
      
      setTodos(prev => prev.map(todo => 
        todo.id === id 
          ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
          : todo
      ));
      
      await updateStats();
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  }, [updateStats]);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);
      await dbDeleteTodo(id);
      
      setTodos(prev => prev.filter(todo => todo.id !== id));
      await updateStats();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  }, [updateStats]);

  // Toggle todo completion status
  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  }, [todos, updateTodo]);

  // Clear completed todos
  const clearCompleted = useCallback(async () => {
    try {
      setError(null);
      const completedTodos = todos.filter(todo => todo.completed);
      
      for (const todo of completedTodos) {
        await dbDeleteTodo(todo.id);
      }
      
      setTodos(prev => prev.filter(todo => !todo.completed));
      await updateStats();
    } catch (err) {
      console.error('Failed to clear completed todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear completed todos');
    }
  }, [todos, updateStats]);

  // Clear all todos
  const clearAll = useCallback(async () => {
    try {
      setError(null);
      await dbClearAllTodos();
      setTodos([]);
      await updateStats();
    } catch (err) {
      console.error('Failed to clear all todos:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear all todos');
    }
  }, [updateStats]);

  // Initialize on mount
  useEffect(() => {
    initializeAndLoadTodos();
  }, [initializeAndLoadTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    clearAll,
    stats
  };
};