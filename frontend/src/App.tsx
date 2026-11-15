import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import { useAuth } from './context/AuthContext';

const HomeRoute: React.FC = () => {
  const { user } = useAuth();
  // Only non-administrative end-users/viewers land on the conversational playground
  if (user?.role === 'end_user' || user?.role === 'viewer') {
    return <Navigate to="/playground" replace />;
  }
  return <Dashboard />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
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
            {/* Dynamic Home: Threat Radar for Admins/Devs/Auditors, Assistant Playground for End Users */}
            <Route index element={<HomeRoute />} />

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
  </ThemeProvider>
  );
};

export default App;
