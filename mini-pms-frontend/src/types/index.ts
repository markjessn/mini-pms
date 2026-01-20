export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: string;
  projectCount?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  organization: Organization;
  taskCount: number;
  completedTasks: number;
  completionRate: number;
  tasks?: Task[];
}

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  comments?: TaskComment[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskComment {
  id: string;
  content: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  task: Task;
}

export interface ProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  dueDate?: string;
  organizationId: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeEmail?: string;
  dueDate?: string;
  projectId: string;
}

export interface TaskCommentInput {
  content: string;
  authorEmail: string;
  taskId: string;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  search?: string;
  assigneeEmail?: string;
}

export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalTasks: number;
  completedTasks: number;
  overallCompletionRate: number;
}

export interface OrganizationInput {
  name: string;
  slug: string;
  contactEmail: string;
}
