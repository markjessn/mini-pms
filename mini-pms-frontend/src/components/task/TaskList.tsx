import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { EmptyState, Button } from '../ui';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onCreateClick: () => void;
}

export function TaskList({ tasks, onTaskClick, onCreateClick }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="No tasks yet"
        description="Create your first task to get started."
        action={<Button onClick={onCreateClick}>Add Task</Button>}
      />
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
      ))}
    </div>
  );
}
