import { Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';
import { ToastProvider, ErrorBoundary } from './components/ui';
import {
  HomePage,
  DashboardPage,
  ProjectsPage,
  ProjectDetailPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:orgSlug" element={<DashboardPage />} />
            <Route path="/:orgSlug/projects" element={<ProjectsPage />} />
            <Route path="/:orgSlug/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
