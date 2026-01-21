import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GET_ORGANIZATION, GET_PROJECT, GET_TASKS, CREATE_TASK, UPDATE_TASK, DELETE_TASK, DELETE_PROJECT } from '../graphql/operations';
import type { Task, TaskInput, Organization, Project, TaskComment, TaskStatus } from '../types';
import { Layout } from '../components/layout';
import { TaskBoard, TaskForm, TaskComments } from '../components/task';
import { Button, Modal, StatusBadge, LoadingOverlay, SearchInput, Select } from '../components/ui';

export function ProjectDetailPage() {
  const { orgSlug, projectId } = useParams<{ orgSlug: string; projectId: string }>();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orgData } = useQuery<{ organization: Organization }>(GET_ORGANIZATION, {
    variables: { slug: orgSlug },
    skip: !orgSlug,
  });

  const { data: projectData, loading: projectLoading, refetch: refetchProject } = useQuery<{ project: Project }>(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
  });

  const { data: tasksData, loading: tasksLoading, refetch: refetchTasks } = useQuery<{ tasks: Task[] }>(GET_TASKS, {
    variables: {
      projectId,
      status: statusFilter || undefined,
      search: search || undefined,
    },
    skip: !projectId,
  });

  const [createTask, { loading: creating }] = useMutation<{ createTask: { success: boolean; task: Task } }>(CREATE_TASK);
  const [updateTask, { loading: updating }] = useMutation<{ updateTask: { success: boolean; task: Task } }>(UPDATE_TASK);
  const [deleteTask] = useMutation<{ deleteTask: { success: boolean } }>(DELETE_TASK);
  const [deleteProject] = useMutation<{ deleteProject: { success: boolean } }>(DELETE_PROJECT);

  const organization = orgData?.organization;
  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];

  const handleCreateTask = async (input: TaskInput) => {
    try {
      const { data } = await createTask({ variables: { input } });
      if (data?.createTask?.success) {
        setIsTaskModalOpen(false);
        refetchTasks();
        refetchProject();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (input: TaskInput) => {
    if (!selectedTask) return;
    try {
      const { data } = await updateTask({
        variables: { id: selectedTask.id, input },
      });
      if (data?.updateTask?.success) {
        setSelectedTask(null);
        refetchTasks();
        refetchProject();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const { data } = await deleteTask({ variables: { id: taskId } });
      if (data?.deleteTask?.success) {
        setSelectedTask(null);
        refetchTasks();
        refetchProject();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? All tasks will be deleted.')) return;
    try {
      const { data } = await deleteProject({ variables: { id: projectId } });
      if (data?.deleteProject?.success) {
        navigate(`/${orgSlug}/projects`);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCommentsChange = (comments: TaskComment[]) => {
    if (selectedTask) {
      setSelectedTask({ ...selectedTask, comments });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { data } = await updateTask({
        variables: {
          id: taskId,
          input: {
            title: task.title,
            description: task.description,
            status: newStatus,
            assigneeEmail: task.assigneeEmail,
            dueDate: task.dueDate,
            projectId: projectId!,
          },
        },
      });
      if (data?.updateTask?.success) {
        refetchTasks();
        refetchProject();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  if (projectLoading || tasksLoading) {
    return (
      <Layout organization={organization} orgSlug={orgSlug}>
        <LoadingOverlay />
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout organization={organization} orgSlug={orgSlug}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Project not found</h2>
          <Link to={`/${orgSlug}/projects`} className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Back to projects
          </Link>
        </div>
      </Layout>
    );
  }

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'DONE', label: 'Done' },
  ];

  return (
    <Layout organization={organization} orgSlug={orgSlug}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm mb-4">
          <Link to={`/${orgSlug}/projects`} className="text-gray-500 hover:text-gray-700">
            Projects
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{project.name}</span>
        </nav>

        {/* Project Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>{project.taskCount} tasks</span>
                <span>{project.completionRate}% complete</span>
                {project.dueDate && (
                  <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDeleteProject}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <Button onClick={() => setIsTaskModalOpen(true)}>Add Task</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search tasks..."
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

        <TaskBoard tasks={tasks} onTaskClick={handleTaskClick} onTaskStatusChange={handleTaskStatusChange} />

        {/* Create Task Modal */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Create Task"
          size="lg"
        >
          <TaskForm
            projectId={projectId!}
            onSubmit={handleCreateTask}
            onCancel={() => setIsTaskModalOpen(false)}
            loading={creating}
          />
        </Modal>

        {/* Edit Task Modal */}
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title="Edit Task"
          size="lg"
        >
          {selectedTask && (
            <div>
              <TaskForm
                task={selectedTask}
                projectId={projectId!}
                onSubmit={handleUpdateTask}
                onCancel={() => setSelectedTask(null)}
                loading={updating}
              />
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  Delete Task
                </Button>
              </div>
              <TaskComments
                taskId={selectedTask.id}
                comments={selectedTask.comments || []}
                onCommentsChange={handleCommentsChange}
              />
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
