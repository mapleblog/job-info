// Test SQLite database functionality
import { initDatabase, addTodo, getAllTodos } from './database';
import { Priority } from '../types/todo';

export const testSQLiteDatabase = async (): Promise<void> => {
  try {
    console.log('Testing SQLite database...');
    
    // Initialize database
    await initDatabase();
    console.log('✓ Database initialized successfully');
    
    // Test adding a todo
    const testTodo = await addTodo({
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
      priority: Priority.HIGH
    });
    console.log('✓ Todo added successfully:', testTodo);
    
    // Test getting all todos
    const todos = await getAllTodos();
    console.log('✓ Todos retrieved successfully:', todos.length, 'todos found');
    
    console.log('✅ All SQLite database tests passed!');
  } catch (error) {
    console.error('❌ SQLite database test failed:', error);
    throw error;
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testSQLiteDatabase = testSQLiteDatabase;
}