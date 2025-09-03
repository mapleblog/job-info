import React, { useState } from 'react';
import { Priority, CreateTodoInput } from '../types/todo';
import { Plus, AlertCircle } from 'lucide-react';

interface TodoFormProps {
  onAddTodo: (todo: CreateTodoInput) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Task title must be at least 2 characters';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Task title must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newTodo: CreateTodoInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority
    };

    onAddTodo(newTodo);
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority(Priority.MEDIUM);
    setIsExpanded(false);
    setErrors({});
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    // Clear title error when user starts typing
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.HIGH:
        return 'text-red-600 bg-red-50 border-red-200';
      case Priority.MEDIUM:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case Priority.LOW:
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: Priority): string => {
    switch (priority) {
      case Priority.HIGH:
        return 'High Priority';
      case Priority.MEDIUM:
        return 'Medium Priority';
      case Priority.LOW:
        return 'Low Priority';
      default:
        return 'Medium Priority';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit} className="p-4">
        {/* Title Input */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Add a new task..."
              className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              onFocus={() => setIsExpanded(true)}
            />
            
            {!isExpanded && (
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            )}
          </div>
          
          {errors.title && (
            <div className="flex items-center space-x-1 text-red-600 text-sm">
              <AlertCircle size={14} />
              <span>{errors.title}</span>
            </div>
          )}
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex space-x-2">
                {Object.values(Priority).map((priorityOption) => (
                  <button
                    key={priorityOption}
                    type="button"
                    onClick={() => setPriority(priorityOption)}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      priority === priorityOption
                        ? getPriorityColor(priorityOption)
                        : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getPriorityLabel(priorityOption)}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle('');
                  setDescription('');
                  setPriority(Priority.MEDIUM);
                  setErrors({});
                }}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default TodoForm;