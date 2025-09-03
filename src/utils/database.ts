import initSqlJs from 'sql.js';
import { Todo, Priority } from '../types/todo';

let SQL: any = null;
let db: any = null;

// Database version for schema management
const DATABASE_VERSION = 2;
const VERSION_KEY = 'sqlite-db-version';

// Check if table has required columns
const checkTableSchema = (): boolean => {
  try {
    const stmt = db.prepare("PRAGMA table_info(todos)");
    const columns: string[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      columns.push(row.name as string);
    }
    stmt.free();
    
    // Check if all required columns exist
    const requiredColumns = ['id', 'title', 'description', 'completed', 'priority', 'due_date', 'created_at', 'updated_at'];
    return requiredColumns.every(col => columns.includes(col));
  } catch (error) {
    console.error('Error checking table schema:', error);
    return false;
  }
};

// Clear database cache and force recreation
const clearDatabaseCache = (): void => {
  localStorage.removeItem('sqlite-db');
  localStorage.removeItem(VERSION_KEY);
  console.log('Database cache cleared');
};

// Initialize SQLite database
export const initDatabase = async (): Promise<void> => {
  try {
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://sql.js.org/dist/${file}`
      });
    }

    // Check database version
    const savedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = parseInt(savedVersion || '0');
    
    // If version mismatch, clear cache and recreate
    if (currentVersion !== DATABASE_VERSION) {
      console.log(`Database version mismatch. Current: ${currentVersion}, Required: ${DATABASE_VERSION}`);
      clearDatabaseCache();
    }

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('sqlite-db');
    if (savedDb) {
      try {
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        db = new SQL.Database(uint8Array);
        
        // Verify table schema
        if (!checkTableSchema()) {
          console.log('Table schema invalid, recreating database');
          clearDatabaseCache();
          db = new SQL.Database();
          await createTables();
        }
      } catch (error) {
        console.log('Error loading saved database, creating new one:', error);
        clearDatabaseCache();
        db = new SQL.Database();
        await createTables();
      }
    } else {
      // Create new database
      console.log('Creating new database');
      db = new SQL.Database();
      await createTables();
    }
    
    // Save current version
    localStorage.setItem(VERSION_KEY, DATABASE_VERSION.toString());
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Create todos table
const createTables = async (): Promise<void> => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `;
  
  db.run(createTableSQL);
  await saveDatabase();
};

// Save database to localStorage
const saveDatabase = async (): Promise<void> => {
  if (db) {
    const data = db.export();
    const buffer = Array.from(data);
    localStorage.setItem('sqlite-db', JSON.stringify(buffer));
  }
};

// Get all todos
export const getAllTodos = async (): Promise<Todo[]> => {
  if (!db) await initDatabase();
  
  const stmt = db.prepare('SELECT * FROM todos ORDER BY created_at DESC');
  const todos: Todo[] = [];
  
  while (stmt.step()) {
    const row = stmt.getAsObject();
    todos.push({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      completed: Boolean(row.completed),
      priority: row.priority as Priority,
      dueDate: row.due_date as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    });
  }
  
  stmt.free();
  return todos;
};

// Add new todo
export const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
  if (!db) await initDatabase();
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    INSERT INTO todos (id, title, description, completed, priority, due_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run([
    id,
    todo.title,
    todo.description || null,
    todo.completed ? 1 : 0,
    todo.priority,
    todo.dueDate || null,
    now,
    now
  ]);
  stmt.free();
  
  await saveDatabase();
  
  return {
    id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    priority: todo.priority,
    dueDate: todo.dueDate,
    createdAt: now,
    updatedAt: now
  };
};

// Update todo
export const updateTodo = async (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  if (!db) await initDatabase();
  
  const now = new Date().toISOString();
  const setParts: string[] = [];
  const values: any[] = [];
  
  if (updates.title !== undefined) {
    setParts.push('title = ?');
    values.push(updates.title);
  }
  
  if (updates.completed !== undefined) {
    setParts.push('completed = ?');
    values.push(updates.completed ? 1 : 0);
  }
  
  if (updates.priority !== undefined) {
    setParts.push('priority = ?');
    values.push(updates.priority);
  }
  
  if (updates.description !== undefined) {
    setParts.push('description = ?');
    values.push(updates.description);
  }
  
  if (updates.dueDate !== undefined) {
    setParts.push('due_date = ?');
    values.push(updates.dueDate);
  }
  
  setParts.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE todos SET ${setParts.join(', ')} WHERE id = ?
  `);
  
  stmt.run(values);
  stmt.free();
  
  await saveDatabase();
};

// Delete todo
export const deleteTodo = async (id: string): Promise<void> => {
  if (!db) await initDatabase();
  
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  stmt.run([id]);
  stmt.free();
  
  await saveDatabase();
};

// Clear all todos
export const clearAllTodos = async (): Promise<void> => {
  if (!db) await initDatabase();
  
  db.run('DELETE FROM todos');
  await saveDatabase();
};

// Get database statistics
export const getDatabaseStats = async (): Promise<{ totalTodos: number; completedTodos: number }> => {
  if (!db) await initDatabase();
  
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM todos');
  totalStmt.step();
  const totalTodos = totalStmt.getAsObject().count as number;
  totalStmt.free();
  
  const completedStmt = db.prepare('SELECT COUNT(*) as count FROM todos WHERE completed = 1');
  completedStmt.step();
  const completedTodos = completedStmt.getAsObject().count as number;
  completedStmt.free();
  
  return { totalTodos, completedTodos };
};