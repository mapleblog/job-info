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
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    const setupListener = () => {
      try {
        const todosRef = ref(database, 'todos');
        const todosQuery = query(todosRef, orderByChild('createdAt'));

        const unsubscribe = onValue(
          todosQuery,
          (snapshot) => {
            try {
              const data = snapshot.val();
              if (data && typeof data === 'object') {
                const todosList: Todo[] = Object.entries(data)
                  .map(([key, value]) => {
                    // Type guard to ensure value is a valid todo object
                    if (!value || typeof value !== 'object') {
                      console.warn(`Invalid todo data for key ${key}:`, value);
                      return null;
                    }
                    
                    const todoData = value as any;
                    
                    // Validate required fields
                    if (!todoData.title || typeof todoData.title !== 'string') {
                      console.warn(`Todo ${key} missing or invalid title:`, todoData);
                      return null;
                    }
                    
                    // Ensure all required fields exist with proper defaults
                    const todo: Todo = {
                      id: key,
                      title: todoData.title.trim(),
                      description: typeof todoData.description === 'string' ? todoData.description : '',
                      completed: Boolean(todoData.completed),
                      priority: ['low', 'medium', 'high'].includes(todoData.priority) ? todoData.priority : 'medium',
                      createdAt: todoData.createdAt || new Date().toISOString(),
                      updatedAt: todoData.updatedAt || new Date().toISOString()
                    };
                    
                    // Only add dueDate if it exists and is valid
                    if (todoData.dueDate && typeof todoData.dueDate === 'string') {
                      todo.dueDate = todoData.dueDate;
                    }
                    
                    return todo;
                  })
                  .filter((todo): todo is Todo => todo !== null); // Remove invalid entries
                  
                setTodos(todosList.reverse()); // Show newest first
              } else {
                setTodos([]);
              }
              setError(null);
              retryCount = 0; // Reset retry count on success
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
              setError(`Failed to process todos data: ${errorMessage}`);
              console.error('Firebase data processing error:', err);
            } finally {
              setLoading(false);
            }
          },
          (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
            console.error('Firebase connection error:', err);
            
            if (retryCount < maxRetries) {
              retryCount++;
              setError(`Connection failed, retrying... (${retryCount}/${maxRetries})`);
              setTimeout(() => {
                setupListener();
              }, retryDelay * retryCount);
            } else {
              setError(`Failed to connect to database after ${maxRetries} attempts: ${errorMessage}`);
              setLoading(false);
            }
          }
        );

        return () => {
          if (unsubscribe) {
            off(todosRef, 'value', unsubscribe);
          }
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Firebase';
        setError(`Firebase initialization error: ${errorMessage}`);
        setLoading(false);
        console.error('Firebase setup error:', err);
        return () => {}; // Return empty cleanup function
      }
    };
    
    const cleanup = setupListener();
    return cleanup;
  }, []);

  // Add new todo
  const addTodo = useCallback(async (todoInput: CreateTodoInput) => {
    try {
      // Validate input
      if (!todoInput || typeof todoInput !== 'object') {
        throw new Error('Invalid todo input');
      }
      
      if (!todoInput.title || typeof todoInput.title !== 'string' || todoInput.title.trim().length === 0) {
        throw new Error('Todo title is required');
      }
      
      const todosRef = ref(database, 'todos');
      const newTodoRef = push(todosRef);
      
      const now = new Date().toISOString();
      const newTodo: Omit<Todo, 'id'> = {
        title: todoInput.title.trim(),
        description: todoInput.description || '',
        priority: todoInput.priority || 'medium',
        completed: false,
        createdAt: now,
        updatedAt: now
      };
      
      // Only add dueDate if it's provided and not undefined
      if (todoInput.dueDate) {
        newTodo.dueDate = todoInput.dueDate;
      }

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
      // Validate inputs
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('Invalid todo ID');
      }
      
      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update data');
      }
      
      // Validate title if provided
      if (updates.title !== undefined) {
        if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
          throw new Error('Todo title cannot be empty');
        }
      }
      
      const todoRef = ref(database, `todos/${id}`);
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };
      
      // Only include valid fields in update
      if (updates.title !== undefined) {
        updateData.title = updates.title.trim();
      }
      if (updates.description !== undefined) {
        updateData.description = updates.description || '';
      }
      if (updates.priority !== undefined) {
        updateData.priority = updates.priority;
      }
      if (updates.dueDate !== undefined) {
        // Only set dueDate if it's not null/undefined
        if (updates.dueDate) {
          updateData.dueDate = updates.dueDate;
        } else {
          // If dueDate is explicitly set to null, remove it from Firebase
          updateData.dueDate = null;
        }
      }
      if (updates.completed !== undefined) {
        updateData.completed = Boolean(updates.completed);
      }

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
      // Validate input
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('Invalid todo ID for deletion');
      }
      
      // Check if todo exists before attempting deletion
      const existingTodo = todos.find(t => t && t.id === id);
      if (!existingTodo) {
        console.warn(`Todo with ID ${id} not found for deletion`);
        return; // Silently return if todo doesn't exist
      }
      
      const todoRef = ref(database, `todos/${id}`);
      await remove(todoRef);
      setError(null);
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Firebase delete error:', err);
      throw err;
    }
  }, [todos]);

  // Toggle todo completion status
  const toggleTodo = useCallback(async (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid todo ID');
      }
      
      const todo = todos.find(t => t && t.id === id);
      if (!todo || typeof todo.completed !== 'boolean') {
        throw new Error('Todo not found or invalid');
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
      const completedTodos = todos.filter(todo => 
        todo && 
        typeof todo === 'object' && 
        typeof todo.completed === 'boolean' && 
        todo.completed === true &&
        typeof todo.id === 'string' &&
        todo.id.length > 0
      );
      
      if (completedTodos.length === 0) {
        return; // No completed todos to clear
      }
      
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