import { gql } from '@apollo/client';

// Organization Queries
export const GET_ORGANIZATIONS = gql`
  query GetOrganizations {
    organizations {
      id
      name
      slug
      contactEmail
      projectCount
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query GetOrganization($slug: String!) {
    organization(slug: $slug) {
      id
      name
      slug
      contactEmail
      createdAt
    }
  }
`;

// Project Queries
export const GET_PROJECTS = gql`
  query GetProjects($organizationSlug: String!, $status: String, $search: String) {
    projects(organizationSlug: $organizationSlug, status: $status, search: $search) {
      id
      name
      description
      status
      dueDate
      createdAt
      taskCount
      completedTasks
      completionRate
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      dueDate
      createdAt
      updatedAt
      taskCount
      completedTasks
      completionRate
      organization {
        id
        name
        slug
      }
      tasks {
        id
        title
        status
        assigneeEmail
        dueDate
      }
    }
  }
`;

export const GET_PROJECT_STATISTICS = gql`
  query GetProjectStatistics($organizationSlug: String!) {
    projectStatistics(organizationSlug: $organizationSlug) {
      totalProjects
      activeProjects
      completedProjects
      onHoldProjects
      totalTasks
      completedTasks
      overallCompletionRate
    }
  }
`;

// Task Queries
export const GET_TASKS = gql`
  query GetTasks($projectId: ID!, $status: String, $search: String, $assigneeEmail: String) {
    tasks(projectId: $projectId, status: $status, search: $search, assigneeEmail: $assigneeEmail) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
      updatedAt
      project {
        id
        name
      }
      comments {
        id
        content
        authorEmail
        createdAt
      }
    }
  }
`;

// Organization Mutations
export const CREATE_ORGANIZATION = gql`
  mutation CreateOrganization($input: OrganizationInput!) {
    createOrganization(input: $input) {
      organization {
        id
        name
        slug
        contactEmail
      }
      success
      errors
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($id: ID!, $input: OrganizationInput!) {
    updateOrganization(id: $id, input: $input) {
      organization {
        id
        name
        slug
        contactEmail
      }
      success
      errors
    }
  }
`;

// Project Mutations
export const CREATE_PROJECT = gql`
  mutation CreateProject($input: ProjectInput!) {
    createProject(input: $input) {
      project {
        id
        name
        description
        status
        dueDate
      }
      success
      errors
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: ProjectInput!) {
    updateProject(id: $id, input: $input) {
      project {
        id
        name
        description
        status
        dueDate
      }
      success
      errors
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      success
      errors
    }
  }
`;

// Task Mutations
export const CREATE_TASK = gql`
  mutation CreateTask($input: TaskInput!) {
    createTask(input: $input) {
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
      }
      success
      errors
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: TaskInput!) {
    updateTask(id: $id, input: $input) {
      task {
        id
        title
        description
        status
        assigneeEmail
        dueDate
      }
      success
      errors
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      success
      errors
    }
  }
`;

// Comment Mutations
export const ADD_TASK_COMMENT = gql`
  mutation AddTaskComment($input: TaskCommentInput!) {
    addTaskComment(input: $input) {
      comment {
        id
        content
        authorEmail
        createdAt
      }
      success
      errors
    }
  }
`;

export const DELETE_TASK_COMMENT = gql`
  mutation DeleteTaskComment($id: ID!) {
    deleteTaskComment(id: $id) {
      success
      errors
    }
  }
`;

// Subscriptions
export const TASK_UPDATED_SUBSCRIPTION = gql`
  subscription TaskUpdated($projectId: ID!) {
    taskUpdated(projectId: $projectId) {
      id
      title
      status
      assigneeEmail
    }
  }
`;

export const COMMENT_ADDED_SUBSCRIPTION = gql`
  subscription CommentAdded($taskId: ID!) {
    commentAdded(taskId: $taskId) {
      id
      content
      authorEmail
      createdAt
    }
  }
`;

export const PROJECT_UPDATED_SUBSCRIPTION = gql`
  subscription ProjectUpdated($organizationSlug: String!) {
    projectUpdated(organizationSlug: $organizationSlug) {
      id
      name
      status
      taskCount
      completedTasks
    }
  }
`;
