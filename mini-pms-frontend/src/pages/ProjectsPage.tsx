import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { GET_ORGANIZATION, GET_PROJECTS, CREATE_PROJECT } from '../graphql/operations';
import type { ProjectInput, Project, Organization } from '../types';
import { Layout } from '../components/layout';
import { ProjectList, ProjectForm } from '../components/project';
import { Button, Modal, SearchInput, Select, LoadingOverlay } from '../components/ui';

export function ProjectsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orgData } = useQuery<{ organization: Organization }>(GET_ORGANIZATION, {
    variables: { slug: orgSlug },
    skip: !orgSlug,
  });

  const { data, loading, refetch } = useQuery<{ projects: Project[] }>(GET_PROJECTS, {
    variables: {
      organizationSlug: orgSlug,
      status: statusFilter || undefined,
      search: search || undefined,
    },
    skip: !orgSlug,
  });

  const [createProject, { loading: creating }] = useMutation<{ createProject: { success: boolean; project: Project } }>(CREATE_PROJECT);

  const organization = orgData?.organization;
  const projects = data?.projects || [];

  const handleCreateProject = async (input: ProjectInput) => {
    try {
      const { data } = await createProject({
        variables: { input },
      });
      if (data?.createProject?.success) {
        setIsModalOpen(false);
        refetch();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (loading) {
    return (
      <Layout organization={organization}>
        <LoadingOverlay />
      </Layout>
    );
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <Layout organization={organization}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <Button onClick={() => setIsModalOpen(true)}>New Project</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search projects..."
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />
          </div>
        </div>

        <ProjectList
          projects={projects}
          orgSlug={orgSlug!}
          onCreateClick={() => setIsModalOpen(true)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Project"
          size="lg"
        >
          <ProjectForm
            organizationId={organization?.id || ''}
            onSubmit={handleCreateProject}
            onCancel={() => setIsModalOpen(false)}
            loading={creating}
          />
        </Modal>
      </div>
    </Layout>
  );
}
