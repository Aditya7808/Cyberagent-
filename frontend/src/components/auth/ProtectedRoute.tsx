import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth, UserRoleType } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isRole } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !isRole(allowedRoles)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="enterprise-card p-8 rounded-2xl max-w-xl w-full border border-rose-500/30 bg-slate-900/80 shadow-2xl space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Restricted Perimeter
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Access Denied: Insufficient Clearance
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Your current authenticated profile <span className="text-indigo-300 font-semibold">[{user?.clearance_level}]</span> does not possess the requisite operational privileges to access this console. Required roles: <span className="text-rose-400 font-semibold">{allowedRoles.join(', ')}</span>.
          </p>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-300">Audit Incident</span>
              <span className="badge-rose px-2 py-0.5 rounded text-[11px] font-semibold">403_FORBIDDEN_INTERCEPT</span>
            </div>
            <div className="text-slate-400">
              Authenticated Identity: <span className="text-slate-200 font-medium">{user?.email}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Event logged in tamper-evident compliance audit trail.
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (isRole(['end_user', 'viewer'])) {
                  navigate('/playground');
                } else {
                  navigate('/');
                }
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white flex items-center gap-2 transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Authorized Workspace
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Contact Admin for Elevation
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
