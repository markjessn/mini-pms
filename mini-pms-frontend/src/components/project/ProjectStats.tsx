import type { ProjectStatistics } from '../../types';
import { Card, CardBody } from '../ui';

interface ProjectStatsProps {
  stats: ProjectStatistics;
}

export function ProjectStats({ stats }: ProjectStatsProps) {
  const statItems = [
    { label: 'Total Projects', value: stats.totalProjects, color: 'text-gray-900' },
    { label: 'Active', value: stats.activeProjects, color: 'text-green-600' },
    { label: 'On Hold', value: stats.onHoldProjects, color: 'text-yellow-600' },
    { label: 'Completed', value: stats.completedProjects, color: 'text-blue-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
