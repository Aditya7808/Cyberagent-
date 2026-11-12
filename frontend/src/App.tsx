import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { Playground } from './pages/Playground';
import { RedTeam } from './pages/RedTeam';
import { Documents } from './pages/Documents';
import { Evaluations } from './pages/Evaluations';
import { AuditLog } from './pages/AuditLog';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="playground" element={<Playground />} />
          <Route path="red-team" element={<RedTeam />} />
          <Route path="documents" element={<Documents />} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

