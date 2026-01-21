# Mini PMS - Project Management System

A multi-tenant project management application built with Django, GraphQL, React, and TypeScript.

## Tech Stack

### Backend
- **Django 6.x** - Python web framework
- **Graphene-Django** - GraphQL API layer
- **Django Channels** - WebSocket support for real-time features
- **PostgreSQL** - Database

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Apollo Client** - GraphQL client with caching
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server

## Features

- **Authentication & Authorization**
  - User registration with organization creation
  - Email/password authentication
  - Role-based access control (Org Admin, Org Member)
  - Org admins can manage team members
- Multi-tenant organization support
- Project management with status tracking
- Task management with Kanban-style board
- Task comments
- Real-time updates via WebSocket subscriptions
- Advanced filtering and search
- Responsive mobile-first design
- Form validation (client and server-side)

## Prerequisites

- Python 3.14+
- Node.js 18+
- PostgreSQL 14+

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd mini-pms-backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd mini-pms-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/minipms
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend
The frontend connects to `http://localhost:8000` by default. Update `src/graphql/client.ts` if needed.

## Running Tests

### Backend Tests
```bash
cd mini-pms-backend
python manage.py test projects
```

## API Documentation

### GraphQL Endpoint
- HTTP: `http://localhost:8000/graphql/`
- WebSocket: `ws://localhost:8000/graphql/`

---

### Authentication

#### User Roles
- **ORG_ADMIN** - Organization administrator, can manage team members
- **ORG_MEMBER** - Regular organization member

#### Register (Create Organization + Admin User)
Registers a new organization and creates an admin user in a single transaction.

```graphql
mutation {
  register(input: {
    email: "admin@example.com"
    password: "securepassword"
    name: "John Doe"
    organizationName: "My Company"
    organizationSlug: "my-company"
  }) {
    success
    errors
    user {
      id
      email
      name
      role
      isOrgAdmin
    }
    organization {
      id
      name
      slug
    }
  }
}
```

**Validation:**
- Email must be valid and unique
- Password must be at least 6 characters
- Name must be at least 2 characters
- Organization name must be at least 2 characters
- Organization slug must be unique

#### Login
Authenticates a user with email and password.

```graphql
mutation {
  login(input: {
    email: "admin@example.com"
    password: "securepassword"
  }) {
    success
    errors
    user {
      id
      email
      name
      role
      isOrgAdmin
      organization {
        id
        name
        slug
      }
    }
  }
}
```

#### Get Current User
Fetches user details by email (used after login to verify session).

```graphql
query {
  me(email: "admin@example.com") {
    id
    email
    name
    role
    isOrgAdmin
    isOrgMember
    organization {
      id
      name
      slug
      contactEmail
    }
  }
}
```

---

### User Management (Admin Only)

#### Get Organization Members
Lists all members of an organization.

```graphql
query {
  orgMembers(organizationId: "1") {
    id
    email
    name
    role
    isOrgAdmin
    isOrgMember
  }
}
```

#### Create Organization Member
Creates a new member in the organization (admin only).

```graphql
mutation {
  createOrgMember(
    organizationId: "1"
    input: {
      email: "member@example.com"
      password: "securepassword"
      name: "Jane Smith"
    }
  ) {
    success
    errors
    user {
      id
      email
      name
      role
    }
  }
}
```

#### Delete Organization Member
Removes a member from the organization (admin only, cannot delete other admins).

```graphql
mutation {
  deleteOrgMember(userId: "2") {
    success
    errors
  }
}
```

---

### Organizations

#### Get All Organizations
```graphql
query {
  organizations {
    id
    name
    slug
    contactEmail
    projectCount
  }
}
```

#### Get Organization by Slug
```graphql
query {
  organization(slug: "my-org") {
    id
    name
    slug
    contactEmail
    projectCount
  }
}
```

#### Create Organization
```graphql
mutation {
  createOrganization(input: {
    name: "My Organization"
    slug: "my-org"
    contactEmail: "contact@example.com"
  }) {
    success
    errors
    organization {
      id
      name
    }
  }
}
```

#### Update Organization
```graphql
mutation {
  updateOrganization(id: "1", input: {
    name: "Updated Name"
    slug: "updated-slug"
    contactEmail: "new@example.com"
  }) {
    success
    errors
    organization {
      id
      name
    }
  }
}
```

---

### Projects

#### Get Projects for Organization
```graphql
query {
  projects(organizationSlug: "my-org", status: "ACTIVE", search: "web") {
    id
    name
    description
    status
    dueDate
    taskCount
    completedTasks
    completionRate
  }
}
```

**Parameters:**
- `organizationSlug` (required) - Organization identifier
- `status` (optional) - Filter by status: `ACTIVE`, `COMPLETED`, `ON_HOLD`
- `search` (optional) - Search in name and description

#### Get Project by ID
```graphql
query {
  project(id: "1") {
    id
    name
    description
    status
    dueDate
    taskCount
    completionRate
    tasks {
      id
      title
      status
    }
  }
}
```

#### Create Project
```graphql
mutation {
  createProject(input: {
    name: "New Project"
    description: "Project description"
    organizationId: "1"
    status: "ACTIVE"
    dueDate: "2025-12-31"
  }) {
    success
    errors
    project {
      id
      name
    }
  }
}
```

#### Update Project
```graphql
mutation {
  updateProject(id: "1", input: {
    name: "Updated Project"
    description: "New description"
    organizationId: "1"
    status: "COMPLETED"
  }) {
    success
    errors
    project {
      id
      name
      status
    }
  }
}
```

#### Delete Project
```graphql
mutation {
  deleteProject(id: "1") {
    success
    errors
  }
}
```

#### Get Project Statistics
```graphql
query {
  projectStatistics(organizationSlug: "my-org") {
    totalProjects
    activeProjects
    completedProjects
    onHoldProjects
    totalTasks
    completedTasks
    overallCompletionRate
  }
}
```

---

### Tasks

#### Get Tasks for Project
```graphql
query {
  tasks(projectId: "1", status: "TODO", search: "bug", assigneeEmail: "dev@example.com") {
    id
    title
    description
    status
    assigneeEmail
    dueDate
    comments {
      id
      content
    }
  }
}
```

**Parameters:**
- `projectId` (required) - Project identifier
- `status` (optional) - Filter by status: `TODO`, `IN_PROGRESS`, `DONE`
- `search` (optional) - Search in title and description
- `assigneeEmail` (optional) - Filter by assignee

#### Get Task by ID
```graphql
query {
  task(id: "1") {
    id
    title
    description
    status
    assigneeEmail
    dueDate
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
```

#### Create Task
```graphql
mutation {
  createTask(input: {
    title: "New Feature"
    description: "Implement new feature"
    projectId: "1"
    status: "TODO"
    assigneeEmail: "dev@example.com"
    dueDate: "2025-06-15T10:00:00"
  }) {
    success
    errors
    task {
      id
      title
    }
  }
}
```

#### Update Task
```graphql
mutation {
  updateTask(id: "1", input: {
    title: "Updated Task"
    projectId: "1"
    status: "IN_PROGRESS"
  }) {
    success
    errors
    task {
      id
      title
      status
    }
  }
}
```

#### Delete Task
```graphql
mutation {
  deleteTask(id: "1") {
    success
    errors
  }
}
```

---

### Task Comments

#### Add Comment
```graphql
mutation {
  addTaskComment(input: {
    taskId: "1"
    content: "This is a comment"
    authorEmail: "user@example.com"
  }) {
    success
    errors
    comment {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

#### Delete Comment
```graphql
mutation {
  deleteTaskComment(id: "1") {
    success
    errors
  }
}
```

---

### Subscriptions (Real-time)

#### Subscribe to Task Updates
```graphql
subscription {
  taskUpdated(projectId: "1") {
    id
    title
    status
  }
}
```

## Project Structure

```
mini-pms/
├── mini-pms-backend/
│   ├── config/             # Django settings
│   ├── projects/           # Main Django app
│   │   ├── models.py       # Data models (Organization, Project, Task, User)
│   │   ├── schema.py       # GraphQL schema
│   │   ├── queries.py      # GraphQL queries
│   │   ├── mutations.py    # GraphQL mutations (CRUD + Auth)
│   │   ├── types.py        # GraphQL types and input types
│   │   ├── validators.py   # Input validation
│   │   ├── subscriptions.py # WebSocket subscriptions
│   │   └── tests.py        # Backend tests
│   └── manage.py
├── mini-pms-frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── layout/     # Layout components (Header, Sidebar)
│   │   │   └── ui/         # Reusable UI components
│   │   ├── contexts/       # React contexts (AuthContext)
│   │   ├── pages/          # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── MembersPage.tsx
│   │   │   └── ...
│   │   ├── graphql/        # GraphQL operations
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## License

MIT
