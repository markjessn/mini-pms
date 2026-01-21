import { useQuery } from '@apollo/client/react';
import { useParams, Link } from 'react-router-dom';
import { GET_ORGANIZATION, GET_PROJECT_STATISTICS, GET_PROJECTS } from '../graphql/operations';
import { Layout } from '../components/layout';
import { ProjectStats } from '../components/project';
import { Card, CardBody, LoadingOverlay, Button } from '../components/ui';
import type { Organization, Project, ProjectStatistics } from '../types';

export function DashboardPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();

  const { data: orgData, loading: orgLoading } = useQuery<{ organization: Organization }>(GET_ORGANIZATION, {
    variables: { slug: orgSlug },
    skip: !orgSlug,
  });

  const { data: statsData, loading: statsLoading } = useQuery<{ projectStatistics: ProjectStatistics }>(GET_PROJECT_STATISTICS, {
    variables: { organizationSlug: orgSlug },
    skip: !orgSlug,
  });

  const { data: projectsData } = useQuery<{ projects: Project[] }>(GET_PROJECTS, {
    variables: { organizationSlug: orgSlug },
    skip: !orgSlug,
  });

  const organization = orgData?.organization;
  const stats = statsData?.projectStatistics;
  const recentProjects = projectsData?.projects?.slice(0, 5) || [];

  if (orgLoading || statsLoading) {
    return (
      <Layout orgSlug={orgSlug}>
        <LoadingOverlay />
      </Layout>
    );
  }

  if (!organization) {
    return (
      <Layout orgSlug={orgSlug}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Organization not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Go back home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout organization={organization} orgSlug={orgSlug}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to {organization.name}</p>
        </div>

        {stats && <ProjectStats stats={stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
                <Link to={`/${orgSlug}/projects`}>
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
              {recentProjects.length === 0 ? (
                <p className="text-sm text-gray-500">No projects yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentProjects.map((project: any) => (
                    <li key={project.id}>
                      <Link
                        to={`/${orgSlug}/projects/${project.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            {project.completedTasks}/{project.taskCount} tasks completed
                          </p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${
                          project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {project.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to={`/${orgSlug}/projects`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    View All Projects
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
