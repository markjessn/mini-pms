import { useState } from 'react';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const columns: { status: TaskStatus; title: string; color: string; dropColor: string }[] = [
  { status: 'TODO', title: 'To Do', color: 'bg-gray-100', dropColor: 'bg-gray-200' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-50', dropColor: 'bg-yellow-100' },
  { status: 'DONE', title: 'Done', color: 'bg-green-50', dropColor: 'bg-green-100' },
];

export function TaskBoard({ tasks, onTaskClick, onTaskStatusChange }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    // Add a slight delay to allow the drag image to be captured
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the column entirely (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== newStatus && onTaskStatusChange) {
      onTaskStatusChange(draggedTask.id, newStatus);
    }
    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        const isDropTarget = dragOverColumn === column.status && draggedTask?.status !== column.status;

        return (
          <div
            key={column.status}
            className={`rounded-lg p-4 transition-colors duration-200 ${
              isDropTarget ? column.dropColor : column.color
            } ${isDropTarget ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-500">{columnTasks.length}</span>
            </div>
            <div className="space-y-3 min-h-[100px]">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <TaskCard
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                </div>
              ))}
              {columnTasks.length === 0 && (
                <p className={`text-sm text-gray-400 text-center py-4 ${
                  isDropTarget ? 'text-blue-500' : ''
                }`}>
                  {isDropTarget ? 'Drop here' : 'No tasks'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
