import { useState } from 'react';
import { Priority, FilterStatus, TodoFilter, CreateTodoInput } from './types/todo';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { useSQLiteTodos } from './hooks/useSQLiteTodos';
import { Search, Filter, CheckSquare, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    clearCompleted,
    stats
  } = useSQLiteTodos();

  const [filter, setFilter] = useState<TodoFilter>({
    status: FilterStatus.ALL,
    searchQuery: '',
    priority: undefined
  });

  const handleAddTodo = async (todoInput: CreateTodoInput) => {
    const todoText = todoInput.title + (todoInput.description ? ` - ${todoInput.description}` : '');
    await addTodo(todoText, todoInput.priority);
  };

  const handleToggleTodo = async (id: string) => {
    await toggleTodo(id);
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
  };

  const handleUpdateTodo = async (id: string, updates: { title?: string; description?: string; priority?: Priority }) => {
    const todoText = (updates.title || '') + (updates.description ? ` - ${updates.description}` : '');
    await updateTodo(id, { title: todoText, priority: updates.priority });
  };

  const handleFilterChange = (newFilter: Partial<TodoFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handleClearCompleted = async () => {
    await clearCompleted();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckSquare size={32} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
          </div>
          <p className="text-gray-600">Stay organized and get things done with SQLite</p>
          <div className="flex justify-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Total: {stats.total}</span>
            <span>Completed: {stats.completed}</span>
            <span>Pending: {stats.pending}</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600">Loading todos...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-600 mr-2" />
              <span className="text-red-800">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Add Todo Form */}
        <div className="mb-6">
          <TodoForm onAddTodo={handleAddTodo} />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filter.searchQuery}
                  onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange({ status: e.target.value as FilterStatus })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={FilterStatus.ALL}>All Tasks</option>
                <option value={FilterStatus.ACTIVE}>Active</option>
                <option value={FilterStatus.COMPLETED}>Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={filter.priority || ''}
                onChange={(e) => handleFilterChange({ priority: e.target.value ? e.target.value as Priority : undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value={Priority.HIGH}>High Priority</option>
                <option value={Priority.MEDIUM}>Medium Priority</option>
                <option value={Priority.LOW}>Low Priority</option>
              </select>
            </div>

            {/* Clear Completed */}
            {stats.completed > 0 && (
              <button
                onClick={handleClearCompleted}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Clear Completed ({stats.completed})
              </button>
            )}
          </div>
        </div>

        {/* Todo List */}
        <TodoList
          todos={todos}
          filter={filter}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
          onUpdateTodo={handleUpdateTodo}
        />
      </div>
    </div>
  );
}

export default App;
