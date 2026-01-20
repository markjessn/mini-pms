import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Card, CardBody, StatusBadge } from '../ui';

interface ProjectCardProps {
  project: Project;
  orgSlug: string;
}

export function ProjectCard({ project, orgSlug }: ProjectCardProps) {
  const progressPercent = project.completionRate || 0;

  return (
    <Link to={`/${orgSlug}/projects/${project.id}`}>
      <Card hoverable className="h-full">
        <CardBody>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {project.name}
            </h3>
            <StatusBadge status={project.status} />
          </div>

          {project.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-900">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {project.completedTasks} / {project.taskCount} tasks
              </span>
              {project.dueDate && (
                <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
