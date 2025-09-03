import React from 'react';
import { Todo, Priority, TodoFilter } from '../types/todo';
import TodoItem from './TodoItem';
import { ListTodo, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  filter: TodoFilter;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (id: string, updates: { title?: string; description?: string; priority?: Priority }) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  filter,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodo
}) => {
  const filterTodos = (todos: Todo[], filter: TodoFilter): Todo[] => {
    return todos.filter(todo => {
      // Filter by status
      const statusMatch = (() => {
        switch (filter.status) {
          case 'active':
            return !todo.completed;
          case 'completed':
            return todo.completed;
          case 'all':
          default:
            return true;
        }
      })();

      // Filter by search query
      const searchMatch = filter.searchQuery === '' ||
        todo.title.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(filter.searchQuery.toLowerCase()));

      // Filter by priority
      const priorityMatch = !filter.priority || todo.priority === filter.priority;

      return statusMatch && searchMatch && priorityMatch;
    });
  };

  const filteredTodos = filterTodos(todos, filter);
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const activeTodos = totalTodos - completedTodos;

  const getEmptyStateContent = () => {
    if (totalTodos === 0) {
      return {
        icon: <ListTodo size={48} className="text-gray-300" />,
        title: "No tasks yet",
        description: "Add your first task to get started!"
      };
    }

    if (filteredTodos.length === 0) {
      switch (filter.status) {
        case 'active':
          return {
            icon: <CheckCircle2 size={48} className="text-green-300" />,
            title: "All tasks completed!",
            description: "Great job! You've completed all your tasks."
          };
        case 'completed':
          return {
            icon: <Circle size={48} className="text-gray-300" />,
            title: "No completed tasks",
            description: "Complete some tasks to see them here."
          };
        default:
          return {
            icon: <AlertCircle size={48} className="text-gray-300" />,
            title: "No matching tasks",
            description: "Try adjusting your search or filter criteria."
          };
      }
    }

    return null;
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="space-y-4">
      {/* Stats */}
      {totalTodos > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Circle size={16} className="text-blue-500" />
                <span>{activeTodos} active</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>{completedTodos} completed</span>
              </span>
            </div>
            <span className="font-medium">
              {totalTodos} total task{totalTodos !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Progress bar */}
          {totalTodos > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round((completedTodos / totalTodos) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedTodos / totalTodos) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-2">
        {filteredTodos.length > 0 ? (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
              onUpdate={onUpdateTodo}
            />
          ))
        ) : (
          emptyState && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                {emptyState.icon}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {emptyState.title}
                  </h3>
                  <p className="text-gray-500">
                    {emptyState.description}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Filter info */}
      {filteredTodos.length > 0 && filteredTodos.length < totalTodos && (
        <div className="text-center text-sm text-gray-500 py-2">
          Showing {filteredTodos.length} of {totalTodos} task{totalTodos !== 1 ? 's' : ''}
          {filter.searchQuery && (
            <span> matching "{filter.searchQuery}"</span>
          )}
          {filter.priority && (
            <span> with {filter.priority} priority</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoList;