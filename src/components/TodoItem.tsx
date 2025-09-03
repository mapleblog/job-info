import React, { useState } from 'react';
import { Todo, Priority } from '../types/todo';
import { Trash2, Edit3, Check, X } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; description?: string; priority?: Priority }) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'border-l-red-500 bg-red-50';
      case Priority.MEDIUM:
        return 'border-l-yellow-500 bg-yellow-50';
      case Priority.LOW:
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (priority) {
      case Priority.HIGH:
        return `${baseClasses} bg-red-100 text-red-800`;
      case Priority.MEDIUM:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case Priority.LOW:
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 mb-3 shadow-sm transition-all duration-200 hover:shadow-md ${
      todo.completed ? 'bg-gray-100 opacity-75' : getPriorityColor(todo.priority)
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo.id)}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              todo.completed
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {todo.completed && <Check size={12} />}
          </button>

          {/* Content */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Task title"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Task description (optional)"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center space-x-1"
                  >
                    <Check size={14} />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className={`font-medium text-gray-900 ${
                  todo.completed ? 'line-through text-gray-500' : ''
                }`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={`mt-1 text-sm text-gray-600 ${
                    todo.completed ? 'line-through' : ''
                  }`}>
                    {todo.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <span className={getPriorityBadge(todo.priority)}>
                    {todo.priority.toUpperCase()}
                  </span>
                  {todo.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(todo.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit task"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoItem;