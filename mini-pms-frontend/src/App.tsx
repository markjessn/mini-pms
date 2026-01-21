import { Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';
import { ToastProvider, ErrorBoundary } from './components/ui';
import { AuthProvider } from './contexts/AuthContext';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProjectsPage,
  ProjectDetailPage,
  MembersPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/:orgSlug" element={<DashboardPage />} />
              <Route path="/:orgSlug/projects" element={<ProjectsPage />} />
              <Route path="/:orgSlug/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/:orgSlug/members" element={<MembersPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
