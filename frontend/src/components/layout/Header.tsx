import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Wifi, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const getClearanceStyle = (role?: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      case 'developer':
      case 'operator':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'auditor':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      default:
        return 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 font-mono">
      {/* Tactical Command Input */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="root@sentinel:~$ search --vectors --threats..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded text-xs text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
        </div>
      </div>

      {/* Cyber SOC Telemetry Stats & Clearance Tier */}
      <div className="flex items-center gap-5">
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-500 text-[11px]">GATEWAY:</span>
            <span className="text-emerald-400 font-bold text-[11px]">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500 text-[11px]">PII ENGINE:</span>
            <span className="text-cyan-400 font-bold text-[11px]">ARMED</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

        {/* Verified Operator Clearance Badge (Immutable Zero-Trust) */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs shadow-inner">
          <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500 text-[10px] uppercase">SECURITY CLEARANCE:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getClearanceStyle(user?.role)}`}>
            {user?.clearance_level || 'LVL-1 [USER]'}
          </span>
        </div>

        {/* Authenticated Operator Identity Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
            {getInitials(user?.full_name)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-200 leading-tight">
              {user?.full_name || 'Operator'}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {user?.role ? user.role.toUpperCase() : 'AUTHENTICATED'}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition-colors ml-1"
            title="Terminate Session (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
