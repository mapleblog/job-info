import { useState, useEffect, useCallback } from 'react';
import { 
  ref, 
  push, 
  set, 
  remove, 
  onValue, 
  off, 
  update,
  query,
  orderByChild
} from 'firebase/database';
import { database } from '../lib/firebase';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../types/todo';

export interface UseFirebaseReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (todo: CreateTodoInput) => Promise<void>;
  updateTodo: (id: string, updates: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
}

export const useFirebase = (): UseFirebaseReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Firebase listener
  useEffect(() => {
    const todosRef = ref(database, 'todos');
    const todosQuery = query(todosRef, orderByChild('createdAt'));

    const unsubscribe = onValue(
      todosQuery,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const todosList: Todo[] = Object.entries(data).map(([key, value]) => ({
              ...(value as Omit<Todo, 'id'>),
              id: key
            }));
            setTodos(todosList.reverse()); // Show newest first
          } else {
            setTodos([]);
          }
          setError(null);
        } catch (err) {
          setError('Failed to load todos');
          console.error('Firebase read error:', err);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Failed to connect to database');
        setLoading(false);
        console.error('Firebase connection error:', err);
      }
    );

    return () => {
      off(todosRef, 'value', unsubscribe);
    };
  }, []);

  // Add new todo
  const addTodo = useCallback(async (todoInput: CreateTodoInput) => {
    try {
      const todosRef = ref(database, 'todos');
      const newTodoRef = push(todosRef);
      
      const now = new Date().toISOString();
      const newTodo: Omit<Todo, 'id'> = {
        ...todoInput,
        completed: false,
        createdAt: now,
        updatedAt: now
      };

      await set(newTodoRef, newTodo);
      setError(null);
    } catch (err) {
      setError('Failed to add todo');
      console.error('Firebase add error:', err);
      throw err;
    }
  }, []);

  // Update existing todo
  const updateTodo = useCallback(async (id: string, updates: UpdateTodoInput) => {
    try {
      const todoRef = ref(database, `todos/${id}`);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await update(todoRef, updateData);
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error('Firebase update error:', err);
      throw err;
    }
  }, []);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    try {
      const todoRef = ref(database, `todos/${id}`);
      await remove(todoRef);
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Firebase delete error:', err);
      throw err;
    }
  }, []);

  // Toggle todo completion status
  const toggleTodo = useCallback(async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        throw new Error('Todo not found');
      }

      await updateTodo(id, { completed: !todo.completed });
    } catch (err) {
      setError('Failed to toggle todo');
      console.error('Firebase toggle error:', err);
      throw err;
    }
  }, [todos, updateTodo]);

  // Clear all completed todos
  const clearCompleted = useCallback(async () => {
    try {
      const completedTodos = todos.filter(todo => todo.completed);
      const deletePromises = completedTodos.map(todo => deleteTodo(todo.id));
      await Promise.all(deletePromises);
      setError(null);
    } catch (err) {
      setError('Failed to clear completed todos');
      console.error('Firebase clear completed error:', err);
      throw err;
    }
  }, [todos, deleteTodo]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted
  };
};