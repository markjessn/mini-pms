import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { status: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-50' },
  { status: 'DONE', title: 'Done', color: 'bg-green-50' },
];

export function TaskBoard({ tasks, onTaskClick }: TaskBoardProps) {
  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        return (
          <div key={column.status} className={`rounded-lg p-4 ${column.color}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <span className="text-sm text-gray-500">{columnTasks.length}</span>
            </div>
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
              {columnTasks.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
