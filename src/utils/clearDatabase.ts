// Temporary utility to clear SQLite database
export const clearSQLiteDatabase = (): void => {
  try {
    // Clear SQLite database from localStorage
    localStorage.removeItem('sqlite-db');
    
    // Clear migration status to force re-initialization
    localStorage.removeItem('migration-completed');
    
    // Clear any backup data
    localStorage.removeItem('todos-backup');
    
    console.log('SQLite database cleared successfully');
    
    // Reload the page to reinitialize
    window.location.reload();
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearSQLiteDatabase = clearSQLiteDatabase;
}