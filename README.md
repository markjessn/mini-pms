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

- Multi-tenant organization support
- Project management with status tracking
- Task management with Kanban-style board
- Task comments
- Real-time updates via WebSocket subscriptions
- Advanced filtering and search
- Responsive mobile-first design
- Form validation (client and server-side)

## Prerequisites

- Python 3.11+
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

### Example Queries

**Get all organizations:**
```graphql
query {
  organizations {
    id
    name
    slug
    projectCount
  }
}
```

**Get projects for an organization:**
```graphql
query {
  projects(organizationSlug: "my-org", status: "ACTIVE") {
    id
    name
    status
    taskCount
    completionRate
  }
}
```

**Get tasks with filtering:**
```graphql
query {
  tasks(projectId: "1", status: "TODO", search: "bug") {
    id
    title
    status
    assigneeEmail
  }
}
```

### Example Mutations

**Create an organization:**
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

**Create a task:**
```graphql
mutation {
  createTask(input: {
    title: "New Feature"
    projectId: "1"
    status: "TODO"
    assigneeEmail: "dev@example.com"
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

### Subscriptions (Real-time)

**Subscribe to task updates:**
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
│   │   ├── models.py       # Data models
│   │   ├── schema.py       # GraphQL schema
│   │   ├── queries.py      # GraphQL queries
│   │   ├── mutations.py    # GraphQL mutations
│   │   ├── subscriptions.py # WebSocket subscriptions
│   │   └── tests.py        # Backend tests
│   └── manage.py
├── mini-pms-frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── graphql/        # GraphQL operations
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## License

MIT
