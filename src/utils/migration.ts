import { Todo } from '../types/todo';
import { initDatabase, addTodo, clearAllTodos } from './database';

// Migration function to transfer data from LocalStorage to SQLite
export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    // Check if migration has already been completed
    const migrationCompleted = localStorage.getItem('migration-completed');
    if (migrationCompleted === 'true') {
      console.log('Migration already completed');
      return true;
    }

    // Initialize SQLite database
    await initDatabase();

    // Get existing todos from LocalStorage
    const existingTodos = getLocalStorageTodos();
    
    if (existingTodos.length === 0) {
      console.log('No todos found in LocalStorage to migrate');
      localStorage.setItem('migration-completed', 'true');
      return true;
    }

    console.log(`Migrating ${existingTodos.length} todos from LocalStorage to SQLite`);

    // Clear any existing SQLite data to avoid duplicates
    await clearAllTodos();

    // Migrate each todo to SQLite
    for (const todo of existingTodos) {
      await addTodo({
        title: todo.title,
        completed: todo.completed,
        priority: todo.priority
      });
    }

    // Mark migration as completed
    localStorage.setItem('migration-completed', 'true');
    
    // Optionally backup old LocalStorage data before removing
    localStorage.setItem('todos-backup', JSON.stringify(existingTodos));
    
    // Remove old todos from LocalStorage
    localStorage.removeItem('todos');
    
    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

// Helper function to get todos from LocalStorage in the old format
const getLocalStorageTodos = (): Todo[] => {
  try {
    const todosJson = localStorage.getItem('todos');
    if (!todosJson) return [];

    const todos = JSON.parse(todosJson);
    
    // Ensure todos is an array and has the correct structure
    if (!Array.isArray(todos)) return [];

    return todos.map((todo: any) => ({
      id: todo.id || crypto.randomUUID(),
      title: todo.text || '',
      description: todo.description,
      completed: Boolean(todo.completed),
      priority: todo.priority || 'medium',
      dueDate: todo.dueDate,
      createdAt: todo.createdAt ? new Date(todo.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: todo.updatedAt ? new Date(todo.updatedAt).toISOString() : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error reading todos from LocalStorage:', error);
    return [];
  }
};

// Function to check if migration is needed
export const isMigrationNeeded = (): boolean => {
  const migrationCompleted = localStorage.getItem('migration-completed');
  const hasLocalStorageTodos = localStorage.getItem('todos') !== null;
  
  return migrationCompleted !== 'true' && hasLocalStorageTodos;
};

// Function to reset migration status (for testing purposes)
export const resetMigrationStatus = (): void => {
  localStorage.removeItem('migration-completed');
  console.log('Migration status reset');
};

// Function to restore todos from backup (in case of migration issues)
export const restoreFromBackup = (): boolean => {
  try {
    const backup = localStorage.getItem('todos-backup');
    if (!backup) {
      console.log('No backup found');
      return false;
    }

    localStorage.setItem('todos', backup);
    localStorage.removeItem('migration-completed');
    console.log('Todos restored from backup');
    return true;
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return false;
  }
};