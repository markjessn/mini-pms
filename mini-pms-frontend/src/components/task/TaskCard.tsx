import type { Task } from '../../types';
import { Card, CardBody, StatusBadge } from '../ui';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card hoverable onClick={onClick}>
      <CardBody>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 line-clamp-1">{task.title}</h4>
          <StatusBadge status={task.status} />
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.assigneeEmail && (
            <span className="truncate max-w-[150px]">{task.assigneeEmail}</span>
          )}
          {task.dueDate && (
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
