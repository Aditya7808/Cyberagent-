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
      <div className="p-8 font-mono">
        <div className="cyber-card cyber-danger-corners p-8 rounded-xl max-w-2xl mx-auto space-y-5 border-rose-500/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-rose-500 font-bold tracking-widest uppercase">
                SECURITY VIOLATION // RESTRICTED PERIMETER
              </div>
              <h2 className="text-lg font-black text-rose-200 tracking-wide mt-0.5">
                ACCESS DENIED: INSUFFICIENT SECURITY CLEARANCE
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your current authenticated profile <span className="text-cyan-300 font-bold">[{user?.clearance_level}]</span> does not possess the requisite operational privileges to access this tactical console. Required roles: <span className="text-rose-400 font-bold">{allowedRoles.join(', ').toUpperCase()}</span>.
          </p>

          <div className="p-3.5 rounded bg-slate-950 border border-slate-900 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">AUDIT EVENT: 403_FORBIDDEN_INTERCEPT</span>
              <span className="text-rose-400 font-bold">LOGGED TO TAMPER-PROOF LEDGER</span>
            </div>
            <div>ACTOR: {user?.email}</div>
            <div className="text-[10px] text-slate-600">
              SHA-256 signature generated and dispatched to Security Operations Center.
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (isRole(['end_user', 'viewer'])) {
                  navigate('/playground');
                } else {
                  navigate('/');
                }
              }}
              className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              RETURN TO AUTHORIZED CONSOLE
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              Contact Root Admin to request privilege elevation
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
