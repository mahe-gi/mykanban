'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard, { Task } from './TaskCard';
import * as apiClient from '../lib/apiClient';

interface KanbanBoardProps {
  channelId: string;
}

interface Column {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

// Sortable wrapper for task cards
function SortableTask({ task, onEdit, onDelete }: { task: Task, onEdit?: (task: Task) => void, onDelete?: (taskId: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group">
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

// Droppable column component
function DroppableColumn({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`${className} ${isOver ? 'ring-2 ring-blue-400 ring-opacity-75 bg-blue-50' : ''}`}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard({ channelId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', column: 'todo' as Task['column'] });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTasks = await apiClient.getTasks(channelId);
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [channelId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const taskToUpdate = tasks.find(t => t.id === activeId);
    if (!taskToUpdate) return;

    let newColumn: Task['column'];

    // Check if dropping on a column
    if (columns.some(col => col.id === overId)) {
      newColumn = overId as Task['column'];
    } else {
      // Dropping on another task - get that task's column
      const targetTask = tasks.find(t => t.id === overId);
      if (targetTask) {
        newColumn = targetTask.column;
      } else {
        return; // Invalid drop target
      }
    }

    // Only update if column actually changed
    if (taskToUpdate.column !== newColumn) {
      // Optimistically update the UI
      const oldTasks = tasks;
      setTasks(tasks => 
        tasks.map(task => 
          task.id === activeId 
            ? { ...task, column: newColumn }
            : task
        )
      );

      try {
        // Update via API
        await apiClient.updateTask(activeId, { column: newColumn });
      } catch (err) {
        // Revert on error
        console.error('Failed to update task:', err);
        setTasks(oldTasks);
        setError('Failed to move task. Please try again.');
      }
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const createdTask = await apiClient.createTask(channelId, {
        title: newTask.title,
        description: newTask.description,
        column: newTask.column,
      });

      setTasks(prev => [...prev, createdTask]);
      setNewTask({ title: '', description: '', column: 'todo' });
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistically update UI
      const oldTasks = tasks;
      setTasks(tasks => tasks.filter(task => task.id !== taskId));

      // Delete via API
      await apiClient.deleteTask(taskId);
    } catch (err) {
      // Revert on error
      console.error('Failed to delete task:', err);
      setTasks(tasks);
      setError('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-sm text-gray-500 mt-1">Channel: {channelId}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Task</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading tasks...</span>
        </div>
      ) : (
        /* Kanban Board */
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {columns.map(column => {
            const columnTasks = tasks.filter(task => task.column === column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} rounded-lg p-4 mb-4`}>
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">{column.title}</h2>
                    <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                
                <DroppableColumn id={column.id} className="flex-1 min-h-[400px] p-2 rounded-lg transition-all">
                  <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {columnTasks.map(task => (
                        <SortableTask 
                          key={task.id} 
                          task={task} 
                          onDelete={handleDeleteTask}
                        />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              </div>
            );
          })}
        </div>
      </DndContext>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Column
                </label>
                <select
                  value={newTask.column}
                  onChange={(e) => setNewTask(prev => ({ ...prev, column: e.target.value as Task['column'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {columns.map(column => (
                    <option key={column.id} value={column.id}>
                      {column.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}