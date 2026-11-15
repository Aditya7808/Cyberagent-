import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { Playground } from './pages/Playground';
import { RedTeam } from './pages/RedTeam';
import { Documents } from './pages/Documents';
import { Evaluations } from './pages/Evaluations';
import { AuditLog } from './pages/AuditLog';
import { Users } from './pages/Users';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Portal Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Command Center Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Threat Radar: Admin & Auditor */}
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'auditor']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Agent Registry: Admin & Developer */}
            <Route
              path="agents"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'developer', 'operator']}>
                  <Agents />
                </ProtectedRoute>
              }
            />

            {/* Injection Playground / Assistant: All Roles */}
            <Route path="playground" element={<Playground />} />

            {/* Adversarial Red Team: Admin & Developer */}
            <Route
              path="red-team"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'developer']}>
                  <RedTeam />
                </ProtectedRoute>
              }
            />

            {/* Secure RAG Vault: All Roles */}
            <Route path="documents" element={<Documents />} />

            {/* Benchmark Evals: Admin, Developer & Auditor */}
            <Route
              path="evaluations"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'developer', 'auditor']}>
                  <Evaluations />
                </ProtectedRoute>
              }
            />

            {/* Audit & Forensics: Admin & Auditor */}
            <Route
              path="audit"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin', 'auditor']}>
                  <AuditLog />
                </ProtectedRoute>
              }
            />

            {/* Dynamic Identity & RBAC Console: Super Admin & Admin */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
