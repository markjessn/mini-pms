import type { Project } from '../../types';
import { ProjectCard } from './ProjectCard';
import { EmptyState, Button } from '../ui';

interface ProjectListProps {
  projects: Project[];
  orgSlug: string;
  onCreateClick: () => void;
}

export function ProjectList({ projects, orgSlug, onCreateClick }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        }
        title="No projects yet"
        description="Get started by creating your first project."
        action={
          <Button onClick={onCreateClick}>Create Project</Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} orgSlug={orgSlug} />
      ))}
    </div>
  );
}
