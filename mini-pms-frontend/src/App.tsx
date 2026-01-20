import { Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { client } from './graphql/client';
import {
  HomePage,
  DashboardPage,
  ProjectsPage,
  ProjectDetailPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <ApolloProvider client={client}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:orgSlug" element={<DashboardPage />} />
        <Route path="/:orgSlug/projects" element={<ProjectsPage />} />
        <Route path="/:orgSlug/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ApolloProvider>
  );
}

export default App;
